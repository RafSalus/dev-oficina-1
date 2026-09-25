import React from 'react'
import Select from 'react-select'
import { User } from '@phosphor-icons/react'
import { customSelectStylesCompact } from './selectStylesCompact'

export function SecaoClienteProprietario({ workflow }) {
  const { clienteSelecionado, selecionarCliente, opcoesClientes } = workflow

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
        <User size={16} className="text-sky-600" />
        <span>Cliente Proprietário / Frotista</span>
        <span className="text-rose-500">*</span>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-slate-700 mb-1">
          Localizar Cliente na Base <span className="text-rose-500">*</span>
        </label>
        <Select
          value={clienteSelecionado}
          onChange={selecionarCliente}
          options={opcoesClientes}
          styles={customSelectStylesCompact}
          placeholder="Digite o nome, código ou telefone do cliente..."
          isSearchable
          isClearable
          noOptionsMessage={() => 'Nenhum cliente cadastrado'}
        />
        <p className="text-[11px] text-slate-400 mt-1">
          O veículo será vinculado diretamente ao histórico cadastral do cliente selecionado.
        </p>
      </div>
    </div>
  )
}
