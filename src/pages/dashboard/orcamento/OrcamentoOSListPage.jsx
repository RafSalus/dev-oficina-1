import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Receipt,
  Plus,
  MagnifyingGlass,
  ArrowsClockwise,
  Printer,
  WhatsappLogo,
  Copy,
  Check,
  Eye,
  Trash,
  Clock,
  Car,
  User,
  Wrench,
  Package,
  ShieldCheck,
  Archive,
  ArrowUUpLeft,
  CalendarCheck,
  CreditCard,
  FileText,
  CheckCircle,
} from '@phosphor-icons/react'
import Select from 'react-select'
import { toast } from 'sonner'
import { useIsMobile } from '../../../hooks/useIsMobile'
import {
  obterOrdensAbertas,
  obterOrdensFinalizadas,
  atualizarStatusOrdem,
  excluirOrdem,
  finalizarEArquivarOrdem,
  reabrirOrdemFinalizada,
  STATUS_ORCAMENTO,
  PRIORIDADE_OPTIONS,
} from './mockOrdensAbertas'
import { ModalImpressaoOS } from './ModalImpressaoOS'
import { PainelDetalhesOS } from './PainelDetalhesOS'
import { MobileOrcamentoOSListPage } from './mobile/MobileOrcamentoOSListPage'

// Estilos customizados sóbrios do react-select conforme SYSTEM_RULES.md
const selectFilterStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    height: '38px',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#0284c7' : '#d0d5dd',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#0284c7' : '#98a2b3',
    },
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: '180px',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 10px',
    height: '38px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    border: '1px solid #d0d5dd',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 9999,
    overflow: 'hidden',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#101828' : state.isFocused ? '#f2f4f7' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#101828',
    fontSize: '0.8125rem',
    fontWeight: state.isSelected ? '700' : '500',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '0.375rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: '600',
  }),
}

