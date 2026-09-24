// Remoção única dos dados de demonstração (mocks) que versões anteriores gravaram no localStorage.
// Sessão, token de dispositivo e preferências de interface são preservados.
export const CHAVE_LIMPEZA_MOCKS = 'dev_oficina_limpeza_mocks_v1'

const CHAVES_PRESERVADAS = new Set([
  CHAVE_LIMPEZA_MOCKS,
  'dev_oficina_admin_session',
  'dev_oficina_device_token',
  'dev_oficina_last_portal_home',
  'dev_oficina_header_pinned',
  'dev_oficina_cliente_header_pinned',
  'dev_oficina_mecanico_header_pinned',
  'dev_oficina_secretaria_header_pinned',
  'dev_oficina_modal_impressao_dims',
  'dev_oficina_os_visualizacao',
  'dev_oficina_pdv_modal_pagamento',
])

export function limparDadosMockLegados(storage = globalThis.localStorage) {
  try {
    if (!storage || storage.getItem(CHAVE_LIMPEZA_MOCKS)) return []

    const removidas = []
    for (let i = storage.length - 1; i >= 0; i--) {
      const chave = storage.key(i)
      if (chave?.startsWith('dev_oficina_') && !CHAVES_PRESERVADAS.has(chave)) {
        storage.removeItem(chave)
        removidas.push(chave)
      }
    }

    storage.setItem(CHAVE_LIMPEZA_MOCKS, new Date().toISOString())
    return removidas
  } catch (error) {
    console.error('Erro ao limpar dados de demonstração do armazenamento local:', error)
    return []
  }
}
