import React from 'react'
import { CheckSquare, ShieldCheck, Eye, ArrowLeft, ArrowRight } from '@phosphor-icons/react'

export function TabChecklist({ formData, updateFormData, onPrev, onNext }) {
  const { checklist = {} } = formData

  const handleToggle = (key) => {
    updateFormData({
      checklist: {
        ...checklist,
        [key]: !checklist[key],
      },
    })
  }

  const handleObsChange = (e) => {
    updateFormData({
      checklistObs: e.target.value,
    })
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Grid de 3 Cartões: Itens, Interior e Lataria */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
        {/* Cartão 1: Itens Obrigatórios e Ferramentas */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <CheckSquare size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Itens Obrigatórios e Ferramentas</h2>
              <p className="text-[10px] text-[#667085]">Conferência na entrega do veículo</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden">
            {[
              { key: 'estepe', label: 'Estepe presente e calibrado' },
              { key: 'macaco', label: 'Macaco funcional' },
              { key: 'chaveRoda', label: 'Chave de roda' },
              { key: 'triangulo', label: 'Triângulo de segurança' },
              { key: 'manual', label: 'Manual do proprietário' },
              { key: 'chaveReserva', label: 'Chave reserva entregue' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f9fafb] hover:bg-[#f2f4f7] border border-[#e4e7ec] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={!!checklist[item.key]}
                  onChange={() => handleToggle(item.key)}
                  className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-[#344054] font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cartão 2: Interior e Pertences */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Interior e Pertences</h2>
              <p className="text-[10px] text-[#667085]">Inspeção de cabine e equipamentos</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden">
            {[
              { key: 'semPertences', label: 'Sem objetos de valor no interior' },
              { key: 'documento', label: 'Documento do veículo no porta-luvas' },
              { key: 'painelIntacto', label: 'Painel e mostradores sem avarias' },
              { key: 'tapetes', label: 'Jogo de tapetes completo' },
              { key: 'arCondicionado', label: 'Ar-condicionado operando' },
              { key: 'vidrosTravas', label: 'Vidros elétricos e travas funcionando' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f9fafb] hover:bg-[#f2f4f7] border border-[#e4e7ec] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={!!checklist[item.key]}
                  onChange={() => handleToggle(item.key)}
                  className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-[#344054] font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cartão 3: Inspeção Visual Externa e Avarias */}
        <div className="h-full bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#f2f4f7] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Eye size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101828]">Inspeção Visual e Avarias</h2>
              <p className="text-[10px] text-[#667085]">Registro de estado da lataria</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-2 overflow-hidden min-h-0">
            <div className="grid grid-cols-2 gap-2 shrink-0">
              {[
                { key: 'semAmassados', label: 'Sem amassados' },
                { key: 'semRiscos', label: 'Sem riscos fundos' },
                { key: 'vidrosIntactos', label: 'Para-brisa intacto' },
                { key: 'faroisIntactos', label: 'Faróis íntegros' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#f9fafb] hover:bg-[#f2f4f7] border border-[#e4e7ec] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!checklist[item.key]}
                    onChange={() => handleToggle(item.key)}
                    className="rounded text-black focus:ring-black accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#344054] font-medium">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Observações de Avarias Pré-Existentes */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-1">
                Avarias Pré-Existentes / Observações
              </label>
              <textarea
                value={formData.checklistObs || ''}
                onChange={handleObsChange}
                placeholder="Ex: Pequeno arranhão no para-choque traseiro direito, calota dianteira esquerda ausente..."
                className="flex-1 w-full bg-[#f9fafb] hover:bg-[#f2f4f7] focus:bg-white border border-[#e4e7ec] focus:border-[#101828] rounded-xl p-2.5 text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Navegação */}
      <div className="h-10 shrink-0 bg-white px-4 rounded-xl border border-[#e4e7ec] shadow-xs flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] cursor-pointer"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Voltar para Cliente e Veiculo</span>
        </button>

        <span className="text-[11px] font-medium text-[#667085]">
          Aba 2 de 8 • <strong className="text-[#101828]">Checklist</strong>
        </span>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101828] hover:text-black hover:underline cursor-pointer"
        >
          <span>Avançar para Diagnostico</span>
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
