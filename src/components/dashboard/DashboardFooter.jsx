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
      // Format time: HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setTimeStr(`${hours}:${minutes}:${seconds}`)

      // Format date: Dia da semana, DD de Mês de AAAA
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
    }, 150)
  }

  return (
    <footer className="h-12 px-6 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 flex items-center justify-between text-xs text-zinc-600 z-20 shrink-0">
      {/* Left side: System status */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-zinc-700">Mecânica Gabriel</span>
        <span className="text-zinc-300">•</span>
        <span className="text-zinc-400 font-medium hidden sm:inline">Ambiente de Produção</span>
      </div>

      {/* Right side: Interactive Date with Calendar Popover & Live Clock */}
      <div className="flex items-center gap-4">
        {/* Date container with hover-triggered calendar */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 font-semibold cursor-pointer transition-colors select-none">
            <Calendar size={15} weight="bold" className="text-zinc-500" />
            <span className="tracking-tight">{dateStr}</span>
          </div>

          <CalendarPopover isOpen={calendarOpen} />
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 text-white font-mono font-bold text-xs tracking-wider shadow-xs">
          <Clock size={14} weight="bold" className="text-zinc-400" />
          <span>{timeStr}</span>
        </div>
      </div>
    </footer>
  )
}