export function OrcamentoOSListPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  // Aba ativa: 'abertas' (OS em andamento) ou 'arquivos' (OS finalizadas)
  const [abaAtiva, setAbaAtiva] = useState('abertas')

  // Listas de Ordens de Serviço
  const [ordensAbertas, setOrdensAbertas] = useState(() => obterOrdensAbertas())
  const [ordensFinalizadas, setOrdensFinalizadas] = useState(() => obterOrdensFinalizadas())

  // Filtros e Busca
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState(STATUS_ORCAMENTO[0]) // 'todos'
  const [filtroPrioridade, setFiltroPrioridade] = useState(PRIORIDADE_OPTIONS[0]) // 'todas'

  // Item selecionado para inspeção no painel lateral
  const [ordemSelecionada, setOrdemSelecionada] = useState(null)

  // Modal de Impressão Oficial da Folha de OS
  const [modalImpressaoAberta, setModalImpressaoAberta] = useState(false)
  const [osParaImpressao, setOsParaImpressao] = useState(null)

  // Recarrega ambas as listas
  const recarregarListas = () => {
    const abertas = obterOrdensAbertas()
    const finalizadas = obterOrdensFinalizadas()
    setOrdensAbertas(abertas)
    setOrdensFinalizadas(finalizadas)

    if (ordemSelecionada) {
      const listaAtual = abaAtiva === 'abertas' ? abertas : finalizadas
      const atualizada = listaAtual.find(
        (item) => String(item.numeroOS) === String(ordemSelecionada.numeroOS)
      )
      setOrdemSelecionada(atualizada || null)
    }
  }

  // Atualiza status de uma OS aberta
  const handleAtualizarStatus = (numeroOS, novoStatus) => {
    const atualizada = atualizarStatusOrdem(numeroOS, novoStatus)
    if (atualizada) {
      recarregarListas()
    }
  }

  // Finaliza e transfere a OS para os Arquivos
  const handleFinalizarEArquivar = (numeroOS) => {
    const finalizada = finalizarEArquivarOrdem(numeroOS)
    if (finalizada) {
      recarregarListas()
      if (ordemSelecionada && String(ordemSelecionada.numeroOS) === String(numeroOS)) {
        setOrdemSelecionada(null)
      }
      toast.success(`Ordem de Serviço #${numeroOS} finalizada com sucesso e movida para os Arquivos!`)
    }
  }

  // Reabre uma OS finalizada dos Arquivos para as Abertas
  const handleReabrirOrdem = (numeroOS) => {
    const reaberta = reabrirOrdemFinalizada(numeroOS)
    if (reaberta) {
      recarregarListas()
      if (ordemSelecionada && String(ordemSelecionada.numeroOS) === String(numeroOS)) {
        setOrdemSelecionada(null)
      }
      toast.success(`Ordem de Serviço #${numeroOS} reaberta e movida de volta para as OS Abertas!`)
    }
  }

  // Excluir ou cancelar OS
  const handleExcluirOrdem = (numeroOS) => {
    const filtrada = excluirOrdem(numeroOS)
    setOrdensAbertas(filtrada)
    if (ordemSelecionada && String(ordemSelecionada.numeroOS) === String(numeroOS)) {
      setOrdemSelecionada(null)
    }
  }

  // Abrir Modal de Impressão
  const handleAbrirImpressao = (os) => {
    setOsParaImpressao(os)
    setModalImpressaoAberta(true)
  }

  // Copiar link do cliente
  const handleCopiarLink = (os, e) => {
    if (e) e.stopPropagation()
    const link = `${window.location.origin}/aprovacao/${os.numeroOS}`
    navigator.clipboard.writeText(link)
    toast.success(`Link de aprovação da OS #${os.numeroOS} copiado com sucesso!`)
  }

  // Disparar WhatsApp
  const handleDispararWhatsApp = (os, e) => {
    if (e) e.stopPropagation()
    const foneLimpo = (os.telefone || '').replace(/\D/g, '')
    const link = `${window.location.origin}/aprovacao/${os.numeroOS}`
    const msg = `Olá, *${os.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nO orçamento da sua *${os.marcaModelo || 'veículo'}* (Placa: *${os.placa || '—'}*) referente à OS *#${os.numeroOS}* está disponível.\n\nValor Total: *R$ ${Number(os.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\nAcesse o link seguro para visualizar as peças, serviços e autorizar o orçamento online:\n👉 ${link}`
    const url = foneLimpo
      ? `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    toast.success('Disparo de orçamento via WhatsApp preparado!')
  }

  // Filtragem de OS Abertas
  const abertasFiltradas = useMemo(() => {
    return ordensAbertas.filter((os) => {
      if (filtroStatus.value !== 'todos' && os.status !== filtroStatus.value) return false
      if (filtroPrioridade.value !== 'todas' && os.prioridade !== filtroPrioridade.value) return false

      if (busca.trim()) {
        const termo = busca.toLowerCase().trim()
        const matchNumero = String(os.numeroOS || '').toLowerCase().includes(termo)
        const matchCliente = String(os.cliente || '').toLowerCase().includes(termo)
        const matchPlaca = String(os.placa || '').toLowerCase().includes(termo)
        const matchModelo = String(os.marcaModelo || '').toLowerCase().includes(termo)
        const matchMecanico = String(os.mecanicoNome || '').toLowerCase().includes(termo)
        const matchQueixa = String(os.relatoCliente || '').toLowerCase().includes(termo)
        if (!matchNumero && !matchCliente && !matchPlaca && !matchModelo && !matchMecanico && !matchQueixa) {
          return false
        }
      }

      return true
    })
  }, [ordensAbertas, busca, filtroStatus, filtroPrioridade])

  // Filtragem de OS Finalizadas (Arquivos)
  const finalizadasFiltradas = useMemo(() => {
    return ordensFinalizadas.filter((os) => {
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim()
        const matchNumero = String(os.numeroOS || '').toLowerCase().includes(termo)
        const matchCliente = String(os.cliente || '').toLowerCase().includes(termo)
        const matchPlaca = String(os.placa || '').toLowerCase().includes(termo)
        const matchModelo = String(os.marcaModelo || '').toLowerCase().includes(termo)
        const matchMecanico = String(os.mecanicoNome || '').toLowerCase().includes(termo)
        const matchNF = String(os.notaFiscal || '').toLowerCase().includes(termo)
        if (!matchNumero && !matchCliente && !matchPlaca && !matchModelo && !matchMecanico && !matchNF) {
          return false
        }
      }
      return true
    })
  }, [ordensFinalizadas, busca])

  // Métricas do Topo para OS Abertas
  const metricasAbertas = useMemo(() => {
    const totalAbertas = ordensAbertas.length
    const emDiagnostico = ordensAbertas.filter((o) => o.status === 'em_diagnostico').length
    const aguardandoPecas = ordensAbertas.filter((o) => o.status === 'aguardando_pecas').length
    const aguardandoAprovacao = ordensAbertas.filter((o) => o.status === 'aguardando_aprovacao').length
    const aprovadosExecucao = ordensAbertas.filter((o) => o.status === 'aprovado_execucao').length
    const prontoRetirada = ordensAbertas.filter((o) => o.status === 'pronto_retirada').length
    const somaValorTotal = ordensAbertas.reduce((acc, o) => acc + (Number(o.valorTotal) || 0), 0)

    return {
      totalAbertas,
      emDiagnostico,
      aguardandoPecas,
      aguardandoAprovacao,
      aprovadosExecucao,
      prontoRetirada,
      somaValorTotal,
    }
  }, [ordensAbertas])

  // Métricas do Topo para OS Finalizadas (Arquivos)
  const metricasFinalizadas = useMemo(() => {
    const total = ordensFinalizadas.length
    const somaValorTotal = ordensFinalizadas.reduce((acc, o) => acc + (Number(o.valorTotal) || 0), 0)
    const somaPecas = ordensFinalizadas.reduce((acc, o) => acc + (Number(o.totalPecas) || 0), 0)
    const somaServicos = ordensFinalizadas.reduce((acc, o) => acc + (Number(o.totalServicos) || 0), 0)
    const ticketMedio = total > 0 ? somaValorTotal / total : 0
    const garantiasAtivas = ordensFinalizadas.length // todas do mock dentro do período

    return {
      total,
      somaValorTotal,
      somaPecas,
      somaServicos,
      ticketMedio,
      garantiasAtivas,
    }
  }, [ordensFinalizadas])

  const formatMoeda = (val) => {
    const n = parseFloat(val) || 0
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (isMobile) {
    return (
      <MobileOrcamentoOSListPage
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        ordensAbertas={ordensAbertas}
        ordensFinalizadas={ordensFinalizadas}
        abertasFiltradas={abertasFiltradas}
        finalizadasFiltradas={finalizadasFiltradas}
        busca={busca}
        setBusca={setBusca}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        filtroPrioridade={filtroPrioridade}
        setFiltroPrioridade={setFiltroPrioridade}
        metricasAbertas={metricasAbertas}
        metricasFinalizadas={metricasFinalizadas}
        onAtualizarStatus={handleAtualizarStatus}
        onFinalizarEArquivar={handleFinalizarEArquivar}
        onReabrirOrdem={handleReabrirOrdem}
        onExcluirOrdem={handleExcluirOrdem}
        onCopiarLink={handleCopiarLink}
        onDispararWhatsApp={handleDispararWhatsApp}
        formatMoeda={formatMoeda}
      />
    )
  }

  return (
    <div className="h-full w-full flex flex-col gap-2.5 overflow-hidden select-none">
      {/* 1. Barra de Ações Superiores com Botão Arquivos e Filtros */}
      <header className="h-13 shrink-0 bg-white px-3.5 rounded-2xl border border-[#d0d5dd] shadow-xs flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Identificação e Alternância de Abas (OS Abertas / Arquivos) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#0284c7] shrink-0">
            {abaAtiva === 'abertas' ? <Receipt size={18} weight="duotone" /> : <Archive size={18} weight="duotone" />}
          </div>

          {/* Seletor de visualização em pílulas */}
          <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl border border-[#e4e7ec] shrink-0">
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('abertas')
                setOrdemSelecionada(null)
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                abaAtiva === 'abertas'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Receipt size={14} weight={abaAtiva === 'abertas' ? 'fill' : 'bold'} className={abaAtiva === 'abertas' ? 'text-[#0284c7]' : ''} />
              <span>OS Abertas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                abaAtiva === 'abertas' ? 'bg-[#101828] text-white' : 'bg-[#e4e7ec] text-[#475467]'
              }`}>
                {ordensAbertas.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAbaAtiva('arquivos')
                setOrdemSelecionada(null)
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                abaAtiva === 'arquivos'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Archive size={14} weight={abaAtiva === 'arquivos' ? 'fill' : 'bold'} className={abaAtiva === 'arquivos' ? 'text-[#0284c7]' : ''} />
              <span>Arquivos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                abaAtiva === 'arquivos' ? 'bg-[#0284c7] text-white' : 'bg-[#e4e7ec] text-[#475467]'
              }`}>
                {ordensFinalizadas.length}
              </span>
            </button>
          </div>

          <div className="hidden 2xl:block truncate">
            <span className="text-[11px] text-[#667085] font-medium">
              {abaAtiva === 'abertas'
                ? 'Ordens em diagnóstico, orçamento e execução'
                : 'Histórico de ordens de serviço finalizadas e faturadas'}
            </span>
          </div>
        </div>

        {/* Lado Direito: Filtros, Campo de Busca e Botões Principais */}
        <div className="flex items-center gap-2">
          {/* Campo de Busca Rápida */}
          <div className="relative w-52 xl:w-60">
            <MagnifyingGlass
              size={15}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none"
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={abaAtiva === 'abertas' ? 'Buscar placa, cliente, nº OS...' : 'Buscar no arquivo...'}
              className="w-full h-9.5 pl-8.5 pr-3 bg-[#f8fafc] border border-[#d0d5dd] rounded-xl text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:border-[#0284c7] focus:bg-white transition-all shadow-2xs"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#667085] hover:text-[#101828]"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtros específicos para OS Abertas */}
          {abaAtiva === 'abertas' && (
            <>
              <div className="w-44 xl:w-48">
                <Select
                  styles={selectFilterStyles}
                  value={filtroStatus}
                  onChange={(opt) => setFiltroStatus(opt || STATUS_ORCAMENTO[0])}
                  options={STATUS_ORCAMENTO}
                  isSearchable={false}
                  placeholder="Status"
                />
              </div>

              <div className="w-40 xl:w-44">
                <Select
                  styles={selectFilterStyles}
                  value={filtroPrioridade}
                  onChange={(opt) => setFiltroPrioridade(opt || PRIORIDADE_OPTIONS[0])}
                  options={PRIORIDADE_OPTIONS}
                  isSearchable={false}
                  placeholder="Prioridade"
                />
              </div>
            </>
          )}

          {/* Botão Atualizar */}
          <button
            type="button"
            onClick={() => {
              recarregarListas()
              toast.info('Listas atualizadas com sucesso.')
            }}
            className="h-9.5 w-9.5 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] flex items-center justify-center text-[#475467] hover:text-[#101828] transition-all cursor-pointer shrink-0"
            title="Sincronizar e Atualizar"
          >
            <ArrowsClockwise size={16} weight="bold" />
          </button>

          {/* Botão Principal: Nova OS */}
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem('dev_oficina_draft_os')
              } catch (e) {}
              const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'
              navigate(`${basePath}/ordem-de-servico/nova`)
            }}
            className="h-9.5 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus size={15} weight="bold" />
            <span>Nova OS</span>
          </button>
        </div>
      </header>

      {/* 2. Barra de Indicadores e Métricas Rápidas Dinâmicas */}
      {abaAtiva === 'abertas' ? (
        <section className="shrink-0 grid grid-cols-6 gap-2">
          {/* Total em Aberto */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
                Total em Aberto
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-black text-[#101828]">{metricasAbertas.totalAbertas}</span>
                <span className="text-[10px] font-bold text-[#667085]">
                  (R$ {formatMoeda(metricasAbertas.somaValorTotal)})
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#101828]">
              <Receipt size={17} weight="bold" />
            </div>
          </div>

          {/* Em Diagnóstico */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
                Em Diagnóstico
              </span>
              <span className="text-base font-black text-[#101828] mt-0.5 block">
                {metricasAbertas.emDiagnostico}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#344054]">
              <Wrench size={17} weight="bold" />
            </div>
          </div>

          {/* Aguardando Peças */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Aguardando Peças
              </span>
              <span className="text-base font-black text-amber-900 mt-0.5 block">
                {metricasAbertas.aguardandoPecas}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <Package size={17} weight="bold" />
            </div>
          </div>

          {/* Aguardando Aprovação */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#0369a1] uppercase tracking-wider block">
                Aguardando Aprovação
              </span>
              <span className="text-base font-black text-[#0284c7] mt-0.5 block">
                {metricasAbertas.aguardandoAprovacao}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] flex items-center justify-center text-[#0284c7]">
              <Clock size={17} weight="bold" />
            </div>
          </div>

          {/* Aprovado e Em Execução */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#101828] uppercase tracking-wider block">
                Aprovado / Execução
              </span>
              <span className="text-base font-black text-[#101828] mt-0.5 block">
                {metricasAbertas.aprovadosExecucao}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#101828] flex items-center justify-center text-[#0284c7]">
              <ShieldCheck size={17} weight="bold" />
            </div>
          </div>

          {/* Pronto para Retirada */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#0369a1] uppercase tracking-wider block">
                Pronto para Retirada
              </span>
              <span className="text-base font-black text-[#0369a1] mt-0.5 block">
                {metricasAbertas.prontoRetirada}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] flex items-center justify-center text-[#0284c7]">
              <Car size={17} weight="bold" />
            </div>
          </div>
        </section>
      ) : (
        <section className="shrink-0 grid grid-cols-6 gap-2">
          {/* Total de OS no Arquivo */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
                OS no Arquivo
              </span>
              <span className="text-base font-black text-[#101828] mt-0.5 block">
                {metricasFinalizadas.total} ordens
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#101828] flex items-center justify-center text-[#0284c7]">
              <Archive size={17} weight="bold" />
            </div>
          </div>

          {/* Total Faturado Concluído */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#0369a1] uppercase tracking-wider block">
                Faturamento Concluído
              </span>
              <span className="text-base font-black text-[#0284c7] mt-0.5 block">
                R$ {formatMoeda(metricasFinalizadas.somaValorTotal)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] flex items-center justify-center text-[#0284c7]">
              <CreditCard size={17} weight="bold" />
            </div>
          </div>

          {/* Garantias Ativas */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#101828] uppercase tracking-wider block">
                Garantias Ativas
              </span>
              <span className="text-base font-black text-[#101828] mt-0.5 block">
                {metricasFinalizadas.garantiasAtivas} veículos
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#101828]">
              <ShieldCheck size={17} weight="bold" />
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
                Ticket Médio
              </span>
              <span className="text-base font-black text-[#101828] mt-0.5 block">
                R$ {formatMoeda(metricasFinalizadas.ticketMedio)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#475467]">
              <Receipt size={17} weight="bold" />
            </div>
          </div>

          {/* Peças Faturadas */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
                Peças Faturadas
              </span>
              <span className="text-base font-black text-[#101828] mt-0.5 block">
                R$ {formatMoeda(metricasFinalizadas.somaPecas)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#475467]">
              <Package size={17} weight="bold" />
            </div>
          </div>

          {/* Serviços Concluídos */}
          <div className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
                Mão de Obra Faturada
              </span>
              <span className="text-base font-black text-[#101828] mt-0.5 block">
                R$ {formatMoeda(metricasFinalizadas.somaServicos)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#475467]">
              <Wrench size={17} weight="bold" />
            </div>
          </div>
        </section>
      )}

      {/* 3. Área Central: Tabela Principal (OS Abertas ou Arquivos) com Painel Lateral em Overlay */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs flex overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden w-full">
          {/* Cabeçalho Fixo da Tabela */}
          {abaAtiva === 'abertas' ? (
            <div className="bg-[#f8fafc] border-b border-[#e4e7ec] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085] shrink-0">
              <div className="col-span-1">Nº OS</div>
              <div className="col-span-1">Entrada</div>
              <div className="col-span-3">Cliente e Contato</div>
              <div className="col-span-2">Veículo e Placa</div>
              <div className="col-span-2">Mecânico / Queixa</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Valor Total</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>
          ) : (
            <div className="bg-[#f8fafc] border-b border-[#e4e7ec] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085] shrink-0">
              <div className="col-span-1">Nº OS</div>
              <div className="col-span-2">Finalizada Em</div>
              <div className="col-span-3">Cliente e Contato</div>
              <div className="col-span-2">Veículo e Placa</div>
              <div className="col-span-1">Mecânico</div>
              <div className="col-span-1">Garantia / NF</div>
              <div className="col-span-1 text-right">Valor Pago</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>
          )}

          {/* Linhas com Scroll Interno Limpo e Invisível */}
          <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 divide-y divide-[#f2f4f7]">
            {abaAtiva === 'abertas' ? (
              abertasFiltradas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
                    <Receipt size={24} weight="duotone" />
                  </div>
                  <h3 className="text-sm font-bold text-[#101828] mb-1">Nenhuma ordem de serviço aberta encontrada</h3>
                  <p className="text-xs text-[#667085] max-w-sm mb-4">
                    Não foram encontrados orçamentos ou ordens de serviço correspondentes aos filtros selecionados.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBusca('')
                      setFiltroStatus(STATUS_ORCAMENTO[0])
                      setFiltroPrioridade(PRIORIDADE_OPTIONS[0])
                    }}
                    className="px-3 py-1.5 bg-white border border-[#d0d5dd] hover:bg-[#f2f4f7] text-xs font-semibold rounded-xl text-[#344054] cursor-pointer"
                  >
                    Limpar todos os filtros
                  </button>
                </div>
              ) : (
                abertasFiltradas.map((os) => {
                  const isSelected = ordemSelecionada && String(ordemSelecionada.numeroOS) === String(os.numeroOS)
                  const statusInfo = STATUS_ORCAMENTO.find((s) => s.value === os.status) || STATUS_ORCAMENTO[1]

                  return (
                    <div
                      key={os.numeroOS}
                      onClick={() => setOrdemSelecionada((prev) => (prev?.numeroOS === os.numeroOS ? null : os))}
                      className={`px-4 py-3 grid grid-cols-12 gap-3 items-center text-xs transition-colors cursor-pointer border-l-3 ${
                        isSelected
                          ? 'bg-[#f0f9ff] border-l-[#0284c7]'
                          : 'hover:bg-[#f8fafc] border-l-transparent'
                      }`}
                    >
                      {/* Coluna 1: Nº OS e Prioridade */}
                      <div className="col-span-1 min-w-0">
                        <span className="font-mono font-black text-xs text-[#101828] block whitespace-nowrap">
                          #{os.numeroOS}
                        </span>
                        {os.prioridade === 'urgente' && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Urgente
                          </span>
                        )}
                        {os.prioridade === 'retorno' && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Retorno
                          </span>
                        )}
                      </div>

                      {/* Coluna 2: Entrada */}
                      <div className="col-span-1 text-[11px] text-[#667085] leading-tight">
                        <span className="font-semibold text-[#344054] block">{os.dataEntrada}</span>
                        <span className="text-[10px]">{os.horaEntrada}</span>
                      </div>

                      {/* Coluna 3: Cliente e Contato */}
                      <div className="col-span-3 min-w-0 pr-2">
                        <span className="font-bold text-[#101828] truncate block text-xs">
                          {os.cliente}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#667085] mt-0.5">
                          <span>{os.telefone || 'Sem telefone'}</span>
                          {os.telefone && (
                            <button
                              type="button"
                              onClick={(e) => handleDispararWhatsApp(os, e)}
                              className="text-[#25d366] hover:text-[#1ebd59] p-0.5 rounded cursor-pointer"
                              title="Disparar no WhatsApp"
                            >
                              <WhatsappLogo size={14} weight="fill" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Coluna 4: Veículo e Placa */}
                      <div className="col-span-2 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-[#101828] text-white tracking-wider shrink-0">
                            {os.placa || 'PLACA'}
                          </span>
                          <span className="font-semibold text-[#101828] truncate text-xs">
                            {os.marcaModelo}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#667085] block truncate mt-0.5">
                          {os.ano} • {os.km ? `${os.km} km` : 'KM não informado'}
                        </span>
                      </div>

                      {/* Coluna 5: Mecânico e Queixa */}
                      <div className="col-span-2 min-w-0 pr-2">
                        <span className="font-semibold text-[#344054] text-[11px] block truncate">
                          Téc: {os.mecanicoNome || 'Não atribuído'}
                        </span>
                        <p className="text-[10px] text-[#667085] truncate mt-0.5 italic" title={os.relatoCliente}>
                          "{os.relatoCliente || 'Sem queixa detalhada'}"
                        </p>
                      </div>

                      {/* Coluna 6: Status */}
                      <div className="col-span-1 min-w-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-full ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.border}`}
                          title={statusInfo.label}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Coluna 7: Valor Total */}
                      <div className="col-span-1 text-right">
                        <span className="font-black text-[#101828] text-xs block">
                          R$ {formatMoeda(os.valorTotal)}
                        </span>
                        <span className="text-[9px] text-[#667085]">
                          {os.pecasOS?.length || 0} pç • {os.servicosOS?.length || 0} srv
                        </span>
                      </div>

                      {/* Coluna 8: Ações Rápidas em Pill Compacto */}
                      <div className="col-span-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center bg-[#f2f4f7] p-0.5 rounded-lg border border-[#e4e7ec] shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleAbrirImpressao(os)}
                            className="w-6 h-6 flex items-center justify-center text-[#475467] hover:text-[#101828] hover:bg-white rounded-md cursor-pointer transition-all"
                            title="Imprimir Folha Oficial"
                          >
                            <Printer size={13} weight="bold" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCopiarLink(os, e)}
                            className="w-6 h-6 flex items-center justify-center text-[#475467] hover:text-[#0284c7] hover:bg-white rounded-md cursor-pointer transition-all"
                            title="Copiar Link do Cliente"
                          >
                            <Copy size={13} weight="bold" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDispararWhatsApp(os, e)}
                            className="w-6 h-6 flex items-center justify-center text-[#25d366] hover:text-[#20bd5a] hover:bg-white rounded-md cursor-pointer transition-all"
                            title="Enviar via WhatsApp"
                          >
                            <WhatsappLogo size={14} weight="fill" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFinalizarEArquivar(os.numeroOS)}
                            className="w-6 h-6 flex items-center justify-center text-[#475467] hover:text-[#0284c7] hover:bg-white rounded-md cursor-pointer transition-all"
                            title="Finalizar e Mover para Arquivo"
                          >
                            <Archive size={13} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )
            ) : (
              finalizadasFiltradas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
                    <Archive size={24} weight="duotone" />
                  </div>
                  <h3 className="text-sm font-bold text-[#101828] mb-1">Nenhuma ordem finalizada no arquivo</h3>
                  <p className="text-xs text-[#667085] max-w-sm mb-4">
                    Quando você finalizar um atendimento na oficina, a OS será arquivada aqui para histórico permanente de garantia e faturamento.
                  </p>
                </div>
              ) : (
                finalizadasFiltradas.map((os) => {
                  const isSelected = ordemSelecionada && String(ordemSelecionada.numeroOS) === String(os.numeroOS)

                  return (
                    <div
                      key={os.numeroOS}
                      onClick={() => setOrdemSelecionada((prev) => (prev?.numeroOS === os.numeroOS ? null : os))}
                      className={`px-4 py-3 grid grid-cols-12 gap-3 items-center text-xs transition-colors cursor-pointer border-l-3 ${
                        isSelected
                          ? 'bg-[#f0f9ff] border-l-[#0284c7]'
                          : 'hover:bg-[#f8fafc] border-l-transparent'
                      }`}
                    >
                      {/* Coluna 1: Nº OS e Selo Finalizada */}
                      <div className="col-span-1 min-w-0">
                        <span className="font-mono font-black text-xs text-[#101828] block whitespace-nowrap">
                          #{os.numeroOS}
                        </span>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#101828] text-white">
                          Concluída
                        </span>
                      </div>

                      {/* Coluna 2: Finalizada Em */}
                      <div className="col-span-2 text-[11px] text-[#475467] leading-tight">
                        <div className="flex items-center gap-1.5 font-bold text-[#101828]">
                          <CalendarCheck size={13} weight="fill" className="text-[#0284c7]" />
                          <span>{os.dataFinalizacao || os.dataEntrada}</span>
                        </div>
                        <span className="text-[10px] text-[#667085] block mt-0.5">
                          Entrada: {os.dataEntrada}
                        </span>
                      </div>

                      {/* Coluna 3: Cliente e Contato */}
                      <div className="col-span-3 min-w-0 pr-2">
                        <span className="font-bold text-[#101828] truncate block text-xs">
                          {os.cliente}
                        </span>
                        <span className="text-[11px] text-[#667085] mt-0.5 block">
                          {os.telefone || 'Sem telefone'} • {os.documento || ''}
                        </span>
                      </div>

                      {/* Coluna 4: Veículo e Placa */}
                      <div className="col-span-2 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-[#101828] text-white tracking-wider shrink-0">
                            {os.placa || 'PLACA'}
                          </span>
                          <span className="font-semibold text-[#101828] truncate text-xs">
                            {os.marcaModelo}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#667085] block truncate mt-0.5">
                          {os.ano} • KM: {os.km || '—'}
                        </span>
                      </div>

                      {/* Coluna 5: Mecânico */}
                      <div className="col-span-1 min-w-0">
                        <span className="font-semibold text-[#344054] text-xs block truncate">
                          {os.mecanicoNome || 'Carlos Eduardo'}
                        </span>
                        <span className="text-[10px] text-[#667085]">Mecânica</span>
                      </div>

                      {/* Coluna 6: Garantia e NF */}
                      <div className="col-span-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#0284c7] block truncate">
                          Até {os.garantiaAte || '90 dias'}
                        </span>
                        <span className="text-[10px] text-[#667085] block truncate">
                          {os.notaFiscal || 'NFS-e Emitida'}
                        </span>
                      </div>

                      {/* Coluna 7: Valor Pago */}
                      <div className="col-span-1 text-right">
                        <span className="font-black text-[#101828] text-xs block">
                          R$ {formatMoeda(os.valorTotal)}
                        </span>
                        <span className="text-[9px] text-[#667085] block truncate">
                          {os.formaPagamento || 'PIX'}
                        </span>
                      </div>

                      {/* Coluna 8: Ações Rápidas de Arquivo em Pill Compacto */}
                      <div className="col-span-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center bg-[#f2f4f7] p-0.5 rounded-lg border border-[#e4e7ec] shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleAbrirImpressao(os)}
                            className="w-6 h-6 flex items-center justify-center text-[#475467] hover:text-[#101828] hover:bg-white rounded-md cursor-pointer transition-all"
                            title="Reimprimir Folha Oficial da OS"
                          >
                            <Printer size={13} weight="bold" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReabrirOrdem(os.numeroOS)}
                            className="w-6 h-6 flex items-center justify-center text-[#475467] hover:text-[#0284c7] hover:bg-white rounded-md cursor-pointer transition-all"
                            title="Reabrir esta OS e transferir de volta para as OS Abertas"
                          >
                            <ArrowUUpLeft size={13} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )
            )}
          </div>

          {/* Rodapé da Tabela: Informações e Totais */}
          <footer className="h-10 px-4 bg-[#f8fafc] border-t border-[#e4e7ec] flex items-center justify-between text-xs text-[#667085] shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#101828]">
                {abaAtiva === 'abertas' ? abertasFiltradas.length : finalizadasFiltradas.length}
              </span>
              <span>de</span>
              <span className="font-bold text-[#101828]">
                {abaAtiva === 'abertas' ? ordensAbertas.length : ordensFinalizadas.length}
              </span>
              <span>
                {abaAtiva === 'abertas' ? 'ordens de serviço em andamento' : 'ordens finalizadas arquivadas'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                {abaAtiva === 'abertas'
                  ? 'Clique em uma OS para inspecionar os itens ou finalizar o atendimento'
                  : 'Clique em uma OS arquivada para consultar o histórico ou reabri-la'}
              </span>
              <span>•</span>
              <span className="font-bold text-[#101828]">
                Total Filtrado: R${' '}
                {formatMoeda(
                  (abaAtiva === 'abertas' ? abertasFiltradas : finalizadasFiltradas).reduce(
                    (a, b) => a + (Number(b.valorTotal) || 0),
                    0
                  )
                )}
              </span>
            </div>
          </footer>
        </div>

        {/* Painel Lateral de Detalhes da OS Selecionada */}
        {ordemSelecionada && (
          <PainelDetalhesOS
            os={ordemSelecionada}
            isArquivada={abaAtiva === 'arquivos'}
            onClose={() => setOrdemSelecionada(null)}
            onAbrirImpressao={() => handleAbrirImpressao(ordemSelecionada)}
            onAtualizarStatus={handleAtualizarStatus}
            onFinalizarEArquivar={handleFinalizarEArquivar}
            onReabrir={handleReabrirOrdem}
            onExcluir={handleExcluirOrdem}
          />
        )}
      </div>

      {/* 4. Modal Oficial de Impressão */}
      <ModalImpressaoOS
        isOpen={modalImpressaoAberta}
        onClose={() => setModalImpressaoAberta(false)}
        osData={osParaImpressao}
      />
    </div>
  )
}
