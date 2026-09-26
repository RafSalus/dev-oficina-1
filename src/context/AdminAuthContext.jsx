import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getSupabaseAdminClient, isSupabaseConfigured } from '../lib/supabase'
import { MESSAGES } from '../constants/company'
import { limparDadosDominioLocalStorage } from '../utils/storageCleaners'
import { isHorarioOperacional } from '../components/auth/routeAccessRules'

const AdminAuthContext = createContext(null)

export const ADMIN_SESSION_STORAGE_KEY = 'dev_oficina_admin_session'

const PAPEIS_VALIDOS = ['admin', 'secretaria', 'mecanico']

/**
 * Papel do usuário no sistema. Lido de app_metadata, que só o servidor (service role) grava;
 * user_metadata é editável pelo próprio usuário e nunca deve ser usado para autorização.
 * @param {object|null} user - Usuário do Supabase Auth
 * @returns {'admin'|'secretaria'|'mecanico'|null}
 */
export function obterPapelDoUsuario(user) {
  const papel = user?.app_metadata?.role
  return PAPEIS_VALIDOS.includes(papel) ? papel : null
}

export function AdminAuthProvider({ children }) {
  const [status, setStatus] = useState(() => (isSupabaseConfigured ? 'unauthenticated' : 'unconfigured'))
  const [isLoading, setIsLoading] = useState(() => Boolean(isSupabaseConfigured))
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const mfaPendingRef = useRef(null)
  const inFlightEnrollRef = useRef(null)

  const limparSessao = useCallback((proximoStatus) => {
    setUser(null)
    setRole(null)
    setStatus(proximoStatus)
  }, [])

  // A única fonte de verdade da sessão é o Supabase Auth. Nada gravado no localStorage pelo
  // app concede acesso: falha, ausência de sessão ou erro na checagem de MFA negam o acesso.
  const refreshSession = useCallback(async () => {
    const client = getSupabaseAdminClient()
    if (!client) {
      limparSessao('unconfigured')
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
        limparSessao('unauthenticated')
        return
      }

      const currentUser = data.session.user
      setUser(currentUser)
      setRole(obterPapelDoUsuario(currentUser))

      const { data: aalData, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aalError) throw aalError

      if (aalData?.currentLevel === 'aal2') {
        setStatus('aal2')
        return
      }

      const { data: factorsData, error: factorsError } = await client.auth.mfa.listFactors()
      if (factorsError) throw factorsError
      const hasVerifiedTotp = (factorsData?.totp || []).some((f) => f.status === 'verified')
      setStatus(hasVerifiedTotp ? 'mfa_verify_required' : 'mfa_setup_required')
    } catch (error) {
      console.error('Erro ao validar sessão administrativa:', error)
      limparSessao(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error')
    } finally {
      setIsLoading(false)
    }
  }, [limparSessao])

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
          limparDadosDominioLocalStorage()
          await refreshSession()
          return { ok: true, user: data.user }
        }

        if (error) {
          return { ok: false, message: MESSAGES.invalidCredentials }
        }

        limparDadosDominioLocalStorage()
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
      // Remove a sessão local de versões anteriores, que não é mais usada para autorização
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
      limparDadosDominioLocalStorage()
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
      return { ok: false, message: MESSAGES.serviceUnavailable }
    }

    if (inFlightEnrollRef.current) {
      return inFlightEnrollRef.current
    }

    const enrollPromise = (async () => {
      try {
        // Limpa fatores TOTP 'unverified' pré-existentes para evitar acúmulo e violação da constraint unique
        try {
          const { data: factorsData } = await client.auth.mfa.listFactors()
          const unverifiedFactors = (factorsData?.totp || []).filter((f) => f.status === 'unverified')
          for (const factor of unverifiedFactors) {
            await client.auth.mfa.unenroll({ factorId: factor.id })
          }
        } catch (cleanupErr) {
          console.warn('[MFA] Aviso na limpeza de fatores pendentes:', cleanupErr)
        }

        const { data, error } = await client.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'Mecanica Gabriel',
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
      } finally {
        inFlightEnrollRef.current = null
      }
    })()

    inFlightEnrollRef.current = enrollPromise
    return enrollPromise
  }, [])

  const verifyMfa = useCallback(
    async (factorId, code) => {
      const cleanCode = (code || '').replace(/\D/g, '')
      if (cleanCode.length !== 6) {
        return { ok: false, message: 'O token TOTP deve conter exatamente 6 dígitos numéricos.' }
      }

      const client = getSupabaseAdminClient()
      if (!client) {
        return { ok: false, message: MESSAGES.serviceUnavailable }
      }

      try {
        let targetFactorId = factorId
        if (!targetFactorId) {
          const { data: factorsData, error: listError } = await client.auth.mfa.listFactors()
          if (listError) {
            return { ok: false, message: listError.message }
          }
          const verified = (factorsData?.totp || []).find((f) => f.status === 'verified')
          const candidate = verified || (factorsData?.totp || [])[0]
          if (!candidate) {
            return { ok: false, message: 'Nenhum fator MFA encontrado para verificação.' }
          }
          targetFactorId = candidate.id
        }

        const { data: challengeData, error: challengeError } = await client.auth.mfa.challenge({ factorId: targetFactorId })
        if (challengeError) {
          return { ok: false, message: challengeError.message }
        }

        const challengeId = challengeData.id
        const { data, error: verifyError } = await client.auth.mfa.verify({
          factorId: targetFactorId,
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
        return { ok: false, message: MESSAGES.serviceUnavailable }
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
  return isHorarioOperacional(new Date())
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

/**
 * Rota do dashboard padrão de cada papel — usado pelas páginas de MFA (configurar/verificar)
 * para redirecionar de volta ao portal correto após a etapa de segundo fator, já que o MFA
 * é obrigatório para admin, secretaria e mecânico (não só para o portal de gestão).
 */
export function caminhoDashboardPorPapel(role) {
  if (role === 'secretaria') return '/secretaria/dashboard'
  if (role === 'mecanico') return '/mecanico/dashboard'
  return '/gestao/dashboard'
}
