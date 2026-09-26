-- ==============================================================================
-- Verificação da Story 2.2 — auditoria imutável e updated_at automático
--
-- Executa tudo em uma transação e desfaz no final (ROLLBACK): seguro em banco local/dev.
-- Uso (Supabase local):  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/2.2_triggers_auditoria.test.sql
-- Qualquer asserção falha interrompe com RAISE EXCEPTION 'FALHA ...'.
-- ==============================================================================

BEGIN;

-- Sessão simulada de um admin autenticado (mesmo formato de claims do PostgREST)
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","app_metadata":{"role":"admin"}}',
  true
);

-- ------------------------------------------------------------------------------
-- 1. AC1/AC3 — INSERT, UPDATE e DELETE autenticados geram auditoria completa
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;

INSERT INTO public.clientes (id, nome, cpf_cnpj, telefone)
VALUES ('cli-teste-22', 'Cliente Teste 2.2', '000.000.000-22', '(43) 90000-0022');

INSERT INTO public.ordens_servico (id, numero_os, cliente_id)
VALUES ('os-teste-22', 'OS-TESTE-22', 'cli-teste-22');

UPDATE public.ordens_servico
SET status = 'em_diagnostico', updated_at = '2000-01-01'
WHERE id = 'os-teste-22';

DELETE FROM public.ordens_servico WHERE id = 'os-teste-22';

RESET ROLE;

DO $$
DECLARE
  v_count int;
  v_log record;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.audit_logs WHERE tabela = 'ordens_servico' AND registro_id = 'os-teste-22';
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'FALHA AC1: esperados 3 logs (INSERT/UPDATE/DELETE) em ordens_servico, encontrados %', v_count;
  END IF;

  SELECT * INTO v_log FROM public.audit_logs
  WHERE tabela = 'ordens_servico' AND registro_id = 'os-teste-22' AND operacao = 'INSERT';
  IF v_log.usuario_id IS DISTINCT FROM '11111111-1111-1111-1111-111111111111'::uuid
     OR v_log.usuario_papel IS DISTINCT FROM 'admin'
     OR v_log.valor_anterior IS NOT NULL
     OR (v_log.valor_novo ->> 'numero_os') IS DISTINCT FROM 'OS-TESTE-22' THEN
    RAISE EXCEPTION 'FALHA AC1: log de INSERT incorreto: %', row_to_json(v_log);
  END IF;

  SELECT * INTO v_log FROM public.audit_logs
  WHERE tabela = 'ordens_servico' AND registro_id = 'os-teste-22' AND operacao = 'UPDATE';
  IF (v_log.valor_anterior ->> 'status') IS DISTINCT FROM 'fila' OR (v_log.valor_novo ->> 'status') IS DISTINCT FROM 'em_diagnostico' THEN
    RAISE EXCEPTION 'FALHA AC1: log de UPDATE sem OLD/NEW corretos: %', row_to_json(v_log);
  END IF;

  SELECT * INTO v_log FROM public.audit_logs
  WHERE tabela = 'ordens_servico' AND registro_id = 'os-teste-22' AND operacao = 'DELETE';
  IF v_log.valor_anterior IS NULL OR v_log.valor_novo IS NOT NULL THEN
    RAISE EXCEPTION 'FALHA AC1: log de DELETE deveria ter só valor_anterior: %', row_to_json(v_log);
  END IF;

  SELECT count(*) INTO v_count
  FROM public.audit_logs WHERE tabela = 'clientes' AND registro_id = 'cli-teste-22' AND operacao = 'INSERT';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FALHA AC3: INSERT em clientes não foi auditado';
  END IF;

  RAISE NOTICE 'OK AC1/AC3: INSERT/UPDATE/DELETE auditados com usuário, papel e OLD/NEW';
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. AC3/AC5 — triggers presentes em todas as tabelas previstas
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ordens_servico','clientes','veiculos','estoque_movimentacoes',
    'compras_pedidos','compras_cotacoes','funcionarios','pecas','servicos','terceiros'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_audit_' || t AND tgrelid = ('public.' || t)::regclass AND NOT tgisinternal
    ) THEN
      RAISE EXCEPTION 'FALHA AC3: trigger de auditoria ausente em %', t;
    END IF;
  END LOOP;

  FOREACH t IN ARRAY ARRAY['funcionarios','clientes','veiculos','pecas','servicos','terceiros',
    'compras_pedidos','compras_cotacoes','ordens_servico'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_set_updated_at_' || t AND tgrelid = ('public.' || t)::regclass AND NOT tgisinternal
    ) THEN
      RAISE EXCEPTION 'FALHA AC5: trigger de updated_at ausente em %', t;
    END IF;
  END LOOP;

  RAISE NOTICE 'OK AC3/AC5: 10 triggers de auditoria e 9 de updated_at instaladas';
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. AC5 — updated_at é definido pelo servidor, mesmo se o cliente enviar outro valor
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
UPDATE public.clientes SET nome = 'Cliente Teste 2.2 (editado)', updated_at = '2000-01-01'
WHERE id = 'cli-teste-22';
RESET ROLE;

DO $$
DECLARE
  v_updated timestamptz;
