import React from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { DashboardFooter } from '../components/dashboard/DashboardFooter'

export function DashboardLayout() {
  return (
    <div className="min-h-dvh h-dvh flex flex-col bg-[#f3f4f6] text-zinc-900 overflow-hidden font-sans antialiased">
      {/* Top Header */}
      <DashboardHeader />

      {/* Main Workspace (Sidebar + Content + Footer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Expandable Sidebar */}
        <DashboardSidebar />

        {/* Center Area + Footer Container */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Central Area: Em breve placeholder */}
          <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
            <Outlet />
          </main>

          {/* Bottom Footer with live clock, live date & calendar popover */}
          <DashboardFooter />
        </div>
      </div>
    </div>
  )
}
