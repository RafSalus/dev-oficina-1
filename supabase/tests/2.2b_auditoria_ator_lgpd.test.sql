-- ==============================================================================
-- Verificação da Story 2.2b — ator da auditoria, diff no UPDATE, retenção e anonimização
--
-- Transacional com ROLLBACK no final: nada persiste.
-- Uso: supabase db query --linked -f supabase/tests/2.2b_auditoria_ator_lgpd.test.sql
-- Qualquer asserção falha interrompe com RAISE EXCEPTION 'FALHA ...'.
-- Não cria contas em auth.users.
-- ==============================================================================

BEGIN;

CREATE TEMP TABLE t22b_resultado (caso text PRIMARY KEY, valor jsonb) ON COMMIT DROP;
GRANT ALL ON t22b_resultado TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 1. AC2 — quatro atores
-- ------------------------------------------------------------------------------
-- 1a. Sem claims (SQL direto / CLI / migration) → sistema
SELECT set_config('request.jwt.claims', '', true);
INSERT INTO public.clientes (id, nome, cpf_cnpj, telefone, email)
VALUES ('t22b-cli', 'Titular 2.2b', '000.000.000-2b', '(43) 90000-2222', 't22b@x.com');

-- 1b. Admin autenticado → papel admin + uid
SELECT set_config('request.jwt.claims',
  '{"sub":"77777777-7777-7777-7777-777777777777","role":"authenticated","app_metadata":{"role":"admin"}}', true);
SET LOCAL ROLE authenticated;
UPDATE public.clientes SET observacoes = 'editado pelo admin' WHERE id = 't22b-cli';
RESET ROLE;

-- 1c. service_role → service_role
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
UPDATE public.clientes SET telefone = '(43) 90000-3333' WHERE id = 't22b-cli';

-- 1d. anon via RPC pública SECURITY DEFINER, com id de token → publico_token + token_acesso_id
CREATE FUNCTION public.teste_22b_rpc_publica() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM set_config('app.token_acesso_id', 'tok-22b', true);
  UPDATE public.clientes SET email = 'novo22b@x.com' WHERE id = 't22b-cli';
END;
$$;
GRANT EXECUTE ON FUNCTION public.teste_22b_rpc_publica() TO anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SET LOCAL ROLE anon;
SELECT public.teste_22b_rpc_publica();
RESET ROLE;
SELECT set_config('app.token_acesso_id', '', true);

DO $$
DECLARE
  v record;
BEGIN
  SELECT * INTO v FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'INSERT';
  IF v.usuario_papel IS DISTINCT FROM 'sistema' OR v.usuario_id IS NOT NULL OR v.db_usuario IS NULL THEN
    RAISE EXCEPTION 'FALHA AC2: sem claims deveria ser sistema com db_usuario, veio % / % / %',
      v.usuario_papel, v.usuario_id, v.db_usuario;
  END IF;

  SELECT * INTO v FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'UPDATE' AND valor_novo ? 'observacoes';
  IF v.usuario_papel IS DISTINCT FROM 'admin'
     OR v.usuario_id IS DISTINCT FROM '77777777-7777-7777-7777-777777777777'::uuid THEN
    RAISE EXCEPTION 'FALHA AC2: admin autenticado mal classificado: % / %', v.usuario_papel, v.usuario_id;
  END IF;

  SELECT * INTO v FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'UPDATE' AND valor_novo ? 'telefone';
  IF v.usuario_papel IS DISTINCT FROM 'service_role' OR v.usuario_id IS NOT NULL THEN
    RAISE EXCEPTION 'FALHA AC2: service_role mal classificado: %', v.usuario_papel;
  END IF;

  SELECT * INTO v FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'UPDATE' AND valor_novo ? 'email';
  IF v.usuario_papel IS DISTINCT FROM 'publico_token' OR v.token_acesso_id IS DISTINCT FROM 'tok-22b' THEN
    RAISE EXCEPTION 'FALHA AC2: chamada anônima deveria ser publico_token com token, veio % / %',
      v.usuario_papel, v.token_acesso_id;
  END IF;

  RAISE NOTICE 'OK AC2: sistema, admin, service_role e publico_token (com token_acesso_id)';
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. AC3 — UPDATE grava só o que mudou; só updated_at não gera linha
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims', '', true);
-- Mudança real só de updated_at: desliga por instantes o BEFORE UPDATE que o regrava com now()
-- (dentro desta transação, desfeita no ROLLBACK). Não deve gerar linha de auditoria.
ALTER TABLE public.clientes DISABLE TRIGGER trg_set_updated_at_clientes;
UPDATE public.clientes SET updated_at = '2001-01-01' WHERE id = 't22b-cli';
ALTER TABLE public.clientes ENABLE TRIGGER trg_set_updated_at_clientes;
-- UPDATE sem mudança de valor: também não gera linha
UPDATE public.clientes SET nome = nome WHERE id = 't22b-cli';

