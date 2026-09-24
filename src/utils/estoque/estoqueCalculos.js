/**
 * Cálculos, filtros e textos puros do Estoque e Almoxarifado (Story 2.0 / ADR-003).
 */
import { calcularItensReposicao } from '../compras/comprasCalculos'

const formatarMoeda = (valor) =>
  valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const contem = (valor, termo) => valor?.toLowerCase().includes(termo)
const saldo = (p) => Number(p.estoqueAtual) || 0
const minimo = (p) => Number(p.estoqueMinimo) || 0

export const OPCOES_STATUS_ESTOQUE = [
  { value: 'TODOS', label: 'Todos os Níveis' },
  { value: 'ADEQUADO', label: 'Estoque Adequado' },
  { value: 'ALERTA_GERAL', label: 'Alerta de Reposição e Zerados' },
  { value: 'REPOSICAO', label: 'No ou Abaixo do Mínimo' },
  { value: 'ZERADO', label: 'Esgotados / Zerados' },
]

export const OPCOES_ORDENACAO_ESTOQUE = [
  { value: 'NOME_ASC', label: 'Nome (A - Z)' },
  { value: 'NOME_DESC', label: 'Nome (Z - A)' },
  { value: 'MAIOR_ESTOQUE', label: 'Maior Quantidade' },
  { value: 'MENOR_ESTOQUE', label: 'Menor Quantidade' },
  { value: 'MAIOR_VALOR', label: 'Maior Valor em Estoque' },
]

export const OPCOES_TIPO_MOVIMENTO = [
  { value: 'TODOS', label: 'Todos os Tipos' },
  { value: 'ENTRADA', label: 'Entradas (+)' },
  { value: 'SAIDA', label: 'Saídas (-)' },
  { value: 'AJUSTE', label: 'Ajustes de Balanço (=)' },
]

/**
 * Situação de uma peça: zerada, no mínimo/abaixo (com saldo) ou adequada.
 * @param {object} peca
 * @returns {'ZERADO'|'REPOSICAO'|'ADEQUADO'}
 */
export function situacaoEstoque(peca) {
  if (saldo(peca) <= 0) return 'ZERADO'
  if (saldo(peca) <= minimo(peca)) return 'REPOSICAO'
  return 'ADEQUADO'
}

const CASA_STATUS = {
  TODOS: () => true,
  ADEQUADO: (p) => saldo(p) > minimo(p),
  REPOSICAO: (p) => saldo(p) <= minimo(p) && saldo(p) > 0,
  ZERADO: (p) => saldo(p) <= 0,
  ALERTA_GERAL: (p) => saldo(p) <= minimo(p),
}

const valorEmEstoque = (p) => (Number(p.precoCusto) || 0) * saldo(p)

const ORDENACOES = {
  NOME_ASC: (a, b) => a.nome.localeCompare(b.nome),
  NOME_DESC: (a, b) => b.nome.localeCompare(a.nome),
  MAIOR_ESTOQUE: (a, b) => saldo(b) - saldo(a),
  MENOR_ESTOQUE: (a, b) => saldo(a) - saldo(b),
  MAIOR_VALOR: (a, b) => valorEmEstoque(b) - valorEmEstoque(a),
}

/**
 * Indicadores do almoxarifado: itens, unidades, valores de custo/venda e alertas.
 * @param {Array<object>} pecas
 * @returns {object}
 */
export function calcularMetricasEstoque(pecas) {
  const itensAbaixoMinimo = pecas.filter(CASA_STATUS.REPOSICAO).length
  const itensZerados = pecas.filter(CASA_STATUS.ZERADO).length
  return {
    totalItens: pecas.length,
    totalUnidades: pecas.reduce((acc, p) => acc + saldo(p), 0),
    valorCustoTotal: formatarMoeda(pecas.reduce((acc, p) => acc + valorEmEstoque(p), 0)),
    valorVendaTotal: formatarMoeda(pecas.reduce((acc, p) => acc + (Number(p.precoVenda) || 0) * saldo(p), 0)),
    itensAbaixoMinimo,
    itensZerados,
    itensReposicaoTotal: itensAbaixoMinimo + itensZerados,
  }
}

/**
 * Posição do almoxarifado filtrada por busca, categoria e nível, já ordenada.
 * @param {Array<object>} pecas
 * @param {{busca: string, categoria: string, status: string, ordenacao: string}} filtros
 * @returns {Array<object>}
 */
export function filtrarPosicaoEstoque(pecas, { busca, categoria, status, ordenacao }) {
  const termo = busca.toLowerCase().trim()
  const casaStatus = CASA_STATUS[status] || CASA_STATUS.TODOS
  return pecas
    .filter(
      (peca) =>
        (!termo ||
          ['nome', 'codigo', 'codigoFabricante', 'categoria', 'localizacao', 'gtin'].some((c) => contem(peca[c], termo))) &&
        (categoria === 'TODAS' || peca.categoria === categoria) &&
        casaStatus(peca)
    )
    .sort(ORDENACOES[ordenacao] || (() => 0))
}

/**
 * Reposição sugerida no formato do Estoque (`sugestaoCompra` e `custoEstimado`).
 * @param {Array<object>} pecas
 * @returns {Array<object>}
 */
export function calcularReposicaoEstoque(pecas) {
  return calcularItensReposicao(pecas).map(({ sugestao, custoTotal, ...item }) => ({
    ...item,
    sugestaoCompra: sugestao,
    custoEstimado: custoTotal,
  }))
}

/**
 * Investimento total estimado da reposição, formatado ("1.234,50").
 * @param {Array<object>} itens - Itens de `calcularReposicaoEstoque()`.
 * @returns {string}
 */
export function totalInvestimentoReposicao(itens) {
  return formatarMoeda(itens.reduce((acc, item) => acc + item.custoEstimado, 0))
}

/**
 * Movimentações do Kardex filtradas por busca e tipo.
 * @param {Array<object>} movimentacoes
 * @param {{busca: string, tipo: string}} filtros
 * @returns {Array<object>}
 */
export function filtrarMovimentacoes(movimentacoes, { busca, tipo }) {
  const termo = busca.toLowerCase().trim()
  return movimentacoes.filter(
    (mov) =>
      (!termo || ['pecaNome', 'pecaCodigo', 'documento', 'motivo', 'responsavel'].some((c) => contem(mov[c], termo))) &&
      (tipo === 'TODOS' || mov.tipo === tipo)
  )
}

/**
 * Texto do pedido de reposição para colar no WhatsApp.
 * @param {Array<object>} itens - Itens de `calcularReposicaoEstoque()`.
 * @param {string} investimento - Total formatado.
 * @returns {string}
 */
export function textoListaReposicao(itens, investimento) {
  let texto = `*PEDIDO DE REPOSIÇÃO DE ESTOQUE - MECÂNICA GABRIEL*\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n`
  itens.forEach((item, idx) => {
    texto += `${idx + 1}. [${item.codigo}] ${item.nome}\n   - Atual: ${item.atual} | Mín: ${item.min}\n   - Sugestão de Compra: *${item.sugestaoCompra} ${item.unidade || 'UN'}*\n\n`
  })
  texto += `Total de Itens: ${itens.length}\nEstimativa de Investimento: R$ ${investimento}`
  return texto
}
