import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { House, CalendarDots, ClipboardText, Users, List } from '@phosphor-icons/react'
import { MobileMenuSheet } from './MobileMenuSheet'

const NAV_ITEMS = [
  { id: 'inicio', label: 'Início', path: '/gestao/dashboard', icon: House },
  { id: 'agenda', label: 'Agenda', path: '/gestao/agenda', icon: CalendarDots },
  { id: 'os', label: 'OS', path: '/gestao/ordem-de-servico', icon: ClipboardText },
  { id: 'clientes', label: 'Clientes', path: '/gestao/clientes', icon: Users },
]

export function MobileBottomNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
      isActive ? 'text-[#0284c7]' : 'text-[#98a2b3] active:text-[#475467]'
    }`

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e4e7ec] select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="h-16 px-2 flex items-stretch">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.id} to={item.path} className={linkClass} end>
              {({ isActive }) => (
                <>
                  <item.icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  <span className="text-[10px] font-bold">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[#98a2b3] active:text-[#475467] transition-colors"
          >
            <List size={22} weight="regular" />
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </div>
      </nav>

      <MobileMenuSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
