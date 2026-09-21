import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  Car,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  ClipboardText,
  WhatsappLogo,
  User,
  Buildings,
  GasPump,
  Gauge,
  IdentificationCard,
  ShieldCheck,
  CheckCircle,
  X,
  Funnel,
  Garage,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarTodosVeiculosDaFrota,
  salvarVeiculoNaFrota,
  excluirVeiculoDaFrota,
} from '../../../constants/mockClientesVeiculos'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../../utils/fiscalValidators'
import { VeiculoModalForm } from '../../../components/veiculos/VeiculoModalForm'
import { ModalEstacionarVeiculo } from '../../../components/estacionados/ModalEstacionarVeiculo'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { MobileVeiculosPage } from './mobile/MobileVeiculosPage'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'

const FILTRO_PROPRIETARIO_OPCOES = [
  { value: 'TODOS', label: 'Todos os Proprietários' },
  { value: 'PF', label: 'Clientes Particulares (PF)' },
  { value: 'PJ', label: 'Empresas e Frotistas (PJ)' },
]

const FILTRO_COMBUSTIVEL_OPCOES = [
  { value: 'TODOS', label: 'Todos os Combustíveis' },
  { value: 'FLEX', label: 'Flex' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'GNV', label: 'GNV' },
]

const FILTRO_STATUS_OPCOES = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'ATIVOS', label: 'Somente Ativos na Frota' },
  { value: 'INATIVOS', label: 'Somente Inativos' },
]

