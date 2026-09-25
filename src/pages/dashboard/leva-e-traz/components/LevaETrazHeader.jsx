import React from 'react'
import Select from 'react-select'
import {
  ArrowsLeftRight,
  Plus,
  Play,
  Clock,
  Car,
  Package,
  Gauge,
  ListDashes,
  ClockCounterClockwise,
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react'
import { customSelectStyles } from '../../../../components/suprimentos/customSelectStyles'
import { TIPOS_SERVICO_LOGISTICA } from '../../../../constants/mockLevaETraz'
import { FILTRO_EQUIPE_OPCOES } from '../../../../hooks/useLevaETrazWorkflow'

export function LevaETrazHeader({
  metricas,
  abaAtiva,
  setAbaAtiva,
  busca,
  setBusca,
  filtroTipo,
  setFiltroTipo,
  filtroEquipe,
  setFiltroEquipe,
  temFiltroAtivo,
  onLimparFiltros,
  onNovoDeslocamento,
}) {
  return (
    <>
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <ArrowsLeftRight size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Leva e Traz e Logística</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total} missões registradas
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Gestão operacional de busca e entrega de veículos, translado de clientes, coleta de peças e socorro externo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNovoDeslocamento}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Novo Deslocamento</span>
          </button>
        </div>

        {/* Resumo de Indicadores da Operação Logística */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Em Deslocamento
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.emRota} em rota</span>
            </div>
            <Play size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Agendados na Fila
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.agendados}</span>
            </div>
            <Clock size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Carros de Clientes
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.veiculosClientes}</span>
            </div>
            <Car size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Busca de Peças
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.coletaPecas}</span>
            </div>
            <Package size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Quilometragem Total
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.kmTotal} km</span>
            </div>
            <Gauge size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Abas e Filtros */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Abas Operacionais */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setAbaAtiva('roteiro')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              abaAtiva === 'roteiro'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListDashes size={15} className={abaAtiva === 'roteiro' ? 'text-sky-600' : ''} />
            <span>Fila e Roteiro Ativo</span>
            {metricas.emRota > 0 && (
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('historico')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              abaAtiva === 'historico'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClockCounterClockwise size={15} className={abaAtiva === 'historico' ? 'text-sky-600' : ''} />
            <span>Histórico de Viagens</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('frota_apoio')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              abaAtiva === 'frota_apoio'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car size={15} className={abaAtiva === 'frota_apoio' ? 'text-sky-600' : ''} />
            <span>Veículos de Apoio</span>
          </button>
        </div>

        {/* Campo de Busca Rápida e Filtros */}
        {abaAtiva !== 'frota_apoio' && (
          <div className="flex-1 flex items-center gap-2 max-w-xl justify-end">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por cliente, fornecedor, placa, motorista ou endereço..."
                className="w-full h-8.5 pl-8.5 pr-7 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="w-44 shrink-0">
              <Select
                value={TIPOS_SERVICO_LOGISTICA.find((opt) => opt.value === filtroTipo)}
                onChange={(opt) => setFiltroTipo(opt ? opt.value : 'TODOS')}
                options={TIPOS_SERVICO_LOGISTICA}
                styles={customSelectStyles}
                placeholder="Tipo de Serviço"
                isSearchable={false}
              />
            </div>

            <div className="w-40 shrink-0">
              <Select
                value={FILTRO_EQUIPE_OPCOES.find((opt) => opt.value === filtroEquipe)}
                onChange={(opt) => setFiltroEquipe(opt ? opt.value : 'TODOS')}
                options={FILTRO_EQUIPE_OPCOES}
                styles={customSelectStyles}
                placeholder="Equipe"
                isSearchable={false}
              />
            </div>

            {temFiltroAtivo && (
              <button
                type="button"
                onClick={onLimparFiltros}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Limpar todos os filtros"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
