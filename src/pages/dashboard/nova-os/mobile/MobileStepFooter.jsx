import React from 'react'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'

export function MobileStepFooter({ onContinue, isLastStep, label = 'Continuar' }) {
  return (
    <div
      className="sticky bottom-0 mt-5 -mx-4 px-4 pt-3 bg-gradient-to-t from-[#eaecf0] via-[#eaecf0] to-transparent"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
    >
      <button
        type="button"
        onClick={onContinue}
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black active:bg-zinc-800 text-white text-sm font-bold shadow-lg shadow-black/10 transition-all active:scale-[0.98]"
      >
        {isLastStep ? (
          <>
            <CheckCircle size={18} weight="bold" />
            <span>Finalizar Ordem de Serviço</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <ArrowRight size={16} weight="bold" />
          </>
        )}
      </button>
    </div>
  )
}
