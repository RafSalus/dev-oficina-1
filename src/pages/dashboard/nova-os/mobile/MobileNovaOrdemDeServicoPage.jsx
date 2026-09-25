import React, { useState } from 'react'
import { Receipt, X, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ITENS_CHECKLIST_ENTRADA } from '../../../../constants/checklistItems'
import { MobileSecaoCliente } from './components/MobileSecaoCliente'
import { MobileSecaoRelato } from './components/MobileSecaoRelato'
import { MobileSecaoChecklist } from './components/MobileSecaoChecklist'

/**
 * MobileNovaOrdemDeServicoPage - Tela mobile de abertura de Nova Ordem de Serviço.
 * Orquestra as seções de identificação, queixa e vistoria de entrada (Story 2.0b / ADR-003).
 */
export function MobileNovaOrdemDeServicoPage({
  formData,
  updateFormData,
  onFechar,
  onSalvarFila,
}) {
  const [secaoAtiva, setSecaoAtiva] = useState('cliente') // 'cliente' | 'relato' | 'checklist'

  const checklistEntrada = formData?.checklistEntrada || {}
  const preenchidosCount = ITENS_CHECKLIST_ENTRADA.filter(
    (item) => Boolean(checklistEntrada[item.id]?.status)
  ).length

  const handleMarcarTodosConformes = () => {
    const todosOk = {}
    ITENS_CHECKLIST_ENTRADA.forEach((item) => {
      todosOk[item.id] = { status: 'conforme', obs: '' }
    })
    updateFormData({ checklistEntrada: todosOk })
    toast.success('Todos os itens do Checklist foram marcados como Conforme!')
  }

  const handleAtualizarItemChecklist = (itemId, novoStatus) => {
    updateFormData({
      checklistEntrada: {
        ...checklistEntrada,
        [itemId]: { status: novoStatus, obs: '' },
      },
    })
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#f8fafc] overflow-hidden select-none">
      {/* Top Header Mobile */}
      <div className="shrink-0 bg-[#101828] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-black">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#0284c7] flex items-center justify-center text-white">
            <Receipt size={16} weight="bold" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-[#98a2b3] uppercase tracking-wider block">
              NOVA ORDEM DE SERVICO
            </span>
            <span className="font-mono font-black text-sm text-white">#{formData?.numeroOS}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onFechar}
          className="p-1.5 rounded-lg text-[#98a2b3] hover:text-white bg-white/10 cursor-pointer"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {/* Seletor de Seções Mobile */}
      <div className="shrink-0 bg-white border-b border-[#e4e7ec] p-1.5 flex gap-1">
        <button
          type="button"
          onClick={() => setSecaoAtiva('cliente')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            secaoAtiva === 'cliente'
              ? 'bg-[#101828] text-white shadow-2xs'
              : 'text-[#475467] bg-[#f8fafc]'
          }`}
        >
          1. Cliente e Veiculo
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('relato')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            secaoAtiva === 'relato'
              ? 'bg-[#101828] text-white shadow-2xs'
              : 'text-[#475467] bg-[#f8fafc]'
          }`}
        >
          <span>2. Relato e Queixa</span>
          {!formData?.relatoCliente?.trim() && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${secaoAtiva === 'relato' ? 'bg-rose-400' : 'bg-rose-500'}`}
              title="Obrigatorio para salvar a OS"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('checklist')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            secaoAtiva === 'checklist'
              ? 'bg-[#101828] text-white shadow-2xs'
              : 'text-[#475467] bg-[#f8fafc]'
          }`}
        >
          <span>3. Vistoria</span>
          <span className="text-[9px] px-1 rounded-full bg-[#0284c7] text-white font-extrabold">
            {preenchidosCount}/22
          </span>
        </button>
      </div>

      {/* Conteúdo com Scroll Mobile */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {secaoAtiva === 'cliente' && (
          <MobileSecaoCliente formData={formData} updateFormData={updateFormData} />
        )}

        {secaoAtiva === 'relato' && (
          <MobileSecaoRelato formData={formData} updateFormData={updateFormData} />
        )}

        {secaoAtiva === 'checklist' && (
          <MobileSecaoChecklist
            checklistEntrada={checklistEntrada}
            onMarcarTodosConformes={handleMarcarTodosConformes}
            onAtualizarItem={handleAtualizarItemChecklist}
          />
        )}
      </div>

      {/* Rodapé Fixo Mobile */}
      <div className="shrink-0 bg-white p-2.5 border-t border-[#e4e7ec] flex gap-2">
        <button
          type="button"
          onClick={onFechar}
          className="h-10 px-3 rounded-xl border border-[#d0d5dd] text-[#475467] font-bold text-xs cursor-pointer"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={onSalvarFila}
          className="flex-1 h-10 rounded-xl bg-[#0284c7] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
        >
          <Lightning size={16} weight="fill" />
          <span>Salvar e Enviar para a Fila</span>
        </button>
      </div>
    </div>
  )
}