export function VeiculosPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const [veiculos, setVeiculos] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroProprietario, setFiltroProprietario] = useState('TODOS')
  const [filtroCombustivel, setFiltroCombustivel] = useState('TODOS')
  const [filtroMarca, setFiltroMarca] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  const [modalAberto, setModalAberto] = useState(false)
  const [veiculoEmEdicao, setVeiculoEmEdicao] = useState(null)
  const [modalEstacionarAberto, setModalEstacionarAberto] = useState(false)
  const [veiculoParaEstacionar, setVeiculoParaEstacionar] = useState(null)
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState(null)

  // Carrega veículos da frota do localStorage
  const recarregarFrota = () => {
    const lista = carregarTodosVeiculosDaFrota()
    setVeiculos(lista)
  }

  useEffect(() => {
    recarregarFrota()

    const handleStorage = () => {
      recarregarFrota()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Extrai montadoras presentes na frota para o select de filtro
  const opcoesMarcas = useMemo(() => {
    const marcasSet = new Set()
    veiculos.forEach((v) => {
      if (v.marca) marcasSet.add(v.marca.toUpperCase().trim())
    })
    const ordenadas = Array.from(marcasSet).sort()
    return [
      { value: 'TODOS', label: 'Todas as Montadoras' },
      ...ordenadas.map((m) => ({ value: m, label: m })),
    ]
  }, [veiculos])

  // Métricas da frota
  const metricas = useMemo(() => {
    const total = veiculos.length
    const totalPF = veiculos.filter((v) => v.clienteTipoPessoa === 'F').length
    const totalPJ = veiculos.filter((v) => v.clienteTipoPessoa === 'J').length

    const montadorasSet = new Set(
      veiculos.map((v) => (v.marca || '').toUpperCase().trim()).filter(Boolean)
    )

    return {
      total,
      totalPF,
      totalPJ,
      totalMontadoras: montadorasSet.size,
    }
  }, [veiculos])

  // Filtragem dos veículos
  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter((v) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marca || '').toLowerCase().includes(termo) ||
        (v.modelo || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || '').toLowerCase().includes(termo) ||
        (v.codigoVeiculo || '').toLowerCase().includes(termo) ||
        (v.clienteNome || '').toLowerCase().includes(termo) ||
        (v.clienteCodigo || '').toLowerCase().includes(termo) ||
        (v.chassi || '').toLowerCase().includes(termo) ||
        (v.cor || '').toLowerCase().includes(termo)

      const matchProprietario =
        filtroProprietario === 'TODOS' ||
        (filtroProprietario === 'PF' && v.clienteTipoPessoa === 'F') ||
        (filtroProprietario === 'PJ' && v.clienteTipoPessoa === 'J')

      const matchCombustivel =
        filtroCombustivel === 'TODOS' ||
        (v.combustivel || 'FLEX').toUpperCase() === filtroCombustivel

      const matchMarca =
        filtroMarca === 'TODOS' ||
        (v.marca || '').toUpperCase().trim() === filtroMarca

      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && v.ativo !== false) ||
        (filtroStatus === 'INATIVOS' && v.ativo === false)

      return (
        matchBusca &&
        matchProprietario &&
        matchCombustivel &&
        matchMarca &&
        matchStatus
      )
    })
  }, [
    veiculos,
    busca,
    filtroProprietario,
    filtroCombustivel,
    filtroMarca,
    filtroStatus,
  ])

  const handleAbrirNovo = () => {
    setVeiculoEmEdicao(null)
    setModalAberto(true)
  }

  const handleAbrirEditar = (v) => {
    setVeiculoEmEdicao(v)
    setModalAberto(true)
  }

  const handleAbrirEstacionar = (v) => {
    setVeiculoParaEstacionar(v)
    setModalEstacionarAberto(true)
  }

  const handleSalvarVeiculo = (veiculoData, clienteIdOriginal) => {
    try {
      salvarVeiculoNaFrota(veiculoData, clienteIdOriginal)
      recarregarFrota()
      toast.success(
        veiculoEmEdicao
          ? `Veículo placa ${veiculoData.placa} atualizado com sucesso!`
          : `Veículo placa ${veiculoData.placa} cadastrado com sucesso na frota!`
      )
    } catch {
      toast.error('Erro ao salvar veículo na frota.')
    }
  }

  const handleAlternarStatus = (veiculo) => {
    try {
      const novoStatus = !veiculo.ativo
      salvarVeiculoNaFrota({
        ...veiculo,
        ativo: novoStatus,
      })
      recarregarFrota()
      toast.success(
        `Veículo ${veiculo.placa} marcado como ${novoStatus ? 'Ativo na Frota' : 'Inativo'}.`
      )
    } catch {
      toast.error('Erro ao alternar status do veículo.')
    }
  }

  const handleExcluirVeiculo = (veiculo) => {
    setVeiculoParaExcluir(veiculo)
  }

  const confirmarExclusaoVeiculo = () => {
    if (!veiculoParaExcluir) return
    try {
      excluirVeiculoDaFrota(veiculoParaExcluir.placa || veiculoParaExcluir.id || veiculoParaExcluir.value)
      recarregarFrota()
      toast.success(`Veículo ${veiculoParaExcluir.placa} removido da frota com sucesso.`)
    } catch {
      toast.error('Erro ao excluir veículo.')
    } finally {
      setVeiculoParaExcluir(null)
    }
  }

  const handleIniciarOS = (veiculo) => {
    toast.info(`Iniciando Ordem de Serviço para o veículo ${veiculo.placa}...`)
    const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'
    navigate(`${basePath}/ordem-de-servico`, {
      state: {
        veiculoId: veiculo.value || veiculo.id,
        placa: veiculo.placa,
        clienteId: veiculo.clienteId,
        clienteNome: veiculo.clienteNome,
      },
    })
  }

  const temFiltroAtivo =
    busca ||
    filtroProprietario !== 'TODOS' ||
    filtroCombustivel !== 'TODOS' ||
    filtroMarca !== 'TODOS' ||
    filtroStatus !== 'TODOS'

  const handleLimparFiltros = () => {
    setBusca('')
    setFiltroProprietario('TODOS')
    setFiltroCombustivel('TODOS')
    setFiltroMarca('TODOS')
    setFiltroStatus('TODOS')
  }

  if (isMobile) {
    return <MobileVeiculosPage />
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Car size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Frota de Veículos</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total} veículos
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Gestão completa de toda a frota de veículos atendida pela oficina para manutenções e ordens de serviço
              </p>
            </div>
          </div>

          {/* Botão Único de Ação (Regra 12: Sem redundância) */}
          <button
            type="button"
            onClick={handleAbrirNovo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Novo Veículo</span>
          </button>
        </div>

        {/* Resumo de Indicadores da Frota */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total na Frota
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Car size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Veículos de Frotistas (PJ)
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.totalPJ}</span>
            </div>
            <Buildings size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Particulares (PF)
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalPF}</span>
            </div>
            <User size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Montadoras Atendidas
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalMontadoras}</span>
            </div>
            <ShieldCheck size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Campo de Busca Rápida */}
          <div className="sm:col-span-4 relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por placa, modelo, marca, cliente, chassi..."
              className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtro por Montadora / Marca */}
          <div className="sm:col-span-2">
            <Select
              value={opcoesMarcas.find((opt) => opt.value === filtroMarca)}
              onChange={(opt) => setFiltroMarca(opt ? opt.value : 'TODOS')}
              options={opcoesMarcas}
              styles={customSelectStyles}
              placeholder="Montadora"
              isSearchable
            />
          </div>

          {/* Filtro por Combustível */}
          <div className="sm:col-span-2">
            <Select
              value={FILTRO_COMBUSTIVEL_OPCOES.find(
                (opt) => opt.value === filtroCombustivel
              )}
              onChange={(opt) => setFiltroCombustivel(opt ? opt.value : 'TODOS')}
              options={FILTRO_COMBUSTIVEL_OPCOES}
              styles={customSelectStyles}
              placeholder="Combustível"
              isSearchable={false}
            />
          </div>

          {/* Filtro por Tipo de Proprietário */}
          <div className="sm:col-span-2">
            <Select
              value={FILTRO_PROPRIETARIO_OPCOES.find(
                (opt) => opt.value === filtroProprietario
              )}
              onChange={(opt) => setFiltroProprietario(opt ? opt.value : 'TODOS')}
              options={FILTRO_PROPRIETARIO_OPCOES}
              styles={customSelectStyles}
              placeholder="Proprietário"
              isSearchable={false}
            />
          </div>

          {/* Filtro por Status na Frota */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={FILTRO_STATUS_OPCOES.find(
                  (opt) => opt.value === filtroStatus
                )}
                onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
                options={FILTRO_STATUS_OPCOES}
                styles={customSelectStyles}
                placeholder="Status"
                isSearchable={false}
              />
            </div>
            {temFiltroAtivo && (
              <button
                type="button"
                onClick={handleLimparFiltros}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Limpar todos os filtros"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Veículos (Single-Screen Workspace) */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {veiculosFiltrados.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Car size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Nenhum veículo encontrado
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {temFiltroAtivo
                    ? 'Nenhum veículo corresponde aos filtros selecionados. Tente ajustar os termos de pesquisa.'
                    : 'A frota ainda não possui veículos cadastrados. Clique em "Novo Veículo" acima para começar.'}
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
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Placa</th>
                    <th className="py-3 px-4">Marca e Modelo</th>
                    <th className="py-3 px-4">Ano e Cor</th>
                    <th className="py-3 px-4">Combustível</th>
                    <th className="py-3 px-4">KM Atual</th>
                    <th className="py-3 px-4">Cliente Proprietário</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {veiculosFiltrados.map((v) => {
                    const isPF = v.clienteTipoPessoa === 'F'
                    const foneLimpo = (v.clienteTelefone || '').replace(/\D/g, '')

                    return (
                      <tr
                        key={v.id || v.value || v.placa}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Código do Veículo (Separado e Automático) */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                            {v.codigoVeiculo || '—'}
                          </span>
                        </td>

                        {/* Placa com Badge e Chassi */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                            {v.placa}
                          </span>
                          {v.chassi && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]" title={v.chassi}>
                              Chassi: {v.chassi}
                            </div>
                          )}
                        </td>

                        {/* Marca e Modelo */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate">
                            {v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                          </div>
                          {v.marca && (
                            <div className="text-[10px] text-slate-500 font-medium">
                              Montadora: {v.marca}
                            </div>
                          )}
                        </td>

                        {/* Ano e Cor */}
                        <td className="py-3 px-4 text-slate-700">
                          <div className="font-mono font-medium">{v.ano || '—'}</div>
                          {v.cor && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                              {v.cor}
                            </div>
                          )}
                        </td>

                        {/* Combustível */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            {v.combustivel || 'FLEX'}
                          </span>
                        </td>

                        {/* Quilometragem */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {v.kmPadrao ? `${v.kmPadrao} km` : '—'}
                        </td>

                        {/* Proprietário / Cliente */}
                        <td className="py-3 px-4 max-w-sm">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isPF
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {isPF ? 'PF' : 'PJ'}
                            </span>
                            <span className="font-semibold text-slate-800 truncate" title={v.clienteNome}>
                              {v.clienteNome || 'Cliente não identificado'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                            {v.clienteCodigo && <span>Cód: {v.clienteCodigo}</span>}
                            {v.clienteTelefone && (
                              <span className="font-mono">{formatarTelefone(v.clienteTelefone)}</span>
                            )}
                            {foneLimpo && (
                              <a
                                href={`https://wa.me/55${foneLimpo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-1 rounded transition-colors"
                                title="WhatsApp"
                              >
                                <WhatsappLogo size={10} weight="fill" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleAlternarStatus(v)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                              v.ativo !== false
                                ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Clique para alternar o status do veículo"
                          >
                            {v.ativo !== false ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                                <span>Ativo</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <span>Inativo</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => handleAbrirEstacionar(v)}
                              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                              title="Estacionar veículo (Cliente vendeu o carro)"
                            >
                              <Garage size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleIniciarOS(v)}
                              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                              title="Abrir Nova Ordem de Serviço para este veículo"
                            >
                              <ClipboardText size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAbrirEditar(v)}
                              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                              title="Editar Veículo"
                            >
                              <PencilSimple size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcluirVeiculo(v)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Excluir Veículo"
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
      </div>

      {/* Modal de Cadastro e Edição de Veículo */}
      <VeiculoModalForm
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarVeiculo}
        veiculoParaEditar={veiculoEmEdicao}
      />

      {/* Modal para Estacionar Veículo Vendido */}
      <ModalEstacionarVeiculo
        isOpen={modalEstacionarAberto}
        onClose={() => setModalEstacionarAberto(false)}
        veiculoInicial={veiculoParaEstacionar}
        onEstacionadoConcluido={recarregarFrota}
      />

      {/* Diálogo de Confirmação de Exclusão na Frente da Tela */}
      <ModalConfirmacao
        isOpen={Boolean(veiculoParaExcluir)}
        onClose={() => setVeiculoParaExcluir(null)}
        onConfirm={confirmarExclusaoVeiculo}
        titulo="Remover este veículo da frota?"
        descricao="Esta operação removerá o veículo da listagem da frota cadastrada."
        itemDestaque={
          veiculoParaExcluir
            ? `Placa: ${veiculoParaExcluir.placa} ${veiculoParaExcluir.marcaModelo ? `(${veiculoParaExcluir.marcaModelo})` : ''}`
            : ''
        }
        textoConfirmar="Sim, Remover"
        textoCancelar="Cancelar"
        variante="perigo"
      />
    </div>
  )
}
