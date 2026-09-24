/**
 * Funções puras da tela dedicada de Cotação (Story 2.0 / ADR-003): dados do
 * veículo vindos da OS, status derivado da cotação e conversão da proposta
 * vencedora em pedido de compra.
 */
import { menorProposta } from './cotacaoHelpers'

/** Campos do cabeçalho da cotação (veículo, cliente e observações). */
export const DADOS_COTACAO_VAZIOS = {
  numeroOS: '',
  clienteNome: '',
  clienteTelefone: '',
  veiculoPlaca: '',
  veiculoModelo: '',
  ano: '',
  km: '',
  mecanicoNome: '',
  observacoes: '',
}

/**
 * Dados de veículo e cliente de uma OS aberta, no formato da cotação.
 * @param {object} os
 * @returns {object}
 */
export function dadosVeiculoDaOS(os) {
  return {
    numeroOS: String(os.numeroOS),
    clienteNome: os.cliente || '',
    clienteTelefone: os.telefone || '',
    veiculoPlaca: os.placa || '',
    veiculoModelo: os.marcaModelo || `${os.marca || ''} ${os.modelo || ''}`.trim(),
    ano: os.ano || '',
    km: os.km || '',
    mecanicoNome: os.mecanicoNome || '',
  }
}

/**
 * Cabeçalho de uma cotação salva, com os campos ausentes vazios.
 * @param {object} cotacao
 * @returns {object}
 */
export function dadosDaCotacaoSalva(cotacao) {
  return Object.fromEntries(
    Object.keys(DADOS_COTACAO_VAZIOS).map((campo) => [campo, cotacao[campo] || ''])
  )
}

/**
 * Status da cotação: APROVADA com vencedor, RESPONDIDA com alguma proposta, senão EM_COTACAO.
 * @param {Array<object>} fornecedores
 * @param {string|null} vencedorId
 * @returns {'APROVADA'|'RESPONDIDA'|'EM_COTACAO'}
 */
export function derivarStatusCotacao(fornecedores, vencedorId) {
  if (vencedorId) return 'APROVADA'
  return fornecedores.some((f) => f.status === 'RESPONDIDA') ? 'RESPONDIDA' : 'EM_COTACAO'
}

/**
 * Fornecedor vencedor: o escolhido manualmente, senão a menor proposta,
 * senão o primeiro participante.
 * @param {Array<object>} fornecedores
 * @param {string|null} vencedorId
 * @returns {object|undefined}
 */
export function resolverFornecedorVencedor(fornecedores, vencedorId) {
  return fornecedores.find((f) => f.id === vencedorId) || menorProposta(fornecedores) || fornecedores[0]
}

/**
 * Dados iniciais do pedido de compra a partir da cotação aprovada, com os
 * preços da proposta vencedora (entrada do `CompraModalForm`).
 * @param {object} cotacao - Cotação já formatada.
 * @param {object} vencedor - Fornecedor vencedor.
 * @returns {object}
 */
export function montarPedidoDaCotacao(cotacao, vencedor) {
  const stamp = Date.now()
  const itens = cotacao.itens.map((it, idx) => {
    const resp = vencedor.respostasItens?.[it.id] || {}
    const preco = Number(resp.preco) || 0
    const quantidade = Number(it.quantidade) || 1
    return {
      id: `item-ped-${stamp}-${idx}`,
      codigo: it.codigo || '',
      nome: it.nome,
      unidade: it.unidade || 'UN',
      quantidade,
      precoCusto: preco,
      valorTotal: quantidade * preco,
      marca: resp.marca || it.marcaSugerida || '',
    }
  })

  return {
    cotacaoId: cotacao.id,
    fornecedorId: vencedor.id,
    fornecedorNome: vencedor.nome,
    origemTipo: cotacao.numeroOS ? 'ORDEM_SERVICO' : 'REPOSICAO_ESTOQUE',
    numeroOS: cotacao.numeroOS || '',
    clienteNome: cotacao.clienteNome || '',
    veiculoPlaca: cotacao.veiculoPlaca || '',
    veiculoModelo: cotacao.veiculoModelo || '',
    formaPagamento: vencedor.condicaoPagamento || 'Boleto 30 Dias',
    observacoes: `Pedido oficial gerado a partir da Cotação #${cotacao.id}. Fornecedor vencedor: ${vencedor.nome}.`,
    itens,
  }
}
