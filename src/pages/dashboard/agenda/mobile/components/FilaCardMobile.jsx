import React from 'react'
import { Clock, Car, Wrench, ShieldCheck, Trash } from '@phosphor-icons/react'
import { PRIORIDADE_FILA } from '../../../../../constants/agendaData'

export function FilaCard({ item, posicao, mecanicosAgenda, onRemover }) {
  const isGarantia = item.prioridade === 'GARANTIA'
  const pInfo = PRIORIDADE_FILA[item.prioridade] || PRIORIDADE_FILA.NORMAL
  const mecPref = mecanicosAgenda.find((m) => m.id === item.mecanicoPreferencialId)

  return (
    <div
      className={`rounded-2xl border p-3.5 shadow-sm ${
        isGarantia ? 'bg-[#101828] border-[#101828] text-white' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-extrabold shrink-0 ${
              isGarantia ? 'bg-white text-[#101828]' : 'bg-[#f2f4f7] text-[#344054] border border-[#d0d5dd]'
            }`}
          >
            {posicao}º
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded truncate max-w-[150px] ${
              isGarantia ? 'bg-white/15 text-white' : pInfo.corBadge
            }`}
          >
            {isGarantia && <ShieldCheck size={12} weight="bold" />}
            {pInfo.rotulo.replace(/\s*\(Prioridade \d\)/, '')}
          </span>
        </div>
        <span className={`text-[10.5px] font-semibold flex items-center gap-1 shrink-0 ${isGarantia ? 'text-zinc-300' : 'text-[#667085]'}`}>
          <Clock size={12} />
          {item.horaChegada}
        </span>
      </div>

      <p className={`text-sm font-extrabold truncate ${isGarantia ? 'text-white' : 'text-[#101828]'}`}>{item.clienteNome}</p>
      {item.clienteTelefone && (
        <p className={`text-[11px] ${isGarantia ? 'text-zinc-300' : 'text-[#667085]'}`}>{item.clienteTelefone}</p>
      )}

      <div className="flex items-center gap-1.5 mt-1.5">
        <Car size={13} className={isGarantia ? 'text-zinc-300 shrink-0' : 'text-[#0284c7] shrink-0'} />
        <span className={`text-xs truncate ${isGarantia ? 'text-zinc-200' : 'text-[#475467]'}`}>{item.veiculoModelo}</span>
        {item.veiculoPlaca && (
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
              isGarantia ? 'bg-white/10 text-white' : 'bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054]'
            }`}
          >
            {item.veiculoPlaca}
          </span>
        )}
      </div>

      <p className={`text-[11px] italic mt-1.5 line-clamp-2 leading-relaxed ${isGarantia ? 'text-zinc-300' : 'text-[#667085]'}`}>
        "{item.motivo}"
      </p>

      <p className={`text-[10.5px] mt-1.5 flex items-center gap-1 ${isGarantia ? 'text-zinc-400' : 'text-[#98a2b3]'}`}>
        <Wrench size={11} />
        {mecPref ? mecPref.nome : 'Qualquer mecânico disponível'}
      </p>

      <div className="mt-2.5 pt-2.5 border-t border-dashed" style={{ borderColor: isGarantia ? 'rgba(255,255,255,0.15)' : '#f2f4f7' }}>
        <button
          type="button"
          onClick={() => onRemover(item)}
          className={`w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
            isGarantia ? 'bg-white/10 text-white' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}
        >
          <Trash size={14} weight="bold" />
          Remover da Fila
        </button>
      </div>
    </div>
  )
}
