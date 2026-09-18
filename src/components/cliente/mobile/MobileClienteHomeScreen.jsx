import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Wrench,
  Toolbox,
  Certificate,
  ClockCounterClockwise,
  GasPump,
  CalendarDots,
  CarProfile,
  DownloadSimple,
  ShareNetwork,
  X,
  CaretRight,
  Speedometer,
} from '@phosphor-icons/react'
import { useCliente } from '../../../context/ClienteContext'
import { usePwaInstall } from '../../../hooks/usePwaInstall'
import { obterOrdensAbertas, STATUS_ORCAMENTO } from '../../../pages/dashboard/orcamento/mockOrdensAbertas'

const QUICK_ACTIONS = [
  { id: 'veiculos', label: 'Veículos', path: '/cliente/veiculos', icon: CarProfile },
  { id: 'servicos', label: 'Serviços', path: '/cliente/servicos', icon: Wrench },
  { id: 'manutencoes', label: 'Manutenções', path: '/cliente/manutencoes', icon: Toolbox },
  { id: 'garantias', label: 'Garantias', path: '/cliente/garantias', icon: Certificate },
  { id: 'historico', label: 'Histórico', path: '/cliente/historico', icon: ClockCounterClockwise },
  { id: 'posto', label: 'Posto', path: '/cliente/posto', icon: GasPump },
  { id: 'agenda', label: 'Agenda', path: '/cliente/agenda', icon: CalendarDots },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function MobileClienteHomeScreen() {
  const navigate = useNavigate()
  const { clienteAtivo, veiculoAtivo } = useCliente()
  const { canPromptInstall, showIosInstructions, isInstalled, promptInstall } = usePwaInstall()
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const firstName = (clienteAtivo?.nome || 'Cliente').split(' ')[0]

  const dateLabel = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  }, [])

  const minhasOS = useMemo(() => {
    try {
      return obterOrdensAbertas().filter((os) => os.clienteId === clienteAtivo?.value)
    } catch {
      return []
    }
  }, [clienteAtivo?.value])

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
                  Acompanhe seu veículo com acesso rápido, como um aplicativo nativo.
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

      {/* Cartão do Veículo */}
      {veiculoAtivo && (
        <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-white border-2 border-[#101828] rounded-xl px-3 py-1.5 shrink-0">
              <span className="text-[7px] font-black uppercase tracking-widest text-[#101828] leading-none mb-0.5">
                BRASIL
              </span>
              <span className="font-mono font-black text-sm text-[#101828] tracking-widest leading-none">
                {veiculoAtivo.placa}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-[#101828] truncate leading-tight">
                {veiculoAtivo.marcaModelo}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#667085]">
                <span className="font-bold text-[#344054]">{veiculoAtivo.ano}</span>
                <span>•</span>
                <span>{veiculoAtivo.cor}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#98a2b3] shrink-0">
              <Speedometer size={16} />
              <span className="text-[11px] font-bold text-[#475467]">{veiculoAtivo.kmPadrao || '—'} km</span>
            </div>
          </div>
        </div>
      )}

      {/* Status da OS em andamento */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider">
            Atendimento em Andamento
          </h2>
          <button
            type="button"
            onClick={() => navigate('/cliente/servicos')}
            className="text-[11px] font-bold text-[#0284c7] flex items-center gap-0.5"
          >
            Ver tudo
            <CaretRight size={12} weight="bold" />
          </button>
        </div>

        {minhasOS.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e4e7ec] p-6 text-center">
            <p className="text-xs text-[#667085]">Nenhum atendimento em andamento no momento.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e4e7ec] divide-y divide-[#f2f4f7] overflow-hidden">
            {minhasOS.map((os) => {
              const statusInfo = STATUS_ORCAMENTO.find((s) => s.value === os.status) || STATUS_ORCAMENTO[1]
              return (
                <div key={os.numeroOS} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-black text-xs text-[#101828]">OS #{os.numeroOS}</span>
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.border}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085] truncate">
                    {os.marcaModelo} • Previsão: {os.previsaoEntregaData || 'A definir'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Acesso rápido em grade de ícones */}
      <div>
        <h2 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-3">
          Meu Veículo e Atendimento
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
    </div>
  )
}
