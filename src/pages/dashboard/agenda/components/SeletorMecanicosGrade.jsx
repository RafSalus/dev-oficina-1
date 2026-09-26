import React from 'react'
import { CaretLeft, CaretRight, Wrench, MagnifyingGlass } from '@phosphor-icons/react'
import { matchMecanico } from '../../../../hooks/useAgendaWorkflow'

/** Abas de mecânicos (mostra SOMENTE o selecionado), navegador semanal e busca. */
export function SeletorMecanicosGrade({ workflow }) {
  const { mecanicosLista, mecanicoSelecionadoId, agendamentos, semanaDias } = workflow

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 pt-2.5 shrink-0 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
      {/* Abas com Nomes dos Mecânicos */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
          Mecânico:
        </span>
        {mecanicosLista.map((mec) => {
          const isAtivo = mecanicoSelecionadoId === mec.id
          const totalMec = agendamentos.filter((a) => matchMecanico(a, mec)).length
          const temAtraso = agendamentos.some((a) => matchMecanico(a, mec) && a.emAtraso)

          return (
            <button
              key={mec.id}
              type="button"
              onClick={() => workflow.setMecanicoSelecionadoId(mec.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x cursor-pointer ${
                isAtivo
                  ? 'bg-white border-slate-200 text-[#0284c7] border-b-transparent shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Wrench size={13} className={isAtivo ? 'text-[#0284c7]' : 'text-slate-400'} />
              <span>{mec.nome}</span>
              {temAtraso && <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" title="Atraso na grade" />}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isAtivo ? 'bg-sky-100 text-sky-900' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {totalMec}
              </span>
            </button>
          )
        })}
      </div>

      {/* Navegador Semanal e Campo de Busca */}
      <div className="flex items-center gap-2.5 pb-2">
        <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
          <button
            type="button"
            onClick={workflow.irParaSemanaAnterior}
            className="p-1 hover:bg-slate-100 text-slate-700 rounded transition-colors"
            title="Semana Anterior"
          >
            <CaretLeft size={15} weight="bold" />
          </button>
          <button
            type="button"
            onClick={workflow.irParaSemanaAtual}
            className="px-2 py-0.5 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded transition-colors"
          >
            {semanaDias[0]?.dataBr} a {semanaDias[4]?.dataBr}
          </button>
          <button
            type="button"
            onClick={workflow.irParaProximaSemana}
            className="p-1 hover:bg-slate-100 text-slate-700 rounded transition-colors"
            title="Próxima Semana"
          >
            <CaretRight size={15} weight="bold" />
          </button>
        </div>

        <div className="relative w-40 sm:w-52">
          <MagnifyingGlass size={14} className="absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            value={workflow.termoBusca}
            onChange={(e) => workflow.setTermoBusca(e.target.value)}
            placeholder="Filtrar cliente ou placa..."
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
          />
        </div>
      </div>
    </div>
  )
}
