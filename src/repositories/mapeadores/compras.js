/**
 * Mapeadores bidirecionais para Compras (Pedidos) e Cotações
 * Story 2.9: Conformidade com ADR-005 e NFR17
 */

// Mapeamento de status compras_pedidos
const STATUS_PEDIDO_DB_PARA_DOMINIO = {
  entregue: 'RECEBIDO',
  aprovado: 'AGUARDANDO_ENTREGA',
  cancelado: 'CANCELADO',
  pendente: 'RASCUNHO',
}

const STATUS_PEDIDO_DOMINIO_PARA_DB = {
  RECEBIDO: 'entregue',
  AGUARDANDO_ENTREGA: 'aprovado',
  CANCELADO: 'cancelado',
  RASCUNHO: 'pendente',
  EM_COTACAO: 'pendente',
  TODOS: 'pendente',
}

// Mapeamento de status compras_cotacoes (AC3: CANCELADA <-> cancelada)
const STATUS_COTACAO_DB_PARA_DOMINIO = {
  em_cotacao: 'EM_COTACAO',
  respondida: 'RESPONDIDA',
  aprovada: 'APROVADA',
  cancelada: 'CANCELADA',
}

const STATUS_COTACAO_DOMINIO_PARA_DB = {
  EM_COTACAO: 'em_cotacao',
  RESPONDIDA: 'respondida',
  APROVADA: 'aprovada',
  CANCELADA: 'cancelada',
}

export function mapearStatusPedidoParaDominio(statusDb, metadata = {}) {
  if (statusDb === 'pendente' && metadata.statusOriginal === 'EM_COTACAO') {
    return 'EM_COTACAO'
  }
  return STATUS_PEDIDO_DB_PARA_DOMINIO[statusDb] || statusDb || 'RASCUNHO'
}

export function mapearStatusPedidoParaDb(statusDominio) {
  if (['pendente', 'aprovado', 'entregue', 'cancelado'].includes(statusDominio)) {
    return statusDominio
  }
  return STATUS_PEDIDO_DOMINIO_PARA_DB[statusDominio] || 'pendente'
}

export function mapearStatusCotacaoParaDominio(statusDb) {
  return STATUS_COTACAO_DB_PARA_DOMINIO[statusDb] || String(statusDb || 'em_cotacao').toUpperCase()
}

export function mapearStatusCotacaoParaDb(statusDominio) {
  if (['em_cotacao', 'respondida', 'aprovada', 'cancelada'].includes(statusDominio)) {
    return statusDominio
  }
  return STATUS_COTACAO_DOMINIO_PARA_DB[statusDominio] || String(statusDominio || 'em_cotacao').toLowerCase()
}

/**
 * Converte linha do banco (compras_pedidos) para formato do domínio
 */
export function mapearPedidoParaDominio(registroDb) {
  if (!registroDb) return null
  const meta = registroDb.metadata || {}

  return {
    id: registroDb.id,
    numeroPedido: registroDb.numero_pedido,
    fornecedorId: registroDb.fornecedor_id,
    fornecedorNome: meta.fornecedorNome || '',
    origemTipo: meta.origemTipo || (registroDb.ordem_servico_ref ? 'ORDEM_SERVICO' : 'REPOSICAO_ESTOQUE'),
    numeroOS: registroDb.ordem_servico_ref || meta.numeroOS || '',
    clienteNome: meta.clienteNome || '',
    veiculoPlaca: meta.veiculoPlaca || '',
    veiculoModelo: meta.veiculoModelo || '',
    status: mapearStatusPedidoParaDominio(registroDb.status, meta),
    dataEmissao: registroDb.created_at,
    previsaoEntrega: registroDb.data_previsao_entrega || meta.previsaoEntrega || '',
    formaPagamento: meta.formaPagamento || 'Boleto 30 Dias',
    observacoes: meta.observacoes || '',
    responsavel: meta.responsavel || 'Rafael Almoxarife',
    itens: Array.isArray(registroDb.itens) ? registroDb.itens : [],
    valorTotal: Number(registroDb.valor_total) || 0,
    dataRecebimento: meta.dataRecebimento || null,
    documentoEntrada: meta.documentoEntrada || null,
    createdAt: registroDb.created_at,
    updatedAt: registroDb.updated_at,
  }
}

