-- ==============================================================================
-- Story 2.2b — Auditoria: classificação do ator e minimização/retenção LGPD (ADR-008)
-- Autor: Dara (@data-engineer)
--
-- 1. audit_logs ganha db_usuario (session_user) e token_acesso_id (id do token público).
-- 2. public.audit_ator(): classifica o ator pela claim "role" do JWT (ADR-008 §2).
-- 3. public.fn_audit_trigger() (nova versão): usa audit_ator(); em UPDATE grava só as
--    colunas alteradas (+ id) e ignora UPDATE que só muda updated_at (ADR-008 §3.1).
-- 4. public.expurgar_audit_logs(): retenção de 5 anos, agendada mensalmente via pg_cron.
-- 5. public.anonimizar_titular_auditoria(): anonimização sob demanda (ADR-008 §3.4).
-- 6. Linhas legadas marcadas como 'publico_token' são reclassificadas (ADR-008 §3.5).
--
-- Idempotente (IF NOT EXISTS / CREATE OR REPLACE / unschedule antes de schedule).
--
-- ROLLBACK MANUAL (reverte ao comportamento da Story 2.2):
--   BEGIN;
--   SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expurgar_audit_logs';
--   DROP FUNCTION IF EXISTS public.anonimizar_titular_auditoria(text, text);
--   DROP FUNCTION IF EXISTS public.fn_anonimizar_jsonb(jsonb, boolean);
--   DROP FUNCTION IF EXISTS public.expurgar_audit_logs(integer);
--   -- reaplicar fn_audit_trigger() de 20260926120000_triggers_auditoria_updated_at.sql
--   DROP FUNCTION IF EXISTS public.audit_ator();
--   ALTER TABLE public.audit_logs DROP COLUMN IF EXISTS db_usuario, DROP COLUMN IF EXISTS token_acesso_id;
--   COMMIT;
-- ==============================================================================

BEGIN;

-- 1. Colunas novas ------------------------------------------------------------------------
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS db_usuario text,
  ADD COLUMN IF NOT EXISTS token_acesso_id text;

