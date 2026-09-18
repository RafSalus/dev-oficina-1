import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ClienteProvider } from '../context/ClienteContext'
import { ClienteHeader } from '../components/cliente/ClienteHeader'
import { ClienteSidebar } from '../components/cliente/ClienteSidebar'
import { ClienteFooter } from '../components/cliente/ClienteFooter'

export function ClienteLayout() {
  // Estado do cabeçalho fixado vs auto-ocultação ao afastar o mouse
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

  return (
    <ClienteProvider>
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
    </ClienteProvider>
  )
}
