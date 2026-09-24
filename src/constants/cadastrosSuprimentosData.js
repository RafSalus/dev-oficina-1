// Dados Iniciais e Utilitários de Persistência dos Cadastros Base de Suprimentos

export const CHAVE_STORAGE_SERVICOS = 'dev_oficina_cadastros_servicos'
export const CHAVE_STORAGE_PECAS = 'dev_oficina_cadastros_pecas'
export const CHAVE_STORAGE_TERCEIROS = 'dev_oficina_cadastros_terceiros'
export const CHAVE_STORAGE_MOVIMENTACOES_ESTOQUE = 'dev_oficina_movimentacoes_estoque'

export const CATEGORIAS_PECAS_OPCOES = []

export const CATEGORIAS_SERVICOS_OPCOES = []

export const UNIDADES_MEDIDA_OPCOES = []

export const CST_CSOSN_OPCOES = []

export const CFOP_OPCOES = []

export const CATEGORIAS_FORNECEDOR_OPCOES = []

export const RAMOS_FORNECEDOR_OPCOES = []

export const TIPOS_SERVICO_TERCEIRO_OPCOES = []

export const ESTADOS_BRASIL_OPCOES = []

export const SERVICOS_INICIAIS = []

export const PECAS_INICIAIS = []

export const TERCEIROS_INICIAIS = []

export function carregarServicosCadastrados() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_SERVICOS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return SERVICOS_INICIAIS
}

export function salvarServicosCadastrados(servicos) {
  try {
    localStorage.setItem(CHAVE_STORAGE_SERVICOS, JSON.stringify(servicos))
  } catch {}
}

export function carregarPecasCadastradas() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_PECAS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((p) => ({
          ...p,
          categoria: p.categoria || 'Outros Componentes',
          estoqueAtual: Number(p.estoqueAtual) || 0,
          estoqueMinimo: Number(p.estoqueMinimo) || 0,
          precoCusto: Number(p.precoCusto) || 0,
          precoVenda: Number(p.precoVenda) || 0,
        }))
      }
    }
  } catch {}
  return PECAS_INICIAIS
}

export function salvarPecasCadastradas(pecas) {
  try {
    localStorage.setItem(CHAVE_STORAGE_PECAS, JSON.stringify(pecas))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_pecas_updated'))
  } catch {}
}

export function carregarTerceirosCadastrados() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_TERCEIROS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return TERCEIROS_INICIAIS
}

export function salvarTerceirosCadastrados(terceiros) {
  try {
    localStorage.setItem(CHAVE_STORAGE_TERCEIROS, JSON.stringify(terceiros))
  } catch {}
}

export const MOVIMENTACOES_ESTOQUE_INICIAIS = []

export function carregarMovimentacoesEstoque() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_MOVIMENTACOES_ESTOQUE)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return MOVIMENTACOES_ESTOQUE_INICIAIS
}

export function salvarMovimentacoesEstoque(movimentacoes) {
  try {
    localStorage.setItem(CHAVE_STORAGE_MOVIMENTACOES_ESTOQUE, JSON.stringify(movimentacoes))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_movimentacoes_updated'))
  } catch {}
}

export function registrarMovimentacaoEstoque({
  pecaId,
  tipo,
  quantidade,
  motivo,
  documento,
  responsavel,
}) {
  const listaPecas = carregarPecasCadastradas()
  const pecaIndex = listaPecas.findIndex((p) => p.id === pecaId)
  if (pecaIndex === -1) {
    throw new Error('Peça não encontrada no almoxarifado.')
  }

  const peca = listaPecas[pecaIndex]
  const qtd = Number(quantidade) || 0
  const saldoAnterior = Number(peca.estoqueAtual) || 0
  let saldoNovo = saldoAnterior

  if (tipo === 'ENTRADA') {
    saldoNovo = saldoAnterior + qtd
  } else if (tipo === 'SAIDA') {
    saldoNovo = Math.max(0, saldoAnterior - qtd)
  } else if (tipo === 'AJUSTE') {
    saldoNovo = Math.max(0, qtd)
  }

  const pecaAtualizada = {
    ...peca,
    estoqueAtual: saldoNovo,
  }

  const novasPecas = [...listaPecas]
  novasPecas[pecaIndex] = pecaAtualizada
  salvarPecasCadastradas(novasPecas)

  const novoMovimento = {
    id: `mov-${Date.now()}`,
    dataHora: new Date().toISOString(),
    pecaId: peca.id,
    pecaCodigo: peca.codigo,
    pecaNome: peca.nome,
    unidade: peca.unidade || 'UN',
    tipo,
    quantidade: qtd,
    saldoAnterior,
    saldoNovo,
    motivo: motivo || 'Movimentação manual do almoxarifado',
    documento: documento || 'Registro Avulso',
    responsavel: responsavel || 'Operador do Almoxarifado',
  }

  const listaMovs = carregarMovimentacoesEstoque()
  const novasMovs = [novoMovimento, ...listaMovs]
  salvarMovimentacoesEstoque(novasMovs)

  return { peca: pecaAtualizada, movimento: novoMovimento }
}
