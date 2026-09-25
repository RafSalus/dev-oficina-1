import React from 'react'
import { MagnifyingGlass, X, PlusCircle } from '@phosphor-icons/react'

export function GarantiasFiltros({
  busca,
  onBuscaChange,
  filtroStatus,
  onFiltroStatusChange,
  contadores,
  onNovoAcionamento,
}) {
  const tabs = [
    { id: 'TODAS', label: 'Todas', count: contadores.total },
    { id: 'ATIVA', label: 'Ativas', count: contadores.ativas, badgeColor: 'bg-emerald-50 text-emerald-700' },
    { id: 'A_VENCER', label: 'A Vencer', count: contadores.aVencer, badgeColor: 'bg-amber-50 text-amber-700' },
    { id: 'ACIONADA', label: 'Acionadas', count: contadores.acionadas, badgeColor: 'bg-rose-50 text-rose-700' },
    { id: 'EXPIRADA', label: 'Expiradas', count: contadores.expiradas, badgeColor: 'bg-zinc-100 text-zinc-600' },
  ]

  return (
    <div className="bg-white rounded-xl p-3 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
      {/* Tabs de Filtro */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {tabs.map((tab) => {
          const isAtivo = filtroStatus === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFiltroStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                isAtivo
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isAtivo ? 'bg-zinc-700 text-white' : tab.badgeColor || 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Busca e Ação Primária */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:w-72">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar por placa, cliente, OS..."
            className="w-full pl-9 pr-8 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
          {busca && (
            <button
              type="button"
              onClick={() => onBuscaChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onNovoAcionamento}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
        >
          <PlusCircle size={16} weight="bold" />
          <span>Acionar Garantia</span>
        </button>
      </div>
    </div>
  )
}
