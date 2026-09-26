import React from 'react'
import { Plus, Wrench, PaperPlaneTilt } from '@phosphor-icons/react'

/** Bloco de OS em andamento (mecânico ocupado em serviço na oficina). */
export function CardOcupacaoOSGrade({ bloco }) {
  const os = bloco.dado
  const horaFimNum = parseInt(os.horarioInicio.split(':')[0], 10) + bloco.span
  const horaFimStr = `${String(horaFimNum).padStart(2, '0')}:00`

  return (
    <div
      style={{ gridRow: `${bloco.startRow} / span ${bloco.span}` }}
      className="rounded-lg p-2.5 bg-slate-100 border border-slate-300 flex flex-col justify-between shadow-2xs select-none overflow-hidden h-full"
    >
      <div className="overflow-hidden">
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200">
          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-white flex items-center gap-1">
            <Wrench size={11} weight="bold" />
            Ocupado • OS em Serviço
          </span>
          <span className="text-[10px] font-bold text-slate-700 font-mono">OS #{os.numeroOS}</span>
        </div>

        <h4 className="text-xs font-bold text-slate-900 leading-tight mt-1 truncate">
          {os.veiculoModelo} ({os.veiculoPlaca})
        </h4>

        <p className="text-[11px] text-slate-600 mt-0.5 truncate">Cliente: {os.clienteNome}</p>

        <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-2 leading-relaxed">"{os.servicoDescricao}"</p>
      </div>

      <div className="mt-1 pt-1 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span>
          {os.horarioInicio} às {horaFimStr} ({bloco.span}h)
        </span>
        <span className="bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold">Oficina</span>
      </div>
    </div>
  )
}

/**
 * Bloco livre: se houver cliente na fila, mostra SOMENTE o "Enviar ao 1º da fila";
 * se a fila estiver vazia, mostra o "Agendar".
 */
export function SlotLivreGrade({ bloco, primeiroFila, onEnviarAoPrimeiroFila, onAgendar }) {
  return (
    <div
      style={{ gridRow: `${bloco.startRow} / span 1` }}
      className="rounded-lg border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between p-2 group/slot h-full overflow-hidden"
    >
      {/* Topo com o horário */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400">{bloco.horario}</span>
        {bloco.isAlmoco && <span className="text-[9px] font-bold text-slate-400 uppercase">Almoço</span>}
      </div>

      {primeiroFila ? (
        <div
          onClick={onEnviarAoPrimeiroFila}
          className="my-auto py-1 px-1.5 rounded-lg border border-dashed border-slate-300 hover:border-[#0284c7] hover:bg-sky-50/50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group/fila"
          title={`Enviar este horário para ${primeiroFila.clienteNome} (${primeiroFila.prioridade})`}
        >
          <div className="w-5 h-5 rounded-full bg-slate-100 group-hover/fila:bg-[#0284c7] text-slate-500 group-hover/fila:text-white flex items-center justify-center transition-colors">
            <PaperPlaneTilt size={11} weight="bold" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover/fila:text-[#0284c7] transition-colors text-center leading-tight">
            Enviar ao 1º da fila
          </span>
          <span className="text-[10px] text-slate-500 group-hover/fila:text-slate-700 truncate max-w-[130px] font-medium">
            {primeiroFila.prioridade === 'GARANTIA' && '★ '}
            {primeiroFila.clienteNome}
          </span>
        </div>
      ) : (
        <div
          onClick={onAgendar}
          className="my-auto flex flex-col items-center justify-center gap-1 cursor-pointer py-1 group/agendar"
        >
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover/agendar:bg-sky-100 text-slate-400 group-hover/agendar:text-[#0284c7] flex items-center justify-center transition-colors">
            <Plus size={13} weight="bold" />
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover/agendar:text-[#0284c7] transition-colors">
            Agendar
          </span>
        </div>
      )}

      {/* Base discreta */}
      <div className="h-1" />
    </div>
  )
}
