import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import {
  Wrench,
  ClipboardText,
  Coins,
  Package,
  ShoppingCart,
  CheckSquareOffset,
  MagnifyingGlassPlus,
  Users,
  ArrowsLeftRight,
  WarningOctagon,
  Hammer,
  CalendarDots,
  SquaresFour,
  CheckCircle,
  Clock,
  Car,
  Phone,
  WhatsappLogo,
  ArrowRight,
  Plus,
  MagnifyingGlass,
  Funnel,
  FileText,
  ShieldCheck,
  Tag,
  FloppyDisk,
  Warning,
  Sparkle,
  PencilSimple,
  Check,
  X,
  CaretRight,
  HandGrabbing,
} from '@phosphor-icons/react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useMecanico } from '../../context/MecanicoContext'
import {
  obterOrdensAbertas,
  atualizarStatusOrdem,
  salvarOrdemAberta,
  assumirOrdemSemMecanico,
  adicionarItemAdicional,
  STATUS_ORCAMENTO,
} from '../dashboard/orcamento/mockOrdensAbertas'
import { SEQUENCIA_STATUS, podeTransicionarPara, motivoBloqueioTransicao } from '../dashboard/orcamento/statusTransicao'
import { CATALOGO_PECAS_ESTOQUE, CATEGORIAS_PECAS } from '../../constants/catalogoPecasEstoque'
import { CATALOGO_SERVICOS_TABELA } from '../../constants/catalogoPecasServicos'
import { MOCK_CLIENTES_VEICULOS } from '../../constants/mockClientesVeiculos'
import { CATEGORIAS_PROBLEMAS } from '../../constants/problemasDiagnostico'
import { ITENS_CHECKLIST_ENTRADA, checklistCompleto } from '../../constants/checklistItems'
import { customSelectStyles } from '../../components/suprimentos/customSelectStyles'
import { MobileMecanicoHomeScreen } from '../../components/mecanico/mobile/MobileMecanicoHomeScreen'
import { MobileMecanicoOrdensPage } from '../../components/mecanico/mobile/MobileMecanicoOrdensPage'
import { MobileMecanicoComingSoon } from '../../components/mecanico/mobile/MobileMecanicoComingSoon'
import { toast } from 'sonner'

const OPCOES_URGENCIA_PEDIR = [
  { value: 'normal', label: 'Normal (Fluxo Padrão)' },
  { value: 'urgente', label: 'Urgente (Veículo no Elevador)' },
]

const OPCOES_DESTINO_PECA = [
  { value: 'Descarte Ambiental', label: 'Descarte Ambiental Responsável' },
  { value: 'Garantia do Fabricante', label: 'Acionamento de Garantia do Fabricante' },
  { value: 'Devolução ao Cliente', label: 'Devolução ao Cliente (Visualização)' },
]

const OPCOES_URGENCIA_FERRAMENTA = [
  { value: 'baixa', label: 'Baixa (Pode aguardar revisão mensal)' },
  { value: 'media', label: 'Média (Uso diário)' },
  { value: 'alta', label: 'Alta (Impede o andamento do trabalho)' },
]

