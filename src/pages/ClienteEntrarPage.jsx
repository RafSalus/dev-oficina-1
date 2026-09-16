import React, { useState } from 'react'
import { Eye, EyeSlash, WhatsappLogo } from '@phosphor-icons/react'
import { CustomerAuthLayout } from '../layouts/CustomerAuthLayout'
import { WHATSAPP_ACCESS, MESSAGES } from '../constants/company'

function PasswordInput({ id, label, autoComplete, value, onChange, error }) {
  const [show, setShow] = useState(false)
  const errorId = `${id}-erro`

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-transparent focus:border-brand-blue rounded-xl px-4 h-13 text-sm font-medium text-black placeholder-gray-400 focus:outline-none transition-all ${
            error ? 'border-red-500' : ''
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black cursor-pointer"
        >
          {show ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

function CustomerLoginForm({ onRequestRecovery }) {
  const [submitted, setSubmitted] = useState(false)
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!cpfCnpj.trim()) newErrors.cpfCnpj = MESSAGES.cpfCnpjRequired
    if (!password) newErrors.password = MESSAGES.passwordRequired

    setErrors(newErrors)
    if (!newErrors.cpfCnpj && !newErrors.password) {
      setSubmitted(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
        Acessar conta
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 mb-6">
        Entre para acompanhar informações do seu veículo.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="cpf-cnpj"
            className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider"
          >
            CPF ou CNPJ
          </label>
          <input
            id="cpf-cnpj"
            name="cpf-cnpj"
            type="text"
            inputMode="text"
            autoComplete="username"
            value={cpfCnpj}
            aria-invalid={!!errors.cpfCnpj}
            aria-describedby={errors.cpfCnpj ? 'cpf-cnpj-erro' : undefined}
            onChange={(e) => {
              setCpfCnpj(e.target.value)
              if (errors.cpfCnpj) setErrors((prev) => ({ ...prev, cpfCnpj: undefined }))
            }}
            className={`w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-transparent focus:border-brand-blue rounded-xl px-4 h-13 text-sm font-medium text-black placeholder-gray-400 focus:outline-none transition-all ${
              errors.cpfCnpj ? 'border-red-500' : ''
            }`}
            placeholder="000.000.000-00"
          />
          {errors.cpfCnpj && (
            <p id="cpf-cnpj-erro" className="mt-1.5 text-xs font-medium text-red-600">
              {errors.cpfCnpj}
            </p>
          )}
        </div>

        <PasswordInput
          id="customer-senha"
          label="Senha"
          autoComplete="current-password"
          value={password}
          onChange={(val) => {
            setPassword(val)
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
          }}
          error={errors.password}
        />
      </div>

      <button
        type="submit"
        className="mt-7 w-full bg-gray-900 hover:bg-black text-white font-bold h-13 rounded-xl shadow-xs transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black cursor-pointer"
      >
        Acessar Painel
      </button>

      <div className="mt-3 text-right">
        <button
          type="button"
          onClick={onRequestRecovery}
          className="text-xs font-semibold text-gray-500 hover:text-brand-navy underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue cursor-pointer"
        >
          Esqueci minha senha
        </button>
      </div>

      {submitted && (
        <p
          id="acesso-painel-aviso"
          role="status"
          className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600"
        >
          {MESSAGES.plannedNotice}
        </p>
      )}
    </form>
  )
}

function CustomerRecoveryForm({ onBack }) {
  const [submitted, setSubmitted] = useState(false)
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cpfCnpj.trim()) {
      setError(MESSAGES.cpfCnpjRequired)
      return
    }
    setError(null)
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-full mb-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black cursor-pointer"
      >
        ← Voltar
      </button>

      <span aria-hidden="true" className="block w-10 h-1 bg-brand-blue rounded-full mb-3" />
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
        Recuperar senha
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 mb-6">
        Informe seu CPF ou CNPJ para iniciar a recuperação de acesso.
      </p>

      <div>
        <label
          htmlFor="recuperar-cpf-cnpj"
          className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider"
        >
          CPF ou CNPJ
        </label>
        <input
          id="recuperar-cpf-cnpj"
          name="recuperar-cpf-cnpj"
          type="text"
          inputMode="text"
          autoComplete="username"
          value={cpfCnpj}
          aria-invalid={!!error}
          aria-describedby={error ? 'recuperar-cpf-cnpj-erro' : undefined}
          onChange={(e) => {
            setCpfCnpj(e.target.value)
            if (error) setError(null)
          }}
          className={`w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-transparent focus:border-brand-blue rounded-xl px-4 h-13 text-sm font-medium text-black placeholder-gray-400 focus:outline-none transition-all ${
            error ? 'border-red-500' : ''
          }`}
          placeholder="000.000.000-00"
        />
        {error && (
          <p id="recuperar-cpf-cnpj-erro" className="mt-1.5 text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-gray-900 hover:bg-black text-white font-bold h-13 rounded-xl shadow-xs transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black cursor-pointer"
      >
        Recuperar Acesso
      </button>

      {submitted && (
        <p
          id="recuperar-aviso"
          role="status"
          className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600"
        >
          {MESSAGES.recoveryPlanned}
        </p>
      )}
    </form>
  )
}

export function ClienteEntrarPage() {
  const [view, setView] = useState('login')

  return (
    <div className="min-h-dvh bg-white">
      <CustomerAuthLayout>
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 my-auto py-6">
          <div className="bg-white border border-gray-100/90 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-brand-blue transition-all">
            <div className="p-6 sm:p-8">
              {view === 'login' ? (
                <CustomerLoginForm onRequestRecovery={() => setView('recovery')} />
              ) : (
                <CustomerRecoveryForm onBack={() => setView('login')} />
              )}
            </div>

            <div className="px-6 sm:px-8 py-5 bg-gray-50/70 border-t border-gray-100 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ainda não tem acesso?
              </p>
              <a
                href={WHATSAPP_ACCESS.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200/70 transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue min-h-[44px]"
              >
                <WhatsappLogo size={18} weight="fill" className="text-[#25D366] shrink-0" aria-hidden="true" />
                <span>{WHATSAPP_ACCESS.label}</span>
              </a>
            </div>
          </div>
        </div>
      </CustomerAuthLayout>
    </div>
  )
}
