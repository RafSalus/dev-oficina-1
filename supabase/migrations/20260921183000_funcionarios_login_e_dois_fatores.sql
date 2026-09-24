-- Story: Login e cadastro de funcionários (mecânico, secretária, gerente, analista, aux. mecânico)
-- com provisionamento de conta real no Supabase Auth via Edge Function e 2FA obrigatório.
--
-- 1. Substitui o conjunto de cargos por: analista, gerente, mecanico, aux_mecanico, secretaria.
--    - analista: mesmo acesso do admin (portal /gestao)
--    - gerente, mecanico, aux_mecanico: mesmo acesso do mecânico (portal /mecanico)
--    - secretaria: portal /secretaria
-- 2. Adiciona auth_user_id, ligando o registro de RH à conta real de login (auth.users).
-- 3. Remove os dados de exemplo (mock) inseridos na migração inicial — mantém apenas o
--    registro real do admin proprietário (Rafael Amaral Salustiano), já provisionado no
--    Supabase Auth com o UUID abaixo (ver docs/handoff/handoff-waves-1-4.md).

BEGIN;

-- Dados de exemplo (mock) da migração inicial não são mais necessários.
DELETE FROM public.funcionarios;

ALTER TABLE public.funcionarios
  DROP CONSTRAINT IF EXISTS funcionarios_cargo_check;

ALTER TABLE public.funcionarios
  ADD CONSTRAINT funcionarios_cargo_check
  CHECK (cargo IN ('analista', 'gerente', 'mecanico', 'aux_mecanico', 'secretaria'));

ALTER TABLE public.funcionarios
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.funcionarios.auth_user_id IS
  'Vincula o registro de RH à conta de login real (auth.users). NULL até que o admin clique em "Criar acesso" e a Edge Function criar-login-funcionario provisione a conta.';

-- Registro real do administrador/proprietário (não é mock — conta já existe no Supabase Auth).
INSERT INTO public.funcionarios (
  id, nome, cpf, telefone, cargo, cargo_label, especialidade, email,
  data_admissao, horario_trabalho, ativo, observacoes, auth_user_id
) VALUES (
  'admin-rafael',
  'Rafael Amaral Salustiano',
  '401.928.374-55',
  '(43) 99185-1501',
  'analista',
  'Administrador & Proprietário',
  'Direção Geral, Diagnóstico Avançado e Gestão da Oficina',
  'rtzrafael@gmail.com',
  '2020-01-01',
  'Integral / Acesso 24h',
  true,
  'Sócio-proprietário e Administrador do Sistema.',
  'b0815410-e82e-4034-aa87-567faf2f6500'
)
ON CONFLICT (id) DO UPDATE SET
  cargo = EXCLUDED.cargo,
  cargo_label = EXCLUDED.cargo_label,
  auth_user_id = EXCLUDED.auth_user_id;

COMMIT;
