import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ManagementAuthLayout } from '../layouts/ManagementAuthLayout'
import { useAdminAuth } from '../context/AdminAuthContext'

export function GestaoAcessoNegadoPage() {
  const { signOut, status, user, forceRefreshSession } = useAdminAuth()
  const navigate = useNavigate()
  const [revalidando, setRevalidando] = useState(false)
  const [erroRevalidacao, setErroRevalidacao] = useState(null)

  const handleRevalidar = async () => {
    setRevalidando(true)
    setErroRevalidacao(null)
    try {
      const res = await forceRefreshSession()
      if (res.ok) {
        navigate('/gestao/dashboard', { replace: true })
      } else {
        setErroRevalidacao(res.message || 'Permissões ainda não atualizadas.')
      }
    } catch {
      setErroRevalidacao('Erro ao conectar ao servidor de autenticação.')
    } finally {
      setRevalidando(false)
    }
  }

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

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleRevalidar}
              disabled={revalidando || status === 'unconfigured'}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold h-13 rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {revalidando ? 'Verificando permissões...' : 'Revalidar permissões'}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={status === 'unconfigured'}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold h-13 rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 cursor-pointer"
            >
              Encerrar sessão
            </button>
          </div>

          {erroRevalidacao && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg text-center font-medium">
              {erroRevalidacao}
            </p>
          )}

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-xs text-gray-500 hover:text-brand-navy underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Voltar ao site
            </Link>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <span>🛠️ Modo Desenvolvedor</span>
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Conta <strong>{user?.email || 'atual'}</strong> conectada com sucesso no Supabase, mas sem papel <code>admin</code> em <code>app_metadata.role</code>.
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Execute no SQL Editor do Supabase ou via CLI:
              </p>
              <pre className="text-[10px] bg-amber-100/80 p-2 rounded text-amber-950 font-mono overflow-x-auto whitespace-pre-wrap select-all">
                {`UPDATE auth.users SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb WHERE email = '${user?.email || 'SEU_EMAIL'}';`}
              </pre>
            </div>
          )}
        </div>
      </main>
    </ManagementAuthLayout>
  )
}
