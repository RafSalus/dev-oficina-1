import React from 'react'
import { IMaskInput } from 'react-imask'
import { IdentificationCard } from '@phosphor-icons/react'

export function SecaoIdentificacaoVeiculo({ workflow }) {
  const { formData, alterar, toggleAtivo } = workflow

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <IdentificationCard size={16} className="text-sky-600" />
          <span>Identificação e Placa</span>
        </div>

        {/* Status do Veículo */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium">Status na Frota:</span>
          <button
            type="button"
            onClick={toggleAtivo}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
              formData.ativo
                ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
            }`}
          >
            {formData.ativo ? 'Ativo na Frota' : 'Inativo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 @sm:grid-cols-12 gap-3">
        {/* Código do Veículo (Automático) */}
        <div className="@sm:col-span-3">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Código do Veículo
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.codigoVeiculo}
              readOnly
              tabIndex={-1}
              className="w-full h-9 px-2.5 text-xs bg-slate-100 border border-slate-300 rounded-md text-slate-600 font-mono font-bold cursor-not-allowed select-none"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
              AUTO
            </span>
          </div>
        </div>

        {/* Placa com Máscara Mercosul / Antiga */}
        <div className="@sm:col-span-3">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Placa <span className="text-rose-500">*</span>
          </label>
          <IMaskInput
            mask={[
              { mask: 'aaa0a00' },
              { mask: 'aaa-0000' },
            ]}
            prepareChar={(str) => str.toUpperCase()}
            definitions={{
              'a': /[A-Za-z]/,
              '0': /[0-9]/,
            }}
            value={formData.placa}
            onAccept={(val) => alterar('placa', val.toUpperCase())}
            placeholder="ABC1D23"
            className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono uppercase font-bold text-slate-900"
          />
        </div>

        {/* Chassi */}
        <div className="@sm:col-span-3">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Chassi (Opcional)
          </label>
          <input
            type="text"
            value={formData.chassi}
            maxLength={17}
            onChange={(e) => alterar('chassi', e.target.value.toUpperCase())}
            placeholder="9BWZZZ377VT..."
            className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono uppercase text-slate-800"
          />
        </div>

        {/* Renavam */}
        <div className="@sm:col-span-3">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Renavam (Opcional)
          </label>
          <input
            type="text"
            value={formData.renavam}
            maxLength={11}
            onChange={(e) => alterar('renavam', e.target.value.replace(/\D/g, ''))}
            placeholder="00123456789"
            className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono text-slate-800"
          />
        </div>
      </div>
    </div>
  )
}
