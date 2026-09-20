import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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

export function DashboardSidebar() {
  const [isHovered, setIsHovered] = useState(false)
  const location = useLocation()

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`my-3 ml-3 flex flex-col bg-black text-zinc-400 rounded-2xl shadow-2xl border border-zinc-800/80 transition-all duration-300 ease-in-out z-30 overflow-hidden shrink-0 select-none ${
        isHovered ? 'w-[264px]' : 'w-[72px]'
      }`}
      style={{ height: 'calc(100% - 1.5rem)' }}
    >
      {/* Lista scrollável de menus */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-3 px-2 space-y-3">
        {MENU_CATEGORIES.map((category, catIndex) => (
          <div key={category.id} className="space-y-1">
            {/* Linha separadora de categoria que expande e retrai */}
            {catIndex > 0 && (
              <div className="pt-2 pb-1.5 px-2">
                <div
                  className={`border-t border-zinc-800 transition-all duration-300 ${
                    isHovered ? 'w-full' : 'w-6 mx-auto'
                  }`}
                />
              </div>
            )}

            {/* Título da categoria que aparece na expansão */}
            <div
              className={`overflow-hidden transition-all duration-300 px-3 ${
                isHovered ? 'max-h-6 opacity-100 mb-1' : 'max-h-0 opacity-0 mb-0'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">
                {category.title}
              </span>
            </div>

            {/* Links do Menu */}
            <div className="space-y-0.5">
              {category.items.map((item) => {
                const IconComponent = ICONS_MAP[item.icon] || SquaresFour
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/gestao/dashboard' &&
                    item.path !== '/' &&
                    location.pathname.startsWith(item.path + '/')) ||
                  (item.path === '/gestao/dashboard' &&
                    (location.pathname === '/gestao' || location.pathname === '/gestao/resumo'))

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={!isHovered ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-white text-[#101828] font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900 font-medium'
                    }`}
                  >
                    {/* Ícone */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <IconComponent
                        size={20}
                        weight={isActive ? 'fill' : 'regular'}
                        className={`transition-transform duration-200 ${
                          isActive ? 'text-[#0284c7]' : 'text-zinc-400 group-hover:scale-110 group-hover:text-white'
                        }`}
                      />
                    </div>

                    {/* Texto que expande no hover */}
                    <span
                      className={`whitespace-nowrap transition-all duration-300 leading-tight truncate ${
                        isHovered
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-3 pointer-events-none w-0 overflow-hidden'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Ponto indicador sutil quando retraído */}
                    {isActive && !isHovered && (
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de status na base da sidebar */}
      <div className="p-2.5 border-t border-zinc-900 bg-zinc-950/80 shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-1 text-[11px] text-zinc-500">
          <div className="w-2 h-2 rounded-full bg-[#0284c7] shrink-0" />
          <span
            className={`whitespace-nowrap transition-all duration-300 font-medium ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none w-0 overflow-hidden'
            }`}
          >
            Módulos Operacionais
          </span>
        </div>
      </div>
    </aside>
  )
}
