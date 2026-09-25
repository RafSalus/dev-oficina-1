import React from 'react'
import { Car, Plus, PencilSimple, Trash } from '@phosphor-icons/react'

export function AbaFrotaApoio({
  veiculosApoio,
  onNovoVeiculoApoio,
  onEditarVeiculoApoio,
}) {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-0 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Car size={16} className="text-sky-600" />
          <span>Status dos Veículos e Motos de Apoio da Oficina Gabriel</span>
        </h3>
        <button
          type="button"
          onClick={onNovoVeiculoApoio}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={14} weight="bold" />
          <span>Novo Veículo de Apoio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {veiculosApoio.map((v) => (
          <div
            key={v.id}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold bg-white text-slate-900 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                {v.placa}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  v.status === 'em_rota'
                    ? 'bg-[#101828] text-white'
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                }`}
              >
                {v.status === 'em_rota' ? 'Em Rota / Na Rua' : 'Disponível no Pátio'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">{v.nome}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {v.tipo} • {v.ano} • {v.combustivel}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hodômetro Atual:</span>
                <strong className="font-mono text-slate-900">{v.kmAtual} km</strong>
              </div>
              {v.emUsoPor && (
                <div className="flex items-center justify-between text-sky-800">
                  <span className="text-slate-500">Condutor Atual:</span>
                  <strong>{v.emUsoPor}</strong>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/70">
              <button
                type="button"
                onClick={() => onEditarVeiculoApoio(v)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <PencilSimple size={12} />
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={() => onEditarVeiculoApoio(v)}
                className="inline-flex items-center justify-center px-2 py-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-[11px] font-bold rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              >
                <Trash size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
