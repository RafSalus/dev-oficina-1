import React from 'react'
import Select from 'react-select'
import {
  Garage,
  Plus,
  MagnifyingGlass,
  UserPlus,
  User,
  ClockCounterClockwise,
  X,
} from '@phosphor-icons/react'
import { customSelectStyles } from '../../../../components/suprimentos/customSelectStyles'
import { FILTRO_SITUACAO_OPCOES } from '../../../../hooks/useEstacionadosWorkflow'

export function EstacionadosHeader({
  metricas,
  busca,
  setBusca,
  filtroSituacao,
  setFiltroSituacao,
  filtroMarca,
  setFiltroMarca,
  opcoesMarcas,
  temFiltroAtivo,
  onLimparFiltros,
  onAbrirEstacionar,
}) {
  return (
    <>
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Garage size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Veículos Estacionados</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total} veículos
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Veículos de clientes vendidos aguardando novo proprietário com histórico de manutenção preservado
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAbrirEstacionar}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Estacionar Veículo</span>
          </button>
        </div>

        {/* Resumo de Indicadores do Pátio de Estacionados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total Estacionados
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Garage size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Comprador Informado
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.comComprador}</span>
            </div>
            <UserPlus size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Aguardando Novo Dono
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.semComprador}</span>
            </div>
            <User size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Manutenções no Acervo
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalManutencoes} ordens</span>
            </div>
            <ClockCounterClockwise size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Campo de Busca Rápida */}
          <div className="sm:col-span-6 relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por placa, modelo, marca, antigo dono, comprador ou chassi..."
              className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtro por Situação do Novo Dono */}
          <div className="sm:col-span-3">
            <Select
              value={FILTRO_SITUACAO_OPCOES.find((opt) => opt.value === filtroSituacao)}
              onChange={(opt) => setFiltroSituacao(opt ? opt.value : 'TODOS')}
              options={FILTRO_SITUACAO_OPCOES}
              styles={customSelectStyles}
              placeholder="Situação do Dono"
              isSearchable={false}
            />
          </div>

          {/* Filtro por Marca */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <div className="flex-1">
              <Select
                value={opcoesMarcas.find((opt) => opt.value === filtroMarca)}
                onChange={(opt) => setFiltroMarca(opt ? opt.value : 'TODOS')}
                options={opcoesMarcas}
                styles={customSelectStyles}
                placeholder="Montadora"
                isSearchable
              />
            </div>
            {temFiltroAtivo && (
              <button
                type="button"
                onClick={onLimparFiltros}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Limpar todos os filtros"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
