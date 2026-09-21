import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ManagementAuthLayout } from '../layouts/ManagementAuthLayout'
import { useAdminAuth } from '../context/AdminAuthContext'
import { MESSAGES } from '../constants/company'

export function GestaoRecuperarSenhaPage() {
  const { requestRecovery } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorNotice, setErrorNotice] = useState(null)
  const [emailError, setEmailError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    const trimmed = email.trim()
    setEmailError(null)
    setErrorNotice(null)
    setSuccess(false)

    if (!trimmed) {
      setEmailError(MESSAGES.emailRequired)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError(MESSAGES.emailInvalid)
      return
    }

    setSubmitting(true)
    try {
      const result = await requestRecovery(trimmed)
      if (result.ok) {
        setSuccess(true)
      } else {
        setErrorNotice(result.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ManagementAuthLayout>
      <main className="w-full max-w-md mx-auto px-4 sm:px-6 my-auto py-6">
        <div className="bg-white border border-gray-100/90 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-brand-blue transition-all p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            <span aria-hidden="true" className="block w-10 h-1 bg-brand-blue rounded-full mb-3" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
              Recuperar senha
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Informe seu e-mail administrativo para iniciar a recuperação de acesso.
            </p>

            <div>
              <label
                htmlFor="gestao-recovery-email"
                className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider"
              >
                E-mail
              </label>
              <input
                id="gestao-recovery-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'gestao-recovery-email-erro' : undefined}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError(null)
                }}
                className={`w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-transparent focus:border-brand-blue rounded-xl px-4 h-13 text-sm font-medium text-black placeholder-gray-400 focus:outline-none transition-all ${
                  emailError ? 'border-red-500' : ''
                }`}
                placeholder="admin@mecanicagabriel.com.br"
              />
              {emailError && (
                <p id="gestao-recovery-email-erro" className="mt-1.5 text-xs font-medium text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-gray-900 hover:bg-black text-white font-bold h-13 rounded-xl shadow-xs transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Enviando...' : 'Enviar instruções'}
            </button>

            <div className="mt-4 flex items-center justify-between text-xs">
              <Link
                to="/gestao/entrar"
                className="font-semibold text-gray-500 hover:text-brand-navy underline-offset-2 hover:underline"
              >
                ← Voltar para o login
              </Link>
              <Link to="/" className="text-gray-400 hover:text-black underline-offset-2 hover:underline">
                Voltar ao site
              </Link>
            </div>

            {success && (
              <p
                role="status"
                className="mt-5 bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs font-medium text-[#0284c7]"
              >
                {MESSAGES.recoveryInstructions}
              </p>
            )}

            {errorNotice && (
              <p
                role="alert"
                className="mt-5 bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs font-medium text-red-700"
              >
                {errorNotice}
              </p>
            )}
          </form>
        </div>
      </main>
    </ManagementAuthLayout>
  )
}
