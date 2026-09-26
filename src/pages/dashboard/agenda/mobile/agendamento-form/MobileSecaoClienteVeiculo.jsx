import React from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import { User, Car } from '@phosphor-icons/react'
import { mobileSelectStyles, inputBaseClass, labelBaseClass } from '../../../nova-os/mobile/mobileSelectStyles'

export const secaoMobileClass = 'bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3'

export function TituloSecaoMobile({ icone: Icone, children }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
      <Icone size={14} weight="bold" className="text-[#0284c7]" />
      {children}
    </h3>
  )
}

export function MobileSecaoCliente({ form }) {
  return (
    <section className={secaoMobileClass}>
      <TituloSecaoMobile icone={User}>Cliente</TituloSecaoMobile>
      <div>
        <label className={labelBaseClass}>Cliente Cadastrado</label>
        <Select
          options={form.opcoesClientes}
          value={form.opcoesClientes.find((o) => o.value === form.clienteSelecionadoId) || null}
          onChange={form.selecionarCliente}
          styles={mobileSelectStyles}
          placeholder="Buscar por nome ou telefone..."
          isClearable
          noOptionsMessage={() => 'Nenhum cliente cadastrado'}
        />
      </div>
      <div>
        <label className={labelBaseClass}>Nome do Cliente *</label>
        <input
          type="text"
          value={form.clienteNome}
          onChange={(e) => form.setClienteNome(e.target.value)}
          placeholder="Ex: João da Silva"
          className={inputBaseClass}
        />
      </div>
      <div>
        <label className={labelBaseClass}>Telefone / WhatsApp</label>
        <IMaskInput
          mask="(00) 00000-0000"
          value={form.clienteTelefone}
          onAccept={(val) => form.setClienteTelefone(val)}
          placeholder="(00) 00000-0000"
          className={inputBaseClass}
        />
      </div>
    </section>
  )
}

export function MobileSecaoVeiculo({ form }) {
  return (
    <section className={secaoMobileClass}>
      <TituloSecaoMobile icone={Car}>Veículo</TituloSecaoMobile>

      {form.opcoesVeiculosCliente.length > 0 && (
        <div>
          <label className={labelBaseClass}>Veículo do Cliente</label>
          <Select
            options={form.opcoesVeiculosCliente}
            value={form.opcoesVeiculosCliente.find((o) => o.value === form.veiculoSelecionadoId) || null}
            onChange={form.selecionarVeiculo}
            styles={mobileSelectStyles}
            placeholder="Selecione o veículo..."
            isClearable
          />
        </div>
      )}

      <div>
        <label className={labelBaseClass}>Modelo do Veículo *</label>
        <input
          type="text"
          value={form.veiculoModelo}
          onChange={(e) => form.setVeiculoModelo(e.target.value)}
          placeholder="Ex: Chevrolet Onix 1.0 Flex"
          className={inputBaseClass}
        />
      </div>

      <div>
        <label className={labelBaseClass}>Placa</label>
        <IMaskInput
          mask={[{ mask: 'aaa0a00' }, { mask: 'aaa-0000' }]}
          prepareChar={(str) => str.toUpperCase()}
          definitions={{ a: /[A-Za-z]/, 0: /[0-9]/ }}
          value={form.veiculoPlaca}
          onAccept={(val) => form.setVeiculoPlaca(val.toUpperCase())}
          placeholder="ABC1D23"
          className={`${inputBaseClass} font-mono uppercase`}
        />
      </div>
    </section>
  )
}
