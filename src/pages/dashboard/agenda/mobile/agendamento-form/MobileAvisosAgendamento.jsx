import React from 'react'
import { WarningCircle, Trash } from '@phosphor-icons/react'

export function MobileAvisoAtraso({ agendamento, onTratarAtraso }) {
  if (!agendamento?.emAtraso || !onTratarAtraso) return null

  return (
    <button
      type="button"
      onClick={() => onTratarAtraso(agendamento)}
      className="w-full rounded-2xl border border-rose-300 bg-rose-50 p-3.5 flex items-center gap-3 text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
        <WarningCircle size={18} weight="bold" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-rose-900">
          Atendimento em atraso (+{agendamento.tempoAtrasoMinutos || 30} min)
        </p>
        <p className="text-[11px] text-rose-700">Toque para tratar o atraso</p>
      </div>
    </button>
  )
}

export function MobileAvisoConflito({ form }) {
  const conflito = form.conflitoDetectado
  if (!conflito) return null

  return (
    <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3.5">
      <div className="flex items-start gap-2 text-xs text-rose-800">
        <WarningCircle size={16} weight="bold" className="text-rose-600 shrink-0 mt-0.5" />
        <span>
          Horário já ocupado na grade deste mecânico por <strong>{conflito.clienteNome}</strong> ({conflito.horarioInicio}
          h a{' '}
          {parseInt(conflito.horarioInicio.split(':')[0], 10) + Number(conflito.duracaoHoras || 1)}h).
        </span>
      </div>
      <label className="flex items-center gap-2 mt-2.5 text-xs font-bold text-rose-900">
        <input
          type="checkbox"
          checked={form.ignorarConflito}
          onChange={(e) => form.setIgnorarConflito(e.target.checked)}
          className="w-4 h-4 rounded border-rose-300 text-[#0284c7] focus:ring-[#0284c7]"
        />
        Permitir sobreposição de horário
      </label>
    </div>
  )
}

export function MobileExclusaoAgendamento({ form }) {
  if (!form.podeExcluir) return null

  return (
    <section className="pt-1">
      {form.confirmandoExclusao ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
          <span className="flex-1 text-xs font-bold text-[#101828]">Excluir este agendamento?</span>
          <button
            type="button"
            onClick={() => form.setConfirmandoExclusao(false)}
            className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={form.excluir}
            className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold"
          >
            Confirmar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => form.setConfirmandoExclusao(true)}
          className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Trash size={15} weight="bold" />
          Excluir Agendamento
        </button>
      )}
    </section>
  )
}
