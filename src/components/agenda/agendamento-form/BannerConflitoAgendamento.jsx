import React from 'react'
import { WarningCircle } from '@phosphor-icons/react'

export function BannerConflitoAgendamento({ form }) {
  const conflito = form.conflitoDetectado
  if (!conflito) return null

  return (
    <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 shrink-0 flex items-center justify-between text-xs text-rose-800">
      <div className="flex items-center gap-2">
        <WarningCircle size={17} weight="bold" className="text-rose-600 shrink-0" />
        <span>
          <strong>Atenção:</strong> Horário já ocupado na grade deste mecânico por{' '}
          <strong>{conflito.clienteNome}</strong> ({conflito.horarioInicio} às{' '}
          {parseInt(conflito.horarioInicio.split(':')[0], 10) + Number(conflito.duracaoHoras || 1)}h).
        </span>
      </div>
      <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700 ml-2 shrink-0">
        <input
          type="checkbox"
          checked={form.ignorarConflito}
          onChange={(e) => form.setIgnorarConflito(e.target.checked)}
          className="rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7]"
        />
        <span>Permitir sobreposição</span>
      </label>
    </div>
  )
}
