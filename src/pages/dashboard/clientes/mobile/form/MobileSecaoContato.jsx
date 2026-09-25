import React from 'react'
import { IMaskInput } from 'react-imask'
import { Phone } from '@phosphor-icons/react'
import {
  inputBaseClass,
  labelBaseClass,
} from '../../../nova-os/mobile/mobileSelectStyles'

export function MobileSecaoContato({ formData, handleChange }) {
  return (
    <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
        <Phone size={14} weight="bold" className="text-[#0284c7]" />
        Contato
      </h3>
      <div>
        <label className={labelBaseClass}>Celular ou WhatsApp *</label>
        <IMaskInput
          mask="(00) 00000-0000"
          value={formData.telefone}
          onAccept={(val) => handleChange('telefone', val)}
          placeholder="(43) 99999-9999"
          className={`${inputBaseClass} font-mono`}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBaseClass}>Telefone Fixo</label>
          <IMaskInput
            mask="(00) 0000-0000"
            value={formData.telefoneFixo}
            onAccept={(val) => handleChange('telefoneFixo', val)}
            placeholder="(43) 3333-3333"
            className={`${inputBaseClass} font-mono`}
          />
        </div>
        <div>
          <label className={labelBaseClass}>E-mail</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="cliente@email.com"
            className={inputBaseClass}
          />
        </div>
      </div>
    </section>
  )
}
