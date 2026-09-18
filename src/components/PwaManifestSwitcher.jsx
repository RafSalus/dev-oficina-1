import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { LAST_PORTAL_STORAGE_KEY, resolvePortalConfig } from '../lib/pwaPortals'

// Cada portal do sistema precisa ser instalável como um PWA independente
// (nome, ícone na tela inicial e tela de abertura próprios), em vez de todos
// caírem no manifest e no start_url da Gestão só porque compartilham o mesmo
// index.html. O navegador só sabe qual "app" instalar olhando a tag
// <link rel="manifest"> presente no documento no momento da instalação, então
// trocamos essa tag (e os metadados equivalentes usados pelo iOS) conforme a
// rota atual, antes do usuário tocar em "Instalar" ou "Adicionar à Tela de Início".
export function PwaManifestSwitcher() {
  const location = useLocation()

  useEffect(() => {
    const config = resolvePortalConfig(location.pathname)

    // Substitui o elemento <link> inteiro (em vez de só trocar o atributo
    // href) porque alguns WebKit/iOS não reavaliam qual manifest está ativo
    // quando o href de uma tag já existente é apenas mutado via JS — só
    // reconhecem a troca quando um nó novo é inserido no documento.
    const currentManifestLink = document.querySelector('link[rel="manifest"]')
    if (!currentManifestLink || !currentManifestLink.getAttribute('href')?.endsWith(config.manifest)) {
      currentManifestLink?.remove()
      const freshManifestLink = document.createElement('link')
      freshManifestLink.setAttribute('rel', 'manifest')
      freshManifestLink.setAttribute('href', config.manifest)
      document.head.appendChild(freshManifestLink)
    }

    const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]')
    if (appleTitleMeta) appleTitleMeta.setAttribute('content', config.appTitle)

    const applicationNameMeta = document.querySelector('meta[name="application-name"]')
    if (applicationNameMeta) applicationNameMeta.setAttribute('content', config.applicationName)

    // Lembra qual foi o último portal navegado, para o PwaStandaloneRedirect
    // conseguir voltar para o lugar certo caso o app instalado (iOS, ou um
    // host sem rewrite de SPA para deep links) acabe abrindo na raiz "/".
    if (config.homePath) {
      try {
        localStorage.setItem(LAST_PORTAL_STORAGE_KEY, config.homePath)
      } catch {}
    }
  }, [location.pathname])

  return null
}
