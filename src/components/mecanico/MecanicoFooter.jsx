import React, { useState, useEffect } from 'react'
import { Clock, Calendar, Wrench, ShieldCheck } from '@phosphor-icons/react'
import { useMecanico } from '../../context/MecanicoContext'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const WEEKDAY_NAMES = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
]

export function MecanicoFooter() {
  const { mecanicoAtivo } = useMecanico()
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')

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

  return (
    <footer className="h-12 px-6 bg-white border-t border-[#d0d5dd] flex items-center justify-between text-xs text-[#475467] z-20 shrink-0 select-none">
      {/* Lado Esquerdo: Identificação do Mecânico */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-bold text-[#101828]">
          {mecanicoAtivo.nome}
        </span>
      </div>

      {/* Centro: Status do Sistema e Sincronização */}
      <div className="hidden md:flex items-center gap-2 text-[11px] text-[#667085]">
        <ShieldCheck size={14} weight="bold" className="text-[#0284c7]" />
        <span>Sincronizado com o Pátio e Almoxarifado</span>
      </div>

      {/* Lado Direito: Data e Hora ao Vivo */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-1.5 text-[#475467]">
          <Calendar size={15} weight="bold" />
          <span className="font-medium">{dateStr}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono font-bold text-[#101828] bg-[#f8fafc] border border-[#e4e7ec] px-2.5 py-1 rounded-lg shadow-2xs">
          <Clock size={15} weight="bold" className="text-[#0284c7]" />
          <span>{timeStr}</span>
        </div>
      </div>
    </footer>
  )
}
