import React from 'react'
import {
  SealCheck,
  ClockCountdown,
  WarningCircle,
  ChartLineUp,
} from '@phosphor-icons/react'

export function GarantiasKPIs({ metricas }) {
  const cards = [
    {
      id: 'ativas',
      titulo: 'Garantias Ativas',
      valor: metricas.ativas,
      legenda: 'Peças e serviços em vigência',
      icone: SealCheck,
      corIcone: 'text-emerald-500',
      bgIcone: 'bg-emerald-500/10 border-emerald-500/20',
      corBorda: 'border-emerald-500/20',
    },
    {
      id: 'a-vencer',
      titulo: 'A Vencer (≤ 30 dias)',
      valor: metricas.aVencer,
      legenda: 'Revisão preventiva sugerida',
      icone: ClockCountdown,
      corIcone: 'text-amber-500',
      bgIcone: 'bg-amber-500/10 border-amber-500/20',
      corBorda: 'border-amber-500/20',
    },
    {
      id: 'acionadas',
      titulo: 'Acionamentos no Mês',
      valor: metricas.acionadas,
      legenda: 'Prioridade 1 na fila da oficina',
      icone: WarningCircle,
      corIcone: 'text-rose-500',
      bgIcone: 'bg-rose-500/10 border-rose-500/20',
      corBorda: 'border-rose-500/20',
    },
    {
      id: 'taxa-retorno',
      titulo: 'Taxa de Retorno',
      valor: `${metricas.taxaRetorno}%`,
      legenda: 'Meta de qualidade: < 3.0%',
      icone: ChartLineUp,
      corIcone: 'text-sky-500',
      bgIcone: 'bg-sky-500/10 border-sky-500/20',
      corBorda: 'border-sky-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
      {cards.map((card) => {
        const Icon = card.icone
        return (
          <div
            key={card.id}
            className={`bg-white rounded-xl p-3.5 border ${card.corBorda} shadow-xs flex items-center justify-between transition-all hover:shadow-md`}
          >
            <div className="min-w-0 pr-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block truncate">
                {card.titulo}
              </span>
              <span className="text-2xl font-black text-zinc-900 tracking-tight block mt-0.5">
                {card.valor}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {card.legenda}
              </span>
            </div>
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${card.bgIcone}`}
            >
              <Icon size={22} weight="duotone" className={card.corIcone} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
