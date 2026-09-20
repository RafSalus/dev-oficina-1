import React from 'react'
import { useLocation } from 'react-router-dom'
import {
  SquaresFour,
  CalendarDots,
  ClipboardText,
  CreditCard,
  Users,
  CarProfile,
  Garage,
  ArrowsLeftRight,
  ShieldCheck,
  SealCheck,
  Wrench,
  WarningOctagon,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  ChartLineUp,
  IdentificationBadge,
  GearSix,
  Globe,
  Buildings,
  Money,
  Hammer,
  Cube,
} from '@phosphor-icons/react'
import { MENU_CATEGORIES } from '../../constants/dashboardMenus'

const ICONS_MAP = {
  SquaresFour,
  CalendarDots,
  ClipboardText,
  CreditCard,
  Users,
  CarProfile,
  Garage,
  ArrowsLeftRight,
  ShieldCheck,
  SealCheck,
  Wrench,
  WarningOctagon,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  ChartLineUp,
  IdentificationBadge,
  GearSix,
  Globe,
  Buildings,
  Money,
  Hammer,
  Cube,
}

export function ModulePlaceholder() {
  const location = useLocation()

  let currentItem = null
  let currentCategory = null

  for (const cat of MENU_CATEGORIES) {
    const found = cat.items.find(
      (item) =>
        item.path === location.pathname ||
        (item.path === '/gestao/dashboard' &&
          (location.pathname === '/gestao' || location.pathname === '/gestao/resumo'))
    )
    if (found) {
      currentItem = found
      currentCategory = cat
      break
    }
  }

  const title = currentItem?.label || 'Módulo'
  const categoryTitle = currentCategory?.title || 'Operações'
  const description = currentItem?.description || 'Recurso em fase de estruturação e parametrização.'
  const IconComponent = (currentItem && ICONS_MAP[currentItem.icon]) || SquaresFour

  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center items-center select-none">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-8 sm:p-12 text-center flex flex-col items-center">
        {/* Breadcrumb discreto */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#98a2b3] mb-6 uppercase tracking-wider">
          <span>Gestão</span>
          <span>•</span>
          <span>{categoryTitle}</span>
          <span>•</span>
          <span className="text-[#101828] font-bold">{title}</span>
        </div>

        {/* Ícone do Módulo */}
        <div className="w-14 h-14 rounded-2xl bg-[#f2f4f7] border border-[#d0d5dd] flex items-center justify-center mb-5 text-[#101828]">
          <IconComponent size={28} weight="duotone" className="text-[#101828]" />
        </div>

        {/* Badge "Em breve" */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f4f7] text-[#344054] text-xs font-bold mb-4 border border-[#e4e7ec]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#101828]" />
          Em breve
        </div>

        {/* Nome do Módulo */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight mb-3">
          {title}
        </h1>

        {/* Descrição simples e objetiva */}
        <p className="text-sm text-[#475467] max-w-md leading-relaxed mb-8">
          {description}
        </p>

        {/* Nota explicativa sóbria */}
        <div className="w-full bg-[#f8fafc] border border-[#d0d5dd] rounded-xl p-3.5 text-xs text-[#667085] flex items-center justify-center gap-2">
          <span className="font-semibold text-[#101828]">Área central em preparação:</span>
          <span>Header, sidebar retrátil e footer operando normalmente.</span>
        </div>
      </div>
    </div>
  )
}
