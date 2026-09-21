import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  ShoppingCart,
  Plus,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  ArrowsClockwise,
  ArrowDownLeft,
  ArrowUpRight,
  WarningCircle,
  Package,
  CurrencyDollar,
  TrendUp,
  Copy,
  Car,
  User,
  PencilSimple,
  Trash,
  Buildings,
  WhatsappLogo,
  ShareNetwork,
  ListBullets,
  FileText,
  Tag,
  Archive,
  ArrowSquareOut,
  Eye,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarPedidosCompra,
  salvarPedidosCompra,
  salvarPedidoCompra,
  excluirPedidoCompra,
  receberPedidoCompra,
  obterDemandasDasOSs,
  carregarCotacoes,
  salvarCotacoes,
  salvarCotacao,
  excluirCotacao,
  obterCotacaoPorOS,
  aprovarCotacaoEGerarPedido,
  STATUS_COMPRA_OPCOES,
} from '../../../constants/comprasData'
import {
  carregarPecasCadastradas,
  carregarTerceirosCadastrados,
} from '../../../constants/cadastrosSuprimentosData'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { CompraModalForm } from '../../../components/suprimentos/CompraModalForm'
import { PecaModalForm } from '../../../components/suprimentos/PecaModalForm'
import { VisualizarCotacaoModal } from '../../../components/suprimentos/VisualizarCotacaoModal'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { MobileComprasPage } from './mobile/MobileComprasPage'

// Helpers seguros de contatos e autopeças (Regra 5: sem & em labels)
const extrairTelefoneLimpo = (t) => {
  if (!t) return '43998544106'
  const tel = t.whatsapp || t.contatoTelefone || t.telefone || t.contato?.telefone || ''
  const limpo = String(tel).replace(/\D/g, '')
  return limpo.length >= 8 ? limpo : '43998544106'
}

const extrairTelefoneExibicao = (t) => {
  if (!t) return '(43) 3456-7890'
  return String(t.telefone || t.contatoTelefone || t.contato?.telefone || '(43) 3456-7890')
}

const filtrarFornecedoresAutoPecas = (terceiros) => {
  if (!Array.isArray(terceiros)) return []
  return terceiros.filter((t) => {
    const cat = String(t.categoria || t.categoriaFornecedor || '').toLowerCase()
    const ramo = String(t.ramoAtividade || t.tipoServico || '').toLowerCase()
    return (
      cat.includes('auto') ||
      cat.includes('peça') ||
      cat.includes('peca') ||
      cat.includes('distribuidora') ||
      ramo.includes('auto') ||
      ramo.includes('peça') ||
      ramo.includes('peca') ||
      ramo.includes('distribuidora')
    )
  })
}

