-- ==============================================================================
-- Story 2.7: Migração dos Catálogos de Peças, Serviços e Terceiros para Supabase Postgres
-- RLS FR25: Permissões de INSERT e UPDATE para Secretaria com janela operacional (D4)
-- ==============================================================================

BEGIN;

-- 1. Defaults de id para gen_random_uuid()::text caso não existam --------------
ALTER TABLE public.pecas
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.servicos
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.terceiros
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 2. Limpeza prévia para garantir idempotência --------------------------------
DROP POLICY IF EXISTS "Secretaria grava pecas" ON public.pecas;
DROP POLICY IF EXISTS "Secretaria atualiza pecas" ON public.pecas;
DROP POLICY IF EXISTS "Secretaria grava servicos" ON public.servicos;
DROP POLICY IF EXISTS "Secretaria atualiza servicos" ON public.servicos;
DROP POLICY IF EXISTS "Secretaria grava terceiros" ON public.terceiros;
DROP POLICY IF EXISTS "Secretaria atualiza terceiros" ON public.terceiros;

-- 3. RLS FR25: Secretaria ganha INSERT e UPDATE nas 3 tabelas com janela D4 ---
-- (08:00 às 18:59 em America/Sao_Paulo via public.em_horario_operacional())

-- 3.1. Peças
CREATE POLICY "Secretaria grava pecas" ON public.pecas FOR INSERT TO authenticated
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

CREATE POLICY "Secretaria atualiza pecas" ON public.pecas FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  )
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

-- 3.2. Serviços
CREATE POLICY "Secretaria grava servicos" ON public.servicos FOR INSERT TO authenticated
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

CREATE POLICY "Secretaria atualiza servicos" ON public.servicos FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  )
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

-- 3.3. Terceiros
CREATE POLICY "Secretaria grava terceiros" ON public.terceiros FOR INSERT TO authenticated
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

CREATE POLICY "Secretaria atualiza terceiros" ON public.terceiros FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  )
  WITH CHECK (
    public.papel_usuario() = 'secretaria'
    AND public.em_horario_operacional()
  );

COMMIT;
