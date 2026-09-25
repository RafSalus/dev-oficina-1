import React from 'react'
import { IMaskInput } from 'react-imask'
import { SealCheck } from '@phosphor-icons/react'

export function SecaoGarantiaPreventiva({
  garantiaPendente,
  setGarantiaPendente,
  servicoOrigem,
  setServicoOrigem,
  prazoGarantiaLimite,
  setPrazoGarantiaLimite,
}) {
  return (
    <div className="border border-sky-200 bg-sky-50/50 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SealCheck size={18} className="text-sky-700" />
          <div>
            <strong className="text-xs text-sky-950 block">Revisão Periódica para Garantia</strong>
            <span className="text-[11px] text-sky-700">
              Exigir retorno na oficina em data estipulada para inspeção e manutenção de garantia
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={garantiaPendente}
            onChange={(e) => setGarantiaPendente(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
        </label>
      </div>

      {garantiaPendente && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-sky-200/60">
          <div>
            <label className="block text-[11px] font-semibold text-sky-900 mb-1">
              Serviço / Peça de Origem da Garantia
            </label>
            <input
              type="text"
              value={servicoOrigem}
              onChange={(e) => setServicoOrigem(e.target.value)}
              placeholder="Ex: Troca de kit de embreagem / Amortecedores"
              className="w-full h-8.5 px-2.5 rounded-lg border border-sky-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sky-900 mb-1">
              Data Limite de Retorno (Revisão de Garantia)
            </label>
            <IMaskInput
              mask="00/00/0000"
              value={prazoGarantiaLimite}
              onAccept={(val) => setPrazoGarantiaLimite(val)}
              placeholder="DD/MM/AAAA"
              className="w-full h-8.5 px-2.5 rounded-lg border border-sky-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
