// Configuração central dos "portais" instaláveis como PWA (Gestão, Cliente,
// Mecânico, Secretaria). Compartilhada entre o PwaManifestSwitcher (que troca
// o manifest/título conforme a rota) e o PwaStandaloneRedirect (que decide
// para onde mandar o app quando ele abre direto na raiz "/").
export const LAST_PORTAL_STORAGE_KEY = 'dev_oficina_last_portal_home'

export const PORTAL_CONFIGS = [
  {
    prefix: '/cliente',
    manifest: '/site-cliente.webmanifest',
    appTitle: 'MG Cliente',
    applicationName: 'Mecânica Gabriel - Portal do Cliente',
    homePath: '/cliente/resumo',
  },
  {
    prefix: '/mecanico',
    manifest: '/site-mecanico.webmanifest',
    appTitle: 'MG Mecânico',
    applicationName: 'Mecânica Gabriel - Bancada do Mecânico',
    homePath: '/mecanico/dashboard',
  },
  {
    prefix: '/secretaria',
    manifest: '/site-secretaria.webmanifest',
    appTitle: 'MG Recepção',
    applicationName: 'Mecânica Gabriel - Recepção',
    homePath: '/secretaria/dashboard',
  },
  {
    prefix: '/gestao',
    manifest: '/site.webmanifest',
    appTitle: 'Mecânica Gabriel',
    applicationName: 'Mecânica Gabriel - Gestão de Oficina',
    homePath: '/gestao/dashboard',
  },
]

export const DEFAULT_PORTAL_CONFIG = {
  manifest: '/site.webmanifest',
  appTitle: 'Mecânica Gabriel',
  applicationName: 'Mecânica Gabriel',
  homePath: null,
}

export function resolvePortalConfig(pathname) {
  return PORTAL_CONFIGS.find((portal) => pathname.startsWith(portal.prefix)) || DEFAULT_PORTAL_CONFIG
}
