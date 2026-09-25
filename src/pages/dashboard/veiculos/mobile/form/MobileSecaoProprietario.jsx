import React from 'react'
import Select from 'react-select'
import { User } from '@phosphor-icons/react'
import {
  mobileSelectStyles,
  labelBaseClass,
} from '../../../nova-os/mobile/mobileSelectStyles'

export function MobileSecaoProprietario({ workflow }) {
  const { clienteSelecionado, selecionarCliente, opcoesClientes } = workflow

  return (
    <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
        <User size={14} weight="bold" className="text-[#0284c7]" />
        Cliente Proprietário
      </h3>
      <div>
        <label className={labelBaseClass}>Localizar Cliente *</label>
        <Select
          value={clienteSelecionado}
          onChange={selecionarCliente}
          options={opcoesClientes}
          styles={mobileSelectStyles}
          placeholder="Nome, código ou telefone..."
          isClearable
          noOptionsMessage={() => 'Nenhum cliente cadastrado'}
        />
      </div>
    </section>
  )
}
