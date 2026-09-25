import React from 'react'
import { IMaskInput } from 'react-imask'
import { User, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import {
  inputBaseClass,
  labelBaseClass,
} from '../../../nova-os/mobile/mobileSelectStyles'

export function MobileSecaoIdentificacao({
  formData,
  handleChange,
  documentoValido,
}) {
  const isPF = formData.tipoPessoa === 'F'

  return (
    <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
          <User size={14} weight="bold" className="text-[#0284c7]" />
          Identificação
        </h3>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => handleChange('ativo', e.target.checked)}
            className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-[#d0d5dd]"
          />
          <span className="text-[11px] font-bold text-[#344054]">Ativo</span>
        </label>
      </div>

      <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            handleChange('tipoPessoa', 'F')
            handleChange('documento', '')
          }}
          className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${
            isPF ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
          }`}
        >
          Pessoa Física (CPF)
        </button>
        <button
          type="button"
          onClick={() => {
            handleChange('tipoPessoa', 'J')
            handleChange('documento', '')
          }}
          className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${
            !isPF ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
          }`}
        >
          Pessoa Jurídica (CNPJ)
        </button>
      </div>

      <div>
        <label className={labelBaseClass}>
          {isPF ? 'Nome Completo' : 'Razão Social'} *
        </label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder={
            isPF ? 'Ex: Carlos Alberto da Silva' : 'Ex: Transportes Silva Ltda'
          }
          className={inputBaseClass}
        />
      </div>

      <div>
        <label className={labelBaseClass}>
          {isPF ? 'Apelido' : 'Nome Fantasia'}
        </label>
        <input
          type="text"
          value={formData.nomeFantasia}
          onChange={(e) => handleChange('nomeFantasia', e.target.value)}
          placeholder={isPF ? 'Ex: Beto' : 'Ex: Silva Transportes'}
          className={inputBaseClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBaseClass}>
            {isPF ? 'CPF' : 'CNPJ'} *
          </label>
          <div className="relative">
            <IMaskInput
              mask={isPF ? '000.000.000-00' : '00.000.000/0000-00'}
              value={formData.documento}
              onAccept={(val) => handleChange('documento', val)}
              placeholder={isPF ? '000.000.000-00' : '00.000.000/0000-00'}
              className={`${inputBaseClass} font-mono pr-10`}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {documentoValido ? (
                <CheckCircle size={16} className="text-[#0284c7]" weight="fill" />
              ) : formData.documento.length >= (isPF ? 11 : 14) ? (
                <WarningCircle size={16} className="text-rose-500" weight="fill" />
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <label className={labelBaseClass}>
            {isPF ? 'RG' : 'Inscrição Estadual'}
          </label>
          <input
            type="text"
            value={formData.rgIe}
            onChange={(e) => handleChange('rgIe', e.target.value.toUpperCase())}
            placeholder={isPF ? '12.345.678-9' : 'ISENTO'}
            className={`${inputBaseClass} font-mono`}
          />
        </div>
      </div>
    </section>
  )
}
