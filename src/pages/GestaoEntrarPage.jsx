import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeSlash, Wrench, User } from '@phosphor-icons/react'
import { ManagementAuthLayout } from '../layouts/ManagementAuthLayout'
import { useAdminAuth } from '../context/AdminAuthContext'
import { MESSAGES } from '../constants/company'

function validateLoginForm(email, password) {
  const errors = {}
  const trimmed = email.trim()
  if (!trimmed) {
    errors.email = MESSAGES.emailRequired
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    errors.email = MESSAGES.emailInvalid
  }

  if (!password) {
    errors.password = MESSAGES.passwordRequired
  }
  return errors
}

export function GestaoEntrarPage() {
  const { status, signIn } = useAdminAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [infoNotice, setInfoNotice] = useState(null)

  const alertRef = useRef(null)
  const returnUrl = searchParams.get('returnUrl')

  useEffect(() => {
    if (status === 'aal2') {
      navigate(returnUrl || '/gestao/dashboard', { replace: true })
      return
    }
    if (status === 'mfa_setup_required') {
      navigate('/gestao/mfa/configurar', { replace: true })
      return
    }
    if (status === 'mfa_verify_required') {
      navigate('/gestao/mfa/verificar', { replace: true })
      return
    }
    if (status === 'disabled' || status === 'role_missing' || status === 'denied') {
      navigate('/gestao/acesso-negado', { replace: true })
    }
  }, [status, navigate, returnUrl])

  useEffect(() => {
    if (formError && alertRef.current) {
      alertRef.current.focus()
    }
  }, [formError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    const validation = validateLoginForm(email, password)
    setErrors(validation)
    setFormError(null)
    setInfoNotice(null)

    if (validation.email || validation.password) return

    setSubmitting(true)
    try {
      const result = await signIn(email, password)
      if (!result.ok) {
        if (
          result.message ===
          'A autenticação administrativa ainda não está disponível neste ambiente.'
        ) {
          setInfoNotice(result.message)
        } else {
          setFormError(result.message || MESSAGES.invalidCredentials)
        }
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
              Acesso ao sistema
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Entre com seu e-mail e senha administrativos.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="gestao-email"
                  className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider"
                >
                  E-mail
                </label>
                <input
                  id="gestao-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'gestao-email-erro' : undefined}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  className={`w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-transparent focus:border-brand-blue rounded-xl px-4 h-13 text-sm font-medium text-black placeholder-gray-400 focus:outline-none transition-all ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="admin@mecanicagabriel.com.br"
                />
                {errors.email && (
                  <p id="gestao-email-erro" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="gestao-senha"
                  className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="gestao-senha"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'gestao-senha-erro' : undefined}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    className={`w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-transparent focus:border-brand-blue rounded-xl px-4 h-13 text-sm font-medium text-black placeholder-gray-400 focus:outline-none transition-all ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black cursor-pointer"
                  >
                    {showPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="gestao-senha-erro" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 w-full bg-gray-900 hover:bg-black text-white font-bold h-13 rounded-xl shadow-xs transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? 'Entrando...' : 'Entrar no sistema'}
            </button>

            {/* Acesso Direto para Secretaria ou Mecânico */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  OU ACESSOS DA EQUIPE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate('/secretaria/dashboard')}
                className="bg-[#f8fafc] hover:bg-[#f2f4f7] border border-[#0284c7]/40 hover:border-[#0284c7] text-[#0284c7] font-bold h-11 rounded-xl shadow-2xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 text-xs"
              >
                <User size={16} weight="bold" />
                <span>Entrar Secretaria</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/mecanico/dashboard')}
                className="bg-[#f8fafc] hover:bg-[#f2f4f7] border border-zinc-300 hover:border-zinc-500 text-zinc-800 font-bold h-11 rounded-xl shadow-2xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 text-xs"
              >
                <Wrench size={16} weight="bold" />
                <span>Entrar Mecânico</span>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <Link
                to="/gestao/recuperar-senha"
                className="font-semibold text-gray-500 hover:text-brand-navy underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                Esqueci minha senha
              </Link>
              <Link
                to="/"
                className="text-gray-400 hover:text-black underline-offset-2 hover:underline"
              >
                Voltar ao site
              </Link>
            </div>

            {formError && (
              <p
                ref={alertRef}
                role="alert"
                tabIndex={-1}
                className="mt-5 bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs font-medium text-red-700 outline-none"
              >
                {formError}
              </p>
            )}

            {infoNotice && (
              <p
                role="status"
                className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs font-medium text-amber-800"
              >
                {infoNotice}
              </p>
            )}
          </form>
        </div>
      </main>
    </ManagementAuthLayout>
  )
}
