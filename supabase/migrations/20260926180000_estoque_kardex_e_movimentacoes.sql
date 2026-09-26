-- ==============================================================================
-- Story 2.8: Migração de Estoque e Movimentações (Kardex) para Supabase Postgres
--
-- 1. Schema: colunas de rastreio de OS em estoque_movimentacoes e índice único parcial de baixa
-- 2. Triggers de integridade do Kardex:
--    - trg_after_insert_estoque_movimentacoes: recalcula pecas.estoque_atual de forma transacional e serializada (FOR UPDATE)
--    - trg_before_update_pecas_estoque: bloqueia UPDATE direto em estoque_atual fora do Kardex
-- 3. RPC transacional public.registrar_movimentacao_estoque(...)
-- 4. RLS FR25: Secretaria SELECT/INSERT com janela operacional D4; sem permissão para mecânico (D5)
-- ==============================================================================

BEGIN;

-- 1. DDL: Colunas de vínculo à OS e índice parcial único ------------------------
ALTER TABLE public.estoque_movimentacoes
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.estoque_movimentacoes
  ADD COLUMN IF NOT EXISTS ordem_servico_id TEXT NULL REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS os_item_id TEXT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_estoque_movimentacoes_os_item_saida
  ON public.estoque_movimentacoes (ordem_servico_id, os_item_id)
  WHERE tipo = 'saida' AND ordem_servico_id IS NOT NULL AND os_item_id IS NOT NULL;

-- 2. Triggers de integridade do Kardex (ADR-005 §2.4, §2.5) --------------------

-- 2.1 Trigger AFTER INSERT: Recalcula pecas.estoque_atual serializado
CREATE OR REPLACE FUNCTION public.fn_recalcular_estoque_peca()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_saldo_atual integer;
  v_novo_saldo integer;
BEGIN
  -- Bloqueia a linha da peça para evitar race conditions simultâneas
  SELECT estoque_atual INTO v_saldo_atual
  FROM public.pecas
  WHERE id = NEW.peca_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Peça não encontrada para movimentação de estoque: %', NEW.peca_id;
  END IF;

  v_saldo_atual := COALESCE(v_saldo_atual, 0);

  IF NEW.tipo = 'entrada' THEN
    v_novo_saldo := v_saldo_atual + NEW.quantidade;
  ELSIF NEW.tipo = 'saida' THEN
    v_novo_saldo := GREATEST(0, v_saldo_atual - NEW.quantidade);
  ELSIF NEW.tipo = 'ajuste' THEN
    v_novo_saldo := GREATEST(0, NEW.quantidade);
  ELSE
    RAISE EXCEPTION 'Tipo de movimentação inválido: %', NEW.tipo;
  END IF;

  -- Sinaliza no contexto da transação que a atualização partiu do Kardex
  PERFORM set_config('app.origem_kardex', 'on', true);

  UPDATE public.pecas
  SET estoque_atual = v_novo_saldo,
      updated_at = now()
  WHERE id = NEW.peca_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_insert_estoque_movimentacoes ON public.estoque_movimentacoes;
CREATE TRIGGER trg_after_insert_estoque_movimentacoes
  AFTER INSERT ON public.estoque_movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_recalcular_estoque_peca();

-- 2.2 Trigger BEFORE UPDATE: Rejeita alteração direta de estoque_atual em pecas
CREATE OR REPLACE FUNCTION public.fn_proteger_estoque_pecas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.estoque_atual IS DISTINCT FROM OLD.estoque_atual THEN
    IF current_setting('app.origem_kardex', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'Alteração direta de estoque_atual não é permitida fora do Kardex';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_update_pecas_estoque ON public.pecas;
CREATE TRIGGER trg_before_update_pecas_estoque
  BEFORE UPDATE ON public.pecas
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_proteger_estoque_pecas();

-- 3. RPC Transacional: public.registrar_movimentacao_estoque -------------------
CREATE OR REPLACE FUNCTION public.registrar_movimentacao_estoque(
  p_peca_id text,
  p_tipo text,
  p_quantidade integer,
  p_motivo text DEFAULT NULL,
  p_documento_ref text DEFAULT NULL,
  p_usuario text DEFAULT NULL,
  p_ordem_servico_id text DEFAULT NULL,
  p_os_item_id text DEFAULT NULL
)
RETURNS public.estoque_movimentacoes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_usuario text;
  v_movimentacao public.estoque_movimentacoes;
BEGIN
  IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
    RAISE EXCEPTION 'Quantidade deve ser um valor inteiro positivo';
  END IF;

  IF p_tipo NOT IN ('entrada', 'saida', 'ajuste') THEN
    RAISE EXCEPTION 'Tipo de movimentação inválido: %', p_tipo;
  END IF;

  v_usuario := NULLIF(TRIM(p_usuario), '');
  IF v_usuario IS NULL THEN
    v_usuario := COALESCE(public.funcionario_atual_id(), 'Sistema');
  END IF;

  INSERT INTO public.estoque_movimentacoes (
    peca_id,
    tipo,
    quantidade,
    motivo,
    documento_ref,
    usuario,
    ordem_servico_id,
    os_item_id
  ) VALUES (
    p_peca_id,
    p_tipo,
    p_quantidade,
    NULLIF(TRIM(p_motivo), ''),
    NULLIF(TRIM(p_documento_ref), ''),
    v_usuario,
    p_ordem_servico_id,
    p_os_item_id
  )
  RETURNING * INTO v_movimentacao;

  RETURN v_movimentacao;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_movimentacao_estoque(
  text, text, integer, text, text, text, text, text
) TO authenticated, service_role;

-- 4. RLS FR25: Permissões em estoque_movimentacoes -----------------------------
DROP POLICY IF EXISTS "Secretaria le estoque" ON public.estoque_movimentacoes;
DROP POLICY IF EXISTS "Secretaria grava estoque" ON public.estoque_movimentacoes;

CREATE POLICY "Secretaria le estoque" ON public.estoque_movimentacoes
  FOR SELECT TO authenticated
  USING (public.papel_usuario() = 'secretaria');

CREATE POLICY "Secretaria grava estoque" ON public.estoque_movimentacoes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

COMMIT;