BEGIN
  SELECT updated_at INTO v_updated FROM public.clientes WHERE id = 'cli-teste-22';
  IF v_updated IS DISTINCT FROM now() THEN
    RAISE EXCEPTION 'FALHA AC5: updated_at deveria ser now() (%), ficou %', now(), v_updated;
  END IF;

  -- Desde a Story 2.2b (ADR-008 §3.1) o UPDATE grava só as colunas alteradas, sem updated_at
  IF NOT EXISTS (
    SELECT 1 FROM public.audit_logs
    WHERE tabela = 'clientes' AND registro_id = 'cli-teste-22' AND operacao = 'UPDATE'
      AND valor_novo ->> 'nome' = 'Cliente Teste 2.2 (editado)'
      AND NOT (valor_novo ? 'updated_at')
  ) THEN
    RAISE EXCEPTION 'FALHA AC5: auditoria do UPDATE deveria conter o nome alterado e não o updated_at';
  END IF;

  RAISE NOTICE 'OK AC5: updated_at sobrescrito pelo servidor; auditoria registra só o que mudou';
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. AC2 — chamada anônima via função pública SECURITY DEFINER grava 'publico_token'
-- ------------------------------------------------------------------------------
CREATE FUNCTION public.teste_22_rpc_publica() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.clientes SET telefone = '(43) 90000-9999' WHERE id = 'cli-teste-22';
$$;
GRANT EXECUTE ON FUNCTION public.teste_22_rpc_publica() TO anon;

SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SET LOCAL ROLE anon;
SELECT public.teste_22_rpc_publica();
RESET ROLE;

DO $$
DECLARE
  v_log record;
BEGIN
  SELECT * INTO v_log FROM public.audit_logs
  WHERE tabela = 'clientes' AND registro_id = 'cli-teste-22' AND operacao = 'UPDATE'
    AND valor_novo ->> 'telefone' = '(43) 90000-9999';
  IF v_log IS NULL THEN
    RAISE EXCEPTION 'FALHA AC2: chamada anônima não foi auditada';
  END IF;
  IF v_log.usuario_id IS NOT NULL OR v_log.usuario_papel IS DISTINCT FROM 'publico_token' THEN
    RAISE EXCEPTION 'FALHA AC2: esperado usuario_id NULL e papel publico_token, veio % / %',
      v_log.usuario_id, v_log.usuario_papel;
  END IF;
  RAISE NOTICE 'OK AC2: chamada anônima auditada como publico_token';
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. AC4 — audit_logs é imutável para anon e authenticated (inclusive admin)
-- ------------------------------------------------------------------------------
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","app_metadata":{"role":"admin"}}',
  true
);
SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_count int;
BEGIN
  -- Admin lê a trilha (política "Admin le audit_logs")
  SELECT count(*) INTO v_count FROM public.audit_logs;
  IF v_count = 0 THEN
    RAISE EXCEPTION 'FALHA AC4: admin deveria conseguir ler audit_logs';
  END IF;

  BEGIN
    UPDATE public.audit_logs SET usuario_papel = 'adulterado';
    RAISE EXCEPTION 'FALHA AC4: UPDATE em audit_logs foi permitido';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    DELETE FROM public.audit_logs;
    RAISE EXCEPTION 'FALHA AC4: DELETE em audit_logs foi permitido';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    TRUNCATE public.audit_logs;
    RAISE EXCEPTION 'FALHA AC4: TRUNCATE em audit_logs foi permitido (TRUNCATE ignora RLS)';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    INSERT INTO public.audit_logs (tabela, registro_id, operacao) VALUES ('forjado', 'x', 'INSERT');
    RAISE EXCEPTION 'FALHA AC4: INSERT direto em audit_logs foi permitido';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  RAISE NOTICE 'OK AC4: authenticated (admin) lê, mas não altera, apaga, trunca nem forja audit_logs';
END;
$$;

RESET ROLE;
SET LOCAL ROLE anon;

DO $$
DECLARE
  v_count int;
BEGIN
  BEGIN
    SELECT count(*) INTO v_count FROM public.audit_logs;
    IF v_count > 0 THEN
      RAISE EXCEPTION 'FALHA AC4: anon conseguiu ler % linhas de audit_logs', v_count;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    TRUNCATE public.audit_logs;
    RAISE EXCEPTION 'FALHA AC4: anon conseguiu truncar audit_logs';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  RAISE NOTICE 'OK AC4: anon não lê nem trunca audit_logs';
END;
$$;

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 6. ADR-005 §2.9 — funções com search_path vazio
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE oid = 'public.fn_audit_trigger()'::regprocedure
      AND prosecdef AND proconfig @> ARRAY['search_path=""']
  ) THEN
    RAISE EXCEPTION 'FALHA AC1: fn_audit_trigger deve ser SECURITY DEFINER com search_path vazio';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE oid = 'public.fn_set_updated_at()'::regprocedure AND proconfig @> ARRAY['search_path=""']
  ) THEN
    RAISE EXCEPTION 'FALHA: fn_set_updated_at deve fixar search_path vazio';
  END IF;
  RAISE NOTICE 'OK ADR-005: search_path vazio nas duas funções';
END;
$$;

ROLLBACK;
