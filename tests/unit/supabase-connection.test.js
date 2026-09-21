import { describe, it, expect } from 'vitest'
import {
  supabase,
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured,
  getSupabaseAdminClient,
  testarConexaoSupabase,
} from '../../src/lib/supabase'

describe('Supabase Database Connection & Configuration', () => {
  it('deve validar que as credenciais do Supabase estão configuradas', () => {
    expect(isSupabaseConfigured).toBe(true)
    expect(supabaseUrl).toBe('https://scdwdmfiiiylcbqekuwc.supabase.co')
    expect(supabaseAnonKey).toBe('sb_publishable_o1yn4HcyPio-u4joG0cZ0w_AB1ZuWLG')
  })

  it('deve inicializar o cliente Supabase com módulos de Auth e PostgREST', () => {
    const client = getSupabaseAdminClient()
    expect(client).not.toBeNull()
    expect(client.auth).toBeDefined()
    expect(typeof client.from).toBe('function')
  })

  it('deve exportar a instância singleton do cliente Supabase', () => {
    expect(supabase).not.toBeNull()
    expect(supabase).toBe(getSupabaseAdminClient())
  })

  it('deve executar o healthcheck testarConexaoSupabase sem lançar exceções não tratadas', async () => {
    const resultado = await testarConexaoSupabase()
    expect(resultado).toBeDefined()
    expect(resultado.url).toBe('https://scdwdmfiiiylcbqekuwc.supabase.co')
    expect(typeof resultado.ok).toBe('boolean')
  })
})
