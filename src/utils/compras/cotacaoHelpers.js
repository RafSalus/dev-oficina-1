/**
 * Funções puras do fluxo de Cotação de Peças (Story 2.0 / ADR-003).
 *
 * Concentram a montagem de fornecedores participantes, itens de cotação e
 * objetos de cotação novos, antes duplicados em ComprasPage e CotacaoPage.
 * Regra 5: sem o caractere '&' em labels.
 */

/** Telefone usado quando o fornecedor não tem um número válido cadastrado. */
export const TELEFONE_FALLBACK_FORNECEDOR = '43998544106'

/**
 * Extrai apenas os dígitos do WhatsApp/telefone de um fornecedor.
 * @param {object|null} t - Terceiro/fornecedor cadastrado ou participante da cotação.
 * @returns {string} Telefone com somente dígitos (fallback se tiver menos de 8 dígitos).
 */
export function extrairTelefoneLimpo(t) {
  if (!t) return TELEFONE_FALLBACK_FORNECEDOR
  const tel = t.whatsapp || t.contatoTelefone || t.telefone || t.contato?.telefone || ''
  const limpo = String(tel).replace(/\D/g, '')
  return limpo.length >= 8 ? limpo : TELEFONE_FALLBACK_FORNECEDOR
}

/**
 * Telefone do fornecedor formatado como foi cadastrado, para exibição.
 * @param {object|null} t - Terceiro/fornecedor cadastrado.
 * @returns {string}
 */
export function extrairTelefoneExibicao(t) {
  if (!t) return ''
  return String(t.telefone || t.contatoTelefone || t.contato?.telefone || '')
}

const TERMOS_AUTOPECAS = ['auto', 'peça', 'peca', 'distribuidora']

/**
 * Filtra os terceiros cuja categoria ou ramo indica autopeças/distribuidora.
 * @param {Array<object>} terceiros
 * @returns {Array<object>}
 */
export function filtrarFornecedoresAutoPecas(terceiros) {
  if (!Array.isArray(terceiros)) return []
  return terceiros.filter((t) => {
    const cat = String(t.categoria || t.categoriaFornecedor || '').toLowerCase()
    const ramo = String(t.ramoAtividade || t.tipoServico || '').toLowerCase()
    return TERMOS_AUTOPECAS.some((termo) => cat.includes(termo) || ramo.includes(termo))
  })
}

/**
 * Converte um terceiro cadastrado em participante de cotação (status AGUARDANDO).
 * @param {object} t - Terceiro cadastrado.
 * @param {string} [nomePadrao='Fornecedor'] - Nome usado se o cadastro não tiver nome.
 * @returns {object} Fornecedor cotado.
 */
export function criarFornecedorCotado(t, nomePadrao = 'Fornecedor') {
  return {
    id: t.id,
    nome: t.nomeFantasia || t.razaoSocial || nomePadrao,
    telefone: extrairTelefoneExibicao(t),
    whatsapp: extrairTelefoneLimpo(t),
    cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
    status: 'AGUARDANDO',
    valorTotal: null,
    tempoEntrega: '1 a 2 horas',
    condicaoPagamento: 'Boleto 30 Dias',
    respostasItens: {},
  }
}

/**
 * Seleciona até 3 fornecedores iniciais, priorizando autopeças.
 * @param {Array<object>} terceiros - Terceiros cadastrados.
 * @param {string} [nomePadrao='Fornecedor']
 * @returns {Array<object>} Fornecedores cotados.
 */
export function criarFornecedoresIniciais(terceiros, nomePadrao = 'Fornecedor') {
  if (!Array.isArray(terceiros) || terceiros.length === 0) return []
  const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
  const base = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)
  return base.map((t) => criarFornecedorCotado(t, nomePadrao))
}

/**
 * Item de cotação a partir de uma peça lançada na OS.
 * @param {object} p - Peça da OS (`pecasOS`).
 * @param {string} id
 * @returns {object}
 */
export function itemCotacaoDaPecaOS(p, id) {
  return {
    id,
    codigo: p.codigo || '',
    nome: p.nome,
    unidade: p.unidade || 'UN',
    quantidade: Number(p.quantidade || 1),
    marcaSugerida: p.marca || '',
    observacoes: '',
    fotoUrl: '',
  }
}

