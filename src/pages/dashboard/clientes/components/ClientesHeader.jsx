import React from 'react'
import Select from 'react-select'
import {
  Users,
  Plus,
  MagnifyingGlass,
  User,
  Buildings,
  Car,
} from '@phosphor-icons/react'
import { customSelectStyles } from '../../../../components/suprimentos/customSelectStyles'
import {
  FILTRO_TIPO_OPCOES,
  FILTRO_STATUS_OPCOES,
  FILTRO_VEICULOS_OPCOES,
} from '../../../../hooks/useClientesWorkflow'

export function ClientesHeader({ workflow }) {
  const {
    metricas,
    busca,
    setBusca,
    filtroTipo,
    setFiltroTipo,
    filtroStatus,
    setFiltroStatus,
    filtroVeiculos,
    setFiltroVeiculos,
    abrirNovo,
  } = workflow

  return (
    <>
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Users size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Clientes e Frotistas</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Base cadastral de clientes, veículos vinculados, contatos e histórico para ordens de serviço
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirNovo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Resumo de Indicadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total de Clientes
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Users size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Pessoas Físicas (CPF)
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.totalPF}</span>
            </div>
            <User size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Pessoas Jurídicas (CNPJ)
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalPJ}</span>
            </div>
            <Buildings size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Veículos na Base
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.totalVeiculos}</span>
            </div>
            <Car size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center gap-3 shrink-0">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF, CNPJ, telefone, placa do veículo ou cidade..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
          />
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-56">
            <Select
              value={FILTRO_TIPO_OPCOES.find((opt) => opt.value === filtroTipo)}
              onChange={(opt) => setFiltroTipo(opt ? opt.value : 'TODOS')}
              options={FILTRO_TIPO_OPCOES}
              styles={customSelectStyles}
              placeholder="Tipo de Pessoa"
              isSearchable={false}
            />
          </div>

          <div className="w-full md:w-56">
            <Select
              value={FILTRO_VEICULOS_OPCOES.find((opt) => opt.value === filtroVeiculos)}
              onChange={(opt) => setFiltroVeiculos(opt ? opt.value : 'TODOS')}
              options={FILTRO_VEICULOS_OPCOES}
              styles={customSelectStyles}
              placeholder="Veículos"
              isSearchable={false}
            />
          </div>

          <div className="w-full md:w-44">
            <Select
              value={FILTRO_STATUS_OPCOES.find((opt) => opt.value === filtroStatus)}
              onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
              options={FILTRO_STATUS_OPCOES}
              styles={customSelectStyles}
              placeholder="Status"
              isSearchable={false}
            />
          </div>
        </div>
      </div>
    </>
  )
}
