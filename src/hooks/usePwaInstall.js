import { useCallback, useEffect, useState } from 'react'

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  const isDisplayModeStandalone =
    window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  const isIosStandalone = window.navigator?.standalone === true
  return Boolean(isDisplayModeStandalone || isIosStandalone)
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isIphoneIpad = /iphone|ipad|ipod/i.test(ua)
  const isIpadOnMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isIphoneIpad || isIpadOnMac
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(isStandaloneDisplay)
  const [isIos] = useState(isIosDevice)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome === 'accepted'
  }, [deferredPrompt])

  return {
    isInstalled,
    isIos,
    canPromptInstall: Boolean(deferredPrompt) && !isInstalled,
    showIosInstructions: isIos && !isInstalled,
    promptInstall,
  }
}
