import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, User, SignOut, GearSix, CheckCircle } from '@phosphor-icons/react'
import { useAdminAuth } from '../../context/AdminAuthContext'

export function DashboardHeader() {
  const { user, signOut } = useAdminAuth()
  const navigate = useNavigate()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/gestao/entrar', { replace: true })
  }

  const userEmail = user?.email || 'admin@mecanicagabriel.com.br'
  const userName = user?.user_metadata?.name || 'Administrador'

  return (
    <header className="h-16 px-5 sm:px-8 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between z-30 shrink-0">
      {/* Left: Brand logo and company name */}
      <div className="flex items-center gap-3">
        <Link
          to="/gestao/dashboard"
          className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          <img
            src="/favicon-96x96.png"
            alt="Mecânica Gabriel"
            className="w-9 h-9 object-contain rounded-lg shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-zinc-900 leading-tight">
              Mecânica Gabriel
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
              Painel de Controle
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Notifications & User profile */}
      <div className="flex items-center gap-3">
        {/* Notification button and popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev)
              setShowProfile(false)
            }}
            aria-label="Notificações"
            aria-expanded={showNotifications}
            className={`relative p-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all cursor-pointer ${
              showNotifications ? 'bg-zinc-100 text-zinc-900' : ''
            }`}
          >
            <Bell size={20} weight="bold" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-zinc-900 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Notificações
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">
                  1 nova
                </span>
              </div>
              <div className="py-2">
                <div className="px-4 py-2.5 hover:bg-zinc-50 transition-colors flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5 shrink-0">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 leading-snug">
                      Sistema operacional ativo
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Banco de dados e serviços conectados com sucesso.
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Agora há pouco
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfile((prev) => !prev)
              setShowNotifications(false)
            }}
            aria-label="Menu do usuário"
            aria-expanded={showProfile}
            className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer ${
              showProfile ? 'border-zinc-300 bg-zinc-50' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <User size={18} weight="bold" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-zinc-900 leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-medium text-zinc-500 truncate max-w-[120px]">
                {userEmail}
              </span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-zinc-100">
                <p className="text-xs font-bold text-zinc-900">{userName}</p>
                <p className="text-[11px] text-zinc-500 truncate">{userEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/gestao/configuracoes"
                  onClick={() => setShowProfile(false)}
                  className="w-full px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 flex items-center gap-2.5 transition-colors"
                >
                  <GearSix size={16} />
                  <span>Configurações</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                >
                  <SignOut size={16} />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
