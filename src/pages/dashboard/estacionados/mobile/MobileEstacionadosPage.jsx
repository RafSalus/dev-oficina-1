import React, { useState, useEffect, useMemo } from 'react'
import {
  Garage,
  Plus,
  MagnifyingGlass,
  ClockCounterClockwise,
  UserPlus,
  WhatsappLogo,
  Car,
  PencilSimple,
  Trash,
  X,
  FunnelSimple,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarVeiculosEstacionados,
  excluirVeiculoEstacionado,
  obterHistoricoCompletoVeiculo,
} from '../../../../constants/mockVeiculosEstacionados'
import { formatarTelefone } from '../../../../utils/fiscalValidators'
import { ModalHistoricoManutencao } from '../../../../components/estacionados/ModalHistoricoManutencao'
import { ModalVincularCliente } from '../../../../components/estacionados/ModalVincularCliente'
import { ModalEstacionarVeiculo } from '../../../../components/estacionados/ModalEstacionarVeiculo'
import { ModalEditarEstacionado } from '../../../../components/estacionados/ModalEditarEstacionado'

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

function EstacionadoCard({ veiculo, onVerHistorico, onVincular, onEditar, onExcluir }) {
  const foneAntigoLimpo = (veiculo.antigoClienteTelefone || '').replace(/\D/g, '')
  const foneNovoLimpo = (veiculo.novoDonoTelefone || '').replace(/\D/g, '')
  const historico = obterHistoricoCompletoVeiculo(veiculo.placa, veiculo)

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs p-3.5 space-y-2.5">
      {/* Topo do Card */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#101828]">
            {veiculo.placa}
          </span>
          <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
            {veiculo.codigoVeiculo || '—'}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          Estacionado
        </span>
      </div>

      {/* Modelo e Especificações */}
      <div>
        <p className="text-sm font-extrabold text-[#101828] truncate">
          {veiculo.marcaModelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim()}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#667085]">
          <span>{veiculo.ano || '—'}</span>
          {veiculo.cor && <span>• {veiculo.cor}</span>}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            {veiculo.combustivel || 'FLEX'}
          </span>
          {veiculo.kmAtual && <span className="font-mono text-slate-700 font-medium">• {veiculo.kmAtual} km</span>}
        </div>
      </div>

      {/* Dados do Antigo e Novo Dono */}
      <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5 text-xs border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] text-slate-500">Antigo Dono:</span>
          <span className="font-bold text-slate-800 truncate max-w-[170px]">{veiculo.antigoClienteNome || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] text-slate-500">Novo Comprador:</span>
          <span className="font-bold text-sky-800 truncate max-w-[170px]">
            {veiculo.novoDonoNome || 'Aguardando cadastro'}
          </span>
        </div>
        {veiculo.dataEstacionamento && (
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Data da venda:</span>
            <span>{veiculo.dataEstacionamento}</span>
          </div>
        )}
      </div>

      {/* Resumo de Histórico */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => onVerHistorico(veiculo)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 cursor-pointer"
        >
          <ClockCounterClockwise size={14} weight="bold" />
          <span>{historico.length} manutenções no histórico</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEditar(veiculo)}
            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
            title="Editar"
          >
            <PencilSimple size={15} />
          </button>
          <button
            type="button"
            onClick={() => onExcluir(veiculo)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Excluir"
          >
            <Trash size={15} />
          </button>
        </div>
      </div>

      {/* Botões de Ação Principal */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onVincular(veiculo)}
          className="h-10 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <UserPlus size={15} weight="bold" />
          <span>Vincular Cliente</span>
        </button>

        {foneNovoLimpo ? (
          <a
            href={`https://wa.me/55${foneNovoLimpo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <WhatsappLogo size={15} weight="fill" />
            <span>WhatsApp Dono</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onVerHistorico(veiculo)}
            className="h-10 rounded-xl bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ClockCounterClockwise size={15} weight="bold" />
            <span>Ver Prontuário</span>
          </button>
        )}
      </div>
    </div>
  )
}

export function MobileEstacionadosPage() {
  const [estacionados, setEstacionados] = useState([])
  const [busca, setBusca] = useState('')

  // Modais
  const [modalEstacionarAberto, setModalEstacionarAberto] = useState(false)
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false)
  const [modalVincularAberto, setModalVincularAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null)

  const recarregar = () => {
    const lista = carregarVeiculosEstacionados()
    setEstacionados(lista)
  }

  useEffect(() => {
    recarregar()
    const handleStorage = () => recarregar()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const metricas = useMemo(() => {
    const total = estacionados.length
    const comComprador = estacionados.filter(
      (v) => v.novoDonoNome && v.novoDonoNome.trim().length > 0
    ).length
    let totalManutencoes = 0
    estacionados.forEach((v) => {
      const hist = obterHistoricoCompletoVeiculo(v.placa, v)
      totalManutencoes += hist.length
    })
    return { total, comComprador, totalManutencoes }
  }, [estacionados])

  const filtrados = useMemo(() => {
    if (!busca.trim()) return estacionados
    const termo = busca.trim().toLowerCase()
    return estacionados.filter(
      (v) =>
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || '').toLowerCase().includes(termo) ||
        (v.antigoClienteNome || '').toLowerCase().includes(termo) ||
        (v.novoDonoNome || '').toLowerCase().includes(termo)
    )
  }, [estacionados, busca])

  const handleExcluir = (veiculo) => {
    try {
      excluirVeiculoEstacionado(veiculo.id)
      recarregar()
      toast.success(`Veículo placa ${veiculo.placa} excluído.`)
    } catch {
      toast.error('Erro ao excluir veículo.')
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Topo Mobile */}
      <div className="bg-white border-b border-[#e4e7ec] px-4 pt-3 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-black text-[#101828] tracking-tight">Estacionados</h1>
            <p className="text-[11px] text-[#667085]">Veículos vendidos com histórico mantido</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setVeiculoSelecionado(null)
              setModalEstacionarAberto(true)
            }}
            className="h-9 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={15} weight="bold" />
            <span>Estacionar</span>
          </button>
        </div>

        {/* Chips de Indicadores */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
          <StatChip label="Total Estacionados" value={metricas.total} dark />
          <StatChip label="Comprador Informado" value={metricas.comComprador} />
          <StatChip label="Manutenções Preservadas" value={metricas.totalManutencoes} />
        </div>

        {/* Campo de Busca Rápida (Font-size 16px min para evitar zoom no mobile - Regra 10) */}
        <div className="mt-3 relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por placa, modelo ou cliente..."
            style={{ fontSize: '16px' }}
            className="w-full h-11 pl-9 pr-8 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Cards de Veículos Estacionados */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-h-0 space-y-3">
        {filtrados.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <Garage size={24} />
            </div>
            <p className="text-xs font-bold text-slate-800">Nenhum veículo estacionado</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Toque em "Estacionar" acima para registrar um veículo vendido mantendo todo o histórico.
            </p>
          </div>
        ) : (
          filtrados.map((v) => (
            <EstacionadoCard
              key={v.id || v.placa}
              veiculo={v}
              onVerHistorico={(veic) => {
                setVeiculoSelecionado(veic)
                setModalHistoricoAberto(true)
              }}
              onVincular={(veic) => {
                setVeiculoSelecionado(veic)
                setModalVincularAberto(true)
              }}
              onEditar={(veic) => {
                setVeiculoSelecionado(veic)
                setModalEditarAberto(true)
              }}
              onExcluir={handleExcluir}
            />
          ))
        )}
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
        onVinculoConcluido={recarregar}
      />

      <ModalEstacionarVeiculo
        isOpen={modalEstacionarAberto}
        onClose={() => setModalEstacionarAberto(false)}
        veiculoInicial={veiculoSelecionado}
        onEstacionadoConcluido={recarregar}
      />

      <ModalEditarEstacionado
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        veiculo={veiculoSelecionado}
        onEdicaoConcluida={recarregar}
      />
    </div>
  )
}
