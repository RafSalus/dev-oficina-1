import React from 'react'
import Select from 'react-select'
import { User, Car } from '@phosphor-icons/react'
import { customSelectStyles } from '../../suprimentos/customSelectStyles'
import { inputClass, inputPlacaClass, labelClass, TituloSecao } from './estilosAgendamentoForm'

export function SecaoClienteAgendamento({ form }) {
  return (
    <div className="space-y-3">
      <TituloSecao icone={User}>1. Seleção do Cliente</TituloSecao>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className={labelClass}>Selecionar Cliente Cadastrado</label>
          <Select
            options={form.opcoesClientes}
            value={form.opcoesClientes.find((o) => o.value === form.clienteSelecionadoId) || null}
            onChange={form.selecionarCliente}
            styles={customSelectStyles}
            placeholder="Pesquise por nome do cliente ou telefone..."
            isClearable
            noOptionsMessage={() => 'Nenhum cliente cadastrado'}
          />
        </div>

        <div>
          <label className={labelClass}>Telefone / WhatsApp</label>
          <input
            type="text"
            value={form.clienteTelefone}
            onChange={(e) => form.setClienteTelefone(e.target.value)}
            placeholder="(43) 99999-9999"
            className={inputClass}
          />
        </div>
      </div>

      {/* Campo nome do cliente se não for selecionado do dropdown */}
      {!form.clienteSelecionadoId && (
        <div>
          <label className={labelClass}>Ou digite o Nome do Cliente (se não for cadastrado) *</label>
          <input
            type="text"
            required
            value={form.clienteNome}
            onChange={(e) => form.setClienteNome(e.target.value)}
            placeholder="Ex: João da Silva"
            className={inputClass}
          />
        </div>
      )}
    </div>
  )
}

export function SecaoVeiculoAgendamento({ form }) {
  const temVeiculosCliente = form.opcoesVeiculosCliente.length > 0

  const campoModelo = (rotulo, placeholder) => (
    <div>
      <label className={labelClass}>{rotulo}</label>
      <input
        type="text"
        required
        value={form.veiculoModelo}
        onChange={(e) => form.setVeiculoModelo(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )

  const campoPlaca = (rotulo, placeholder) => (
    <div>
      <label className={labelClass}>{rotulo}</label>
      <input
        type="text"
        value={form.veiculoPlaca}
        onChange={(e) => form.setVeiculoPlaca(e.target.value)}
        placeholder={placeholder}
        className={inputPlacaClass}
      />
    </div>
  )

  return (
    <div className="space-y-3">
      <TituloSecao icone={Car}>2. Veículo do Cliente</TituloSecao>

      {temVeiculosCliente ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Selecionar Veículo do Cliente</label>
            <Select
              options={form.opcoesVeiculosCliente}
              value={form.opcoesVeiculosCliente.find((o) => o.value === form.veiculoSelecionadoId) || null}
              onChange={form.selecionarVeiculo}
              styles={customSelectStyles}
              placeholder="Selecione o veículo do cliente..."
              isClearable
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {campoModelo('Modelo', 'Ex: Fiat Palio 1.0')}
            {campoPlaca('Placa', 'Ex: ABC1D23')}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {campoModelo('Modelo do Veículo *', 'Ex: Chevrolet Onix 1.0 Flex')}
          {campoPlaca('Placa do Veículo', 'Ex: BRA2E19')}
        </div>
      )}
    </div>
  )
}
