import React from 'react'
import Select from 'react-select'
import { Car } from '@phosphor-icons/react'
import { customSelectStyles } from '../customSelectStyles'

const INPUT_BASE =
  'w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]'

function Campo({ rotulo, className = '', children }) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-slate-700 mb-1">{rotulo}</label>
      {children}
    </div>
  )
}

/**
 * Painel "Veículo e Ordem de Serviço da Cotação": vínculo com OS aberta e dados do veículo/cliente.
 * @param {{
 *   dados: object, opcoesOS: Array<object>, onSelecionarOS: Function,
 *   onAtualizarCampo: (campo: string, valor: string) => void
 * }} props
 */
export function CotacaoVeiculoPainel({ dados, opcoesOS, onSelecionarOS, onAtualizarCampo }) {
  const campo = (nome, transformar = (v) => v) => ({
    value: dados[nome],
    onChange: (e) => onAtualizarCampo(nome, transformar(e.target.value)),
  })

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Car size={20} className="text-[#0284c7]" weight="bold" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Veículo e Ordem de Serviço da Cotação
          </h2>
        </div>
        {dados.numeroOS && (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] border border-sky-200">
            OS Vinculada: #{dados.numeroOS}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Campo rotulo="Vincular Ordem de Serviço (OS)" className="sm:col-span-2">
          <Select
            value={opcoesOS.find((o) => o.value === dados.numeroOS) || opcoesOS[0]}
            onChange={onSelecionarOS}
            options={opcoesOS}
            styles={customSelectStyles}
            placeholder="Selecione uma OS aberta para puxar os dados..."
            isSearchable={true}
          />
        </Campo>

        <Campo rotulo="Placa do Veículo">
          <input
            type="text"
            {...campo('veiculoPlaca', (v) => v.toUpperCase())}
            placeholder="Ex: ASF6I46"
            className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] font-mono uppercase"
          />
        </Campo>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Campo rotulo="Marca e Modelo do Carro" className="sm:col-span-2">
          <input
            type="text"
            {...campo('veiculoModelo')}
            placeholder="Ex: Fiat Doblo 1.8 Cargo"
            className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
          />
        </Campo>

        <Campo rotulo="Ano / Fabricação">
          <input type="text" {...campo('ano')} placeholder="Ex: 2009/2010" className={INPUT_BASE} />
        </Campo>

        <Campo rotulo="KM Atual">
          <input type="text" {...campo('km')} placeholder="Ex: 280.812 km" className={INPUT_BASE} />
        </Campo>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo rotulo="Cliente Proprietário">
          <input type="text" {...campo('clienteNome')} placeholder="Nome do cliente" className={INPUT_BASE} />
        </Campo>

        <Campo rotulo="Mecânico Responsável">
          <input type="text" {...campo('mecanicoNome')} placeholder="Ex: Carlos Eduardo" className={INPUT_BASE} />
        </Campo>
      </div>
    </div>
  )
}
