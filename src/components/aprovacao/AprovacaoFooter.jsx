import React from 'react'
import { CheckCircle, WhatsappLogo } from '@phosphor-icons/react'

/**
 * Barra fixa inferior com resumo do total e gatilho de aprovação / WhatsApp (NFR17).
 *
 * @param {Object} props
 * @param {Object} props.totais - Totais calculados
 * @param {boolean} props.estaAprovado - Se o orçamento já foi aprovado
 * @param {() => void} props.onAbrirModalAprovacao - Callback para abrir modal de aprovação
 * @param {() => void} props.onEnviarWhatsApp - Callback para reenviar confirmação no WhatsApp
 */
export function AprovacaoFooter({
  totais,
  estaAprovado,
  onAbrirModalAprovacao,
  onEnviarWhatsApp,
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#d0d5dd] shadow-lg p-3 sm:py-3.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-[#667085] uppercase block leading-none">
            Total do Orçamento
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-xl font-black text-[#101828]">
              R$ {totais.totalGeral.toFixed(2)}
            </span>
            <span className="text-[11px] text-[#0284c7] font-bold hidden sm:inline">
              ou 10x de R$ {totais.valorParcelado10x}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {estaAprovado ? (
            <button
              type="button"
              onClick={onEnviarWhatsApp}
              className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <WhatsappLogo size={16} weight="fill" />
              <span>Reenviar no WhatsApp</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onAbrirModalAprovacao}
              className="h-10 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <CheckCircle size={17} weight="bold" />
              <span>Aprovar Orçamento</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
