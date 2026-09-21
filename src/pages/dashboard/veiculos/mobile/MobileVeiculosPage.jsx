import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  Car,
  Plus,
  MagnifyingGlass,
  FunnelSimple,
  ClipboardText,
  WhatsappLogo,
  Garage,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { carregarTodosVeiculosDaFrota, salvarVeiculoNaFrota, excluirVeiculoDaFrota } from '../../../../constants/mockClientesVeiculos'
import { formatarTelefone } from '../../../../utils/fiscalValidators'
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { MobileVeiculoFormModal } from './MobileVeiculoFormModal'
import { ModalEstacionarVeiculo } from '../../../../components/estacionados/ModalEstacionarVeiculo'

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

function StatChip({ label, value, dark }) {
  return (
    <div className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'}`}>
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>{label}</p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

function VeiculoCard({ veiculo, onEditar, onIniciarOS, onEstacionar }) {
  const isPF = veiculo.clienteTipoPessoa === 'F'
  const foneLimpo = (veiculo.clienteTelefone || '').replace(/\D/g, '')

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <button type="button" onClick={onEditar} className="w-full text-left">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#101828]">{veiculo.placa}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${veiculo.ativo !== false ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-[#f2f4f7] text-[#667085] border border-[#e4e7ec]'}`}>
            {veiculo.ativo !== false ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <p className="text-sm font-extrabold text-[#101828] truncate">{veiculo.marcaModelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim()}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10.5px] text-[#667085]">{veiculo.ano || '—'}</span>
          {veiculo.cor && <span className="text-[10.5px] text-[#667085]">• {veiculo.cor}</span>}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">{veiculo.combustivel || 'FLEX'}</span>
        </div>
        {veiculo.kmPadrao && <p className="text-[10.5px] font-mono text-[#98a2b3] mt-1">{veiculo.kmPadrao} km</p>}

        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isPF ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]'}`}>
              {isPF ? 'PF' : 'PJ'}
            </span>
            <span className="text-[10.5px] font-semibold text-[#344054] truncate">{veiculo.clienteNome || 'Cliente não identificado'}</span>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <button type="button" onClick={(e) => { e.stopPropagation(); onIniciarOS(veiculo) }} className="h-9 rounded-lg bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1">
          <ClipboardText size={13} weight="bold" />
          <span>OS</span>
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onEstacionar(veiculo) }} className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-100">
          <Garage size={13} weight="bold" />
          <span>Estacionar</span>
        </button>
        {foneLimpo ? (
          <a
            href={`https://wa.me/55${foneLimpo}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="h-9 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1"
          >
            <WhatsappLogo size={13} weight="fill" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <div className="h-9 rounded-lg bg-slate-50 border border-slate-100" />
        )}
      </div>
    </div>
  )
}

export function MobileVeiculosPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [veiculos, setVeiculos] = useState(() => carregarTodosVeiculosDaFrota())
  const [busca, setBusca] = useState('')
  const [filtroProprietario, setFiltroProprietario] = useState('TODOS')
  const [filtroCombustivel, setFiltroCombustivel] = useState('TODOS')
  const [filtroMarca, setFiltroMarca] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [veiculoEmEdicao, setVeiculoEmEdicao] = useState(null)
  const [modalEstacionarAberto, setModalEstacionarAberto] = useState(false)
  const [veiculoParaEstacionar, setVeiculoParaEstacionar] = useState(null)

  const recarregarFrota = () => setVeiculos(carregarTodosVeiculosDaFrota())

  useEffect(() => {
    window.addEventListener('storage', recarregarFrota)
    return () => window.removeEventListener('storage', recarregarFrota)
  }, [])

  const opcoesMarcas = useMemo(() => {
    const marcasSet = new Set()
    veiculos.forEach((v) => { if (v.marca) marcasSet.add(v.marca.toUpperCase().trim()) })
    return [{ value: 'TODOS', label: 'Todas as Montadoras' }, ...Array.from(marcasSet).sort().map((m) => ({ value: m, label: m }))]
  }, [veiculos])

  const metricas = useMemo(() => {
    const total = veiculos.length
    const totalPF = veiculos.filter((v) => v.clienteTipoPessoa === 'F').length
    const totalPJ = veiculos.filter((v) => v.clienteTipoPessoa === 'J').length
    const montadorasSet = new Set(veiculos.map((v) => (v.marca || '').toUpperCase().trim()).filter(Boolean))
    return { total, totalPF, totalPJ, totalMontadoras: montadorasSet.size }
  }, [veiculos])

  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter((v) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marca || '').toLowerCase().includes(termo) ||
        (v.modelo || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || '').toLowerCase().includes(termo) ||
        (v.clienteNome || '').toLowerCase().includes(termo) ||
        (v.chassi || '').toLowerCase().includes(termo)
      const matchProprietario = filtroProprietario === 'TODOS' || (filtroProprietario === 'PF' && v.clienteTipoPessoa === 'F') || (filtroProprietario === 'PJ' && v.clienteTipoPessoa === 'J')
      const matchCombustivel = filtroCombustivel === 'TODOS' || (v.combustivel || 'FLEX').toUpperCase() === filtroCombustivel
      const matchMarca = filtroMarca === 'TODOS' || (v.marca || '').toUpperCase().trim() === filtroMarca
      const matchStatus = filtroStatus === 'TODOS' || (filtroStatus === 'ATIVOS' && v.ativo !== false) || (filtroStatus === 'INATIVOS' && v.ativo === false)
      return matchBusca && matchProprietario && matchCombustivel && matchMarca && matchStatus
    })
  }, [veiculos, busca, filtroProprietario, filtroCombustivel, filtroMarca, filtroStatus])

  const filtrosAtivos = filtroProprietario !== 'TODOS' || filtroCombustivel !== 'TODOS' || filtroMarca !== 'TODOS' || filtroStatus !== 'TODOS'

  const handleAbrirNovo = () => {
    setVeiculoEmEdicao(null)
    setModalAberto(true)
  }

  const handleSalvarVeiculo = (veiculoData, clienteIdOriginal) => {
    try {
      salvarVeiculoNaFrota(veiculoData, clienteIdOriginal)
      recarregarFrota()
      toast.success(veiculoEmEdicao ? `Veículo placa ${veiculoData.placa} atualizado!` : `Veículo placa ${veiculoData.placa} cadastrado na frota!`)
      setModalAberto(false)
    } catch {
      toast.error('Erro ao salvar veículo na frota.')
    }
  }

  const handleExcluirVeiculo = (veiculo) => {
    try {
      excluirVeiculoDaFrota(veiculo.placa || veiculo.id || veiculo.value)
      recarregarFrota()
      toast.success(`Veículo ${veiculo.placa} removido da frota.`)
      setModalAberto(false)
    } catch {
      toast.error('Erro ao excluir veículo.')
    }
  }

  const handleIniciarOS = (veiculo) => {
    toast.info(`Iniciando Ordem de Serviço para o veículo ${veiculo.placa}...`)
    const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'
    navigate(`${basePath}/ordem-de-servico`, {
      state: { veiculoId: veiculo.value || veiculo.id, placa: veiculo.placa, clienteId: veiculo.clienteId, clienteNome: veiculo.clienteNome },
    })
  }

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] flex items-center gap-1.5">
            <Car size={16} className="text-[#0284c7]" weight="bold" />
            Frota de Veículos
          </h1>
          <p className="text-[11px] text-[#667085] truncate">Gestão da frota atendida pela oficina</p>
        </div>
        <button
          type="button"
          onClick={handleAbrirNovo}
          aria-label="Novo Veículo"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Total na Frota" value={metricas.total} dark />
        <StatChip label="Frotistas (PJ)" value={metricas.totalPJ} />
        <StatChip label="Particulares (PF)" value={metricas.totalPF} />
        <StatChip label="Montadoras" value={metricas.totalMontadoras} />
      </div>

      <div className="relative mb-2.5">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar placa, modelo, marca, cliente..."
          className={`${inputBaseClass} pl-10`}
        />
      </div>

      <button
        type="button"
        onClick={() => setFiltrosAbertos((v) => !v)}
        className={`w-full h-10 mb-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${filtrosAtivos ? 'border-[#0284c7] text-[#0284c7] bg-[#e0f2fe]' : 'border-[#d0d5dd] text-[#344054] bg-white'}`}
      >
        <FunnelSimple size={15} weight="bold" />
        Filtros {filtrosAtivos ? '(ativos)' : ''}
      </button>

      {filtrosAbertos && (
        <div className="space-y-2 mb-3">
          <Select
            value={opcoesMarcas.find((o) => o.value === filtroMarca)}
            onChange={(opt) => setFiltroMarca(opt ? opt.value : 'TODOS')}
            options={opcoesMarcas}
            styles={mobileSelectStyles}
            placeholder="Montadora"
          />
          <Select
            value={FILTRO_COMBUSTIVEL_OPCOES.find((o) => o.value === filtroCombustivel)}
            onChange={(opt) => setFiltroCombustivel(opt ? opt.value : 'TODOS')}
            options={FILTRO_COMBUSTIVEL_OPCOES}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Combustível"
          />
          <Select
            value={FILTRO_PROPRIETARIO_OPCOES.find((o) => o.value === filtroProprietario)}
            onChange={(opt) => setFiltroProprietario(opt ? opt.value : 'TODOS')}
            options={FILTRO_PROPRIETARIO_OPCOES}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Proprietário"
          />
          <Select
            value={FILTRO_STATUS_OPCOES.find((o) => o.value === filtroStatus)}
            onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
            options={FILTRO_STATUS_OPCOES}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Status"
          />
        </div>
      )}

      {veiculosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <Car size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Nenhum veículo encontrado</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            {busca || filtrosAtivos ? 'Ajuste a busca ou os filtros aplicados.' : 'A frota ainda não possui veículos cadastrados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {veiculosFiltrados.map((v) => (
            <VeiculoCard
              key={v.id || v.value || v.placa}
              veiculo={v}
              onEditar={() => { setVeiculoEmEdicao(v); setModalAberto(true) }}
              onIniciarOS={handleIniciarOS}
              onEstacionar={(veic) => {
                setVeiculoParaEstacionar(veic)
                setModalEstacionarAberto(true)
              }}
            />
          ))}
        </div>
      )}

      <MobileVeiculoFormModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarVeiculo}
        onExcluir={handleExcluirVeiculo}
        veiculoParaEditar={veiculoEmEdicao}
      />

      <ModalEstacionarVeiculo
        isOpen={modalEstacionarAberto}
        onClose={() => setModalEstacionarAberto(false)}
        veiculoInicial={veiculoParaEstacionar}
        onEstacionadoConcluido={recarregarFrota}
      />
    </div>
  )
}
