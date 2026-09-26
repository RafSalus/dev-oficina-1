-- ==============================================================================
-- Runbook: definir o papel de uma conta de login e vinculá-la ao funcionário
--
-- Uso: quando uma conta de auth.users existe sem app_metadata.role e/ou sem vínculo em
-- public.funcionarios.auth_user_id (o login cai em "acesso negado" e
-- funcionario_atual_id() retorna NULL). Normalmente a Edge Function
-- criar-login-funcionario faz isso; este script é o reparo manual.
--
-- Executar (ajuste os dois valores abaixo antes):
--   npx supabase db query --linked -f scripts/runbooks/vincular-conta-funcionario.sql
--
-- O papel segue PAPEL_POR_CARGO (src/repositories/funcionariosRepository.js):
--   analista → admin | gerente, mecanico, aux_mecanico → mecanico | secretaria → secretaria
-- Idempotente e com guardas: falha (sem alterar nada) se não houver exatamente 1 conta e
-- 1 funcionário. O UPDATE em funcionarios é auditado (fn_audit_trigger, Story 2.2).
--
-- Histórico: aplicado em 2026-09-26 para a conta do proprietário (admin-rafael), com
-- autorização do usuário — ver Story 2.3, Dev Agent Record.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
  -- >>> AJUSTE AQUI <<<
  v_email text := 'email-da-conta@exemplo.com';
  v_funcionario_id text := 'id-do-funcionario';
  -- >>>>>>>>>>>>>>>>>>>
  v_uid uuid;
  v_cargo text;
  v_papel text;
  v_n int;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(v_email);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Esperada 1 conta com o e-mail informado, encontradas %', v_n;
  END IF;

  SELECT cargo INTO v_cargo FROM public.funcionarios WHERE id = v_funcionario_id;
  IF v_cargo IS NULL THEN
    RAISE EXCEPTION 'Funcionário % não encontrado', v_funcionario_id;
  END IF;

  v_papel := CASE v_cargo
    WHEN 'analista' THEN 'admin'
    WHEN 'secretaria' THEN 'secretaria'
    WHEN 'gerente' THEN 'mecanico'
    WHEN 'mecanico' THEN 'mecanico'
    WHEN 'aux_mecanico' THEN 'mecanico'
  END;
  IF v_papel IS NULL THEN
    RAISE EXCEPTION 'Cargo % sem papel mapeado', v_cargo;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.funcionarios WHERE auth_user_id = v_uid AND id <> v_funcionario_id
  ) THEN
    RAISE EXCEPTION 'A conta já está vinculada a outro funcionário';
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', v_papel),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'role'
  WHERE id = v_uid;

  UPDATE public.funcionarios SET auth_user_id = v_uid WHERE id = v_funcionario_id;

  RAISE NOTICE 'Conta vinculada a % com papel %', v_funcionario_id, v_papel;
END;
$$;

COMMIT;
