// Cálculos matemáticos/monetários de Ordens de Serviço, extraídos de
// ordensServicoRepository.js (Story 1.11). Funções puras, sem acesso a storage.
//
// Cada ponto de cálculo original do repositório tinha pequenas variações na fórmula
// (cadeia de fallback de preço diferente, com ou sem multiplicação por quantidade) —
// essas variações são preservadas aqui via os parâmetros passados por cada chamador,
// nunca forçadas a uma fórmula única, para não alterar nenhum valorTotal já calculado.

/**
 * Soma o total de uma lista de itens (peça/serviço/terceiro), aplicando
 * `preco * quantidade - desconto` por item (ou só `preco - desconto` quando
 * `comQuantidade: false`). `resolverPreco` decide qual campo (e cadeia de fallback)
 * cada chamador usa para o preço do item.
 */
export function calcularTotalItens(itens, resolverPreco, { comQuantidade = true } = {}) {
  return (itens || []).reduce((acc, item) => {
    const preco = parseFloat(resolverPreco(item)) || 0
    const qtd = comQuantidade ? parseFloat(item.quantidade) || 1 : 1
    const desconto = parseFloat(item.desconto) || 0
    return acc + (preco * qtd - desconto)
  }, 0)
}

/** Soma os 3 totais de categoria e aplica o desconto geral da OS, nunca abaixo de zero. */
export function calcularValorTotal({ totalPecas = 0, totalServicos = 0, totalTerceiros = 0 }, desconto) {
  return Math.max(0, totalPecas + totalServicos + totalTerceiros - (parseFloat(desconto) || 0))
}

/**
 * Soma o total de uma categoria de itens considerando apenas os itens ainda aprovados
 * (não recusados pelo cliente via `porItemMap`), com o valor de cada item já floorado em
 * zero individualmente — comportamento distinto de `calcularTotalItens`, onde o floor em
 * zero só é aplicado no total final via `calcularValorTotal`.
 */
export function calcularTotalCategoriaComAprovacao(itens, { resolverPreco, resolverId, prefixoId, porItemMap }) {
  return (itens || []).reduce((acc, item, idx) => {
    const itemId = resolverId ? resolverId(item, idx) : item.id || item.codigo || `${prefixoId}-${idx}`
    const resposta = porItemMap.get(itemId)
    if (resposta && resposta.respostaCliente === 'recusado') return acc
    const preco = parseFloat(resolverPreco(item)) || 0
    const qtd = parseFloat(item.quantidade) || 1
    const desconto = parseFloat(item.desconto) || 0
    return acc + Math.max(0, preco * qtd - desconto)
  }, 0)
}
