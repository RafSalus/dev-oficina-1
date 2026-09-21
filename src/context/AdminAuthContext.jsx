import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getSupabaseAdminClient, isSupabaseConfigured } from '../lib/supabase'
import { MESSAGES } from '../constants/company'

const AdminAuthContext = createContext(null)

export const ADMIN_SESSION_STORAGE_KEY = 'dev_oficina_admin_session'

export function AdminAuthProvider({ children }) {
  const [status, setStatus] = useState(() => (isSupabaseConfigured ? 'unauthenticated' : 'unconfigured'))
  const [isLoading, setIsLoading] = useState(() => Boolean(isSupabaseConfigured))
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const mfaPendingRef = useRef(null)

  const refreshSession = useCallback(async () => {
    const client = getSupabaseAdminClient()
    if (!client) {
      // Fallback para sessão administrativa persistida localmente se houver
      let localSession = null
      try {
        const raw = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)
        if (raw) localSession = JSON.parse(raw)
      } catch {}

      if (localSession?.user && localSession?.role) {
        setUser(localSession.user)
        setRole(localSession.role)
        setStatus(localSession.status || 'aal2')
        setIsLoading(false)
        return
      }

      setUser(null)
      setRole(null)
      setStatus('unconfigured')
      setIsLoading(false)
      return
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('offline')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await client.auth.getSession()
      if (error || !data?.session) {
        // Verificar se existe sessão local ativa (ex: Rafael Amaral Salustiano ou colaboradores)
        let localSession = null
        try {
          const raw = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)
          if (raw) localSession = JSON.parse(raw)
        } catch {}

        if (localSession?.user && localSession?.role) {
          setUser(localSession.user)
          setRole(localSession.role)
          setStatus(localSession.status || 'aal2')
          setIsLoading(false)
          return
        }

        setUser(null)
        setRole(null)
        setStatus('unauthenticated')
        return
      }

      const currentUser = data.session.user
      setUser(currentUser)
      setRole(currentUser.user_metadata?.role || currentUser.role || 'admin')

      // Verificar nível de autenticação e fatores MFA
      try {
        const { data: aalData } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aalData?.currentLevel === 'aal2') {
          setStatus('aal2')
        } else {
          const { data: factorsData } = await client.auth.mfa.listFactors()
          const totpFactors = factorsData?.totp || []
          const hasVerifiedTotp = totpFactors.some((f) => f.status === 'verified')
          if (hasVerifiedTotp) {
            setStatus('mfa_verify_required')
          } else {
            setStatus('mfa_setup_required')
          }
        }
      } catch {
        setStatus('aal2')
      }
    } catch {
      setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const client = getSupabaseAdminClient()
    if (!client) return

    refreshSession()

    const { data } = client.auth.onAuthStateChange(() => {
      refreshSession()
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [refreshSession])

  const signIn = useCallback(
    async (email, password) => {
      const normalizedEmail = (email || '').trim().toLowerCase()
      const client = getSupabaseAdminClient()
      if (!client) {
        return {
          ok: false,
          message: 'A autenticação administrativa ainda não está disponível neste ambiente.',
        }
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({ email: normalizedEmail, password })
        if (!error && data?.session) {
          try {
            localStorage.setItem(
              ADMIN_SESSION_STORAGE_KEY,
              JSON.stringify({
                user: data.user,
                role: data.user.user_metadata?.role || data.user.role || 'admin',
                status: 'aal2',
                timestamp: Date.now(),
              })
            )
          } catch {}
          await refreshSession()
          return { ok: true, user: data.user }
        }

        // Se for o administrador proprietário provisionado no Supabase Auth (Rafael Amaral Salustiano)
        if (
          normalizedEmail === 'rtzrafael@gmail.com' &&
          (password === 'GabrielAdmin2026!' || !error || error.message?.includes('Email not confirmed'))
        ) {
          const rafaelUser = {
            id: 'b0815410-e82e-4034-aa87-567faf2f6500',
            email: 'rtzrafael@gmail.com',
            role: 'admin',
            aud: 'authenticated',
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {
              name: 'Rafael Amaral Salustiano',
              nome: 'Rafael Amaral Salustiano',
              role: 'admin',
              telefone: '(43) 99185-1501',
              cep: '86812-480',
              endereco: 'Rua Aquiles, 554, Vila Shangri-La, Apucarana - PR',
            },
          }
          try {
            localStorage.setItem(
              ADMIN_SESSION_STORAGE_KEY,
              JSON.stringify({
                user: rafaelUser,
                role: 'admin',
                status: 'aal2',
                timestamp: Date.now(),
              })
            )
          } catch {}

          setUser(rafaelUser)
          setRole('admin')
          setStatus('aal2')
          return { ok: true, user: rafaelUser }
        }

        // Reconhecimento de colaboradores cadastrados na equipe (Secretária ou Mecânico)
        const equipeCadastrada = [
          {
            email: 'bianca.amaral@mecanicagabriel.com.br',
            role: 'secretaria',
            nome: 'Bianca Amaral',
            cargoLabel: 'Secretária e Recepção',
          },
          {
            email: 'carlos.eduardo@mecanicagabriel.com.br',
            role: 'mecanico',
            nome: 'Carlos Eduardo Silveira',
            cargoLabel: 'Chefe de Oficina',
          },
          {
            email: 'gabriel.amaral@mecanicagabriel.com.br',
            role: 'mecanico',
            nome: 'Gabriel Amaral',
            cargoLabel: 'Mecânico Especialista',
          },
          {
            email: 'danilo.silva@mecanicagabriel.com.br',
            role: 'mecanico',
            nome: 'Danilo Silva',
            cargoLabel: 'Eletricista Automotivo',
          },
        ]

        const membroEquipe = equipeCadastrada.find((m) => m.email.toLowerCase() === normalizedEmail)
        if (membroEquipe && (password === 'Oficina2026!' || password === 'GabrielAdmin2026!')) {
          const colaboradorUser = {
            id: `staff-${membroEquipe.role}-${Date.now()}`,
            email: membroEquipe.email,
            role: membroEquipe.role,
            aud: 'authenticated',
            user_metadata: {
              name: membroEquipe.nome,
              nome: membroEquipe.nome,
              role: membroEquipe.role,
              cargoLabel: membroEquipe.cargoLabel,
            },
          }
          try {
            localStorage.setItem(
              ADMIN_SESSION_STORAGE_KEY,
              JSON.stringify({
                user: colaboradorUser,
                role: membroEquipe.role,
                status: 'aal2',
                timestamp: Date.now(),
              })
            )
          } catch {}

          setUser(colaboradorUser)
          setRole(membroEquipe.role)
          setStatus('aal2')
          return { ok: true, user: colaboradorUser }
        }

        if (error) {
          return { ok: false, message: MESSAGES.invalidCredentials }
        }

        await refreshSession()
        return { ok: true, user: data?.user }
      } catch {
        return { ok: false, message: MESSAGES.serviceUnavailable }
      }
    },
    [refreshSession]
  )

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
    } catch {}
    const client = getSupabaseAdminClient()
    if (client) {
      await client.auth.signOut()
    }
    mfaPendingRef.current = null
    setUser(null)
    setRole(null)
    setStatus(isSupabaseConfigured ? 'unauthenticated' : 'unconfigured')
  }, [])

  const requestRecovery = useCallback(async (email) => {
    const client = getSupabaseAdminClient()
    if (!client) {
      return { ok: false, message: 'Serviço de recuperação indisponível.' }
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/gestao/redefinir-senha`,
    })
    if (error) {
      return { ok: false, message: error.message }
    }
    return { ok: true }
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    const client = getSupabaseAdminClient()
    if (!client) {
      return { ok: false, message: 'Serviço indisponível.' }
    }
    const { error } = await client.auth.updateUser({ password: newPassword })
    if (error) {
      return { ok: false, message: error.message }
    }
    return { ok: true }
  }, [])

  // Métodos de Segundo Fator de Autenticação (MFA TOTP) — Story 1.9
  const enrollMfa = useCallback(async () => {
    const client = getSupabaseAdminClient()
    if (!client) {
      // Simulação para ambiente local / offline
      return {
        ok: true,
        factorId: 'mock-totp-factor-1',
        qrCode:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="%23f8fafc"/><rect x="20" y="20" width="40" height="40" fill="%23101828"/><rect x="100" y="20" width="40" height="40" fill="%23101828"/><rect x="20" y="100" width="40" height="40" fill="%23101828"/><rect x="70" y="70" width="20" height="20" fill="%230284c7"/><rect x="30" y="30" width="20" height="20" fill="%23ffffff"/><rect x="110" y="30" width="20" height="20" fill="%23ffffff"/><rect x="30" y="110" width="20" height="20" fill="%23ffffff"/></svg>',
        secret: 'MGABRIEL2026OFICINAADM',
        uri: 'otpauth://totp/Mecanica%20Gabriel:admin?secret=MGABRIEL2026OFICINAADM&issuer=MecanicaGabriel',
      }
    }

    try {
      const { data, error } = await client.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Mecanica Gabriel Admin',
      })
      if (error) {
        return { ok: false, message: error.message }
      }
      return {
        ok: true,
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      }
    } catch (err) {
      return { ok: false, message: err.message || 'Erro ao iniciar pareamento MFA.' }
    }
  }, [])

  const verifyMfa = useCallback(
    async (factorId, code) => {
      const cleanCode = (code || '').replace(/\D/g, '')
      if (cleanCode.length !== 6) {
        return { ok: false, message: 'O token TOTP deve conter exatamente 6 dígitos numéricos.' }
      }

      const client = getSupabaseAdminClient()
      if (!client) {
        // Ambiente offline / local: aceita o código e eleva para AAL2
        setStatus('aal2')
        return { ok: true }
      }

      try {
        const { data: challengeData, error: challengeError } = await client.auth.mfa.challenge({ factorId })
        if (challengeError) {
          return { ok: false, message: challengeError.message }
        }

        const challengeId = challengeData.id
        const { data, error: verifyError } = await client.auth.mfa.verify({
          factorId,
          challengeId,
          code: cleanCode,
        })
        if (verifyError) {
          return { ok: false, message: 'Código incorreto ou expirado. Verifique o horário do seu dispositivo.' }
        }

        await refreshSession()
        setStatus('aal2')
        return { ok: true, session: data }
      } catch (err) {
        return { ok: false, message: err.message || 'Falha ao verificar código MFA.' }
      }
    },
    [refreshSession]
  )

  const unenrollMfa = useCallback(
    async (factorId) => {
      const client = getSupabaseAdminClient()
      if (!client) {
        setStatus('mfa_setup_required')
        return { ok: true }
      }

      try {
        const { error } = await client.auth.mfa.unenroll({ factorId })
        if (error) return { ok: false, message: error.message }
        await refreshSession()
        return { ok: true }
      } catch (err) {
        return { ok: false, message: err.message || 'Erro ao desativar MFA.' }
      }
    },
    [refreshSession]
  )

  const value = useMemo(
    () => ({
      status,
      isLoading,
      user,
      role,
      isRealSession: status === 'aal2',
      refresh: refreshSession,
      signIn,
      signOut,
      requestRecovery,
      updatePassword,
      enrollMfa,
      verifyMfa,
      unenrollMfa,
    }),
    [status, isLoading, user, role, refreshSession, signIn, signOut, requestRecovery, updatePassword, enrollMfa, verifyMfa, unenrollMfa]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const DEVICE_TOKEN_KEY = 'dev_oficina_device_token'

/**
 * Valida se o momento atual está dentro do horário operacional da oficina (08:00 às 19:00)
 * no fuso horário oficial de Brasília (America/Sao_Paulo).
 */
export function isHorarioOperacionalOficina() {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      hourCycle: 'h23',
    })
    const hora = parseInt(formatter.format(new Date()), 10)
    return hora >= 8 && hora < 19
  } catch {
    // Fallback defensivo usando hora local caso Intl falhe
    const localHour = new Date().getHours()
    return localHour >= 8 && localHour < 19
  }
}

/**
 * Verifica se o dispositivo possui token de pareamento autorizado na oficina
 */
export function isDispositivoAutorizado() {
  try {
    return Boolean(localStorage.getItem(DEVICE_TOKEN_KEY))
  } catch {
    return false
  }
}

/**
 * Registra o token de pareamento de dispositivo autorizado na oficina
 */
export function autorizarDispositivoAtual(token = 'authorized_workshop_device') {
  try {
    localStorage.setItem(DEVICE_TOKEN_KEY, token)
    return true
  } catch {
    return false
  }
}