/**
 * Converte todas as peças de uma OS em itens de cotação.
 * @param {object} os - Ordem de serviço com `pecasOS`.
 * @returns {Array<object>}
 */
export function itensCotacaoDaOS(os) {
  const stamp = Date.now()
  return (os?.pecasOS || []).map((p, idx) => itemCotacaoDaPecaOS(p, `it-${stamp}-${idx}`))
}

/**
 * Item de cotação a partir de uma demanda de peça de OS.
 * @param {object} demanda - Demanda de `obterDemandasDasOSs()`.
 * @param {string} id
 * @returns {object}
 */
export function itemCotacaoDaDemanda(demanda, id) {
  return {
    id,
    codigo: demanda.itemCodigo !== 'SEM CODIGO' ? demanda.itemCodigo : '',
    nome: demanda.itemNome,
    unidade: demanda.unidade || 'UN',
    quantidade: Number(demanda.quantidadeNecessaria || 1),
    marcaSugerida: demanda.itemMarcaSugerida || '',
    observacoes: `Solicitado na OS #${demanda.numeroOS}`,
    fotoUrl: '',
  }
}

/**
 * Item de cotação a partir de um item abaixo do estoque mínimo.
 * @param {object} item - Item de `calcularItensReposicao()`.
 * @param {string} id
 * @returns {object}
 */
export function itemCotacaoDaReposicao(item, id) {
  const unidade = item.unidade || 'UN'
  return {
    id,
    codigo: item.codigo || item.sku || '',
    nome: item.nome || item.descricao || 'Item de Reposição',
    unidade,
    quantidade: Number(item.sugestao || item.sugestaoCompra || item.deficit || 1),
    marcaSugerida: item.marca || item.fabricante || '',
    observacoes: `Reposição de almoxarifado (Estoque atual: ${item.atual ?? item.estoqueAtual ?? 0} ${unidade})`,
    fotoUrl: '',
  }
}

/**
 * Monta um objeto de cotação nova (status EM_COTACAO) com os campos padrão.
 * @param {object} dados - Campos informados; os ausentes recebem string vazia.
 * @returns {object} Cotação pronta para `salvarCotacao()`.
 */
export function criarCotacao(dados) {
  return {
    id: dados.id,
    numeroOS: dados.numeroOS || '',
    clienteNome: dados.clienteNome || '',
    clienteTelefone: dados.clienteTelefone || '',
    veiculoPlaca: dados.veiculoPlaca || '',
    veiculoModelo: dados.veiculoModelo || '',
    ano: dados.ano || '',
    km: dados.km || '',
    mecanicoNome: dados.mecanicoNome || '',
    status: 'EM_COTACAO',
    observacoes: dados.observacoes || '',
    itens: dados.itens || [],
    fornecedoresCotados: dados.fornecedoresCotados || [],
    fornecedorVencedorId: null,
    dataCriacao: new Date().toISOString(),
  }
}

/**
 * Soma o valor proposto por um fornecedor (preço unitário x quantidade).
 * @param {Array<object>} itens - Itens da cotação.
 * @param {object} respostas - Mapa `itemId -> { preco, marca }`.
 * @returns {number}
 */
export function calcularTotalRespostas(itens, respostas) {
  return itens.reduce((soma, it) => {
    const resp = respostas[it.id]
    if (resp && resp.preco !== '' && !isNaN(Number(resp.preco))) {
      return soma + Number(resp.preco) * Number(it.quantidade || 1)
    }
    return soma
  }, 0)
}

/**
 * Fornecedores que responderam com valor total positivo.
 * @param {Array<object>} fornecedores
 * @returns {Array<object>}
 */
export function fornecedoresComProposta(fornecedores) {
  return (fornecedores || []).filter((f) => f.status === 'RESPONDIDA' && f.valorTotal > 0)
}

/**
 * Proposta de menor valor entre as respondidas.
 * @param {Array<object>} fornecedores
 * @returns {object|undefined}
 */
export function menorProposta(fornecedores) {
  return [...fornecedoresComProposta(fornecedores)].sort(
    (a, b) => Number(a.valorTotal) - Number(b.valorTotal)
  )[0]
}