-- 2. Classificação do ator (ADR-008 §2) -----------------------------------------------------
--   authenticated → papel do usuário | anon → publico_token | service_role → service_role
--   sem claims (SQL Editor, CLI, migrations, pg_cron) → sistema
CREATE OR REPLACE FUNCTION public.audit_ator(
  OUT usuario_id uuid,
  OUT usuario_papel text
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  v_role text := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
BEGIN
  IF v_role = 'authenticated' THEN
    usuario_id := auth.uid();
    usuario_papel := NULLIF(public.papel_usuario(), '');
  ELSIF v_role = 'anon' THEN
    usuario_papel := 'publico_token';
  ELSIF v_role = 'service_role' THEN
    usuario_papel := 'service_role';
  ELSE
    usuario_papel := 'sistema';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.audit_ator() IS
  'Ator da escrita para a trilha de auditoria, pela claim role do JWT (ADR-008 §2).';

-- 3. Função de auditoria (nova versão) ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ator record;
  v_old jsonb;
  v_new jsonb;
  v_anterior jsonb;
  v_novo jsonb;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_old := to_jsonb(OLD);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_new := to_jsonb(NEW);
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Só as colunas que mudaram; updated_at não conta (a própria linha de auditoria data a alteração)
    SELECT jsonb_object_agg(n.key, o.value), jsonb_object_agg(n.key, n.value)
      INTO v_anterior, v_novo
    FROM jsonb_each(v_new) AS n
    JOIN jsonb_each(v_old) AS o ON o.key = n.key
    WHERE n.key <> 'updated_at'
      AND n.value IS DISTINCT FROM o.value;

    IF v_anterior IS NULL THEN
      RETURN NULL; -- nada relevante mudou
    END IF;

    v_anterior := v_anterior || jsonb_build_object('id', v_old -> 'id');
    v_novo := v_novo || jsonb_build_object('id', v_new -> 'id');
  ELSE
    v_anterior := v_old;
    v_novo := v_new;
  END IF;

  SELECT * INTO v_ator FROM public.audit_ator();

  INSERT INTO public.audit_logs (
    tabela, registro_id, operacao, usuario_id, usuario_papel,
    valor_anterior, valor_novo, db_usuario, token_acesso_id
  )
  VALUES (
    TG_TABLE_NAME,
    COALESCE(v_new ->> 'id', v_old ->> 'id'),
    TG_OP,
    v_ator.usuario_id,
    v_ator.usuario_papel,
    v_anterior,
    v_novo,
    session_user,
    NULLIF(current_setting('app.token_acesso_id', true), '')
  );

  RETURN NULL; -- trigger AFTER: valor de retorno ignorado
END;
$$;

COMMENT ON FUNCTION public.fn_audit_trigger() IS
  'Trilha de auditoria imutável (NFR16, ADR-008). AFTER INSERT OR UPDATE OR DELETE FOR EACH ROW. '
  'UPDATE grava só as colunas alteradas; ator classificado por public.audit_ator().';

-- 4. Retenção (ADR-008 §3.3) ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.expurgar_audit_logs(p_anos integer DEFAULT 5)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_excluidas bigint;
BEGIN
  IF p_anos IS NULL OR p_anos < 1 THEN
    RAISE EXCEPTION 'Prazo de retenção inválido: %', p_anos USING ERRCODE = 'invalid_parameter_value';
  END IF;

  DELETE FROM public.audit_logs
  WHERE created_at < now() - make_interval(years => p_anos);
  GET DIAGNOSTICS v_excluidas = ROW_COUNT;
  RETURN v_excluidas;
END;
$$;

COMMENT ON FUNCTION public.expurgar_audit_logs(integer) IS
  'Exclui linhas de audit_logs mais antigas que p_anos (padrão 5, ADR-008 §3.3). Só dono/service_role.';

-- 5. Anonimização sob demanda (ADR-008 §3.4) -------------------------------------------------
-- p_pessoa = true inclui os campos de nome (só em tabelas de pessoas; em peças/serviços "nome"
-- é o nome do item).
CREATE OR REPLACE FUNCTION public.fn_anonimizar_jsonb(p jsonb, p_pessoa boolean)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN p IS NULL OR jsonb_typeof(p) <> 'object' THEN p
    ELSE (
      SELECT COALESCE(
        jsonb_object_agg(
          e.key,
          CASE
            WHEN e.value <> 'null'::jsonb
             AND (
               e.key = ANY (ARRAY[
                 'cpf', 'cpf_cnpj', 'cpf_digitos', 'rg', 'rg_ie', 'telefone', 'telefone_secundario',
                 'celular', 'whatsapp', 'email', 'email_contato', 'endereco', 'logradouro', 'numero',
                 'complemento', 'bairro', 'cep', 'data_nascimento', 'snapshot_cliente'
               ])
               OR (p_pessoa AND e.key = ANY (ARRAY['nome', 'nome_fantasia', 'razao_social']))
             )
            THEN to_jsonb('[anonimizado]'::text)
            ELSE e.value
          END
        ),
        '{}'::jsonb
      )
      FROM jsonb_each(p) AS e
    )
  END
$$;

CREATE OR REPLACE FUNCTION public.anonimizar_titular_auditoria(p_tabela text, p_registro_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ator record;
  v_pessoa boolean := p_tabela IN ('clientes', 'funcionarios', 'cadastros_clientes');
  v_alteradas integer := 0;
  v_n integer;
BEGIN
  SELECT * INTO v_ator FROM public.audit_ator();

  -- Admin (pedido do titular) ou processos internos (service_role / jobs sem JWT)
  IF v_ator.usuario_papel NOT IN ('admin', 'service_role', 'sistema') THEN
    RAISE EXCEPTION 'Apenas o administrador pode anonimizar a trilha de auditoria'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE public.audit_logs
  SET valor_anterior = public.fn_anonimizar_jsonb(valor_anterior, v_pessoa),
      valor_novo = public.fn_anonimizar_jsonb(valor_novo, v_pessoa)
  WHERE tabela = p_tabela
    AND registro_id = p_registro_id
    AND operacao <> 'ANONIMIZACAO';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_alteradas := v_n;

  -- O snapshot do cliente fica nas linhas da OS (registro_id = id da OS)
  IF p_tabela = 'clientes' THEN
    UPDATE public.audit_logs
    SET valor_anterior = public.fn_anonimizar_jsonb(valor_anterior, false),
        valor_novo = public.fn_anonimizar_jsonb(valor_novo, false)
    WHERE tabela = 'ordens_servico'
      AND operacao <> 'ANONIMIZACAO'
      AND (valor_anterior ->> 'cliente_id' = p_registro_id OR valor_novo ->> 'cliente_id' = p_registro_id)
      AND (valor_anterior ? 'snapshot_cliente' OR valor_novo ? 'snapshot_cliente');
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_alteradas := v_alteradas + v_n;
  END IF;

  INSERT INTO public.audit_logs (
    tabela, registro_id, operacao, usuario_id, usuario_papel, valor_novo, db_usuario
  )
  VALUES (
    p_tabela, p_registro_id, 'ANONIMIZACAO', v_ator.usuario_id, v_ator.usuario_papel,
    jsonb_build_object('linhas_anonimizadas', v_alteradas), session_user
  );

  RETURN v_alteradas;
END;
$$;

COMMENT ON FUNCTION public.anonimizar_titular_auditoria(text, text) IS
  'Anonimiza dados pessoais de um titular na trilha (LGPD art. 18, VI; ADR-008 §3.4). '
  'Admin, service_role ou processo interno. Registra operacao = ANONIMIZACAO.';

-- 6. Permissões -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.audit_ator() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.expurgar_audit_logs(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_anonimizar_jsonb(jsonb, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.anonimizar_titular_auditoria(text, text) FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE EXECUTE ON FUNCTION public.audit_ator() FROM anon;
    REVOKE EXECUTE ON FUNCTION public.expurgar_audit_logs(integer) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.fn_anonimizar_jsonb(jsonb, boolean) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.anonimizar_titular_auditoria(text, text) FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE EXECUTE ON FUNCTION public.audit_ator() FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.expurgar_audit_logs(integer) FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.fn_anonimizar_jsonb(jsonb, boolean) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.anonimizar_titular_auditoria(text, text) TO authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.expurgar_audit_logs(integer) TO service_role;
    GRANT EXECUTE ON FUNCTION public.anonimizar_titular_auditoria(text, text) TO service_role;
  END IF;
END;
$$;

-- 7. Reclassificação das linhas legadas (ADR-008 §3.5) ---------------------------------------
-- Até esta migration não existe nenhuma RPC pública por token (Story 2.17), então toda linha
-- 'publico_token' já gravada veio de escrita sem JWT de usuário (SQL/CLI ou service_role),
-- p.ex. a correção da conta do proprietário em 2026-09-26. Registradas como 'sistema'.
UPDATE public.audit_logs
SET usuario_papel = 'sistema'
WHERE usuario_papel = 'publico_token'
  AND token_acesso_id IS NULL;

-- 8. Agendamento mensal do expurgo (pg_cron, quando disponível) -------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'expurgar_audit_logs';
    PERFORM cron.schedule('expurgar_audit_logs', '0 6 1 * *', 'SELECT public.expurgar_audit_logs()');
  ELSE
    RAISE NOTICE 'pg_cron indisponível neste ambiente: expurgo não agendado';
  END IF;
END;
$$;

COMMIT;
