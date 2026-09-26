import React from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { IMaskInput } from 'react-imask'
import { Car, Plus } from '@phosphor-icons/react'
import { COMBUSTIVEL_OPCOES } from '../../../utils/clientes/clienteFormulario'
import { selectStylesCompacto } from './clienteSelectStyles'

const ROTULO = 'block text-[11px] font-medium text-slate-700 mb-1'
const INPUT = 'w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none'

/** Opção atual do select: a da lista FIPE que casa com o valor, ou uma opção livre. */
function opcaoAtual(lista, casa, texto) {
  return lista.find(casa) || (texto ? { value: texto, label: texto } : null)
}

/**
 * Mini-formulário de inclusão de veículo com Tabela FIPE integrada
 * (Marca → Modelo → Ano), placa Mercosul/antiga, cor, combustível e KM.
 * @param {{veiculos: object}} props - `veiculos` de `useClienteForm()`.
 */
export function FormNovoVeiculoCliente({ veiculos }) {
  const { fipe } = veiculos
  const { veiculo, carregando } = fipe
  const iguais = (a, b) => (a || '').toLowerCase() === (b || '').toLowerCase()

  return (
    <div className="bg-white border border-sky-200 rounded-lg p-3.5 space-y-3 shadow-xs">
      <div className="text-xs font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sky-700">
          <Car size={15} weight="bold" />
          <span>Novo Veículo para o Cliente</span>
          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            Tabela FIPE Integrada
          </span>
        </div>
        <button type="button" onClick={veiculos.fecharInclusao} className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer">
          Cancelar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className={ROTULO}>Código Veículo</label>
          <div className="relative">
            <input
              type="text"
              value={veiculo.codigoVeiculo || 'Gerado ao salvar'}
              readOnly
              tabIndex={-1}
              className="w-full h-9 px-2 text-xs bg-slate-100 border border-slate-300 rounded-md text-slate-600 font-mono font-bold cursor-not-allowed select-none"
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-sky-600 bg-sky-50 px-1 py-0.2 rounded border border-sky-200">
              AUTO
            </span>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label className={ROTULO}>
            Placa <span className="text-rose-500">*</span>
          </label>
          <IMaskInput
            mask={[{ mask: 'aaa0a00' }, { mask: 'aaa-0000' }]}
            prepareChar={(str) => str.toUpperCase()}
            definitions={{ a: /[A-Za-z]/, 0: /[0-9]/ }}
            value={veiculo.placa}
            onAccept={(val) => fipe.alterar('placa', val.toUpperCase())}
            placeholder="ABC1D23"
            className={`${INPUT} font-mono uppercase font-bold text-slate-900`}
          />
        </div>

        <div className="sm:col-span-3">
          <label className={ROTULO}>
            Marca (FIPE) <span className="text-rose-500">*</span>
          </label>
          <CreatableSelect
            value={opcaoAtual(fipe.marcas, (m) => m.value === veiculo.marcaCodigo || iguais(m.label, veiculo.marca), veiculo.marca)}
            onChange={fipe.selecionarMarca}
            options={fipe.marcas}
            isLoading={carregando.marcas}
            styles={selectStylesCompacto}
            placeholder={carregando.marcas ? 'Buscando marcas...' : 'Selecione a marca...'}
            isSearchable
            isClearable
            noOptionsMessage={() => (carregando.marcas ? 'Carregando FIPE...' : 'Nenhuma marca encontrada')}
            formatCreateLabel={(val) => `Usar: "${val}"`}
          />
        </div>

        <div className="sm:col-span-4">
          <label className={ROTULO}>
            Modelo (FIPE) <span className="text-rose-500">*</span>
          </label>
          <CreatableSelect
            value={opcaoAtual(fipe.modelos, (m) => m.value === veiculo.modeloCodigo || iguais(m.label, veiculo.modelo), veiculo.modelo)}
            onChange={fipe.selecionarModelo}
            options={fipe.modelos}
            isLoading={carregando.modelos}
            isDisabled={!veiculo.marca || carregando.modelos}
            styles={selectStylesCompacto}
            placeholder={
              !veiculo.marca ? 'Selecione a marca primeiro...' : carregando.modelos ? 'Carregando modelos FIPE...' : 'Selecione o modelo...'
            }
            isSearchable
            isClearable
            noOptionsMessage={() =>
              !veiculo.marca ? 'Selecione a marca primeiro' : carregando.modelos ? 'Carregando FIPE...' : 'Nenhum modelo encontrado'
            }
            formatCreateLabel={(val) => `Usar: "${val}"`}
          />
        </div>

        <div className="sm:col-span-3">
          <label className={ROTULO}>
            Ano / Mod. {fipe.anos.length > 0 && <span className="text-[10px] text-sky-600 font-semibold">(FIPE)</span>}
          </label>
          {fipe.anos.length > 0 ? (
            <CreatableSelect
              value={opcaoAtual(
                fipe.anos,
                (a) => a.value === veiculo.anoCodigo || a.ano === veiculo.ano || a.label.includes(veiculo.ano),
                veiculo.ano
              )}
              onChange={fipe.selecionarAno}
              options={fipe.anos}
              isLoading={carregando.anos}
              styles={selectStylesCompacto}
              placeholder="Ano FIPE..."
              isSearchable
              isClearable
              formatCreateLabel={(val) => `Ano: "${val}"`}
            />
          ) : (
            <input
              type="text"
              value={veiculo.ano}
              onChange={(e) => fipe.alterar('ano', e.target.value)}
              placeholder="2021/2022"
              className={`${INPUT} font-mono`}
            />
          )}
        </div>

        <div className="sm:col-span-2">
          <label className={ROTULO}>Cor</label>
          <input type="text" value={veiculo.cor} onChange={(e) => fipe.alterar('cor', e.target.value)} placeholder="Branca" className={INPUT} />
        </div>

        <div className="sm:col-span-2">
          <label className={ROTULO}>Combustível</label>
          <Select
            value={COMBUSTIVEL_OPCOES.find((opt) => opt.value === veiculo.combustivel)}
            onChange={(opt) => fipe.alterar('combustivel', opt ? opt.value : 'FLEX')}
            options={COMBUSTIVEL_OPCOES}
            styles={selectStylesCompacto}
            placeholder="Combustível"
            isSearchable={false}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={ROTULO}>KM</label>
          <input
            type="text"
            value={veiculo.kmPadrao}
            onChange={(e) => fipe.alterar('kmPadrao', e.target.value)}
            placeholder="280.812"
            className={`${INPUT} font-mono`}
          />
        </div>

        <div className="sm:col-span-3 flex flex-col justify-end">
          <label className="block text-[11px] font-medium text-transparent mb-1 select-none pointer-events-none">Ação</label>
          <button
            type="button"
            onClick={veiculos.incluir}
            className="w-full h-9 px-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} weight="bold" />
            <span>Incluir Veículo</span>
          </button>
        </div>
      </div>
    </div>
  )
}
