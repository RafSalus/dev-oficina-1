/**
 * Cálculos e filtros puros da tela de Compras e Cotações (Story 2.0 / ADR-003).
 * Sem efeitos colaterais: recebem listas já carregadas e devolvem dados derivados.
 */

const formatarMoeda = (valor) =>
  valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const STATUS_PEDIDO_EM_ABERTO = ['AGUARDANDO_ENTREGA', 'EM_COTACAO']
const STATUS_COTACAO_ATIVA = ['EM_COTACAO', 'RESPONDIDA']

const contem = (valor, termo) => valor?.toLowerCase().includes(termo)

/**
 * Peça com saldo menor ou igual ao estoque mínimo.
 * @param {object} p - Peça do catálogo.
 * @returns {boolean}
 */
export function estaAbaixoDoMinimo(p) {
  return (Number(p.estoqueAtual) || 0) <= (Number(p.estoqueMinimo) || 0)
}

/**
 * Indicadores executivos do topo da tela de Compras.
 * @param {{pedidos: Array, cotacoes: Array, demandasOS: Array, pecasCatalogo: Array}} dados
 * @returns {{pedidosEmAberto: number, cotacoesAtivas: number, demandasPendentes: number,
 *   valorEmAberto: string, itensAbaixoMinimo: number, valorRecebidoTotal: string}}
 */
export function calcularMetricasCompras({ pedidos, cotacoes, demandasOS, pecasCatalogo }) {
  const emAberto = pedidos.filter((p) => STATUS_PEDIDO_EM_ABERTO.includes(p.status))
  const somaValores = (lista) => lista.reduce((acc, p) => acc + (Number(p.valorTotal) || 0), 0)

  return {
    pedidosEmAberto: emAberto.length,
    cotacoesAtivas: cotacoes.filter((c) => STATUS_COTACAO_ATIVA.includes(c.status)).length,
    demandasPendentes: demandasOS.filter((d) => d.precisaComprar).length,
    valorEmAberto: formatarMoeda(somaValores(emAberto)),
    itensAbaixoMinimo: pecasCatalogo.filter(estaAbaixoDoMinimo).length,
    valorRecebidoTotal: formatarMoeda(somaValores(pedidos.filter((p) => p.status === 'RECEBIDO'))),
  }
}

/**
 * Itens do catálogo que precisam de reposição, com déficit e sugestão de compra,
 * ordenados do menor saldo para o maior.
 * @param {Array<object>} pecasCatalogo
 * @returns {Array<object>}
 */
export function calcularItensReposicao(pecasCatalogo) {
  return pecasCatalogo
    .filter(estaAbaixoDoMinimo)
    .map((p) => {
      const atual = Number(p.estoqueAtual) || 0
      const min = Number(p.estoqueMinimo) || 0
      const deficit = Math.max(0, min - atual)
      const sugestao = deficit > 0 ? deficit + min : min
      return { ...p, atual, min, deficit, sugestao, custoTotal: sugestao * (Number(p.precoCusto) || 0) }
    })
    .sort((a, b) => a.atual - b.atual)
}

/**
 * Filtra pedidos de compra por busca textual, status e fornecedor.
 * @param {Array<object>} pedidos
 * @param {{busca: string, status: string, fornecedorId: string}} filtros
 * @returns {Array<object>}
 */
export function filtrarPedidos(pedidos, { busca, status, fornecedorId }) {
  const termo = busca.toLowerCase().trim()
  return pedidos.filter((pedido) => {
    const matchBusca =
      !termo ||
      ['numeroPedido', 'fornecedorNome', 'clienteNome', 'numeroOS', 'veiculoPlaca', 'responsavel'].some(
        (campo) => contem(pedido[campo], termo)
      )
    const matchStatus = status === 'TODOS' || pedido.status === status
    const matchFornecedor = fornecedorId === 'TODOS' || pedido.fornecedorId === fornecedorId
    return matchBusca && matchStatus && matchFornecedor
  })
}

/**
 * Filtra demandas de peças das OSs por busca textual.
 * @param {Array<object>} demandas
 * @param {string} busca
 * @returns {Array<object>}
 */
export function filtrarDemandas(demandas, busca) {
  const termo = busca.toLowerCase().trim()
  if (!termo) return demandas
  return demandas.filter((d) =>
    ['numeroOS', 'clienteNome', 'veiculoPlaca', 'veiculoModelo', 'itemNome', 'itemCodigo'].some((campo) =>
      contem(d[campo], termo)
    )
  )
}

/**
 * Filtra cotações por busca (dados da cotação ou das peças) e status.
 * @param {Array<object>} cotacoes
 * @param {{busca: string, status: string}} filtros
 * @returns {Array<object>}
 */
export function filtrarCotacoes(cotacoes, { busca, status }) {
  const termo = busca.toLowerCase().trim()
  return cotacoes.filter((cotacao) => {
    const matchBusca =
      !termo ||
      ['id', 'numeroOS', 'clienteNome', 'veiculoPlaca', 'veiculoModelo'].some((campo) =>
        contem(cotacao[campo], termo)
      ) ||
      (cotacao.itens || []).some(
        (it) => contem(it.nome, termo) || contem(it.codigo, termo) || contem(it.marcaSugerida, termo)
      )
    const matchStatus = status === 'TODOS' || cotacao.status === status
    return matchBusca && matchStatus
  })
}