DO $$
DECLARE
  v record;
  v_updates int;
  v_chaves text[];
BEGIN
  SELECT count(*) INTO v_updates FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'UPDATE';
  IF v_updates <> 3 THEN
    RAISE EXCEPTION 'FALHA AC3: esperados 3 UPDATEs auditados (admin, service_role, anon), encontrados %', v_updates;
  END IF;

  SELECT * INTO v FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'UPDATE' AND valor_novo ? 'observacoes';
  SELECT array_agg(k ORDER BY k) INTO v_chaves FROM jsonb_object_keys(v.valor_novo) k;
  IF v_chaves IS DISTINCT FROM ARRAY['id', 'observacoes'] THEN
    RAISE EXCEPTION 'FALHA AC3: UPDATE deveria gravar só id + coluna alterada, gravou %', v_chaves;
  END IF;
  IF v.valor_anterior ->> 'observacoes' IS NOT NULL OR v.valor_anterior ->> 'id' IS DISTINCT FROM 't22b-cli' THEN
    RAISE EXCEPTION 'FALHA AC3: valor_anterior do diff incorreto: %', v.valor_anterior;
  END IF;

  SELECT * INTO v FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'INSERT';
  IF NOT (v.valor_novo ? 'cpf_cnpj' AND v.valor_novo ? 'telefone') THEN
    RAISE EXCEPTION 'FALHA AC3: INSERT deveria continuar com a linha completa';
  END IF;

  RAISE NOTICE 'OK AC3: diff no UPDATE, updated_at/no-op ignorados, INSERT completo';
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. AC5 — anonimização: recusada para não admin; admin anonimiza dados pessoais
-- ------------------------------------------------------------------------------
-- OS do titular com snapshot (para verificar a anonimização do snapshot)
INSERT INTO public.ordens_servico (id, numero_os, cliente_id, snapshot_cliente)
VALUES ('t22b-os', 'OS-T22B', 't22b-cli', '{"nome":"Titular 2.2b","telefone":"(43) 90000-2222"}');

SELECT set_config('request.jwt.claims',
  '{"sub":"88888888-8888-8888-8888-888888888888","role":"authenticated","app_metadata":{"role":"secretaria"}}', true);
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  PERFORM public.anonimizar_titular_auditoria('clientes', 't22b-cli');
  RAISE EXCEPTION 'FALHA AC5: secretaria não deveria anonimizar';
EXCEPTION WHEN insufficient_privilege THEN NULL;
END;
$$;
RESET ROLE;

SELECT set_config('request.jwt.claims',
  '{"sub":"77777777-7777-7777-7777-777777777777","role":"authenticated","app_metadata":{"role":"admin"}}', true);
SET LOCAL ROLE authenticated;
INSERT INTO t22b_resultado VALUES
  ('anonimizadas', to_jsonb(public.anonimizar_titular_auditoria('clientes', 't22b-cli')));
RESET ROLE;

DO $$
DECLARE
  v record;
  v_os record;
