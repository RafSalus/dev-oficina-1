import React, { useState } from 'react'
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
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import {
  useVeiculosWorkflow,
  FILTRO_PROPRIETARIO_OPCOES,
  FILTRO_COMBUSTIVEL_OPCOES,
  FILTRO_STATUS_OPCOES,
} from '../../../../hooks/useVeiculosWorkflow'
import { MobileVeiculoFormModal } from './MobileVeiculoFormModal'
import { ModalEstacionarVeiculo } from '../../../../components/estacionados/ModalEstacionarVeiculo'

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p
        className={`text-[9.5px] font-bold uppercase tracking-wider ${
          dark ? 'text-zinc-400' : 'text-[#667085]'
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-extrabold mt-0.5 ${
          dark ? 'text-white' : 'text-[#101828]'
        }`}
      >
        {value}
      </p>
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
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#101828]">
            {veiculo.placa}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              veiculo.ativo !== false
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'bg-[#f2f4f7] text-[#667085] border border-[#e4e7ec]'
            }`}
          >
            {veiculo.ativo !== false ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <p className="text-sm font-extrabold text-[#101828] truncate">
          {veiculo.marcaModelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim()}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10.5px] text-[#667085]">{veiculo.ano || '—'}</span>
          {veiculo.cor && <span className="text-[10.5px] text-[#667085]">• {veiculo.cor}</span>}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            {veiculo.combustivel || 'FLEX'}
          </span>
        </div>
        {veiculo.kmPadrao && (
          <p className="text-[10.5px] font-mono text-[#98a2b3] mt-1">{veiculo.kmPadrao} km</p>
        )}

        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                isPF
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]'
              }`}
            >
              {isPF ? 'PF' : 'PJ'}
            </span>
            <span className="text-[10.5px] font-semibold text-[#344054] truncate">
              {veiculo.clienteNome || 'Cliente não identificado'}
            </span>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onIniciarOS(veiculo)
          }}
          className="h-9 rounded-lg bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1"
        >
          <ClipboardText size={13} weight="bold" />
          <span>OS</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEstacionar(veiculo)
          }}
          className="h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-100"
        >
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
  const workflow = useVeiculosWorkflow()
  const {
    metricas,
    busca,
    setBusca,
    opcoesMarcas,
    filtroMarca,
    setFiltroMarca,
    filtroCombustivel,
    setFiltroCombustivel,
    filtroProprietario,
    setFiltroProprietario,
    filtroStatus,
    setFiltroStatus,
    temFiltroAtivo,
    veiculosFiltrados,
    modalAberto,
    abrirNovo,
    abrirEditar,
    fecharModal,
    veiculoEmEdicao,
    modalEstacionarAberto,
    veiculoParaEstacionar,
    abrirEstacionar,
    fecharEstacionar,
    salvarVeiculo,
    excluirDireto,
    iniciarOS,
    recarregarFrota,
    carregando,
    erro,
    recarregar,
  } = workflow

  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

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
          onClick={abrirNovo}
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
        <MagnifyingGlass
          size={16}
          weight="bold"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none"
        />
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
        className={`w-full h-10 mb-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
          temFiltroAtivo
            ? 'border-[#0284c7] text-[#0284c7] bg-[#e0f2fe]'
            : 'border-[#d0d5dd] text-[#344054] bg-white'
        }`}
      >
        <FunnelSimple size={15} weight="bold" />
        Filtros {temFiltroAtivo ? '(ativos)' : ''}
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

      {carregando ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-slate-200 border-t-sky-600 mb-3" />
          <p className="text-xs text-[#667085]">Carregando veículos...</p>
        </div>
      ) : erro ? (
        <div className="flex flex-col items-center justify-center text-center py-14 bg-white rounded-2xl border border-rose-200 p-4">
          <p className="text-sm font-bold text-rose-600 mb-1">Falha ao carregar veículos</p>
          <p className="text-xs text-[#667085] mb-3">{erro.message || 'Erro de conexão com o banco de dados.'}</p>
          <button
            type="button"
            onClick={recarregar}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#0284c7] rounded-xl cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : veiculosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <Car size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Nenhum veículo encontrado</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            {busca || temFiltroAtivo
              ? 'Ajuste a busca ou os filtros aplicados.'
              : 'A frota ainda não possui veículos cadastrados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {veiculosFiltrados.map((v) => (
            <VeiculoCard
              key={v.id || v.value || v.placa}
              veiculo={v}
              onEditar={() => abrirEditar(v)}
              onIniciarOS={iniciarOS}
              onEstacionar={abrirEstacionar}
            />
          ))}
        </div>
      )}

      <MobileVeiculoFormModal
        isOpen={modalAberto}
        onClose={fecharModal}
        onSalvar={salvarVeiculo}
        onExcluir={excluirDireto}
        veiculoParaEditar={veiculoEmEdicao}
      />

      <ModalEstacionarVeiculo
        isOpen={modalEstacionarAberto}
        onClose={fecharEstacionar}
        veiculoInicial={veiculoParaEstacionar}
        onEstacionadoConcluido={recarregarFrota}
      />
    </div>
  )
}
