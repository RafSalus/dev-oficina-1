import React from 'react'
import Select from 'react-select'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { FILTROS_STATUS_SAUDE } from '../../../../hooks/usePreventivaWorkflow'
import { customSelectStyles } from '../../../../components/suprimentos/customSelectStyles'

export function PreventivaHeader({
  metricas,
  abaAtiva,
  setAbaAtiva,
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  filtroServico,
  setFiltroServico,
  opcoesServicos,
}) {
  return (
    <div className="px-6 py-3.5 bg-white border-b border-[#e4e7ec] shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#101828] tracking-tight">
              Manutenção Preventiva e Saúde da Frota
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {metricas.totalVeiculos} Veículos Monitorados
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Rastreio inteligente de trocas periódicas, saúde veicular, garantias e geração ativa de receita
          </p>
        </div>
      </div>

      {/* KPIs Estratégicos de Saúde e Receita */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
        {/* Card 1: Veículos Monitorados */}
        <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Frota Ativa
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-slate-900 font-mono">
              {metricas.totalVeiculos}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">veículos ativos</span>
          </div>
        </div>

        {/* Card 2: Críticos / Vencidos */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-2.5">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Revisões Vencidas
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-amber-900 font-mono">
              {metricas.criticos}
            </span>
            <span className="text-[11px] font-semibold text-amber-700">urgência alta</span>
          </div>
        </div>

        {/* Card 3: Em Atenção */}
        <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-2.5">
          <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
            Vencem em Breve
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-sky-900 font-mono">
              {metricas.atencao}
            </span>
            <span className="text-[11px] font-semibold text-sky-700">próx. 1.000 km</span>
          </div>
        </div>

        {/* Card 4: Garantias de Retorno */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Retornos de Garantia
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-slate-900 font-mono">
              {metricas.garantias}
            </span>
            <span className="text-[11px] font-semibold text-slate-600">inspeção pós-serviço</span>
          </div>
        </div>

        {/* Card 5: Oportunidade / Receita Potencial */}
        <div className="bg-[#101828] border border-[#101828] rounded-xl p-2.5 text-white">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Receita em Aberto
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-black text-white font-mono">
              R$ {metricas.receitaPotencialGeral.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-sky-300 font-semibold">pronto p/ orçar</span>
          </div>
        </div>
      </div>

      {/* Abas e Filtros Integrados */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
        {/* Alternador de Abas */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setAbaAtiva('frota')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'frota'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saúde da Frota Ativa
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('campanhas')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'campanhas'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Campanhas e Oportunidades por Serviço
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('garantias')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              abaAtiva === 'garantias'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retornos de Garantia ({metricas.garantias})
          </button>
        </div>

        {/* Filtros de Busca e Seleção */}
        {abaAtiva !== 'campanhas' && (
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por placa, cliente ou modelo..."
                className="w-full h-8.5 pl-8.5 pr-7 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="w-52">
              <Select
                value={FILTROS_STATUS_SAUDE.find((s) => s.value === filtroStatus)}
                onChange={(op) => setFiltroStatus(op?.value || 'TODOS')}
                options={FILTROS_STATUS_SAUDE}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>

            <div className="w-56">
              <Select
                value={opcoesServicos.find((s) => s.value === filtroServico)}
                onChange={(op) => setFiltroServico(op?.value || 'TODOS')}
                options={opcoesServicos}
                styles={customSelectStyles}
                isSearchable
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
