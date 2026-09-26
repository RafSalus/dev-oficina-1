-- ==============================================================================
-- Story 2.13: Migração de Manutenção Preventiva para Supabase Postgres
-- Autor: Dara (@data-engineer) / Dex (@dev)
--
-- 1. Tabela public.manutencoes_preventivas
-- 2. Chaves estrangeiras para veiculos(id) e funcionarios(id)
-- 3. Triggers trg_set_updated_at e trg_audit
-- 4. RLS com public.papel_usuario() (admin total; secretaria e mecanico SELECT e INSERT)
-- 5. RPC restrita public.atualizar_hodometro_veiculo(placa, novo_km, permitir_regressao)
-- ==============================================================================

BEGIN;

-- 1. Tabela de manutenções preventivas -----------------------------------------
CREATE TABLE IF NOT EXISTS public.manutencoes_preventivas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    veiculo_id TEXT NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
    placa TEXT NOT NULL,
    item_id TEXT NOT NULL,
    ultima_execucao_km NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ultima_execucao_data DATE NOT NULL DEFAULT CURRENT_DATE,
    intervalo_km INTEGER NOT NULL DEFAULT 10000,
    intervalo_meses INTEGER NOT NULL DEFAULT 6,
    mecanico_nome TEXT,
    mecanico_id TEXT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    observacoes TEXT,
    garantia_pendente BOOLEAN NOT NULL DEFAULT false,
    servico_origem TEXT,
    prazo_garantia_limite DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_manutencoes_preventivas_placa
    ON public.manutencoes_preventivas (upper(trim(placa)));

CREATE INDEX IF NOT EXISTS idx_manutencoes_preventivas_veiculo_id
    ON public.manutencoes_preventivas (veiculo_id);

CREATE INDEX IF NOT EXISTS idx_manutencoes_preventivas_item_id
    ON public.manutencoes_preventivas (item_id);

COMMENT ON TABLE public.manutencoes_preventivas IS
    'Registros históricos e execuções de itens do catálogo de manutenção preventiva da frota.';

-- 2. Triggers de updated_at e auditoria ----------------------------------------
DROP TRIGGER IF EXISTS trg_manutencoes_preventivas_updated_at ON public.manutencoes_preventivas;
CREATE TRIGGER trg_manutencoes_preventivas_updated_at
    BEFORE UPDATE ON public.manutencoes_preventivas
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_manutencoes_preventivas_audit ON public.manutencoes_preventivas;
CREATE TRIGGER trg_manutencoes_preventivas_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.manutencoes_preventivas
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit_trigger();

-- 3. Habilitação de RLS e Políticas -------------------------------------------
ALTER TABLE public.manutencoes_preventivas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manutencoes_preventivas_admin_total" ON public.manutencoes_preventivas;
CREATE POLICY "manutencoes_preventivas_admin_total"
    ON public.manutencoes_preventivas
    FOR ALL
    TO authenticated
    USING (public.papel_usuario() = 'admin')
    WITH CHECK (public.papel_usuario() = 'admin');

DROP POLICY IF EXISTS "manutencoes_preventivas_operacao_select" ON public.manutencoes_preventivas;
CREATE POLICY "manutencoes_preventivas_operacao_select"
    ON public.manutencoes_preventivas
    FOR SELECT
    TO authenticated
    USING (public.papel_usuario() IN ('admin', 'secretaria', 'mecanico'));

DROP POLICY IF EXISTS "manutencoes_preventivas_operacao_insert" ON public.manutencoes_preventivas;
CREATE POLICY "manutencoes_preventivas_operacao_insert"
    ON public.manutencoes_preventivas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.papel_usuario() IN ('admin', 'mecanico')
        OR (public.papel_usuario() = 'secretaria' AND public.em_horario_operacional())
    );

-- 4. RPC restrita para atualização de hodômetro (AC6 / ADR-005 §2.13) --------
CREATE OR REPLACE FUNCTION public.atualizar_hodometro_veiculo(
    placa TEXT,
    novo_km INTEGER,
    permitir_regressao BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_placa_limpa TEXT;
    v_km_atual INTEGER;
    v_veiculo_id TEXT;
    v_retorno JSONB;
BEGIN
    -- Validação de autenticação
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Acesso não autorizado' USING ERRCODE = '42501';
    END IF;

    -- Papéis permitidos: admin, secretaria, mecanico
    IF NOT (public.papel_usuario() IN ('admin', 'secretaria', 'mecanico')) THEN
        RAISE EXCEPTION 'Papel de usuário sem permissão para atualizar hodômetro' USING ERRCODE = '42501';
    END IF;

    v_placa_limpa := upper(trim(placa));

    SELECT id, COALESCE(km_atual, 0)
    INTO v_veiculo_id, v_km_atual
    FROM public.veiculos
    WHERE upper(trim(placa)) = v_placa_limpa;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Veículo com placa % não encontrado', v_placa_limpa USING ERRCODE = 'P0002';
    END IF;

    IF novo_km < v_km_atual AND NOT COALESCE(permitir_regressao, FALSE) THEN
        RAISE EXCEPTION 'Novo KM (%) não pode ser menor que o KM atual (%) sem confirmação explícita', novo_km, v_km_atual
        USING ERRCODE = '22003';
    END IF;

    UPDATE public.veiculos
    SET km_atual = novo_km,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_veiculo_id;

    SELECT jsonb_build_object(
        'id', id,
        'placa', placa,
        'km_atual', km_atual,
        'updated_at', updated_at
    )
    INTO v_retorno
    FROM public.veiculos
    WHERE id = v_veiculo_id;

    RETURN v_retorno;
END;
$$;

GRANT EXECUTE ON FUNCTION public.atualizar_hodometro_veiculo(TEXT, INTEGER, BOOLEAN) TO authenticated;

COMMIT;
