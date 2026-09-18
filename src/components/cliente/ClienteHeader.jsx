import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Bell,
  SignOut,
  PushPin,
  PushPinSlash,
  UserCircle,
  CaretDown,
  X,
  Phone,
  EnvelopeSimple,
  Car,
  MapPin,
  IdentificationCard,
} from '@phosphor-icons/react'
import { useCliente } from '../../context/ClienteContext'
import { toast } from 'sonner'

export function ClienteHeader({ isPinned = false, onTogglePin }) {
  const { clienteAtivo, logoutCliente } = useCliente()
  const navigate = useNavigate()
  const location = useLocation()

  const [isHovered, setIsHovered] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const leaveTimeoutRef = useRef(null)

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

  const handleLogout = () => {
    setShowProfile(false)
    setShowProfileModal(false)
    logoutCliente()
    navigate('/cliente/entrar')
  }

  // Notificações do cliente
  const notificacoes = [
    {
      id: 1,
      titulo: 'Orçamento Pronto para Aprovação',
      mensagem: 'Revisão preventiva e peças da OS #002908 aguardando sua autorização.',
      tempo: 'Há 10 min',
      tipo: 'orcamento',
    },
    {
      id: 2,
      titulo: 'Checklist de Entrada Realizado',
      mensagem: 'Vistoria fotográfica do Fiat Doblo 1.8 concluída na recepção.',
      tempo: 'Há 45 min',
      tipo: 'checklist',
    },
    {
      id: 3,
      titulo: 'Próxima Revisão Programada',
      mensagem: 'Alerta preventivo de troca de óleo e filtros recomendada.',
      tempo: 'Há 2 dias',
      tipo: 'alerta',
    },
  ]

  return (
    <>
      {/* Sensor de aproximação do mouse no topo da tela (quando não fixado) */}
      {!isPinned && (
        <div
          onMouseEnter={handleMouseEnter}
          className="fixed top-0 left-0 right-0 h-4 z-40 group flex justify-center items-start cursor-pointer pointer-events-auto"
          title="Passe o mouse para exibir o cabeçalho"
        >
          <div className="w-16 h-1 bg-[#0284c7]/40 rounded-b-full group-hover:h-1.5 group-hover:bg-[#0284c7] transition-all shadow-xs" />
        </div>
      )}

      {/* Cabeçalho do Cliente */}
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
        {/* Lado Esquerdo: Logo, Nome da Oficina e Portal do Cliente */}
        <div className="flex items-center gap-4">
          <Link
            to="/cliente/resumo"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101828]"
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284c7]">
                Portal do Cliente
              </span>
            </div>
          </Link>
        </div>

        {/* Lado Direito: Fixar, Notificações e Perfil do Cliente */}
        <div className="flex items-center gap-2">
          {/* Botão de Fixar/Desafixar Cabeçalho */}
          <button
            type="button"
            onClick={onTogglePin}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isPinned
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7]'
            }`}
            title={
              isPinned
                ? 'Cabeçalho fixado. Clique para ativar auto-ocultação ao afastar o mouse.'
                : 'Ativar fixação do cabeçalho.'
            }
          >
            {isPinned ? <PushPin size={18} weight="fill" /> : <PushPinSlash size={18} weight="bold" />}
          </button>

          {/* Botão de Notificações */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowProfile(false)
              }}
              className="p-2 text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] rounded-xl transition-colors relative cursor-pointer"
              title="Avisos do seu veículo"
            >
              <Bell size={20} weight="bold" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0284c7] rounded-full ring-2 ring-white animate-pulse" />
            </button>

            {/* Painel de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#d0d5dd] rounded-2xl shadow-xl z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 bg-[#f8fafc] border-b border-[#e4e7ec] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#101828]">Avisos do Veículo</span>
                    <span className="px-2 py-0.5 bg-[#0284c7] text-white rounded-full text-[10px] font-bold">
                      {notificacoes.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-[#667085] hover:text-[#101828] cursor-pointer"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto no-scrollbar divide-y divide-[#f2f4f7]">
                  {notificacoes.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-[#f8fafc] transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#101828]">{item.titulo}</span>
                        <span className="text-[10px] text-[#98a2b3] font-medium">{item.tempo}</span>
                      </div>
                      <p className="text-[11px] text-[#475467] leading-relaxed">{item.mensagem}</p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-[#f8fafc] border-t border-[#e4e7ec] text-center">
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Notificações marcadas como lidas.')
                      setShowNotifications(false)
                    }}
                    className="text-[11px] font-bold text-[#0284c7] hover:underline cursor-pointer"
                  >
                    Marcar todos como lidos
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#e4e7ec] hidden sm:block mx-0.5" />

          {/* Área Individual do Cliente: Nome, Perfil e Logout */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfile(!showProfile)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 p-1.5 px-2.5 hover:bg-[#f2f4f7] rounded-xl transition-colors cursor-pointer border border-[#e4e7ec]"
              title="Minha Conta"
            >
              <UserCircle size={22} weight="bold" className="text-[#0284c7] shrink-0" />
              <div className="hidden md:flex flex-col text-left mr-1">
                <span className="text-xs font-bold text-[#101828] leading-tight">
                  {clienteAtivo?.nome}
                </span>
                <span className="text-[10px] font-semibold text-[#667085] leading-tight">
                  Cliente
                </span>
              </div>
              <CaretDown
                size={14}
                weight="bold"
                className={`text-[#667085] transition-transform duration-200 ${
                  showProfile ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Menu Suspenso Individual: Perfil e Sair */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#d0d5dd] rounded-2xl shadow-xl z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                {/* Identificação do Cliente sem repetir o nome */}
                <div className="p-2.5 bg-[#f8fafc] rounded-xl border border-[#e4e7ec] mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] block">
                    CONTA DO CLIENTE
                  </span>
                  <span className="text-[11px] text-[#475467] block mt-0.5 truncate font-medium">
                    {clienteAtivo?.email}
                  </span>
                </div>

                {/* Opção Perfil */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false)
                    setShowProfileModal(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[#344054] hover:bg-[#f2f4f7] rounded-lg font-semibold transition-colors cursor-pointer text-left"
                >
                  <UserCircle size={18} weight="bold" className="text-[#0284c7]" />
                  <span>Meu Perfil</span>
                </button>

                <div className="border-t border-[#f2f4f7] my-1" />

                {/* Botão Sair da Conta */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition-colors cursor-pointer text-left"
                >
                  <SignOut size={18} weight="bold" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Perfil Detalhado do Cliente */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#d0d5dd] overflow-hidden">
            {/* Cabeçalho do Modal */}
            <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e4e7ec] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#101828]">
                <UserCircle size={20} weight="bold" className="text-[#0284c7]" />
                <span>Perfil do Cliente</span>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] cursor-pointer transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Conteúdo do Perfil */}
            <div className="p-6 space-y-5">
              {/* Header com Avatar e Status */}
              <div className="flex items-center gap-4">
                <UserCircle size={52} weight="bold" className="text-[#0284c7] shrink-0" />
                <div>
                  <h3 className="text-base font-extrabold text-[#101828] leading-tight">
                    {clienteAtivo?.nome}
                  </h3>
                  <p className="text-xs text-[#667085] font-semibold mt-0.5">
                    Cliente Cadastrado • Cód. {clienteAtivo?.codigoCliente || '0000161'}
                  </p>
                  <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sessão Individual Ativa
                  </div>
                </div>
              </div>

              {/* Informações detalhadas */}
              <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-xl divide-y divide-[#e4e7ec] text-xs">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-[#667085] font-medium flex items-center gap-2">
                    <IdentificationCard size={15} className="text-[#0284c7]" /> CPF / Documento
                  </span>
                  <span className="font-bold text-[#101828]">
                    {clienteAtivo?.documento}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-[#667085] font-medium flex items-center gap-2">
                    <EnvelopeSimple size={15} className="text-[#0284c7]" /> E-mail
                  </span>
                  <span className="font-semibold text-[#101828] text-right truncate max-w-[200px]">
                    {clienteAtivo?.email}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-[#667085] font-medium flex items-center gap-2">
                    <Phone size={15} className="text-[#0284c7]" /> Telefone
                  </span>
                  <span className="font-bold text-[#101828]">
                    {clienteAtivo?.telefone}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-[#667085] font-medium flex items-center gap-2">
                    <Car size={15} className="text-[#0284c7]" /> Veículo Principal
                  </span>
                  <span className="font-semibold text-[#101828] text-right truncate max-w-[180px]">
                    {clienteAtivo?.veiculos?.[0]?.marcaModelo || 'Nenhum'}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-[#667085] font-medium flex items-center gap-2">
                    <MapPin size={15} className="text-[#0284c7]" /> Endereço
                  </span>
                  <span className="font-semibold text-[#101828] text-right truncate max-w-[200px]">
                    {clienteAtivo?.cidade || 'Apucarana'} - {clienteAtivo?.uf || 'PR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal com Ações */}
            <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e4e7ec] flex items-center justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <SignOut size={16} weight="bold" />
                <span>Sair da Conta</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-[#101828] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
