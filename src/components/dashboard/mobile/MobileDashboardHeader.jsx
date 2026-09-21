import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, User, SignOut, GearSix, CheckCircle } from '@phosphor-icons/react'
import { useAdminAuth } from '../../../context/AdminAuthContext'

export function MobileDashboardHeader() {
  const { user, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/gestao/entrar', { replace: true })
  }

  const userName = user?.user_metadata?.name || user?.user_metadata?.nome || 'Administrador'
  const userEmail = user?.email || 'admin@mecanicagabriel.com.br'

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#e4e7ec] select-none"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/favicon-96x96.png"
            alt="Mecânica Gabriel"
            className="w-8 h-8 object-contain rounded-lg border border-[#e4e7ec] shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold tracking-tight text-[#101828] leading-tight truncate">
              Mecânica Gabriel
            </span>
            <span className="text-[9px] font-semibold tracking-wider uppercase text-[#667085]">
              Gestão de Oficina
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((prev) => !prev)
                setShowProfile(false)
              }}
              aria-label="Notificações"
              className={`relative p-2 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors ${
                showNotifications ? 'bg-[#f2f4f7] text-[#101828]' : ''
              }`}
            >
              <Bell size={20} weight="bold" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0284c7] rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e4e7ec] py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 pb-2 border-b border-[#f2f4f7] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475467]">
                    Notificações
                  </span>
                  <span className="text-[11px] font-semibold text-[#98a2b3]">1 recente</span>
                </div>
                <div className="px-4 py-2.5 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#e0f2fe] text-[#0284c7] mt-0.5 shrink-0">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#101828] leading-snug">
                      Sistema operacional ativo
                    </p>
                    <p className="text-[11px] text-[#667085] mt-0.5">
                      Banco de dados e serviços conectados com sucesso.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfile((prev) => !prev)
                setShowNotifications(false)
              }}
              aria-label="Perfil do usuário"
              className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0"
            >
              <User size={17} weight="bold" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e4e7ec] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-[#f2f4f7]">
                  <p className="text-xs font-bold text-[#101828]">{userName}</p>
                  <p className="text-[11px] text-[#667085] truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfile(false)
                      navigate('/gestao/configuracoes')
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-[#344054] active:bg-[#f2f4f7] flex items-center gap-2.5 transition-colors"
                  >
                    <GearSix size={16} />
                    <span>Configurações</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-xs font-semibold text-[#b42318] active:bg-[#fef3f2] flex items-center gap-2.5 transition-colors text-left"
                  >
                    <SignOut size={16} />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
