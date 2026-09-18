import React, { useState } from 'react'
import { ClipboardText, ShieldCheck, Speedometer } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ITENS_CHECKLIST_ENTRADA, ITENS_CHECKLIST_SAIDA } from '../../../../../constants/checklistItems'
import { MobileStepFooter } from '../MobileStepFooter'
import { inputBaseClass, textareaBaseClass, labelBaseClass } from '../mobileSelectStyles'

const STATUS_CONFIG = [
  { value: 'conforme', label: 'Conforme', active: 'bg-[#0284c7] text-white border-[#0284c7]', idle: 'bg-white text-[#0284c7] border-[#bae6fd]' },
  { value: 'nao_conforme', label: 'Não Conf.', active: 'bg-[#b42318] text-white border-[#b42318]', idle: 'bg-white text-[#b42318] border-[#fecdca]' },
  { value: 'isento', label: 'Isento', active: 'bg-[#344054] text-white border-[#344054]', idle: 'bg-white text-[#344054] border-[#d0d5dd]' },
]

function ChecklistItemRow({ item, state, onStatus, onObs }) {
  const status = state.status || ''
  return (
    <div
      className={`rounded-xl border p-2.5 ${
        status === 'conforme'
          ? 'bg-[#f0f9ff] border-[#bae6fd]'
          : status === 'nao_conforme'
          ? 'bg-[#fef3f2] border-[#fecdca]'
          : status === 'isento'
          ? 'bg-[#f8fafc] border-[#d0d5dd]'
          : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#101828] uppercase leading-tight">{item.label}</p>
          {item.desc && <p className="text-[10px] text-[#667085] leading-tight">{item.desc}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {STATUS_CONFIG.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onStatus(s.value)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${
              status === s.value ? s.active : s.idle
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={state.obs || ''}
        onChange={(e) => onObs(e.target.value)}
        placeholder="Observação (opcional)"
        className="w-full bg-transparent border border-transparent focus:border-[#e4e7ec] rounded px-1.5 py-1 text-[11px] text-[#101828] placeholder-[#98a2b3] focus:outline-none"
      />
    </div>
  )
}

export function MobileStepChecklist({ formData, updateFormData, onContinue }) {
  const [subTab, setSubTab] = useState('entrada')

  const checklistEntrada = formData.checklistEntrada || {}
  const checklistSaida = formData.checklistSaida || {}

  const handleStatusItem = (tipo, itemId, status) => {
    const currentList = tipo === 'entrada' ? checklistEntrada : checklistSaida
    const currentItem = currentList[itemId] || { status: '', obs: '' }
    const updatedList = {
      ...currentList,
      [itemId]: { ...currentItem, status: currentItem.status === status ? '' : status },
    }
    updateFormData(tipo === 'entrada' ? { checklistEntrada: updatedList } : { checklistSaida: updatedList })
  }

  const handleObsItem = (tipo, itemId, obsValue) => {
    const currentList = tipo === 'entrada' ? checklistEntrada : checklistSaida
    const currentItem = currentList[itemId] || { status: '', obs: '' }
    const updatedList = { ...currentList, [itemId]: { ...currentItem, obs: obsValue } }
    updateFormData(tipo === 'entrada' ? { checklistEntrada: updatedList } : { checklistSaida: updatedList })
  }

  const totalEntradaOk = ITENS_CHECKLIST_ENTRADA.filter((i) => checklistEntrada[i.id]?.status === 'conforme').length
  const totalSaidaOk = ITENS_CHECKLIST_SAIDA.filter((i) => checklistSaida[i.id]?.status === 'conforme').length

  const handleContinuar = () => {
    toast.success('Checklist salvo com sucesso!')
    onContinue()
  }

  return (
    <div>
      <div className="flex items-center gap-1 bg-[#f2f4f7] p-1 rounded-xl mb-3">
        <button
          type="button"
          onClick={() => setSubTab('entrada')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
            subTab === 'entrada' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
          }`}
        >
          <ClipboardText size={14} weight={subTab === 'entrada' ? 'bold' : 'regular'} />
          <span>Entrada</span>
          <span className="text-[10px] px-1.5 rounded-full font-bold bg-[#e0f2fe] text-[#0284c7]">
            {totalEntradaOk}/{ITENS_CHECKLIST_ENTRADA.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('saida')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
            subTab === 'saida' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
          }`}
        >
          <ShieldCheck size={14} weight={subTab === 'saida' ? 'bold' : 'regular'} />
          <span>Saída</span>
          <span className="text-[10px] px-1.5 rounded-full font-bold bg-[#f2f4f7] text-[#667085]">
            {totalSaidaOk}/{ITENS_CHECKLIST_SAIDA.length}
          </span>
        </button>
      </div>

      {subTab === 'entrada' ? (
        <div className="space-y-2">
          {ITENS_CHECKLIST_ENTRADA.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              state={checklistEntrada[item.id] || {}}
              onStatus={(status) => handleStatusItem('entrada', item.id, status)}
              onObs={(obs) => handleObsItem('entrada', item.id, obs)}
            />
          ))}

          <div className="pt-1">
            <label className={labelBaseClass}>Observações Gerais (Entrada)</label>
            <textarea
              value={formData.checklistEntradaObs || ''}
              onChange={(e) => updateFormData({ checklistEntradaObs: e.target.value })}
              placeholder="Pertences deixados pelo cliente, avarias prévias na lataria..."
              rows={3}
              className={textareaBaseClass}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className={labelBaseClass}>
              Quilometragem de Saída (KM) <span className="text-[#b42318]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: 64.280 km"
                value={formData.kmSaida || ''}
                onChange={(e) => updateFormData({ kmSaida: e.target.value })}
                className={inputBaseClass}
              />
              <Speedometer size={18} className="absolute right-3.5 top-3.5 text-[#98a2b3]" />
            </div>
            {formData.km && (
              <p className="text-[10px] text-[#667085] mt-1">
                KM de entrada: <span className="font-bold text-[#344054]">{formData.km}</span>
              </p>
            )}
          </div>

          {ITENS_CHECKLIST_SAIDA.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              state={checklistSaida[item.id] || {}}
              onStatus={(status) => handleStatusItem('saida', item.id, status)}
              onObs={(obs) => handleObsItem('saida', item.id, obs)}
            />
          ))}

          <div className="pt-1">
            <label className={labelBaseClass}>Relatório de Liberação / Observações Finais</label>
            <textarea
              value={formData.checklistSaidaObs || ''}
              onChange={(e) => updateFormData({ checklistSaidaObs: e.target.value })}
              placeholder="Resultado do teste de rodagem, recomendações de retorno..."
              rows={3}
              className={textareaBaseClass}
            />
          </div>
        </div>
      )}

      <MobileStepFooter onContinue={handleContinuar} />
    </div>
  )
}
