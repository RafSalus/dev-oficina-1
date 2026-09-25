import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  salvarPecasCadastradas,
  carregarMovimentacoesEstoque,
  carregarTerceirosCadastrados,
} from '../constants/cadastrosSuprimentosData'
import { gerarProximoNumeroCotacao, salvarCotacao } from '../constants/comprasData'
import { montarCotacaoReposicao } from '../utils/compras/cotacaoFabrica'
import { copiarTexto } from '../utils/compras/mensagensWhatsApp'
import {
  calcularMetricasEstoque,
  filtrarPosicaoEstoque,
  calcularReposicaoEstoque,
  totalInvestimentoReposicao,
  filtrarMovimentacoes,
  textoListaReposicao,
} from '../utils/estoque/estoqueCalculos'

const EVENTOS_SINCRONIZACAO = [
  'storage',
  'dev_oficina_pecas_updated',
  'dev_oficina_estoque_updated',
  'dev_oficina_movimentacoes_updated',
]

/** Adapta o onChange do react-select: opção limpa volta para o valor padrão. */
const aoSelecionar = (setter, padrao) => (opt) => setter(opt ? opt.value : padrao)

/**
 * Workflow do Estoque e Almoxarifado (Story 2.0 / ADR-003): posição com filtros e ordenação,
 * Kardex, sugestão de reposição, cadastro de peça, movimentação e abertura de cotações de
 * reposição (reaproveitando a fábrica de cotações de Compras).
 *
 * @returns {object} Dados, filtros, `modais` e `acoes` da tela.
 */
