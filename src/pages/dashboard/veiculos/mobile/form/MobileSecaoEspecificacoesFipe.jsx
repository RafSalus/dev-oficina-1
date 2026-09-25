import React from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { Car } from '@phosphor-icons/react'
import {
  mobileSelectStyles,
  inputBaseClass,
  labelBaseClass,
} from '../../../nova-os/mobile/mobileSelectStyles'
import { COMBUSTIVEL_OPCOES } from '../../../../../hooks/useVeiculoModalWorkflow'

export function MobileSecaoEspecificacoesFipe({ workflow }) {
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
    <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
        <Car size={14} weight="bold" className="text-[#0284c7]" />
        Especificações e Tabela FIPE
      </h3>

      <div>
        <label className={labelBaseClass}>Marca (Montadora) *</label>
        <CreatableSelect
          value={
            marcasFipe.find(
              (m) =>
                m.value === formData.marcaCodigo ||
                m.label.toLowerCase() === (formData.marca || '').toLowerCase()
            ) ||
            (formData.marca ? { value: formData.marca, label: formData.marca } : null)
          }
          onChange={selecionarMarca}
          options={marcasFipe}
          isLoading={carregandoMarcas}
          styles={mobileSelectStyles}
          placeholder={
            carregandoMarcas ? 'Buscando marcas FIPE...' : 'Selecione a montadora...'
          }
          isClearable
          formatCreateLabel={(val) => `Usar: "${val}"`}
        />
      </div>

      <div>
        <label className={labelBaseClass}>Modelo *</label>
        <CreatableSelect
          value={
            modelosFipe.find(
              (m) =>
                m.value === formData.modeloCodigo ||
                m.label.toLowerCase() === (formData.modelo || '').toLowerCase()
            ) ||
            (formData.modelo ? { value: formData.modelo, label: formData.modelo } : null)
          }
          onChange={selecionarModelo}
          options={modelosFipe}
          isLoading={carregandoModelos}
          isDisabled={!formData.marca || carregandoModelos}
          styles={mobileSelectStyles}
          placeholder={
            !formData.marca
              ? 'Selecione a montadora primeiro...'
              : carregandoModelos
              ? 'Buscando modelos...'
              : 'Selecione o modelo...'
          }
          isClearable
          formatCreateLabel={(val) => `Usar: "${val}"`}
        />
      </div>

      <div>
        <label className={labelBaseClass}>
          Ano/Versão {anosFipe.length > 0 && '(FIPE)'}
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
              (formData.ano ? { value: formData.ano, label: formData.ano } : null)
            }
            onChange={selecionarAno}
            options={anosFipe}
            isLoading={carregandoAnos}
            styles={mobileSelectStyles}
            placeholder="Ano FIPE..."
            isClearable
            formatCreateLabel={(val) => `Ano: "${val}"`}
          />
        ) : (
          <input
            type="text"
            value={formData.ano}
            onChange={(e) => alterar('ano', e.target.value)}
            placeholder="2021/2022"
            className={`${inputBaseClass} font-mono`}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBaseClass}>Cor</label>
          <input
            type="text"
            value={formData.cor}
            onChange={(e) => alterar('cor', e.target.value)}
            placeholder="Branco Banchisa"
            className={inputBaseClass}
          />
        </div>
        <div>
          <label className={labelBaseClass}>Combustível</label>
          <Select
            value={COMBUSTIVEL_OPCOES.find((o) => o.value === formData.combustivel)}
            onChange={(opt) =>
              alterar('combustivel', opt ? opt.value : 'FLEX')
            }
            options={COMBUSTIVEL_OPCOES}
            styles={mobileSelectStyles}
            isSearchable={false}
          />
        </div>
      </div>

      <div>
        <label className={labelBaseClass}>Quilometragem (KM Atual)</label>
        <input
          type="text"
          value={formData.kmPadrao}
          onChange={(e) => alterar('kmPadrao', e.target.value)}
          placeholder="Ex: 89.300"
          className={`${inputBaseClass} font-mono`}
        />
      </div>
    </section>
  )
}
