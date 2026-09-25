import React from 'react'
import { Archive, ArrowsLeftRight, ListBullets, ClockCounterClockwise, ShoppingCart } from '@phosphor-icons/react'

function StatChip({ label, value, dark, warn, danger }) {
  return (
    <div
      className={`shrink-0 min-w-[108px] rounded-xl border p-2.5 ${
        dark
          ? 'bg-[#101828] border-[#101828]'
          : danger
            ? 'bg-rose-50 border-rose-200'
            : warn
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p
        className={`text-[9.5px] font-bold uppercase tracking-wider ${
          dark ? 'text-zinc-400' : danger ? 'text-rose-700' : warn ? 'text-amber-700' : 'text-[#667085]'
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-extrabold mt-0.5 ${
          dark ? 'text-white' : danger ? 'text-rose-800' : warn ? 'text-amber-800' : 'text-[#101828]'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

const TABS = [
  { value: 'posicao', label: 'Posição', icon: ListBullets },
  { value: 'kardex', label: 'Kardex', icon: ClockCounterClockwise },
  { value: 'reposicao', label: 'Reposição', icon: ShoppingCart },
]

export function MobileEstoqueHeader({ metricas, abaAtiva, onTrocarAba, onNovoMovimento }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] flex items-center gap-1.5">
            <Archive size={16} className="text-[#0284c7]" weight="bold" />
            Estoque e Almoxarifado
          </h1>
          <p className="text-[11px] text-[#667085] truncate">Posição, kardex e sugestão de reposição</p>
        </div>
        <button
          type="button"
          onClick={onNovoMovimento}
          aria-label="Movimentar Estoque"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0 cursor-pointer"
        >
          <ArrowsLeftRight size={18} weight="bold" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Unidades" value={`${metricas?.totalUnidades || 0} un`} dark />
        <StatChip label="Valor em Custo" value={`R$ ${metricas?.valorCustoTotal || '0,00'}`} />
        <StatChip label="Reposição" value={metricas?.itensAbaixoMinimo || 0} warn={(metricas?.itensAbaixoMinimo || 0) > 0} />
        <StatChip label="Zerados" value={metricas?.itensZerados || 0} danger={(metricas?.itensZerados || 0) > 0} />
      </div>

      <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl mb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isAtiva = abaAtiva === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTrocarAba(tab.value)}
              className={`flex-1 h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                isAtiva ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
              }`}
            >
              <Icon size={14} weight={isAtiva ? 'fill' : 'bold'} className={isAtiva ? 'text-[#0284c7]' : ''} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
