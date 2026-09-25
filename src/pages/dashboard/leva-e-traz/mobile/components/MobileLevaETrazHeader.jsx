import React from 'react'
import { Plus, MagnifyingGlass, X } from '@phosphor-icons/react'

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
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

export function MobileLevaETrazHeader({
  metricas,
  abaAtiva,
  setAbaAtiva,
  busca,
  setBusca,
  onNovoDeslocamento,
}) {
  return (
    <div className="bg-white border-b border-[#e4e7ec] px-4 pt-3 pb-3 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base font-black text-[#101828] tracking-tight">Leva e Traz</h1>
          <p className="text-[11px] text-[#667085]">Logística operacional da oficina</p>
        </div>

        <button
          type="button"
          onClick={onNovoDeslocamento}
          className="h-9 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus size={15} weight="bold" />
          <span>Novo</span>
        </button>
      </div>

      {/* Chips com Métricas da Operação */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
        <StatChip label="Em Rota" value={`${metricas.emRota} ativos`} dark />
        <StatChip label="Agendados" value={metricas.agendados} />
        <StatChip label="Carros Clientes" value={metricas.veiculosClientes} />
        <StatChip label="Busca de Peças" value={metricas.coletaPecas} />
        <StatChip label="KM Total Hoje" value={`${metricas.kmTotal} km`} />
      </div>

      {/* Alternador de Abas Mobile */}
      <div className="flex rounded-xl bg-slate-100 p-1 mt-3 border border-slate-200">
        <button
          type="button"
          onClick={() => setAbaAtiva('roteiro')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
            abaAtiva === 'roteiro'
              ? 'bg-white text-[#101828] shadow-2xs border border-slate-200/80'
              : 'text-slate-600'
          }`}
        >
          Roteiro do Dia {metricas.emRota > 0 && `(${metricas.emRota})`}
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('historico')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
            abaAtiva === 'historico'
              ? 'bg-white text-[#101828] shadow-2xs border border-slate-200/80'
              : 'text-slate-600'
          }`}
        >
          Histórico Concluído
        </button>
      </div>

      {/* Campo de Busca Rápida (Font-size 16px min para evitar zoom no mobile - Regra 10) */}
      <div className="mt-3 relative">
        <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por cliente, fornecedor, placa ou motorista..."
          style={{ fontSize: '16px' }}
          className="w-full h-11 pl-9 pr-8 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
        />
        {busca && (
          <button
            type="button"
            onClick={() => setBusca('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
