import React from 'react'
import { Clock } from '@phosphor-icons/react'
import { HORARIOS_GRADE } from '../../../constants/agendaData'

export const estiloLinhasGrade = {
  display: 'grid',
  gridTemplateRows: 'repeat(10, 115px)',
  gap: '6px',
}

/** Cabeçalho das colunas: dias da semana com total de ocupações no dia. */
export function CabecalhoDiasGrade({ semanaDias, totalNoDia }) {
  return (
    <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-100 border-b border-slate-200 shrink-0 text-slate-700">
      <div className="p-3 text-center border-r border-slate-200 flex flex-col justify-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Horário</span>
        <span className="text-[10px] text-slate-400">08h - 18h</span>
      </div>

      {semanaDias.map((dia) => (
        <div
          key={dia.chave}
          className={`p-2.5 text-center border-r border-slate-200 last:border-r-0 transition-colors ${
            dia.isHoje ? 'bg-sky-50/80' : ''
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">{dia.nome}</span>
            {dia.isHoje && (
              <span className="bg-[#0284c7] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                Hoje
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mt-0.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{dia.dataBr}</span>
            <span>•</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
              {totalNoDia(dia.chave)} no dia
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Coluna esquerda com os horários fixos da grade. */
export function ColunaHorariosGrade() {
  return (
    <div className="border-r border-slate-200 bg-slate-50/50 p-1" style={estiloLinhasGrade}>
      {HORARIOS_GRADE.map((horario) => {
        const isAlmoco = horario === '12:00'
        return (
          <div
            key={horario}
            className={`p-2 rounded-lg border border-transparent flex flex-col items-center justify-start pt-2 shrink-0 ${
              isAlmoco ? 'bg-slate-100/70 border-slate-200' : ''
            }`}
          >
            <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1">
              <Clock size={13} className="text-[#0284c7]" />
              {horario}
            </span>
            {isAlmoco && (
              <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase text-center leading-tight">
                Almoço
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
