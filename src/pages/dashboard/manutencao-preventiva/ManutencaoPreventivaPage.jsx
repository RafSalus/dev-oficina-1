import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  ShieldCheck,
  MagnifyingGlass,
  Gauge,
  User,
  WhatsappLogo,
  ClipboardText,
  Wrench,
  PencilSimple,
  SealCheck,
  CalendarBlank,
  CurrencyDollar,
  CarProfile,
  X,
  Funnel,
  Sparkle,
  WarningCircle,
  Clock,
  CheckCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarVeiculosAtivosPreventiva,
  calcularSaudeVeiculo,
  carregarManutencoesPreventivas,
  ITENS_PREVENTIVOS_CATALOGO,
} from '../../../constants/mockManutencaoPreventiva'
import { formatarTelefone } from '../../../utils/fiscalValidators'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { ModalFichaSaudeVeiculo } from '../../../components/manutencao-preventiva/ModalFichaSaudeVeiculo'
import { ModalAtualizarKmVeiculo } from '../../../components/manutencao-preventiva/ModalAtualizarKmVeiculo'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { MobileManutencaoPreventivaPage } from './mobile/MobileManutencaoPreventivaPage'

const FILTROS_STATUS_SAUDE = [
  { value: 'TODOS', label: 'Todos os Veículos' },
  { value: 'CRITICO', label: 'Críticos (Revisões Vencidas)' },
  { value: 'ATENCAO', label: 'Em Atenção (Próximos do Vencimento)' },
  { value: 'GARANTIA', label: 'Revisão de Garantia Pendente' },
  { value: 'EM_DIA', label: 'Em Dia e Saudáveis' },
]

