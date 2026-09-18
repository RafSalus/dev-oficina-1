import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { DashboardFooter } from '../components/dashboard/DashboardFooter'
import { MobileDashboardHeader } from '../components/dashboard/mobile/MobileDashboardHeader'
import { MobileBottomNav } from '../components/dashboard/mobile/MobileBottomNav'
import { useIsMobile } from '../hooks/useIsMobile'

// Rotas mobile que assumem a tela inteira (fluxo dedicado, sem header/tab bar padrão)
const MOBILE_FULLSCREEN_ROUTES = ['/gestao/ordem-de-servico/nova']

export function DashboardLayout() {
  const isMobile = useIsMobile()
  const location = useLocation()

  // Estado do cabeçalho fixado vs auto-ocultação ao afastar o mouse
  const [isHeaderPinned, setIsHeaderPinned] = useState(() => {
    try {
      return localStorage.getItem('dev_oficina_header_pinned') === 'true'
    } catch {
      return false
    }
  })

  const toggleHeaderPin = () => {
    setIsHeaderPinned((prev) => {
      const next = !prev
      try {
        localStorage.setItem('dev_oficina_header_pinned', String(next))
      } catch {}
      return next
    })
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
        <MobileDashboardHeader />

        <main
          className="flex-1 overflow-y-auto overscroll-y-contain"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)',
          }}
        >
          <Outlet />
        </main>

        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#eaecf0] text-zinc-900 overflow-hidden font-sans select-none">
      {/* Header Superior Completo (auto-ocultável por hover ou fixado) */}
      <DashboardHeader isPinned={isHeaderPinned} onTogglePin={toggleHeaderPin} />

      {/* Área Central: Sidebar + Conteúdo */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Sidebar com fundo preto retrátil */}
        <DashboardSidebar />

        {/* Espaço de conteúdo estritamente limitado e sem scroll */}
        <main className="flex-1 overflow-hidden pl-2 pr-3 py-3 flex flex-col min-w-0 min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Footer Inferior Completo */}
      <DashboardFooter />
    </div>
  )
}
