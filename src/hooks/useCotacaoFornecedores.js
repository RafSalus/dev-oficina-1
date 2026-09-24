import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { criarFornecedorCotado, calcularTotalRespostas } from '../utils/compras/cotacaoHelpers'

/**
 * Autopeças participantes de uma cotação (Story 2.0 / ADR-003): inclusão,
 * remoção, preenchimento de preços por item, escolha do vencedor e expansão
 * da grade de preços.
 *
 * @param {{itens: Array<object>, fornecedoresCadastrados: Array<object>}} params
 *   `itens` da cotação (base do total de cada proposta) e terceiros cadastrados.
 * @returns {object} Estado dos fornecedores cotados e suas ações.
 */
export function useCotacaoFornecedores({ itens, fornecedoresCadastrados }) {
  const [fornecedoresCotados, setFornecedoresCotados] = useState([])
  const [fornecedorVencedorId, setFornecedorVencedorId] = useState(null)
  const [fornecedorExpandidoId, setFornecedorExpandidoId] = useState(null)
  const [fornecedorParaAdicionar, setFornecedorParaAdicionar] = useState(null)

  const opcoesDisponiveis = useMemo(() => {
    const idsJaAdicionados = fornecedoresCotados.map((f) => f.id)
    return fornecedoresCadastrados
      .filter((t) => !idsJaAdicionados.includes(t.id))
      .map((t) => ({
        value: t.id,
        label: `${t.nomeFantasia || t.razaoSocial} (${t.ramoAtividade || t.categoria || 'Fornecedor'})`,
        dados: t,
      }))
  }, [fornecedoresCadastrados, fornecedoresCotados])

  /** Substitui os participantes (carga de uma cotação salva ou nova). */
  const carregar = (fornecedores, vencedorId = null) => {
    setFornecedoresCotados(fornecedores)
    setFornecedorVencedorId(vencedorId)
  }

  const adicionar = () => {
    if (!fornecedorParaAdicionar) return
    const novo = criarFornecedorCotado(fornecedorParaAdicionar.dados)
    setFornecedoresCotados((prev) => [...prev, novo])
    setFornecedorParaAdicionar(null)
    toast.success(`Fornecedor ${novo.nome} incluído na cotação!`)
  }

  const remover = (fornecedorId) => {
    setFornecedoresCotados((prev) => prev.filter((f) => f.id !== fornecedorId))
    if (fornecedorVencedorId === fornecedorId) setFornecedorVencedorId(null)
    if (fornecedorExpandidoId === fornecedorId) setFornecedorExpandidoId(null)
    toast.info('Fornecedor removido da cotação.')
  }

  /** Atualiza preço ou marca de um item e recalcula total e status da proposta. */
  const atualizarPreco = (fornecedorId, itemId, campo, valor) => {
    setFornecedoresCotados((prev) =>
      prev.map((f) => {
        if (f.id !== fornecedorId) return f
        const itemAtual = { ...(f.respostasItens?.[itemId] || { preco: '', marca: '', disponivel: true }), [campo]: valor }
        const respostasItens = { ...(f.respostasItens || {}), [itemId]: itemAtual }
        const soma = calcularTotalRespostas(itens, respostasItens)
        return {
          ...f,
          respostasItens,
          valorTotal: soma > 0 ? soma : null,
          status: soma > 0 ? 'RESPONDIDA' : 'AGUARDANDO',
        }
      })
    )
  }

  const atualizarDados = (fornecedorId, campo, valor) =>
    setFornecedoresCotados((prev) => prev.map((f) => (f.id === fornecedorId ? { ...f, [campo]: valor } : f)))

  /** Remove as respostas de um item excluído da cotação. */
  const removerRespostasDoItem = (itemId) =>
    setFornecedoresCotados((prev) =>
      prev.map((f) => {
        if (!f.respostasItens?.[itemId]) return f
        const copia = { ...f.respostasItens }
        delete copia[itemId]
        return { ...f, respostasItens: copia }
      })
    )

  return {
    fornecedoresCotados,
    fornecedorVencedorId,
    fornecedorExpandidoId,
    fornecedorParaAdicionar,
    setFornecedorParaAdicionar,
    opcoesDisponiveis,
    carregar,
    adicionar,
    remover,
    atualizarPreco,
    atualizarDados,
    removerRespostasDoItem,
    alternarVencedor: (id) => setFornecedorVencedorId((atual) => (atual === id ? null : id)),
    alternarExpandido: (id) => setFornecedorExpandidoId((atual) => (atual === id ? null : id)),
  }
}
