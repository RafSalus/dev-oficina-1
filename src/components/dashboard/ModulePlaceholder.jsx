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
  Sparkle,
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
}

export function ModulePlaceholder() {
  const location = useLocation()

  // Find the menu item matching the current path
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
  const description = currentItem?.description || 'Recursos avançados para gestão da oficina.'
  const IconComponent = (currentItem && ICONS_MAP[currentItem.icon]) || SquaresFour

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-8 sm:p-12 text-center flex flex-col items-center">
        {/* Subtle breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-6 uppercase tracking-wider">
          <span>Gestão</span>
          <span>/</span>
          <span>{categoryTitle}</span>
          <span>/</span>
          <span className="text-zinc-700 font-bold">{title}</span>
        </div>

        {/* Minimalist Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center mb-6 text-zinc-900 shadow-xs">
          <IconComponent size={32} weight="duotone" className="text-zinc-800" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          Em breve
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-3">
          {title}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-zinc-500 max-w-md leading-relaxed mb-8">
          {description}
        </p>

        {/* Action card note */}
        <div className="w-full bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4 text-xs text-zinc-600 flex items-center justify-center gap-2">
          <span className="font-semibold text-zinc-900">Módulo em desenvolvimento:</span>
          <span>Estrutura de sidebar, header e footer totalmente operacionais.</span>
        </div>
      </div>
    </div>
  )
}
