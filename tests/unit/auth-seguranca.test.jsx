// @vitest-environment jsdom
// Testes de segurança do fluxo real de autenticação (AdminAuthProvider + ProtectedRoute).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const clienteSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
    mfa: {
      getAuthenticatorAssuranceLevel: vi.fn(),
      listFactors: vi.fn(),
    },
  },
}

vi.mock('../../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabaseAdminClient: () => clienteSupabase,
}))

const { AdminAuthProvider, obterPapelDoUsuario } = await import('../../src/context/AdminAuthContext')
const { ProtectedRoute } = await import('../../src/components/auth/ProtectedRoute')

function renderizarGestao() {
  return render(
    <AdminAuthProvider>
      <MemoryRouter initialEntries={['/gestao/dashboard']}>
        <Routes>
          <Route
            path="/gestao/dashboard"
            element={
              <ProtectedRoute portal="gestao">
                <div>AREA_RESTRITA</div>
              </ProtectedRoute>
            }
          />
          <Route path="/gestao/entrar" element={<div>TELA_LOGIN</div>} />
          <Route path="/gestao/acesso-negado" element={<div>ACESSO_NEGADO</div>} />
        </Routes>
      </MemoryRouter>
    </AdminAuthProvider>
  )
}

function sessaoCom(user) {
  clienteSupabase.auth.getSession.mockResolvedValue({ data: { session: { user } }, error: null })
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  clienteSupabase.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
    data: { currentLevel: 'aal2' },
    error: null,
  })
  clienteSupabase.auth.mfa.listFactors.mockResolvedValue({ data: { totp: [] }, error: null })
})

afterEach(() => cleanup())

describe('obterPapelDoUsuario', () => {
  it('lê o papel apenas de app_metadata', () => {
    expect(obterPapelDoUsuario({ app_metadata: { role: 'admin' } })).toBe('admin')
  })

  it('ignora user_metadata, que é editável pelo próprio usuário', () => {
    expect(obterPapelDoUsuario({ user_metadata: { role: 'admin' }, app_metadata: {} })).toBeNull()
  })

  it('rejeita papéis desconhecidos e usuário ausente', () => {
    expect(obterPapelDoUsuario({ app_metadata: { role: 'superuser' } })).toBeNull()
    expect(obterPapelDoUsuario(null)).toBeNull()
  })
})

describe('ProtectedRoute com sessão real do Supabase', () => {
  it('sessão forjada no localStorage não concede acesso', async () => {
    localStorage.setItem(
      'dev_oficina_admin_session',
      JSON.stringify({ user: { id: 'x' }, role: 'admin', status: 'aal2' })
    )
    clienteSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })

    renderizarGestao()

    expect(await screen.findByText('TELA_LOGIN')).toBeTruthy()
    expect(screen.queryByText('AREA_RESTRITA')).toBeNull()
  })

  it('usuário que se promove via user_metadata não entra na Gestão', async () => {
    sessaoCom({ id: 'u1', user_metadata: { role: 'admin' }, app_metadata: {} })

    renderizarGestao()

    expect(await screen.findByText('ACESSO_NEGADO')).toBeTruthy()
    expect(screen.queryByText('AREA_RESTRITA')).toBeNull()
  })

  it('erro na checagem de MFA nega o acesso', async () => {
    sessaoCom({ id: 'u1', app_metadata: { role: 'admin' } })
    clienteSupabase.auth.mfa.getAuthenticatorAssuranceLevel.mockRejectedValue(new Error('falha'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    renderizarGestao()

    expect(await screen.findByText('TELA_LOGIN')).toBeTruthy()
    expect(screen.queryByText('AREA_RESTRITA')).toBeNull()
  })

  it('admin com papel em app_metadata e MFA verificado acessa a Gestão', async () => {
    sessaoCom({ id: 'u1', app_metadata: { role: 'admin' } })

    renderizarGestao()

    expect(await screen.findByText('AREA_RESTRITA')).toBeTruthy()
  })
})