export function MecanicoDashboardPage() {
  const {
    mecanicoAtivo,
    pecasDanificadas,
    adicionarPecaDanificada,
    ferramentasDanificadas,
    adicionarFerramentaDanificada,
    requisicoesPecas,
    pedirPecaParaOS,
  } = useMecanico()

  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Determina a aba ativa baseada na rota da URL
  const activeTabFromUrl = useMemo(() => {
    const path = location.pathname
    if (path.includes('/mecanico/ordens-servico')) return 'ordens-servico'
    if (path.includes('/mecanico/comissoes')) return 'comissoes'
    if (path.includes('/mecanico/diagnostico')) return 'diagnostico'
    if (path.includes('/mecanico/checklist')) return 'checklist'
    if (path.includes('/mecanico/servicos')) return 'servicos'
    if (path.includes('/mecanico/pedir-pecas')) return 'pedir-pecas'
    if (path.includes('/mecanico/estoque')) return 'estoque'
    if (path.includes('/mecanico/pecas-danificadas')) return 'pecas-danificadas'
    if (path.includes('/mecanico/ferramentas')) return 'ferramentas'
    if (path.includes('/mecanico/clientes')) return 'clientes'
    if (path.includes('/mecanico/leva-e-traz')) return 'leva-e-traz'
    if (path.includes('/mecanico/agenda')) return 'agenda'
    return 'dashboard'
  }, [location.pathname])

  const [activeTab, setActiveTab] = useState(activeTabFromUrl)

  useEffect(() => {
    setActiveTab(activeTabFromUrl)
  }, [activeTabFromUrl])

  // Lista de Ordens de Serviço carregadas do sistema
  const [ordens, setOrdens] = useState(() => obterOrdensAbertas())

  // OS atualmente selecionada para trabalho em bancada
  const [osSelecionadaId, setOsSelecionadaId] = useState(() => {
    const abertas = obterOrdensAbertas()
    const minha = abertas.find((o) => o.mecanicoNome === mecanicoAtivo.nome)
    return minha ? minha.numeroOS : (abertas[0]?.numeroOS || '002908')
  })

  // Recarregar ordens
  const recarregarOrdens = () => {
    const lista = obterOrdensAbertas()
    setOrdens(lista)
  }

  // OS ativa no workspace
  const osAtiva = useMemo(() => {
    return ordens.find((o) => String(o.numeroOS) === String(osSelecionadaId)) || ordens[0]
  }, [ordens, osSelecionadaId])

  // Ordens atribuídas ao mecânico ativo
  const ordensDoMecanico = useMemo(() => {
    return ordens.filter((o) => o.mecanicoNome === mecanicoAtivo.nome)
  }, [ordens, mecanicoAtivo.nome])

  // OS na Fila sem nenhum mecânico atribuído — qualquer mecânico pode "puxar" uma delas para
  // si e assumir o diagnóstico, sem depender da secretária escalar previamente.
  const ordensDisponiveis = useMemo(() => {
    return ordens.filter((o) => o.status === 'fila' && !(o.mecanicoId || (o.mecanicoNome && o.mecanicoNome !== 'Não atribuído')))
  }, [ordens])

  // Assume uma OS sem mecânico para o mecânico ativo
  const handlePuxarOrdem = (numeroOS) => {
    const resultado = assumirOrdemSemMecanico(numeroOS, mecanicoAtivo.value, mecanicoAtivo.nome)
    if (resultado.erro) {
      toast.warning(resultado.erro)
      return
    }
    recarregarOrdens()
    setOsSelecionadaId(numeroOS)
    setActiveTab('dashboard')
    toast.success(`OS #${numeroOS} atribuída a você! Preencha a vistoria e o diagnóstico para avançar.`)
  }

  // Métricas do Mecânico
  const metricasMecanico = useMemo(() => {
    const totalAtribuidas = ordensDoMecanico.length
    const emExecucao = ordensDoMecanico.filter(
      (o) => o.status === 'aprovado_execucao' || o.status === 'em_diagnostico'
    ).length
    const aguardandoPecas = ordensDoMecanico.filter(
      (o) => o.status === 'aguardando_pecas'
    ).length
    const concluidasHoje = ordensDoMecanico.filter(
      (o) => o.status === 'pronto_retirada'
    ).length

    // Cálculo da comissão sobre serviços executados
    const percComissao = (mecanicoAtivo.comissaoPerc || 15) / 100
    let totalMaoObra = 0

    ordensDoMecanico.forEach((o) => {
      const servicos = o.servicosOS || []
      servicos.forEach((s) => {
        const preco = parseFloat(s.precoUnitario || s.valorUnitario) || 0
        const qtd = parseFloat(s.quantidade) || 1
        const desc = parseFloat(s.desconto) || 0
        totalMaoObra += Math.max(0, preco * qtd - desc)
      })
    })

    const comissaoAcumulada = totalMaoObra * percComissao

    return {
      totalAtribuidas,
      emExecucao,
      aguardandoPecas,
      concluidasHoje,
      totalMaoObra,
      comissaoAcumulada,
      percComissao: mecanicoAtivo.comissaoPerc || 15,
    }
  }, [ordensDoMecanico, mecanicoAtivo])

  // Atualizar status de uma OS
  const handleAtualizarStatus = (numeroOS, novoStatus) => {
    atualizarStatusOrdem(numeroOS, novoStatus)
    recarregarOrdens()
    toast.success(`Status da OS #${numeroOS} atualizado com sucesso!`)
  }

  // =========================================================================
  // SUB-MÓDULO: ESTOQUE E PEDIDO DE PEÇAS
  // =========================================================================
  const [buscaEstoque, setBuscaEstoque] = useState('')
  const [categoriaEstoque, setCategoriaEstoque] = useState('Todas')
  const [qtdPedir, setQtdPedir] = useState(1)
  const [urgenciaPedir, setUrgenciaPedir] = useState('normal')

  const estoqueFiltrado = useMemo(() => {
    return CATALOGO_PECAS_ESTOQUE.filter((p) => {
      const matchBusca =
        !buscaEstoque ||
        p.nome.toLowerCase().includes(buscaEstoque.toLowerCase()) ||
        p.codigo.toLowerCase().includes(buscaEstoque.toLowerCase())
      const matchCat =
        categoriaEstoque === 'Todas' || p.categoria === categoriaEstoque
      return matchBusca && matchCat
    })
  }, [buscaEstoque, categoriaEstoque])

  const handleRequisitarPeca = (peca) => {
    if (!osAtiva) {
      toast.error('Selecione uma Ordem de Serviço ativa primeiro.')
      return
    }

    pedirPecaParaOS({
      numeroOS: osAtiva.numeroOS,
      veiculo: `${osAtiva.marcaModelo} (${osAtiva.placa})`,
      pecaNome: peca.nome,
      codigoPeca: peca.codigo,
      quantidade: qtdPedir,
      urgencia: urgenciaPedir,
    })

    // Adiciona também na lista de peças da OS ativa se não existir
    const novaPecaOS = {
      codigo: peca.codigo,
      nome: peca.nome,
      unidade: 'UN',
      quantidade: qtdPedir,
      precoUnitario: peca.precoUnitario,
      desconto: 0,
      marca: peca.marcaSugerida || 'Original',
      statusRequisicao: 'Requisitada pelo Mecânico',
    }

    const pecasAtuais = osAtiva.pecasOS || []
    const atualizadas = [...pecasAtuais, novaPecaOS]
    salvarOrdemAberta({
      ...osAtiva,
      pecasOS: atualizadas,
    })
    recarregarOrdens()
  }

  // =========================================================================
  // SUB-MÓDULO: LANÇAR SERVIÇOS
  // =========================================================================
  const [buscaServico, setBuscaServico] = useState('')

  const servicosFiltrados = useMemo(() => {
    return CATALOGO_SERVICOS_TABELA.filter((s) => {
      return (
        !buscaServico ||
        s.nome.toLowerCase().includes(buscaServico.toLowerCase()) ||
        s.codigo.toLowerCase().includes(buscaServico.toLowerCase())
      )
    })
  }, [buscaServico])

  const handleLancarServico = (serv) => {
    if (!osAtiva) {
      toast.error('Selecione uma Ordem de Serviço ativa primeiro.')
      return
    }

    const novoServico = {
      codigo: serv.codigo,
      nome: serv.nome,
      unidade: 'MO',
      quantidade: 1,
      precoUnitario: serv.precoPadrao || serv.valorUnitario || 0,
      desconto: 0,
      tempoHoras: serv.tempoEstimado || '1.0',
      mecanicoNome: mecanicoAtivo.nome,
    }

    const servicosAtuais = osAtiva.servicosOS || []
    const atualizados = [...servicosAtuais, novoServico]
    salvarOrdemAberta({
      ...osAtiva,
      servicosOS: atualizados,
    })
    recarregarOrdens()
    toast.success(`Serviço "${serv.nome}" vinculado à OS #${osAtiva.numeroOS}!`)
  }

  // =========================================================================
  // SUB-MÓDULO: DIAGNÓSTICO E LAUDO TÉCNICO
  // =========================================================================
  const [textoLaudo, setTextoLaudo] = useState(osAtiva?.laudoTecnico || '')

  useEffect(() => {
    setTextoLaudo(osAtiva?.laudoTecnico || '')
  }, [osAtiva?.numeroOS])

  const handleSalvarLaudo = () => {
    if (!osAtiva) return
    salvarOrdemAberta({
      ...osAtiva,
      laudoTecnico: textoLaudo,
    })
    recarregarOrdens()
    toast.success('Laudo técnico salvo na Ordem de Serviço!')
  }

  // =========================================================================
  // SUB-MÓDULO: CHECKLIST DA OS
  // =========================================================================
  // Mesmo shape usado em toda a vistoria de entrada do sistema (OsFormularioAbertura,
  // checklistCompleto, VistoriaEntradaClientePage): { status: 'conforme'|'nao_conforme'|'isento', obs }
  // — sem isso, o checklist preenchido aqui pelo mecânico nunca é reconhecido como completo
  // pelo gate de Diagnóstico (motivoImpedimentoDiagnostico).
  const [checklistLocal, setChecklistLocal] = useState(() => osAtiva?.checklistEntrada || {})

  useEffect(() => {
    setChecklistLocal(osAtiva?.checklistEntrada || {})
  }, [osAtiva?.numeroOS])

  const handleStatusItemChecklist = (itemId, status) => {
    setChecklistLocal((prev) => {
      const atual = prev[itemId] || { status: '', obs: '' }
      const novoStatus = atual.status === status ? '' : status
      return { ...prev, [itemId]: { ...atual, status: novoStatus } }
    })
  }

  const handleObsItemChecklist = (itemId, obs) => {
    setChecklistLocal((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || { status: '' }), obs } }))
  }

  const handleSalvarChecklist = () => {
    if (!osAtiva) return
    salvarOrdemAberta({
      ...osAtiva,
      checklistEntrada: checklistLocal,
    })
    recarregarOrdens()
    toast.success('Checklist veicular atualizado na Ordem de Serviço!')
  }

  // =========================================================================
  // SUB-MÓDULO: ITEM ADICIONAL ENCONTRADO NA EXECUÇÃO
  // =========================================================================
  const [itemAdicionalDescricao, setItemAdicionalDescricao] = useState('')
  const [itemAdicionalClassificacao, setItemAdicionalClassificacao] = useState('seguranca')
  const [itemAdicionalValor, setItemAdicionalValor] = useState('')

  const handleReportarItemAdicional = () => {
    if (!osAtiva) return
    const descricao = itemAdicionalDescricao.trim()
    if (!descricao) {
      toast.error('Descreva o item encontrado durante a execução.')
      return
    }
    adicionarItemAdicional(osAtiva.numeroOS, {
      descricao,
      categoria: 'peca',
      classificacao: itemAdicionalClassificacao,
      valorEstimado: parseFloat(itemAdicionalValor) || 0,
      criadoPor: { tipo: 'mecanico', nome: mecanicoAtivo.nome },
    })
    recarregarOrdens()

    const foneLimpo = (osAtiva.telefone || '').replace(/\D/g, '')
    const urgencia = itemAdicionalClassificacao === 'seguranca' ? 'segurança' : 'melhoria'
    const linkAprovacao = `${window.location.origin}/aprovacao/${osAtiva.numeroOS}`
    const msg = `Olá, *${osAtiva.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nDurante a execução da OS *#${osAtiva.numeroOS}* identificamos um item adicional de *${urgencia}*:\n"${descricao}"\n\nSua aprovação é necessária. Confira e responda pelo link:\n👉 ${linkAprovacao}`
    if (foneLimpo) {
      window.open(`https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(msg)}`, '_blank')
    }

    toast.success('Item adicional registrado e cliente notificado!')
    setItemAdicionalDescricao('')
    setItemAdicionalValor('')
  }

  // =========================================================================
  // SUB-MÓDULO: PEÇAS DANIFICADAS
  // =========================================================================
  const [modalNovaPecaDanificada, setModalNovaPecaDanificada] = useState(false)
  const [formPecaDanificada, setFormPecaDanificada] = useState({
    peca: '',
    codigoPeca: '',
    motivo: 'Desgaste severo e ressecamento térmico',
    tipoDestino: 'Descarte Ambiental',
  })

  const handleCriarPecaDanificada = (e) => {
    e.preventDefault()
    if (!formPecaDanificada.peca) {
      toast.error('Informe a descrição da peça danificada.')
      return
    }
    adicionarPecaDanificada({
      numeroOS: osAtiva?.numeroOS || 'Geral',
      veiculo: osAtiva ? `${osAtiva.marcaModelo} (${osAtiva.placa})` : 'Oficina',
      ...formPecaDanificada,
    })
    setFormPecaDanificada({
      peca: '',
      codigoPeca: '',
      motivo: 'Desgaste severo e ressecamento térmico',
      tipoDestino: 'Descarte Ambiental',
    })
    setModalNovaPecaDanificada(false)
  }

  // =========================================================================
  // SUB-MÓDULO: FERRAMENTAS DANIFICADAS
  // =========================================================================
  const [modalNovaFerramenta, setModalNovaFerramenta] = useState(false)
  const [formFerramenta, setFormFerramenta] = useState({
    ferramenta: '',
    problema: '',
    urgencia: 'media',
  })

  const handleCriarFerramentaDanificada = (e) => {
    e.preventDefault()
    if (!formFerramenta.ferramenta) {
      toast.error('Informe o nome da ferramenta.')
      return
    }
    adicionarFerramentaDanificada({
      ...formFerramenta,
    })
    setFormFerramenta({
      ferramenta: '',
      problema: '',
      urgencia: 'media',
    })
    setModalNovaFerramenta(false)
  }

  // =========================================================================
  // SUB-MÓDULO: LEVA E TRAZ
  // =========================================================================
  const servicosLevaETraz = [
    {
      id: 'lt-1',
      veiculo: 'Fiat Doblo 1.8 Cargo',
      placa: 'ASF6I46',
      cliente: 'Edgar Amaral da Silveira',
      tipo: 'Busca realizada',
      motorista: 'Paulo Guinchos',
      horario: 'Hoje às 12:45',
      status: 'Entregue na Oficina (Bancada Box 01)',
      statusCor: 'sky',
    },
    {
      id: 'lt-2',
      veiculo: 'VW Gol 1.6 Trend',
      placa: 'ABC1D23',
      cliente: 'Marcos Vinicius Rezende',
      tipo: 'Entrega agendada',
      motorista: 'Tiago Transportes',
      horario: 'Hoje às 17:30',
      status: 'Aguardando Teste Final da Oficina',
      statusCor: 'amber',
    },
    {
      id: 'lt-3',
      veiculo: 'Chevrolet Onix 1.0 Turbo',
      placa: 'BRA2E19',
      cliente: 'Luciana Ferreira Borges',
      tipo: 'Busca a domicílio',
      motorista: 'Paulo Guinchos',
      horario: 'Amanhã às 08:30',
      status: 'Agendado no Pátio',
      statusCor: 'zinc',
    },
  ]

  // =========================================================================
  // SUB-MÓDULO: AGENDA DO MECÂNICO
  // =========================================================================
  const agendaDoDia = [
    {
      horario: '08:00 - 10:30',
      veiculo: 'Fiat Doblo 1.8 Cargo (ASF6I46)',
      servico: 'Troca Tubo de Água do Coletor e Limpeza Arrefecimento',
      elevador: 'Box 01 (Elevador Hidráulico)',
      status: 'Em Andamento',
      osNumero: '002908',
    },
    {
      horario: '10:30 - 12:00',
      veiculo: 'VW Gol 1.6 Trend (ABC1D23)',
      servico: 'Troca de Discos e Pastilhas Dianteiras',
      elevador: 'Box 01 (Elevador Hidráulico)',
      status: 'Aguardando Aprovação de Peças',
      osNumero: '002909',
    },
    {
      horario: '13:30 - 15:30',
      veiculo: 'Chevrolet Onix 1.0 Turbo (BRA2E19)',
      servico: 'Substituição Amortecedores Dianteiros e Buchas',
      elevador: 'Box 01 (Elevador Hidráulico)',
      status: 'Agendado',
      osNumero: '002911',
    },
    {
      horario: '16:00 - 17:30',
      veiculo: 'Toyota Corolla 2.0 XEi (TYT5J88)',
      servico: 'Revisão Preventiva de 60.000 km e Troca de Fluidos',
      elevador: 'Box 01 (Elevador Hidráulico)',
      status: 'Agendado',
      osNumero: '002913',
    },
  ]

  // No mobile a experiência é outra (telas dedicadas, sem esta bancada em abas) — mesma
  // decisão de roteamento que já existia em MecanicoModulePlaceholder.jsx: a home vai para
  // MobileMecanicoHomeScreen, as demais rotas ainda caem no "Em breve" mobile.
  if (isMobile) {
    const isHome = location.pathname === '/mecanico/dashboard' || location.pathname === '/mecanico'
    if (isHome) return <MobileMecanicoHomeScreen />
    if (location.pathname === '/mecanico/ordens-servico') return <MobileMecanicoOrdensPage />
    return <MobileMecanicoComingSoon />
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden select-text">
      {/* 1. Barra de Resumo e Métricas da Bancada do Mecânico */}
      <header className="shrink-0 mb-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* OS sob Responsabilidade */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              Minhas OS no Pátio
            </span>
            <span className="text-xl font-black text-[#101828] mt-0.5 block font-mono">
              {metricasMecanico.totalAtribuidas}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#f2f4f7] flex items-center justify-center text-[#101828]">
            <ClipboardText size={19} weight="bold" />
          </div>
        </div>

        {/* Em Execução Hoje */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#0369a1] uppercase tracking-wider block">
              Em Execução
            </span>
            <span className="text-xl font-black text-[#0284c7] mt-0.5 block font-mono">
              {metricasMecanico.emExecucao}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-[#0284c7]">
            <Wrench size={19} weight="bold" />
          </div>
        </div>

        {/* Aguardando Peças */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Aguardando Peças
            </span>
            <span className="text-xl font-black text-amber-700 mt-0.5 block font-mono">
              {metricasMecanico.aguardandoPecas}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Package size={19} weight="bold" />
          </div>
        </div>

        {/* Pronto / Concluído */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#344054] uppercase tracking-wider block">
              Pronto para Retirada
            </span>
            <span className="text-xl font-black text-[#101828] mt-0.5 block font-mono">
              {metricasMecanico.concluidasHoje}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#101828] flex items-center justify-center text-white">
            <CheckCircle size={19} weight="bold" />
          </div>
        </div>

        {/* Peças Requisitadas */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              Requisições Balcão
            </span>
            <span className="text-xl font-black text-[#101828] mt-0.5 block font-mono">
              {requisicoesPecas.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#f2f4f7] flex items-center justify-center text-[#475467]">
            <ShoppingCart size={19} weight="bold" />
          </div>
        </div>

        {/* Minha Comissão Acumulada */}
        <div className="bg-white rounded-2xl border border-sky-300 p-3 shadow-2xs flex items-center justify-between bg-sky-50/40">
          <div>
            <span className="text-[10px] font-bold text-[#0369a1] uppercase tracking-wider block">
              Comissão ({metricasMecanico.percComissao}%)
            </span>
            <span className="text-lg font-black text-[#0284c7] mt-0.5 block font-mono">
              R$ {metricasMecanico.comissaoAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-xs">
            <Coins size={19} weight="bold" />
          </div>
        </div>
      </header>

      {/* 2. Seletor Rápido da Ordem de Serviço Ativa na Bancada */}
      <div className="shrink-0 bg-white border border-[#d0d5dd] rounded-2xl p-2.5 mb-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Wrench size={18} weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                VEÍCULO EM ATENDIMENTO NA SUA BANCADA:
              </span>
              <span className="px-2 py-0.2 bg-[#e0f2fe] text-[#0369a1] rounded text-[10px] font-bold font-mono">
                #{osAtiva?.numeroOS || '002908'}
              </span>
            </div>
            <p className="font-extrabold text-sm text-[#101828] truncate">
              {osAtiva?.marcaModelo || 'Veículo'} • Placa:{' '}
              <strong className="text-[#0284c7]">{osAtiva?.placa || 'SEM PLACA'}</strong> •{' '}
              <span className="font-semibold text-xs text-[#475467]">{osAtiva?.cliente}</span>
            </p>
          </div>
        </div>

        {/* Seletor de OS Atribuída — só entre as OS já assumidas por este mecânico */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#475467] hidden sm:inline shrink-0">Mudar OS Ativa:</label>
          <div className="w-64">
            <Select
              value={
                ordensDoMecanico.find((o) => o.numeroOS === osSelecionadaId)
                  ? {
                      value: osSelecionadaId,
                      label: `#${osAtiva?.numeroOS} - ${osAtiva?.marcaModelo} (${osAtiva?.placa})`,
                    }
                  : null
              }
              onChange={(opt) => opt && setOsSelecionadaId(opt.value)}
              options={ordensDoMecanico.map((o) => ({
                value: o.numeroOS,
                label: `#${o.numeroOS} - ${o.marcaModelo} (${o.placa}) - ${o.cliente.split(' ')[0]}`,
              }))}
              placeholder="Nenhuma OS atribuída a você"
              isSearchable={false}
              styles={customSelectStyles}
            />
          </div>

          {/* Botão para atualizar status rápido, respeitando a mesma sequência e os mesmos
              gates de bloqueio usados no Kanban de OS (secretaria/gestão) */}
          <button
            type="button"
            onClick={() => {
              if (!osAtiva) return
              const indiceAtual = SEQUENCIA_STATUS.indexOf(osAtiva.status)
              const proximoStatus = SEQUENCIA_STATUS[indiceAtual + 1]
              if (!proximoStatus) {
                toast.info('Esta OS já está na última etapa do fluxo.')
                return
              }
              const motivo = motivoBloqueioTransicao(osAtiva, proximoStatus)
              if (motivo) {
                toast.warning(motivo)
                return
              }
              handleAtualizarStatus(osAtiva.numeroOS, proximoStatus)
            }}
            className="h-8.5 px-3 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
            title="Avançar status da OS para a próxima etapa"
          >
            <CheckCircle size={15} weight="bold" />
            <span>Avançar Etapa</span>
          </button>
        </div>
      </div>

      {/* 3. Área de Trabalho Modular Principal (Abas Técnicas) */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs flex flex-col overflow-hidden">
        {/* Barra de Abas do Terminal do Mecânico */}
        <div className="shrink-0 bg-[#f8fafc] border-b border-[#e4e7ec] px-3 pt-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Minha Bancada', icon: SquaresFour },
            { id: 'ordens-servico', label: 'Minhas OS', icon: ClipboardText },
            { id: 'diagnostico', label: 'Diagnósticos', icon: MagnifyingGlassPlus },
            { id: 'checklist', label: 'Checklist da OS', icon: CheckSquareOffset },
            { id: 'pedir-pecas', label: 'Pedir Peças', icon: ShoppingCart },
            { id: 'estoque', label: 'Consulta Estoque', icon: Package },
            { id: 'servicos', label: 'Lançar Serviços', icon: Wrench },
            { id: 'comissoes', label: 'Minhas Comissões', icon: Coins },
            { id: 'pecas-danificadas', label: 'Peças Danificadas', icon: WarningOctagon },
            { id: 'ferramentas', label: 'Ferramentas', icon: Hammer },
            { id: 'agenda', label: 'Minha Agenda', icon: CalendarDots },
            { id: 'leva-e-traz', label: 'Leva e Traz', icon: ArrowsLeftRight },
            { id: 'clientes', label: 'Clientes e Veículos', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            const isTabActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  navigate(`/mecanico/${tab.id === 'dashboard' ? 'dashboard' : tab.id}`)
                }}
                className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isTabActive
                    ? 'border-[#0284c7] text-[#0284c7] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-[#667085] hover:text-[#101828] hover:bg-white/60'
                }`}
              >
                <Icon size={16} weight={isTabActive ? 'fill' : 'bold'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Conteúdo Dinâmico da Aba Selecionada */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 min-h-0">
          {/* ========================================================================= */}
          {/* ABA 1: VISÃO GERAL DA BANCADA */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {/* Coluna 1: OS Ativa em Detalhes */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e4e7ec] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#101828] text-white font-mono font-black text-xs">
                        {osAtiva?.placa}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#101828]">
                        {osAtiva?.marcaModelo} ({osAtiva?.ano})
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                      {STATUS_ORCAMENTO.find((s) => s.value === osAtiva?.status)?.label || osAtiva?.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <span className="text-[#667085] block text-[10px] font-bold uppercase">Cliente:</span>
                      <strong className="text-[#101828]">{osAtiva?.cliente}</strong>
                      <span className="text-[#475467] block mt-0.5">{osAtiva?.telefone}</span>
                    </div>
                    <div>
                      <span className="text-[#667085] block text-[10px] font-bold uppercase">KM de Entrada:</span>
                      <strong className="text-[#101828]">{osAtiva?.km} KM</strong>
                      <span className="text-[#475467] block mt-0.5">Combustível: {osAtiva?.combustivel}</span>
                    </div>
                    <div>
                      <span className="text-[#667085] block text-[10px] font-bold uppercase">Previsão de Entrega:</span>
                      <strong className="text-[#0284c7]">
                        {osAtiva?.previsaoEntregaData || 'A definir'} {osAtiva?.previsaoEntregaHora || ''}
                      </strong>
                    </div>
                  </div>

                  {/* Queixa do Cliente */}
                  <div className="bg-white border border-[#e4e7ec] rounded-xl p-3 text-xs mb-3">
                    <span className="text-[#667085] font-bold uppercase text-[10px] block mb-1">
                      Relato do Cliente (Queixa):
                    </span>
                    <p className="text-[#101828] italic leading-relaxed">
                      "{osAtiva?.relatoCliente || 'Nenhum relato informado na triagem.'}"
                    </p>
                  </div>

                  {/* Laudo Técnico Atual */}
                  <div className="bg-white border border-[#e4e7ec] rounded-xl p-3 text-xs">
                    <span className="text-[#667085] font-bold uppercase text-[10px] block mb-1">
                      Diagnóstico Técnico Registrado:
                    </span>
                    <p className="text-[#101828] leading-relaxed">
                      {osAtiva?.laudoTecnico || 'Aguardando preenchimento do laudo na bancada.'}
                    </p>
                  </div>

                  {/* Item Adicional Encontrado na Execução — só faz sentido com a OS já em
                      execução (aprovado_execucao); itens de segurança bloqueiam o avanço da
                      OS até o cliente responder (motivoImpedimentoAvancoPorItemAdicional) */}
                  {osAtiva?.status === 'aprovado_execucao' && (
                    <div className="bg-white border border-[#d0d5dd] rounded-xl p-3 text-xs mt-3 space-y-2">
                      <span className="text-[#667085] font-bold uppercase text-[10px] flex items-center gap-1.5">
                        <Warning size={13} weight="bold" className="text-[#0284c7]" />
                        Encontrou algo novo na execução?
                      </span>
                      <input
                        type="text"
                        value={itemAdicionalDescricao}
                        onChange={(e) => setItemAdicionalDescricao(e.target.value)}
                        placeholder="Ex: Coxim do motor trincado durante a desmontagem"
                        className="w-full h-9 px-2.5 rounded-lg border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-[#f8fafc] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={itemAdicionalValor}
                          onChange={(e) => setItemAdicionalValor(e.target.value)}
                          placeholder="Valor estimado R$"
                          className="h-8.5 px-2.5 rounded-lg border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7]"
                        />
                        <div className="grid grid-cols-2 gap-0.5 bg-[#f8fafc] p-0.5 rounded-lg border border-[#d0d5dd]">
                          <button
                            type="button"
                            onClick={() => setItemAdicionalClassificacao('seguranca')}
                            className={`h-7.5 rounded text-[10px] font-bold cursor-pointer ${
                              itemAdicionalClassificacao === 'seguranca' ? 'bg-rose-600 text-white' : 'text-[#667085]'
                            }`}
                          >
                            Segurança
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemAdicionalClassificacao('opcional')}
                            className={`h-7.5 rounded text-[10px] font-bold cursor-pointer ${
                              itemAdicionalClassificacao === 'opcional' ? 'bg-[#101828] text-white' : 'text-[#667085]'
                            }`}
                          >
                            Opcional
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleReportarItemAdicional}
                        className="w-full h-9 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer active:scale-95 transition-all"
                      >
                        Reportar e Notificar Cliente
                      </button>
                    </div>
                  )}
                </div>

                {/* Peças e Serviços da OS */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Peças Vinculadas */}
                  <div className="border border-[#e4e7ec] rounded-2xl p-3 bg-[#fcfcfd]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-[#101828] flex items-center gap-1.5">
                        <Package size={15} weight="bold" className="text-[#0284c7]" />
                        Peças na OS ({osAtiva?.pecasOS?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('pedir-pecas')}
                        className="text-[11px] font-bold text-[#0284c7] hover:underline"
                      >
                        + Pedir Peça
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                      {osAtiva?.pecasOS?.map((p, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-[#e4e7ec] rounded-xl p-2 text-xs flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-[#101828] truncate">{p.nome}</p>
                            <span className="text-[10px] text-[#667085]">
                              {p.quantidade} {p.unidade || 'UN'} • Cód: {p.codigo}
                            </span>
                          </div>
                          <span className="font-black text-[#101828] shrink-0 font-mono">
                            R$ {Number(p.precoUnitario || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Serviços e Mão de Obra */}
                  <div className="border border-[#e4e7ec] rounded-2xl p-3 bg-[#fcfcfd]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-[#101828] flex items-center gap-1.5">
                        <Wrench size={15} weight="bold" className="text-[#0284c7]" />
                        Serviços na OS ({osAtiva?.servicosOS?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('servicos')}
                        className="text-[11px] font-bold text-[#0284c7] hover:underline"
                      >
                        + Lançar Serviço
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                      {osAtiva?.servicosOS?.map((s, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-[#e4e7ec] rounded-xl p-2 text-xs flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-[#101828] truncate">{s.nome}</p>
                            <span className="text-[10px] text-[#667085]">
                              {s.tempoHoras ? `${s.tempoHoras}h` : 'Mão de obra'} • Cód: {s.codigo}
                            </span>
                          </div>
                          <span className="font-black text-[#101828] shrink-0 font-mono">
                            R$ {Number(s.precoUnitario || s.valorUnitario || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Ações Rápidas, Requisições e Agenda */}
              <div className="space-y-4">
                {/* Ações Técnicas Imediatas */}
                <div className="border border-[#e4e7ec] rounded-2xl p-3.5 bg-white space-y-2">
                  <h4 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
                    Ações na Bancada
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('checklist')}
                      className="p-2.5 rounded-xl border border-[#d0d5dd] hover:bg-[#f8fafc] text-[#101828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 text-center"
                    >
                      <CheckSquareOffset size={20} weight="bold" className="text-[#0284c7]" />
                      <span>Fazer Checklist</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('diagnostico')}
                      className="p-2.5 rounded-xl border border-[#d0d5dd] hover:bg-[#f8fafc] text-[#101828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 text-center"
                    >
                      <MagnifyingGlassPlus size={20} weight="bold" className="text-[#0284c7]" />
                      <span>Editar Laudo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('pedir-pecas')}
                      className="p-2.5 rounded-xl border border-[#d0d5dd] hover:bg-[#f8fafc] text-[#101828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 text-center"
                    >
                      <ShoppingCart size={20} weight="bold" className="text-[#0284c7]" />
                      <span>Pedir Peça</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('pecas-danificadas')}
                      className="p-2.5 rounded-xl border border-[#d0d5dd] hover:bg-[#f8fafc] text-[#101828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 text-center"
                    >
                      <WarningOctagon size={20} weight="bold" className="text-amber-600" />
                      <span>Peça Danificada</span>
                    </button>
                  </div>
                </div>

                {/* Requisições Recentes de Peças */}
                <div className="border border-[#e4e7ec] rounded-2xl p-3.5 bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
                      Requisições ao Almoxarifado
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#101828] text-white">
                      {requisicoesPecas.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {requisicoesPecas.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white border border-[#e4e7ec] rounded-xl p-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#101828]">{req.pecaNome}</span>
                          <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                            {req.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#667085]">
                          <span>Qtd: {req.quantidade} un • OS #{req.numeroOS}</span>
                          <span>{req.dataHora}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agenda de Horários Hoje */}
                <div className="border border-[#e4e7ec] rounded-2xl p-3.5 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
                      Minha Escala Hoje
                    </span>
                    <CalendarDots size={16} weight="bold" className="text-[#0284c7]" />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {agendaDoDia.slice(0, 3).map((ag, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-[#101828] block">{ag.horario}</span>
                          <span className="text-[11px] text-[#475467] truncate block max-w-[180px]">
                            {ag.veiculo}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-50 text-[#0284c7] shrink-0">
                          {ag.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: MINHAS ORDENS DE SERVIÇO */}
          {/* ========================================================================= */}
          {activeTab === 'ordens-servico' && (
            <div className="space-y-4">
              {/* Fila Disponível para Atendimento — OS sem mecânico atribuído que qualquer
                  mecânico pode puxar para si (D4: só funciona em OS ainda sem atribuição) */}
              {ordensDisponiveis.length > 0 && (
                <div className="border border-[#bae6fd] rounded-2xl overflow-hidden divide-y divide-[#e0f2fe] bg-[#f0f9ff]">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0369a1] flex items-center gap-1.5">
                        <HandGrabbing size={15} weight="bold" />
                        Fila Disponível para Atendimento
                      </h3>
                      <p className="text-xs text-[#0369a1]/80">
                        OS na Fila sem mecânico escalado — puxe uma delas para começar a vistoria e o diagnóstico.
                      </p>
                    </div>
                  </div>
                  {ordensDisponiveis.map((os) => (
                    <div key={os.numeroOS} className="px-4 py-3 flex items-center justify-between gap-3 bg-white text-xs">
                      <div className="min-w-0 flex-1 grid grid-cols-3 gap-3">
                        <div className="min-w-0">
                          <span className="font-mono font-black text-sm text-[#101828] block">#{os.numeroOS}</span>
                          <span className="font-mono text-[11px] text-[#0284c7] font-bold">{os.placa}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[#101828] block truncate">{os.marcaModelo}</span>
                          <span className="text-[11px] text-[#667085] block truncate">{os.cliente}</span>
                        </div>
                        <p className="text-[11px] text-[#475467] truncate" title={os.relatoCliente}>
                          {os.relatoCliente || 'Sem relato'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePuxarOrdem(os.numeroOS)}
                        className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <HandGrabbing size={14} weight="bold" />
                        Puxar OS
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#101828]">
                    Ordens de Serviço Atribuídas a {mecanicoAtivo.nome}
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Acompanhe o andamento de cada veículo, atualize etapas e abra detalhes da bancada.
                  </p>
                </div>
              </div>

              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white">
                <div className="bg-[#f8fafc] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                  <div className="col-span-1">Nº OS</div>
                  <div className="col-span-2">Veículo e Placa</div>
                  <div className="col-span-3">Cliente e Contato</div>
                  <div className="col-span-2">Diagnóstico / Queixa</div>
                  <div className="col-span-2">Status da OS</div>
                  <div className="col-span-2 text-right">Ações de Bancada</div>
                </div>

                {ordensDoMecanico.map((os) => {
                  const isSelected = os.numeroOS === osSelecionadaId
                  return (
                    <div
                      key={os.numeroOS}
                      className={`px-4 py-3 grid grid-cols-12 gap-3 items-center text-xs transition-colors border-l-4 ${
                        isSelected
                          ? 'bg-[#f0f9ff] border-l-[#0284c7]'
                          : 'hover:bg-[#f8fafc] border-l-transparent'
                      }`}
                    >
                      <div className="col-span-1 font-mono font-black text-sm text-[#101828]">
                        #{os.numeroOS}
                      </div>
                      <div className="col-span-2 min-w-0">
                        <span className="font-bold text-[#101828] block truncate">{os.marcaModelo}</span>
                        <span className="font-mono text-[11px] text-[#0284c7] font-bold">{os.placa}</span>
                      </div>
                      <div className="col-span-3 min-w-0">
                        <span className="font-semibold text-[#101828] block truncate">{os.cliente}</span>
                        <span className="text-[11px] text-[#667085]">{os.telefone}</span>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <p className="text-[11px] text-[#475467] truncate" title={os.relatoCliente}>
                          {os.relatoCliente || 'Sem relato'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Select
                          value={STATUS_ORCAMENTO.find((s) => s.value === os.status) || null}
                          onChange={(opt) => {
                            if (!opt || opt.value === os.status) return
                            if (!podeTransicionarPara(os.status, opt.value)) {
                              toast.warning('Só é possível mover a OS para a etapa anterior ou a etapa seguinte, sem pular colunas.')
                              return
                            }
                            const motivo = motivoBloqueioTransicao(os, opt.value)
                            if (motivo) {
                              toast.warning(motivo)
                              return
                            }
                            handleAtualizarStatus(os.numeroOS, opt.value)
                          }}
                          options={SEQUENCIA_STATUS.map((s) => STATUS_ORCAMENTO.find((opt) => opt.value === s)).filter(Boolean)}
                          isOptionDisabled={(opt) => !podeTransicionarPara(os.status, opt.value)}
                          isSearchable={false}
                          styles={customSelectStyles}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOsSelecionadaId(os.numeroOS)
                            setActiveTab('dashboard')
                          }}
                          className="px-3 py-1.5 bg-[#101828] hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer"
                        >
                          Trabalhar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: MINHAS COMISSÕES */}
          {/* ========================================================================= */}
          {activeTab === 'comissoes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-[#0369a1] uppercase">Taxa de Comissão</span>
                  <span className="text-2xl font-black text-[#0284c7] block mt-1 font-mono">
                    {metricasMecanico.percComissao}%
                  </span>
                  <span className="text-[11px] text-[#475467] block mt-0.5">Sobre serviços de oficina</span>
                </div>

                <div className="p-4 bg-white border border-[#d0d5dd] rounded-2xl">
                  <span className="text-[10px] font-bold text-[#667085] uppercase">Total de Mão de Obra</span>
                  <span className="text-2xl font-black text-[#101828] block mt-1 font-mono">
                    R$ {metricasMecanico.totalMaoObra.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-[#475467] block mt-0.5">Serviços executados</span>
                </div>

                <div className="p-4 bg-[#101828] text-white rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Comissão Acumulada</span>
                  <span className="text-2xl font-black text-[#38bdf8] block mt-1 font-mono">
                    R$ {metricasMecanico.comissaoAcumulada.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-gray-300 block mt-0.5">Disponível no fechamento</span>
                </div>

                <div className="p-4 bg-white border border-[#d0d5dd] rounded-2xl">
                  <span className="text-[10px] font-bold text-[#667085] uppercase">Previsão Mensal</span>
                  <span className="text-2xl font-black text-[#101828] block mt-1 font-mono">
                    R$ {(metricasMecanico.comissaoAcumulada * 3.5).toFixed(2)}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Meta em 85%</span>
                </div>
              </div>

              {/* Detalhamento de cada serviço e comissão */}
              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
                <div className="p-3.5 bg-[#f8fafc] border-b border-[#e4e7ec] font-extrabold text-xs text-[#101828] uppercase tracking-wider">
                  Extrato de Serviços e Comissões do Mecânico
                </div>
                <div className="divide-y divide-[#f2f4f7]">
                  {ordensDoMecanico.flatMap((os) =>
                    (os.servicosOS || []).map((s, idx) => {
                      const valor = (s.precoUnitario || s.valorUnitario || 0) * (s.quantidade || 1)
                      const comissao = valor * (metricasMecanico.percComissao / 100)
                      return (
                        <div key={`${os.numeroOS}-${idx}`} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc]">
                          <div>
                            <span className="font-bold text-[#101828] block">{s.nome}</span>
                            <span className="text-[#667085] text-[11px]">
                              OS #{os.numeroOS} • {os.marcaModelo} ({os.placa}) • Cód: {s.codigo}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#101828] block font-mono">
                              R$ {valor.toFixed(2)}
                            </span>
                            <span className="text-[11px] font-black text-[#0284c7] block font-mono">
                              Comissão: R$ {comissao.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 4: DIAGNÓSTICOS E LAUDO TÉCNICO */}
          {/* ========================================================================= */}
          {activeTab === 'diagnostico' && (
            <div className="space-y-4">
              <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-[#101828]">
                    Laudo Técnico da OS #{osAtiva?.numeroOS} - {osAtiva?.marcaModelo}
                  </h4>
                  <button
                    type="button"
                    onClick={handleSalvarLaudo}
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <FloppyDisk size={16} weight="bold" />
                    <span>Salvar Laudo Técnico</span>
                  </button>
                </div>

                <textarea
                  value={textoLaudo}
                  onChange={(e) => setTextoLaudo(e.target.value)}
                  rows={6}
                  placeholder="Descreva detalhadamente o parecer técnico, falhas encontradas nos testes de bancada e recomendações de serviço..."
                  className="w-full p-3 bg-white border border-[#d0d5dd] rounded-xl text-xs text-[#101828] font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              {/* Catálogo de Falhas Frequentes para Consulta Rápida */}
              <div className="border border-[#e4e7ec] rounded-2xl p-4 bg-white">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#667085] mb-3">
                  Consultar Sintomas e Falhas Típicas por Sistema
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIAS_PROBLEMAS.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setTextoLaudo((prev) => `${prev}\n• Sistema ${cat.nome}: Identificada necessidade de revisão nos componentes de desgaste.`)
                        toast.info(`Nota adicionada sobre ${cat.nome}`)
                      }}
                      className="p-3 rounded-xl border border-[#e4e7ec] hover:border-[#0284c7] hover:bg-sky-50/50 cursor-pointer transition-all"
                    >
                      <span className="font-bold text-xs text-[#101828] block">{cat.nome}</span>
                      <span className="text-[11px] text-[#667085] block mt-1">{cat.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 5: CHECKLIST DA OS */}
          {/* ========================================================================= */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-[#101828] flex items-center gap-2">
                    Checklist de Entrada e Inspeção Visual - OS #{osAtiva?.numeroOS}
                    {checklistCompleto(checklistLocal, ITENS_CHECKLIST_ENTRADA) ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#101828] text-white text-[9.5px] font-bold">Concluído</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[9.5px] font-bold">Pendente</span>
                    )}
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Pode ser preenchido pela secretaria na abertura da OS ou por você aqui, a qualquer momento antes do Diagnóstico.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSalvarChecklist}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <FloppyDisk size={16} weight="bold" />
                  <span>Salvar Checklist na OS</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {ITENS_CHECKLIST_ENTRADA.map((item) => {
                  const itemState = checklistLocal[item.id] || { status: '', obs: '' }
                  const isConforme = itemState.status === 'conforme'
                  const isNaoConforme = itemState.status === 'nao_conforme'
                  const isIsento = itemState.status === 'isento'
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isConforme
                          ? 'bg-[#f0f9ff]/60 border-[#bae6fd]'
                          : isNaoConforme
                          ? 'bg-rose-50/60 border-rose-200'
                          : isIsento
                          ? 'bg-[#f8fafc] border-[#e4e7ec]'
                          : 'bg-white border-[#e4e7ec] hover:border-[#d0d5dd]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] font-bold text-[#101828] truncate" title={item.desc}>
                          {item.label}
                        </p>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStatusItemChecklist(item.id, 'conforme')}
                            className={`h-6 px-1.5 rounded text-[9.5px] font-bold cursor-pointer ${
                              isConforme ? 'bg-[#0284c7] text-white' : 'bg-white text-[#475467] border border-[#d0d5dd] hover:bg-[#f0f9ff]'
                            }`}
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusItemChecklist(item.id, 'nao_conforme')}
                            className={`h-6 px-1.5 rounded text-[9.5px] font-bold cursor-pointer ${
                              isNaoConforme ? 'bg-rose-600 text-white' : 'bg-white text-[#475467] border border-[#d0d5dd] hover:bg-rose-50'
                            }`}
                          >
                            Não
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusItemChecklist(item.id, 'isento')}
                            className={`h-6 px-1 rounded text-[9.5px] font-bold cursor-pointer ${
                              isIsento ? 'bg-[#101828] text-white' : 'bg-white text-[#667085] border border-[#d0d5dd] hover:bg-[#f2f4f7]'
                            }`}
                          >
                            N/A
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={itemState.obs || ''}
                        onChange={(e) => handleObsItemChecklist(item.id, e.target.value)}
                        placeholder="Observação (opcional)..."
                        className="mt-1 w-full h-6 px-1.5 text-[10px] rounded border border-[#e4e7ec] bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7] font-medium text-[#344054]"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 6: PEDIR PEÇAS / REQUISIÇÃO AO ALMOXARIFADO */}
          {/* ========================================================================= */}
          {activeTab === 'pedir-pecas' && (
            <div className="space-y-4">
              <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-[#101828]">
                    Pedir Peça para a OS #{osAtiva?.numeroOS} ({osAtiva?.marcaModelo})
                  </h4>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#475467]">Urgência:</label>
                    <div className="w-52">
                      <Select
                        options={OPCOES_URGENCIA_PEDIR}
                        value={OPCOES_URGENCIA_PEDIR.find((o) => o.value === urgenciaPedir) || OPCOES_URGENCIA_PEDIR[0]}
                        onChange={(opt) => setUrgenciaPedir(opt ? opt.value : 'normal')}
                        styles={customSelectStyles}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <MagnifyingGlass
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
                    />
                    <input
                      type="text"
                      value={buscaEstoque}
                      onChange={(e) => setBuscaEstoque(e.target.value)}
                      placeholder="Buscar peça por código ou nome (ex: Pastilha, Óleo, Tubo)..."
                      className="w-full h-9 pl-9 pr-3 bg-white border border-[#d0d5dd] rounded-xl text-xs text-[#101828] focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#475467]">Qtd:</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={qtdPedir}
                      onChange={(e) => setQtdPedir(Number(e.target.value))}
                      className="w-16 h-9 px-2 bg-white border border-[#d0d5dd] rounded-xl text-xs font-bold text-center text-[#101828]"
                    />
                  </div>
                </div>
              </div>

              {/* Tabela de Peças Disponíveis para Pedido */}
              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
                <div className="bg-[#f8fafc] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                  <div className="col-span-2">Código</div>
                  <div className="col-span-5">Descrição da Peça</div>
                  <div className="col-span-2">Categoria</div>
                  <div className="col-span-1 text-center">Estoque</div>
                  <div className="col-span-2 text-right">Ação</div>
                </div>

                <div className="divide-y divide-[#f2f4f7] max-h-96 overflow-y-auto no-scrollbar">
                  {estoqueFiltrado.slice(0, 15).map((peca) => (
                    <div
                      key={peca.codigo}
                      className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-xs hover:bg-[#f8fafc]"
                    >
                      <div className="col-span-2 font-mono font-bold text-[#101828]">
                        {peca.codigo}
                      </div>
                      <div className="col-span-5 font-semibold text-[#101828]">
                        {peca.nome}
                      </div>
                      <div className="col-span-2 text-[#667085]">{peca.categoria}</div>
                      <div className="col-span-1 text-center font-bold font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            peca.estoqueAtual > 0
                              ? 'bg-sky-50 text-[#0284c7]'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {peca.estoqueAtual}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRequisitarPeca(peca)}
                          className="px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer active:scale-95 transition-all"
                        >
                          Pedir Peça
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 7: CONSULTA DE ESTOQUE */}
          {/* ========================================================================= */}
          {activeTab === 'estoque' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#101828]">
                    Almoxarifado e Catálogo de Peças da Oficina
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Consulte localização física de prateleira, quantidade em estoque e valores unitários.
                  </p>
                </div>
                <div className="w-56">
                  <Select
                    options={[{ value: 'Todas', label: 'Todas as Categorias' }, ...CATEGORIAS_PECAS.map((c) => ({ value: c, label: c }))]}
                    value={{ value: categoriaEstoque, label: categoriaEstoque === 'Todas' ? 'Todas as Categorias' : categoriaEstoque }}
                    onChange={(opt) => setCategoriaEstoque(opt ? opt.value : 'Todas')}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
              </div>

              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
                <div className="bg-[#f8fafc] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                  <div className="col-span-2">Código</div>
                  <div className="col-span-4">Descrição da Peça</div>
                  <div className="col-span-2">Categoria</div>
                  <div className="col-span-2 text-center">Localização / Prateleira</div>
                  <div className="col-span-1 text-center">Estoque</div>
                  <div className="col-span-1 text-right">Preço Unit.</div>
                </div>

                <div className="divide-y divide-[#f2f4f7] max-h-[450px] overflow-y-auto no-scrollbar">
                  {estoqueFiltrado.map((peca, idx) => (
                    <div
                      key={peca.codigo}
                      className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-xs hover:bg-[#f8fafc]"
                    >
                      <div className="col-span-2 font-mono font-bold text-[#101828]">
                        {peca.codigo}
                      </div>
                      <div className="col-span-4 font-semibold text-[#101828]">
                        {peca.nome}
                      </div>
                      <div className="col-span-2 text-[#667085]">{peca.categoria}</div>
                      <div className="col-span-2 text-center text-[#475467] font-medium text-[11px]">
                        Prateleira A{idx % 5 + 1} - Gav. {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="col-span-1 text-center font-bold font-mono">
                        {peca.estoqueAtual}
                      </div>
                      <div className="col-span-1 text-right font-black font-mono text-[#101828]">
                        R$ {peca.precoUnitario.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 8: SELECIONAR E LANÇAR SERVIÇOS */}
          {/* ========================================================================= */}
          {activeTab === 'servicos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#101828]">
                    Tabela de Serviços e Mão de Obra da Oficina
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Lançamento de mão de obra direta para a OS #{osAtiva?.numeroOS} ({osAtiva?.marcaModelo}).
                  </p>
                </div>
                <div className="w-64 relative">
                  <MagnifyingGlass
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
                  />
                  <input
                    type="text"
                    value={buscaServico}
                    onChange={(e) => setBuscaServico(e.target.value)}
                    placeholder="Buscar serviço..."
                    className="w-full h-8.5 pl-8 pr-3 bg-white border border-[#d0d5dd] rounded-xl text-xs text-[#101828]"
                  />
                </div>
              </div>

              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
                <div className="bg-[#f8fafc] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                  <div className="col-span-2">Código</div>
                  <div className="col-span-6">Descrição do Serviço</div>
                  <div className="col-span-2 text-center">Tempo Padrão</div>
                  <div className="col-span-1 text-right">Valor</div>
                  <div className="col-span-1 text-right">Ação</div>
                </div>

                <div className="divide-y divide-[#f2f4f7] max-h-[450px] overflow-y-auto no-scrollbar">
                  {servicosFiltrados.map((serv) => (
                    <div
                      key={serv.codigo}
                      className="px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-xs hover:bg-[#f8fafc]"
                    >
                      <div className="col-span-2 font-mono font-bold text-[#101828]">
                        {serv.codigo}
                      </div>
                      <div className="col-span-6 font-semibold text-[#101828]">
                        {serv.nome}
                      </div>
                      <div className="col-span-2 text-center text-[#667085]">
                        {serv.tempoEstimado || '1.0'} hora(s)
                      </div>
                      <div className="col-span-1 text-right font-black font-mono text-[#101828]">
                        R$ {Number(serv.precoPadrao || serv.valorUnitario || 0).toFixed(2)}
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleLancarServico(serv)}
                          className="px-2.5 py-1 bg-[#101828] hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer active:scale-95 transition-all"
                        >
                          Lançar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 9: PEÇAS DANIFICADAS */}
          {/* ========================================================================= */}
          {activeTab === 'pecas-danificadas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#101828]">
                    Registro de Peças Danificadas e Avarias
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Controle de peças substituídas, comprovação para o cliente e descarte correto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalNovaPecaDanificada(true)}
                  className="px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus size={15} weight="bold" />
                  <span>Registrar Peça Danificada</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pecasDanificadas.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#101828] text-sm">{item.peca}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {item.tipoDestino}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#667085] space-y-0.5">
                      <p>Veículo: <strong className="text-[#101828]">{item.veiculo}</strong> (OS #{item.numeroOS})</p>
                      <p>Mecânico: {item.mecanicoNome} • Cód: {item.codigoPeca || '—'}</p>
                      <p className="text-[#475467] italic pt-1">"{item.motivo}"</p>
                    </div>
                    <div className="pt-2 border-t border-[#f2f4f7] flex items-center justify-between text-[10px] text-[#98a2b3]">
                      <span>Registrado em {item.dataRegistro}</span>
                      <span className="font-bold text-[#0284c7]">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 10: FERRAMENTAS DANIFICADAS */}
          {/* ========================================================================= */}
          {activeTab === 'ferramentas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#101828]">
                    Controle de Ferramentas e Equipamentos da Oficina
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Relate ferramentas quebradas, descalibradas ou que necessitam de substituição imediata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalNovaFerramenta(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus size={15} weight="bold" />
                  <span>Relatar Ferramenta Danificada</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ferramentasDanificadas.map((ferr) => (
                  <div
                    key={ferr.id}
                    className="p-3.5 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#101828] text-sm">{ferr.ferramenta}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ferr.urgencia === 'alta'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Urgência: {ferr.urgencia}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#667085] space-y-0.5">
                      <p>Bancada: <strong className="text-[#101828]">{ferr.box}</strong> • Relatado por: {ferr.mecanicoNome}</p>
                      <p className="text-[#475467] pt-1">Defeito: {ferr.problema}</p>
                    </div>
                    <div className="pt-2 border-t border-[#f2f4f7] flex items-center justify-between text-[10px] text-[#98a2b3]">
                      <span>{ferr.dataRegistro}</span>
                      <span className="font-bold text-[#101828]">{ferr.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 11: MINHA AGENDA NA OFICINA */}
          {/* ========================================================================= */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Agenda e Distribuição de Horários - {mecanicoAtivo.nome}
                </h3>
                <p className="text-xs text-[#667085]">
                  Escala de boxes e atendimentos programados para a sua bancada hoje.
                </p>
              </div>

              <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden bg-white">
                <div className="divide-y divide-[#f2f4f7]">
                  {agendaDoDia.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-[#f8fafc]">
                      <div className="flex items-center gap-4">
                        <div className="w-24 font-mono font-bold text-[#0284c7] text-sm shrink-0">
                          {item.horario}
                        </div>
                        <div>
                          <span className="font-bold text-[#101828] text-sm block">{item.veiculo}</span>
                          <span className="text-[#475467] block text-xs mt-0.5">{item.servico}</span>
                          <span className="text-[11px] text-[#667085] block mt-0.5">
                            Local: {item.elevador} • OS #{item.osNumero}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#f2f4f7] text-[#101828]">
                          {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOsSelecionadaId(item.osNumero)
                            setActiveTab('dashboard')
                          }}
                          className="px-3 py-1.5 bg-[#101828] text-white rounded-xl font-bold cursor-pointer hover:bg-black"
                        >
                          Abrir OS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 12: LEVA E TRAZ */}
          {/* ========================================================================= */}
          {activeTab === 'leva-e-traz' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Serviço de Leva e Traz - Veículos sob sua Manutenção
                </h3>
                <p className="text-xs text-[#667085]">
                  Acompanhe a chegada de veículos pelo motorista da oficina e os carros prontos para retorno.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {servicosLevaETraz.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#101828]">{item.veiculo}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#101828] text-white">
                        {item.placa}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#667085] space-y-0.5">
                      <p>Cliente: <strong className="text-[#101828]">{item.cliente}</strong></p>
                      <p>Motorista: {item.motorista} • {item.horario}</p>
                      <p className="font-semibold text-[#0284c7] pt-1">{item.tipo}</p>
                    </div>
                    <div className="pt-2 border-t border-[#f2f4f7] text-[11px] font-bold text-[#101828]">
                      Status: {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 13: CLIENTES E VEÍCULOS */}
          {/* ========================================================================= */}
          {activeTab === 'clientes' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Consulta de Clientes e Histórico do Veículo
                </h3>
                <p className="text-xs text-[#667085]">
                  Localize rapidamente dados de contato e ficha do cliente para alinhamentos técnicos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_CLIENTES_VEICULOS.slice(0, 9).map((cli) => {
                  const veic = cli.veiculos[0]
                  return (
                    <div
                      key={cli.id}
                      className="p-3.5 bg-white border border-[#e4e7ec] rounded-2xl shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#101828] text-sm truncate">{cli.nome}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0284c7] text-white">
                          {veic?.placa}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#667085] space-y-0.5">
                        <p>Carro: <strong className="text-[#101828]">{veic?.marcaModelo} ({veic?.ano})</strong></p>
                        <p>Cor: {veic?.cor} • KM Padrão: {veic?.kmPadrao} KM</p>
                        <p>Telefone: {cli.telefone}</p>
                      </div>
                      <div className="pt-2 border-t border-[#f2f4f7] flex items-center justify-between">
                        <a
                          href={`https://wa.me/55${cli.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                        >
                          <WhatsappLogo size={15} weight="fill" />
                          <span>WhatsApp Direto</span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAIS: REGISTRAR PEÇA DANIFICADA */}
      {/* ========================================================================= */}
      {modalNovaPecaDanificada && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl max-w-md w-full p-5 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4e7ec] pb-3">
              <h3 className="text-sm font-extrabold text-[#101828]">Registrar Peça Danificada</h3>
              <button
                type="button"
                onClick={() => setModalNovaPecaDanificada(false)}
                className="text-[#667085] hover:text-[#101828]"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCriarPecaDanificada} className="space-y-3">
              <div>
                <label className="font-bold text-[#344054] block mb-1">Descrição da Peça Avariada:</label>
                <input
                  type="text"
                  required
                  value={formPecaDanificada.peca}
                  onChange={(e) => setFormPecaDanificada({ ...formPecaDanificada, peca: e.target.value })}
                  placeholder="Ex: Amortecedor vazando óleo com haste riscada"
                  className="w-full h-9 px-3 border border-[#d0d5dd] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#344054] block mb-1">Código da Peça (se houver):</label>
                <input
                  type="text"
                  value={formPecaDanificada.codigoPeca}
                  onChange={(e) => setFormPecaDanificada({ ...formPecaDanificada, codigoPeca: e.target.value })}
                  placeholder="Ex: 014290"
                  className="w-full h-9 px-3 border border-[#d0d5dd] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#344054] block mb-1">Motivo do Defeito:</label>
                <input
                  type="text"
                  value={formPecaDanificada.motivo}
                  onChange={(e) => setFormPecaDanificada({ ...formPecaDanificada, motivo: e.target.value })}
                  className="w-full h-9 px-3 border border-[#d0d5dd] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#344054] block mb-1">Destino da Peça:</label>
                <Select
                  options={OPCOES_DESTINO_PECA}
                  value={OPCOES_DESTINO_PECA.find((o) => o.value === formPecaDanificada.tipoDestino) || OPCOES_DESTINO_PECA[0]}
                  onChange={(opt) => setFormPecaDanificada({ ...formPecaDanificada, tipoDestino: opt ? opt.value : 'Descarte Ambiental' })}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaPecaDanificada(false)}
                  className="px-3 py-2 border border-[#d0d5dd] rounded-xl font-bold text-[#475467]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0284c7] text-white rounded-xl font-bold shadow-xs"
                >
                  Gravar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAIS: REPORTAR FERRAMENTA DANIFICADA */}
      {/* ========================================================================= */}
      {modalNovaFerramenta && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl max-w-md w-full p-5 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4e7ec] pb-3">
              <h3 className="text-sm font-extrabold text-[#101828]">Relatar Ferramenta Danificada</h3>
              <button
                type="button"
                onClick={() => setModalNovaFerramenta(false)}
                className="text-[#667085] hover:text-[#101828]"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCriarFerramentaDanificada} className="space-y-3">
              <div>
                <label className="font-bold text-[#344054] block mb-1">Nome da Ferramenta / Equipamento:</label>
                <input
                  type="text"
                  required
                  value={formFerramenta.ferramenta}
                  onChange={(e) => setFormFerramenta({ ...formFerramenta, ferramenta: e.target.value })}
                  placeholder="Ex: Torquímetro de Estalo, Scanner KTS, Macaco Jacaré"
                  className="w-full h-9 px-3 border border-[#d0d5dd] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#344054] block mb-1">Defeito Observado:</label>
                <textarea
                  required
                  rows={3}
                  value={formFerramenta.problema}
                  onChange={(e) => setFormFerramenta({ ...formFerramenta, problema: e.target.value })}
                  placeholder="Ex: Escapando pressão de ar pelo gatilho, trava quebrou..."
                  className="w-full p-2.5 border border-[#d0d5dd] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#344054] block mb-1">Nível de Urgência:</label>
                <Select
                  options={OPCOES_URGENCIA_FERRAMENTA}
                  value={OPCOES_URGENCIA_FERRAMENTA.find((o) => o.value === formFerramenta.urgencia) || OPCOES_URGENCIA_FERRAMENTA[0]}
                  onChange={(opt) => setFormFerramenta({ ...formFerramenta, urgencia: opt ? opt.value : 'baixa' })}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaFerramenta(false)}
                  className="px-3 py-2 border border-[#d0d5dd] rounded-xl font-bold text-[#475467]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold shadow-xs"
                >
                  Abrir Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
