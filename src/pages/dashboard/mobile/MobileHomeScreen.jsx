import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ClipboardText,
  CreditCard,
  Garage,
  CalendarDots,
  Plus,
  Users,
  CarProfile,
  Package,
  ArrowsLeftRight,
  GearSix,
  DownloadSimple,
  ShareNetwork,
  X,
  CaretRight,
  Clock,
} from '@phosphor-icons/react'
import { useAdminAuth } from '../../../context/AdminAuthContext'
import { usePwaInstall } from '../../../hooks/usePwaInstall'
import { MOCK_CLIENTES_VEICULOS } from '../../../constants/mockClientesVeiculos'

const STATS = [
  { id: 'os', label: 'OS em Andamento', value: '—', icon: ClipboardText },
  { id: 'faturamento', label: 'Faturamento Hoje', value: '—', icon: CreditCard },
  { id: 'patio', label: 'Veículos no Pátio', value: '—', icon: Garage },
  { id: 'agenda', label: 'Agendamentos Hoje', value: '—', icon: CalendarDots },
]

const QUICK_ACTIONS = [
  { id: 'nova-os', label: 'Nova OS', path: '/gestao/ordem-de-servico', icon: Plus },
  { id: 'agenda', label: 'Agenda', path: '/gestao/agenda', icon: CalendarDots },
  { id: 'clientes', label: 'Clientes', path: '/gestao/clientes', icon: Users },
  { id: 'veiculos', label: 'Veículos', path: '/gestao/veiculos', icon: CarProfile },
  { id: 'pdv', label: 'PDV', path: '/gestao/pdv', icon: CreditCard },
  { id: 'estoque', label: 'Estoque', path: '/gestao/estoque', icon: Package },
  { id: 'leva-e-traz', label: 'Leva e Traz', path: '/gestao/leva-e-traz', icon: ArrowsLeftRight },
  { id: 'configuracoes', label: 'Ajustes', path: '/gestao/configuracoes', icon: GearSix },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function MobileHomeScreen() {
  const navigate = useNavigate()
  const { user } = useAdminAuth()
  const { canPromptInstall, showIosInstructions, isInstalled, promptInstall } = usePwaInstall()
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const userName = user?.user_metadata?.name || user?.user_metadata?.nome || 'Administrador'
  const firstName = userName.split(' ')[0]

  const dateLabel = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  }, [])

  const proximosAtendimentos = useMemo(() => {
    return MOCK_CLIENTES_VEICULOS.slice(0, 3).map((cliente, index) => ({
      id: cliente.value,
      nome: cliente.nome,
      veiculo: cliente.veiculos?.[0]?.marcaModelo || 'Veículo não informado',
      placa: cliente.veiculos?.[0]?.placa || '—',
      horario: ['08:30', '10:00', '14:30'][index] || '—',
    }))
  }, [])

  const handleInstall = async () => {
    const accepted = await promptInstall()
    if (accepted) {
      toast.success('Aplicativo instalado com sucesso.')
    }
  }

  const showInstallBanner = !isInstalled && !bannerDismissed && (canPromptInstall || showIosInstructions)

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      {/* Saudação */}
      <div>
        <h1 className="text-xl font-extrabold text-[#101828] tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-xs text-[#667085] font-medium capitalize">{dateLabel}</p>
      </div>

      {/* Banner de instalação do PWA */}
      {showInstallBanner && (
        <div className="bg-[#101828] rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden">
          <img
            src="/favicon-96x96.png"
            alt="Mecânica Gabriel"
            className="w-11 h-11 rounded-xl object-contain bg-white p-1 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white leading-snug">
              Instale o aplicativo na tela inicial
            </p>
            {canPromptInstall ? (
              <>
                <p className="text-[11px] text-zinc-400 mt-0.5 mb-2.5 leading-relaxed">
                  Acesso rápido, tela cheia e uso como um aplicativo nativo.
                </p>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] text-white text-[11px] font-bold rounded-lg active:scale-95 transition-transform"
                >
                  <DownloadSimple size={14} weight="bold" />
                  Instalar Aplicativo
                </button>
              </>
            ) : (
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Toque em <ShareNetwork size={12} weight="bold" className="inline mx-0.5 -mt-0.5" /> Compartilhar
                e depois em Adicionar à Tela de Início.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Fechar aviso de instalação"
            className="p-1 text-zinc-500 active:text-white shrink-0"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      )}

      {/* Cartões de indicadores */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-2xl border border-[#e4e7ec] p-3.5 flex flex-col gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center">
              <stat.icon size={18} weight="bold" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#101828] leading-tight">{stat.value}</p>
              <p className="text-[10.5px] font-semibold text-[#667085] leading-snug">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Acesso rápido em grade de ícones */}
      <div>
        <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-3">
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-4 gap-y-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1.5 active:opacity-60 transition-opacity"
            >
              <div className="w-[52px] h-[52px] rounded-2xl bg-white border border-[#e4e7ec] flex items-center justify-center text-[#101828] shadow-xs">
                <action.icon size={22} weight="bold" className="text-[#0284c7]" />
              </div>
              <span className="text-[10px] font-semibold text-[#344054] text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Próximos atendimentos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
            Próximos Atendimentos
          </h2>
          <button
            type="button"
            onClick={() => navigate('/gestao/agenda')}
            className="text-[11px] font-bold text-[#0284c7] flex items-center gap-0.5"
          >
            Ver agenda
            <CaretRight size={12} weight="bold" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4e7ec] divide-y divide-[#f2f4f7] overflow-hidden">
          {proximosAtendimentos.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-[#f2f4f7] text-[#101828] shrink-0">
                <Clock size={14} weight="bold" className="text-[#0284c7]" />
                <span className="text-[9.5px] font-bold leading-tight mt-0.5">{item.horario}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#101828] truncate">{item.nome}</p>
                <p className="text-[11px] text-[#667085] truncate">
                  {item.veiculo} • {item.placa}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
