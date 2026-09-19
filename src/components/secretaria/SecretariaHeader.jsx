import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Bell,
  User,
  SignOut,
  GearSix,
  CheckCircle,
  X,
  PushPin,
  PushPinSlash,
  FloppyDisk,
} from '@phosphor-icons/react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { toast } from 'sonner'

export function SecretariaHeader({ isPinned = false, onTogglePin }) {
  const { user, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isHovered, setIsHovered] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const leaveTimeoutRef = useRef(null)

  // Verifica se estamos na tela de abertura de Nova OS ou listagem
  const isOsNovaPage = location.pathname.includes('/ordem-de-servico/nova')
  const isOsListPage =
    location.pathname.includes('/ordem-de-servico') || location.pathname.includes('/orcamento')

  // Controle de visibilidade
  const isHeaderVisible = isPinned || isHovered || showNotifications || showProfile

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 250)
  }

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setShowNotifications(false)
    setShowProfile(false)
  }, [location.pathname])

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
    setShowProfile(false)
    await signOut()
    toast.info('Sessão da secretaria finalizada.')
    navigate('/gestao/entrar')
  }

  const userName = user?.user_metadata?.nome || 'Secretaria'
  const userEmail = user?.email || 'secretaria@mecanicagabriel.com.br'

  return (
    <>
      {/* Sensor de aproximação do mouse no topo (quando não fixado) */}
      {!isPinned && (
        <div
          onMouseEnter={handleMouseEnter}
          className="fixed top-0 left-0 right-0 h-4 z-40 group flex justify-center items-start cursor-pointer pointer-events-auto"
          title="Passe o mouse para exibir o cabeçalho"
        >
          <div className="w-16 h-1 bg-[#101828]/30 rounded-b-full group-hover:h-1.5 group-hover:bg-[#101828] transition-all shadow-xs" />
        </div>
      )}

      {/* Cabeçalho da Secretaria */}
      <header
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={
          isPinned
            ? 'h-16 px-6 bg-white border-b border-[#d0d5dd] flex items-center justify-between z-30 shrink-0 select-none transition-all duration-200'
            : `fixed top-0 left-0 right-0 h-16 px-6 bg-white border-b border-[#d0d5dd] flex items-center justify-between z-50 select-none shadow-xl transition-all duration-300 ease-out ${
                isHeaderVisible
                  ? 'translate-y-0 opacity-100 pointer-events-auto'
                  : '-translate-y-full opacity-0 pointer-events-none'
              }`
        }
      >
        {/* Lado Esquerdo: Logo e Identificação da Secretaria */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/secretaria/dashboard"
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
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#0284c7]">
                Secretaria e Recepção
              </span>
            </div>
          </Link>

          {isOsNovaPage && (
            <div className="hidden sm:flex items-center gap-2 pl-3 sm:pl-4 border-l border-[#e4e7ec] animate-in fade-in duration-200">
              <span className="text-xs font-semibold text-[#667085]">Ordem de Serviço</span>
              <span className="text-xs text-[#98a2b3]">/</span>
              <span className="text-xs font-bold text-[#101828]">Nova OS</span>
            </div>
          )}

          {isOsListPage && (
            <div className="hidden sm:flex items-center gap-2 pl-3 sm:pl-4 border-l border-[#e4e7ec] animate-in fade-in duration-200">
              <span className="text-xs font-semibold text-[#667085]">Operações</span>
              <span className="text-xs text-[#98a2b3]">/</span>
              <span className="text-xs font-bold text-[#101828]">
                {location.pathname.includes('orcamento') ? 'Orçamento' : 'Ordem de Serviço'}
              </span>
            </div>
          )}
        </div>

        {/* Lado Direito: Ações Contextuais + Notificações e Perfil */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botões Contextuais na tela de abertura de Nova OS */}
          {isOsNovaPage && (
            <div className="flex items-center gap-2 sm:gap-2.5 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('dev_oficina_draft_os')
                  } catch (e) {}
                  toast.info('Abertura de Ordem de Serviço cancelada.')
                  navigate('/secretaria/ordem-de-servico')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white hover:bg-[#fef3f2] text-[#475467] hover:text-[#b42318] border border-[#d0d5dd] hover:border-[#fecdca] text-xs font-semibold rounded-xl shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <X size={14} weight="bold" />
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                form="form-nova-os"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <FloppyDisk size={14} weight="bold" />
                <span>Salvar OS</span>
              </button>
              <div className="h-5 w-px bg-[#e4e7ec]" />
            </div>
          )}

          {/* Botão de Fixar / Desafixar Cabeçalho */}
          <div className="flex items-center gap-2">
            {onTogglePin && (
              <button
                type="button"
                onClick={() => {
                  onTogglePin()
                  if (isPinned) {
                    toast.info('Cabeçalho em modo automático (oculta ao afastar o mouse).')
                  } else {
                    toast.success('Cabeçalho fixado no topo.')
                  }
                }}
                aria-label={isPinned ? 'Desafixar cabeçalho (ocultar automaticamente)' : 'Fixar cabeçalho no topo'}
                title={
                  isPinned
                    ? 'Cabeçalho fixado. Clique para ativar auto-ocultação ao afastar o mouse.'
                    : 'Ativar fixação do cabeçalho.'
                }
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isPinned
                    ? 'bg-[#101828] text-white shadow-xs'
                    : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7]'
                }`}
              >
                {isPinned ? (
                  <PushPin size={18} weight="fill" />
                ) : (
                  <PushPinSlash size={18} weight="bold" />
                )}
              </button>
            )}
          </div>

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
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#0284c7] rounded-full ring-2 ring-white" />
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
                      <span className="text-[10px] text-[#98a2b3] mt-1 block">
                        Agora
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ícone e Menu do Perfil da Secretaria */}
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
              <div className="w-8 h-8 rounded-lg bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
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
    </>
  )
}
