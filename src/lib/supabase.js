import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://lqjwzlgwcfhxpefnfnzt.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_q26vqtnOd_-l6XtsK09vMA_ilXWhPxB'

export const isSupabaseConfigured = Boolean(
  typeof supabaseUrl === 'string' &&
  supabaseUrl.trim().length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.trim().length > 0
)

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
