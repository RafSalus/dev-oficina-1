import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  ''
).trim()

export const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  ''
).trim()

export const isSupabaseConfigured = Boolean(
  typeof supabaseUrl === 'string' &&
  supabaseUrl.length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0
)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '[Supabase] SUPABASE_URL ou SUPABASE_PUBLISHABLE_KEY não foram definidos no .env. O sistema operará em modo de desenvolvimento local offline.'
  )
}

let clientInstance = null

export function getSupabaseAdminClient() {
  if (!isSupabaseConfigured) return null
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mg-mecanica-admin-auth',
      },
    })
  }
  return clientInstance
}

export const supabase = isSupabaseConfigured ? getSupabaseAdminClient() : null

/**
 * Retorna o cliente de dados Supabase para leitura e gravação no PostgREST.
 * Reaproveita a mesma instância e sessão de autenticação do cliente admin/auth (Story 2.1 AC4).
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseDataClient() {
  return getSupabaseAdminClient()
}

/**
 * Realiza teste de conectividade com os serviços em nuvem do Supabase.
 * @returns {Promise<{ ok: boolean, status: string, url: string, detalhe?: string }>}
 */
export async function testarConexaoSupabase() {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      status: 'offline_local',
      url: supabaseUrl,
      detalhe: 'Credenciais do Supabase não configuradas.',
    }
  }

  try {
    const client = getSupabaseAdminClient()
    if (!client) throw new Error('Cliente Supabase não inicializado')

    // Ping leve na API de autenticação
    const { data, error } = await client.auth.getSession()
    if (error) {
      return {
        ok: false,
        status: 'erro_auth',
        url: supabaseUrl,
        detalhe: error.message,
      }
    }

    return {
      ok: true,
      status: 'conectado',
      url: supabaseUrl,
      temSessaoAtiva: Boolean(data?.session),
    }
  } catch (err) {
    return {
      ok: false,
      status: 'erro_conexao',
      url: supabaseUrl,
      detalhe: err.message,
    }
  }
}
