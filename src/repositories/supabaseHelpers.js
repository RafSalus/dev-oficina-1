/**
 * Utilitários e wrappers padronizados para repositórios Supabase (ADR-005).
 * Concentra:
 * 1. Conversão bidirecional snake_case (banco) ↔ camelCase (JS)
 * 2. Determinação fail-closed do modo de operação (remoto vs. local)
 * 3. Wrapper de execução de queries com verificação obrigatória de { error } e linhas afetadas
 */

import { isSupabaseConfigured } from '../lib/supabase'
import { ErroRepositorio, CODIGOS_ERRO, MENSAGENS_PADRAO, mapearErroPostgres } from './erroRepositorio'

let modoOperacaoOverride = null

/**
 * Permite definir/sobrescrever o modo de operação durante testes automatizados (Story 2.1 AC6).
 * @param {'remoto' | 'local' | null} modo
 */
export function setModoOperacaoOverride(modo) {
  modoOperacaoOverride = modo
}

/**
 * Modo de operação decidido na inicialização (ADR-005 §2.1):
 * - 'remoto': quando o Supabase está configurado (isSupabaseConfigured === true).
 * - 'local': em dev/test offline (isSupabaseConfigured === false e PROD === false).
 * - Erro fatal na inicialização caso PROD === true e Supabase não esteja configurado.
 * Em ambiente de teste unitário Vitest (process.env.VITEST), opera em modo 'local'
 * por padrão para preservar isolamento de rede e suíte unitária (Story 2.4 AC5),
 * podendo ser chaveado para 'remoto' via setModoOperacaoOverride('remoto').
 */
export const MODO_OPERACAO_PADRAO = (() => {
  const isProd = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD)
  if (isProd) {
    if (!isSupabaseConfigured) {
      throw new Error('[Supabase] Fail-closed: Build de produção inicializado sem Supabase configurado.')
    }
    return 'remoto'
  }
  if (typeof process !== 'undefined' && process.env?.VITEST) {
    return 'local'
  }
  if (isSupabaseConfigured) {
    return 'remoto'
  }
  return 'local'
})()

export const MODO_OPERACAO = MODO_OPERACAO_PADRAO

export function obterModoOperacao() {
  if (modoOperacaoOverride) {
    return modoOperacaoOverride
  }
  return MODO_OPERACAO_PADRAO
}

export function isModoRemoto() {
  return obterModoOperacao() === 'remoto'
}

/**
 * Converte string camelCase para snake_case.
 * @param {string} str
 * @returns {string}
 */
