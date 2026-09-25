-- Remove os registros de demonstração (mock) inseridos pela migration 20260921_initial_schema.sql.
-- Preserva o administrador real (admin-rafael).

-- Desvincula referências antes de excluir
UPDATE public.ordens_servico
SET mecanico_id = NULL
WHERE mecanico_id IN (
  'mec-carlos', 'mec-gabriel', 'mec-rafael', 'mec-rodrigo',
  'mec-danilo', 'mec-lucas', 'func-mariana', 'func-roberto'
);

UPDATE public.compras_pedidos
SET fornecedor_id = NULL
WHERE fornecedor_id IN ('terc-001', 'terc-002');

-- Funcionários de exemplo
DELETE FROM public.funcionarios
WHERE id IN (
  'mec-carlos', 'mec-gabriel', 'mec-rafael', 'mec-rodrigo',
  'mec-danilo', 'mec-lucas', 'func-mariana', 'func-roberto'
);

-- Peças de exemplo (movimentações de estoque vinculadas são removidas em cascata)
DELETE FROM public.pecas
WHERE id IN ('peca-001', 'peca-002', 'peca-003', 'peca-004', 'peca-005');

-- Serviços de exemplo
DELETE FROM public.servicos
WHERE id IN ('serv-001', 'serv-002', 'serv-003', 'serv-004', 'serv-005');

-- Terceiros de exemplo
DELETE FROM public.terceiros
WHERE id IN ('terc-001', 'terc-002');
