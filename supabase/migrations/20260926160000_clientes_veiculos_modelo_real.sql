-- ==============================================================================
-- Story 2.5: Clientes e Veículos — Schema Alinhado ao Modelo Real e Repositórios
-- Autor: Dara (@data-engineer) / Dex (@dev)
--
-- 1. Sequences para código automático de cliente (inicia em 166) e veículo (inicia em 1)
-- 2. Alinhamento de colunas em public.clientes e public.veiculos ao modelo do front
-- 3. Defaults gen_random_uuid()::text para IDs
-- 4. Chave estrangeira veiculos.cliente_id com ON DELETE RESTRICT
-- 5. Função public.em_horario_operacional() (08:00 às 18:59, America/Sao_Paulo)
-- 6. RLS: Secretaria grava/atualiza veículos apenas dentro do horário operacional
-- 7. RLS: Ordem de serviço reutiliza em_horario_operacional()
-- 8. Atualização de public.fn_anonimizar_jsonb para incluir chassi e renavam (ADR-008 §3.4)
-- ==============================================================================

BEGIN;

-- 1. Sequências de códigos sequenciais -----------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.seq_codigo_cliente START WITH 166;
CREATE SEQUENCE IF NOT EXISTS public.seq_codigo_veiculo START WITH 1;

-- 2. Tabela public.clientes ---------------------------------------------------
ALTER TABLE public.clientes
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS codigo_cliente text UNIQUE NOT NULL DEFAULT lpad(nextval('public.seq_codigo_cliente')::text, 7, '0'),
  ADD COLUMN IF NOT EXISTS nome_fantasia text,
  ADD COLUMN IF NOT EXISTS rg_ie text,
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

DO $$
BEGIN
  ALTER SEQUENCE public.seq_codigo_cliente OWNED BY public.clientes.codigo_cliente;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMENT ON COLUMN public.clientes.codigo_cliente IS
  'Código sequencial de negócio (ex: 0000166) gerado pelo banco via sequence seq_codigo_cliente.';

-- 3. Tabela public.veiculos ---------------------------------------------------
ALTER TABLE public.veiculos
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.veiculos
  ADD COLUMN IF NOT EXISTS codigo_veiculo text UNIQUE NOT NULL DEFAULT 'VEIC-' || lpad(nextval('public.seq_codigo_veiculo')::text, 4, '0'),
  ADD COLUMN IF NOT EXISTS marca_codigo text,
  ADD COLUMN IF NOT EXISTS modelo_codigo text,
  ADD COLUMN IF NOT EXISTS ano_codigo text,
  ADD COLUMN IF NOT EXISTS chassi text,
  ADD COLUMN IF NOT EXISTS renavam text,
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

DO $$
BEGIN
  ALTER SEQUENCE public.seq_codigo_veiculo OWNED BY public.veiculos.codigo_veiculo;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMENT ON COLUMN public.veiculos.codigo_veiculo IS
  'Código sequencial de veículo na frota (ex: VEIC-0001) gerado pelo banco via sequence seq_codigo_veiculo.';

-- Alteração da FK cliente_id para ON DELETE RESTRICT (AC2)
ALTER TABLE public.veiculos
  DROP CONSTRAINT IF EXISTS veiculos_cliente_id_fkey;

ALTER TABLE public.veiculos
  ADD CONSTRAINT veiculos_cliente_id_fkey
  FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;

-- 4. Função de janela operacional (AC3, ADR-005 §2.10) ------------------------
CREATE OR REPLACE FUNCTION public.em_horario_operacional()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') >= 8
     AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') < 19;
$$;

COMMENT ON FUNCTION public.em_horario_operacional() IS
  'Verifica se o momento atual está no horário comercial (08:00 às 18:59 em America/Sao_Paulo).';

GRANT EXECUTE ON FUNCTION public.em_horario_operacional() TO authenticated, anon, service_role;

-- 5. RLS: Veículos com restrição de horário para secretaria (AC3, AC4) --------
DROP POLICY IF EXISTS "Secretaria grava veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Secretaria atualiza veiculos" ON public.veiculos;

CREATE POLICY "Secretaria grava veiculos" ON public.veiculos FOR INSERT TO authenticated
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

CREATE POLICY "Secretaria atualiza veiculos" ON public.veiculos FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  )
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

-- 6. RLS: Ordens de serviço reaproveitando em_horario_operacional() (AC3) ------
DROP POLICY IF EXISTS "Operadores atualizam OS em horario comercial" ON public.ordens_servico;

CREATE POLICY "Operadores atualizam OS em horario comercial" ON public.ordens_servico FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() IN ('secretaria', 'mecanico')
    AND public.em_horario_operacional()
  )
  WITH CHECK (
    public.papel_usuario() IN ('secretaria', 'mecanico')
    AND public.em_horario_operacional()
  );

-- 7. LGPD / ADR-008 §3.4: Anonimização com chassi e renavam (Task 6) ----------
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
                 'complemento', 'bairro', 'cep', 'data_nascimento', 'snapshot_cliente',
                 'chassi', 'renavam'
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

COMMIT;
