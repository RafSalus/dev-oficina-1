import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ManagementAuthLayout } from '../layouts/ManagementAuthLayout'
import { useAdminAuth } from '../context/AdminAuthContext'

export function GestaoAcessoNegadoPage() {
  const { signOut, status } = useAdminAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/gestao/entrar', { replace: true })
  }

  return (
    <ManagementAuthLayout>
      <main className="w-full max-w-md mx-auto px-4 sm:px-6 my-auto py-6">
        <div className="bg-white border border-gray-100/90 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-brand-blue transition-all p-6 sm:p-8">
          <span aria-hidden="true" className="block w-10 h-1 bg-brand-blue rounded-full mb-3" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
            Acesso não autorizado
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Sua conta não possui permissões administrativas para acessar o painel de gestão.
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={status === 'unconfigured'}
            className="w-full bg-black text-white font-semibold h-13 rounded-xl hover:bg-black/85 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 cursor-pointer"
          >
            Encerrar sessão
          </button>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-xs text-gray-500 hover:text-brand-navy underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
      </main>
    </ManagementAuthLayout>
  )
}