export function camelParaSnake(str) {
  if (typeof str !== 'string') return str
  return str.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`)
}

/**
 * Converte string snake_case para camelCase.
 * @param {string} str
 * @returns {string}
 */
export function snakeParaCamel(str) {
  if (typeof str !== 'string') return str
  return str.replace(/_([a-z0-9])/g, (_, letra) => letra.toUpperCase())
}

/**
 * Converte as chaves de um objeto ou lista de objetos para snake_case (para gravação no Postgres).
 * Conversão rasa (1 nível): campos de dados complexos/JSONB (ex: snapshots, arrays aninhados)
 * são preservados intactos por padrão.
 *
 * @param {any} dado - Objeto, array ou valor primitivo
 * @param {Object} [opcoes]
 * @param {string[]} [opcoes.preservarCampos=[]] - Chaves que não devem ser convertidas
 * @returns {any}
 */
export function paraSnakeCase(dado, { preservarCampos = [] } = {}) {
  if (dado === null || typeof dado !== 'object') {
    return dado
  }

  if (Array.isArray(dado)) {
    return dado.map((item) => paraSnakeCase(item, { preservarCampos }))
  }

  // Preserva instâncias especiais como Date
  if (dado instanceof Date) {
    return dado
  }

  const resultado = {}
  const chavesPreservar = new Set(preservarCampos)

  for (const [chave, valor] of Object.entries(dado)) {
    if (chavesPreservar.has(chave)) {
      resultado[chave] = valor
    } else {
      const chaveSnake = camelParaSnake(chave)
      resultado[chaveSnake] = valor
    }
  }

  return resultado
}

/**
 * Converte as chaves de um objeto ou lista de objetos de snake_case para camelCase (para uso no JS).
 * Conversão rasa (1 nível): campos JSONB preservam sua estrutura interna.
 *
 * @param {any} dado - Objeto, array ou valor primitivo retornado pelo Supabase
 * @param {Object} [opcoes]
 * @param {string[]} [opcoes.preservarCampos=[]] - Chaves que não devem ser convertidas
 * @returns {any}
 */
export function paraCamelCase(dado, { preservarCampos = [] } = {}) {
  if (dado === null || typeof dado !== 'object') {
    return dado
  }

  if (Array.isArray(dado)) {
    return dado.map((item) => paraCamelCase(item, { preservarCampos }))
  }

  if (dado instanceof Date) {
    return dado
  }

  const resultado = {}
  const chavesPreservar = new Set(preservarCampos)

  for (const [chave, valor] of Object.entries(dado)) {
    if (chavesPreservar.has(chave)) {
      resultado[chave] = valor
    } else {
      const chaveCamel = snakeParaCamel(chave)
      resultado[chaveCamel] = valor
    }
  }

  return resultado
}

/**
 * Wrapper de execução de queries que consome uma Promise do Supabase e aplica fail-closed:
 * 1. Checa explicitamente `{ error }`
 * 2. Se `esperaLinhasAfetadas: true`, checa se o comando de escrita afetou pelo menos 1 linha
 * 3. Em caso de erro, loga `console.error` contextualizado e lança `ErroRepositorio`
 *
 * @template T
 * @param {Promise<{ data: T, error: any, count?: number }> | Function} querySupabase
 * @param {Object} [contexto] - { entidade: string, operacao: string, mensagensCustomizadas?: Object }
 * @param {Object} [opcoes]
 * @param {boolean} [opcoes.esperaLinhasAfetadas=false] - Exige que data não seja nulo ou vazio em escritas
 * @returns {Promise<T>}
 */
export async function executarOperacao(querySupabase, contexto = {}, { esperaLinhasAfetadas = false } = {}) {
  const entidade = contexto.entidade || 'geral'
  const operacao = contexto.operacao || 'query'

  try {
    const promise = typeof querySupabase === 'function' ? querySupabase() : querySupabase
    const resposta = await promise

    const { data, error } = resposta || {}

    if (error) {
      console.error(`[Repositorio][${entidade}][${operacao}] Erro retornado pelo Supabase:`, error)
      throw mapearErroPostgres(error, contexto)
    }

    if (esperaLinhasAfetadas) {
      const quantidade = Array.isArray(data) ? data.length : data ? 1 : 0
      if (quantidade === 0) {
        console.error(
          `[Repositorio][${entidade}][${operacao}] Falha de autorização ou concorrência: 0 linhas afetadas em operação de escrita restrita.`
        )
        throw new ErroRepositorio(
          CODIGOS_ERRO.SEM_PERMISSAO,
          MENSAGENS_PADRAO[CODIGOS_ERRO.SEM_PERMISSAO],
          { contexto }
        )
      }
    }

    return data
  } catch (err) {
    if (err instanceof ErroRepositorio) {
      throw err
    }
    console.error(`[Repositorio][${entidade}][${operacao}] Exceção inesperada na operação:`, err)
    throw mapearErroPostgres(err, contexto)
  }
}

/**
 * Executor padronizado de repositório (ADR-005 §2.1):
 * - No modo remoto: executa exclusivamente a função remota sem fallback.
 * - No modo local: executa o fluxo local (localStorage).
 *
 * @template T
 * @param {Object} params
 * @param {() => Promise<T> | T} params.remoto - Função que executa a operação remota no Supabase
 * @param {() => Promise<T> | T} params.local - Função que executa a operação em localStorage
 * @param {Object} [params.contexto] - Metadados para log e erro ({ entidade, operacao, ... })
 * @returns {Promise<T>}
 */
export async function executarRepositorio({ remoto, local, contexto = {} }) {
  if (isModoRemoto()) {
    try {
      const res = await (typeof remoto === 'function' ? remoto() : remoto)
      if (res && typeof res === 'object' && 'error' in res && res.error) {
        throw mapearErroPostgres(res.error, contexto)
      }
      return res
    } catch (err) {
      if (err instanceof ErroRepositorio) {
        throw err
      }
      const entidade = contexto.entidade || 'geral'
      const operacao = contexto.operacao || 'operacao'
      console.error(`[Repositorio][${entidade}][${operacao}] Exceção inesperada na operação remota:`, err)
      throw mapearErroPostgres(err, contexto)
    }
  }
  return Promise.resolve(typeof local === 'function' ? local() : local)
}
