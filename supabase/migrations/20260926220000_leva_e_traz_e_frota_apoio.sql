-- ==============================================================================
-- Migration: 20260926220000_leva_e_traz_e_frota_apoio.sql
-- Story: 2.12 (Migração de Leva e Traz + Frota de Apoio — ADR-005 / Sequences)
-- ==============================================================================

-- 1. Sequences para geração atômica de códigos no banco (ADR-005 §2.6)
CREATE SEQUENCE IF NOT EXISTS public.seq_frota_apoio_codigo START WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_deslocamento_codigo START WITH 1;

-- 2. Tabela de Frota de Apoio (Carros próprios da oficina)
CREATE TABLE IF NOT EXISTS public.frota_apoio (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    codigo TEXT NOT NULL UNIQUE,
    modelo TEXT NOT NULL,
    placa TEXT NOT NULL,
    ano TEXT,
    cor TEXT,
    km_atual TEXT,
    combustivel TEXT DEFAULT 'FLEX',
    status TEXT NOT NULL DEFAULT 'disponivel', -- 'disponivel', 'em_rota', 'manutencao'
    em_uso_por TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para código de frota de apoio (ex: APOIO-01)
CREATE OR REPLACE FUNCTION public.fn_gerar_codigo_frota_apoio()
RETURNS trigger AS $$
BEGIN
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := 'APOIO-' || lpad(nextval('public.seq_frota_apoio_codigo')::text, 2, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gerar_codigo_frota_apoio ON public.frota_apoio;
CREATE TRIGGER trg_gerar_codigo_frota_apoio
    BEFORE INSERT ON public.frota_apoio
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_gerar_codigo_frota_apoio();

-- 3. Tabela de Deslocamentos de Leva e Traz
CREATE TABLE IF NOT EXISTS public.leva_e_traz_deslocamentos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    codigo TEXT NOT NULL UNIQUE,
    tipo_servico TEXT NOT NULL, -- 'busca_veiculo', 'entrega_veiculo', 'translado_cliente', 'busca_pecas', 'socorro_externo'
    prioridade TEXT DEFAULT 'normal', -- 'normal', 'urgente'
    status TEXT NOT NULL DEFAULT 'agendado', -- 'agendado', 'em_deslocamento', 'concluido', 'cancelado'
    data TEXT NOT NULL,
    horario_previsto TEXT,
    horario_saida_real TEXT,
    horario_retorno_real TEXT,
    cliente_id TEXT REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nome TEXT,
    cliente_telefone TEXT,
    veiculo_id TEXT REFERENCES public.veiculos(id) ON DELETE SET NULL,
    veiculo_modelo TEXT,
    veiculo_placa TEXT,
    numero_os TEXT,
    quantidade_funcionarios INTEGER DEFAULT 2,
    motorista_principal_id TEXT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    motorista_principal_nome TEXT,
    motorista_principal_cargo TEXT,
    auxiliar_id TEXT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    auxiliar_nome TEXT,
    auxiliar_cargo TEXT,
    veiculo_apoio_id TEXT REFERENCES public.frota_apoio(id) ON DELETE SET NULL,
    veiculo_apoio_nome TEXT,
    veiculo_apoio_placa TEXT,
    levar_cliente_embora BOOLEAN DEFAULT false,
    fornecedor_nome TEXT,
    fornecedor_telefone TEXT,
    pecas_descricao TEXT,
    endereco_origem TEXT,
    endereco_destino TEXT,
    distancia_km TEXT,
    tempo_estimado_minutos INTEGER,
    km_estimado TEXT,
    km_inicial TEXT,
    km_final TEXT,
    km_realizado TEXT,
    cobrar_cliente BOOLEAN DEFAULT false,
    valor_cobrado NUMERIC(10, 2) DEFAULT 0,
    observacoes TEXT,
    motivo_cancelamento TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para código de deslocamento (ex: LOG-0001)
CREATE OR REPLACE FUNCTION public.fn_gerar_codigo_deslocamento()
RETURNS trigger AS $$
BEGIN
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := 'LOG-' || lpad(nextval('public.seq_deslocamento_codigo')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gerar_codigo_deslocamento ON public.leva_e_traz_deslocamentos;
CREATE TRIGGER trg_gerar_codigo_deslocamento
    BEFORE INSERT ON public.leva_e_traz_deslocamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_gerar_codigo_deslocamento();

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_leva_e_traz_status ON public.leva_e_traz_deslocamentos (status);
CREATE INDEX IF NOT EXISTS idx_leva_e_traz_data ON public.leva_e_traz_deslocamentos (data DESC);
CREATE INDEX IF NOT EXISTS idx_leva_e_traz_motorista ON public.leva_e_traz_deslocamentos (motorista_principal_id);
CREATE INDEX IF NOT EXISTS idx_leva_e_traz_auxiliar ON public.leva_e_traz_deslocamentos (auxiliar_id);
CREATE INDEX IF NOT EXISTS idx_leva_e_traz_veiculo_apoio ON public.leva_e_traz_deslocamentos (veiculo_apoio_id);

-- Triggers de auditoria e updated_at (Story 2.2)
DROP TRIGGER IF EXISTS trg_set_updated_at ON public.frota_apoio;
CREATE TRIGGER trg_set_updated_at
    BEFORE UPDATE ON public.frota_apoio
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_audit ON public.frota_apoio;
CREATE TRIGGER trg_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.frota_apoio
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit();

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.leva_e_traz_deslocamentos;
CREATE TRIGGER trg_set_updated_at
    BEFORE UPDATE ON public.leva_e_traz_deslocamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_audit ON public.leva_e_traz_deslocamentos;
CREATE TRIGGER trg_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.leva_e_traz_deslocamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit();

-- ==============================================================================
-- RLS (FR25 / ADR-005 §2.10)
-- ==============================================================================
ALTER TABLE public.frota_apoio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leva_e_traz_deslocamentos ENABLE ROW LEVEL SECURITY;

-- 1. Políticas Frota de Apoio
DROP POLICY IF EXISTS "frota_apoio_admin_all" ON public.frota_apoio;
CREATE POLICY "frota_apoio_admin_all"
    ON public.frota_apoio
    FOR ALL
    TO authenticated
    USING (public.papel_usuario() = 'admin')
    WITH CHECK (public.papel_usuario() = 'admin');

DROP POLICY IF EXISTS "frota_apoio_secretaria_all" ON public.frota_apoio;
CREATE POLICY "frota_apoio_secretaria_all"
    ON public.frota_apoio
    FOR ALL
    TO authenticated
    USING (public.papel_usuario() = 'secretaria')
    WITH CHECK (public.papel_usuario() = 'secretaria');

DROP POLICY IF EXISTS "frota_apoio_mecanico_select" ON public.frota_apoio;
CREATE POLICY "frota_apoio_mecanico_select"
    ON public.frota_apoio
    FOR SELECT
    TO authenticated
    USING (public.papel_usuario() = 'mecanico');

-- 2. Políticas Deslocamentos Leva e Traz
DROP POLICY IF EXISTS "deslocamentos_admin_all" ON public.leva_e_traz_deslocamentos;
CREATE POLICY "deslocamentos_admin_all"
    ON public.leva_e_traz_deslocamentos
    FOR ALL
    TO authenticated
    USING (public.papel_usuario() = 'admin')
    WITH CHECK (public.papel_usuario() = 'admin');

DROP POLICY IF EXISTS "deslocamentos_secretaria_all" ON public.leva_e_traz_deslocamentos;
CREATE POLICY "deslocamentos_secretaria_all"
    ON public.leva_e_traz_deslocamentos
    FOR ALL
    TO authenticated
    USING (public.papel_usuario() = 'secretaria')
    WITH CHECK (public.papel_usuario() = 'secretaria');

DROP POLICY IF EXISTS "deslocamentos_mecanico_select" ON public.leva_e_traz_deslocamentos;
CREATE POLICY "deslocamentos_mecanico_select"
    ON public.leva_e_traz_deslocamentos
    FOR SELECT
    TO authenticated
    USING (public.papel_usuario() = 'mecanico');

DROP POLICY IF EXISTS "deslocamentos_mecanico_insert" ON public.leva_e_traz_deslocamentos;
CREATE POLICY "deslocamentos_mecanico_insert"
    ON public.leva_e_traz_deslocamentos
    FOR INSERT
    TO authenticated
    WITH CHECK (public.papel_usuario() = 'mecanico');

DROP POLICY IF EXISTS "deslocamentos_mecanico_update" ON public.leva_e_traz_deslocamentos;
CREATE POLICY "deslocamentos_mecanico_update"
    ON public.leva_e_traz_deslocamentos
    FOR UPDATE
    TO authenticated
    USING (
        public.papel_usuario() = 'mecanico'
        AND (
            public.funcionario_atual_id() IS NULL
            OR motorista_principal_id = public.funcionario_atual_id()
            OR auxiliar_id = public.funcionario_atual_id()
        )
    )
    WITH CHECK (
        public.papel_usuario() = 'mecanico'
        AND (
            public.funcionario_atual_id() IS NULL
            OR motorista_principal_id = public.funcionario_atual_id()
            OR auxiliar_id = public.funcionario_atual_id()
        )
    );
