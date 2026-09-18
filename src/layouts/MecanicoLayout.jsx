import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  SquaresFour,
  CalendarDots,
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
  Coins,
} from '@phosphor-icons/react'
import { MecanicoProvider, useMecanico } from '../context/MecanicoContext'
import { MecanicoHeader } from '../components/mecanico/MecanicoHeader'
import { MecanicoSidebar } from '../components/mecanico/MecanicoSidebar'
import { MecanicoFooter } from '../components/mecanico/MecanicoFooter'
import { MobilePortalHeader } from '../components/mobile/MobilePortalHeader'
import { MobilePortalBottomNav } from '../components/mobile/MobilePortalBottomNav'
import { useIsMobile } from '../hooks/useIsMobile'
import { MECANICO_MENU_CATEGORIES } from '../constants/mecanicoMenus'

const ICONS_MAP = {
  SquaresFour,
  CalendarDots,
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
  Coins,
}

const MOBILE_NAV_ITEMS = [
  { id: 'inicio', label: 'Início', path: '/mecanico/dashboard', icon: SquaresFour },
  { id: 'agenda', label: 'Agenda', path: '/mecanico/agenda', icon: CalendarDots },
  { id: 'os', label: 'OS', path: '/mecanico/ordens-servico', icon: ClipboardText },
  { id: 'diagnostico', label: 'Diagnóstico', path: '/mecanico/diagnostico', icon: MagnifyingGlassPlus },
]

export function MecanicoLayout() {
  return (
    <MecanicoProvider>
      <MecanicoLayoutInner />
    </MecanicoProvider>
  )
}

function MecanicoLayoutInner() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { mecanicoAtivo } = useMecanico()

  const [isHeaderPinned, setIsHeaderPinned] = useState(() => {
    try {
      return localStorage.getItem('dev_oficina_mecanico_header_pinned') === 'true'
    } catch {
      return false
    }
  })

  const toggleHeaderPin = () => {
    setIsHeaderPinned((prev) => {
      const next = !prev
      try {
        localStorage.setItem('dev_oficina_mecanico_header_pinned', String(next))
      } catch {}
      return next
    })
  }

  const handleSignOut = () => {
    navigate('/gestao/entrar')
  }

  if (isMobile) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-[#eaecf0] text-zinc-900 font-sans">
        <MobilePortalHeader
          brandTitle="Mecânica Gabriel"
          brandSubtitle="Bancada do Mecânico"
          profileName={mecanicoAtivo.nome}
          profileSubtitle={mecanicoAtivo.cargo || 'Mecânico da Oficina'}
          onSignOut={handleSignOut}
          notificationText="Ordens de serviço atualizadas"
          notificationSubtext="Suas OS do dia estão sincronizadas."
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
          menuSubtitle="Bancada, peças e ferramentas"
          menuCategories={MECANICO_MENU_CATEGORIES}
          iconsMap={ICONS_MAP}
          onSignOut={handleSignOut}
        />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#eaecf0] text-zinc-900 overflow-hidden font-sans select-none">
      {/* Header Superior Dedicado ao Mecânico (auto-ocultável por hover ou fixado) */}
      <MecanicoHeader isPinned={isHeaderPinned} onTogglePin={toggleHeaderPin} />

      {/* Área Central: Sidebar do Mecânico + Conteúdo do Terminal */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative items-center">
        {/* Sidebar com fundo preto retrátil com menus exclusivos do mecânico */}
        <MecanicoSidebar />

        {/* Espaço de trabalho técnico estritamente limitado, sem scroll de página */}
        <main className="flex-1 self-stretch overflow-hidden pl-2 pr-3 py-3 flex flex-col min-w-0 min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Rodapé Operacional com Status da Bancada */}
      <MecanicoFooter />
    </div>
  )
}
