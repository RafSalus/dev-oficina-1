/**
 * Fábrica pura de cotações abertas a partir da tela de Compras (Story 2.0 / ADR-003):
 * demanda de OS, demandas agrupadas e reposição de almoxarifado.
 * Quem chama gera o id (`gerarProximoNumeroCotacao`) e persiste (`salvarCotacao`).
 */
import {
  criarCotacao,
  criarFornecedoresIniciais,
  itemCotacaoDaDemanda,
  itemCotacaoDaReposicao,
  itensCotacaoDaOS,
} from './cotacaoHelpers'

const NOME_FORNECEDOR_REPOSICAO = 'Auto Peças Parceira'

const mesmoItem = (it, demanda) =>
  it.nome?.toLowerCase() === demanda.itemNome?.toLowerCase() ||
  (it.codigo && demanda.itemCodigo && it.codigo === demanda.itemCodigo)

/**
 * Inclui a peça da demanda numa cotação existente da mesma OS, se ainda não constar.
 * @param {object} cotacao - Cotação existente.
 * @param {object} demanda - Demanda de peça da OS.
 * @returns {{cotacao: object, alterada: boolean}}
 */
export function incluirDemandaNaCotacao(cotacao, demanda) {
  if ((cotacao.itens || []).some((it) => mesmoItem(it, demanda))) {
    return { cotacao, alterada: false }
  }
  const itemNovo = itemCotacaoDaDemanda(demanda, `it-${Date.now()}`)
  return { cotacao: { ...cotacao, itens: [...(cotacao.itens || []), itemNovo] }, alterada: true }
}

/**
 * Cotação nova vinculada à OS da demanda. Se a OS tiver peças lançadas, todas
 * entram na cotação; caso contrário, só a peça da demanda.
 * @param {{id: string, demanda: object, os: object|undefined, terceiros: Array}} params
 * @returns {object}
 */
export function montarCotacaoDaDemanda({ id, demanda, os, terceiros }) {
  const itens =
    os?.pecasOS?.length > 0
      ? itensCotacaoDaOS(os)
      : [itemCotacaoDaDemanda(demanda, `it-${Date.now()}-1`)]

  return criarCotacao({
    id,
    numeroOS: demanda.numeroOS,
    clienteNome: demanda.clienteNome || os?.cliente,
    clienteTelefone: demanda.clienteTelefone || os?.telefone,
    veiculoPlaca: demanda.veiculoPlaca || os?.placa,
    veiculoModelo: demanda.veiculoModelo || os?.marcaModelo,
    ano: os?.ano,
    km: os?.km,
    mecanicoNome: os?.mecanicoNome,
    observacoes: `Cotação de peças para a Ordem de Serviço #${demanda.numeroOS}`,
    itens,
    fornecedoresCotados: criarFornecedoresIniciais(terceiros),
  })
}

/**
 * Cotação com várias demandas selecionadas. Os dados do veículo só são
 * preenchidos quando todas as demandas pertencem à mesma OS.
 * @param {{id: string, demandas: Array<object>, terceiros: Array}} params
 * @returns {object}
 */
export function montarCotacaoAgrupada({ id, demandas, terceiros }) {
  const stamp = Date.now()
  const primeira = demandas[0]
  const todasMesmaOS = demandas.every((d) => d.numeroOS === primeira.numeroOS)
  const daOS = (campo) => (todasMesmaOS ? primeira[campo] : '')

  return criarCotacao({
    id,
    numeroOS: daOS('numeroOS'),
    clienteNome: daOS('clienteNome'),
    clienteTelefone: daOS('clienteTelefone'),
    veiculoPlaca: daOS('veiculoPlaca'),
    veiculoModelo: daOS('veiculoModelo'),
    observacoes: `Cotação de peças agrupadas contendo ${demandas.length} itens de OSs da oficina`,
    itens: demandas.map((d, idx) => itemCotacaoDaDemanda(d, `it-${stamp}-${idx}`)),
    fornecedoresCotados: criarFornecedoresIniciais(terceiros),
  })
}

/**
 * Cotação de reposição do almoxarifado: de um item (`agrupada = false`) ou de
 * todos os itens abaixo do mínimo (`agrupada = true`).
 * @param {{id: string, itens: Array<object>, terceiros: Array, agrupada?: boolean}} params
 * @returns {object}
 */
export function montarCotacaoReposicao({ id, itens, terceiros, agrupada = false }) {
  const stamp = Date.now()
  const unico = !agrupada
  const itensCotacao = unico
    ? [itemCotacaoDaReposicao(itens[0], `it-${stamp}`)]
    : itens.map((item, idx) => itemCotacaoDaReposicao(item, `it-${stamp}-${idx}`))

  return criarCotacao({
    id,
    clienteNome: 'Almoxarifado Central',
    veiculoPlaca: 'OFICINA',
    veiculoModelo: unico ? 'Reposição de Almoxarifado' : 'Reposição Completa de Almoxarifado',
    mecanicoNome: 'Rafael Almoxarife',
    observacoes: unico
      ? `Cotação de reposição de estoque mínimo (${itens[0].nome || 'Item'})`
      : `Cotação de reposição do almoxarifado (${itensCotacao.length} itens)`,
    itens: itensCotacao,
    fornecedoresCotados: criarFornecedoresIniciais(terceiros, NOME_FORNECEDOR_REPOSICAO),
  })
}
