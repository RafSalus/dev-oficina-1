import React from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import { MapPin, MagnifyingGlass, CircleNotch } from '@phosphor-icons/react'
import { ESTADOS_BRASIL_OPCOES } from '../../../../../constants/cadastrosSuprimentosData'
import {
  mobileSelectStyles,
  inputBaseClass,
  labelBaseClass,
} from '../../../nova-os/mobile/mobileSelectStyles'

export function MobileSecaoEndereco({
  formData,
  handleChange,
  buscandoCep,
  buscarEnderecoPorCep,
  numeroInputRef,
}) {
  const ufSelecionada =
    ESTADOS_BRASIL_OPCOES.find((o) => o.value === formData.uf) || null

  return (
    <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
        <MapPin size={14} weight="bold" className="text-[#0284c7]" />
        Endereço
      </h3>

      <div>
        <label className={labelBaseClass}>CEP</label>
        <div className="relative">
          <IMaskInput
            mask="00000-000"
            value={formData.cep}
            onAccept={(val) => {
              handleChange('cep', val)
              if (val.replace(/\D/g, '').length === 8) buscarEnderecoPorCep(val)
            }}
            placeholder="00000-000"
            className={`${inputBaseClass} font-mono pr-10`}
          />
          <button
            type="button"
            onClick={() => buscarEnderecoPorCep(formData.cep)}
            disabled={buscandoCep}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] cursor-pointer"
          >
            {buscandoCep ? (
              <CircleNotch size={16} className="animate-spin text-[#0284c7]" />
            ) : (
              <MagnifyingGlass size={16} />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className={labelBaseClass}>Logradouro</label>
        <input
          type="text"
          value={formData.logradouro}
          onChange={(e) => handleChange('logradouro', e.target.value)}
          placeholder="Rua, Avenida..."
          className={inputBaseClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBaseClass}>Número</label>
          <input
            ref={numeroInputRef}
            type="text"
            value={formData.numero}
            onChange={(e) => handleChange('numero', e.target.value)}
            placeholder="Nº ou S/N"
            className={inputBaseClass}
          />
        </div>
        <div>
          <label className={labelBaseClass}>Complemento</label>
          <input
            type="text"
            value={formData.complemento}
            onChange={(e) => handleChange('complemento', e.target.value)}
            placeholder="Apto, Casa..."
            className={inputBaseClass}
          />
        </div>
      </div>

      <div>
        <label className={labelBaseClass}>Bairro</label>
        <input
          type="text"
          value={formData.bairro}
          onChange={(e) => handleChange('bairro', e.target.value)}
          placeholder="Bairro"
          className={inputBaseClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBaseClass}>Cidade</label>
          <input
            type="text"
            value={formData.cidade}
            onChange={(e) => handleChange('cidade', e.target.value)}
            placeholder="Apucarana"
            className={inputBaseClass}
          />
        </div>
        <div>
          <label className={labelBaseClass}>UF</label>
          <Select
            value={ufSelecionada}
            onChange={(opt) => handleChange('uf', opt ? opt.value : 'PR')}
            options={ESTADOS_BRASIL_OPCOES}
            styles={mobileSelectStyles}
            placeholder="UF"
          />
        </div>
      </div>
    </section>
  )
}
