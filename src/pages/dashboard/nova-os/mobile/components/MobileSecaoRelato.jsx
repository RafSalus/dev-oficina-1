import React from 'react'
import { inputBaseClass, labelBaseClass } from '../mobileSelectStyles'

export function MobileSecaoRelato({ formData, updateFormData }) {
  return (
    <div className="bg-white p-3 rounded-2xl border border-[#d0d5dd] space-y-3">
      <label className={labelBaseClass}>Relato do Cliente / Sintomas Informados (Obrigatorio)</label>
      <textarea
        value={formData.relatoCliente || ''}
        onChange={(e) => updateFormData({ relatoCliente: e.target.value })}
        placeholder="Descreva detalhadamente o defeito informado pelo cliente..."
        rows={6}
        className="w-full p-3 rounded-xl border border-[#d0d5dd] text-base font-medium text-[#101828] bg-[#f8fafc] focus:bg-white focus:outline-none focus:border-[#0284c7]"
      />

      <div>
        <label className={labelBaseClass}>Objetos Deixados no Veiculo</label>
        <input
          type="text"
          value={formData.objetosVeiculo || ''}
          onChange={(e) => updateFormData({ objetosVeiculo: e.target.value })}
          placeholder="Ex: Estepe, macaco, ferramentas..."
          className={inputBaseClass}
        />
      </div>

      <div>
        <label className={labelBaseClass}>Avarias Pre-existentes</label>
        <input
          type="text"
          value={formData.avariasVisual || ''}
          onChange={(e) => updateFormData({ avariasVisual: e.target.value })}
          placeholder="Ex: Risco na porta, mossa para-lama..."
          className={inputBaseClass}
        />
      </div>
    </div>
  )
}
