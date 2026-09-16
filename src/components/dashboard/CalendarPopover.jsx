import React, { useState } from 'react'
import { CaretLeft, CaretRight, Calendar } from '@phosphor-icons/react'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function CalendarPopover({ isOpen }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const jumpToToday = () => {
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
      role="dialog"
      aria-label="Calendário"
      className="absolute bottom-full left-0 mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-zinc-200/80 p-4 z-50 text-zinc-800 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Calendar size={18} weight="bold" className="text-zinc-900" />
          <span className="text-sm font-bold text-zinc-900">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mês anterior"
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Weekdays header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAYS.map((wd) => (
          <span key={wd} className="text-[11px] font-semibold text-zinc-400">
            {wd}
          </span>
        ))}
      </div>

      {/* Days grid */}
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
                  ? 'bg-zinc-900 text-white font-bold shadow-xs'
                  : 'hover:bg-zinc-100 text-zinc-700 cursor-default'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Footer jump to today */}
      <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
        <span className="text-zinc-400">Hoje é dia {today.getDate()} de {MONTH_NAMES[today.getMonth()]}</span>
        <button
          type="button"
          onClick={jumpToToday}
          className="font-bold text-zinc-900 hover:text-black underline underline-offset-2 transition-colors cursor-pointer"
        >
          Ir para hoje
        </button>
      </div>
    </div>
  )
}
