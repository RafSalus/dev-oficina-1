-- ==============================================================================
-- Verificação da Story 2.3 — obter_mecanicos_ativos() e funcionario_atual_id()
--
-- Transacional com ROLLBACK no final: nada persiste. Prefira banco local/dev: dentro da
-- transação o teste escreve em auth.users (cria uma conta sintética ou vincula por instantes
-- uma conta sem funcionário), o que em produção deve ser uma decisão consciente.
-- Uso: supabase db query --linked -f supabase/tests/2.3_mecanicos_ativos.test.sql
--  ou: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/2.3_mecanicos_ativos.test.sql
-- Qualquer asserção falha interrompe com RAISE EXCEPTION 'FALHA ...'.
-- Não depende de dados existentes: cria a massa de teste (e, se preciso, uma conta em
-- auth.users) dentro da transação.
-- ==============================================================================

BEGIN;

-- Massa de teste (como dono da tabela)
INSERT INTO public.funcionarios (id, nome, cpf, telefone, cargo, ativo, email, comissao_servicos) VALUES
  ('t23-mec',  'T23 Mecânico Ativo',   't23-cpf-1', '(43) 90000-2301', 'mecanico',     true,  't23a@x.com', 10),
  ('t23-aux',  'T23 Auxiliar Ativo',   't23-cpf-2', '(43) 90000-2302', 'aux_mecanico', true,  't23b@x.com', 5),
  ('t23-ger',  'T23 Gerente Ativo',    't23-cpf-3', '(43) 90000-2303', 'gerente',      true,  't23c@x.com', 2),
  ('t23-sec',  'T23 Secretária Ativa', 't23-cpf-4', '(43) 90000-2304', 'secretaria',   true,  't23d@x.com', 0),
  ('t23-ina',  'T23 Mecânico Inativo', 't23-cpf-5', '(43) 90000-2305', 'mecanico',     false, 't23e@x.com', 10);

-- Resultados coletados sob cada papel, conferidos depois como dono
CREATE TEMP TABLE t23_resultado (caso text PRIMARY KEY, valor jsonb) ON COMMIT DROP;
GRANT ALL ON t23_resultado TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 1. Secretaria: RPC funciona com projeção mínima; tabela completa continua bloqueada
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims',
  '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated","app_metadata":{"role":"secretaria"}}', true);
SET LOCAL ROLE authenticated;

INSERT INTO t23_resultado
SELECT 'secretaria_rpc', COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.id), '[]'::jsonb)
FROM public.obter_mecanicos_ativos() AS m WHERE m.id LIKE 't23-%';

INSERT INTO t23_resultado
SELECT 'secretaria_tabela', to_jsonb(count(*)) FROM public.funcionarios;

INSERT INTO t23_resultado VALUES ('secretaria_atual_id', to_jsonb(public.funcionario_atual_id()));

RESET ROLE;

DO $$
DECLARE
  v_rpc jsonb := (SELECT valor FROM t23_resultado WHERE caso = 'secretaria_rpc');
  v_chaves text[];
BEGIN
  IF (SELECT array_agg(e ->> 'id' ORDER BY e ->> 'id') FROM jsonb_array_elements(v_rpc) e)
     IS DISTINCT FROM ARRAY['t23-aux', 't23-ger', 't23-mec'] THEN
    RAISE EXCEPTION 'FALHA AC1: elegíveis deveriam ser mec/aux/ger ativos, veio %', v_rpc;
  END IF;

  SELECT array_agg(DISTINCT k ORDER BY k) INTO v_chaves
  FROM jsonb_array_elements(v_rpc) e, jsonb_object_keys(e) k;
  IF v_chaves IS DISTINCT FROM ARRAY['cargo', 'id', 'nome'] THEN
    RAISE EXCEPTION 'FALHA AC1: RPC deve expor só id/nome/cargo, expôs %', v_chaves;
  END IF;

  IF (SELECT valor FROM t23_resultado WHERE caso = 'secretaria_tabela') <> to_jsonb(0) THEN
    RAISE EXCEPTION 'FALHA AC6: secretaria leu % linhas de funcionarios diretamente',
      (SELECT valor FROM t23_resultado WHERE caso = 'secretaria_tabela');
  END IF;

  IF (SELECT valor FROM t23_resultado WHERE caso = 'secretaria_atual_id') <> 'null'::jsonb THEN
    RAISE EXCEPTION 'FALHA AC4: sessão sem vínculo deveria resultar em NULL';
  END IF;

  RAISE NOTICE 'OK AC1/AC2/AC6: secretaria lista mecânicos (id/nome/cargo) e não lê funcionarios';
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. Mecânico e admin também usam a RPC; papel sem acesso recebe lista vazia
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated","app_metadata":{"role":"mecanico"}}', true);
SET LOCAL ROLE authenticated;
INSERT INTO t23_resultado SELECT 'mecanico_rpc', to_jsonb(count(*)) FROM public.obter_mecanicos_ativos() WHERE id LIKE 't23-%';

SELECT set_config('request.jwt.claims',
  '{"sub":"66666666-6666-6666-6666-666666666666","role":"authenticated","app_metadata":{"role":"admin"}}', true);
INSERT INTO t23_resultado SELECT 'admin_rpc', to_jsonb(count(*)) FROM public.obter_mecanicos_ativos() WHERE id LIKE 't23-%';

