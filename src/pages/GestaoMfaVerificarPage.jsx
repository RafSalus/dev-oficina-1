import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Key, SignOut } from '@phosphor-icons/react'
import { IMaskInput } from 'react-imask'
import { ManagementAuthLayout } from '../layouts/ManagementAuthLayout'
import { useAdminAuth } from '../context/AdminAuthContext'
import { toast } from 'sonner'

export function GestaoMfaVerificarPage() {
  const { verifyMfa, signOut, status } = useAdminAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [totpCode, setTotpCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const returnUrl = searchParams.get('returnUrl')

  useEffect(() => {
    if (status === 'aal2') {
      navigate(returnUrl || '/gestao/dashboard', { replace: true })
    }
  }, [status, navigate, returnUrl])

  const handleVerify = async (e) => {
    if (e) e.preventDefault()
    const clean = totpCode.replace(/\D/g, '')
    if (clean.length !== 6) {
      toast.error('Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.')
      return
    }

    setSubmitting(true)
    try {
      const res = await verifyMfa(null, clean)
      if (res.ok) {
        toast.success('Autenticação confirmada com sucesso!')
        navigate(returnUrl || '/gestao/dashboard', { replace: true })
      } else {
        toast.error(res.message || 'Código de verificação incorreto ou expirado.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ManagementAuthLayout>
      <main className="w-full max-w-md mx-auto px-4 sm:px-6 my-auto py-6 overflow-hidden">
        <div className="bg-white border border-gray-100/90 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-brand-blue transition-all p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-[#0284c7] shrink-0">
              <Key size={28} weight="duotone" />
            </div>
            <div>
              <span aria-hidden="true" className="block w-8 h-1 bg-brand-blue rounded-full mb-1" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
                Verificação em Duas Etapas
              </h1>
            </div>
          </div>

          <p className="text-xs text-[#475467] leading-relaxed mb-6">
            Digite o código numérico temporário de 6 dígitos exibido no aplicativo autenticador do seu dispositivo.
          </p>

          <form onSubmit={handleVerify} noValidate>
            <div className="mb-6">
              <label
                htmlFor="totp-challenge"
                className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider text-center"
              >
                Código Autenticador (TOTP)
              </label>
              <IMaskInput
                id="totp-challenge"
                name="totp-challenge"
                mask="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onAccept={(val) => {
                  setTotpCode(val)
                  // Auto-submit ao digitar o 6º dígito
                  const clean = val.replace(/\D/g, '')
                  if (clean.length === 6 && !submitting) {
                    setTimeout(() => {
                      const form = document.querySelector('form')
                      if (form) form.requestSubmit()
                    }, 50)
                  }
                }}
                placeholder="000000"
                autoFocus
                className="w-full h-14 text-center tracking-[0.4em] font-mono text-2xl font-bold bg-[#f8fafc] focus:bg-white border-2 border-[#d0d5dd] focus:border-[#0284c7] rounded-xl text-[#101828] focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-[0.99] text-xs font-bold text-white transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Validando token...' : 'Confirmar Acesso'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  await signOut()
                  navigate('/gestao/entrar', { replace: true })
                }}
                className="w-full h-10 px-4 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#344054] bg-white hover:bg-[#f8fafc] transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0284c7] cursor-pointer"
              >
                <SignOut size={16} />
                Encerrar Sessão
              </button>
            </div>
          </form>
        </div>
      </main>
    </ManagementAuthLayout>
  )
}
