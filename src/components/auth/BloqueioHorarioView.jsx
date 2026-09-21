import React from 'react'
import { Clock, ShieldWarning, ArrowLeft, SignOut } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

/**
 * BloqueioHorarioView
 * Renderizada quando colaboradores (Secretaria ou Mecânico) tentam acessar fora
 * do expediente comercial da oficina (08:00 às 19:00).
 *
 * Em total conformidade com o SYSTEM_RULES.md:
 * - R1, R2, R3: Layout de tela única, sem scroll na tela principal
 * - R4, R7: Cores Branco, Preto e Azul oficial (#0284c7), zero verde
 * - R5: Proibição do caractere '&'
 */
export function BloqueioHorarioView({ motivo = 'horario', onLogout }) {
  const navigate = useNavigate()

  const isDispositivo = motivo === 'dispositivo'

  return (
    <div className="w-full h-full min-h-0 flex items-center justify-center bg-[#f8fafc] p-4 overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e4e7ec] shadow-sm p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-[#0284c7]">
          {isDispositivo ? (
            <ShieldWarning size={32} weight="duotone" />
          ) : (
            <Clock size={32} weight="duotone" />
          )}
        </div>

        <h2 className="text-lg font-bold text-[#101828] mb-2">
          {isDispositivo
            ? 'Dispositivo Nao Autorizado'
            : 'Acesso Fora do Horario Operacional'}
        </h2>

        <p className="text-xs text-[#475467] leading-relaxed mb-6">
          {isDispositivo ? (
            'Este dispositivo ainda nao possui autorizacao para acesso operacional da oficina. Solicite a liberacao presencial ao Administrador da Mecanica Gabriel.'
          ) : (
            'O acesso para colaboradores da oficina esta disponivel exclusivamente de segunda a sabado das 08:00 as 19:00. Para situacoes de emergencia, contate a Gestao.'
          )}
        </p>

        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e4e7ec] mb-6 text-left">
          <div className="flex items-center justify-between text-xs text-[#344054] mb-1">
            <span className="font-semibold">Horario Operacional:</span>
            <span className="font-bold text-[#0284c7]">08:00 as 19:00</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#344054]">
            <span className="font-semibold">Acesso de Administrador:</span>
            <span className="text-[#101828]">Irrestrito (24h com MFA)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 h-10 px-4 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#344054] bg-white hover:bg-[#f8fafc] transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          >
            <ArrowLeft size={16} />
            Pagina Inicial
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 h-10 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            >
              <SignOut size={16} />
              Sair da Conta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