SELECT set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated","app_metadata":{}}', true);
INSERT INTO t23_resultado SELECT 'sem_papel_rpc', to_jsonb(count(*)) FROM public.obter_mecanicos_ativos();
RESET ROLE;

DO $$
BEGIN
  IF (SELECT valor FROM t23_resultado WHERE caso = 'mecanico_rpc') <> to_jsonb(3) THEN
    RAISE EXCEPTION 'FALHA AC2: mecânico deveria ver 3 elegíveis de teste';
  END IF;
  IF (SELECT valor FROM t23_resultado WHERE caso = 'admin_rpc') <> to_jsonb(3) THEN
    RAISE EXCEPTION 'FALHA AC2: admin deveria ver 3 elegíveis de teste';
  END IF;
  IF (SELECT valor FROM t23_resultado WHERE caso = 'sem_papel_rpc') <> to_jsonb(0) THEN
    RAISE EXCEPTION 'FALHA AC2: usuário sem papel não deveria receber mecânicos';
  END IF;
  RAISE NOTICE 'OK AC2: mecânico e admin listam; autenticado sem papel recebe lista vazia';
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. funcionario_atual_id(): vínculo ativo, vínculo inativo e sem sessão
--    Vincula t23-mec a uma conta de auth.users ainda sem funcionário (ou cria uma), tudo
--    dentro desta transação — nada persiste após o ROLLBACK.
-- ------------------------------------------------------------------------------
CREATE TEMP TABLE t23_ctx ON COMMIT DROP AS
SELECT COALESCE(
  (SELECT u.id FROM auth.users u
   WHERE NOT EXISTS (SELECT 1 FROM public.funcionarios f WHERE f.auth_user_id = u.id)
   LIMIT 1),
  '55555555-5555-5555-5555-555555555555'::uuid
) AS auth_id;

INSERT INTO auth.users (id)
SELECT auth_id FROM t23_ctx
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = (SELECT auth_id FROM t23_ctx));

UPDATE public.funcionarios SET auth_user_id = (SELECT auth_id FROM t23_ctx) WHERE id = 't23-mec';

SELECT set_config('request.jwt.claims',
  json_build_object('sub', auth_id, 'role', 'authenticated', 'app_metadata', json_build_object('role', 'mecanico'))::text,
  true)
FROM t23_ctx;
SET LOCAL ROLE authenticated;
INSERT INTO t23_resultado VALUES ('vinculado_atual_id', to_jsonb(public.funcionario_atual_id()));
RESET ROLE;

-- O mesmo vínculo, com o funcionário inativado, não deve mais identificar ninguém
UPDATE public.funcionarios SET ativo = false WHERE id = 't23-mec';
SET LOCAL ROLE authenticated;
INSERT INTO t23_resultado VALUES ('inativo_atual_id', to_jsonb(public.funcionario_atual_id()));
RESET ROLE;

-- Sem sessão (anon): não identifica ninguém
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SET LOCAL ROLE authenticated;
INSERT INTO t23_resultado VALUES ('sem_sessao_atual_id', to_jsonb(public.funcionario_atual_id()));
RESET ROLE;

DO $$
BEGIN
  IF (SELECT valor #>> '{}' FROM t23_resultado WHERE caso = 'vinculado_atual_id') IS DISTINCT FROM 't23-mec' THEN
    RAISE EXCEPTION 'FALHA AC4: funcionario_atual_id() deveria retornar t23-mec, retornou %',
      (SELECT valor FROM t23_resultado WHERE caso = 'vinculado_atual_id');
  END IF;
  IF (SELECT valor FROM t23_resultado WHERE caso = 'inativo_atual_id') <> 'null'::jsonb THEN
    RAISE EXCEPTION 'FALHA AC4: funcionário inativo não deveria ser identificado';
  END IF;
  IF (SELECT valor FROM t23_resultado WHERE caso = 'sem_sessao_atual_id') <> 'null'::jsonb THEN
    RAISE EXCEPTION 'FALHA AC4: sessão sem sub não deveria identificar funcionário';
  END IF;
  RAISE NOTICE 'OK AC4: funcionario_atual_id() resolve o vínculo ativo e devolve NULL para inativo/sem sessão';
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. anon não executa as funções; ambas com SECURITY DEFINER e search_path vazio
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF has_function_privilege('anon', 'public.obter_mecanicos_ativos()', 'EXECUTE')
     OR has_function_privilege('anon', 'public.funcionario_atual_id()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FALHA: anon não deveria executar as funções da Story 2.3';
  END IF;
  IF NOT has_function_privilege('authenticated', 'public.obter_mecanicos_ativos()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FALHA: authenticated deveria executar obter_mecanicos_ativos()';
  END IF;
  IF (SELECT count(*) FROM pg_proc
      WHERE oid IN ('public.obter_mecanicos_ativos()'::regprocedure, 'public.funcionario_atual_id()'::regprocedure)
        AND prosecdef AND proconfig @> ARRAY['search_path=""']) <> 2 THEN
    RAISE EXCEPTION 'FALHA ADR-005: funções devem ser SECURITY DEFINER com search_path vazio';
  END IF;
  RAISE NOTICE 'OK: anon sem EXECUTE; SECURITY DEFINER e search_path vazio';
END;
$$;

ROLLBACK;
