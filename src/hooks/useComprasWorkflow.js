import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  salvarPedidoCompra,
  excluirPedidoCompra,
  receberPedidoCompra,
  salvarCotacao,
  excluirCotacao,
  obterCotacaoPorOS,
  gerarProximoNumeroCotacao,
  aprovarCotacaoEGerarPedido,
} from '../constants/comprasData'
import { carregarTerceirosCadastrados } from '../constants/cadastrosSuprimentosData'
import { obterOrdensAbertas } from '../pages/dashboard/orcamento/mockOrdensAbertas'
import {
  incluirDemandaNaCotacao,
  montarCotacaoDaDemanda,
  montarCotacaoAgrupada,
  montarCotacaoReposicao,
} from '../utils/compras/cotacaoFabrica'
import {
  urlPublicaCotacao,
  textoPedidoCompra,
  textoResumoCotacao,
  copiarTexto,
} from '../utils/compras/mensagensWhatsApp'
import { useComprasDados } from './useComprasDados'

/** Proposta com o menor valor positivo; sem valores, o primeiro fornecedor cotado. */
function escolherVencedorDireto(cotacao) {
  const comValor = (cotacao.fornecedoresCotados || []).filter(
    (f) => f.valorTotal && Number(f.valorTotal) > 0
  )
  if (comValor.length === 0) return cotacao.fornecedoresCotados?.[0]
  return [...comValor].sort((a, b) => Number(a.valorTotal) - Number(b.valorTotal))[0]
}

/**
 * Workflow da tela de Compras e Cotações (Story 2.0 / ADR-003): abas, modais,
 * pedidos de compra, abertura de cotações (demanda de OS, agrupada e reposição),
 * aprovação direta, recebimento no estoque e compartilhamento via WhatsApp.
 *
 * @returns {object} Dados de `useComprasDados` somados a `abaAtiva`, `modais`,
 *   `selecao` (demandas marcadas) e `acoes` (handlers da tela).
 */
