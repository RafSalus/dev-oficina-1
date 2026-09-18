import React from 'react'
import { useLocation } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { MobileSecretariaHomeScreen } from './mobile/MobileSecretariaHomeScreen'
import { MobileSecretariaComingSoon } from './mobile/MobileSecretariaComingSoon'
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
  GearSix,
  Globe,
  ClockCountdown,
  Buildings,
} from '@phosphor-icons/react'
import { SECRETARIA_MENU_CATEGORIES } from '../../constants/secretariaMenus'

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
  GearSix,
  Globe,
  Buildings,
}

export function SecretariaModulePlaceholder() {
  const location = useLocation()
  const isMobile = useIsMobile()

  if (isMobile) {
    const isHome = location.pathname === '/secretaria/dashboard' || location.pathname === '/secretaria'
    return isHome ? <MobileSecretariaHomeScreen /> : <MobileSecretariaComingSoon />
  }

  let currentItem = null
  let currentCategory = null

  for (const cat of SECRETARIA_MENU_CATEGORIES) {
    const found = cat.items.find(
      (item) =>
        item.path === location.pathname ||
        (item.path === '/secretaria/dashboard' &&
          (location.pathname === '/secretaria' || location.pathname === '/secretaria/resumo'))
    )
    if (found) {
      currentItem = found
      currentCategory = cat
      break
    }
  }

  const title = currentItem?.label || 'Módulo'
  const categoryTitle = currentCategory?.title || 'Operações'
  const description =
    currentItem?.description || 'Recurso em fase de estruturação e parametrização para a secretaria.'
  const IconComponent = (currentItem && ICONS_MAP[currentItem.icon]) || SquaresFour

  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center items-center select-none overflow-hidden min-h-0">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-8 sm:p-12 text-center flex flex-col items-center">
        {/* Breadcrumb discreto */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#98a2b3] mb-6 uppercase tracking-wider">
          <span>Secretaria</span>
          <span>•</span>
          <span>{categoryTitle}</span>
          <span>•</span>
          <span className="text-[#0284c7] font-bold">{title}</span>
        </div>

        {/* Ícone do Módulo */}
        <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mb-5 text-[#0284c7]">
          <IconComponent size={28} weight="duotone" className="text-[#0284c7]" />
        </div>

        {/* Badge "Em breve" */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f4f7] text-[#344054] text-xs font-bold mb-4 border border-[#e4e7ec]/60">
          <ClockCountdown size={14} weight="bold" className="text-[#0284c7]" />
          <span>Em breve</span>
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
          <span className="font-semibold text-[#101828]">Área de atendimento em preparação:</span>
          <span>Header, sidebar retrátil e rodapé operando normalmente.</span>
        </div>
      </div>
    </div>
  )
}
