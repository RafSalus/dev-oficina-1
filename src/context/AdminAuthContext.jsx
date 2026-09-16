import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getSupabaseAdminClient, isSupabaseConfigured } from '../lib/supabase'
import { MESSAGES } from '../constants/company'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [status, setStatus] = useState(() => (isSupabaseConfigured ? 'unauthenticated' : 'unconfigured'))
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const mfaPendingRef = useRef(null)

  const refreshSession = useCallback(async () => {
    const client = getSupabaseAdminClient()
    if (!client) {
      setUser(null)
      setRole(null)
      setStatus('unconfigured')
      return
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('offline')
      return
    }

    try {
      const { data, error } = await client.auth.getSession()
      if (error || !data?.session) {
        setUser(null)
        setRole(null)
        setStatus('unauthenticated')
        return
      }

      const currentUser = data.session.user
      setUser(currentUser)
      setRole(currentUser.user_metadata?.role || currentUser.role || 'admin')

      // Check MFA level
      const { data: aalData } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aalData?.currentLevel === 'aal2') {
        setStatus('aal2')
      } else if (aalData?.nextLevel === 'aal2') {
        setStatus('mfa_verify_required')
      } else {
        setStatus('aal2')
      }
    } catch {
      setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error')
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
      const client = getSupabaseAdminClient()
      if (!client) {
        return {
          ok: false,
          message: 'A autenticação administrativa ainda não está disponível neste ambiente.',
        }
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password })
        if (error) {
          return { ok: false, message: MESSAGES.invalidCredentials }
        }

        await refreshSession()
        return { ok: true, user: data.user }
      } catch {
        return { ok: false, message: MESSAGES.serviceUnavailable }
      }
    },
    [refreshSession]
  )

  const signOut = useCallback(async () => {
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

  const value = useMemo(
    () => ({
      status,
      user,
      role,
      isRealSession: status === 'aal2',
      refresh: refreshSession,
      signIn,
      signOut,
      requestRecovery,
      updatePassword,
    }),
    [status, user, role, refreshSession, signIn, signOut, requestRecovery, updatePassword]
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
