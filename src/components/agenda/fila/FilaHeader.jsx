import React from 'react'
import { Users, Plus, Clock, Car, ShieldCheck, WarningCircle } from '@phosphor-icons/react'

function Indicador({ rotulo, valor, icone, classeCard, classeRotulo, classeValor }) {
  return (
    <div className={`rounded-lg p-2.5 flex items-center justify-between ${classeCard}`}>
      <div>
        <span className={`block text-[10px] font-medium uppercase tracking-wider ${classeRotulo}`}>{rotulo}</span>
        <span className={`text-base font-bold ${classeValor}`}>{valor}</span>
      </div>
      {icone}
    </div>
  )
}

export function FilaHeader({ metricasFila, onInserirCliente }) {
  return (
    <>
      {/* 1. Barra de Ações Superior com Padrão Executivo */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
            <Users size={22} weight="bold" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Fila de Atendimento e Recepção</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {metricasFila.total} {metricasFila.total === 1 ? 'veículo' : 'veículos'}
              </span>
              {metricasFila.garantias > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0f172a] text-white">
                  {metricasFila.garantias} Garantia (Prioridade 1)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Ordem rigorosa de chegada com prioridade absoluta para Garantias e Retornos
            </p>
          </div>
        </div>

        {/* Botão de Ação no Padrão do Sistema */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onInserirCliente}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Inserir Cliente na Fila</span>
          </button>
        </div>
      </div>

      {/* 2. Indicadores Rápidos da Fila */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-white border-b border-slate-200 shrink-0">
        <Indicador
          rotulo="Total Aguardando"
          valor={metricasFila.total}
          icone={<Users size={20} className="text-slate-400" />}
          classeCard="bg-slate-50 border border-slate-200"
          classeRotulo="text-slate-500"
          classeValor="text-slate-900"
        />
        <Indicador
          rotulo="Garantias (Prioridade 1)"
          valor={metricasFila.garantias}
          icone={<ShieldCheck size={20} className="text-amber-400" weight="bold" />}
          classeCard="bg-slate-900 text-white shadow-xs"
          classeRotulo="text-slate-300"
          classeValor="text-white"
        />
        <Indicador
          rotulo="Retornos Técnicos"
          valor={metricasFila.retornos}
          icone={<Clock size={20} className="text-sky-600" />}
          classeCard="bg-sky-50 border border-sky-200"
          classeRotulo="text-sky-800"
          classeValor="text-sky-900"
        />
        <Indicador
          rotulo="Panes Urgentes"
          valor={metricasFila.urgentes}
          icone={<WarningCircle size={20} className="text-amber-600" />}
          classeCard="bg-amber-50 border border-amber-200"
          classeRotulo="text-amber-800"
          classeValor="text-amber-900"
        />
        <Indicador
          rotulo="Ordem de Chegada"
          valor={metricasFila.normais}
          icone={<Car size={20} className="text-slate-400" />}
          classeCard="bg-slate-50 border border-slate-200"
          classeRotulo="text-slate-500"
          classeValor="text-slate-800"
        />
      </div>
    </>
  )
}
