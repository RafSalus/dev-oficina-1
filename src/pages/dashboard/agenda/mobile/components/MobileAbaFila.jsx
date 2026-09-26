import React from 'react'
import { Users, MagnifyingGlass } from '@phosphor-icons/react'
import { StatChip } from './AgendaCardsMobile'
import { FilaCard } from './FilaCardMobile'

const FILTROS_PRIORIDADE = [
  { chave: 'TODOS', rotulo: 'Todos' },
  { chave: 'GARANTIA', rotulo: 'Garantias' },
  { chave: 'RETORNO', rotulo: 'Retornos' },
  { chave: 'URGENTE', rotulo: 'Urgentes' },
  { chave: 'NORMAL', rotulo: 'Chegada' },
]

/** Aba de fila mobile: métricas, busca, filtros de prioridade e lista. */
export function MobileAbaFila({ filaWorkflow, mecanicosAgenda }) {
  const { metricasFila, busca, setBusca, filtroPrioridade, setFiltroPrioridade, filaFiltrada } = filaWorkflow

  return (
    <>
      {/* Métricas da Fila */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Aguardando" value={metricasFila.total} dark />
        <StatChip label="Garantias" value={metricasFila.garantias} />
        <StatChip label="Retornos" value={metricasFila.retornos} />
        <StatChip label="Urgentes" value={metricasFila.urgentes} />
        <StatChip label="Chegada" value={metricasFila.normais} />
      </div>

      {/* Busca */}
      <div className="relative mb-2.5">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cliente, placa ou motivo..."
          className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#d0d5dd] bg-white text-sm font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:border-[#0284c7]"
        />
      </div>

      {/* Filtros de Prioridade */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        {FILTROS_PRIORIDADE.map((f) => (
          <button
            key={f.chave}
            type="button"
            onClick={() => setFiltroPrioridade(f.chave)}
            className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filtroPrioridade === f.chave ? 'bg-[#0f172a] text-white' : 'bg-white text-[#344054] border border-[#d0d5dd]'
            }`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {/* Lista da Fila */}
      {filaFiltrada.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <Users size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Fila de atendimento vazia</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            Toque no botão "+" para inserir um cliente na fila de atendimento.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filaFiltrada.map((item, index) => (
            <FilaCard
              key={item.id}
              item={item}
              posicao={index + 1}
              mecanicosAgenda={mecanicosAgenda}
              onRemover={filaWorkflow.removerDaFila}
            />
          ))}
        </div>
      )}
    </>
  )
}
