import React, { useState, useEffect, useRef } from 'react'
import { Clock, Calendar } from '@phosphor-icons/react'
import { CalendarPopover } from './CalendarPopover'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const WEEKDAY_NAMES = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
]

export function DashboardFooter() {
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const hoverTimeoutRef = useRef(null)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setTimeStr(`${hours}:${minutes}:${seconds}`)

      const weekday = WEEKDAY_NAMES[now.getDay()]
      const day = now.getDate()
      const month = MONTH_NAMES[now.getMonth()]
      const year = now.getFullYear()
      setDateStr(`${weekday}, ${day} de ${month} de ${year}`)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setCalendarOpen(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setCalendarOpen(false)
    }, 200)
  }

  return (
    <footer className="h-12 px-6 bg-white border-t border-[#d0d5dd] flex items-center justify-between text-xs text-[#475467] z-20 shrink-0 select-none">
      {/* Lado Esquerdo: Status do Terminal */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#12b76a]" />
        <span className="font-semibold text-[#101828]">Mecânica Gabriel</span>
        <span className="text-[#d0d5dd]">•</span>
        <span className="text-[#667085] font-medium hidden sm:inline">Terminal Operacional</span>
      </div>

      {/* Lado Direito: Hora e Data com Calendário */}
      <div className="flex items-center gap-3">
        {/* Campo Data com Calendário no Hover */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#f2f4f7] hover:bg-[#e4e7ec] text-[#101828] font-semibold cursor-pointer transition-colors select-none border border-[#e4e7ec]/60">
            <Calendar size={15} weight="bold" className="text-[#475467]" />
            <span className="tracking-tight text-xs">{dateStr}</span>
          </div>

          <CalendarPopover
            isOpen={calendarOpen}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        {/* Campo Hora em tempo real */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#101828] text-white font-mono font-bold text-xs tracking-wider shadow-xs">
          <Clock size={14} weight="bold" className="text-[#98a2b3]" />
          <span>{timeStr}</span>
        </div>
      </div>
    </footer>
  )
}
