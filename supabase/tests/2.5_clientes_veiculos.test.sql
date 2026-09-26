-- ==============================================================================
-- Verificação da Story 2.5 — Clientes e Veículos (Schema, Sequences, FK, RLS)
--
-- Transacional com ROLLBACK no final: nada persiste no banco.
-- Uso: supabase db query --linked -f supabase/tests/2.5_clientes_veiculos.test.sql
-- ==============================================================================

BEGIN;

CREATE TEMP TABLE t25_resultados (
  teste text PRIMARY KEY,
  passou boolean,
  detalhe text
) ON COMMIT DROP;
GRANT ALL ON t25_resultados TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 1. Defaults e Sequences: clientes e veiculos
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_cli1 RECORD;
  v_cli2 RECORD;
  v_veic1 RECORD;
  v_veic2 RECORD;
BEGIN
  -- Clientes
  INSERT INTO public.clientes (nome, cpf_cnpj, telefone)
  VALUES ('Cliente Teste 1', '00000000001', '(43) 99999-0001')
  RETURNING * INTO v_cli1;

  INSERT INTO public.clientes (nome, cpf_cnpj, telefone)
  VALUES ('Cliente Teste 2', '00000000002', '(43) 99999-0002')
  RETURNING * INTO v_cli2;

  IF v_cli1.id IS NULL OR length(v_cli1.id) < 10 THEN
    RAISE EXCEPTION 'FALHA AC1: id de cliente não gerou UUID por default, veio %', v_cli1.id;
  END IF;

  IF v_cli1.codigo_cliente IS NULL OR length(v_cli1.codigo_cliente) <> 7 THEN
    RAISE EXCEPTION 'FALHA AC1: codigo_cliente não foi gerado com 7 digitos: %', v_cli1.codigo_cliente;
  END IF;

  IF v_cli1.ativo IS NOT TRUE THEN
    RAISE EXCEPTION 'FALHA AC1: ativo não veio true por padrão';
  END IF;

  -- Veículos
  INSERT INTO public.veiculos (cliente_id, placa, marca, modelo)
  VALUES (v_cli1.id, 'TST0001', 'Fiat', 'Uno')
  RETURNING * INTO v_veic1;

  INSERT INTO public.veiculos (cliente_id, placa, marca, modelo)
  VALUES (v_cli1.id, 'TST0002', 'VW', 'Gol')
  RETURNING * INTO v_veic2;

  IF v_veic1.id IS NULL OR length(v_veic1.id) < 10 THEN
    RAISE EXCEPTION 'FALHA AC2: id de veiculo não gerou UUID por default, veio %', v_veic1.id;
  END IF;

  IF v_veic1.codigo_veiculo NOT LIKE 'VEIC-%' THEN
    RAISE EXCEPTION 'FALHA AC2: codigo_veiculo deve iniciar com VEIC-, veio %', v_veic1.codigo_veiculo;
  END IF;

  IF v_veic1.ativo IS NOT TRUE THEN
    RAISE EXCEPTION 'FALHA AC2: ativo de veiculo não veio true por padrão';
  END IF;

  INSERT INTO t25_resultados VALUES ('defaults_sequences', true, 'Clientes e veículos geraram ID e código por sequence');
END $$;

-- ------------------------------------------------------------------------------
-- 2. FK veiculos.cliente_id com ON DELETE RESTRICT (AC2)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_cli_id text;
  v_pegou_restrict boolean := false;
BEGIN
  INSERT INTO public.clientes (nome, cpf_cnpj, telefone)
  VALUES ('Cliente FK Teste', '00000000003', '(43) 99999-0003')
  RETURNING id INTO v_cli_id;

  INSERT INTO public.veiculos (cliente_id, placa, marca, modelo)
  VALUES (v_cli_id, 'FK00001', 'Chevrolet', 'Onix');

  BEGIN
    DELETE FROM public.clientes WHERE id = v_cli_id;
  EXCEPTION WHEN foreign_key_violation THEN
    v_pegou_restrict := true;
  END;

  IF NOT v_pegou_restrict THEN
    RAISE EXCEPTION 'FALHA AC2: exclusão de cliente com veículo vinculado não acionou ON DELETE RESTRICT (23503)';
  END IF;

  INSERT INTO t25_resultados VALUES ('fk_restrict', true, 'ON DELETE RESTRICT bloqueou exclusão de cliente com veículo');
END $$;

