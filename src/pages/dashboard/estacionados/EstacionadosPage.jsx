import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  Garage,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  ClockCounterClockwise,
  UserPlus,
  WhatsappLogo,
  Car,
  User,
  ShieldCheck,
  CheckCircle,
  X,
  Buildings,
  Gauge,
  CalendarBlank,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarVeiculosEstacionados,
  excluirVeiculoEstacionado,
  obterHistoricoCompletoVeiculo,
} from '../../../constants/mockVeiculosEstacionados'
import { formatarTelefone } from '../../../utils/fiscalValidators'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { ModalHistoricoManutencao } from '../../../components/estacionados/ModalHistoricoManutencao'
import { ModalVincularCliente } from '../../../components/estacionados/ModalVincularCliente'
import { ModalEstacionarVeiculo } from '../../../components/estacionados/ModalEstacionarVeiculo'
import { ModalEditarEstacionado } from '../../../components/estacionados/ModalEditarEstacionado'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { MobileEstacionadosPage } from './mobile/MobileEstacionadosPage'

const FILTRO_SITUACAO_OPCOES = [
  { value: 'TODOS', label: 'Todas as Situações' },
  { value: 'COM_COMPRADOR', label: 'Comprador Informado' },
  { value: 'SEM_COMPRADOR', label: 'Aguardando Novo Dono' },
]

