import { Car, ChatText, WarningCircle } from '@phosphor-icons/react'
import { IMaskInput } from 'react-imask'
import CreatableSelect from 'react-select/creatable'
import { SecaoForm, Campo, inputClass, selectStylesPortal, SINTOMAS_OPTIONS } from '../formularioAberturaShared'

export function AbaSintomasRelato({ formData, updateFormData }) {
  const handleSelecionarProblema = (option) => {
    if (!option) return
    const textoProblema = option.value?.trim() || option.label?.trim()
    if (!textoProblema) return

    const atual = (formData.relatoCliente || '').trim()
    if (!atual) {
      updateFormData({ relatoCliente: `• ${textoProblema}` })
    } else if (!atual.toLowerCase().includes(textoProblema.toLowerCase())) {
      updateFormData({ relatoCliente: `${atual}\n• ${textoProblema}` })
    }
  }

  const kmNumericoAtual = parseInt(String(formData.km || '').replace(/\D/g, ''), 10) || 0
  const kmNumericoAnterior = parseInt(String(formData.kmAnterior || '').replace(/\D/g, ''), 10) || 0
  const kmInconsistente = kmNumericoAnterior > 0 && kmNumericoAtual > 0 && kmNumericoAtual < kmNumericoAnterior

  return (
    <>
      <SecaoForm icone={Car} titulo="Quilometragem">
        <Campo label="KM Atual *">
          <IMaskInput
            mask="000.000"
            value={formData.km || ''}
            onAccept={(val) => updateFormData({ km: val })}
            placeholder="Ex: 280.812"
            className={`${inputClass} font-mono ${
              kmInconsistente
                ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500 bg-amber-50/40'
                : !formData.km
                ? 'border-rose-300'
                : ''
            }`}
          />
          {kmInconsistente && (
            <p className="text-[9.5px] text-amber-700 font-semibold mt-0.5 flex items-center gap-0.5">
              <WarningCircle size={10} weight="fill" />
              <span>Menor que KM anterior ({formData.kmAnterior})</span>
            </p>
          )}
        </Campo>
      </SecaoForm>

      <SecaoForm icone={ChatText} titulo="Relato do Cliente e Sintomas *">
        <CreatableSelect
          options={SINTOMAS_OPTIONS}
          value={null}
          onChange={handleSelecionarProblema}
          placeholder="Selecione ou digite um sintoma para adicionar ao relato..."
          isClearable={false}
          isSearchable
          styles={selectStylesPortal}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          formatCreateLabel={(inputValue) => `Adicionar no relato: "${inputValue}"`}
          noOptionsMessage={() => 'Nenhum sintoma correspondente (digite para criar)'}
        />

        <textarea
          value={formData.relatoCliente || ''}
          onChange={(e) => updateFormData({ relatoCliente: e.target.value })}
          placeholder="Descreva o que o cliente relatou ou use o seletor acima..."
          rows={6}
          className="w-full p-2.5 rounded-xl border border-[#d0d5dd] text-xs font-medium text-[#101828] bg-[#f8fafc] focus:bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] resize-none leading-relaxed"
        />

        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
          <Campo label="Pertences no Veiculo">
            <input
              type="text"
              value={formData.objetosVeiculo || ''}
              onChange={(e) => updateFormData({ objetosVeiculo: e.target.value })}
              placeholder="Estepe, macaco, cadeirinha..."
              className={inputClass}
            />
          </Campo>
          <Campo label="Avarias Pre-existentes">
            <input
              type="text"
              value={formData.avariasVisual || ''}
              onChange={(e) => updateFormData({ avariasVisual: e.target.value })}
              placeholder="Risco na porta, mossa..."
              className={inputClass}
            />
          </Campo>
        </div>
      </SecaoForm>
    </>
  )
}