export function useEstoqueWorkflow() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const [abaAtiva, setAbaAtiva] = useState('posicao')
  const [pecas, setPecas] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])

  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [filtroStatusEstoque, setFiltroStatusEstoque] = useState('TODOS')
  const [filtroOrdenacao, setFiltroOrdenacao] = useState('NOME_ASC')
  const [buscaKardex, setBuscaKardex] = useState('')
  const [filtroTipoMovimento, setFiltroTipoMovimento] = useState('TODOS')

  const [modalPecaAberto, setModalPecaAberto] = useState(false)
  const [pecaParaEditar, setPecaParaEditar] = useState(null)
  const [modalMovimentoAberto, setModalMovimentoAberto] = useState(false)
  const [pecaParaMovimento, setPecaParaMovimento] = useState(null)

  const recarregar = () => {
    setPecas(carregarPecasCadastradas())
    setMovimentacoes(carregarMovimentacoesEstoque())
  }

  useEffect(() => {
    recarregar()
    EVENTOS_SINCRONIZACAO.forEach((evt) => window.addEventListener(evt, recarregar))
    return () => EVENTOS_SINCRONIZACAO.forEach((evt) => window.removeEventListener(evt, recarregar))
  }, [])

  const metricas = useMemo(() => calcularMetricasEstoque(pecas), [pecas])
  const pecasFiltradas = useMemo(
    () =>
      filtrarPosicaoEstoque(pecas, {
        busca,
        categoria: filtroCategoria,
        status: filtroStatusEstoque,
        ordenacao: filtroOrdenacao,
      }),
    [pecas, busca, filtroCategoria, filtroStatusEstoque, filtroOrdenacao]
  )
  const itensReposicao = useMemo(() => calcularReposicaoEstoque(pecas), [pecas])
  const investimentoReposicao = useMemo(() => totalInvestimentoReposicao(itensReposicao), [itensReposicao])
  const movimentacoesFiltradas = useMemo(
    () => filtrarMovimentacoes(movimentacoes, { busca: buscaKardex, tipo: filtroTipoMovimento }),
    [movimentacoes, buscaKardex, filtroTipoMovimento]
  )

  const abrirMovimento = (peca = null) => {
    setPecaParaMovimento(peca)
    setModalMovimentoAberto(true)
  }

  const abrirPeca = (peca = null) => {
    setPecaParaEditar(peca)
    setModalPecaAberto(true)
  }

  const abrirKardexDaPeca = (codigoPeca) => {
    setBuscaKardex(codigoPeca)
    setAbaAtiva('kardex')
  }

  const salvarPeca = (dadosPeca) => {
    const existe = pecas.some((p) => p.id === dadosPeca.id)
    const novaLista = existe ? pecas.map((p) => (p.id === dadosPeca.id ? dadosPeca : p)) : [dadosPeca, ...pecas]
    toast.success(`Peça "${dadosPeca.nome}" ${existe ? 'atualizada' : 'cadastrada'} com sucesso!`)
    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
  }

  const excluirPeca = (id) => {
    const novaLista = pecas.filter((p) => p.id !== id)
    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
    toast.success('Peça excluída do almoxarifado.')
  }

  const copiarListaReposicao = () => {
    if (itensReposicao.length === 0) {
      toast.info('Não há itens com necessidade de reposição no momento.')
      return
    }
    copiarTexto(textoListaReposicao(itensReposicao, investimentoReposicao), {
      sucesso: () => toast.success('Lista de reposição copiada para a área de transferência com sucesso!'),
      erro: () => toast.error('Erro ao copiar a lista de reposição.'),
    })
  }

  /** Cria a cotação de reposição e abre a tela dedicada de Cotação. */
  const abrirCotacaoReposicao = (itens, agrupada, mensagem) => {
    const cotacao = montarCotacaoReposicao({
      id: gerarProximoNumeroCotacao(),
      itens,
      terceiros: carregarTerceirosCadastrados(),
      agrupada,
    })
    salvarCotacao(cotacao)
    toast.info(mensagem(cotacao))
    navigate(`${basePath}/compras/cotacao/${cotacao.id}`, { state: { cotacao } })
  }

  const cotarReposicao = (item) => {
    try {
      if (!item) {
        toast.warning('Item não informado para cotação.')
        return
      }
      abrirCotacaoReposicao([item], false, () => `Abrindo tela dedicada para cotar reposição de ${item.nome}.`)
    } catch (err) {
      console.error('Erro ao abrir cotação de reposição no estoque:', err)
      toast.error('Erro ao abrir a tela de cotação.')
    }
  }

  const cotarTodasReposicoes = () => {
    try {
      if (itensReposicao.length === 0) {
        toast.info('Não há itens com necessidade de reposição no momento.')
        return
      }
      abrirCotacaoReposicao(
        itensReposicao,
        true,
        (cotacao) => `Abrindo cotação agrupada com ${cotacao.itens.length} peças para reposição.`
      )
    } catch (err) {
      console.error('Erro ao abrir cotação agrupada no estoque:', err)
      toast.error('Erro ao abrir tela de cotação.')
    }
  }

  return {
    abaAtiva,
    setAbaAtiva,
    movimentacoes,
    metricas,
    pecasFiltradas,
    itensReposicao,
    investimentoReposicao,
    movimentacoesFiltradas,
    filtros: {
      busca,
      setBusca,
      filtroCategoria,
      selecionarCategoria: aoSelecionar(setFiltroCategoria, 'TODAS'),
      filtroStatusEstoque,
      selecionarStatus: aoSelecionar(setFiltroStatusEstoque, 'TODOS'),
      filtroOrdenacao,
      selecionarOrdenacao: aoSelecionar(setFiltroOrdenacao, 'NOME_ASC'),
      buscaKardex,
      setBuscaKardex,
      filtroTipoMovimento,
      selecionarTipoMovimento: aoSelecionar(setFiltroTipoMovimento, 'TODOS'),
    },
    modais: {
      modalMovimentoAberto,
      pecaParaMovimento,
      fecharMovimento: () => {
        setModalMovimentoAberto(false)
        setPecaParaMovimento(null)
      },
      modalPecaAberto,
      pecaParaEditar,
      fecharPeca: () => {
        setModalPecaAberto(false)
        setPecaParaEditar(null)
      },
    },
    acoes: {
      irPara: (rota) => navigate(`${basePath}/${rota}`),
      recarregar,
      abrirMovimento,
      abrirPeca,
      abrirKardexDaPeca,
      salvarPeca,
      excluirPeca,
      copiarListaReposicao,
      cotarReposicao,
      cotarTodasReposicoes,
    },
  }
}