export function useComprasWorkflow() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'
  const dados = useComprasDados()
  const { demandasOS, demandasFiltradas, itensReposicao, recarregar } = dados

  const [abaAtiva, setAbaAtiva] = useState(() => location.state?.aba || 'pedidos')
  useEffect(() => {
    if (location.state?.aba) setAbaAtiva(location.state.aba)
  }, [location.state?.aba])

  const [demandasSelecionadas, setDemandasSelecionadas] = useState([])
  const [cotacaoParaVisualizar, setCotacaoParaVisualizar] = useState(null)
  const [modalCompraAberto, setModalCompraAberto] = useState(false)
  const [pedidoParaEditar, setPedidoParaEditar] = useState(null)
  const [demandaParaComprar, setDemandaParaComprar] = useState(null)
  const [dadosCatalogar, setDadosCatalogar] = useState(null)
  const [cotacaoParaExcluir, setCotacaoParaExcluir] = useState(null)
  const [pedidoParaReceber, setPedidoParaReceber] = useState(null)
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState(null)

  const irParaCotacao = (cotacao, mensagem) => {
    if (mensagem) toast.info(mensagem)
    navigate(`${basePath}/compras/cotacao/${cotacao.id}`, { state: { cotacao } })
  }

  const salvarEAbrirCotacao = (cotacao, mensagem) => {
    salvarCotacao(cotacao)
    irParaCotacao(cotacao, mensagem)
  }

  const abrirModalCompra = (demanda = null, pedido = null) => {
    setPedidoParaEditar(pedido)
    setDemandaParaComprar(demanda)
    setModalCompraAberto(true)
  }

  // ─── Cotações ──────────────────────────────────────────────────────────────
  const abrirCotacaoDemanda = (demanda) => {
    const existente = demanda.numeroOS ? obterCotacaoPorOS(demanda.numeroOS) : null
    if (existente) {
      const { cotacao, alterada } = incluirDemandaNaCotacao(existente, demanda)
      if (alterada) salvarCotacao(cotacao)
      irParaCotacao(cotacao, `Abrindo tela dedicada da cotação #${cotacao.id} para a OS #${demanda.numeroOS}.`)
      return
    }
    const os = obterOrdensAbertas().find((o) => String(o.numeroOS) === String(demanda.numeroOS))
    const cotacao = montarCotacaoDaDemanda({
      id: gerarProximoNumeroCotacao(),
      demanda,
      os,
      terceiros: carregarTerceirosCadastrados(),
    })
    salvarEAbrirCotacao(cotacao, `Abrindo tela dedicada para cotar as peças da OS #${demanda.numeroOS}.`)
  }

  const gerarCotacaoAgrupada = () => {
    if (demandasSelecionadas.length === 0) {
      toast.warning('Selecione ao menos um item de OS para iniciar a cotação.')
      return
    }
    const selecionadas = demandasOS.filter((d) => demandasSelecionadas.includes(d.id))
    const cotacao = montarCotacaoAgrupada({
      id: gerarProximoNumeroCotacao(),
      demandas: selecionadas,
      terceiros: carregarTerceirosCadastrados(),
    })
    salvarEAbrirCotacao(cotacao, `Abrindo tela dedicada com os ${selecionadas.length} itens selecionados para cotação.`)
  }

  const cotarReposicao = (item) => {
    try {
      if (!item) {
        toast.warning('Item não informado para cotação de reposição.')
        return
      }
      const cotacao = montarCotacaoReposicao({
        id: gerarProximoNumeroCotacao(),
        itens: [item],
        terceiros: carregarTerceirosCadastrados(),
      })
      salvarEAbrirCotacao(cotacao, `Abrindo tela dedicada para cotar reposição de ${item.nome || 'peça'}.`)
    } catch (err) {
      console.error('Erro ao abrir cotação de reposição:', err)
      toast.error('Não foi possível abrir a tela de cotação. Tente novamente.')
    }
  }

  const cotarTodasReposicoes = () => {
    try {
      if (itensReposicao.length === 0) {
        toast.info('Não há itens demandando reposição no momento.')
        return
      }
      const cotacao = montarCotacaoReposicao({
        id: gerarProximoNumeroCotacao(),
        itens: itensReposicao,
        terceiros: carregarTerceirosCadastrados(),
        agrupada: true,
      })
      salvarEAbrirCotacao(cotacao, `Abrindo cotação com ${cotacao.itens.length} peças para reposição.`)
    } catch (err) {
      console.error('Erro ao abrir cotação agrupada de reposição:', err)
      toast.error('Erro ao abrir tela de cotação.')
    }
  }

  const aprovarCotacaoDireto = (cotacao) => {
    const vencedor = escolherVencedorDireto(cotacao)
    if (!vencedor) {
      irParaCotacao(cotacao)
      toast.info('Abra a cotação para preencher os valores cotados pelo fornecedor.')
      return
    }
    try {
      const res = aprovarCotacaoEGerarPedido(cotacao.id, vencedor.id)
      recarregar.cotacoes()
      recarregar.pedidos()
      toast.success(`Cotação #${cotacao.id} aprovada! Pedido ${res.pedido.numeroPedido} gerado para ${vencedor.nome}.`)
    } catch (err) {
      toast.error(err.message || 'Erro ao aprovar cotação.')
    }
  }

  const confirmarExclusaoCotacao = () => {
    if (!cotacaoParaExcluir) return
    excluirCotacao(cotacaoParaExcluir.id)
    recarregar.cotacoes()
    toast.success(`Cotação ${cotacaoParaExcluir.id} excluída com sucesso.`)
    setCotacaoParaExcluir(null)
  }

  const copiarLinkCotacaoWhatsApp = (cotacao) =>
    copiarTexto(textoResumoCotacao(cotacao, urlPublicaCotacao(cotacao.id)), {
      sucesso: () => toast.success('Link e lista de cotação copiados! Pronto para colar no WhatsApp dos fornecedores.'),
      erro: () => toast.error('Erro ao copiar a cotação.'),
    })

  // ─── Pedidos de compra ─────────────────────────────────────────────────────
  const salvarPedido = (dadosPedido) => {
    salvarPedidoCompra(dadosPedido)
    recarregar.pedidos()
    toast.success(`Pedido ${dadosPedido.numeroPedido} salvo com sucesso!`)
  }

  const confirmarRecebimentoPedido = () => {
    if (!pedidoParaReceber) return
    try {
      receberPedidoCompra(pedidoParaReceber.id, {
        documento: pedidoParaReceber.numeroPedido,
        responsavel: 'Rafael Almoxarife',
      })
      recarregar.pedidos()
      recarregar.pecas()
      recarregar.demandas()
      toast.success(`Pedido ${pedidoParaReceber.numeroPedido} recebido com sucesso! Entrada concluída no estoque.`)
    } catch (err) {
      toast.error(err.message || 'Erro ao dar entrada no pedido.')
    } finally {
      setPedidoParaReceber(null)
    }
  }

  const confirmarExclusaoPedido = () => {
    if (!pedidoParaExcluir) return
    excluirPedidoCompra(pedidoParaExcluir.id)
    recarregar.pedidos()
    toast.success(`Pedido ${pedidoParaExcluir.numeroPedido} excluído com sucesso.`)
    setPedidoParaExcluir(null)
  }

  const copiarPedidoWhatsApp = (pedido) =>
    copiarTexto(textoPedidoCompra(pedido), {
      sucesso: () => toast.success('Pedido copiado para a área de transferência! Pronto para colar no WhatsApp.'),
      erro: () => toast.error('Erro ao copiar o pedido.'),
    })

  // ─── Demandas de OS e reposição ────────────────────────────────────────────
  const alternarSelecaoDemanda = (id) =>
    setDemandasSelecionadas((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))

  const selecionarTodasDemandas = () =>
    setDemandasSelecionadas(
      demandasSelecionadas.length === demandasFiltradas.length ? [] : demandasFiltradas.map((d) => d.id)
    )

  const compraDiretaDemanda = (demanda) =>
    abrirModalCompra({
      numeroOS: demanda.numeroOS,
      clienteNome: demanda.clienteNome,
      veiculoPlaca: demanda.veiculoPlaca,
      veiculoModelo: demanda.veiculoModelo,
      itemCodigo: demanda.itemCodigo,
      itemNome: demanda.itemNome,
      unidade: demanda.unidade,
      quantidadeNecessaria: demanda.quantidadeNecessaria,
      precoEstimado: demanda.precoEstimado,
      pecaId: demanda.pecaId,
    })

  const compraDiretaReposicao = (item) =>
    abrirModalCompra({
      numeroOS: '',
      itemCodigo: item.codigo,
      itemNome: item.nome,
      unidade: item.unidade,
      sugestaoCompra: item.sugestao,
      precoCusto: item.precoCusto,
      pecaId: item.id,
      observacoes: `Pedido de reposição de estoque mínimo do almoxarifado (${item.nome})`,
    })

  const abrirCatalogarPeca = (demanda) =>
    setDadosCatalogar({
      codigo:
        demanda.itemCodigo !== 'SEM CODIGO' ? demanda.itemCodigo : `PEC-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: demanda.itemNome,
      unidade: demanda.unidade || 'UN',
      precoVenda: Number(demanda.precoEstimado || 0) * 1.8,
      precoCusto: Number(demanda.precoEstimado || 0),
      estoqueMinimo: 2,
      estoqueAtual: 0,
    })

  const salvarCatalogacaoPeca = (novaPeca) => {
    recarregar.pecas()
    recarregar.demandas()
    setDadosCatalogar(null)
    toast.success(`Item "${novaPeca.nome}" cadastrado no catálogo com sucesso!`)
  }

  return {
    ...dados,
    abaAtiva,
    setAbaAtiva,
    selecao: { demandasSelecionadas, alternarSelecaoDemanda, selecionarTodasDemandas },
    modais: {
      modalCompraAberto,
      pedidoParaEditar,
      demandaParaComprar,
      fecharModalCompra: () => {
        setModalCompraAberto(false)
        setPedidoParaEditar(null)
        setDemandaParaComprar(null)
      },
      dadosCatalogar,
      fecharCatalogar: () => setDadosCatalogar(null),
      cotacaoParaVisualizar,
      setCotacaoParaVisualizar,
      cotacaoParaExcluir,
      setCotacaoParaExcluir,
      pedidoParaReceber,
      setPedidoParaReceber,
      pedidoParaExcluir,
      setPedidoParaExcluir,
    },
    acoes: {
      irPara: (rota) => navigate(`${basePath}/${rota}`),
      abrirNovaCotacao: () => navigate(`${basePath}/compras/cotacao/nova`),
      editarCotacao: (cotacao) => irParaCotacao(cotacao),
      abrirCotacaoDemanda,
      gerarCotacaoAgrupada,
      cotarReposicao,
      cotarTodasReposicoes,
      aprovarCotacaoDireto,
      confirmarExclusaoCotacao,
      copiarLinkCotacaoWhatsApp,
      abrirNovoPedido: () => abrirModalCompra(),
      editarPedido: (pedido) => abrirModalCompra(null, pedido),
      salvarPedido,
      confirmarRecebimentoPedido,
      confirmarExclusaoPedido,
      copiarPedidoWhatsApp,
      compraDiretaDemanda,
      compraDiretaReposicao,
      abrirCatalogarPeca,
      salvarCatalogacaoPeca,
    },
  }
}
