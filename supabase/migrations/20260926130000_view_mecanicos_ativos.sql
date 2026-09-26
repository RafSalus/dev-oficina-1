-- ==============================================================================
-- Story 2.3 — Mecânicos ativos com exposição mínima (Regra 14) + funcionario_atual_id()
-- Autor: Dara (@data-engineer)
--
-- DECISÃO: RPC SECURITY DEFINER em vez de VIEW.
--   - VIEW com security_invoker = true exigiria conceder SELECT em public.funcionarios à
--     secretaria; como RLS filtra linhas e não colunas, ela passaria a ler CPF, telefone e
--     comissões com um SELECT direto na tabela (viola o AC2).
--   - VIEW sem security_invoker roda com os privilégios do dono, ignora RLS e não aceita
--     política própria — o controle ficaria só em GRANT, sem checagem de papel.
--   - RPC SECURITY DEFINER com projeção fixa (id, nome, cargo) e filtro de papel via
--     public.papel_usuario() entrega só o necessário e mantém "Admin total funcionarios"
--     como único caminho para a tabela completa.
--
-- ROLLBACK MANUAL:
--   BEGIN;
--   DROP FUNCTION IF EXISTS public.obter_mecanicos_ativos();
--   DROP FUNCTION IF EXISTS public.funcionario_atual_id();
--   COMMIT;
-- ==============================================================================

BEGIN;

-- 1. Mecânicos ativos elegíveis para Agenda e Nova OS (AC1, AC2) ------------------------------
CREATE OR REPLACE FUNCTION public.obter_mecanicos_ativos()
RETURNS TABLE (id text, nome text, cargo text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT f.id, f.nome, f.cargo
  FROM public.funcionarios AS f
  WHERE f.ativo = true
    AND f.cargo IN ('mecanico', 'aux_mecanico', 'gerente')
    AND public.papel_usuario() IN ('admin', 'secretaria', 'mecanico')
  ORDER BY f.nome
$$;

COMMENT ON FUNCTION public.obter_mecanicos_ativos() IS
  'Mecânicos ativos (id, nome, cargo) para Agenda e Nova OS. Nunca expõe dados de RH (Regra 14). '
  'Retorna vazio para papéis fora de admin/secretaria/mecanico.';

-- 2. Identidade do funcionário autenticado (AC4, ADR-005 §2.8) --------------------------------
-- Retorna NULL quando não há vínculo auth_user_id ou o funcionário está inativo:
-- políticas que a consumirem devem negar acesso nesse caso.
CREATE OR REPLACE FUNCTION public.funcionario_atual_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT f.id
  FROM public.funcionarios AS f
  WHERE f.auth_user_id = auth.uid()
    AND f.ativo = true
$$;

COMMENT ON FUNCTION public.funcionario_atual_id() IS
  'id do funcionário ativo vinculado à sessão (auth.uid()); NULL se não houver. Base de autoria e '
  'de políticas de "próprios registros" (Stories 2.8, 2.12, 2.14, 2.15, 2.16).';

-- 3. Execução apenas por usuários autenticados ------------------------------------------------
-- O Supabase concede EXECUTE a anon por padrão em funções novas de public.
REVOKE EXECUTE ON FUNCTION public.obter_mecanicos_ativos() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.funcionario_atual_id() FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE EXECUTE ON FUNCTION public.obter_mecanicos_ativos() FROM anon;
    REVOKE EXECUTE ON FUNCTION public.funcionario_atual_id() FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT EXECUTE ON FUNCTION public.obter_mecanicos_ativos() TO authenticated;
    GRANT EXECUTE ON FUNCTION public.funcionario_atual_id() TO authenticated;
  END IF;
END;
$$;

COMMIT;
