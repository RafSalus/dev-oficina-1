import React from 'react'
import { useLocation } from 'react-router-dom'
import { ModulePlaceholder } from '../../components/dashboard/ModulePlaceholder'
import { MobileComingSoon } from '../../components/dashboard/mobile/MobileComingSoon'
import { MobileHomeScreen } from './mobile/MobileHomeScreen'
import { useIsMobile } from '../../hooks/useIsMobile'

export function DashboardPage() {
  const isMobile = useIsMobile()
  const location = useLocation()

  if (isMobile) {
    const isHome = location.pathname === '/gestao/dashboard' || location.pathname === '/gestao'
    return isHome ? <MobileHomeScreen /> : <MobileComingSoon />
  }

  return <ModulePlaceholder />
}
