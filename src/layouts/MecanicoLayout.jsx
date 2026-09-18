import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MecanicoProvider } from '../context/MecanicoContext'
import { MecanicoHeader } from '../components/mecanico/MecanicoHeader'
import { MecanicoSidebar } from '../components/mecanico/MecanicoSidebar'
import { MecanicoFooter } from '../components/mecanico/MecanicoFooter'

export function MecanicoLayout() {
  // Estado do cabeçalho fixado vs auto-ocultação ao afastar o mouse
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

  return (
    <MecanicoProvider>
      <div className="h-screen w-screen flex flex-col bg-[#eaecf0] text-zinc-900 overflow-hidden font-sans select-none">
        {/* Header Superior Dedicado ao Mecânico (auto-ocultável por hover ou fixado) */}
        <MecanicoHeader isPinned={isHeaderPinned} onTogglePin={toggleHeaderPin} />

        {/* Área Central: Sidebar do Mecânico + Conteúdo do Terminal */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Sidebar com fundo preto retrátil com menus exclusivos do mecânico */}
          <MecanicoSidebar />

          {/* Espaço de trabalho técnico estritamente limitado, sem scroll de página */}
          <main className="flex-1 overflow-hidden pl-2 pr-3 py-3 flex flex-col min-w-0 min-h-0">
            <Outlet />
          </main>
        </div>

        {/* Rodapé Operacional com Status da Bancada */}
        <MecanicoFooter />
      </div>
    </MecanicoProvider>
  )
}
