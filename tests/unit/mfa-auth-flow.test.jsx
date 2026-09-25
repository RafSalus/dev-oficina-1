// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const mockMfa = {
  getAuthenticatorAssuranceLevel: vi.fn(),
  listFactors: vi.fn(),
  enroll: vi.fn(),
  unenroll: vi.fn(),
  challenge: vi.fn(),
  verify: vi.fn(),
}

const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    mfa: mockMfa,
  },
}

vi.mock('../../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabaseAdminClient: () => mockSupabase,
}))

const { AdminAuthProvider, useAdminAuth } = await import('../../src/context/AdminAuthContext')
const { GestaoMfaConfigurarPage } = await import('../../src/pages/GestaoMfaConfigurarPage')

function TestMfaConsumer({ onReady }) {
  const auth = useAdminAuth()
  useEffectHook(() => {
    onReady(auth)
  }, [auth, onReady])
  return <div>CONSUMER_READY</div>
}

// Helper hook
import { useEffect as useEffectHook } from 'react'

describe('Fluxo Robusto de Autenticação MFA TOTP', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1', app_metadata: { role: 'admin' } } } },
      error: null,
    })
    mockMfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    })
    mockMfa.listFactors.mockResolvedValue({
      data: {
        totp: [],
      },
      error: null,
    })
    mockMfa.enroll.mockResolvedValue({
      data: {
        id: 'factor-new-123',
        type: 'totp',
        totp: {
          qr_code: 'data:image/svg+xml;utf-8,<svg id="mock-qr"></svg>',
          secret: 'JBSWY3DPEHPK3PXP',
          uri: 'otpauth://totp/Oficina?secret=JBSWY3DPEHPK3PXP',
        },
      },
      error: null,
    })
    mockMfa.unenroll.mockResolvedValue({ data: {}, error: null })
  })

  afterEach(() => {
    cleanup()
  })

  it('enrollMfa deve auto-limpar fatores TOTP com status "unverified" antes de novo enroll', async () => {
    mockMfa.listFactors.mockResolvedValue({
      data: {
        totp: [
          { id: 'stale-factor-1', status: 'unverified', friendly_name: 'Mecanica Gabriel Admin' },
          { id: 'stale-factor-2', status: 'unverified', friendly_name: 'Old Factor' },
        ],
      },
      error: null,
    })

    let authInstance = null
    render(
      <AdminAuthProvider>
        <TestMfaConsumer onReady={(auth) => { authInstance = auth }} />
      </AdminAuthProvider>
    )

    await waitFor(() => expect(authInstance).not.toBeNull())

    const res = await authInstance.enrollMfa()
    expect(res.ok).toBe(true)
    expect(res.factorId).toBe('factor-new-123')
    expect(res.secret).toBe('JBSWY3DPEHPK3PXP')

    // Deve ter chamado unenroll para ambos os fatores não verificados
    expect(mockMfa.unenroll).toHaveBeenCalledTimes(2)
    expect(mockMfa.unenroll).toHaveBeenCalledWith({ factorId: 'stale-factor-1' })
    expect(mockMfa.unenroll).toHaveBeenCalledWith({ factorId: 'stale-factor-2' })

    // E então chamou enroll
    expect(mockMfa.enroll).toHaveBeenCalledWith({
      factorType: 'totp',
      issuer: 'Mecanica Gabriel',
    })
  })

  it('enrollMfa deve evitar chamadas concorrentes paralelas retornando a mesma promessa em voo', async () => {
    let authInstance = null
    render(
      <AdminAuthProvider>
        <TestMfaConsumer onReady={(auth) => { authInstance = auth }} />
      </AdminAuthProvider>
    )

    await waitFor(() => expect(authInstance).not.toBeNull())

    // Dispara dois enrolls simultâneos
    const [res1, res2] = await Promise.all([
      authInstance.enrollMfa(),
      authInstance.enrollMfa(),
    ])

    expect(res1.ok).toBe(true)
    expect(res2.ok).toBe(true)
    expect(res1.factorId).toBe(res2.factorId)
    // Supabase enroll chamado apenas 1 vez graças ao inFlightEnrollRef
    expect(mockMfa.enroll).toHaveBeenCalledTimes(1)
  })

  it('verifyMfa deve resolver automaticamente o factorId via listFactors quando chamado com null', async () => {
    mockMfa.listFactors.mockResolvedValue({
      data: {
        totp: [{ id: 'active-factor-999', status: 'verified' }],
      },
      error: null,
    })
    mockMfa.challenge.mockResolvedValue({
      data: { id: 'challenge-555' },
      error: null,
    })
    mockMfa.verify.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })

    let authInstance = null
    render(
      <AdminAuthProvider>
        <TestMfaConsumer onReady={(auth) => { authInstance = auth }} />
      </AdminAuthProvider>
    )

    await waitFor(() => expect(authInstance).not.toBeNull())

    // Chamada similar a GestaoMfaVerificarPage: verifyMfa(null, '123456')
    const result = await authInstance.verifyMfa(null, '123456')

    expect(result.ok).toBe(true)
    expect(mockMfa.challenge).toHaveBeenCalledWith({ factorId: 'active-factor-999' })
    expect(mockMfa.verify).toHaveBeenCalledWith({
      factorId: 'active-factor-999',
      challengeId: 'challenge-555',
      code: '123456',
    })
  })

  it('GestaoMfaConfigurarPage exibe o segredo e o QR Code sem exibir "Chave indisponível"', async () => {
    render(
      <AdminAuthProvider>
        <MemoryRouter initialEntries={['/gestao/mfa/configurar']}>
          <Routes>
            <Route path="/gestao/mfa/configurar" element={<GestaoMfaConfigurarPage />} />
          </Routes>
        </MemoryRouter>
      </AdminAuthProvider>
    )

    // Aguarda carregar
    expect(await screen.findByText('JBSW Y3DP EHPK 3PXP')).toBeTruthy()
    expect(screen.queryByText('Chave indisponível')).toBeNull()
    expect(screen.getByText('Configurar Segundo Fator (MFA)')).toBeTruthy()
  })

  it('GestaoMfaConfigurarPage exibe tela de erro com botão "Tentar novamente" em caso de falha', async () => {
    mockMfa.enroll.mockResolvedValueOnce({
      data: null,
      error: { message: 'Erro de comunicação temporário' },
    })

    render(
      <AdminAuthProvider>
        <MemoryRouter initialEntries={['/gestao/mfa/configurar']}>
          <Routes>
            <Route path="/gestao/mfa/configurar" element={<GestaoMfaConfigurarPage />} />
          </Routes>
        </MemoryRouter>
      </AdminAuthProvider>
    )

    // Deve exibir o estado de erro
    expect(await screen.findByText('Não foi possível carregar a chave')).toBeTruthy()
    expect(screen.getByText('Erro de comunicação temporário')).toBeTruthy()
    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i })
    expect(retryBtn).toBeTruthy()

    // Configura sucesso para a próxima tentativa
    mockMfa.enroll.mockResolvedValueOnce({
      data: {
        id: 'factor-retry-ok',
        type: 'totp',
        totp: {
          qr_code: '<svg id="retry-qr"></svg>',
          secret: 'RETRYSECRET12345',
          uri: 'otpauth://totp/...',
        },
      },
      error: null,
    })

    fireEvent.click(retryBtn)

    // Agora deve carregar a nova chave
    expect(await screen.findByText('RETR YSEC RET1 2345')).toBeTruthy()
  })
})
