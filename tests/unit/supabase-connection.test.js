import { describe, it, expect, afterEach, vi } from 'vitest'

// Story 2.4 (AC5): independente de .env e de rede. O módulo é recarregado com variáveis
// simuladas e o supabase-js é mockado — nenhum teste depende das credenciais reais nem
// chama o Supabase de verdade (o CI não tem segredos).
const getSessionMock = vi.fn()
const clienteFalso = {
  auth: { getSession: getSessionMock },
  from: vi.fn(),
}
const createClientMock = vi.fn(() => clienteFalso)

vi.mock('@supabase/supabase-js', () => ({ createClient: createClientMock }))

const URL_TESTE = 'https://projeto-teste.supabase.co'
const CHAVE_TESTE = 'sb_publishable_chave_de_teste'

async function carregarModulo(env) {
  vi.resetModules()
  const variaveis = [
    'VITE_SUPABASE_URL',
    'SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
  ]
  variaveis.forEach((nome) => vi.stubEnv(nome, env[nome] ?? ''))
  return import('../../src/lib/supabase')
}

describe('Supabase Database Connection & Configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  describe('com credenciais configuradas', () => {
    const env = { VITE_SUPABASE_URL: `  ${URL_TESTE}  `, VITE_SUPABASE_PUBLISHABLE_KEY: CHAVE_TESTE }

    it('deve validar que as credenciais do Supabase estão configuradas', async () => {
      const mod = await carregarModulo(env)
      expect(mod.isSupabaseConfigured).toBe(true)
      expect(mod.supabaseUrl).toBe(URL_TESTE) // espaços removidos
      expect(mod.supabaseAnonKey).toBe(CHAVE_TESTE)
    })

    it('aceita a chave anon legada quando não há publishable key', async () => {
      const mod = await carregarModulo({ VITE_SUPABASE_URL: URL_TESTE, VITE_SUPABASE_ANON_KEY: 'anon-legada' })
      expect(mod.isSupabaseConfigured).toBe(true)
      expect(mod.supabaseAnonKey).toBe('anon-legada')
    })

    it('deve inicializar o cliente Supabase com módulos de Auth e PostgREST', async () => {
      const mod = await carregarModulo(env)
      const client = mod.getSupabaseAdminClient()
      expect(client).not.toBeNull()
      expect(client.auth).toBeDefined()
      expect(typeof client.from).toBe('function')
      expect(createClientMock).toHaveBeenCalledWith(
        URL_TESTE,
        CHAVE_TESTE,
        expect.objectContaining({ auth: expect.objectContaining({ storageKey: 'mg-mecanica-admin-auth' }) })
      )
    })

    it('deve exportar a instância singleton do cliente Supabase', async () => {
      const mod = await carregarModulo(env)
      expect(mod.supabase).not.toBeNull()
      expect(mod.supabase).toBe(mod.getSupabaseAdminClient())
      expect(mod.getSupabaseDataClient()).toBe(mod.supabase)
      expect(createClientMock).toHaveBeenCalledTimes(1)
    })

    it('deve executar o healthcheck testarConexaoSupabase sem lançar exceções não tratadas', async () => {
      getSessionMock.mockResolvedValueOnce({ data: { session: null }, error: null })
      const mod = await carregarModulo(env)
      const resultado = await mod.testarConexaoSupabase()
      expect(resultado).toMatchObject({ ok: true, status: 'conectado', url: URL_TESTE, temSessaoAtiva: false })
    })

    it('healthcheck reporta erro de auth sem lançar', async () => {
      getSessionMock.mockResolvedValueOnce({ data: null, error: { message: 'JWT inválido' } })
      const mod = await carregarModulo(env)
      expect(await mod.testarConexaoSupabase()).toMatchObject({ ok: false, status: 'erro_auth', detalhe: 'JWT inválido' })
    })

    it('healthcheck reporta falha de rede sem lançar', async () => {
      getSessionMock.mockRejectedValueOnce(new Error('rede indisponível'))
      const mod = await carregarModulo(env)
      expect(await mod.testarConexaoSupabase()).toMatchObject({ ok: false, status: 'erro_conexao', url: URL_TESTE })
    })
  })

  describe('sem credenciais (dev offline / CI)', () => {
    it('opera em modo offline sem criar cliente', async () => {
      const mod = await carregarModulo({})
      expect(mod.isSupabaseConfigured).toBe(false)
      expect(mod.supabase).toBeNull()
      expect(mod.getSupabaseAdminClient()).toBeNull()
      expect(createClientMock).not.toHaveBeenCalled()
    })

    it('healthcheck informa offline sem tocar a rede', async () => {
      const mod = await carregarModulo({})
      const resultado = await mod.testarConexaoSupabase()
      expect(resultado).toMatchObject({ ok: false, status: 'offline_local' })
      expect(createClientMock).not.toHaveBeenCalled()
    })

    it('URL sem chave não conta como configurado', async () => {
      const mod = await carregarModulo({ VITE_SUPABASE_URL: URL_TESTE })
      expect(mod.isSupabaseConfigured).toBe(false)
    })
  })
})
