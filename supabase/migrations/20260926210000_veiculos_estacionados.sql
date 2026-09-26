-- ==============================================================================
-- Migration: 20260926210000_veiculos_estacionados.sql
-- Story: 2.11 (Migração de Veículos Estacionados / Pátio — ADR-005 / D4)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.veiculos_estacionados (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    veiculo_id TEXT REFERENCES public.veiculos(id) ON DELETE SET NULL,
    placa TEXT NOT NULL,
    codigo_veiculo TEXT,
    marca TEXT,
    modelo TEXT,
    marca_modelo TEXT,
    ano TEXT,
    cor TEXT,
    combustivel TEXT DEFAULT 'FLEX',
    km_atual TEXT,
    chassi TEXT,
    renavam TEXT,
    data_estacionamento TEXT NOT NULL,
    motivo_venda TEXT,
    antigo_cliente_id TEXT REFERENCES public.clientes(id) ON DELETE SET NULL,
    antigo_cliente_nome TEXT,
    antigo_cliente_telefone TEXT,
    antigo_cliente_documento TEXT,
    novo_dono_nome TEXT,
    novo_dono_telefone TEXT,
    novo_dono_documento TEXT,
    novo_dono_email TEXT,
    observacoes TEXT,
    historico_manutencoes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_veiculos_estacionados_placa ON public.veiculos_estacionados (placa);
CREATE INDEX IF NOT EXISTS idx_veiculos_estacionados_antigo_cliente ON public.veiculos_estacionados (antigo_cliente_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_estacionados_data ON public.veiculos_estacionados (data_estacionamento DESC);

-- Triggers de auditoria e updated_at (Story 2.2)
DROP TRIGGER IF EXISTS trg_set_updated_at ON public.veiculos_estacionados;
CREATE TRIGGER trg_set_updated_at
    BEFORE UPDATE ON public.veiculos_estacionados
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_audit ON public.veiculos_estacionados;
CREATE TRIGGER trg_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.veiculos_estacionados
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit_trigger();

-- ==============================================================================
-- RLS (FR25 / ADR-005 §2.10)
-- ==============================================================================
ALTER TABLE public.veiculos_estacionados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "veiculos_estacionados_admin_all" ON public.veiculos_estacionados;
CREATE POLICY "veiculos_estacionados_admin_all"
    ON public.veiculos_estacionados
    FOR ALL
    TO authenticated
    USING (public.papel_usuario() = 'admin')
    WITH CHECK (public.papel_usuario() = 'admin');

DROP POLICY IF EXISTS "veiculos_estacionados_secretaria_select" ON public.veiculos_estacionados;
CREATE POLICY "veiculos_estacionados_secretaria_select"
    ON public.veiculos_estacionados
    FOR SELECT
    TO authenticated
    USING (public.papel_usuario() = 'secretaria');

DROP POLICY IF EXISTS "veiculos_estacionados_secretaria_insert" ON public.veiculos_estacionados;
CREATE POLICY "veiculos_estacionados_secretaria_insert"
    ON public.veiculos_estacionados
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.papel_usuario() = 'secretaria'
        AND public.em_horario_operacional()
    );

DROP POLICY IF EXISTS "veiculos_estacionados_secretaria_update" ON public.veiculos_estacionados;
CREATE POLICY "veiculos_estacionados_secretaria_update"
    ON public.veiculos_estacionados
    FOR UPDATE
    TO authenticated
    USING (
        public.papel_usuario() = 'secretaria'
        AND public.em_horario_operacional()
    )
    WITH CHECK (
        public.papel_usuario() = 'secretaria'
        AND public.em_horario_operacional()
    );

DROP POLICY IF EXISTS "veiculos_estacionados_secretaria_delete" ON public.veiculos_estacionados;
CREATE POLICY "veiculos_estacionados_secretaria_delete"
    ON public.veiculos_estacionados
    FOR DELETE
    TO authenticated
    USING (public.papel_usuario() = 'secretaria');

-- O mecânico não tem acesso ao pátio de veículos estacionados à venda (AC5).
-- Papel anon não tem acesso (fail-closed).
