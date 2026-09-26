-- ==============================================================================
-- Story 2.15: Requisições de Peças do Mecânico para Supabase Postgres (nova tabela)
-- Autor: Dara (@data-engineer) / Dex (@dev)
--
-- 1. public.requisicoes_pecas com FKs para ordens_servico, pecas e funcionarios (AC1)
-- 2. solicitante_id resolvido pela sessão via funcionario_atual_id() (AC3, Story 2.3)
-- 3. Triggers padrão de updated_at e auditoria (AC5, Stories 2.2/2.2b)
-- 4. RLS D5: mecânico insere e lê só as próprias requisições; secretaria e admin leem e
--    atualizam todas (AC4). A janela operacional D4 NÃO é aplicada: o AC4 não a exige.
-- Open Question (AC6): status 'atendida' NÃO gera movimentação de estoque aqui.
--
-- Idempotente (IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS).
--
-- ROLLBACK MANUAL:
--   BEGIN;
--   DROP TABLE IF EXISTS public.requisicoes_pecas;
--   DROP FUNCTION IF EXISTS public.fn_requisicoes_pecas_set_solicitante();
--   COMMIT;
-- ==============================================================================

BEGIN;

-- 1. Tabela (AC1, ADR-005 §2.6) --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.requisicoes_pecas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ordem_servico_id TEXT REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    numero_os TEXT,
    veiculo TEXT,
    peca_id TEXT REFERENCES public.pecas(id) ON DELETE SET NULL,
    peca_nome TEXT NOT NULL,
    codigo_peca TEXT,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    urgencia TEXT NOT NULL DEFAULT 'normal' CHECK (urgencia IN ('normal', 'urgente')),
    solicitante_id TEXT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    solicitante_nome TEXT,
    status TEXT NOT NULL DEFAULT 'aguardando_separacao' CHECK (
        status IN ('aguardando_separacao', 'atendida', 'recusada', 'cancelada')
    ),
    motivo_recusa TEXT,
    observacoes TEXT,
    atendido_por_id TEXT REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    atendido_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requisicoes_pecas_os_id ON public.requisicoes_pecas(ordem_servico_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_pecas_solicitante_id ON public.requisicoes_pecas(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_pecas_status ON public.requisicoes_pecas(status);
CREATE INDEX IF NOT EXISTS idx_requisicoes_pecas_created_at ON public.requisicoes_pecas(created_at DESC);

COMMENT ON TABLE public.requisicoes_pecas IS
    'Pedidos de peças dos mecânicos ao almoxarifado/secretaria durante a execução da OS (Story 2.15).';

-- 2. Autoria pela sessão (AC3) ---------------------------------------------------------------
-- Para o mecânico, o solicitante é SEMPRE o funcionário da sessão (não aceita valor do cliente).
-- Admin/secretaria/service_role podem registrar em nome de alguém (ou deixar a sessão resolver).
CREATE OR REPLACE FUNCTION public.fn_requisicoes_pecas_set_solicitante()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF public.papel_usuario() = 'mecanico' OR NEW.solicitante_id IS NULL THEN
        NEW.solicitante_id := public.funcionario_atual_id();
    END IF;
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fn_requisicoes_pecas_set_solicitante() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_requisicoes_pecas_solicitante ON public.requisicoes_pecas;
CREATE TRIGGER trg_requisicoes_pecas_solicitante
    BEFORE INSERT ON public.requisicoes_pecas
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_requisicoes_pecas_set_solicitante();

-- 3. updated_at e auditoria (AC5) ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_set_updated_at_requisicoes_pecas ON public.requisicoes_pecas;
CREATE TRIGGER trg_set_updated_at_requisicoes_pecas
    BEFORE UPDATE ON public.requisicoes_pecas
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_audit_requisicoes_pecas ON public.requisicoes_pecas;
CREATE TRIGGER trg_audit_requisicoes_pecas
    AFTER INSERT OR UPDATE OR DELETE ON public.requisicoes_pecas
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_audit_trigger();

-- 4. RLS (AC4 / D5) --------------------------------------------------------------------------
ALTER TABLE public.requisicoes_pecas ENABLE ROW LEVEL SECURITY;

-- 4.1 Admin: acesso total
DROP POLICY IF EXISTS "requisicoes_pecas_admin_total" ON public.requisicoes_pecas;
CREATE POLICY "requisicoes_pecas_admin_total" ON public.requisicoes_pecas
    FOR ALL TO authenticated
    USING (public.papel_usuario() = 'admin')
    WITH CHECK (public.papel_usuario() = 'admin');

-- 4.2 Secretaria: lê e atualiza (atender/recusar) todas as requisições
DROP POLICY IF EXISTS "requisicoes_pecas_secretaria_select" ON public.requisicoes_pecas;
CREATE POLICY "requisicoes_pecas_secretaria_select" ON public.requisicoes_pecas
    FOR SELECT TO authenticated
    USING (public.papel_usuario() = 'secretaria');

DROP POLICY IF EXISTS "requisicoes_pecas_secretaria_update" ON public.requisicoes_pecas;
CREATE POLICY "requisicoes_pecas_secretaria_update" ON public.requisicoes_pecas
    FOR UPDATE TO authenticated
    USING (public.papel_usuario() = 'secretaria')
    WITH CHECK (public.papel_usuario() = 'secretaria');

-- 4.3 Mecânico: lê só as próprias (D5)
DROP POLICY IF EXISTS "requisicoes_pecas_mecanico_select" ON public.requisicoes_pecas;
CREATE POLICY "requisicoes_pecas_mecanico_select" ON public.requisicoes_pecas
    FOR SELECT TO authenticated
    USING (
        public.papel_usuario() = 'mecanico'
        AND solicitante_id = public.funcionario_atual_id()
    );

-- 4.4 Mecânico: insere só as próprias (D5). Sem vínculo de funcionário, funcionario_atual_id()
-- é NULL e a comparação falha: mecânico sem vínculo não cria requisição órfã.
DROP POLICY IF EXISTS "requisicoes_pecas_mecanico_insert" ON public.requisicoes_pecas;
CREATE POLICY "requisicoes_pecas_mecanico_insert" ON public.requisicoes_pecas
    FOR INSERT TO authenticated
    WITH CHECK (
        public.papel_usuario() = 'mecanico'
        AND solicitante_id = public.funcionario_atual_id()
    );

-- Observação (ADR-008 §3.4): solicitante_nome guarda nome de funcionário numa tabela que não é
-- "de pessoa"; a anonimização por titular não o alcança. Registrado na Story 2.15.

COMMIT;
