import React from 'react'
import { useLocation } from 'react-router-dom'
import {
  SquaresFour,
  CarProfile,
  Wrench,
  Toolbox,
  Certificate,
  ClockCounterClockwise,
  GasPump,
  CalendarDots,
  ClockCountdown,
} from '@phosphor-icons/react'
import { CLIENTE_MENU_CATEGORIES } from '../../constants/clienteMenus'

const ICONS_MAP = {
  SquaresFour,
  CarProfile,
  Wrench,
  Toolbox,
  Certificate,
  ClockCounterClockwise,
  GasPump,
  CalendarDots,
}

export function ClienteModulePlaceholder() {
  const location = useLocation()

  let currentItem = null
  let currentCategory = null

  for (const cat of CLIENTE_MENU_CATEGORIES) {
    const found = cat.items.find(
      (item) =>
        item.path === location.pathname ||
        (item.path === '/cliente/resumo' &&
          (location.pathname === '/cliente' || location.pathname === '/cliente/inicio'))
    )
    if (found) {
      currentItem = found
      currentCategory = cat
      break
    }
  }

  const title = currentItem?.label || 'Módulo'
  const categoryTitle = currentCategory?.title || 'Portal do Cliente'
  const description = currentItem?.description || 'Recurso em fase de estruturação e integração com a oficina.'
  const IconComponent = (currentItem && ICONS_MAP[currentItem.icon]) || SquaresFour

  return (
    <div className="flex-1 p-4 lg:p-8 flex flex-col justify-center items-center select-none overflow-hidden min-h-0">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-6 sm:p-10 text-center flex flex-col items-center">
        {/* Breadcrumb da Conta do Cliente */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#98a2b3] mb-5 uppercase tracking-wider">
          <span>Portal do Cliente</span>
          <span>•</span>
          <span>{categoryTitle}</span>
          <span>•</span>
          <span className="text-[#0284c7] font-bold">{title}</span>
        </div>

        {/* Ícone do Módulo */}
        <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mb-5 text-[#0284c7] shadow-2xs">
          <IconComponent size={32} weight="duotone" className="text-[#0284c7]" />
        </div>

        {/* Badge "Em breve" */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f4f7] text-[#344054] text-xs font-bold mb-4 border border-[#e4e7ec]/80">
          <ClockCountdown size={14} weight="bold" className="text-[#0284c7]" />
          <span>Em breve</span>
        </div>

        {/* Nome do Módulo */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight mb-3">
          {title}
        </h1>

        {/* Descrição simples e objetiva */}
        <p className="text-sm text-[#475467] max-w-md leading-relaxed mb-6">
          {description}
        </p>

        {/* Nota explicativa de status */}
        <div className="w-full bg-[#f8fafc] border border-[#d0d5dd] rounded-xl p-3.5 text-xs text-[#667085] flex flex-col sm:flex-row items-center justify-center gap-1.5">
          <span className="font-semibold text-[#101828]">Área do cliente em preparação:</span>
          <span>Sidebar retrátil, cabeçalho e rodapé operando normalmente.</span>
        </div>
      </div>
    </div>
  )
}
