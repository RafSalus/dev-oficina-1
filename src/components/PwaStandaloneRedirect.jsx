import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LAST_PORTAL_STORAGE_KEY } from '../lib/pwaPortals'

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  const isDisplayModeStandalone =
    window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  const isIosStandalone = window.navigator?.standalone === true
  return Boolean(isDisplayModeStandalone || isIosStandalone)
}

/**
 * iOS ignora o start_url do manifest e sempre abre a URL exata que estava
 * carregada quando "Adicionar à Tela de Início" foi tocado; hospedagens sem
 * rewrite de SPA para deep links também podem fazer o app instalado cair na
 * raiz "/" em vez do endereço real. Quando o app abre em modo standalone e
 * cai em "/", mandamos para o último portal (Gestão, Cliente, Mecânico ou
 * Secretaria) que o usuário de fato navegou nesse navegador — guardado pelo
 * PwaManifestSwitcher — em vez de sempre assumir a Gestão.
 */
export function PwaStandaloneRedirect() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/' && isStandaloneDisplay()) {
      let destino = '/gestao/dashboard'
      try {
        const salvo = localStorage.getItem(LAST_PORTAL_STORAGE_KEY)
        if (salvo) destino = salvo
      } catch {}
      navigate(destino, { replace: true })
    }
  }, [])

  return null
}
