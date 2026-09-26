import React from 'react'
import { Clock, Car, CarProfile, Wrench, MapPin, WarningCircle, ArrowsClockwise } from '@phosphor-icons/react'

export function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[100px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

export function AgendamentoCard({ agendamento, onClick }) {
  const ag = agendamento
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-3.5 shadow-sm active:bg-[#f8fafc] transition-colors ${
        ag.emAtraso
          ? 'bg-rose-50/80 border-rose-300'
          : ag.foiEmpurradoCascata
          ? 'bg-amber-50/60 border-amber-300'
          : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-bold text-[#0284c7] flex items-center gap-1">
          <Clock size={13} weight="bold" />
          {ag.horarioInicio} • {ag.duracaoHoras}h
        </span>

        {ag.emAtraso ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 flex items-center gap-1 shrink-0">
            <WarningCircle size={11} weight="bold" />
            Atraso (+{ag.tempoAtrasoMinutos || 30}m)
          </span>
        ) : ag.foiEmpurradoCascata ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
            <ArrowsClockwise size={11} weight="bold" />
            Ajustado
          </span>
        ) : null}
      </div>

      <p className="text-sm font-extrabold text-[#101828] truncate">{ag.clienteNome}</p>

      <div className="flex items-center gap-1.5 mt-1">
        <Car size={13} className="text-[#0284c7] shrink-0" />
        <span className="text-xs text-[#475467] truncate">{ag.veiculoModelo}</span>
        {ag.veiculoPlaca && (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054] shrink-0">
            {ag.veiculoPlaca}
          </span>
        )}
      </div>

      <p className="text-[11px] text-[#667085] mt-1.5 line-clamp-2 leading-relaxed">{ag.servicoDescricao}</p>

      <div className="mt-2 pt-2 border-t border-[#f2f4f7] flex items-center justify-between text-[10px]">
        {ag.tipoLogistica === 'OFICINA_BUSCA' ? (
          <span className="font-semibold px-1.5 py-0.5 rounded bg-[#101828] text-white flex items-center gap-1">
            <MapPin size={10} />
            Buscar ({ag.horarioVeiculo || ag.horarioInicio})
          </span>
        ) : (
          <span className="font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
            <CarProfile size={10} />
            Cliente leva ({ag.horarioVeiculo || ag.horarioInicio})
          </span>
        )}
        <span className="text-[#98a2b3] font-semibold">Toque para editar</span>
      </div>
    </button>
  )
}

export function OcupacaoOsCard({ ocupacao }) {
  const os = ocupacao
  const horaFimNum = parseInt(os.horarioInicio.split(':')[0], 10) + Number(os.duracaoHoras || 2)
  const horaFimStr = `${String(horaFimNum).padStart(2, '0')}:00`

  return (
    <div className="w-full rounded-2xl border border-[#d0d5dd] bg-[#f2f4f7] p-3.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#101828] text-white flex items-center gap-1">
          <Wrench size={11} weight="bold" />
          Ocupado • OS em Serviço
        </span>
        <span className="text-[10px] font-bold text-[#475467] font-mono">OS #{os.numeroOS}</span>
      </div>
      <p className="text-sm font-bold text-[#101828] truncate">
        {os.veiculoModelo} ({os.veiculoPlaca})
      </p>
      <p className="text-xs text-[#667085] mt-0.5 truncate">Cliente: {os.clienteNome}</p>
      <p className="text-[11px] text-[#98a2b3] italic mt-1 line-clamp-2">"{os.servicoDescricao}"</p>
      <div className="mt-2 pt-2 border-t border-[#e4e7ec] text-[10px] text-[#667085] font-medium">
        {os.horarioInicio} às {horaFimStr}
      </div>
    </div>
  )
}
