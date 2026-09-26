/**
 * Repositório assíncrono unificado de Suprimentos (Peças, Serviços e Terceiros) — Story 2.7 / FR25.
 * Reúne e reexporta as operações de pecasRepository, servicosRepository e terceirosRepository
 * mantendo compatibilidade com as assinaturas públicas pré-existentes e respeitando NFR17 (< 400 linhas).
 */

export * from './pecasRepository'
export * from './servicosRepository'
export * from './terceirosRepository'
