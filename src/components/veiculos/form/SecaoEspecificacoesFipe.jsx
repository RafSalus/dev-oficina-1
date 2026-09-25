import React from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { Car } from '@phosphor-icons/react'
import { customSelectStylesCompact } from './selectStylesCompact'
import { COMBUSTIVEL_OPCOES } from '../../../hooks/useVeiculoModalWorkflow'

export function SecaoEspecificacoesFipe({ workflow }) {
  const {
    formData,
    alterar,
    marcasFipe,
    carregandoMarcas,
    modelosFipe,
    carregandoModelos,
    anosFipe,
    carregandoAnos,
    selecionarMarca,
    selecionarModelo,
    selecionarAno,
  } = workflow

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Car size={16} className="text-sky-600" />
          <span>Especificações Técnicas e Tabela FIPE</span>
        </div>
        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          Apenas Especificações Técnicas (Sem Preços)
        </span>
      </div>

      <div className="grid grid-cols-1 @sm:grid-cols-12 gap-3">
        {/* Marca FIPE */}
        <div className="@sm:col-span-4">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Marca (Montadora) <span className="text-rose-500">*</span>
          </label>
          <CreatableSelect
            value={
              marcasFipe.find(
                (m) =>
                  m.value === formData.marcaCodigo ||
                  m.label.toLowerCase() === (formData.marca || '').toLowerCase()
              ) ||
              (formData.marca
                ? { value: formData.marca, label: formData.marca }
                : null)
            }
            onChange={selecionarMarca}
            options={marcasFipe}
            isLoading={carregandoMarcas}
            styles={customSelectStylesCompact}
            placeholder={
              carregandoMarcas
                ? 'Buscando marcas FIPE...'
                : 'Selecione a montadora...'
            }
            isSearchable
            isClearable
            noOptionsMessage={() =>
              carregandoMarcas
                ? 'Carregando FIPE...'
                : 'Nenhuma marca encontrada'
            }
            formatCreateLabel={(val) => `Usar: "${val}"`}
          />
        </div>

        {/* Modelo FIPE */}
        <div className="@sm:col-span-5">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Modelo do Veículo <span className="text-rose-500">*</span>
          </label>
          <CreatableSelect
            value={
              modelosFipe.find(
                (m) =>
                  m.value === formData.modeloCodigo ||
                  m.label.toLowerCase() === (formData.modelo || '').toLowerCase()
              ) ||
              (formData.modelo
                ? { value: formData.modelo, label: formData.modelo }
                : null)
            }
            onChange={selecionarModelo}
            options={modelosFipe}
            isLoading={carregandoModelos}
            isDisabled={!formData.marca || carregandoModelos}
            styles={customSelectStylesCompact}
            placeholder={
              !formData.marca
                ? 'Selecione a montadora primeiro...'
                : carregandoModelos
                ? 'Buscando modelos FIPE...'
                : 'Selecione o modelo...'
            }
            isSearchable
            isClearable
            noOptionsMessage={() =>
              !formData.marca
                ? 'Selecione a marca primeiro'
                : carregandoModelos
                ? 'Carregando FIPE...'
                : 'Nenhum modelo encontrado'
            }
            formatCreateLabel={(val) => `Usar: "${val}"`}
          />
        </div>

        {/* Ano / Versão FIPE */}
        <div className="@sm:col-span-3">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Ano / Versão{' '}
            {anosFipe.length > 0 && (
              <span className="text-[10px] text-sky-600 font-semibold">(FIPE)</span>
            )}
          </label>
          {anosFipe.length > 0 ? (
            <CreatableSelect
              value={
                anosFipe.find(
                  (a) =>
                    a.value === formData.anoCodigo ||
                    a.ano === formData.ano ||
                    a.label.includes(formData.ano)
                ) ||
                (formData.ano
                  ? { value: formData.ano, label: formData.ano }
                  : null)
              }
              onChange={selecionarAno}
              options={anosFipe}
              isLoading={carregandoAnos}
              styles={customSelectStylesCompact}
              placeholder="Ano FIPE..."
              isSearchable
              isClearable
              formatCreateLabel={(val) => `Ano: "${val}"`}
            />
          ) : (
            <input
              type="text"
              value={formData.ano}
              onChange={(e) => alterar('ano', e.target.value)}
              placeholder="2021/2022"
              className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono text-slate-900"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 @sm:grid-cols-12 gap-3 pt-1">
        {/* Cor */}
        <div className="@sm:col-span-4">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Cor do Veículo
          </label>
          <input
            type="text"
            value={formData.cor}
            onChange={(e) => alterar('cor', e.target.value)}
            placeholder="Ex: Branco Banchisa, Prata..."
            className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none text-slate-900"
          />
        </div>

        {/* Combustível */}
        <div className="@sm:col-span-4">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Combustível
          </label>
          <Select
            value={COMBUSTIVEL_OPCOES.find(
              (opt) => opt.value === formData.combustivel
            )}
            onChange={(opt) =>
              alterar('combustivel', opt ? opt.value : 'FLEX')
            }
            options={COMBUSTIVEL_OPCOES}
            styles={customSelectStylesCompact}
            placeholder="Combustível"
            isSearchable={false}
          />
        </div>

        {/* Quilometragem Atual */}
        <div className="@sm:col-span-4">
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Quilometragem (KM Atual)
          </label>
          <input
            type="text"
            value={formData.kmPadrao}
            onChange={(e) => alterar('kmPadrao', e.target.value)}
            placeholder="Ex: 89.300"
            className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 outline-none font-mono text-slate-900"
          />
        </div>
      </div>
    </div>
  )
}
