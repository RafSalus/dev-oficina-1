/**
 * Rotinas de limpeza de dados em localStorage (ADR-005 §2.3 / NFR14).
 * Remove dados de domínio legados e temporários no login e logout para impedir
 * persistência insegura e vazamento de dados de clientes, veículos, OS e equipe.
 */

/**
 * Chaves de entidades do domínio que já foram migradas para o Supabase (ADR-005 §2.3 / NFR14).
 * Cada story subsequente de migração (Ondas B a G) deve adicionar a sua respectiva chave
 * a esta lista quando for conectada ao Supabase Postgres.
 *
 * Módulos ainda não migrados (clientes, veículos, OS, agenda, compras, etc.) NÃO devem constar
 * nesta lista para não causar perda de dados de trabalho local antes da migração correspondente.
 */
export const CHAVES_DOMINIO_LIMPEZA = [
  'dev_oficina_funcionarios',
]


/**
 * Remove do localStorage todas as chaves de domínio conhecidas.
 * Preserva chaves de preferências de UI (ex.: tema, colapso de sidebar, redirect standalone)
 * e o token de dispositivo pareado.
 *
 * @returns {number} Quantidade de chaves removidas
 */
export function limparDadosDominioLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 0
  }

  let removidas = 0
  try {
    for (const chave of CHAVES_DOMINIO_LIMPEZA) {
      if (localStorage.getItem(chave) !== null) {
        localStorage.removeItem(chave)
        removidas++
      }
    }
  } catch (err) {
    console.error('[StorageCleaners] Erro ao limpar chaves de domínio:', err)
  }

  return removidas
}
