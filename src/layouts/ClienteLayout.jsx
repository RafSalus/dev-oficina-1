import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  SquaresFour,
  CarProfile,
  Wrench,
  Toolbox,
  Certificate,
  ClockCounterClockwise,
  GasPump,
  CalendarDots,
} from '@phosphor-icons/react'
import { ClienteProvider, useCliente } from '../context/ClienteContext'
import { ClienteHeader } from '../components/cliente/ClienteHeader'
import { ClienteSidebar } from '../components/cliente/ClienteSidebar'
import { ClienteFooter } from '../components/cliente/ClienteFooter'
import { MobilePortalHeader } from '../components/mobile/MobilePortalHeader'
import { MobilePortalBottomNav } from '../components/mobile/MobilePortalBottomNav'
import { useIsMobile } from '../hooks/useIsMobile'
import { CLIENTE_MENU_CATEGORIES } from '../constants/clienteMenus'

const ICONS_MAP = {
  SquaresFour,
  CarProfile,
  Wrench,
  Toolbox,
  Certificate,
  ClockCounterClockwise,
  GasPump,
  CalendarDots,
}

const MOBILE_NAV_ITEMS = [
  { id: 'resumo', label: 'Início', path: '/cliente/resumo', icon: SquaresFour },
  { id: 'veiculos', label: 'Veículos', path: '/cliente/veiculos', icon: CarProfile },
  { id: 'servicos', label: 'Serviços', path: '/cliente/servicos', icon: Wrench },
  { id: 'agenda', label: 'Agenda', path: '/cliente/agenda', icon: CalendarDots },
]

export function ClienteLayout() {
  return (
    <ClienteProvider>
      <ClienteLayoutInner />
    </ClienteProvider>
  )
}

function ClienteLayoutInner() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { clienteAtivo, logoutCliente } = useCliente()

  const [isHeaderPinned, setIsHeaderPinned] = useState(() => {
    try {
      return localStorage.getItem('dev_oficina_cliente_header_pinned') === 'true'
    } catch {
      return false
    }
  })

  const toggleHeaderPin = () => {
    setIsHeaderPinned((prev) => {
      const next = !prev
      try {
        localStorage.setItem('dev_oficina_cliente_header_pinned', String(next))
      } catch {}
      return next
    })
  }

  const handleSignOut = () => {
    logoutCliente()
    navigate('/cliente/entrar')
  }

  if (isMobile) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-[#eaecf0] text-zinc-900 font-sans">
        <MobilePortalHeader
          brandTitle="Mecânica Gabriel"
          brandSubtitle="Portal do Cliente"
          profileName={clienteAtivo?.nome}
          profileSubtitle={clienteAtivo?.email}
          onSignOut={handleSignOut}
          notificationText="Seu veículo está sendo atendido"
          notificationSubtext="Acompanhe o status em tempo real por aqui."
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
          menuTitle="Meu Veículo e Atendimento"
          menuSubtitle="Navegue pelo portal do cliente"
          menuCategories={CLIENTE_MENU_CATEGORIES}
          iconsMap={ICONS_MAP}
          onSignOut={handleSignOut}
        />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#eaecf0] text-zinc-900 overflow-hidden font-sans select-none">
      {/* Header Superior Dedicado ao Cliente (auto-ocultável por hover ou fixado) */}
      <ClienteHeader isPinned={isHeaderPinned} onTogglePin={toggleHeaderPin} />

      {/* Área Central: Sidebar do Cliente + Conteúdo */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative items-center">
        {/* Sidebar com fundo preto retrátil com menus exclusivos do cliente */}
        <ClienteSidebar />

        {/* Espaço de trabalho estritamente limitado, sem scroll de página */}
        <main className="flex-1 self-stretch overflow-hidden pl-2 pr-3 py-3 flex flex-col min-w-0 min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Rodapé Operacional com Status de Conexão */}
      <ClienteFooter />
    </div>
  )
}
