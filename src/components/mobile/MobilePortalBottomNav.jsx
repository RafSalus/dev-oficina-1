import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { List } from '@phosphor-icons/react'
import { MobilePortalMenuSheet } from './MobilePortalMenuSheet'

export function MobilePortalBottomNav({ navItems, menuTitle, menuSubtitle, menuCategories, iconsMap, onSignOut }) {
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
          {navItems.map((item) => (
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

      <MobilePortalMenuSheet
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={menuTitle}
        subtitle={menuSubtitle}
        menuCategories={menuCategories}
        iconsMap={iconsMap}
        onSignOut={onSignOut}
      />
    </>
  )
}
