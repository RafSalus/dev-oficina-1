-- ==============================================================================
-- Verificação da Story 2.15 — requisições de peças, autoria pela sessão e RLS D5
--
-- Transacional com ROLLBACK no final: nada persiste. Prefira banco local/dev: dentro da
-- transação o teste cria contas sintéticas em auth.users para os mecânicos.
-- Uso: supabase db query --linked -f supabase/tests/2.15_requisicoes_pecas.test.sql
-- Qualquer asserção falha interrompe com RAISE EXCEPTION 'FALHA ...'.
-- ==============================================================================

BEGIN;

INSERT INTO auth.users (id) VALUES
  ('a1515151-0000-0000-0000-00000000000a'),
  ('a1515151-0000-0000-0000-00000000000b');

INSERT INTO public.funcionarios (id, nome, cpf, telefone, cargo, ativo, auth_user_id) VALUES
  ('t215-mec-a', 'T215 Mecânico A', 't215-cpf-a', '(43) 90000-2151', 'mecanico', true, 'a1515151-0000-0000-0000-00000000000a'),
  ('t215-mec-b', 'T215 Mecânico B', 't215-cpf-b', '(43) 90000-2152', 'mecanico', true, 'a1515151-0000-0000-0000-00000000000b');

CREATE TEMP TABLE t215 (caso text PRIMARY KEY, valor jsonb) ON COMMIT DROP;
GRANT ALL ON t215 TO authenticated;

-- ------------------------------------------------------------------------------
-- 1. Mecânico A cria requisição: id, status e solicitante vêm do banco (AC1, AC3)
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims',
  '{"sub":"a1515151-0000-0000-0000-00000000000a","role":"authenticated","app_metadata":{"role":"mecanico"}}', true);
SET LOCAL ROLE authenticated;
INSERT INTO public.requisicoes_pecas (numero_os, peca_nome, quantidade, urgencia, solicitante_nome)
VALUES ('T215-OS', 'T215 Pastilha', 2, 'urgente', 'T215 Mecânico A');
INSERT INTO t215 SELECT 'a_ve', to_jsonb(count(*)) FROM public.requisicoes_pecas WHERE peca_nome LIKE 'T215%';
RESET ROLE;

-- 2. Mecânico B tenta gravar em nome de A e tenta ver as de A (D5)
SELECT set_config('request.jwt.claims',
  '{"sub":"a1515151-0000-0000-0000-00000000000b","role":"authenticated","app_metadata":{"role":"mecanico"}}', true);
SET LOCAL ROLE authenticated;
INSERT INTO t215 SELECT 'b_ve_antes', to_jsonb(count(*)) FROM public.requisicoes_pecas WHERE peca_nome LIKE 'T215%';
INSERT INTO public.requisicoes_pecas (numero_os, peca_nome, solicitante_id)
VALUES ('T215-OS', 'T215 Filtro', 't215-mec-a');
INSERT INTO t215 SELECT 'b_ve_depois', to_jsonb(count(*)) FROM public.requisicoes_pecas WHERE peca_nome LIKE 'T215%';
-- Mecânico não altera status (nem das próprias)
UPDATE public.requisicoes_pecas SET status = 'atendida' WHERE peca_nome = 'T215 Filtro';
RESET ROLE;

DO $$
DECLARE
  v record;
BEGIN
  SELECT * INTO v FROM public.requisicoes_pecas WHERE peca_nome = 'T215 Pastilha';
  IF v.solicitante_id IS DISTINCT FROM 't215-mec-a' OR v.status IS DISTINCT FROM 'aguardando_separacao'
     OR v.id IS NULL OR v.created_at IS NULL THEN
    RAISE EXCEPTION 'FALHA AC1/AC3: requisição de A com solicitante/status/id incorretos: % / %', v.solicitante_id, v.status;
  END IF;
  IF (SELECT valor FROM t215 WHERE caso = 'a_ve') <> to_jsonb(1) THEN
    RAISE EXCEPTION 'FALHA AC4: mecânico A deveria ver a própria requisição';
  END IF;
  IF (SELECT valor FROM t215 WHERE caso = 'b_ve_antes') <> to_jsonb(0) THEN
    RAISE EXCEPTION 'FALHA AC4 (D5): mecânico B viu requisição de A';
  END IF;
  SELECT * INTO v FROM public.requisicoes_pecas WHERE peca_nome = 'T215 Filtro';
  IF v.solicitante_id IS DISTINCT FROM 't215-mec-b' THEN
    RAISE EXCEPTION 'FALHA AC3: mecânico gravou em nome de outro (solicitante=%)', v.solicitante_id;
  END IF;
  IF (SELECT valor FROM t215 WHERE caso = 'b_ve_depois') <> to_jsonb(1) THEN
    RAISE EXCEPTION 'FALHA AC4 (D5): mecânico B deveria ver só a própria (1)';
  END IF;
  IF v.status IS DISTINCT FROM 'aguardando_separacao' THEN
    RAISE EXCEPTION 'FALHA AC4: mecânico não deveria alterar status';
  END IF;
  RAISE NOTICE 'OK AC1/AC3/AC4: autoria pela sessão, sem se passar por outro, D5 e sem UPDATE do mecânico';
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Mecânico sem vínculo de funcionário não cria requisição órfã
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims',
  '{"sub":"a1515151-0000-0000-0000-0000000000ff","role":"authenticated","app_metadata":{"role":"mecanico"}}', true);
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  INSERT INTO public.requisicoes_pecas (peca_nome) VALUES ('T215 Órfã');
  RAISE EXCEPTION 'FALHA AC4: mecânico sem vínculo criou requisição';
