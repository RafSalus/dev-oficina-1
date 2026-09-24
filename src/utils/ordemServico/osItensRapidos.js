/**
 * Montagem pura dos itens lançados direto no painel da OS (Story 2.0 / ADR-003):
 * peça do almoxarifado, serviço do catálogo e serviço terceirizado.
 */

const idAleatorio = (prefixo) => `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

/** Nome digitado ou escolhido num (Creatable)Select, vindo do cadastro ou do texto livre. */
export function nomeDaSelecao(selecao, campoCadastro) {
  return (selecao?.[campoCadastro]?.nome || selecao?.value || selecao?.label || '').trim()
}

/**
 * Peça lançada na OS. Sem cadastro ou sem saldo suficiente, entra marcada "Para Cotação"
 * com preço zerado; com saldo, usa o preço de venda e baixa do estoque interno.
 * @param {object|null} selecao - Opção do CreatableSelect (`{ peca }` quando cadastrada).
 * @param {string|number} quantidade
 * @returns {{item: object, nome: string, paraCotacao: boolean}}
 */
export function montarPecaRapida(selecao, quantidade) {
  const nome = nomeDaSelecao(selecao, 'peca')
  const pecaCadastro = selecao?.peca || null
  const qtd = parseFloat(quantidade) || 1
  const disponivel = pecaCadastro ? Number(pecaCadastro.estoqueAtual) || 0 : 0
  const paraCotacao = !pecaCadastro || qtd > disponivel

  return {
    nome,
    paraCotacao,
    item: {
      id: idAleatorio('peca'),
      codigo: pecaCadastro?.codigo || 'A COTAR',
      nome,
      unidade: pecaCadastro?.unidade || 'UN',
      quantidade: qtd,
      precoUnitario: paraCotacao ? 0 : Number(pecaCadastro.precoVenda) || 0,
      desconto: 0,
      categoria: pecaCadastro?.categoria || '',
      statusEstoque: paraCotacao ? 'para_cotacao' : 'em_estoque',
      estoqueAtual: disponivel,
      estoqueMinimo: pecaCadastro?.estoqueMinimo || 1,
      fornecedorId: paraCotacao ? '' : 'estoque-interno',
      fornecedorNome: paraCotacao ? 'Cotação Externa' : 'Estoque Interno',
    },
  }
}

/**
 * Serviço de mão de obra lançado na OS.
 * @param {object|null} selecao - Opção do CreatableSelect (`{ servico }` quando cadastrado).
 * @param {string|number} quantidade
 * @param {number} preco
 * @returns {object}
 */
export function montarServicoRapido(selecao, quantidade, preco) {
  const servicoCadastro = selecao?.servico || null
  return {
    codigo: servicoCadastro?.codigo || 'AVULSO',
    nome: nomeDaSelecao(selecao, 'servico'),
    unidade: 'MO',
    quantidade: parseFloat(quantidade) || 1,
    precoUnitario: preco,
    desconto: 0,
    categoria: servicoCadastro?.categoria || '',
  }
}

/**
 * Serviço terceirizado lançado na OS.
 * @param {{descricao: string, selecao: object|null, quantidade: string|number, valor: number}} dados
 * @returns {object}
 */
export function montarTerceiroRapido({ descricao, selecao, quantidade, valor }) {
  const parceiro = selecao?.terceiro || null
  return {
    id: idAleatorio('terc'),
    codigo: 'TERCEIRIZADO',
    nome: descricao.trim(),
    parceiroNome: parceiro ? parceiro.nomeFantasia || parceiro.razaoSocial : selecao?.label || 'Parceiro a definir',
    parceiroId: parceiro?.id || '',
    quantidade: parseFloat(quantidade) || 1,
    valorVenda: valor,
    precoUnitario: valor,
    desconto: 0,
  }
}

/**
 * Valor líquido de um serviço terceirizado exibido na aba Itens (preço x qtd - desconto, mínimo 0).
 * @param {object} t
 * @returns {number}
 */
export function valorLiquidoTerceiro(t) {
  const preco = parseFloat(t.valorVenda || t.precoFinal || t.precoUnitario) || 0
  const qtd = parseFloat(t.quantidade) || 1
  const desc = parseFloat(t.desconto) || 0
  return Math.max(0, preco * qtd - desc)
}

/**
 * Opções de peças ativas do almoxarifado para o CreatableSelect.
 * @param {Array<object>} pecas
 * @returns {Array<object>}
 */
export function opcoesPecas(pecas) {
  return pecas
    .filter((p) => p.ativo !== false)
    .map((p) => ({
      value: p.id,
      label: `${p.codigo} - ${p.nome} (estoque: ${p.estoqueAtual ?? 0} ${p.unidade || 'UN'})`,
      peca: p,
    }))
}

/**
 * Opções de serviços ativos do catálogo para o CreatableSelect.
 * @param {Array<object>} servicos
 * @returns {Array<object>}
 */
export function opcoesServicos(servicos) {
  return servicos
    .filter((s) => s.ativo !== false)
    .map((s) => ({ value: s.id, label: `${s.codigo} - ${s.nome}`, servico: s }))
}

/**
 * Parceiros de serviços externos. Terceirizado e Autopeças compartilham o mesmo cadastro
 * de fornecedores; só entra aqui quem presta "Serviços Externos" (ou "Ambos").
 * @param {Array<object>} terceiros
 * @returns {Array<object>}
 */
export function opcoesParceirosTerceirizados(terceiros) {
  return terceiros
    .filter((t) => t.ativo !== false && ['Serviços Externos', 'Ambos'].includes(t.categoriaFornecedor))
    .map((t) => ({
      value: t.id,
      label: `${t.nomeFantasia || t.razaoSocial}${t.tipoServico ? ` • ${t.tipoServico}` : ''}`,
      terceiro: t,
    }))
}