/**
 * Converte objeto do domínio (pedido) para formato do banco (compras_pedidos)
 */
export function mapearPedidoParaDb(pedido) {
  if (!pedido) return null

  const dados = {
    fornecedor_id: pedido.fornecedorId || null,
    status: mapearStatusPedidoParaDb(pedido.status),
    itens: Array.isArray(pedido.itens) ? pedido.itens : [],
    valor_total: Number(pedido.valorTotal) || 0,
    data_previsao_entrega: pedido.previsaoEntrega || null,
    ordem_servico_ref: pedido.numeroOS || pedido.ordem_servico_ref || null,
    metadata: {
      fornecedorNome: pedido.fornecedorNome || '',
      origemTipo: pedido.origemTipo || (pedido.numeroOS ? 'ORDEM_SERVICO' : 'REPOSICAO_ESTOQUE'),
      numeroOS: pedido.numeroOS || '',
      clienteNome: pedido.clienteNome || '',
      veiculoPlaca: pedido.veiculoPlaca || '',
      veiculoModelo: pedido.veiculoModelo || '',
      formaPagamento: pedido.formaPagamento || 'Boleto 30 Dias',
      observacoes: pedido.observacoes || '',
      responsavel: pedido.responsavel || 'Rafael Almoxarife',
      statusOriginal: pedido.status,
      dataRecebimento: pedido.dataRecebimento || null,
      documentoEntrada: pedido.documentoEntrada || null,
    },
  }

  if (pedido.id) dados.id = pedido.id
  if (pedido.numeroPedido) dados.numero_pedido = pedido.numeroPedido

  return dados
}

/**
 * Converte linha do banco (compras_cotacoes) para formato do domínio
 */
export function mapearCotacaoParaDominio(registroDb) {
  if (!registroDb) return null
  const meta = registroDb.metadata || {}

  return {
    id: registroDb.id,
    numeroCotacao: registroDb.numero_cotacao,
    numeroOS: registroDb.ordem_servico_ref || meta.numeroOS || '',
    clienteNome: meta.clienteNome || '',
    clienteTelefone: meta.clienteTelefone || '',
    veiculoPlaca: meta.veiculoPlaca || '',
    veiculoModelo: meta.veiculoModelo || '',
    status: mapearStatusCotacaoParaDominio(registroDb.status),
    fornecedorVencedorId: meta.fornecedorVencedorId || null,
    fornecedorVencedorNome: meta.fornecedorVencedorNome || '',
    observacoes: meta.observacoes || '',
    itens: Array.isArray(registroDb.itens) ? registroDb.itens : [],
    fornecedoresCotados: Array.isArray(registroDb.propostas_fornecedores) ? registroDb.propostas_fornecedores : [],
    dataCriacao: registroDb.created_at,
    updatedAt: registroDb.updated_at,
  }
}

/**
 * Converte objeto do domínio (cotação) para formato do banco (compras_cotacoes)
 */
export function mapearCotacaoParaDb(cotacao) {
  if (!cotacao) return null

  const dados = {
    ordem_servico_ref: cotacao.numeroOS || cotacao.ordem_servico_ref || null,
    status: mapearStatusCotacaoParaDb(cotacao.status),
    itens: Array.isArray(cotacao.itens) ? cotacao.itens : [],
    propostas_fornecedores: Array.isArray(cotacao.fornecedoresCotados)
      ? cotacao.fornecedoresCotados
      : (cotacao.propostas_fornecedores || []),
    metadata: {
      numeroOS: cotacao.numeroOS || '',
      clienteNome: cotacao.clienteNome || '',
      clienteTelefone: cotacao.clienteTelefone || '',
      veiculoPlaca: cotacao.veiculoPlaca || '',
      veiculoModelo: cotacao.veiculoModelo || '',
      fornecedorVencedorId: cotacao.fornecedorVencedorId || null,
      fornecedorVencedorNome: cotacao.fornecedorVencedorNome || '',
      observacoes: cotacao.observacoes || '',
      statusOriginal: cotacao.status,
    },
  }

  if (cotacao.id) dados.id = cotacao.id
  if (cotacao.numeroCotacao) dados.numero_cotacao = cotacao.numeroCotacao

  return dados
}
