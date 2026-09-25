import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import {
  ShoppingCart,
  Plus,
  MagnifyingGlass,
  ListBullets,
  ShareNetwork,
  Car,
  Archive,
} from '@phosphor-icons/react'
import { STATUS_COMPRA_OPCOES } from '../../../../../constants/comprasData'
import { mobileSelectStyles, inputBaseClass } from '../../../nova-os/mobile/mobileSelectStyles'

function StatChip({ label, value, dark, warn }) {
  return (
    <div
      className={`shrink-0 min-w-[108px] rounded-xl border p-2.5 ${
        dark
          ? 'bg-[#101828] border-[#101828]'
          : warn
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p
        className={`text-[9.5px] font-bold uppercase tracking-wider ${
          dark ? 'text-zinc-400' : warn ? 'text-amber-700' : 'text-[#667085]'
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-extrabold mt-0.5 ${
          dark ? 'text-white' : warn ? 'text-amber-800' : 'text-[#101828]'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

StatChip.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  dark: PropTypes.bool,
  warn: PropTypes.bool,
}

const TABS = [
  { value: 'pedidos', label: 'Pedidos', icon: ListBullets },
  { value: 'cotacoes', label: 'Cotações', icon: ShareNetwork },
  { value: 'demandas_os', label: 'Demandas OS', icon: Car },
  { value: 'reposicao', label: 'Reposição', icon: Archive },
]

/**
 * Cabeçalho e barra de controle para compras mobile (chips, busca, filtro e abas).
 */
export function MobileComprasHeader({
  metricas,
  abaAtiva,
  onMudarAba,
  termoBusca,
  onMudarBusca,
  filtroStatus,
  onMudarStatus,
  onNovoPedido,
}) {
  const opcoesStatus = [
    { value: 'TODOS', label: 'Todos os Status' },
    ...STATUS_COMPRA_OPCOES.map((s) => ({ value: s.value, label: s.label })),
  ]

  return (
    <div className="space-y-3">
      {/* Topo com Título e Ação Rápida */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]">
            <ShoppingCart size={20} weight="duotone" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#101828] leading-tight">Compras & Cotações</h1>
            <p className="text-[11px] text-[#667085]">Aquisições de peças e cotações de OS</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNovoPedido}
          className="h-9 px-3 rounded-xl bg-[#0284c7] hover:bg-[#0284c7]/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus size={15} weight="bold" />
          Novo Pedido
        </button>
      </div>

      {/* Indicadores em Carrossel Horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <StatChip label="Demandas OS" value={metricas.demandasOS} warn={metricas.demandasOS > 0} />
        <StatChip label="Em Aberto" value={metricas.emAberto} dark />
        <StatChip label="Aguardando" value={metricas.aguardando} />
        <StatChip label="Atrasados" value={metricas.atrasados} warn={metricas.atrasados > 0} />
      </div>

      {/* Navegação por Abas */}
      <div className="flex rounded-xl bg-[#f2f4f7] p-1 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const ativo = abaAtiva === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onMudarAba(tab.value)}
              className={`flex-1 h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                ativo ? 'bg-white text-[#101828] shadow-sm' : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Icon size={14} weight={ativo ? 'bold' : 'regular'} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Filtros de Busca e Status (Exibidos em Pedidos e Cotações) */}
      {(abaAtiva === 'pedidos' || abaAtiva === 'cotacoes') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => onMudarBusca(e.target.value)}
              placeholder="Buscar por fornecedor, peça ou OS..."
              className={`${inputBaseClass} pl-9 text-xs`}
            />
          </div>
          {abaAtiva === 'pedidos' && (
            <div className="relative">
              <Select
                value={opcoesStatus.find((o) => o.value === filtroStatus) || opcoesStatus[0]}
                onChange={(opt) => onMudarStatus(opt?.value || 'TODOS')}
                options={opcoesStatus}
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

MobileComprasHeader.propTypes = {
  metricas: PropTypes.shape({
    demandasOS: PropTypes.number,
    emAberto: PropTypes.number,
    aguardando: PropTypes.number,
    atrasados: PropTypes.number,
  }).isRequired,
  abaAtiva: PropTypes.string.isRequired,
  onMudarAba: PropTypes.func.isRequired,
  termoBusca: PropTypes.string.isRequired,
  onMudarBusca: PropTypes.func.isRequired,
  filtroStatus: PropTypes.string.isRequired,
  onMudarStatus: PropTypes.func.isRequired,
  onNovoPedido: PropTypes.func.isRequired,
}
