import React from 'react'
import { IMaskInput } from 'react-imask'
import { IdentificationCard } from '@phosphor-icons/react'
import {
  inputBaseClass,
  labelBaseClass,
} from '../../../nova-os/mobile/mobileSelectStyles'

export function MobileSecaoIdentificacaoVeiculo({ workflow }) {
  const { formData, alterar } = workflow

  return (
    <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
          <IdentificationCard size={14} weight="bold" className="text-[#0284c7]" />
          Identificação
        </h3>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => alterar('ativo', e.target.checked)}
            className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-[#d0d5dd]"
          />
          <span className="text-[11px] font-bold text-[#344054]">Ativo na Frota</span>
        </label>
      </div>

      <div>
        <label className={labelBaseClass}>Placa *</label>
        <IMaskInput
          mask={[{ mask: 'aaa0a00' }, { mask: 'aaa-0000' }]}
          prepareChar={(str) => str.toUpperCase()}
          definitions={{ a: /[A-Za-z]/, 0: /[0-9]/ }}
          value={formData.placa}
          onAccept={(val) => alterar('placa', val.toUpperCase())}
          placeholder="ABC1D23"
          className={`${inputBaseClass} font-mono uppercase`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBaseClass}>Chassi</label>
          <input
            type="text"
            value={formData.chassi}
            maxLength={17}
            onChange={(e) => alterar('chassi', e.target.value.toUpperCase())}
            placeholder="9BWZZZ377VT..."
            className={`${inputBaseClass} font-mono uppercase`}
          />
        </div>
        <div>
          <label className={labelBaseClass}>Renavam</label>
          <input
            type="text"
            value={formData.renavam}
            maxLength={11}
            onChange={(e) => alterar('renavam', e.target.value.replace(/\D/g, ''))}
            placeholder="00123456789"
            className={`${inputBaseClass} font-mono`}
          />
        </div>
      </div>
    </section>
  )
}
