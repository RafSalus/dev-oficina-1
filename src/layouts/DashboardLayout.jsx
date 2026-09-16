import React from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { DashboardFooter } from '../components/dashboard/DashboardFooter'

export function DashboardLayout() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#f3f4f6] text-zinc-900 overflow-hidden font-sans select-none">
      {/* Header Superior Completo */}
      <DashboardHeader />

      {/* Área Central: Sidebar + Conteúdo */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Sidebar com fundo preto retrátil */}
        <DashboardSidebar />

        {/* Espaço de conteúdo centralizado */}
        <main className="flex-1 overflow-y-auto pl-2 pr-4 py-4 flex flex-col items-center justify-center min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Footer Inferior Completo */}
      <DashboardFooter />
    </div>
  )
}