export function ManutencaoPreventivaPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const [veiculosAtivos, setVeiculosAtivos] = useState([])
  const [preventivas, setPreventivas] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroServico, setFiltroServico] = useState('TODOS')
  const [abaAtiva, setAbaAtiva] = useState('frota') // 'frota' | 'campanhas' | 'garantias'

  // Modais
  const [modalFichaAberto, setModalFichaAberto] = useState(false)
  const [modalAtualizarKmAberto, setModalAtualizarKmAberto] = useState(false)
  const [saudeSelecionada, setSaudeSelecionada] = useState(null)
  const [veiculoParaAtualizar, setVeiculoParaAtualizar] = useState(null)

  const recarregarDados = () => {
    const frotaAtiva = carregarVeiculosAtivosPreventiva()
    const listaPrev = carregarManutencoesPreventivas()
    setVeiculosAtivos(frotaAtiva)
    setPreventivas(listaPrev)
  }

  useEffect(() => {
    recarregarDados()
    window.addEventListener('storage', recarregarDados)
    return () => window.removeEventListener('storage', recarregarDados)
  }, [])

  // Avaliação da saúde de cada veículo ativo
  const veiculosAvaliados = useMemo(() => {
    return veiculosAtivos.map((v) => calcularSaudeVeiculo(v, preventivas))
  }, [veiculosAtivos, preventivas])

  // Métricas Consolidadas do Painel
  const metricas = useMemo(() => {
    const totalVeiculos = veiculosAvaliados.length
    const criticos = veiculosAvaliados.filter((v) => v.statusGeral === 'critico').length
    const atencao = veiculosAvaliados.filter((v) => v.statusGeral === 'atencao').length
    const garantias = veiculosAvaliados.filter((v) => v.temGarantiaPendente).length
    const emDia = veiculosAvaliados.filter((v) => v.statusGeral === 'em_dia').length
    const receitaPotencialGeral = veiculosAvaliados.reduce(
      (acc, curr) => acc + curr.receitaPotencialTotal,
      0
    )

    return {
      totalVeiculos,
      criticos,
      atencao,
      garantias,
      emDia,
      receitaPotencialGeral,
    }
  }, [veiculosAvaliados])

  // Opções para filtro de serviços
  const opcoesServicos = useMemo(() => {
    return [
      { value: 'TODOS', label: 'Todos os Serviços e Sistemas' },
      ...ITENS_PREVENTIVOS_CATALOGO.map((item) => ({
        value: item.id,
        label: item.nome,
      })),
    ]
  }, [])

  // Filtragem dos Veículos
  const veiculosFiltrados = useMemo(() => {
    return veiculosAvaliados.filter((vSaude) => {
      const v = vSaude.veiculo
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || v.modelo || '').toLowerCase().includes(termo) ||
        (v.clienteNome || '').toLowerCase().includes(termo) ||
        (v.clienteTelefone || '').includes(termo)

      if (!matchBusca) return false

      // Filtro de Status de Saúde
      if (filtroStatus === 'CRITICO' && vSaude.statusGeral !== 'critico') return false
      if (filtroStatus === 'ATENCAO' && vSaude.statusGeral !== 'atencao') return false
      if (filtroStatus === 'GARANTIA' && !vSaude.temGarantiaPendente) return false
      if (filtroStatus === 'EM_DIA' && vSaude.statusGeral !== 'em_dia') return false

      // Filtro por Serviço Específico
      if (filtroServico !== 'TODOS') {
        const itemEncontrado = vSaude.itensAvaliados.find(
          (i) => i.id === filtroServico && i.status !== 'em_dia'
        )
        if (!itemEncontrado) return false
      }

      return true
    })
  }, [veiculosAvaliados, busca, filtroStatus, filtroServico])

  // Abertura de OS com pré-seleção de cliente e veículo
  const handleGerarOrdemServico = (veiculo, itensAlerta = []) => {
    let itens = itensAlerta
    if (!itens || itens.length === 0) {
      const vSaude = veiculosAvaliados.find(
        (va) => (va.placa || '').toUpperCase().trim() === (veiculo.placa || '').toUpperCase().trim()
      )
      if (vSaude) {
        const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
        const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')
        itens = [...vencidos, ...emAtencao]
        if (vSaude.temGarantiaPendente) {
          const itemGarantia = vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')
          if (itemGarantia && !itens.some((it) => it.id === 'revisao_garantia')) {
            itens.push(itemGarantia)
          }
        }
      }
    }

    navigate(`${basePath}/ordem-de-servico`, {
      state: {
        clienteId: veiculo.clienteId,
        veiculoPlaca: veiculo.placa,
        veiculo: veiculo,
        itensPreventivosSugeridos: itens,
      },
    })
    toast.info(`Iniciando abertura de OS para ${veiculo.placa} com itens preventivos selecionados.`)
  }

  // Notificar cliente direto pelo WhatsApp com 1 clique
  const handleEnviarWhatsAppCliente = (vSaude) => {
    const foneLimpo = (vSaude.veiculo.clienteTelefone || '').replace(/\D/g, '')
    if (!foneLimpo) {
      toast.error('Cliente não possui telefone válido cadastrado.')
      return
    }

    const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
    const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')
    const garantia = vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia' && (i.status === 'vencido' || i.status === 'atencao'))

    let lista = ''
    if (vencidos.length > 0) {
      lista += `\n*Revisões recomendadas vencidas:*\n`
      vencidos.forEach((v) => {
        lista += `• ${v.nome} (${v.motivoAlerta})\n`
      })
    }
    if (emAtencao.length > 0) {
      lista += `\n*Itens para acompanhamento próximo:*\n`
      emAtencao.forEach((a) => {
        lista += `• ${a.nome} (${a.motivoAlerta})\n`
      })
    }
    if (garantia) {
      lista += `\n*Atenção à Garantia:* Revisão periódica para manter garantia ativa até *${garantia.proximaRecomendadaData}*.\n`
    }

    const mensagem =
      `Olá, *${vSaude.veiculo.clienteNome}*! Tudo bem?\n\n` +
      `Aqui é da *Mecânica Gabriel*. No acompanhamento de saúde preventiva do seu *${vSaude.veiculo.marcaModelo || vSaude.veiculo.modelo}* (Placa: *${vSaude.veiculo.placa}*), identificamos os seguintes itens para revisão:` +
      `${lista}\n` +
      `Podemos agendar sua revisão esta semana? Temos serviço de leva e traz disponível para seu conforto!`

    const url = `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
    toast.success('Disparo de notificação aberto no WhatsApp!')
  }

  if (isMobile) {
    return <MobileManutencaoPreventivaPage />
  }

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* Topo Executivo */}
      <div className="px-6 py-3.5 bg-white border-b border-[#e4e7ec] shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#101828] tracking-tight">
                Manutenção Preventiva e Saúde da Frota
              </h1>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {metricas.totalVeiculos} Veículos Monitorados
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Rastreio inteligente de trocas periódicas, saúde veicular, garantias e geração ativa de receita
            </p>
          </div>
        </div>

        {/* KPIs Estratégicos de Saúde e Receita */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
          {/* Card 1: Veículos Monitorados */}
          <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Frota Ativa
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-slate-900 font-mono">
                {metricas.totalVeiculos}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">veículos ativos</span>
            </div>
          </div>

          {/* Card 2: Críticos / Vencidos */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Revisões Vencidas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-amber-900 font-mono">
                {metricas.criticos}
              </span>
              <span className="text-[11px] font-semibold text-amber-700">urgência alta</span>
            </div>
          </div>

          {/* Card 3: Em Atenção */}
          <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
              Vencem em Breve
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-sky-900 font-mono">
                {metricas.atencao}
              </span>
              <span className="text-[11px] font-semibold text-sky-700">próx. 1.000 km</span>
            </div>
          </div>

          {/* Card 4: Garantias de Retorno */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
              Retornos de Garantia
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-slate-900 font-mono">
                {metricas.garantias}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">inspeção pós-serviço</span>
            </div>
          </div>

          {/* Card 5: Oportunidade / Receita Potencial */}
          <div className="bg-[#101828] border border-[#101828] rounded-xl p-2.5 text-white">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Receita em Aberto
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black text-white font-mono">
                R$ {metricas.receitaPotencialGeral.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-sky-300 font-semibold">pronto p/ orçar</span>
            </div>
          </div>
        </div>

        {/* Abas e Filtros Integrados */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
          {/* Alternador de Abas */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setAbaAtiva('frota')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                abaAtiva === 'frota'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saúde da Frota Ativa
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('campanhas')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                abaAtiva === 'campanhas'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Campanhas e Oportunidades por Serviço
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('garantias')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                abaAtiva === 'garantias'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Retornos de Garantia ({metricas.garantias})
            </button>
          </div>

          {/* Filtros de Busca e Seleção */}
          {abaAtiva !== 'campanhas' && (
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por placa, cliente ou modelo..."
                  className="w-full h-8.5 pl-8.5 pr-7 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="w-52">
                <Select
                  value={FILTROS_STATUS_SAUDE.find((s) => s.value === filtroStatus)}
                  onChange={(op) => setFiltroStatus(op?.value || 'TODOS')}
                  options={FILTROS_STATUS_SAUDE}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="w-56">
                <Select
                  value={opcoesServicos.find((s) => s.value === filtroServico)}
                  onChange={(op) => setFiltroServico(op?.value || 'TODOS')}
                  options={opcoesServicos}
                  styles={customSelectStyles}
                  isSearchable
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Central: Tabela ou Cards de Campanhas */}
      <div className="flex-1 min-h-0 p-6 overflow-hidden flex flex-col">
        {abaAtiva === 'campanhas' ? (
          /* Aba 2: Campanhas por Serviço / Oportunidades */
          <div className="h-full overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {ITENS_PREVENTIVOS_CATALOGO.map((item) => {
                // Descobre quantos veículos estão vencidos ou em atenção para este serviço específico
                const alvosVencidos = veiculosAvaliados.filter((vSaude) => {
                  const itemAval = vSaude.itensAvaliados.find((i) => i.id === item.id)
                  return itemAval && itemAval.status === 'vencido'
                })
                const alvosAtencao = veiculosAvaliados.filter((vSaude) => {
                  const itemAval = vSaude.itensAvaliados.find((i) => i.id === item.id)
                  return itemAval && itemAval.status === 'atencao'
                })

                const totalAlvos = alvosVencidos.length + alvosAtencao.length
                const receitaItem = totalAlvos * item.valorEstimadoMedio

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#d0d5dd] p-4.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.categoria}
                        </span>
                        <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                          R$ {item.valorEstimadoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 mt-2">{item.nome}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.descricao}</p>

                      {/* Alvos e Oportunidades */}
                      <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Vencidos Imediatos:</span>
                          <strong className="text-amber-700 font-extrabold text-sm font-mono">
                            {alvosVencidos.length} veículos
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Vencem em Breve:</span>
                          <strong className="text-sky-700 font-extrabold text-sm font-mono">
                            {alvosAtencao.length} veículos
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Potencial Total:</span>
                        <strong className="text-slate-900 font-black font-mono text-sm">
                          R$ {receitaItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFiltroServico(item.id)
                          setAbaAtiva('frota')
                          toast.info(`Filtrando veículos com oportunidade em ${item.nome}`)
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-300"
                      >
                        Ver Alvos ({totalAlvos})
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : abaAtiva === 'garantias' ? (
          /* Aba 3: Retornos de Garantia */
          <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SealCheck size={18} className="text-sky-700" />
                <span className="text-xs font-bold text-slate-800">
                  Revisões de Garantia e Inspeções Periódicas de Pós-Venda
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Veículos com serviços recentes que exigem reaperto ou revisão para manter a garantia ativa
              </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8fafc] sticky top-0 border-b border-slate-200 z-10">
                  <tr className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                    <th className="py-2.5 px-4">Veículo</th>
                    <th className="py-2.5 px-4">Cliente / Contato</th>
                    <th className="py-2.5 px-4">Serviço de Origem</th>
                    <th className="py-2.5 px-4">Prazo Limite da Garantia</th>
                    <th className="py-2.5 px-4">Status da Garantia</th>
                    <th className="py-2.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {veiculosAvaliados
                    .filter((v) => v.temGarantiaPendente)
                    .map((vSaude) => {
                      const itemGarantia = vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')
                      return (
                        <tr key={vSaude.placa} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#101828] text-white">
                                {vSaude.placa}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {vSaude.veiculo.marcaModelo || vSaude.veiculo.modelo}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {vSaude.veiculo.kmPadrao || vSaude.veiculo.kmAtual} km
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <strong className="text-slate-900 block">{vSaude.veiculo.clienteNome}</strong>
                            <span className="text-[11px] text-slate-500">
                              {formatarTelefone(vSaude.veiculo.clienteTelefone) || '—'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800">
                              {itemGarantia?.servicoOrigem || 'Revisão Geral e Garantia de Peças'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <CalendarBlank size={14} className="text-sky-600" />
                              <strong className="text-slate-900 font-mono">
                                {itemGarantia?.proximaRecomendadaData || 'A definir'}
                              </strong>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {itemGarantia?.diasRestantes > 0
                                ? `Restam ${itemGarantia.diasRestantes} dias`
                                : 'Prazo de retorno expirado'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                itemGarantia?.status === 'vencido'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-sky-50 text-sky-800 border border-sky-200'
                              }`}
                            >
                              {itemGarantia?.status === 'vencido'
                                ? 'Garantia em Risco'
                                : 'Aguardando Retorno'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEnviarWhatsAppCliente(vSaude)}
                                className="p-1.5 text-white bg-[#25D366] hover:bg-[#20ba59] rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Notificar cliente sobre a revisão de garantia"
                              >
                                <WhatsappLogo size={15} weight="fill" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSaudeSelecionada(vSaude)
                                  setModalFichaAberto(true)
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                              >
                                Ficha de Saúde
                              </button>
                              <button
                                type="button"
                                onClick={() => handleGerarOrdemServico(vSaude.veiculo, [itemGarantia].filter(Boolean))}
                                className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Abrir Ordem de Serviço para revisão de garantia"
                              >
                                Criar OS
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Aba 1: Tabela Principal - Saúde da Frota Ativa */
          <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8fafc] sticky top-0 border-b border-slate-200 z-10">
                  <tr className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
                    <th className="py-3 px-4">Veículo</th>
                    <th className="py-3 px-4">Proprietário / Contato</th>
                    <th className="py-3 px-4">Hodômetro Atual</th>
                    <th className="py-3 px-4 text-center">Score de Saúde</th>
                    <th className="py-3 px-4">Pontos de Atenção / Revisão</th>
                    <th className="py-3 px-4">Receita Potencial</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {veiculosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                          <ShieldCheck size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-800">Nenhum veículo encontrado</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tente ajustar os filtros ou o termo de busca pesquisado.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    veiculosFiltrados.map((vSaude) => {
                      const v = vSaude.veiculo
                      const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
                      const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')

                      return (
                        <tr key={vSaude.placa} className="hover:bg-slate-50/80 transition-colors">
                          {/* Coluna 1: Veículo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#101828] text-white">
                                {vSaude.placa}
                              </span>
                              <div>
                                <strong className="text-slate-900 block font-bold leading-tight">
                                  {v.marcaModelo || v.modelo}
                                </strong>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {v.ano} • {v.cor}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Coluna 2: Cliente */}
                          <td className="py-3 px-4">
                            <strong className="text-slate-900 block font-semibold leading-tight">
                              {v.clienteNome}
                            </strong>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {formatarTelefone(v.clienteTelefone) || '—'}
                            </span>
                          </td>

                          {/* Coluna 3: Hodômetro */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {v.kmPadrao || v.kmAtual || '0'} km
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setVeiculoParaAtualizar(v)
                                  setModalAtualizarKmAberto(true)
                                }}
                                className="text-slate-400 hover:text-sky-600 p-0.5 cursor-pointer"
                                title="Atualizar odômetro do veículo"
                              >
                                <PencilSimple size={12} />
                              </button>
                            </div>
                          </td>

                          {/* Coluna 4: Score de Saúde */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full ${
                                  vSaude.healthScore >= 80
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : vSaude.healthScore >= 50
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-[#101828] text-white'
                                }`}
                              >
                                {vSaude.healthScore}%
                              </span>
                              <span className="text-[9.5px] font-bold text-slate-500 uppercase mt-0.5">
                                {vSaude.statusGeral === 'critico'
                                  ? 'Crítico'
                                  : vSaude.statusGeral === 'atencao'
                                  ? 'Atenção'
                                  : 'Em Dia'}
                              </span>
                            </div>
                          </td>

                          {/* Coluna 5: Itens em Alerta */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                              {vencidos.map((item) => (
                                <span
                                  key={item.id}
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                                  title={item.motivoAlerta}
                                >
                                  {item.nome}
                                </span>
                              ))}
                              {emAtencao.map((item) => (
                                <span
                                  key={item.id}
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200"
                                  title={item.motivoAlerta}
                                >
                                  {item.nome}
                                </span>
                              ))}
                              {vSaude.temGarantiaPendente && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                                  Revisão Garantia
                                </span>
                              )}
                              {vencidos.length === 0 && emAtencao.length === 0 && !vSaude.temGarantiaPendente && (
                                <span className="text-[10px] font-medium text-slate-500">
                                  Todos os sistemas em dia
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Coluna 6: Oportunidade / Receita Potencial */}
                          <td className="py-3 px-4">
                            <span className="font-mono font-extrabold text-xs text-sky-800 block">
                              {vSaude.receitaPotencialTotal > 0
                                ? `R$ ${vSaude.receitaPotencialTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {vencidos.length + emAtencao.length > 0
                                ? `${vencidos.length + emAtencao.length} serviços sugeridos`
                                : 'Manutenções em dia'}
                            </span>
                          </td>

                          {/* Coluna 7: Ações Rápidas */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Disparo de WhatsApp */}
                              <button
                                type="button"
                                onClick={() => handleEnviarWhatsAppCliente(vSaude)}
                                className="p-1.5 text-white bg-[#25D366] hover:bg-[#20ba59] rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Notificar cliente no WhatsApp com itens preventivos sugeridos"
                              >
                                <WhatsappLogo size={15} weight="fill" />
                              </button>

                              {/* Ficha Completa de Saúde */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSaudeSelecionada(vSaude)
                                  setModalFichaAberto(true)
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                                title="Abrir prontuário completo de saúde do veículo"
                              >
                                Ficha de Saúde
                              </button>

                              {/* Abrir OS Direta */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleGerarOrdemServico(v, [
                                    ...vencidos,
                                    ...emAtencao,
                                    ...(vSaude.temGarantiaPendente
                                      ? [vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')].filter(Boolean)
                                      : []),
                                  ])
                                }
                                className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Abrir Ordem de Serviço com itens preventivos selecionados"
                              >
                                Criar OS
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modais Integrados */}
      <ModalFichaSaudeVeiculo
        isOpen={modalFichaAberto}
        onClose={() => setModalFichaAberto(false)}
        saudeVeiculo={saudeSelecionada}
        onAtualizarKm={(veic) => {
          setVeiculoParaAtualizar(veic)
          setModalAtualizarKmAberto(true)
        }}
        onGerarOrdemServico={handleGerarOrdemServico}
      />

      <ModalAtualizarKmVeiculo
        isOpen={modalAtualizarKmAberto}
        onClose={() => setModalAtualizarKmAberto(false)}
        veiculo={veiculoParaAtualizar}
        onAtualizado={recarregarDados}
      />
    </div>
  )
}