EXCEPTION WHEN insufficient_privilege THEN NULL;
END;
$$;
RESET ROLE;

-- ------------------------------------------------------------------------------
-- 4. Secretaria vê todas e atende; anon não vê nada
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims',
  '{"sub":"a1515151-0000-0000-0000-0000000000cc","role":"authenticated","app_metadata":{"role":"secretaria"}}', true);
SET LOCAL ROLE authenticated;
INSERT INTO t215 SELECT 'sec_ve', to_jsonb(count(*)) FROM public.requisicoes_pecas WHERE peca_nome LIKE 'T215%';
UPDATE public.requisicoes_pecas SET status = 'atendida' WHERE peca_nome = 'T215 Pastilha';
DO $$
BEGIN
  INSERT INTO public.requisicoes_pecas (peca_nome) VALUES ('T215 Secretaria');
  RAISE EXCEPTION 'FALHA AC4: secretaria não deveria criar requisição (só atender)';
EXCEPTION WHEN insufficient_privilege THEN NULL;
END;
$$;
RESET ROLE;

SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SET LOCAL ROLE anon;
DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM public.requisicoes_pecas;
  IF n > 0 THEN
    RAISE EXCEPTION 'FALHA AC4: anon leu % requisições', n;
  END IF;
EXCEPTION WHEN insufficient_privilege THEN NULL;
END;
$$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT valor FROM t215 WHERE caso = 'sec_ve') <> to_jsonb(2) THEN
    RAISE EXCEPTION 'FALHA AC4: secretaria deveria ver as 2 requisições';
  END IF;
  IF (SELECT status FROM public.requisicoes_pecas WHERE peca_nome = 'T215 Pastilha') <> 'atendida' THEN
    RAISE EXCEPTION 'FALHA AC4: secretaria deveria conseguir atender';
  END IF;
  RAISE NOTICE 'OK AC4: secretaria vê todas e atende; não cria; anon sem acesso';
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. AC5/AC6 — auditoria e updated_at; 'atendida' não gera movimentação de estoque
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_req text := (SELECT id FROM public.requisicoes_pecas WHERE peca_nome = 'T215 Pastilha');
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.audit_logs WHERE tabela = 'requisicoes_pecas' AND registro_id = v_req AND operacao = 'INSERT'
                 AND usuario_papel = 'mecanico') THEN
    RAISE EXCEPTION 'FALHA AC5: INSERT do mecânico não auditado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.audit_logs WHERE tabela = 'requisicoes_pecas' AND registro_id = v_req AND operacao = 'UPDATE'
                 AND usuario_papel = 'secretaria' AND valor_novo ->> 'status' = 'atendida') THEN
    RAISE EXCEPTION 'FALHA AC5: atendimento da secretaria não auditado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_requisicoes_pecas' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'FALHA AC5: trigger de updated_at ausente';
  END IF;
  IF to_regclass('public.estoque_movimentacoes') IS NOT NULL
     AND EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
                 WHERE c.relname = 'requisicoes_pecas' AND NOT t.tgisinternal
                   AND t.tgname NOT IN ('trg_requisicoes_pecas_solicitante', 'trg_set_updated_at_requisicoes_pecas',
                                        'trg_audit_requisicoes_pecas')) THEN
    RAISE EXCEPTION 'FALHA AC6: trigger inesperada em requisicoes_pecas (atendida não deve mexer no estoque)';
  END IF;
  RAISE NOTICE 'OK AC5/AC6: auditoria por papel, updated_at e nenhum gatilho de estoque';
END;
$$;

ROLLBACK;
