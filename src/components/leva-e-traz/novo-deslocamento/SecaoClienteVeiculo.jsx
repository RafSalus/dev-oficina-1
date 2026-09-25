import React from 'react'
import Select from 'react-select'
import { User } from '@phosphor-icons/react'
import { customSelectStyles } from '../../suprimentos/customSelectStyles'

export function SecaoClienteVeiculo({
  clienteSelecionado,
  handleSelectCliente,
  opcoesClientes,
  veiculoClienteSelecionado,
  setVeiculoClienteSelecionado,
  opcoesVeiculosCliente,
  numeroOS,
  setNumeroOS,
  levarClienteEmbora,
  setLevarClienteEmbora,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
        <User size={14} className="text-sky-600" />
        <span>Dados do Cliente e Veículo Atendido</span>
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Cliente Proprietário</label>
          <Select
            value={clienteSelecionado}
            onChange={handleSelectCliente}
            options={opcoesClientes}
            styles={customSelectStyles}
            placeholder="Pesquise por nome do cliente ou telefone..."
            isSearchable
            noOptionsMessage={() => 'Nenhum cliente encontrado'}
          />
        </div>

        <div className="sm:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Veículo do Cliente</label>
          {opcoesVeiculosCliente.length > 0 ? (
            <Select
              value={veiculoClienteSelecionado}
              onChange={setVeiculoClienteSelecionado}
              options={opcoesVeiculosCliente}
              styles={customSelectStyles}
              placeholder="Selecione o veículo..."
              isSearchable={false}
            />
          ) : (
            <input
              type="text"
              value={veiculoClienteSelecionado?.veiculo?.marcaModelo || ''}
              onChange={(e) =>
                setVeiculoClienteSelecionado({
                  value: e.target.value,
                  label: e.target.value,
                  veiculo: { marcaModelo: e.target.value, placa: '' },
                })
              }
              placeholder="Placa ou modelo do veículo..."
              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600"
            />
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">Nº da OS (Opcional)</label>
          <input
            type="text"
            value={numeroOS}
            onChange={(e) => setNumeroOS(e.target.value)}
            placeholder="Ex: 002908"
            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600"
          />
        </div>
      </div>

      {/* Checkbox em Destaque: Levar Cliente Embora */}
      <div className="mt-2 bg-sky-50/60 border border-sky-100 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="chk-levar-cliente"
            checked={levarClienteEmbora}
            onChange={(e) => setLevarClienteEmbora(e.target.checked)}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
          />
          <label htmlFor="chk-levar-cliente" className="text-xs font-bold text-slate-800 cursor-pointer">
            Levar cliente embora / Dar carona de retorno após deixar o veículo na oficina
          </label>
        </div>
        <span className="text-[11px] font-semibold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 shrink-0">
          {levarClienteEmbora ? 'Carona Ativa' : 'Sem translado'}
        </span>
      </div>
    </div>
  )
}
