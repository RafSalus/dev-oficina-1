import React from 'react'
import { CreditCard, IdentificationCard, LinkBreak, ArrowsClockwise } from '@phosphor-icons/react'

export function PDVHeader({
  osVinculada,
  buscaOS,
  onBuscaOSChange,
  onBuscarOS,
  onDesvincularOS,
  onNovaVenda,
}) {
  return (
    <div className="shrink-0 flex items-center justify-between gap-3 bg-white border border-[#e4e7ec] rounded-2xl px-4 py-3 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#101828] text-[#38bdf8] flex items-center justify-center shrink-0">
          <CreditCard size={19} weight="bold" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] leading-none">Ponto de Venda (PDV)</h1>
          <p className="text-[11px] text-[#667085] mt-0.5">
            Venda de balcão, fechamento de Ordens de Serviço e emissão de nota fiscal.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {osVinculada ? (
          <div className="h-9 px-3 rounded-xl bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] text-xs font-bold flex items-center gap-2">
            <IdentificationCard size={15} weight="bold" />
            <span>Vinculada à OS #{osVinculada.numeroOS}</span>
            <button
              type="button"
              onClick={onDesvincularOS}
              className="text-[#0369a1] hover:text-[#101828] cursor-pointer"
              title="Desvincular OS"
            >
              <LinkBreak size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={buscaOS}
              onChange={(e) => onBuscaOSChange?.(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onBuscarOS?.()}
              placeholder="Vincular OS Nº..."
              className="h-9 w-36 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
            <button
              type="button"
              onClick={onBuscarOS}
              className="h-9 px-3 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Vincular
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onNovaVenda}
          className="h-9 px-3 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          title="Descartar carrinho atual e iniciar nova venda"
        >
          <ArrowsClockwise size={14} weight="bold" />
          Nova Venda
        </button>
      </div>
    </div>
  )
}