export function ComprasPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const [abaAtiva, setAbaAtiva] = useState(() => location.state?.aba || 'pedidos') // 'pedidos' | 'demandas_os' | 'reposicao' | 'cotacoes'

  useEffect(() => {
    if (location.state?.aba) {
      setAbaAtiva(location.state.aba)
    }
  }, [location.state?.aba])

  // Estado para visualização da página pública de cotação
  const [cotacaoParaVisualizar, setCotacaoParaVisualizar] = useState(null)

  // Dados sincronizados
  const [pedidos, setPedidos] = useState([])
  const [cotacoes, setCotacoes] = useState([])
  const [demandasOS, setDemandasOS] = useState([])
  const [pecasCatalogo, setPecasCatalogo] = useState([])
  const [fornecedores, setFornecedores] = useState([])

  // Filtros da Aba Pedidos
  const [buscaPedidos, setBuscaPedidos] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroFornecedor, setFiltroFornecedor] = useState('TODOS')

  // Filtros da Aba Demandas OS
  const [buscaDemandas, setBuscaDemandas] = useState('')
  const [demandasSelecionadas, setDemandasSelecionadas] = useState([])

  // Filtros da Aba Cotações
  const [buscaCotacoes, setBuscaCotacoes] = useState('')
  const [filtroStatusCotacao, setFiltroStatusCotacao] = useState('TODOS')

  // Modais de Pedido de Compra
  const [modalCompraAberto, setModalCompraAberto] = useState(false)
  const [pedidoParaEditar, setPedidoParaEditar] = useState(null)
  const [demandaParaComprar, setDemandaParaComprar] = useState(null)

  // Modal para catalogação rápida de peça avulsa
  const [modalCatalogarAberto, setModalCatalogarAberto] = useState(false)
  const [dadosCatalogar, setDadosCatalogar] = useState(null)

  // Diálogos de Confirmação na Frente da Tela
  const [cotacaoParaExcluir, setCotacaoParaExcluir] = useState(null)
  const [pedidoParaReceber, setPedidoParaReceber] = useState(null)
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState(null)

  // Carrega e sincroniza dados em tempo real
  useEffect(() => {
    const sincronizarTudo = () => {
      setPedidos(carregarPedidosCompra())
      setCotacoes(carregarCotacoes())
      setDemandasOS(obterDemandasDasOSs())
      setPecasCatalogo(carregarPecasCadastradas())
      setFornecedores(carregarTerceirosCadastrados())
    }

    sincronizarTudo()

    window.addEventListener('storage', sincronizarTudo)
    window.addEventListener('dev_oficina_compras_updated', sincronizarTudo)
    window.addEventListener('dev_oficina_cotacoes_updated', sincronizarTudo)
    window.addEventListener('dev_oficina_estoque_updated', sincronizarTudo)
    window.addEventListener('dev_oficina_pecas_updated', sincronizarTudo)
    window.addEventListener('dev_oficina_ordens_updated', sincronizarTudo)

    return () => {
      window.removeEventListener('storage', sincronizarTudo)
      window.removeEventListener('dev_oficina_compras_updated', sincronizarTudo)
      window.removeEventListener('dev_oficina_cotacoes_updated', sincronizarTudo)
      window.removeEventListener('dev_oficina_estoque_updated', sincronizarTudo)
      window.removeEventListener('dev_oficina_pecas_updated', sincronizarTudo)
      window.removeEventListener('dev_oficina_ordens_updated', sincronizarTudo)
    }
  }, [])

  // Indicadores de Topo
  const metricas = useMemo(() => {
    const pedidosEmAberto = pedidos.filter(
      (p) => p.status === 'AGUARDANDO_ENTREGA' || p.status === 'EM_COTACAO'
    ).length

    const cotacoesAtivas = cotacoes.filter(
      (c) => c.status === 'EM_COTACAO' || c.status === 'RESPONDIDA'
    ).length

    const demandasPendentes = demandasOS.filter((d) => d.precisaComprar).length

    const valorEmAberto = pedidos
      .filter((p) => p.status === 'AGUARDANDO_ENTREGA' || p.status === 'EM_COTACAO')
      .reduce((acc, p) => acc + (Number(p.valorTotal) || 0), 0)

    const itensAbaixoMinimo = pecasCatalogo.filter((p) => {
      const atual = Number(p.estoqueAtual) || 0
      const min = Number(p.estoqueMinimo) || 0
      return atual <= min
    }).length

    const valorRecebidoTotal = pedidos
      .filter((p) => p.status === 'RECEBIDO')
      .reduce((acc, p) => acc + (Number(p.valorTotal) || 0), 0)

    return {
      pedidosEmAberto,
      cotacoesAtivas,
      demandasPendentes,
      valorEmAberto: valorEmAberto.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      itensAbaixoMinimo,
      valorRecebidoTotal: valorRecebidoTotal.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    }
  }, [pedidos, cotacoes, demandasOS, pecasCatalogo])

  // Filtragem de Pedidos
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const termo = buscaPedidos.toLowerCase().trim()
      const matchBusca =
        !termo ||
        pedido.numeroPedido?.toLowerCase().includes(termo) ||
        pedido.fornecedorNome?.toLowerCase().includes(termo) ||
        pedido.clienteNome?.toLowerCase().includes(termo) ||
        pedido.numeroOS?.toLowerCase().includes(termo) ||
        pedido.veiculoPlaca?.toLowerCase().includes(termo) ||
        pedido.responsavel?.toLowerCase().includes(termo)

      const matchStatus =
        filtroStatus === 'TODOS' || pedido.status === filtroStatus

      const matchFornecedor =
        filtroFornecedor === 'TODOS' || pedido.fornecedorId === filtroFornecedor

      return matchBusca && matchStatus && matchFornecedor
    })
  }, [pedidos, buscaPedidos, filtroStatus, filtroFornecedor])

  // Filtragem de Demandas das OSs
  const demandasFiltradas = useMemo(() => {
    return demandasOS.filter((demanda) => {
      const termo = buscaDemandas.toLowerCase().trim()
      const matchBusca =
        !termo ||
        demanda.numeroOS?.toLowerCase().includes(termo) ||
        demanda.clienteNome?.toLowerCase().includes(termo) ||
        demanda.veiculoPlaca?.toLowerCase().includes(termo) ||
        demanda.veiculoModelo?.toLowerCase().includes(termo) ||
        demanda.itemNome?.toLowerCase().includes(termo) ||
        demanda.itemCodigo?.toLowerCase().includes(termo)

      return matchBusca
    })
  }, [demandasOS, buscaDemandas])

  // Filtragem de Cotações
  const cotacoesFiltradas = useMemo(() => {
    return cotacoes.filter((cotacao) => {
      const termo = buscaCotacoes.toLowerCase().trim()
      const matchBusca =
        !termo ||
        cotacao.id?.toLowerCase().includes(termo) ||
        cotacao.numeroOS?.toLowerCase().includes(termo) ||
        cotacao.clienteNome?.toLowerCase().includes(termo) ||
        cotacao.veiculoPlaca?.toLowerCase().includes(termo) ||
        cotacao.veiculoModelo?.toLowerCase().includes(termo) ||
        (cotacao.itens &&
          cotacao.itens.some(
            (it) =>
              it.nome?.toLowerCase().includes(termo) ||
              it.codigo?.toLowerCase().includes(termo) ||
              it.marcaSugerida?.toLowerCase().includes(termo)
          ))

      const matchStatus =
        filtroStatusCotacao === 'TODOS' || cotacao.status === filtroStatusCotacao

      return matchBusca && matchStatus
    })
  }, [cotacoes, buscaCotacoes, filtroStatusCotacao])

  // Itens para Reposição de Almoxarifado
  const itensReposicaoAlmoxarifado = useMemo(() => {
    return pecasCatalogo
      .filter((p) => {
        const atual = Number(p.estoqueAtual) || 0
        const min = Number(p.estoqueMinimo) || 0
        return atual <= min
      })
      .map((p) => {
        const atual = Number(p.estoqueAtual) || 0
        const min = Number(p.estoqueMinimo) || 0
        const deficit = Math.max(0, min - atual)
        const sugestao = deficit > 0 ? deficit + min : min
        const custoTotal = sugestao * (Number(p.precoCusto) || 0)

        return {
          ...p,
          atual,
          min,
          deficit,
          sugestao,
          custoTotal,
        }
      })
      .sort((a, b) => a.atual - b.atual)
  }, [pecasCatalogo])

  // Opções para Filtros via react-select
  const opcoesFornecedoresFiltro = useMemo(() => {
    return [
      { value: 'TODOS', label: 'Todos os Fornecedores' },
      ...fornecedores.map((f) => ({
        value: f.id,
        label: f.nomeFantasia || f.razaoSocial,
      })),
    ]
  }, [fornecedores])

  const opcoesStatusCotacaoFiltro = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'EM_COTACAO', label: 'Em Cotação (Aguardando)' },
    { value: 'RESPONDIDA', label: 'Propostas Recebidas' },
    { value: 'APROVADA', label: 'Aprovada e Convertida' },
  ]

  // Handlers de Cotações - Redirecionamento para a Tela Dedicada
  const handleAbrirNovaCotacao = () => {
    navigate(`${basePath}/compras/cotacao/nova`)
  }

  const handleEditarCotacao = (cotacao) => {
    navigate(`${basePath}/compras/cotacao/${cotacao.id}`, { state: { cotacao } })
  }

  // AÇÃO CRUCIAL: Ao clicar para cotar peça na Demanda da OS, abre a Tela Dedicada de Cotação com a lista de peças
  const handleAbrirCotacaoDemanda = (demanda) => {
    let cotacaoExistente = demanda.numeroOS ? obterCotacaoPorOS(demanda.numeroOS) : null

    if (cotacaoExistente) {
      // Verifica se a peça solicitada já consta na lista de peças da cotação
      const jaPossuiItem = (cotacaoExistente.itens || []).some(
        (it) =>
          it.nome?.toLowerCase() === demanda.itemNome?.toLowerCase() ||
          (it.codigo && demanda.itemCodigo && it.codigo === demanda.itemCodigo)
      )

      if (!jaPossuiItem) {
        const itemNovo = {
          id: `it-${Date.now()}`,
          codigo: demanda.itemCodigo !== 'SEM CODIGO' ? demanda.itemCodigo : '',
          nome: demanda.itemNome,
          unidade: demanda.unidade || 'UN',
          quantidade: Number(demanda.quantidadeNecessaria || 1),
          marcaSugerida: demanda.itemMarcaSugerida || '',
          observacoes: `Solicitado na OS #${demanda.numeroOS}`,
          fotoUrl: '',
        }
        cotacaoExistente = {
          ...cotacaoExistente,
          itens: [...(cotacaoExistente.itens || []), itemNovo],
        }
        salvarCotacao(cotacaoExistente)
      }

      toast.info(`Abrindo tela dedicada da cotação #${cotacaoExistente.id} para a OS #${demanda.numeroOS}.`)
      navigate(`${basePath}/compras/cotacao/${cotacaoExistente.id}`, { state: { cotacao: cotacaoExistente } })
    } else {
      // Cria a nova cotação vinculada à OS e redireciona para a tela dedicada
      const novaId = gerarProximoNumeroCotacao()
      const terceiros = carregarTerceirosCadastrados()
      const ordens = obterOrdensAbertas()
      const osEncontrada = ordens.find((o) => String(o.numeroOS) === String(demanda.numeroOS))

      const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
      const fornecedoresBase = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)
      const fornecedoresIniciais = fornecedoresBase.map((t) => ({
        id: t.id,
        nome: t.nomeFantasia || t.razaoSocial || 'Fornecedor',
        telefone: extrairTelefoneExibicao(t),
        whatsapp: extrairTelefoneLimpo(t),
        cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
        status: 'AGUARDANDO',
        valorTotal: null,
        tempoEntrega: '1 a 2 horas',
        condicaoPagamento: 'Boleto 30 Dias',
        respostasItens: {},
      }))

      let itensCotacao = []
      if (osEncontrada && osEncontrada.pecasOS && osEncontrada.pecasOS.length > 0) {
        itensCotacao = osEncontrada.pecasOS.map((p, idx) => ({
          id: `it-${Date.now()}-${idx}`,
          codigo: p.codigo || '',
          nome: p.nome,
          unidade: p.unidade || 'UN',
          quantidade: Number(p.quantidade || 1),
          marcaSugerida: p.marca || '',
          observacoes: '',
          fotoUrl: '',
        }))
      } else {
        itensCotacao = [
          {
            id: `it-${Date.now()}-1`,
            codigo: demanda.itemCodigo !== 'SEM CODIGO' ? demanda.itemCodigo : '',
            nome: demanda.itemNome,
            unidade: demanda.unidade || 'UN',
            quantidade: Number(demanda.quantidadeNecessaria || 1),
            marcaSugerida: demanda.itemMarcaSugerida || '',
            observacoes: `Solicitado na OS #${demanda.numeroOS}`,
            fotoUrl: '',
          },
        ]
      }

      const novaCotacao = {
        id: novaId,
        numeroOS: demanda.numeroOS || '',
        clienteNome: demanda.clienteNome || osEncontrada?.cliente || '',
        clienteTelefone: demanda.clienteTelefone || osEncontrada?.telefone || '',
        veiculoPlaca: demanda.veiculoPlaca || osEncontrada?.placa || '',
        veiculoModelo: demanda.veiculoModelo || osEncontrada?.marcaModelo || '',
        ano: osEncontrada?.ano || '',
        km: osEncontrada?.km || '',
        mecanicoNome: osEncontrada?.mecanicoNome || 'Carlos Eduardo',
        status: 'EM_COTACAO',
        observacoes: `Cotação de peças para a Ordem de Serviço #${demanda.numeroOS}`,
        itens: itensCotacao,
        fornecedoresCotados: fornecedoresIniciais,
        fornecedorVencedorId: null,
        dataCriacao: new Date().toISOString(),
      }

      salvarCotacao(novaCotacao)
      toast.info(`Abrindo tela dedicada para cotar as peças da OS #${demanda.numeroOS}.`)
      navigate(`${basePath}/compras/cotacao/${novaId}`, { state: { cotacao: novaCotacao } })
    }
  }

  // Iniciar cotação com múltiplos itens selecionados na tela dedicada
  const handleGerarCotacaoAgrupada = () => {
    if (demandasSelecionadas.length === 0) {
      toast.warning('Selecione ao menos um item de OS para iniciar a cotação.')
      return
    }

    const selecionadas = demandasOS.filter((d) => demandasSelecionadas.includes(d.id))
    const itensParaCotacao = selecionadas.map((d, idx) => ({
      id: `it-${Date.now()}-${idx}`,
      codigo: d.itemCodigo !== 'SEM CODIGO' ? d.itemCodigo : '',
      nome: d.itemNome,
      unidade: d.unidade || 'UN',
      quantidade: Number(d.quantidadeNecessaria || 1),
      marcaSugerida: d.itemMarcaSugerida || '',
      observacoes: `Solicitado na OS #${d.numeroOS}`,
      fotoUrl: '',
    }))

    const todasMesmaOS = selecionadas.every((s) => s.numeroOS === selecionadas[0].numeroOS)
    const numeroOS = todasMesmaOS ? selecionadas[0].numeroOS : ''

    const novaId = gerarProximoNumeroCotacao()
    const terceiros = carregarTerceirosCadastrados()
    const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
    const fornecedoresBase = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)
    const fornecedoresIniciais = fornecedoresBase.map((t) => ({
      id: t.id,
      nome: t.nomeFantasia || t.razaoSocial || 'Fornecedor',
      telefone: extrairTelefoneExibicao(t),
      whatsapp: extrairTelefoneLimpo(t),
      cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
      status: 'AGUARDANDO',
      valorTotal: null,
      tempoEntrega: '1 a 2 horas',
      condicaoPagamento: 'Boleto 30 Dias',
      respostasItens: {},
    }))

    const novaCotacao = {
      id: novaId,
      numeroOS,
      clienteNome: todasMesmaOS ? selecionadas[0].clienteNome : '',
      clienteTelefone: todasMesmaOS ? selecionadas[0].clienteTelefone : '',
      veiculoPlaca: todasMesmaOS ? selecionadas[0].veiculoPlaca : '',
      veiculoModelo: todasMesmaOS ? selecionadas[0].veiculoModelo : '',
      ano: '',
      km: '',
      mecanicoNome: 'Carlos Eduardo',
      status: 'EM_COTACAO',
      observacoes: `Cotação de peças agrupadas contendo ${selecionadas.length} itens de OSs da oficina`,
      itens: itensParaCotacao,
      fornecedoresCotados: fornecedoresIniciais,
      fornecedorVencedorId: null,
      dataCriacao: new Date().toISOString(),
    }

    salvarCotacao(novaCotacao)
    toast.info(`Abrindo tela dedicada com os ${selecionadas.length} itens selecionados para cotação.`)
    navigate(`${basePath}/compras/cotacao/${novaId}`, { state: { cotacao: novaCotacao } })
  }

  // Aprovar cotação direto da lista da Aba 4
  const handleAprovarCotacaoDireto = (cotacao) => {
    const fornecedoresComValor = (cotacao.fornecedoresCotados || []).filter(
      (f) => f.valorTotal && Number(f.valorTotal) > 0
    )

    let vencedor = fornecedoresComValor[0] || cotacao.fornecedoresCotados?.[0]
    if (fornecedoresComValor.length > 1) {
      fornecedoresComValor.sort((a, b) => Number(a.valorTotal) - Number(b.valorTotal))
      vencedor = fornecedoresComValor[0]
    }

    if (!vencedor) {
      handleEditarCotacao(cotacao)
      toast.info('Abra a cotação para preencher os valores cotados pelo fornecedor.')
      return
    }

    try {
      const res = aprovarCotacaoEGerarPedido(cotacao.id, vencedor.id)
      setCotacoes(carregarCotacoes())
      setPedidos(carregarPedidosCompra())
      toast.success(
        `Cotação #${cotacao.id} aprovada! Pedido ${res.pedido.numeroPedido} gerado para ${vencedor.nome}.`
      )
    } catch (err) {
      toast.error(err.message || 'Erro ao aprovar cotação.')
    }
  }

  const handleExcluirCotacaoItem = (cotacao) => {
    setCotacaoParaExcluir(cotacao)
  }

  const confirmarExclusaoCotacaoItem = () => {
    if (!cotacaoParaExcluir) return
    excluirCotacao(cotacaoParaExcluir.id)
    setCotacoes(carregarCotacoes())
    toast.success(`Cotação ${cotacaoParaExcluir.id} excluída com sucesso.`)
    setCotacaoParaExcluir(null)
  }

  // Handlers de Pedidos de Compra
  const handleAbrirNovoPedido = () => {
    setPedidoParaEditar(null)
    setDemandaParaComprar(null)
    setModalCompraAberto(true)
  }

  const handleEditarPedido = (pedido) => {
    setPedidoParaEditar(pedido)
    setDemandaParaComprar(null)
    setModalCompraAberto(true)
  }

  const handleSalvarPedido = (dadosPedido) => {
    salvarPedidoCompra(dadosPedido)
    setPedidos(carregarPedidosCompra())
    toast.success(`Pedido ${dadosPedido.numeroPedido} salvo com sucesso!`)
  }

  const handleReceberPedido = (pedido) => {
    setPedidoParaReceber(pedido)
  }

  const confirmarRecebimentoPedido = () => {
    if (!pedidoParaReceber) return
    try {
      receberPedidoCompra(pedidoParaReceber.id, {
        documento: pedidoParaReceber.numeroPedido,
        responsavel: 'Rafael Almoxarife',
      })
      setPedidos(carregarPedidosCompra())
      setPecasCatalogo(carregarPecasCadastradas())
      setDemandasOS(obterDemandasDasOSs())

      toast.success(
        `Pedido ${pedidoParaReceber.numeroPedido} recebido com sucesso! Entrada concluída no estoque.`
      )
    } catch (err) {
      toast.error(err.message || 'Erro ao dar entrada no pedido.')
    } finally {
      setPedidoParaReceber(null)
    }
  }

  const handleExcluirPedido = (pedido) => {
    setPedidoParaExcluir(pedido)
  }

  const confirmarExclusaoPedido = () => {
    if (!pedidoParaExcluir) return
    excluirPedidoCompra(pedidoParaExcluir.id)
    setPedidos(carregarPedidosCompra())
    toast.success(`Pedido ${pedidoParaExcluir.numeroPedido} excluído com sucesso.`)
    setPedidoParaExcluir(null)
  }

  // Compartilhar pedido formatado via WhatsApp
  const handleCopiarPedidoWhatsApp = (pedido) => {
    let texto = `*PEDIDO DE COMPRA DE AUTOPEÇAS - MECÂNICA GABRIEL*\n`
    texto += `Pedido: *${pedido.numeroPedido}*\n`
    texto += `Fornecedor: ${pedido.fornecedorNome}\n`
    if (pedido.numeroOS) {
      texto += `Aplicação: OS #${pedido.numeroOS} (${pedido.veiculoModelo || pedido.veiculoPlaca})\n`
    }
    texto += `Data de Emissão: ${new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')}\n`
    if (pedido.previsaoEntrega) {
      texto += `Previsão de Entrega: ${pedido.previsaoEntrega}\n`
    }
    texto += `\n*ITENS SOLICITADOS:*\n`

    pedido.itens.forEach((it, idx) => {
      texto += `${idx + 1}. [${it.codigo || 'SKU'}] ${it.nome} - Qtd: *${it.quantidade} ${it.unidade || 'UN'}*\n`
    })

    texto += `\nValor Total: R$ ${Number(pedido.valorTotal || 0).toFixed(2)}\n`
    texto += `Condição de Pagamento: ${pedido.formaPagamento || 'Boleto'}\n`
    if (pedido.observacoes) {
      texto += `Observações: ${pedido.observacoes}\n`
    }

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        toast.success('Pedido copiado para a área de transferência! Pronto para colar no WhatsApp.')
      })
      .catch(() => {
        toast.error('Erro ao copiar o pedido.')
      })
  }

  // Copiar link de cotação para WhatsApp
  const handleCopiarLinkCotacaoWhatsApp = (cotacao) => {
    const url = `${window.location.origin}/cotacao/${cotacao.id}`
    let texto = `*COTAÇÃO DE AUTOPEÇAS - MECÂNICA GABRIEL*\n`
    texto += `Cotação: *#${cotacao.id}*\n`
    if (cotacao.veiculoPlaca || cotacao.veiculoModelo) {
      texto += `Veículo: ${cotacao.veiculoModelo || ''} (Placa: *${cotacao.veiculoPlaca}*)\n`
    }
    if (cotacao.numeroOS) {
      texto += `Aplicação: Ordem de Serviço #${cotacao.numeroOS}\n`
    }
    texto += `\n*Peças Solicitadas:*\n`
    ;(cotacao.itens || []).forEach((it, idx) => {
      texto += `${idx + 1}. [${it.codigo || 'SKU'}] ${it.nome} - Qtd: ${it.quantidade} ${it.unidade}`
      if (it.marcaSugerida) texto += ` (${it.marcaSugerida})`
      texto += `\n`
    })
    texto += `\n🔗 *Acesse e preencha seus preços no portal:*\n${url}`

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        toast.success('Link e lista de cotação copiados! Pronto para colar no WhatsApp dos fornecedores.')
      })
      .catch(() => {
        toast.error('Erro ao copiar a cotação.')
      })
  }

  // Ações da Aba de Demandas de OSs
  const handleAlternarSelecaoDemanda = (id) => {
    setDemandasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelecionarTodasDemandas = () => {
    if (demandasSelecionadas.length === demandasFiltradas.length) {
      setDemandasSelecionadas([])
    } else {
      setDemandasSelecionadas(demandasFiltradas.map((d) => d.id))
    }
  }

  // Compra Direta (Balcão) sem cotação
  const handleCompraDiretaDemanda = (demanda) => {
    setPedidoParaEditar(null)
    setDemandaParaComprar({
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
    setModalCompraAberto(true)
  }

  // Ação para catalogar item avulso da OS
  const handleAbrirCatalogarPeca = (demanda) => {
    setDadosCatalogar({
      codigo:
        demanda.itemCodigo !== 'SEM CODIGO'
          ? demanda.itemCodigo
          : `PEC-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: demanda.itemNome,
      unidade: demanda.unidade || 'UN',
      precoVenda: Number(demanda.precoEstimado || 0) * 1.8,
      precoCusto: Number(demanda.precoEstimado || 0),
      estoqueMinimo: 2,
      estoqueAtual: 0,
    })
    setModalCatalogarAberto(true)
  }

  const handleSalvarCatalogacaoPeca = (novaPeca) => {
    setPecasCatalogo(carregarPecasCadastradas())
    setDemandasOS(obterDemandasDasOSs())
    setModalCatalogarAberto(false)
    setDadosCatalogar(null)
    toast.success(`Item "${novaPeca.nome}" cadastrado no catálogo com sucesso!`)
  }

  // Ação da Aba de Reposição - Redireciona para Tela Dedicada de Cotação
  const handleCotarReposicao = (item) => {
    try {
      if (!item) {
        toast.warning('Item não informado para cotação de reposição.')
        return
      }

      const novaId = gerarProximoNumeroCotacao()
      const terceiros = carregarTerceirosCadastrados()
      const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
      const fornecedoresBase = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)

      const fornecedoresIniciais = fornecedoresBase.map((t) => ({
        id: t.id,
        nome: t.nomeFantasia || t.razaoSocial || 'Auto Peças Parceira',
        telefone: extrairTelefoneExibicao(t),
        whatsapp: extrairTelefoneLimpo(t),
        cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
        status: 'AGUARDANDO',
        valorTotal: null,
        tempoEntrega: '1 a 2 horas',
        condicaoPagamento: 'Boleto 30 Dias',
        respostasItens: {},
      }))

      const novaCotacao = {
        id: novaId,
        numeroOS: '',
        clienteNome: 'Almoxarifado Central',
        clienteTelefone: '(43) 3456-7890',
        veiculoPlaca: 'OFICINA',
        veiculoModelo: 'Reposição de Almoxarifado',
        ano: '',
        km: '',
        mecanicoNome: 'Rafael Almoxarife',
        status: 'EM_COTACAO',
        observacoes: `Cotação de reposição de estoque mínimo (${item.nome || 'Item'})`,
        itens: [
          {
            id: `it-${Date.now()}`,
            codigo: item.codigo || item.sku || '',
            nome: item.nome || item.descricao || 'Item de Reposição',
            unidade: item.unidade || 'UN',
            quantidade: Number(item.sugestao || item.sugestaoCompra || item.deficit || 1),
            marcaSugerida: item.marca || item.fabricante || '',
            observacoes: `Reposição de almoxarifado (Estoque atual: ${item.atual ?? item.estoqueAtual ?? 0} ${item.unidade || 'UN'})`,
            fotoUrl: '',
          },
        ],
        fornecedoresCotados: fornecedoresIniciais,
        fornecedorVencedorId: null,
        dataCriacao: new Date().toISOString(),
      }

      salvarCotacao(novaCotacao)
      toast.info(`Abrindo tela dedicada para cotar reposição de ${item.nome || 'peça'}.`)
      navigate(`${basePath}/compras/cotacao/${novaId}`, { state: { cotacao: novaCotacao } })
    } catch (err) {
      console.error('Erro ao abrir cotação de reposição:', err)
      toast.error('Não foi possível abrir a tela de cotação. Tente novamente.')
    }
  }

  // Cotação agrupada de todas as peças com necessidade de reposição
  const handleCotarTodasReposicoes = () => {
    try {
      if (itensReposicaoAlmoxarifado.length === 0) {
        toast.info('Não há itens demandando reposição no momento.')
        return
      }

      const novaId = gerarProximoNumeroCotacao()
      const terceiros = carregarTerceirosCadastrados()
      const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
      const fornecedoresBase = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)

      const fornecedoresIniciais = fornecedoresBase.map((t) => ({
        id: t.id,
        nome: t.nomeFantasia || t.razaoSocial || 'Auto Peças Parceira',
        telefone: extrairTelefoneExibicao(t),
        whatsapp: extrairTelefoneLimpo(t),
        cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
        status: 'AGUARDANDO',
        valorTotal: null,
        tempoEntrega: '1 a 2 horas',
        condicaoPagamento: 'Boleto 30 Dias',
        respostasItens: {},
      }))

      const itensFormatados = itensReposicaoAlmoxarifado.map((item, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        codigo: item.codigo || item.sku || '',
        nome: item.nome || item.descricao || 'Item de Reposição',
        unidade: item.unidade || 'UN',
        quantidade: Number(item.sugestao || item.sugestaoCompra || item.deficit || 1),
        marcaSugerida: item.marca || item.fabricante || '',
        observacoes: `Reposição de almoxarifado (Estoque atual: ${item.atual ?? item.estoqueAtual ?? 0} ${item.unidade || 'UN'})`,
        fotoUrl: '',
      }))

      const novaCotacao = {
        id: novaId,
        numeroOS: '',
        clienteNome: 'Almoxarifado Central',
        clienteTelefone: '(43) 3456-7890',
        veiculoPlaca: 'OFICINA',
        veiculoModelo: 'Reposição Completa de Almoxarifado',
        ano: '',
        km: '',
        mecanicoNome: 'Rafael Almoxarife',
        status: 'EM_COTACAO',
        observacoes: `Cotação de reposição do almoxarifado (${itensFormatados.length} itens)`,
        itens: itensFormatados,
        fornecedoresCotados: fornecedoresIniciais,
        fornecedorVencedorId: null,
        dataCriacao: new Date().toISOString(),
      }

      salvarCotacao(novaCotacao)
      toast.info(`Abrindo cotação com ${itensFormatados.length} peças para reposição.`)
      navigate(`${basePath}/compras/cotacao/${novaId}`, { state: { cotacao: novaCotacao } })
    } catch (err) {
      console.error('Erro ao abrir cotação agrupada de reposição:', err)
      toast.error('Erro ao abrir tela de cotação.')
    }
  }

  const handleCompraDiretaReposicao = (item) => {
    setPedidoParaEditar(null)
    setDemandaParaComprar({
      numeroOS: '',
      itemCodigo: item.codigo,
      itemNome: item.nome,
      unidade: item.unidade,
      sugestaoCompra: item.sugestao,
      precoCusto: item.precoCusto,
      pecaId: item.id,
      observacoes: `Pedido de reposição de estoque mínimo do almoxarifado (${item.nome})`,
    })
    setModalCompraAberto(true)
  }

  if (isMobile) {
    return <MobileComprasPage />
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header Executivo */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
              <ShoppingCart size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Compras e Cotações</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {pedidos.length} pedidos
                </span>
                {metricas.cotacoesAtivas > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                    {metricas.cotacoesAtivas} cotações ativas
                  </span>
                )}
                {metricas.demandasPendentes > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {metricas.demandasPendentes} demandas de OS
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500">
                Integração completa: Demandas de OS, cotação com autopeças, lista de peças, pedidos de compra e estoque
              </p>
            </div>
          </div>

          {/* Botões de Ação Principais (Regra 12) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/estoque`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Acessar controle de Estoque e Almoxarifado"
            >
              <Archive size={16} className="text-slate-500" />
              <span className="hidden md:inline">Almoxarifado</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`${basePath}/pecas`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Acessar catálogo de Peças e Produtos"
            >
              <Package size={16} className="text-slate-500" />
              <span className="hidden md:inline">Catálogo de Peças</span>
            </button>

            <button
              type="button"
              onClick={handleAbrirNovoPedido}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Registrar um pedido de compra direto de balcão (sem cotação)"
            >
              <Plus size={15} weight="bold" />
              <span>Novo Pedido Direto</span>
            </button>

            <button
              type="button"
              onClick={handleAbrirNovaCotacao}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Criar nova cotação de peças com fornecedores parceiros"
            >
              <ShareNetwork size={16} weight="bold" />
              <span>Nova Cotação de Peças</span>
            </button>
          </div>
        </div>

        {/* Resumo de Indicadores Executivos (Sem verde - Regra 7) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Pedidos em Aberto
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {metricas.pedidosEmAberto}
              </span>
            </div>
            <Clock size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Cotações Ativas
              </span>
              <span className="text-base font-bold text-[#0284c7] font-mono">
                {metricas.cotacoesAtivas} em cotação
              </span>
            </div>
            <ShareNetwork size={20} className="text-[#0284c7]" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Demandas de OS
              </span>
              <span
                className={`text-base font-bold ${
                  metricas.demandasPendentes > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {metricas.demandasPendentes} itens
              </span>
            </div>
            <Car
              size={20}
              className={metricas.demandasPendentes > 0 ? 'text-amber-500' : 'text-slate-400'}
            />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Total em Aberto
              </span>
              <span className="text-base font-bold text-sky-700 font-mono">
                R$ {metricas.valorEmAberto}
              </span>
            </div>
            <CurrencyDollar size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Total Recebido
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                R$ {metricas.valorRecebidoTotal}
              </span>
            </div>
            <CheckCircle size={20} className="text-slate-400" />
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setAbaAtiva('pedidos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === 'pedidos'
                ? 'bg-sky-50 text-[#0284c7] border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListBullets size={15} weight="bold" />
            <span>Pedidos de Compra</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200">
              {pedidosFiltrados.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('cotacoes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === 'cotacoes'
                ? 'bg-sky-50 text-[#0284c7] border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShareNetwork size={15} weight="bold" />
            <span>Cotações de Peças</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200">
              {cotacoesFiltradas.length}
            </span>
            {metricas.cotacoesAtivas > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-[#0284c7] font-bold">
                {metricas.cotacoesAtivas} ativas
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('demandas_os')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === 'demandas_os'
                ? 'bg-sky-50 text-[#0284c7] border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car size={15} weight="bold" />
            <span>Demandas das Ordens de Serviço</span>
            {metricas.demandasPendentes > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                {metricas.demandasPendentes}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('reposicao')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === 'reposicao'
                ? 'bg-sky-50 text-[#0284c7] border border-sky-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Archive size={15} weight="bold" />
            <span>Reposição de Almoxarifado</span>
            {itensReposicaoAlmoxarifado.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                {itensReposicaoAlmoxarifado.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ABA 1: PEDIDOS DE COMPRA */}
      {abaAtiva === 'pedidos' && (
        <>
          {/* Barra de Filtros */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center gap-3 shrink-0">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={buscaPedidos}
                onChange={(e) => setBuscaPedidos(e.target.value)}
                placeholder="Buscar por número do pedido, fornecedor, cliente, placa ou responsável..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              />
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="w-full sm:w-48">
                <Select
                  value={STATUS_COMPRA_OPCOES.find((opt) => opt.value === filtroStatus)}
                  onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
                  options={STATUS_COMPRA_OPCOES}
                  styles={customSelectStyles}
                  placeholder="Status"
                  isSearchable={false}
                />
              </div>

              <div className="w-full sm:w-56">
                <Select
                  value={opcoesFornecedoresFiltro.find((opt) => opt.value === filtroFornecedor)}
                  onChange={(opt) => setFiltroFornecedor(opt ? opt.value : 'TODOS')}
                  options={opcoesFornecedoresFiltro}
                  styles={customSelectStyles}
                  placeholder="Fornecedor"
                  isSearchable={true}
                />
              </div>
            </div>
          </div>

          {/* Tabela de Pedidos com Scroll Invisível (Regra 11) */}
          <div className="flex-1 overflow-auto no-scrollbar p-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {pedidosFiltrados.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Nenhum pedido de compra localizado</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {buscaPedidos || filtroStatus !== 'TODOS' || filtroFornecedor !== 'TODOS'
                      ? 'Nenhum pedido corresponde aos critérios de pesquisa selecionados.'
                      : 'Clique no botão acima para registrar o primeiro pedido de compra da oficina.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3 px-4">Pedido / Data</th>
                      <th className="py-3 px-4">Fornecedor</th>
                      <th className="py-3 px-4">Origem / Destino</th>
                      <th className="py-3 px-4 text-center">Itens</th>
                      <th className="py-3 px-4 text-right">Valor Total</th>
                      <th className="py-3 px-4 text-center">Previsão</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pedidosFiltrados.map((pedido) => {
                      const dataFormatada = new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')
                      const totalItens = pedido.itens ? pedido.itens.length : 0
                      const isRecebido = pedido.status === 'RECEBIDO'
                      const isAguardando = pedido.status === 'AGUARDANDO_ENTREGA'
                      const isCotacao = pedido.status === 'EM_COTACAO'
                      const isCancelado = pedido.status === 'CANCELADO'

                      return (
                        <tr key={pedido.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono">
                            <div className="font-bold text-slate-900">{pedido.numeroPedido}</div>
                            <div className="text-[11px] text-slate-500">{dataFormatada}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{pedido.fornecedorNome}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Buildings size={13} className="text-slate-400" />
                              <span>{pedido.formaPagamento || 'Boleto'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {pedido.numeroOS ? (
                              <div>
                                <span className="inline-flex items-center gap-1 font-semibold text-sky-900">
                                  <Car size={13} className="text-sky-600" />
                                  <span>OS #{pedido.numeroOS}</span>
                                </span>
                                <div className="text-[11px] text-slate-500 truncate max-w-xs">
                                  {pedido.veiculoPlaca} • {pedido.clienteNome}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-slate-600">
                                <Archive size={13} className="text-slate-400" />
                                <span>Reposição de Estoque</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="font-mono font-bold text-slate-900">
                              {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            R$ {Number(pedido.valorTotal || 0).toFixed(2)}
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600">
                            {pedido.previsaoEntrega
                              ? new Date(pedido.previsaoEntrega + 'T00:00:00').toLocaleDateString('pt-BR')
                              : 'Não definida'}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {isRecebido ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                <CheckCircle size={12} weight="bold" />
                                <span>Recebido</span>
                              </span>
                            ) : isAguardando ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock size={12} weight="bold" />
                                <span>Aguardando</span>
                              </span>
                            ) : isCotacao ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                Em Cotação
                              </span>
                            ) : isCancelado ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Cancelado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                Rascunho
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              {!isRecebido && (
                                <button
                                  type="button"
                                  onClick={() => handleReceberPedido(pedido)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 rounded-md text-[11px] font-bold transition-colors cursor-pointer mr-1"
                                  title="Dar entrada imediata das peças no estoque da oficina"
                                >
                                  <ArrowDownLeft size={13} weight="bold" />
                                  <span>Receber</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleCopiarPedidoWhatsApp(pedido)}
                                className="p-1.5 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded transition-colors cursor-pointer"
                                title="Copiar pedido formatado para o WhatsApp do fornecedor"
                              >
                                <Copy size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEditarPedido(pedido)}
                                className="p-1.5 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded transition-colors cursor-pointer"
                                title="Editar dados do pedido"
                              >
                                <PencilSimple size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleExcluirPedido(pedido)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Excluir pedido"
                              >
                                <Trash size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* ABA 2: COTAÇÕES DE PEÇAS COM FORNECEDORES */}
      {abaAtiva === 'cotacoes' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de Filtros da Aba de Cotações */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={buscaCotacoes}
                onChange={(e) => setBuscaCotacoes(e.target.value)}
                placeholder="Buscar por código de cotação, veículo, placa, cliente, OS ou nome da peça..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              />
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-full sm:w-56">
                <Select
                  value={opcoesStatusCotacaoFiltro.find((opt) => opt.value === filtroStatusCotacao)}
                  onChange={(opt) => setFiltroStatusCotacao(opt ? opt.value : 'TODOS')}
                  options={opcoesStatusCotacaoFiltro}
                  styles={customSelectStyles}
                  placeholder="Status da Cotação"
                  isSearchable={false}
                />
              </div>

              <button
                type="button"
                onClick={handleAbrirNovaCotacao}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Plus size={15} weight="bold" />
                <span>Nova Cotação</span>
              </button>
            </div>
          </div>

          {/* Listagem de Cotações com a Lista de Peças de cada uma */}
          <div className="flex-1 overflow-auto no-scrollbar p-6 space-y-4">
            {cotacoesFiltradas.length === 0 ? (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <ShareNetwork size={24} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Nenhuma cotação de peças localizada</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {buscaCotacoes || filtroStatusCotacao !== 'TODOS'
                    ? 'Nenhuma cotação corresponde aos critérios de pesquisa selecionados.'
                    : 'Inicie uma nova cotação ou envie as peças de uma Ordem de Serviço.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cotacoesFiltradas.map((cotacao) => {
                  const dataFormatada = new Date(cotacao.dataCriacao).toLocaleDateString('pt-BR')
                  const totalItens = cotacao.itens ? cotacao.itens.length : 0
                  const fornecedoresRespondidos = (cotacao.fornecedoresCotados || []).filter(
                    (f) => f.status === 'RESPONDIDA' && f.valorTotal > 0
                  )

                  // Menor valor total respondido
                  let menorValor = null
                  let fornecedorMenorValor = null
                  if (fornecedoresRespondidos.length > 0) {
                    const ordenados = [...fornecedoresRespondidos].sort(
                      (a, b) => Number(a.valorTotal) - Number(b.valorTotal)
                    )
                    menorValor = ordenados[0].valorTotal
                    fornecedorMenorValor = ordenados[0].nome
                  }

                  const isAprovada = cotacao.status === 'APROVADA'
                  const isRespondida = cotacao.status === 'RESPONDIDA' || fornecedoresRespondidos.length > 0

                  return (
                    <div
                      key={cotacao.id}
                      className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                        isAprovada
                          ? 'border-slate-300'
                          : isRespondida
                          ? 'border-sky-300 ring-1 ring-sky-100'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Topo do Card da Cotação */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center font-bold text-xs border border-sky-100 shrink-0">
                            <ShareNetwork size={20} weight="bold" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {cotacao.id}
                              </span>
                              {isAprovada ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#101828] text-white">
                                  <CheckCircle size={11} weight="fill" />
                                  <span>Cotação Aprovada</span>
                                </span>
                              ) : isRespondida ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                  <Clock size={11} weight="bold" />
                                  <span>Propostas Recebidas ({fornecedoresRespondidos.length})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock size={11} weight="bold" />
                                  <span>Aguardando Fornecedores</span>
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                              {cotacao.numeroOS ? (
                                <span className="font-semibold text-slate-800">
                                  Ordem de Serviço #{cotacao.numeroOS}
                                </span>
                              ) : (
                                <span>Reposição de Almoxarifado</span>
                              )}
                              <span>•</span>
                              <span>{dataFormatada}</span>
                              {cotacao.mecanicoNome && (
                                <>
                                  <span>•</span>
                                  <span>Mecânico: {cotacao.mecanicoNome}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Veículo e Cliente */}
                        <div className="sm:text-right">
                          <div className="font-bold text-slate-900 text-xs flex items-center sm:justify-end gap-1.5">
                            <Car size={15} className="text-slate-500" />
                            <span>{cotacao.veiculoModelo || 'Veículo em Manutenção'}</span>
                            {cotacao.veiculoPlaca && (
                              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800">
                                {cotacao.veiculoPlaca}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Cliente: {cotacao.clienteNome || 'Oficina / Balcão'}
                          </div>
                        </div>
                      </div>

                      {/* LISTA DE PEÇAS QUE ESTÃO EM COTAÇÃO (Destaque do usuário) */}
                      <div className="my-3.5 p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Package size={15} className="text-[#0284c7]" weight="bold" />
                            <span>Peças nesta cotação ({totalItens} {totalItens === 1 ? 'item' : 'itens'}):</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Especificações técnicas e marcas enviadas às autopeças
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                          {(cotacao.itens || []).map((it, idx) => (
                            <div
                              key={it.id || idx}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs flex items-start justify-between gap-2 shadow-2xs"
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">
                                  {it.nome}
                                </span>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                                  <span>Cód: {it.codigo || 'S/N'}</span>
                                  {it.marcaSugerida && (
                                    <span className="text-slate-700 font-semibold truncate">
                                      • {it.marcaSugerida}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] font-bold text-[11px] font-mono shrink-0">
                                {it.quantidade} {it.unidade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rodapé do Card com Fornecedores e Ações */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        {/* Status das Autopeças Cotadas */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-slate-600">Autopeças:</span>
                          {(cotacao.fornecedoresCotados || []).map((f) => {
                            const temPreco = f.status === 'RESPONDIDA' && f.valorTotal > 0
                            return (
                              <span
                                key={f.id}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                  temPreco
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                <span>{f.nome}</span>
                                {temPreco && (
                                  <strong className="font-mono text-slate-900">
                                    (R$ {Number(f.valorTotal).toFixed(2)})
                                  </strong>
                                )}
                              </span>
                            )
                          })}
                        </div>

                        {/* Ações da Cotação */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setCotacaoParaVisualizar(cotacao)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            title="Visualizar como a autopeça parceira enxerga esta página de cotação"
                          >
                            <Eye size={14} weight="bold" className="text-[#0284c7]" />
                            <span className="hidden lg:inline">Visualizar Página</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopiarLinkCotacaoWhatsApp(cotacao)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Copiar link da cotação para o WhatsApp dos fornecedores"
                          >
                            <Copy size={14} />
                            <span className="hidden md:inline">WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditarCotacao(cotacao)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sky-200 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Abrir cotação completa para visualizar itens e preencher preços"
                          >
                            <PencilSimple size={14} weight="bold" />
                            <span>Abrir Cotação</span>
                          </button>

                          {!isAprovada && (
                            <button
                              type="button"
                              onClick={() => handleAprovarCotacaoDireto(cotacao)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                              title="Aprovar a proposta e gerar o Pedido de Compra oficial"
                            >
                              <CheckCircle size={14} weight="bold" />
                              <span>Aprovar e Comprar</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleExcluirCotacaoItem(cotacao)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir cotação"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: DEMANDAS DAS ORDENS DE SERVIÇO */}
      {abaAtiva === 'demandas_os' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar das Demandas */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={buscaDemandas}
                onChange={(e) => setBuscaDemandas(e.target.value)}
                placeholder="Buscar por OS, cliente, placa, modelo do carro ou nome da peça solicitada..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              />
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {demandasSelecionadas.length > 0 && (
              <button
                type="button"
                onClick={handleGerarCotacaoAgrupada}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShareNetwork size={16} weight="bold" />
                <span>Iniciar Cotação com Itens Selecionados ({demandasSelecionadas.length})</span>
              </button>
            )}
          </div>

          {/* Tabela de Demandas de OSs */}
          <div className="flex-1 overflow-auto no-scrollbar p-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {demandasFiltradas.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Car size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Nenhuma demanda pendente de OS</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Todas as Ordens de Serviço abertas estão com peças supridas ou não há solicitações pendentes.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            demandasFiltradas.length > 0 &&
                            demandasSelecionadas.length === demandasFiltradas.length
                          }
                          onChange={handleSelecionarTodasDemandas}
                          className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Ordem de Serviço / Veículo</th>
                      <th className="py-3 px-4">Peça Solicitada pelo Mecânico</th>
                      <th className="py-3 px-4 text-center">Qtd. Necessária</th>
                      <th className="py-3 px-4 text-center">Saldo em Estoque</th>
                      <th className="py-3 px-4 text-center">Status no Catálogo</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {demandasFiltradas.map((demanda) => {
                      const selecionado = demandasSelecionadas.includes(demanda.id)

                      return (
                        <tr
                          key={demanda.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            selecionado ? 'bg-sky-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={selecionado}
                              onChange={() => handleAlternarSelecaoDemanda(demanda.id)}
                              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>OS #{demanda.numeroOS}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                                {demanda.veiculoPlaca}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {demanda.veiculoModelo} • {demanda.clienteNome}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{demanda.itemNome}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                              <span>Código: {demanda.itemCodigo}</span>
                              {demanda.itemMarcaSugerida && (
                                <span>• Marca sugerida: {demanda.itemMarcaSugerida}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                            {demanda.quantidadeNecessaria} {demanda.unidade}
                          </td>

                          <td className="py-3 px-4 text-center font-mono">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                demanda.estoqueAtual > 0
                                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {demanda.estoqueAtual} {demanda.unidade}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            {demanda.cadastradoNoCatalogo ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-[#0284c7] border border-sky-200">
                                <CheckCircle size={12} weight="bold" />
                                <span>Catalogado</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAbrirCatalogarPeca(demanda)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                                title="Item não está no catálogo. Clique para cadastrar agora."
                              >
                                <Plus size={11} weight="bold" />
                                <span>Item Avulso (Catalogar)</span>
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {/* Botão Principal: Cotar Peça (Abre tela de cotação com a lista de peças da OS) */}
                              <button
                                type="button"
                                onClick={() => handleAbrirCotacaoDemanda(demanda)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                                title="Abrir a tela de cotação com a lista de peças desta OS"
                              >
                                <ShareNetwork size={13} weight="bold" />
                                <span>Cotar Peça</span>
                              </button>

                              {/* Ação secundária: Compra direta de balcão (sem cotação) */}
                              <button
                                type="button"
                                onClick={() => handleCompraDiretaDemanda(demanda)}
                                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Comprar direto de balcão sem cotação"
                              >
                                <ShoppingCart size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: REPOSIÇÃO DE ALMOXARIFADO */}
      {abaAtiva === 'reposicao' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar da Reposição */}
          <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Archive size={18} className="text-[#0284c7]" />
                <span>Reposição de Almoxarifado</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Itens com estoque abaixo ou no nível mínimo necessário para operação da oficina
              </p>
            </div>

            {itensReposicaoAlmoxarifado.length > 0 && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCotarTodasReposicoes}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  title="Abrir tela dedicada para cotar todas as peças com necessidade de reposição"
                >
                  <ShareNetwork size={15} weight="bold" />
                  <span>Cotar Todas as Reposições ({itensReposicaoAlmoxarifado.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto no-scrollbar p-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {itensReposicaoAlmoxarifado.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} weight="fill" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Almoxarifado em Nível Adequado</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Nenhuma peça do catálogo atingiu o nível mínimo de reposição.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3 px-4">Código SKU</th>
                    <th className="py-3 px-4">Peça ou Produto</th>
                    <th className="py-3 px-4 text-center">Estoque Atual</th>
                    <th className="py-3 px-4 text-center">Estoque Mínimo</th>
                    <th className="py-3 px-4 text-center">Déficit</th>
                    <th className="py-3 px-4 text-center">Sugestão de Compra</th>
                    <th className="py-3 px-4 text-right">Custo Estimado</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {itensReposicaoAlmoxarifado.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {item.codigo}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.nome}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.categoria} • Local: {item.localizacao || 'Almoxarifado Central'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                            item.atual === 0
                              ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                              : 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                          }`}
                        >
                          {item.atual} {item.unidade || 'UN'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        {item.min} {item.unidade || 'UN'}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-rose-600 font-bold">
                        {item.deficit > 0 ? `-${item.deficit}` : '0'}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-extrabold text-[#0284c7]">
                        {item.sugestao} {item.unidade || 'UN'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        R$ {Number(item.custoTotal || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleCotarReposicao(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                            title="Cotar peça de reposição com autopeças"
                          >
                            <ShareNetwork size={13} weight="bold" />
                            <span>Cotar Reposição</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCompraDiretaReposicao(item)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Comprar reposição direto no balcão sem cotação"
                          >
                            <ShoppingCart size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      )}


      {/* Modal de Criação / Edição do Pedido de Compra Oficial */}
      <CompraModalForm
        isOpen={modalCompraAberto}
        onClose={() => {
          setModalCompraAberto(false)
          setPedidoParaEditar(null)
          setDemandaParaComprar(null)
        }}
        onSalvar={handleSalvarPedido}
        pedidoParaEditar={pedidoParaEditar}
        demandaInicial={demandaParaComprar}
      />

      {/* Modal para Catalogar Peça Avulsa Diretamente da OS */}
      <PecaModalForm
        isOpen={modalCatalogarAberto}
        onClose={() => {
          setModalCatalogarAberto(false)
          setDadosCatalogar(null)
        }}
        onSalvar={handleSalvarCatalogacaoPeca}
        pecaParaEditar={dadosCatalogar}
      />

      {/* Modal de Pré-visualização da Página de Cotação */}
      <VisualizarCotacaoModal
        isOpen={Boolean(cotacaoParaVisualizar)}
        onClose={() => setCotacaoParaVisualizar(null)}
        cotacaoId={cotacaoParaVisualizar?.id}
        cotacao={cotacaoParaVisualizar}
      />

      {/* Diálogo de Confirmação para Exclusão de Cotação */}
      <ModalConfirmacao
        isOpen={Boolean(cotacaoParaExcluir)}
        onClose={() => setCotacaoParaExcluir(null)}
        onConfirm={confirmarExclusaoCotacaoItem}
        titulo="Excluir esta cotação?"
        descricao="Esta ação removerá permanentemente o registro da cotação selecionada."
        itemDestaque={cotacaoParaExcluir ? `Cotação: #${cotacaoParaExcluir.id}` : ''}
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
      />

      {/* Diálogo de Confirmação para Recebimento de Pedido */}
      <ModalConfirmacao
        isOpen={Boolean(pedidoParaReceber)}
        onClose={() => setPedidoParaReceber(null)}
        onConfirm={confirmarRecebimentoPedido}
        titulo="Confirmar recebimento do pedido?"
        descricao="As peças darão entrada imediata no estoque e a OS vinculada será atualizada."
        itemDestaque={pedidoParaReceber ? `Pedido: ${pedidoParaReceber.numeroPedido}` : ''}
        textoConfirmar="Confirmar Entrada"
        textoCancelar="Cancelar"
        variante="primario"
      />

      {/* Diálogo de Confirmação para Exclusão de Pedido */}
      <ModalConfirmacao
        isOpen={Boolean(pedidoParaExcluir)}
        onClose={() => setPedidoParaExcluir(null)}
        onConfirm={confirmarExclusaoPedido}
        titulo="Excluir este pedido de compra?"
        descricao="Esta operação removerá o registro do pedido de compras."
        itemDestaque={pedidoParaExcluir ? `Pedido: ${pedidoParaExcluir.numeroPedido}` : ''}
        textoConfirmar="Sim, Excluir"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </div>
  )
}
