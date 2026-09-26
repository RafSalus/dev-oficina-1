import React from 'react'
import { CalendarBlank, CalendarDots, Users, Plus } from '@phosphor-icons/react'

function BotaoAba({ ativa, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
        ativa ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'
      }`}
    >
      {children}
    </button>
  )
}

/** Barra executiva superior compacta: alternância Agenda/Fila e botão de novo agendamento. */
export function AgendaHeader({ workflow }) {
  const { abaAtivaPrincipal, setAbaAtivaPrincipal, totalFila, totalGarantiasFila } = workflow

  return (
    <header className="h-13 shrink-0 bg-white px-4 rounded-2xl border border-[#d0d5dd] shadow-xs flex items-center justify-between gap-3">
      {/* Lado Esquerdo: Identificação e Alternância de Abas (Agenda vs Fila) */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#0284c7] shrink-0">
          <CalendarBlank size={18} weight="duotone" />
        </div>

        <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl border border-[#e4e7ec] shrink-0">
          <BotaoAba ativa={abaAtivaPrincipal === 'grade'} onClick={() => setAbaAtivaPrincipal('grade')}>
            <CalendarDots size={14} weight="bold" />
            <span>Agenda Semanal</span>
          </BotaoAba>

          <BotaoAba ativa={abaAtivaPrincipal === 'fila'} onClick={() => setAbaAtivaPrincipal('fila')}>
            <Users size={14} weight="bold" />
            <span>Fila de Atendimento</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                totalGarantiasFila > 0 ? 'bg-[#0f172a] text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalFila}
              {totalGarantiasFila > 0 && ' (★)'}
            </span>
          </BotaoAba>
        </div>
      </div>

      {/* Lado Direito: Botão Novo Agendamento no Padrão do Sistema */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => workflow.abrirNovoAgendamento('seg', '08:00')}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={15} weight="bold" />
          <span>Novo Agendamento</span>
        </button>
      </div>
    </header>
  )
}