export function EstacionadosPage() {
  const isMobile = useIsMobile()
  const [estacionados, setEstacionados] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('TODOS')
  const [filtroMarca, setFiltroMarca] = useState('TODOS')

  // Modais
  const [modalEstacionarAberto, setModalEstacionarAberto] = useState(false)
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false)
  const [modalVincularAberto, setModalVincularAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null)

  const recarregarEstacionados = () => {
    const lista = carregarVeiculosEstacionados()
    setEstacionados(lista)
  }

  useEffect(() => {
    recarregarEstacionados()

    const handleStorage = () => {
      recarregarEstacionados()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Extrai montadoras presentes nos veículos estacionados
  const opcoesMarcas = useMemo(() => {
    const marcasSet = new Set()
    estacionados.forEach((v) => {
      if (v.marca) marcasSet.add(v.marca.toUpperCase().trim())
    })
    const ordenadas = Array.from(marcasSet).sort()
    return [
      { value: 'TODOS', label: 'Todas as Montadoras' },
      ...ordenadas.map((m) => ({ value: m, label: m })),
    ]
  }, [estacionados])

  // Indicadores e métricas do pátio de estacionados
  const metricas = useMemo(() => {
    const total = estacionados.length
    const comComprador = estacionados.filter(
      (v) => v.novoDonoNome && v.novoDonoNome.trim().length > 0
    ).length
    const semComprador = total - comComprador

    let totalManutencoes = 0
    estacionados.forEach((v) => {
      const hist = obterHistoricoCompletoVeiculo(v.placa, v)
      totalManutencoes += hist.length
    })

    return {
      total,
      comComprador,
      semComprador,
      totalManutencoes,
    }
  }, [estacionados])

  // Filtragem dos veículos estacionados
  const estacionadosFiltrados = useMemo(() => {
    return estacionados.filter((v) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marca || '').toLowerCase().includes(termo) ||
        (v.modelo || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || '').toLowerCase().includes(termo) ||
        (v.codigoVeiculo || '').toLowerCase().includes(termo) ||
        (v.antigoClienteNome || '').toLowerCase().includes(termo) ||
        (v.novoDonoNome || '').toLowerCase().includes(termo) ||
        (v.motivoVenda || '').toLowerCase().includes(termo) ||
        (v.chassi || '').toLowerCase().includes(termo)

      const temComprador = Boolean(v.novoDonoNome && v.novoDonoNome.trim().length > 0)
      const matchSituacao =
        filtroSituacao === 'TODOS' ||
        (filtroSituacao === 'COM_COMPRADOR' && temComprador) ||
        (filtroSituacao === 'SEM_COMPRADOR' && !temComprador)

      const matchMarca =
        filtroMarca === 'TODOS' ||
        (v.marca || '').toUpperCase().trim() === filtroMarca

      return matchBusca && matchSituacao && matchMarca
    })
  }, [estacionados, busca, filtroSituacao, filtroMarca])

  const temFiltroAtivo = busca !== '' || filtroSituacao !== 'TODOS' || filtroMarca !== 'TODOS'

  const handleLimparFiltros = () => {
    setBusca('')
    setFiltroSituacao('TODOS')
    setFiltroMarca('TODOS')
  }

  // Abertura de Modais
  const handleAbrirEstacionar = () => {
    setVeiculoSelecionado(null)
    setModalEstacionarAberto(true)
  }

  const handleAbrirHistorico = (veiculo) => {
    setVeiculoSelecionado(veiculo)
    setModalHistoricoAberto(true)
  }

  const handleAbrirVincular = (veiculo) => {
    setVeiculoSelecionado(veiculo)
    setModalVincularAberto(true)
  }

  const handleAbrirEditar = (veiculo) => {
    setVeiculoSelecionado(veiculo)
    setModalEditarAberto(true)
  }

  const handleExcluir = (veiculo) => {
    try {
      excluirVeiculoEstacionado(veiculo.id)
      recarregarEstacionados()
      toast.success(`Veículo placa ${veiculo.placa} removido dos estacionados.`)
    } catch {
      toast.error('Erro ao excluir veículo estacionado.')
    }
  }

  if (isMobile) {
    return <MobileEstacionadosPage />
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Garage size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Veículos Estacionados</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total} veículos
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Veículos de clientes vendidos aguardando novo proprietário com histórico de manutenção preservado
              </p>
            </div>
          </div>

          {/* Botão Único de Ação (Regra 12: Sem redundância) */}
          <button
            type="button"
            onClick={handleAbrirEstacionar}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Estacionar Veículo</span>
          </button>
        </div>

        {/* Resumo de Indicadores do Pátio de Estacionados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total Estacionados
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Garage size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Comprador Informado
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.comComprador}</span>
            </div>
            <UserPlus size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Aguardando Novo Dono
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.semComprador}</span>
            </div>
            <User size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Manutenções no Acervo
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalManutencoes} ordens</span>
            </div>
            <ClockCounterClockwise size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Campo de Busca Rápida */}
          <div className="sm:col-span-6 relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por placa, modelo, marca, antigo dono, comprador ou chassi..."
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

          {/* Filtro por Situação do Novo Dono */}
          <div className="sm:col-span-3">
            <Select
              value={FILTRO_SITUACAO_OPCOES.find((opt) => opt.value === filtroSituacao)}
              onChange={(opt) => setFiltroSituacao(opt ? opt.value : 'TODOS')}
              options={FILTRO_SITUACAO_OPCOES}
              styles={customSelectStyles}
              placeholder="Situação do Dono"
              isSearchable={false}
            />
          </div>

          {/* Filtro por Marca */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={opcoesMarcas.find((opt) => opt.value === filtroMarca)}
                onChange={(opt) => setFiltroMarca(opt ? opt.value : 'TODOS')}
                options={opcoesMarcas}
                styles={customSelectStyles}
                placeholder="Montadora"
                isSearchable
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

      {/* Tabela de Veículos Estacionados (Single-Screen Workspace) */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {estacionadosFiltrados.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Garage size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Nenhum veículo estacionado encontrado
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {temFiltroAtivo
                    ? 'Nenhum veículo corresponde aos filtros selecionados. Tente ajustar os termos de pesquisa.'
                    : 'Quando clientes venderem seus veículos para novos proprietários que ainda não são clientes da oficina, estacione-os aqui para preservar o histórico.'}
                </p>
                {temFiltroAtivo ? (
                  <button
                    type="button"
                    onClick={handleLimparFiltros}
                    className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                  >
                    Limpar todos os filtros
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAbrirEstacionar}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Estacionar Primeiro Veículo</span>
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                    <th className="py-3 px-4">Código e Placa</th>
                    <th className="py-3 px-4">Veículo</th>
                    <th className="py-3 px-4">Antigo Proprietário</th>
                    <th className="py-3 px-4">Novo Dono Provisório</th>
                    <th className="py-3 px-4">Histórico Acumulado</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {estacionadosFiltrados.map((v) => {
                    const foneAntigoLimpo = (v.antigoClienteTelefone || '').replace(/\D/g, '')
                    const foneNovoLimpo = (v.novoDonoTelefone || '').replace(/\D/g, '')
                    const historico = obterHistoricoCompletoVeiculo(v.placa, v)

                    return (
                      <tr
                        key={v.id || v.placa}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Código e Placa */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                              {v.placa}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              {v.codigoVeiculo || '—'}
                            </span>
                          </div>
                          {v.chassi && (
                            <div className="text-[10px] text-slate-400 font-mono mt-1 truncate max-w-[140px]" title={v.chassi}>
                              Chassi: {v.chassi}
                            </div>
                          )}
                        </td>

                        {/* Veículo (Marca, Modelo, Ano, Cor, Combustível, KM) */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 truncate">
                            {v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                            <span>Ano: {v.ano || '—'}</span>
                            {v.cor && <span>• {v.cor}</span>}
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              {v.combustivel || 'FLEX'}
                            </span>
                            {v.kmAtual && (
                              <span className="font-mono text-slate-700 font-medium">
                                • {v.kmAtual} km
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Antigo Proprietário */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate" title={v.antigoClienteNome}>
                            {v.antigoClienteNome || 'Cliente não identificado'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                            {v.antigoClienteTelefone && (
                              <span className="font-mono">{formatarTelefone(v.antigoClienteTelefone)}</span>
                            )}
                            {foneAntigoLimpo && (
                              <a
                                href={`https://wa.me/55${foneAntigoLimpo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-1 rounded transition-colors"
                                title="WhatsApp Antigo Proprietário"
                              >
                                <WhatsappLogo size={10} weight="fill" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Estacionado em: {v.dataEstacionamento || '—'}
                          </div>
                        </td>

                        {/* Novo Dono Provisório */}
                        <td className="py-3 px-4 max-w-xs">
                          {v.novoDonoNome ? (
                            <div>
                              <div className="font-semibold text-sky-800 truncate" title={v.novoDonoNome}>
                                {v.novoDonoNome}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                {v.novoDonoTelefone && (
                                  <span className="font-mono">{formatarTelefone(v.novoDonoTelefone)}</span>
                                )}
                                {foneNovoLimpo && (
                                  <a
                                    href={`https://wa.me/55${foneNovoLimpo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-1 rounded transition-colors"
                                    title="WhatsApp Novo Dono"
                                  >
                                    <WhatsappLogo size={10} weight="fill" />
                                  </a>
                                )}
                              </div>
                              {v.observacoes && (
                                <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[180px]" title={v.observacoes}>
                                  {v.observacoes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              <span>Aguardando identificação</span>
                            </span>
                          )}
                        </td>

                        {/* Histórico Acumulado */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleAbrirHistorico(v)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
                            title="Visualizar histórico completo de manutenções"
                          >
                            <ClockCounterClockwise size={14} weight="bold" />
                            <span>{historico.length} manutenções</span>
                          </button>
                          {historico[0] && (
                            <div className="text-[10px] text-slate-400 mt-1">
                              Última OS: #{historico[0].numeroOS} ({historico[0].dataEntrada})
                            </div>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            {/* Botão Vincular a Cliente */}
                            <button
                              type="button"
                              onClick={() => handleAbrirVincular(v)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
                              title="Vincular a cliente existente ou cadastrar novo"
                            >
                              <UserPlus size={14} weight="bold" />
                              <span>Vincular</span>
                            </button>

                            {/* Botão Ver Prontuário */}
                            <button
                              type="button"
                              onClick={() => handleAbrirHistorico(v)}
                              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                              title="Ver Prontuário de Manutenções"
                            >
                              <ClockCounterClockwise size={16} />
                            </button>

                            {/* Botão Editar Informações */}
                            <button
                              type="button"
                              onClick={() => handleAbrirEditar(v)}
                              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                              title="Editar Informações do Estacionado"
                            >
                              <PencilSimple size={16} />
                            </button>

                            {/* Botão Excluir */}
                            <button
                              type="button"
                              onClick={() => handleExcluir(v)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Excluir Registro"
                            >
                              <Trash size={16} />
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

      {/* Modais */}
      <ModalHistoricoManutencao
        isOpen={modalHistoricoAberto}
        onClose={() => setModalHistoricoAberto(false)}
        veiculo={veiculoSelecionado}
      />

      <ModalVincularCliente
        isOpen={modalVincularAberto}
        onClose={() => setModalVincularAberto(false)}
        veiculo={veiculoSelecionado}
        onVinculoConcluido={recarregarEstacionados}
      />

      <ModalEstacionarVeiculo
        isOpen={modalEstacionarAberto}
        onClose={() => setModalEstacionarAberto(false)}
        veiculoInicial={veiculoSelecionado}
        onEstacionadoConcluido={recarregarEstacionados}
      />

      <ModalEditarEstacionado
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        veiculo={veiculoSelecionado}
        onEdicaoConcluida={recarregarEstacionados}
      />
    </div>
  )
}
