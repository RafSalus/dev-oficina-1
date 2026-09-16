import React, { useState } from 'react'
import { CaretLeft, CaretRight, Calendar } from '@phosphor-icons/react'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function CalendarPopover({ isOpen, onMouseEnter, onMouseLeave }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(year, month + 1, 1))
  }

  const jumpToToday = (e) => {
    e.stopPropagation()
    setViewDate(new Date())
  }

  const isCurrentDay = (day) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  if (!isOpen) return null

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="dialog"
      aria-label="Calendário Interativo"
      className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-2xl shadow-xl border border-[#e4e7ec] p-4 z-50 text-[#101828] select-none"
    >
      {/* Header com mês e setas */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f2f4f7]">
        <div className="flex items-center gap-2">
          <Calendar size={18} weight="bold" className="text-[#101828]" />
          <span className="text-sm font-bold text-[#101828]">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mês anterior"
            className="p-1.5 rounded-lg hover:bg-[#f2f4f7] text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="p-1.5 rounded-lg hover:bg-[#f2f4f7] text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {WEEKDAYS.map((wd, index) => (
          <span key={index} className="text-[11px] font-bold text-[#98a2b3]">
            {wd}
          </span>
        ))}
      </div>

      {/* Grade dos dias do mês */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 w-7" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const active = isCurrentDay(day)
          return (
            <div
              key={`day-${day}`}
              className={`h-7 w-7 mx-auto flex items-center justify-center text-xs font-medium rounded-full transition-all ${
                active
                  ? 'bg-[#101828] text-white font-bold shadow-xs'
                  : 'hover:bg-[#f2f4f7] text-[#344054] cursor-default'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Rodapé com atalho para hoje */}
      <div className="mt-3 pt-2.5 border-t border-[#f2f4f7] flex items-center justify-between text-[11px]">
        <span className="text-[#667085]">
          Hoje: {today.getDate()} de {MONTH_NAMES[today.getMonth()]}
        </span>
        <button
          type="button"
          onClick={jumpToToday}
          className="font-bold text-[#101828] hover:underline transition-colors cursor-pointer"
        >
          Ir para hoje
        </button>
      </div>
    </div>
  )
}