-- ------------------------------------------------------------------------------
-- 3. RLS - Papel Mecânico (AC4: mecânico SELECT; sem INSERT/UPDATE/DELETE)
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated","app_metadata":{"role":"mecanico"}}', true);
SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_pode_ler boolean := false;
  v_bloqueou_insert_cli boolean := false;
  v_bloqueou_insert_veic boolean := false;
BEGIN
  -- Leitura
  PERFORM count(*) FROM public.clientes;
  PERFORM count(*) FROM public.veiculos;
  v_pode_ler := true;

  -- Tentativa de escrita em clientes
  BEGIN
    INSERT INTO public.clientes (nome, cpf_cnpj, telefone) VALUES ('Mec Invalido', '00000000004', '(43) 0000-0000');
  EXCEPTION WHEN insufficient_privilege THEN
    v_bloqueou_insert_cli := true;
  END;

  -- Tentativa de escrita em veículos
  BEGIN
    INSERT INTO public.veiculos (placa, marca, modelo) VALUES ('MEC0001', 'Ford', 'Ka');
  EXCEPTION WHEN insufficient_privilege THEN
    v_bloqueou_insert_veic := true;
  END;

  IF NOT (v_pode_ler AND v_bloqueou_insert_cli AND v_bloqueou_insert_veic) THEN
    RAISE EXCEPTION 'FALHA AC4: mecanico deveria ler mas não gravar clientes/veiculos';
  END IF;

  INSERT INTO t25_resultados VALUES ('rls_mecanico', true, 'Mecânico tem apenas SELECT em clientes e veículos');
END $$;

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 4. RLS - Papel Secretaria dentro do horário operacional (AC3, AC4)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.em_horario_operacional() RETURNS boolean LANGUAGE sql AS $$ SELECT true; $$;

SELECT set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated","app_metadata":{"role":"secretaria"}}', true);
SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_cli_id text;
  v_veic_id text;
  v_deleted int;
BEGIN
  -- Secretaria pode gravar cliente
  INSERT INTO public.clientes (nome, cpf_cnpj, telefone)
  VALUES ('Cliente Secretaria', '00000000005', '(43) 99999-0005')
  RETURNING id INTO v_cli_id;

  -- Secretaria pode atualizar cliente
  UPDATE public.clientes SET nome = 'Cliente Secretaria Atualizado' WHERE id = v_cli_id;

  -- Secretaria NÃO pode excluir cliente (RLS bloqueia: 0 linhas afetadas)
  DELETE FROM public.clientes WHERE id = v_cli_id;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 0 THEN
    RAISE EXCEPTION 'FALHA AC4: secretaria não deve conseguir excluir clientes (afetou % linhas)', v_deleted;
  END IF;
  PERFORM 1 FROM public.clientes WHERE id = v_cli_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'FALHA AC4: cliente foi indevidamente apagado por secretaria';
  END IF;

  -- Secretaria pode gravar veiculo no horário operacional
  INSERT INTO public.veiculos (cliente_id, placa, marca, modelo)
  VALUES (v_cli_id, 'SEC0001', 'Honda', 'Civic')
  RETURNING id INTO v_veic_id;

  -- Secretaria pode atualizar veiculo no horário operacional
  UPDATE public.veiculos SET cor = 'Preto' WHERE id = v_veic_id;

  -- Secretaria NÃO pode excluir veículo (RLS bloqueia: 0 linhas afetadas)
  DELETE FROM public.veiculos WHERE id = v_veic_id;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> 0 THEN
    RAISE EXCEPTION 'FALHA AC4: secretaria não deve conseguir excluir veiculos (afetou % linhas)', v_deleted;
  END IF;
  PERFORM 1 FROM public.veiculos WHERE id = v_veic_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'FALHA AC4: veiculo foi indevidamente apagado por secretaria';
  END IF;

  INSERT INTO t25_resultados VALUES ('rls_secretaria_horario_ok', true, 'Secretaria grava/atualiza clientes e veiculos; delete proibido');
END $$;

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 5. RLS - Papel Secretaria FORA do horário operacional (AC3)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.em_horario_operacional() RETURNS boolean LANGUAGE sql AS $$ SELECT false; $$;

SELECT set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated","app_metadata":{"role":"secretaria"}}', true);
SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_cli_id text;
  v_bloqueou_insert_veic boolean := false;
  v_updated int;
