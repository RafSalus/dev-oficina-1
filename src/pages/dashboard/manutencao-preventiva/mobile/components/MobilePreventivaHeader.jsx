import React from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'

function StatChip({ label, value, dark, highlight }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
        dark
          ? 'bg-[#101828] border-[#101828] text-white'
          : highlight
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-white border-[#d0d5dd] text-[#101828]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className="text-sm font-extrabold mt-0.5 font-mono">{value}</p>
    </div>
  )
}

export function MobilePreventivaHeader({
  metricas,
  abaAtiva,
  setAbaAtiva,
  busca,
  setBusca,
}) {
  return (
    <div className="bg-white border-b border-[#e4e7ec] px-4 pt-3 pb-3 shrink-0">
      <div className="mb-3">
        <h1 className="text-base font-black text-[#101828] tracking-tight">
          Manutenção Preventiva
        </h1>
        <p className="text-[11px] text-[#667085]">Saúde veicular e retenção de clientes</p>
      </div>

      {/* Chips de Métricas com rolagem invisível */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
        <StatChip label="Frota Ativa" value={`${metricas.total} carros`} dark />
        <StatChip label="Vencidos" value={metricas.criticos} highlight />
        <StatChip label="Em Atenção" value={metricas.atencao} />
        <StatChip label="Garantias" value={metricas.garantias} />
        <StatChip
          label="Oportunidade"
          value={`R$ ${metricas.receitaPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        />
      </div>

      {/* Alternador de Abas Mobile */}
      <div className="flex rounded-xl bg-slate-100 p-1 mt-3 border border-slate-200">
        <button
          type="button"
          onClick={() => setAbaAtiva('frota')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
            abaAtiva === 'frota'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-600'
          }`}
        >
          Frota Ativa
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('campanhas')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
            abaAtiva === 'campanhas'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-600'
          }`}
        >
          Campanhas
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('garantias')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
            abaAtiva === 'garantias'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-600'
          }`}
        >
          Garantias ({metricas.garantias})
        </button>
      </div>

      {/* Campo de Busca Rápida (Font-size 16px min para evitar zoom no mobile - Regra 10) */}
      {abaAtiva !== 'campanhas' && (
        <div className="mt-3 relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por placa, cliente ou modelo..."
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
      )}
    </div>
  )
}
