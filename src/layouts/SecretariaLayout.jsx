import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
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
} from '@phosphor-icons/react'
import { SecretariaHeader } from '../components/secretaria/SecretariaHeader'
import { SecretariaSidebar } from '../components/secretaria/SecretariaSidebar'
import { SecretariaFooter } from '../components/secretaria/SecretariaFooter'
import { MobilePortalHeader } from '../components/mobile/MobilePortalHeader'
import { MobilePortalBottomNav } from '../components/mobile/MobilePortalBottomNav'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAdminAuth } from '../context/AdminAuthContext'
import { SECRETARIA_MENU_CATEGORIES } from '../constants/secretariaMenus'

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
}

const MOBILE_NAV_ITEMS = [
  { id: 'inicio', label: 'Início', path: '/secretaria/dashboard', icon: SquaresFour },
  { id: 'agenda', label: 'Agenda', path: '/secretaria/agenda', icon: CalendarDots },
  { id: 'os', label: 'OS', path: '/secretaria/ordem-de-servico', icon: ClipboardText },
  { id: 'clientes', label: 'Clientes', path: '/secretaria/clientes', icon: Users },
]

const MOBILE_FULLSCREEN_ROUTES = ['/secretaria/ordem-de-servico/nova']

export function SecretariaLayout() {
  const isMobile = useIsMobile()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAdminAuth()

  const [isHeaderPinned, setIsHeaderPinned] = useState(() => {
    try {
      return localStorage.getItem('dev_oficina_secretaria_header_pinned') === 'true'
    } catch {
      return false
    }
  })

  const toggleHeaderPin = () => {
    setIsHeaderPinned((prev) => {
      const next = !prev
      try {
        localStorage.setItem('dev_oficina_secretaria_header_pinned', String(next))
      } catch {}
      return next
    })
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/gestao/entrar')
  }

  if (isMobile && MOBILE_FULLSCREEN_ROUTES.includes(location.pathname)) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#eaecf0] text-zinc-900 font-sans">
        <Outlet />
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-[#eaecf0] text-zinc-900 font-sans">
        <MobilePortalHeader
          brandTitle="Mecânica Gabriel"
          brandSubtitle="Recepção"
          profileName={user?.user_metadata?.name || 'Recepção'}
          profileSubtitle={user?.email || 'secretaria@mecanicagabriel.com.br'}
          settingsPath="/secretaria/configuracoes"
          onSignOut={handleSignOut}
        />

        <main
          className="flex-1 overflow-y-auto overscroll-y-contain"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)',
          }}
        >
          <Outlet />
        </main>

        <MobilePortalBottomNav
          navItems={MOBILE_NAV_ITEMS}
          menuTitle="Todos os Módulos"
          menuSubtitle="Navegue pela recepção e atendimento"
          menuCategories={SECRETARIA_MENU_CATEGORIES}
          iconsMap={ICONS_MAP}
          onSignOut={handleSignOut}
        />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#eaecf0] text-zinc-900 overflow-hidden font-sans select-none">
      {/* Header Superior da Secretaria (auto-ocultável por hover ou fixado) */}
      <SecretariaHeader isPinned={isHeaderPinned} onTogglePin={toggleHeaderPin} />

      {/* Área Central: Sidebar da Secretaria + Conteúdo */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative items-center">
        {/* Sidebar com fundo preto retrátil com menus da secretaria */}
        <SecretariaSidebar />

        {/* Espaço de conteúdo estritamente limitado e sem scroll de página */}
        <main className="flex-1 self-stretch overflow-hidden pl-2 pr-3 py-3 flex flex-col min-w-0 min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Footer Inferior da Secretaria */}
      <SecretariaFooter />
    </div>
  )
}
