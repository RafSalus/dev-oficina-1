import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key } from '@phosphor-icons/react'
import { ManagementAuthLayout } from '../layouts/ManagementAuthLayout'
import { useAdminAuth, caminhoDashboardPorPapel } from '../context/AdminAuthContext'
import { MESSAGES } from '../constants/company'

// Destino do link de e-mail do Supabase (type=recovery, enviado por requestRecovery, e
// type=invite, enviado pela Edge Function criar-login-funcionario ao provisionar um novo
// colaborador). Em ambos os casos o Supabase já autentica o navegador com uma sessão
// temporária ao abrir o link (detectSessionInUrl: true em src/lib/supabase.js) — esta tela
// só precisa coletar a nova senha e confirmar via updatePassword().
export function GestaoRedefinirSenhaPage() {
  const { updatePassword, isLoading, status, role, signOut } = useAdminAuth()
  const navigate = useNavigate()

  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!isLoading && status !== 'aal2' && status !== 'mfa_setup_required' && status !== 'mfa_verify_required') {
      // Sem sessão de recovery/invite ativa — link inválido, expirado ou já utilizado.
      setErro('Este link de acesso é inválido ou já expirou. Solicite um novo convite ou recuperação de senha.')
    }
  }, [isLoading, status])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setErro(null)

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      const resultado = await updatePassword(senha)
      if (resultado.ok) {
        setSucesso(true)
        setTimeout(() => {
          navigate(caminhoDashboardPorPapel(role), { replace: true })
        }, 1500)
      } else {
        setErro(resultado.message || MESSAGES.serviceUnavailable)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ManagementAuthLayout>
      <main className="w-full max-w-md mx-auto px-4 sm:px-6 my-auto py-6">
        <div className="bg-white border border-gray-100/90 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-brand-blue transition-all p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-[#0284c7] shrink-0">
              <Key size={26} weight="duotone" />
            </div>
            <div>
              <span aria-hidden="true" className="block w-8 h-1 bg-brand-blue rounded-full mb-1" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
                Definir sua senha
              </h1>
            </div>
          </div>

          {sucesso ? (
            <p role="status" className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs font-medium text-emerald-700">
              Senha definida com sucesso! Redirecionando para o seu painel...
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                Crie a senha de acesso à sua conta. Use pelo menos 8 caracteres.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="nova-senha" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Nova senha
                  </label>
                  <input
                    id="nova-senha"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-transparent focus:border-brand-blue rounded-xl px-4 h-13 text-sm font-medium text-black placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmar-senha" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Confirmar senha
                  </label>
                  <input
                    id="confirmar-senha"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-transparent focus:border-brand-blue rounded-xl px-4 h-13 text-sm font-medium text-black placeholder-gray-400 focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full bg-gray-900 hover:bg-black text-white font-bold h-13 rounded-xl shadow-xs transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Salvando...' : 'Salvar senha e continuar'}
              </button>

              {erro && (
                <p role="alert" className="mt-5 bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs font-medium text-red-700">
                  {erro}
                </p>
              )}

              <button
                type="button"
                onClick={async () => {
                  await signOut()
                  navigate('/gestao/entrar', { replace: true })
                }}
                className="mt-4 w-full text-center text-xs font-semibold text-gray-500 hover:text-brand-navy underline-offset-2 hover:underline cursor-pointer"
              >
                Cancelar e voltar ao login
              </button>
            </form>
          )}
        </div>
      </main>
    </ManagementAuthLayout>
  )
}
