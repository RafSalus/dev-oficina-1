-- ==============================================================================
-- Story 2.2 — Triggers de auditoria imutável e updated_at automático
-- Autor: Dara (@data-engineer)
--
-- 1. public.fn_audit_trigger(): grava em public.audit_logs todo INSERT/UPDATE/DELETE
--    das tabelas críticas (NFR16). SECURITY DEFINER + search_path vazio (ADR-005 §2.9).
--    Chamada sem sessão autenticada (auth.uid() nulo — RPCs públicas por token,
--    ADR-006/ADR-007) é marcada com usuario_papel = 'publico_token'.
-- 2. public.fn_set_updated_at(): mantém updated_at = now() em todo UPDATE.
-- 3. audit_logs imutável: sem políticas de INSERT/UPDATE/DELETE e sem privilégios de
--    escrita para anon/authenticated (TRUNCATE não passa pelo RLS e era concedido por
--    padrão pelo Supabase).
--
-- Idempotente: CREATE OR REPLACE FUNCTION + DROP TRIGGER IF EXISTS antes de recriar.
--
-- Stories que criam tabelas novas anexam as funções na própria migration:
--   CREATE TRIGGER trg_audit_<tabela> AFTER INSERT OR UPDATE OR DELETE ON public.<tabela>
--     FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
--   CREATE TRIGGER trg_set_updated_at_<tabela> BEFORE UPDATE ON public.<tabela>
--     FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
--
-- ROLLBACK MANUAL (executar em uma transação):
--   BEGIN;
--   DO $$
--   DECLARE t text;
--   BEGIN
--     FOREACH t IN ARRAY ARRAY['ordens_servico','clientes','veiculos','estoque_movimentacoes',
--       'compras_pedidos','compras_cotacoes','funcionarios','pecas','servicos','terceiros'] LOOP
--       EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trg_audit_' || t, t);
--       EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trg_set_updated_at_' || t, t);
--     END LOOP;
--   END $$;
--   DROP FUNCTION IF EXISTS public.fn_audit_trigger();
--   DROP FUNCTION IF EXISTS public.fn_set_updated_at();
--   -- Privilégios revogados de audit_logs só devem voltar se houver decisão explícita;
--   -- o estado anterior (GRANT ALL padrão do Supabase) permitia TRUNCATE sem RLS.
--   COMMIT;
-- ==============================================================================

BEGIN;

-- 1. Função de auditoria --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_usuario_id uuid := auth.uid();
  v_valor_anterior jsonb;
  v_valor_novo jsonb;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_valor_anterior := to_jsonb(OLD);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_valor_novo := to_jsonb(NEW);
  END IF;

  INSERT INTO public.audit_logs (
    tabela, registro_id, operacao, usuario_id, usuario_papel, valor_anterior, valor_novo
  )
  VALUES (
    TG_TABLE_NAME,
    COALESCE(v_valor_novo ->> 'id', v_valor_anterior ->> 'id'),
    TG_OP,
    v_usuario_id,
    CASE
      WHEN v_usuario_id IS NULL THEN 'publico_token'
      ELSE NULLIF(public.papel_usuario(), '')
    END,
    v_valor_anterior,
    v_valor_novo
  );

  RETURN NULL; -- trigger AFTER: valor de retorno ignorado
END;
$$;

COMMENT ON FUNCTION public.fn_audit_trigger() IS
  'Trilha de auditoria imutável (NFR16). Anexar como AFTER INSERT OR UPDATE OR DELETE FOR EACH ROW. '
  'auth.uid() nulo grava usuario_papel = ''publico_token'' (ADR-006 §2.3).';

-- 2. Função de updated_at ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_set_updated_at() IS
  'Mantém updated_at = now() no servidor. Anexar como BEFORE UPDATE FOR EACH ROW.';

-- 3. Anexa as triggers ----------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  -- Auditoria (AC3)
  FOREACH t IN ARRAY ARRAY[
    'ordens_servico', 'clientes', 'veiculos', 'estoque_movimentacoes', 'compras_pedidos',
    'compras_cotacoes', 'funcionarios', 'pecas', 'servicos', 'terceiros'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trg_audit_' || t, t);
    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger()',
      'trg_audit_' || t, t
    );
  END LOOP;

  -- updated_at (AC5) — somente tabelas que possuem a coluna
  FOREACH t IN ARRAY ARRAY[
    'funcionarios', 'clientes', 'veiculos', 'pecas', 'servicos', 'terceiros',
    'compras_pedidos', 'compras_cotacoes', 'ordens_servico'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trg_set_updated_at_' || t, t);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at()',
      'trg_set_updated_at_' || t, t
    );
  END LOOP;
END;
$$;

-- 4. Imutabilidade de audit_logs (AC4) ------------------------------------------------------
-- Política FOR ALL legada (migration 20260921190000) já removida em 20260924130000;
-- repetida aqui para garantir o estado mesmo em ambientes com ordem de aplicação divergente.
DROP POLICY IF EXISTS "Admin total audit_logs" ON public.audit_logs;

-- Escrita só pela trigger (SECURITY DEFINER, dono da tabela). Leitura segue a política
-- "Admin le audit_logs" (admin, via RLS).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM authenticated;
  END IF;
END;
$$;

COMMIT;
