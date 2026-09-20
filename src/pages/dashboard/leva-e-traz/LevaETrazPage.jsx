import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  ArrowsLeftRight,
  Plus,
  MagnifyingGlass,
  Play,
  CheckCircle,
  Clock,
  Car,
  User,
  Package,
  Wrench,
  Users,
  MapPin,
  Gauge,
  WhatsappLogo,
  ShieldCheck,
  X,
  Buildings,
  ListDashes,
  ClockCounterClockwise,
  Eye,
  Trash,
  PencilSimple,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarDeslocamentos,
  carregarVeiculosDeApoio,
  iniciarDeslocamento,
  excluirDeslocamento,
  TIPOS_SERVICO_LOGISTICA,
  STATUS_LOGISTICA,
} from '../../../constants/mockLevaETraz'
import { formatarTelefone } from '../../../utils/fiscalValidators'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { GoogleMapsIcon } from '../../../components/icons/GoogleMapsIcon'
import { gerarLinkGoogleMapsTrajeto } from '../../../utils/googleMapsRouting'
import { ModalNovoDeslocamento } from '../../../components/leva-e-traz/ModalNovoDeslocamento'
import { ModalFinalizarDeslocamento } from '../../../components/leva-e-traz/ModalFinalizarDeslocamento'
import { ModalDetalhesDeslocamento } from '../../../components/leva-e-traz/ModalDetalhesDeslocamento'
import { ModalVeiculoApoio } from '../../../components/leva-e-traz/ModalVeiculoApoio'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { MobileLevaETrazPage } from './mobile/MobileLevaETrazPage'

const FILTRO_EQUIPE_OPCOES = [
  { value: 'TODOS', label: 'Todas as Equipes' },
  { value: '1', label: '1 Funcionário (Individual)' },
  { value: '2', label: '2 Funcionários (Carro de Apoio)' },
]

