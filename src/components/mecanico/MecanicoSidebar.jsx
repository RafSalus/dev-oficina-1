import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  SquaresFour,
  ClipboardText,
  MagnifyingGlassPlus,
  CheckSquareOffset,
  Wrench,
  ShoppingCart,
  Package,
  WarningOctagon,
  Hammer,
  Users,
  ArrowsLeftRight,
  CalendarDots,
  Coins,
} from '@phosphor-icons/react'
import { MECANICO_MENU_CATEGORIES } from '../../constants/mecanicoMenus'

const ICONS_MAP = {
  SquaresFour,
  ClipboardText,
  MagnifyingGlassPlus,
  CheckSquareOffset,
  Wrench,
  ShoppingCart,
  Package,
  WarningOctagon,
  Hammer,
  Users,
  ArrowsLeftRight,
  CalendarDots,
  Coins,
}

export function MecanicoSidebar() {
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
      {/* Lista scrollável de menus do mecânico */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-3 px-2 space-y-3">
        {MECANICO_MENU_CATEGORIES.map((category, catIndex) => (
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

            {/* Links do Menu do Mecânico */}
            <div className="space-y-0.5">
              {category.items.map((item) => {
                const IconComponent = ICONS_MAP[item.icon] || SquaresFour
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/mecanico/dashboard' &&
                    location.pathname.startsWith(item.path + '/')) ||
                  (item.path === '/mecanico/dashboard' &&
                    location.pathname === '/mecanico')

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={!isHovered ? `${item.label} - ${item.description}` : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-[#0284c7] text-white shadow-md font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 font-medium'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <IconComponent
                        size={20}
                        weight={isActive ? 'fill' : 'bold'}
                        className="transition-transform group-hover:scale-110 duration-200"
                      />
                    </div>

                    <span
                      className={`whitespace-nowrap transition-all duration-300 leading-tight truncate text-xs ${
                        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Tooltip flutuante quando a sidebar está recolhida */}
                    {!isHovered && (
                      <div className="absolute left-[calc(100%+12px)] bg-[#0f172a] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-zinc-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé da Sidebar: Indicador Compacto */}
      <div className="p-2 border-t border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-zinc-900/60">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0284c7] shrink-0 animate-pulse" />
          <span
            className={`text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            Mecânica Gabriel
          </span>
        </div>
      </div>
    </aside>
  )
}