BEGIN
  IF (SELECT valor FROM t22b_resultado WHERE caso = 'anonimizadas')::int < 5 THEN
    RAISE EXCEPTION 'FALHA AC5: esperadas >= 5 linhas anonimizadas (4 do cliente + 1 da OS), veio %',
      (SELECT valor FROM t22b_resultado WHERE caso = 'anonimizadas');
  END IF;

  SELECT * INTO v FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'INSERT';
  IF v.valor_novo ->> 'cpf_cnpj' <> '[anonimizado]'
     OR v.valor_novo ->> 'telefone' <> '[anonimizado]'
     OR v.valor_novo ->> 'email' <> '[anonimizado]'
     OR v.valor_novo ->> 'nome' <> '[anonimizado]' THEN
    RAISE EXCEPTION 'FALHA AC5: dados pessoais não anonimizados: %', v.valor_novo;
  END IF;
  IF v.valor_novo ->> 'tipo' IS DISTINCT FROM 'PF' OR v.valor_novo ->> 'id' IS DISTINCT FROM 't22b-cli'
     OR v.usuario_papel IS DISTINCT FROM 'sistema' THEN
    RAISE EXCEPTION 'FALHA AC5: campos não pessoais e o autor devem ser preservados';
  END IF;

  SELECT * INTO v_os FROM public.audit_logs WHERE registro_id = 't22b-os' AND operacao = 'INSERT';
  IF v_os.valor_novo ->> 'snapshot_cliente' IS DISTINCT FROM '[anonimizado]'
     OR v_os.valor_novo ->> 'numero_os' IS DISTINCT FROM 'OS-T22B' THEN
    RAISE EXCEPTION 'FALHA AC5: snapshot do cliente na OS deveria ser anonimizado (e o resto preservado): %', v_os.valor_novo;
  END IF;

  SELECT * INTO v FROM public.audit_logs WHERE registro_id = 't22b-cli' AND operacao = 'ANONIMIZACAO';
  IF v IS NULL OR v.usuario_papel IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'FALHA AC5: a anonimização deveria ser registrada na trilha pelo admin';
  END IF;

  RAISE NOTICE 'OK AC5: secretaria recusada; admin anonimiza cliente e snapshot da OS, com registro';
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. AC4 — expurgo por prazo e permissões
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims', '', true);
INSERT INTO public.audit_logs (tabela, registro_id, operacao, usuario_papel, created_at)
VALUES ('t22b', 'antiga', 'INSERT', 'sistema', now() - interval '6 years'),
       ('t22b', 'recente', 'INSERT', 'sistema', now() - interval '4 years');

INSERT INTO t22b_resultado VALUES ('expurgo', to_jsonb(public.expurgar_audit_logs()));

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.audit_logs WHERE tabela = 't22b' AND registro_id = 'antiga') THEN
    RAISE EXCEPTION 'FALHA AC4: linha com 6 anos deveria ser expurgada';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.audit_logs WHERE tabela = 't22b' AND registro_id = 'recente') THEN
    RAISE EXCEPTION 'FALHA AC4: linha com 4 anos deveria ser mantida';
  END IF;
  IF (SELECT valor FROM t22b_resultado WHERE caso = 'expurgo')::bigint < 1 THEN
    RAISE EXCEPTION 'FALHA AC4: expurgo deveria retornar a quantidade excluída';
  END IF;
  BEGIN
    PERFORM public.expurgar_audit_logs(0);
    RAISE EXCEPTION 'FALHA AC4: prazo 0 deveria ser recusado';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  IF has_function_privilege('authenticated', 'public.expurgar_audit_logs(integer)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.expurgar_audit_logs(integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FALHA AC4: anon/authenticated não deveriam executar o expurgo';
  END IF;
  IF has_function_privilege('anon', 'public.anonimizar_titular_auditoria(text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FALHA AC5: anon não deveria executar a anonimização';
  END IF;
  RAISE NOTICE 'OK AC4: expurgo respeita o prazo, recusa prazo inválido e é restrito';
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. AC7 — imutabilidade da Story 2.2 preservada; ADR-005 nas funções novas
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF has_table_privilege('authenticated', 'public.audit_logs', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.audit_logs', 'TRUNCATE')
     OR has_table_privilege('anon', 'public.audit_logs', 'DELETE')
     OR has_table_privilege('authenticated', 'public.audit_logs', 'INSERT') THEN
    RAISE EXCEPTION 'FALHA AC7: anon/authenticated recuperaram escrita em audit_logs';
  END IF;
  IF (SELECT count(*) FROM pg_proc
      WHERE oid IN ('public.fn_audit_trigger()'::regprocedure,
                    'public.expurgar_audit_logs(integer)'::regprocedure,
                    'public.anonimizar_titular_auditoria(text,text)'::regprocedure)
        AND prosecdef AND proconfig @> ARRAY['search_path=""']) <> 3 THEN
    RAISE EXCEPTION 'FALHA ADR-005: funções SECURITY DEFINER devem ter search_path vazio';
  END IF;
  RAISE NOTICE 'OK AC7: audit_logs segue imutável; search_path vazio nas funções';
END;
$$;

ROLLBACK;
