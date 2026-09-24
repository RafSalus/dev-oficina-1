/**
 * Filtros e indicadores puros da lista de Ordens de Serviço (Story 2.0 / ADR-003).
 */

const contem = (valor, termo) => String(valor || '').toLowerCase().includes(termo)

const buscaCasa = (os, busca, campos) => {
  const termo = busca.toLowerCase().trim()
  return !termo || campos.some((campo) => contem(os[campo], termo))
}

const somaCampo = (lista, campo) => lista.reduce((acc, o) => acc + (Number(o[campo]) || 0), 0)

/**
 * OS abertas filtradas por status, prioridade e busca (número, cliente, placa,
 * modelo, mecânico ou queixa).
 * @param {Array<object>} ordens
 * @param {{busca: string, status: string, prioridade: string}} filtros - `status` 'todos' e
 *   `prioridade` 'todas' desligam o respectivo filtro.
 * @returns {Array<object>}
 */
export function filtrarOrdensAbertas(ordens, { busca, status, prioridade }) {
  return ordens.filter(
    (os) =>
      (status === 'todos' || os.status === status) &&
      (prioridade === 'todas' || os.prioridade === prioridade) &&
      buscaCasa(os, busca, ['numeroOS', 'cliente', 'placa', 'marcaModelo', 'mecanicoNome', 'relatoCliente'])
  )
}

/**
 * OS arquivadas filtradas pela busca (número, cliente, placa, modelo, mecânico ou nota fiscal).
 * @param {Array<object>} ordens
 * @param {string} busca
 * @returns {Array<object>}
 */
export function filtrarOrdensFinalizadas(ordens, busca) {
  return ordens.filter((os) =>
    buscaCasa(os, busca, ['numeroOS', 'cliente', 'placa', 'marcaModelo', 'mecanicoNome', 'notaFiscal'])
  )
}

/**
 * Contagem das OS abertas por etapa do fluxo e valor total em aberto.
 * @param {Array<object>} ordens
 * @returns {object}
 */
export function calcularMetricasAbertas(ordens) {
  const porStatus = (status) => ordens.filter((o) => o.status === status).length
  return {
    totalAbertas: ordens.length,
    naFila: porStatus('fila'),
    emDiagnostico: porStatus('em_diagnostico'),
    aguardandoPecas: porStatus('aguardando_pecas'),
    terceirizados: porStatus('terceirizado'),
    aguardandoAprovacao: porStatus('aguardando_aprovacao'),
    aprovadosExecucao: porStatus('aprovado_execucao'),
    prontoRetirada: porStatus('pronto_retirada'),
    somaValorTotal: somaCampo(ordens, 'valorTotal'),
  }
}

/**
 * Faturamento, ticket médio e garantias das OS arquivadas.
 * @param {Array<object>} ordens
 * @returns {object}
 */
export function calcularMetricasFinalizadas(ordens) {
  const total = ordens.length
  const somaValorTotal = somaCampo(ordens, 'valorTotal')
  return {
    total,
    somaValorTotal,
    somaPecas: somaCampo(ordens, 'totalPecas'),
    somaServicos: somaCampo(ordens, 'totalServicos'),
    ticketMedio: total > 0 ? somaValorTotal / total : 0,
    garantiasAtivas: total, // todas dentro do período de garantia
  }
}

/**
 * Soma de `valorTotal` de uma lista de OS.
 * @param {Array<object>} ordens
 * @returns {number}
 */
export function somaValorTotal(ordens) {
  return somaCampo(ordens, 'valorTotal')
}
