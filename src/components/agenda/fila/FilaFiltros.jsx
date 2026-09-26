import React from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

const FILTROS_PRIORIDADE_DESKTOP = [
  { chave: 'TODOS', rotulo: 'Todos' },
  { chave: 'GARANTIA', rotulo: 'Garantias' },
  { chave: 'RETORNO', rotulo: 'Retornos' },
  { chave: 'URGENTE', rotulo: 'Urgentes' },
  { chave: 'NORMAL', rotulo: 'Ordem de Chegada' },
]

export function FilaFiltros({ filaWorkflow }) {
  const { busca, setBusca, filtroPrioridade, setFiltroPrioridade } = filaWorkflow

  return (
    <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="relative w-full sm:w-80">
        <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar cliente, placa ou motivo..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
        />
      </div>

      {/* Filtro por Classificação */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
        {FILTROS_PRIORIDADE_DESKTOP.map((f) => (
          <button
            key={f.chave}
            type="button"
            onClick={() => setFiltroPrioridade(f.chave)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filtroPrioridade === f.chave
                ? 'bg-[#0f172a] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>
    </div>
  )
}
