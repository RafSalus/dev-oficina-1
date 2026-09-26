/**
 * Mapeadores bidirecionais de Requisições de Peças (Story 2.15 / ADR-005).
 * Conversão DB (snake_case, status em código) ↔ Domínio (camelCase, status em rótulo da UI).
 */

// A UI do mecânico grava e exibe o rótulo; o banco guarda o código (CHECK da tabela).
export const STATUS_REQUISICAO = {
  aguardando_separacao: 'Aguardando Separação',
  atendida: 'Atendida',
  recusada: 'Recusada',
  cancelada: 'Cancelada',
}

const CODIGO_POR_ROTULO = Object.fromEntries(
  Object.entries(STATUS_REQUISICAO).map(([codigo, rotulo]) => [rotulo, codigo])
)

export function statusParaCodigo(status) {
  if (!status) return 'aguardando_separacao'
  if (STATUS_REQUISICAO[status]) return status
  return CODIGO_POR_ROTULO[status] || null
}

export function statusParaRotulo(codigo) {
  return STATUS_REQUISICAO[codigo] || codigo || STATUS_REQUISICAO.aguardando_separacao
}

/** "dd/mm/aaaa hh:mm" no horário de Brasília, como a UI exibia antes. */
export function formatarDataHora(iso) {
  if (!iso) return ''
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return ''
  const dia = data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const hora = data.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
  return `${dia} ${hora}`
}

export function mapearRequisicaoParaDominio(db) {
  if (!db) return null
  return {
    id: db.id,
    ordemServicoId: db.ordem_servico_id || null,
    numeroOS: db.numero_os || '',
    veiculo: db.veiculo || '',
    pecaId: db.peca_id || null,
    pecaNome: db.peca_nome || '',
    codigoPeca: db.codigo_peca || '',
    quantidade: Number(db.quantidade) || 1,
    urgencia: db.urgencia || 'normal',
    solicitanteId: db.solicitante_id || null,
    mecanicoNome: db.solicitante_nome || '',
    status: statusParaRotulo(db.status),
    motivoRecusa: db.motivo_recusa || '',
    observacoes: db.observacoes || '',
    dataHora: formatarDataHora(db.created_at),
    criadoEm: db.created_at || null,
    atualizadoEm: db.updated_at || null,
  }
}

/** Dados de uma nova requisição → linha. id, solicitante_id e datas são definidos pelo banco. */
export function mapearNovaRequisicaoParaDb(dados) {
  return {
    ordem_servico_id: dados.ordemServicoId || null,
    numero_os: dados.numeroOS ? String(dados.numeroOS) : null,
    veiculo: dados.veiculo || null,
    peca_id: dados.pecaId || null,
    peca_nome: String(dados.pecaNome || '').trim(),
    codigo_peca: dados.codigoPeca || null,
    quantidade: Math.max(1, parseInt(dados.quantidade, 10) || 1),
    urgencia: dados.urgencia === 'urgente' ? 'urgente' : 'normal',
    solicitante_nome: dados.mecanicoNome || null,
    observacoes: dados.observacoes || null,
  }
}
