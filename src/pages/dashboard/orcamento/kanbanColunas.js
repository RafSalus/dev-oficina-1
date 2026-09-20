// Definição das colunas do Kanban de Ordens de Serviço.
// Os títulos aqui são só de exibição — desacoplados do `label` de STATUS_ORCAMENTO
// (mockOrdensAbertas.js), que continua sendo usado no filtro da lista, no Portal do
// Mecânico e no Portal do Cliente sem nenhuma alteração.
export const KANBAN_COLUNAS_OS = [
  { status: 'fila', titulo: 'Fila' },
  { status: 'em_diagnostico', titulo: 'Diagnóstico' },
  { status: 'aguardando_pecas', titulo: 'Cotação' },
  { status: 'terceirizado', titulo: 'Terceirizado' },
  { status: 'aguardando_aprovacao', titulo: 'Aprovação' },
  { status: 'aprovado_execucao', titulo: 'Execução' },
  { status: 'pronto_retirada', titulo: 'Finalizar' },
]