BEGIN
  -- Clientes NÃO tem janela operacional: secretaria continua podendo gravar cliente
  INSERT INTO public.clientes (nome, cpf_cnpj, telefone)
  VALUES ('Cliente Fora Horario', '00000000006', '(43) 99999-0006')
  RETURNING id INTO v_cli_id;

  -- Veículos TEM janela operacional: INSERT deve ser bloqueado com erro 42501
  BEGIN
    INSERT INTO public.veiculos (cliente_id, placa, marca, modelo)
    VALUES (v_cli_id, 'FORA001', 'Renault', 'Kwid');
  EXCEPTION WHEN insufficient_privilege THEN
    v_bloqueou_insert_veic := true;
  END;

  IF NOT v_bloqueou_insert_veic THEN
    RAISE EXCEPTION 'FALHA AC3: secretaria fora do horario deveria ser bloqueada no INSERT de veiculos';
  END IF;

  -- UPDATE em veículos existente também deve ser bloqueado por RLS (0 linhas qualificadas na política)
  UPDATE public.veiculos SET cor = 'Branco' WHERE placa = 'SEC0001';
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 0 THEN
    RAISE EXCEPTION 'FALHA AC3: secretaria fora do horario conseguiu atualizar veiculo (afetou % linhas)', v_updated;
  END IF;

  INSERT INTO t25_resultados VALUES ('rls_secretaria_fora_horario', true, 'Secretaria bloqueada em veiculos fora do horario; clientes liberado (D4)');
END $$;

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 6. RLS - Papel Admin tem acesso total mesmo fora de horário (AC4)
-- ------------------------------------------------------------------------------
SELECT set_config('request.jwt.claims',
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","app_metadata":{"role":"admin"}}', true);
SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_cli_id text;
  v_veic_id text;
BEGIN
  INSERT INTO public.clientes (nome, cpf_cnpj, telefone)
  VALUES ('Cliente Admin', '00000000007', '(43) 99999-0007')
  RETURNING id INTO v_cli_id;

  INSERT INTO public.veiculos (cliente_id, placa, marca, modelo)
  VALUES (v_cli_id, 'ADM0001', 'Toyota', 'Corolla')
  RETURNING id INTO v_veic_id;

  DELETE FROM public.veiculos WHERE id = v_veic_id;
  DELETE FROM public.clientes WHERE id = v_cli_id;

  INSERT INTO t25_resultados VALUES ('rls_admin_total', true, 'Admin possui permissão total irrestrita (inclusive DELETE)');
END $$;

RESET ROLE;

-- ------------------------------------------------------------------------------
-- 7. Task 6: Anonimização de chassi e renavam (ADR-008 §3.4)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_anonimizado jsonb;
BEGIN
  v_anonimizado := public.fn_anonimizar_jsonb(
    '{"chassi": "9BWZZZ377VT004251", "renavam": "12345678901", "placa": "ABC1234", "modelo": "Gol"}'::jsonb,
    false
  );

  IF v_anonimizado ->> 'chassi' <> '[anonimizado]' THEN
    RAISE EXCEPTION 'FALHA Task 6: chassi não foi anonimizado: %', v_anonimizado;
  END IF;

  IF v_anonimizado ->> 'renavam' <> '[anonimizado]' THEN
    RAISE EXCEPTION 'FALHA Task 6: renavam não foi anonimizado: %', v_anonimizado;
  END IF;

  IF v_anonimizado ->> 'placa' <> 'ABC1234' OR v_anonimizado ->> 'modelo' <> 'Gol' THEN
    RAISE EXCEPTION 'FALHA Task 6: dados não-pessoais do veículo foram alterados indevidamente';
  END IF;

  INSERT INTO t25_resultados VALUES ('anonimizacao_chassi_renavam', true, 'Chassi e Renavam anonimizados conforme ADR-008 §3.4');
END $$;

-- ------------------------------------------------------------------------------
-- Exibe relatório dos resultados
-- ------------------------------------------------------------------------------
SELECT teste, passou, detalhe FROM t25_resultados ORDER BY teste;

-- ------------------------------------------------------------------------------
-- Verificação de todos os resultados
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_total int;
  v_passaram int;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE passou) INTO v_total, v_passaram FROM t25_resultados;
  IF v_total < 6 OR v_passaram <> v_total THEN
    RAISE EXCEPTION 'FALHA na suíte de testes: % de % passaram', v_passaram, v_total;
  END IF;
  RAISE NOTICE 'SUCESSO: Todos os % testes da Story 2.5 passaram com perfeição.', v_total;
END $$;

ROLLBACK;
