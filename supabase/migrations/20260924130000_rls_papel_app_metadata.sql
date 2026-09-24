-- Segurança: autorização por papel passa a usar app_metadata (gravável só pelo servidor).
--
-- Problema corrigido: todas as políticas liam auth.jwt() -> 'user_metadata' ->> 'role'.
-- user_metadata é editável pelo próprio usuário (supabase.auth.updateUser({ data: { role } })),
-- então qualquer conta autenticada podia se promover a 'admin' e ler/gravar tudo.
--
-- Também remove as políticas de leitura anônima, que expunham CPF, telefone e e-mail dos
-- funcionários e custos de peças/terceiros para qualquer portador da anon key (pública no bundle).
--
-- Após aplicar: usuários precisam sair e entrar novamente para receber o novo JWT.

BEGIN;

-- 1. Papel do usuário autenticado, lido de app_metadata ------------------------------------
CREATE OR REPLACE FUNCTION public.papel_usuario()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

COMMENT ON FUNCTION public.papel_usuario() IS
  'Papel (admin | secretaria | mecanico) do usuário atual, a partir de app_metadata. Nunca use user_metadata para autorização.';

-- 2. Migra o papel das contas existentes a partir do cargo cadastrado (fonte confiável) -----
UPDATE auth.users AS u
SET
  raw_app_meta_data = COALESCE(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role',
    CASE f.cargo
      WHEN 'analista' THEN 'admin'
      WHEN 'secretaria' THEN 'secretaria'
      ELSE 'mecanico'
    END
  ),
  raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) - 'role'
FROM public.funcionarios AS f
WHERE f.auth_user_id = u.id;

-- 3. Remove todas as políticas antigas -----------------------------------------------------
DROP POLICY IF EXISTS "Admin total funcionarios" ON public.funcionarios;
DROP POLICY IF EXISTS "Admin total clientes" ON public.clientes;
DROP POLICY IF EXISTS "Admin total veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Admin total pecas" ON public.pecas;
DROP POLICY IF EXISTS "Admin total servicos" ON public.servicos;
DROP POLICY IF EXISTS "Admin total terceiros" ON public.terceiros;
DROP POLICY IF EXISTS "Admin total estoque" ON public.estoque_movimentacoes;
DROP POLICY IF EXISTS "Admin total ordens_servico" ON public.ordens_servico;
DROP POLICY IF EXISTS "Admin total compras_pedidos" ON public.compras_pedidos;
DROP POLICY IF EXISTS "Admin total compras_cotacoes" ON public.compras_cotacoes;
DROP POLICY IF EXISTS "Admin total audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Equipe le clientes" ON public.clientes;
DROP POLICY IF EXISTS "Equipe le veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Equipe le pecas" ON public.pecas;
DROP POLICY IF EXISTS "Equipe le servicos" ON public.servicos;
DROP POLICY IF EXISTS "Equipe le terceiros" ON public.terceiros;
DROP POLICY IF EXISTS "Secretaria grava clientes" ON public.clientes;
DROP POLICY IF EXISTS "Secretaria atualiza clientes" ON public.clientes;
DROP POLICY IF EXISTS "Secretaria grava veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Secretaria atualiza veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Operadores atualizam OS em horario comercial" ON public.ordens_servico;
DROP POLICY IF EXISTS "Operadores leem OSs" ON public.ordens_servico;
DROP POLICY IF EXISTS "Public anon select pecas" ON public.pecas;
DROP POLICY IF EXISTS "Public anon select servicos" ON public.servicos;
DROP POLICY IF EXISTS "Public anon select terceiros" ON public.terceiros;
DROP POLICY IF EXISTS "Public anon select funcionarios" ON public.funcionarios;

-- 4. Administrador: acesso total (leitura e escrita) ---------------------------------------
CREATE POLICY "Admin total funcionarios" ON public.funcionarios FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total clientes" ON public.clientes FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total veiculos" ON public.veiculos FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total pecas" ON public.pecas FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total servicos" ON public.servicos FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total terceiros" ON public.terceiros FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total estoque" ON public.estoque_movimentacoes FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total ordens_servico" ON public.ordens_servico FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total compras_pedidos" ON public.compras_pedidos FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
CREATE POLICY "Admin total compras_cotacoes" ON public.compras_cotacoes FOR ALL TO authenticated
  USING (public.papel_usuario() = 'admin') WITH CHECK (public.papel_usuario() = 'admin');
-- Auditoria é imutável: admin apenas lê (gravação ocorre via triggers)
CREATE POLICY "Admin le audit_logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.papel_usuario() = 'admin');

-- 5. Equipe operacional: leitura de cadastros e catálogos ----------------------------------
CREATE POLICY "Equipe le clientes" ON public.clientes FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'mecanico'));
CREATE POLICY "Equipe le veiculos" ON public.veiculos FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'mecanico'));
CREATE POLICY "Equipe le pecas" ON public.pecas FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'mecanico'));
CREATE POLICY "Equipe le servicos" ON public.servicos FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'mecanico'));
CREATE POLICY "Equipe le terceiros" ON public.terceiros FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'mecanico'));

-- 6. Secretaria: cadastra e atualiza clientes e veículos -----------------------------------
CREATE POLICY "Secretaria grava clientes" ON public.clientes FOR INSERT TO authenticated
  WITH CHECK (public.papel_usuario() = 'secretaria');
CREATE POLICY "Secretaria atualiza clientes" ON public.clientes FOR UPDATE TO authenticated
  USING (public.papel_usuario() = 'secretaria') WITH CHECK (public.papel_usuario() = 'secretaria');
CREATE POLICY "Secretaria grava veiculos" ON public.veiculos FOR INSERT TO authenticated
  WITH CHECK (public.papel_usuario() = 'secretaria');
CREATE POLICY "Secretaria atualiza veiculos" ON public.veiculos FOR UPDATE TO authenticated
  USING (public.papel_usuario() = 'secretaria') WITH CHECK (public.papel_usuario() = 'secretaria');

-- 7. Ordens de serviço: equipe lê; altera somente em horário comercial (Gate G2.6) --------
CREATE POLICY "Operadores leem OSs" ON public.ordens_servico FOR SELECT TO authenticated
  USING (public.papel_usuario() IN ('secretaria', 'mecanico'));

CREATE POLICY "Operadores atualizam OS em horario comercial" ON public.ordens_servico FOR UPDATE TO authenticated
  USING (
    public.papel_usuario() IN ('secretaria', 'mecanico')
    AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') >= 8
    AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') < 19
  )
  WITH CHECK (
    public.papel_usuario() IN ('secretaria', 'mecanico')
    AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') >= 8
    AND EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo') < 19
  );

COMMIT;
