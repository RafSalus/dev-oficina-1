/**
 * Mapeadores puros entre o modelo do frontend e a tabela public.estoque_movimentacoes do Postgres (Story 2.8).
 */

/**
 * Converte objeto de movimentação de estoque do frontend para o formato Postgres.
 * @param {object} mov
 * @returns {object}
 */
export function movimentacaoParaLinha(mov) {
  if (!mov || typeof mov !== 'object') return {}

  const tipoRaw = (mov.tipo || '').toLowerCase().trim()
  const tipo = tipoRaw === 'entrada' ? 'entrada' : tipoRaw === 'saida' ? 'saida' : 'ajuste'
  const quantidade = Math.max(1, Math.round(Number(mov.quantidade) || 0))

  const linha = {
    peca_id: mov.pecaId || mov.peca_id,
    tipo,
    quantidade,
    motivo: (mov.motivo || '').trim() || null,
    documento_ref: (mov.documentoRef || mov.documento || '').trim() || null,
    usuario: (mov.usuario || mov.responsavel || '').trim() || null,
    ordem_servico_id: mov.ordemServicoId || mov.ordem_servico_id || null,
    os_item_id: mov.osItemId || mov.os_item_id || null,
  }

  const id = mov.id || mov.value
  if (id && !String(id).startsWith('mov-')) {
    linha.id = String(id)
  }

  return linha
}

/**
 * Converte linha de public.estoque_movimentacoes para o formato do frontend.
 * @param {object} linha
 * @returns {object}
 */
export function linhaParaMovimentacao(linha) {
  if (!linha || typeof linha !== 'object') return null

  const dataHora = linha.created_at || new Date().toISOString()
  const pecaInfo = linha.peca || linha.pecas || {}

  return {
    id: linha.id,
    pecaId: linha.peca_id,
    peca_id: linha.peca_id,
    pecaCodigo: pecaInfo.codigo || linha.peca_codigo || '',
    pecaNome: pecaInfo.nome || linha.peca_nome || '',
    tipo: linha.tipo,
    quantidade: Number(linha.quantidade) || 0,
    motivo: linha.motivo || '',
    documento: linha.documento_ref || '',
    documentoRef: linha.documento_ref || '',
    responsavel: linha.usuario || 'Sistema',
    usuario: linha.usuario || 'Sistema',
    ordemServicoId: linha.ordem_servico_id || null,
    osItemId: linha.os_item_id || null,
    dataHora,
    data: dataHora,
    createdAt: dataHora,
  }
}
