import React from 'react'

export function SecaoRecorrenciaPreventiva({
  intervaloKm,
  setIntervaloKm,
  intervaloMeses,
  setIntervaloMeses,
  atualizarKmVeiculo,
  setAtualizarKmVeiculo,
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
        Parâmetros de Recorrência para o Próximo Vencimento
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Intervalo de Quilometragem (KM)
          </label>
          <div className="relative">
            <input
              type="number"
              value={intervaloKm}
              onChange={(e) => setIntervaloKm(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
              KM
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Intervalo de Tempo (Meses)
          </label>
          <div className="relative">
            <input
              type="number"
              value={intervaloMeses}
              onChange={(e) => setIntervaloMeses(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
              Meses
            </span>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 pt-1 cursor-pointer">
        <input
          type="checkbox"
          checked={atualizarKmVeiculo}
          onChange={(e) => setAtualizarKmVeiculo(e.target.checked)}
          className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
        />
        <span className="text-xs font-medium text-slate-700">
          Atualizar também o hodômetro geral do veículo para este KM
        </span>
      </label>
    </div>
  )
}
