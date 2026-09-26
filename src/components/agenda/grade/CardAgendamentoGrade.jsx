import React from 'react'
import { Clock, Car, WarningCircle, MapPin, CarProfile, ArrowsClockwise } from '@phosphor-icons/react'

/** Card de agendamento na grade semanal (row-span exato pela duração). */
export function CardAgendamentoGrade({ bloco, onEditarAgendamento, onTratarAtraso }) {
  const ag = bloco.dado

  return (
    <div
      onClick={() => onEditarAgendamento(ag)}
      style={{ gridRow: `${bloco.startRow} / span ${bloco.span}` }}
      className={`rounded-lg p-2.5 border transition-all cursor-pointer flex flex-col justify-between shadow-xs overflow-hidden h-full ${
        ag.emAtraso
          ? 'bg-rose-50/90 border-rose-300 hover:border-rose-400'
          : ag.foiEmpurradoCascata
          ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
          : 'bg-white border-slate-200 hover:border-[#0284c7] hover:shadow-sm'
      }`}
    >
      <div className="overflow-hidden">
        {/* Cabeçalho do Card */}
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100 gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#0284c7] flex items-center gap-1">
              <Clock size={12} weight="bold" />
              {ag.horarioInicio} • {ag.duracaoHoras}h
              {bloco.span > 1 && ` (até ${parseInt(ag.horarioInicio.split(':')[0], 10) + bloco.span}:00)`}
            </span>

            {/* Indicador de Empurrado por Cascata Dinâmica */}
            {ag.empurradoDeDia && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-0.5"
                title={`Transferido de ${ag.empurradoDeDia.toUpperCase()} devido a atrasos anteriores`}
              >
                <ArrowsClockwise size={10} weight="bold" />
                <span>De {ag.empurradoDeDia.toUpperCase()}</span>
              </span>
            )}

            {!ag.empurradoDeDia && ag.foiEmpurradoCascata && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5"
                title={`Horário empurrado dinamicamente (+${ag.empurradoMinutos || 60}m) devido a atraso anterior`}
              >
                <ArrowsClockwise size={10} weight="bold" />
                <span>Ajustado (+{ag.empurradoMinutos || 60}m)</span>
              </span>
            )}
          </div>

          {ag.emAtraso && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onTratarAtraso && onTratarAtraso(ag)
              }}
              className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 flex items-center gap-1 animate-pulse shrink-0"
              title="Tratar atraso"
            >
              <WarningCircle size={10} weight="bold" />
              Atraso (+{ag.tempoAtrasoMinutos || 30}m)
            </button>
          )}
        </div>

        {/* Nome do Cliente */}
        <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{ag.clienteNome}</h4>

        {/* Veículo e Placa */}
        <div className="flex items-center gap-1.5 text-xs text-slate-700 mt-1">
          <Car size={13} className="text-[#0284c7] shrink-0" />
          <span className="truncate font-medium">{ag.veiculoModelo}</span>
          {ag.veiculoPlaca && (
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
              {ag.veiculoPlaca}
            </span>
          )}
        </div>

        {/* Serviço Solicitado */}
        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{ag.servicoDescricao}</p>
      </div>

      {/* Rodapé do Card */}
      <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
        {ag.tipoLogistica === 'OFICINA_BUSCA' ? (
          <span
            className="font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-white flex items-center gap-1 truncate"
            title={`Buscar carro às ${ag.horarioVeiculo || ag.horarioInicio}`}
          >
            <MapPin size={10} />
            Buscar ({ag.horarioVeiculo || ag.horarioInicio})
          </span>
        ) : (
          <span
            className="font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1 truncate"
            title={`Cliente leva às ${ag.horarioVeiculo || ag.horarioInicio}`}
          >
            <CarProfile size={10} />
            Cliente leva ({ag.horarioVeiculo || ag.horarioInicio})
          </span>
        )}

        <span className="text-slate-400 group-hover:text-[#0284c7] font-medium">Editar</span>
      </div>
    </div>
  )
}