export function LevaETrazPage() {
  const isMobile = useIsMobile()
  const [deslocamentos, setDeslocamentos] = useState([])
  const [veiculosApoio, setVeiculosApoio] = useState([])

  // Controle de Abas
  const [abaAtiva, setAbaAtiva] = useState('roteiro') // 'roteiro', 'historico', 'frota_apoio'

  // Filtros e Pesquisa
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroEquipe, setFiltroEquipe] = useState('TODOS')

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [deslocamentoSelecionado, setDeslocamentoSelecionado] = useState(null)
  const [modalVeiculoApoioAberto, setModalVeiculoApoioAberto] = useState(false)
  const [veiculoApoioEditando, setVeiculoApoioEditando] = useState(null)

  const recarregarDados = () => {
    setDeslocamentos(carregarDeslocamentos())
    setVeiculosApoio(carregarVeiculosDeApoio())
  }

  useEffect(() => {
    recarregarDados()
    window.addEventListener('storage', recarregarDados)
    return () => window.removeEventListener('storage', recarregarDados)
  }, [])

  // Métricas e Indicadores do Dia
  const metricas = useMemo(() => {
    const total = deslocamentos.length
    const emRota = deslocamentos.filter((d) => d.status === 'em_deslocamento').length
    const agendados = deslocamentos.filter((d) => d.status === 'agendado').length
    const concluidos = deslocamentos.filter((d) => d.status === 'concluido').length

    const veiculosClientes = deslocamentos.filter(
      (d) => d.tipoServico === 'busca_veiculo' || d.tipoServico === 'entrega_veiculo'
    ).length

    const coletaPecas = deslocamentos.filter((d) => d.tipoServico === 'busca_pecas').length

    const kmTotal = deslocamentos.reduce((acc, curr) => {
      const km = parseFloat(String(curr.kmRealizado || curr.kmEstimado || 0).replace(/\./g, '').replace(',', '.')) || 0
      return acc + km
    }, 0)

    return {
      total,
      emRota,
      agendados,
      concluidos,
      veiculosClientes,
      coletaPecas,
      kmTotal: Math.round(kmTotal),
    }
  }, [deslocamentos])

  // Filtragem dos deslocamentos
  const deslocamentosFiltrados = useMemo(() => {
    return deslocamentos.filter((d) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (d.codigo || '').toLowerCase().includes(termo) ||
        (d.clienteNome || '').toLowerCase().includes(termo) ||
        (d.veiculoPlaca || '').toLowerCase().includes(termo) ||
        (d.veiculoModelo || '').toLowerCase().includes(termo) ||
        (d.fornecedorNome || '').toLowerCase().includes(termo) ||
        (d.motoristaPrincipalNome || '').toLowerCase().includes(termo) ||
        (d.auxiliarNome || '').toLowerCase().includes(termo) ||
        (d.enderecoDestino || '').toLowerCase().includes(termo)

      const matchTipo = filtroTipo === 'TODOS' || d.tipoServico === filtroTipo
      const matchStatus = filtroStatus === 'TODOS' || d.status === filtroStatus
      const matchEquipe =
        filtroEquipe === 'TODOS' || String(d.quantidadeFuncionarios) === filtroEquipe

      // Se estiver na aba 'roteiro', foca nos agendados e em deslocamento (ou finalizados recentemente)
      if (abaAtiva === 'roteiro') {
        const matchAbaRoteiro = d.status === 'agendado' || d.status === 'em_deslocamento'
        return matchBusca && matchTipo && matchStatus && matchEquipe && matchAbaRoteiro
      }

      return matchBusca && matchTipo && matchStatus && matchEquipe
    })
  }, [deslocamentos, busca, filtroTipo, filtroStatus, filtroEquipe, abaAtiva])

  const temFiltroAtivo = busca !== '' || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS' || filtroEquipe !== 'TODOS'

  const handleLimparFiltros = () => {
    setBusca('')
    setFiltroTipo('TODOS')
    setFiltroStatus('TODOS')
    setFiltroEquipe('TODOS')
  }

  // Ações de Fluxo
  const handleIniciarViagem = (d) => {
    iniciarDeslocamento(d.id)
    recarregarDados()
    toast.success(`Deslocamento #${d.codigo} iniciado! Veículo de apoio em rota.`)
  }

  const handleAbrirFinalizar = (d) => {
    setDeslocamentoSelecionado(d)
    setModalFinalizarAberto(true)
  }

  const handleAbrirDetalhes = (d) => {
    setDeslocamentoSelecionado(d)
    setModalDetalhesAberto(true)
  }

  const handleExcluir = (d) => {
    excluirDeslocamento(d.id)
    recarregarDados()
    toast.success(`Deslocamento #${d.codigo} removido com sucesso.`)
  }

  if (isMobile) {
    return <MobileLevaETrazPage />
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <ArrowsLeftRight size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Leva e Traz e Logística</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total} missões registradas
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Gestão operacional de busca e entrega de veículos, translado de clientes, coleta de peças e socorro externo
              </p>
            </div>
          </div>

          {/* Botão Único de Ação (Regra 12: Sem redundância) */}
          <button
            type="button"
            onClick={() => setModalNovoAberto(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Novo Deslocamento</span>
          </button>
        </div>

        {/* Resumo de Indicadores da Operação Logística */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Em Deslocamento
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.emRota} em rota</span>
            </div>
            <Play size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Agendados na Fila
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.agendados}</span>
            </div>
            <Clock size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Carros de Clientes
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.veiculosClientes}</span>
            </div>
            <Car size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Busca de Peças
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.coletaPecas}</span>
            </div>
            <Package size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Quilometragem Total
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.kmTotal} km</span>
            </div>
            <Gauge size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Abas e Filtros */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Abas Operacionais */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setAbaAtiva('roteiro')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              abaAtiva === 'roteiro'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListDashes size={15} className={abaAtiva === 'roteiro' ? 'text-sky-600' : ''} />
            <span>Fila e Roteiro Ativo</span>
            {metricas.emRota > 0 && (
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('historico')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              abaAtiva === 'historico'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClockCounterClockwise size={15} className={abaAtiva === 'historico' ? 'text-sky-600' : ''} />
            <span>Histórico de Viagens</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('frota_apoio')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              abaAtiva === 'frota_apoio'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car size={15} className={abaAtiva === 'frota_apoio' ? 'text-sky-600' : ''} />
            <span>Veículos de Apoio</span>
          </button>
        </div>

        {/* Campo de Busca Rápida e Filtros */}
        {abaAtiva !== 'frota_apoio' && (
          <div className="flex-1 flex items-center gap-2 max-w-xl justify-end">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por cliente, fornecedor, placa, motorista ou endereço..."
                className="w-full h-8.5 pl-8.5 pr-7 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="w-44 shrink-0">
              <Select
                value={TIPOS_SERVICO_LOGISTICA.find((opt) => opt.value === filtroTipo)}
                onChange={(opt) => setFiltroTipo(opt ? opt.value : 'TODOS')}
                options={TIPOS_SERVICO_LOGISTICA}
                styles={customSelectStyles}
                placeholder="Tipo de Serviço"
                isSearchable={false}
              />
            </div>

            <div className="w-40 shrink-0">
              <Select
                value={FILTRO_EQUIPE_OPCOES.find((opt) => opt.value === filtroEquipe)}
                onChange={(opt) => setFiltroEquipe(opt ? opt.value : 'TODOS')}
                options={FILTRO_EQUIPE_OPCOES}
                styles={customSelectStyles}
                placeholder="Equipe"
                isSearchable={false}
              />
            </div>

            {temFiltroAtivo && (
              <button
                type="button"
                onClick={handleLimparFiltros}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Limpar todos os filtros"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo Principal (Single-Screen Workspace) */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        {abaAtiva === 'frota_apoio' ? (
          /* Aba 3: Frota de Apoio da Oficina */
          <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-0 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Car size={16} className="text-sky-600" />
                <span>Status dos Veículos e Motos de Apoio da Oficina Gabriel</span>
              </h3>
              <button
                type="button"
                onClick={() => { setVeiculoApoioEditando(null); setModalVeiculoApoioAberto(true); }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                <span>Novo Veículo de Apoio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {veiculosApoio.map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold bg-white text-slate-900 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                      {v.placa}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'em_rota'
                          ? 'bg-[#101828] text-white'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {v.status === 'em_rota' ? 'Em Rota / Na Rua' : 'Disponível no Pátio'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{v.nome}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {v.tipo} • {v.ano} • {v.combustivel}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hodômetro Atual:</span>
                      <strong className="font-mono text-slate-900">{v.kmAtual} km</strong>
                    </div>
                    {v.emUsoPor && (
                      <div className="flex items-center justify-between text-sky-800">
                        <span className="text-slate-500">Condutor Atual:</span>
                        <strong>{v.emUsoPor}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => { setVeiculoApoioEditando(v); setModalVeiculoApoioAberto(true); }}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      <PencilSimple size={12} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVeiculoApoioEditando(v); setModalVeiculoApoioAberto(true); }}
                      className="inline-flex items-center justify-center px-2 py-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-[11px] font-bold rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Abas 1 e 2: Tabela de Deslocamentos (Roteiro e Histórico) */
          <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {deslocamentosFiltrados.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <ArrowsLeftRight size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Nenhum atendimento de logística encontrado
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {temFiltroAtivo
                      ? 'Nenhum deslocamento corresponde aos filtros selecionados. Tente ajustar os termos de pesquisa.'
                      : abaAtiva === 'roteiro'
                      ? 'Não há deslocamentos ativos ou agendados na fila no momento. Clique em "Novo Deslocamento" para agendar.'
                      : 'Nenhum histórico de viagem arquivado.'}
                  </p>
                  {temFiltroAtivo && (
                    <button
                      type="button"
                      onClick={handleLimparFiltros}
                      className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                    >
                      Limpar todos os filtros
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                      <th className="py-3 px-4">Código e Status</th>
                      <th className="py-3 px-4">Tipo de Missão</th>
                      <th className="py-3 px-4">Cliente ou Fornecedor</th>
                      <th className="py-3 px-4">Equipe e Veículo de Apoio</th>
                      <th className="py-3 px-4">Destino e Prazos</th>
                      <th className="py-3 px-4">Quilometragem</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {deslocamentosFiltrados.map((d) => {
                      const foneLimpo = (d.clienteTelefone || d.fornecedorTelefone || '').replace(/\D/g, '')

                      return (
                        <tr
                          key={d.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Código e Status */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded">
                                {d.codigo}
                              </span>
                            </div>
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.status === 'concluido'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : d.status === 'em_deslocamento'
                                    ? 'bg-[#101828] text-white'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {d.status === 'concluido' ? (
                                  'Concluído'
                                ) : d.status === 'em_deslocamento' ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                                    <span>Em Rota</span>
                                  </>
                                ) : (
                                  'Agendado'
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Tipo de Missão */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {d.tipoServico === 'busca_veiculo' && <Car size={14} className="text-sky-600" />}
                              {d.tipoServico === 'entrega_veiculo' && <Car size={14} className="text-sky-600" />}
                              {d.tipoServico === 'translado_cliente' && <User size={14} className="text-sky-600" />}
                              {d.tipoServico === 'busca_pecas' && <Package size={14} className="text-sky-600" />}
                              {d.tipoServico === 'socorro_externo' && <Wrench size={14} className="text-sky-600" />}
                              <span>
                                {d.tipoServico === 'busca_veiculo'
                                  ? 'Busca de Carro'
                                  : d.tipoServico === 'entrega_veiculo'
                                  ? 'Entrega de Carro'
                                  : d.tipoServico === 'translado_cliente'
                                  ? 'Leva e Traz de Cliente'
                                  : d.tipoServico === 'busca_pecas'
                                  ? 'Busca de Peças'
                                  : 'Socorro Mecânico'}
                              </span>
                            </div>
                            {d.levarClienteEmbora && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                                Translado / Carona Ativa
                              </span>
                            )}
                          </td>

                          {/* Cliente ou Fornecedor */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 truncate">
                              {d.clienteNome || d.fornecedorNome || 'Destino operacional'}
                            </div>
                            {d.veiculoPlaca && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                                <span className="font-mono font-bold text-slate-700">{d.veiculoPlaca}</span>
                                <span className="truncate max-w-[120px]">{d.veiculoModelo}</span>
                              </div>
                            )}
                            {d.pecasDescricao && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[160px]" title={d.pecasDescricao}>
                                {d.pecasDescricao}
                              </div>
                            )}
                          </td>

                          {/* Equipe e Veículo de Apoio */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {d.quantidadeFuncionarios === 2 ? '2 Funcionários' : '1 Funcionário'}
                              </span>
                              <span className="font-semibold text-slate-800 truncate">
                                {d.motoristaPrincipalNome}
                              </span>
                            </div>
                            {d.auxiliarNome && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Auxiliar: <strong className="text-slate-700">{d.auxiliarNome}</strong>
                              </div>
                            )}
                            {d.veiculoApoioNome && (
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                                Apoio: {d.veiculoApoioNome}
                              </div>
                            )}
                          </td>

                          {/* Destino e Prazos */}
                          <td className="py-3 px-4 max-w-xs">
                            {d.enderecoDestino ? (
                              <a
                                href={gerarLinkGoogleMapsTrajeto({
                                  origem: d.enderecoOrigem,
                                  destino: d.enderecoDestino,
                                  idaEVolta: d.idaEVolta !== false,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-sky-600 transition-colors group"
                                title="Clique para abrir trajeto no Google Maps"
                              >
                                <GoogleMapsIcon className="w-3.5 h-4 shrink-0 transition-transform group-hover:scale-110" />
                                <span className="truncate max-w-[170px]">{d.enderecoDestino}</span>
                              </a>
                            ) : (
                              <div className="font-medium text-slate-800">Oficina Gabriel</div>
                            )}
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                              <span>Saída: <strong>{d.horarioSaidaReal || d.horarioSaidaPrevisto}</strong></span>
                              <span>•</span>
                              <span>Duração: <strong>{d.tempoRealMinutos ? `${d.tempoRealMinutos} min` : `${d.tempoEstimadoMinutos || 45} min`}</strong></span>
                            </div>
                          </td>

                          {/* Quilometragem */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900">
                              {d.kmRealizado ? `${d.kmRealizado} km` : `${d.kmEstimado || '—'} km`}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {d.tipoCobranca === 'cortesia' ? 'Cortesia' : `Taxa: R$ ${d.valorTaxa}`}
                            </div>
                          </td>

                          {/* Ações */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              {/* Botão de Iniciar Deslocamento */}
                              {d.status === 'agendado' && (
                                <button
                                  type="button"
                                  onClick={() => handleIniciarViagem(d)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#101828] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                  title="Iniciar Deslocamento / Sair da Oficina"
                                >
                                  <Play size={12} weight="fill" />
                                  <span>Iniciar</span>
                                </button>
                              )}

                              {/* Botão de Concluir Retorno */}
                              {d.status === 'em_deslocamento' && (
                                <button
                                  type="button"
                                  onClick={() => handleAbrirFinalizar(d)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                  title="Registrar Retorno e Finalizar Missão"
                                >
                                  <CheckCircle size={13} weight="bold" />
                                  <span>Concluir</span>
                                </button>
                              )}

                              {/* Botão Iniciar Trajeto no Google Maps */}
                              {d.enderecoDestino && (
                                <a
                                  href={gerarLinkGoogleMapsTrajeto({
                                    origem: d.enderecoOrigem,
                                    destino: d.enderecoDestino,
                                    idaEVolta: d.idaEVolta !== false,
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-700 hover:bg-sky-50 rounded transition-colors group"
                                  title="Abrir no Google Maps e Iniciar Navegação GPS"
                                >
                                  <GoogleMapsIcon className="w-3.5 h-4.5 transition-transform group-hover:scale-110" />
                                </a>
                              )}

                              {/* Botão WhatsApp */}
                              {foneLimpo && (
                                <a
                                  href={`https://wa.me/55${foneLimpo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                                  title="WhatsApp"
                                >
                                  <WhatsappLogo size={14} weight="fill" />
                                </a>
                              )}

                              {/* Ver Ficha de Detalhes */}
                              <button
                                type="button"
                                onClick={() => handleAbrirDetalhes(d)}
                                className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                                title="Ver Detalhes do Deslocamento"
                              >
                                <Eye size={15} />
                              </button>

                              {/* Excluir Registro */}
                              <button
                                type="button"
                                onClick={() => handleExcluir(d)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Excluir Deslocamento"
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
        )}
      </div>

      {/* Modais Operacionais */}
      <ModalNovoDeslocamento
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSalvo={recarregarDados}
      />

      <ModalFinalizarDeslocamento
        isOpen={modalFinalizarAberto}
        onClose={() => setModalFinalizarAberto(false)}
        deslocamento={deslocamentoSelecionado}
        onFinalizado={recarregarDados}
      />

      <ModalDetalhesDeslocamento
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
        deslocamento={deslocamentoSelecionado}
      />

      <ModalVeiculoApoio
        isOpen={modalVeiculoApoioAberto}
        onClose={() => { setModalVeiculoApoioAberto(false); setVeiculoApoioEditando(null); }}
        onSalvo={recarregarDados}
        veiculo={veiculoApoioEditando}
      />
    </div>
  )
}
