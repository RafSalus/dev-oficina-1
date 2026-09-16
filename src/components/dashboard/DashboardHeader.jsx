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
    <header className="h-16 px-6 bg-white border-b border-[#e4e7ec] flex items-center justify-between z-30 shrink-0 select-none">
      {/* Lado Esquerdo: Logo e Nome da Empresa */}
      <div className="flex items-center gap-3">
        <Link
          to="/gestao/dashboard"
          className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101828]"
        >
          <img
            src="/favicon-96x96.png"
            alt="Mecânica Gabriel"
            className="w-9 h-9 object-contain rounded-xl border border-[#e4e7ec] shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-[#101828] leading-tight">
              Mecânica Gabriel
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#667085]">
              Gestão de Oficina
            </span>
          </div>
        </Link>
      </div>

      {/* Lado Direito: Notificações e Perfil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ícone de Notificação */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev)
              setShowProfile(false)
            }}
            aria-label="Notificações"
            aria-expanded={showNotifications}
            className={`relative p-2.5 rounded-xl text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7] transition-all cursor-pointer ${
              showNotifications ? 'bg-[#f2f4f7] text-[#101828]' : ''
            }`}
          >
            <Bell size={20} weight="bold" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#101828] rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e4e7ec] py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-[#f2f4f7] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#475467]">
                  Notificações
                </span>
                <span className="text-[11px] font-semibold text-[#98a2b3]">
                  1 recente
                </span>
              </div>
              <div className="py-2">
                <div className="px-4 py-2.5 hover:bg-[#f9fafb] transition-colors flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#ecfdf3] text-[#027a48] mt-0.5 shrink-0">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#101828] leading-snug">
                      Sistema operacional ativo
                    </p>
                    <p className="text-[11px] text-[#667085] mt-0.5">
                      Banco de dados e serviços conectados com sucesso.
                    </p>
                    <span className="text-[10px] text-[#98a2b3] mt-1 block">
                      Agora
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ícone e Menu do Perfil */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfile((prev) => !prev)
              setShowNotifications(false)
            }}
            aria-label="Perfil do usuário"
            aria-expanded={showProfile}
            className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#e4e7ec] hover:border-[#d0d5dd] hover:bg-[#f9fafb] transition-all cursor-pointer ${
              showProfile ? 'border-[#d0d5dd] bg-[#f9fafb]' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <User size={18} weight="bold" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#101828] leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-medium text-[#667085] truncate max-w-[120px]">
                {userEmail}
              </span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e4e7ec] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#f2f4f7]">
                <p className="text-xs font-bold text-[#101828]">{userName}</p>
                <p className="text-[11px] text-[#667085] truncate">{userEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/gestao/configuracoes"
                  onClick={() => setShowProfile(false)}
                  className="w-full px-4 py-2 text-xs font-medium text-[#344054] hover:bg-[#f2f4f7] flex items-center gap-2.5 transition-colors"
                >
                  <GearSix size={16} />
                  <span>Configurações</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-xs font-semibold text-[#b42318] hover:bg-[#fef3f2] flex items-center gap-2.5 transition-colors text-left cursor-pointer"
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
