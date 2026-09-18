import React, { useState, useEffect, useRef } from 'react'
import { Clock, Calendar, ShieldCheck, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useCliente } from '../../context/ClienteContext'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const WEEKDAY_NAMES = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
]

const WEEKDAY_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export function ClienteFooter() {
  const { clienteAtivo } = useCliente()
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarTimeoutRef = useRef(null)

  // Data atual para o mini calendário
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const todayDate = now.getDate()

  // Cálculo dos dias do mês atual
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Array com slots vazios iniciais + dias do mês
  const calendarDays = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarDays.push(d)
  }

  useEffect(() => {
    const updateTime = () => {
      const current = new Date()
      const hours = String(current.getHours()).padStart(2, '0')
      const minutes = String(current.getMinutes()).padStart(2, '0')
      const seconds = String(current.getSeconds()).padStart(2, '0')
      setTimeStr(`${hours}:${minutes}:${seconds}`)

      const weekday = WEEKDAY_NAMES[current.getDay()]
      const day = current.getDate()
      const month = MONTH_NAMES[current.getMonth()]
      const year = current.getFullYear()
      setDateStr(`${weekday}, ${day} de ${month} de ${year}`)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleMouseEnter = () => {
    if (calendarTimeoutRef.current) {
      clearTimeout(calendarTimeoutRef.current)
      calendarTimeoutRef.current = null
    }
    setShowCalendar(true)
  }

  const handleMouseLeave = () => {
    calendarTimeoutRef.current = setTimeout(() => {
      setShowCalendar(false)
    }, 250)
  }

  useEffect(() => {
    return () => {
      if (calendarTimeoutRef.current) {
        clearTimeout(calendarTimeoutRef.current)
      }
    }
  }, [])

  return (
    <footer className="h-12 px-6 bg-white border-t border-[#d0d5dd] flex items-center justify-between text-xs text-[#475467] z-20 shrink-0 select-none relative">
      {/* Lado Esquerdo: Identificação do Cliente */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-bold text-[#101828]">
          {clienteAtivo?.nome || 'Cliente da Oficina'}
        </span>
      </div>

      {/* Centro: Status do Sistema e Conexão */}
      <div className="hidden md:flex items-center gap-2 text-[11px] text-[#667085]">
        <ShieldCheck size={14} weight="bold" className="text-[#0284c7]" />
        <span>Conectado à Oficina • Veículo em Atendimento</span>
      </div>

      {/* Lado Direito: Calendário (hover) e Hora ao Vivo */}
      <div className="flex items-center gap-4">
        {/* Campo Calendário com Flyout Interativo ao passar o mouse */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="hidden lg:flex items-center gap-1.5 text-[#475467] hover:text-[#0284c7] cursor-pointer py-1 px-2 rounded-lg hover:bg-[#f2f4f7] transition-colors">
            <Calendar size={15} weight="bold" className="text-[#0284c7]" />
            <span className="font-medium">{dateStr}</span>
          </div>

          {/* Mini Calendário Flutuante */}
          {showCalendar && (
            <div
              className="absolute bottom-full mb-2 right-0 w-64 bg-white border border-[#d0d5dd] rounded-2xl shadow-2xl p-3.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 select-none"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Cabeçalho do Mini Calendário */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#e4e7ec]">
                <span className="font-extrabold text-[#101828] text-xs capitalize">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  Hoje
                </span>
              </div>

              {/* Dias da Semana */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {WEEKDAY_SHORT.map((w, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-extrabold text-[#98a2b3] uppercase"
                  >
                    {w}
                  </span>
                ))}
              </div>

              {/* Grade de Dias */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="h-7 w-7" />
                  }
                  const isToday = day === todayDate
                  return (
                    <div
                      key={`day-${day}`}
                      className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        isToday
                          ? 'bg-[#0284c7] text-white font-bold shadow-xs'
                          : 'text-[#344054] hover:bg-[#f2f4f7]'
                      }`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>

              {/* Rodapé do Mini Calendário */}
              <div className="mt-3 pt-2 border-t border-[#e4e7ec] flex items-center justify-between text-[10px] text-[#667085]">
                <span>Oficina aberta até 18h</span>
                <span className="font-bold text-[#0284c7]">MG Gabriel</span>
              </div>
            </div>
          )}
        </div>

        {/* Relógio Digital ao Vivo */}
        <div className="flex items-center gap-1.5 font-mono font-bold text-[#101828] bg-[#f8fafc] border border-[#e4e7ec] px-2.5 py-1 rounded-lg shadow-2xs">
          <Clock size={15} weight="bold" className="text-[#0284c7]" />
          <span>{timeStr}</span>
        </div>
      </div>
    </footer>
  )
}
