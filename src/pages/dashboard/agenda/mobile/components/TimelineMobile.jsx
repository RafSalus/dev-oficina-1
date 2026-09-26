import React from 'react'
import { Plus, PaperPlaneTilt, CheckCircle, ForkKnife } from '@phosphor-icons/react'

export function TimelineRow({ horario, isLast, corDot, children }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center w-11 shrink-0 pt-1">
        <span className="text-[10.5px] font-extrabold text-[#344054] tabular-nums">{horario}</span>
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${corDot}`} />
        {!isLast && <span className="w-px flex-1 bg-[#e4e7ec] mt-1" />}
      </div>
      <div className="flex-1 min-w-0 pb-3">{children}</div>
    </div>
  )
}

export function SlotLivre({ horario, isAlmoco, primeiroFila, confirmando, onIniciarEnvio, onConfirmarEnvio, onCancelarEnvio, onAgendar }) {
  if (isAlmoco) {
    return (
      <div className="rounded-xl border border-dashed border-[#e4e7ec] bg-[#f8fafc] px-3.5 py-2.5 flex items-center gap-2">
        <ForkKnife size={14} className="text-[#98a2b3]" />
        <span className="text-xs font-semibold text-[#98a2b3]">Horário de almoço</span>
      </div>
    )
  }

  if (confirmando && primeiroFila) {
    return (
      <div className="rounded-xl border border-[#0284c7] bg-sky-50 p-3">
        <p className="text-[11px] text-sky-900 font-semibold leading-relaxed">
          Enviar horário de {horario} para <strong>{primeiroFila.clienteNome}</strong> (1º da fila)?
        </p>
        <div className="flex items-center gap-2 mt-2.5">
          <button
            type="button"
            onClick={onCancelarEnvio}
            className="flex-1 h-9 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmarEnvio}
            className="flex-1 h-9 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-1"
          >
            <CheckCircle size={14} weight="bold" />
            Confirmar
          </button>
        </div>
      </div>
    )
  }

  if (primeiroFila) {
    return (
      <button
        type="button"
        onClick={onIniciarEnvio}
        className="w-full rounded-xl border border-dashed border-[#bae6fd] bg-sky-50/60 active:bg-sky-50 px-3.5 py-2.5 flex items-center gap-2.5 text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-white border border-sky-200 text-[#0284c7] flex items-center justify-center shrink-0">
          <PaperPlaneTilt size={13} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#0284c7]">Horário livre • Enviar ao 1º da fila</p>
          <p className="text-[10.5px] text-[#0369a1] truncate">
            {primeiroFila.prioridade === 'GARANTIA' && '★ '}
            {primeiroFila.clienteNome}
          </p>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onAgendar}
      className="w-full rounded-xl border border-dashed border-[#d0d5dd] active:bg-[#f8fafc] px-3.5 py-2.5 flex items-center gap-2.5 text-left"
    >
      <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] text-[#98a2b3] flex items-center justify-center shrink-0">
        <Plus size={14} weight="bold" />
      </div>
      <span className="text-xs font-bold text-[#667085]">Horário livre • Toque para agendar</span>
    </button>
  )
}
