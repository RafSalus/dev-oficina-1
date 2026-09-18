import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  const isDisplayModeStandalone =
    window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  const isIosStandalone = window.navigator?.standalone === true
  return Boolean(isDisplayModeStandalone || isIosStandalone)
}

/**
 * iOS ignores the manifest's start_url and always launches whatever URL was
 * open when "Adicionar à Tela de Início" was tapped (often the public "/" site).
 * When the installed app is opened standalone and lands on "/", send it into
 * the management dashboard instead, regardless of which page was bookmarked.
 */
export function PwaStandaloneRedirect() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/' && isStandaloneDisplay()) {
      navigate('/gestao/dashboard', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
