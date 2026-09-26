import React from 'react'
import { CalendarDots, Users, Plus } from '@phosphor-icons/react'

function BotaoSegmento({ ativa, onClick, icone: Icone, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
        ativa ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
      }`}
    >
      <Icone size={14} weight={ativa ? 'fill' : 'bold'} className={ativa ? 'text-[#0284c7]' : ''} />
      {children}
    </button>
  )
}

/** Segmentado Agenda / Fila + ação rápida (novo agendamento ou inserir na fila). */
export function MobileAgendaTopo({ workflow, onAcaoRapida }) {
  const { abaAtivaPrincipal, setAbaAtivaPrincipal, totalFila, totalGarantiasFila } = workflow

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex-1 flex items-center bg-[#f2f4f7] p-1 rounded-xl">
        <BotaoSegmento ativa={abaAtivaPrincipal === 'grade'} onClick={() => setAbaAtivaPrincipal('grade')} icone={CalendarDots}>
          Agenda
        </BotaoSegmento>
        <BotaoSegmento ativa={abaAtivaPrincipal === 'fila'} onClick={() => setAbaAtivaPrincipal('fila')} icone={Users}>
          Fila
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              totalGarantiasFila > 0 ? 'bg-[#0f172a] text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {totalFila}
          </span>
        </BotaoSegmento>
      </div>
      <button
        type="button"
        onClick={onAcaoRapida}
        aria-label={abaAtivaPrincipal === 'grade' ? 'Novo Agendamento' : 'Inserir na Fila'}
        className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
      >
        <Plus size={18} weight="bold" />
      </button>
    </div>
  )
}
