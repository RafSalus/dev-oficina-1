import React from 'react'
import { X, CheckCircle } from '@phosphor-icons/react'
import { useAgendamentoFormWorkflow } from '../../../../hooks/useAgendamentoFormWorkflow'
import { MobileSecaoCliente, MobileSecaoVeiculo } from './agendamento-form/MobileSecaoClienteVeiculo'
import { MobileSecaoMecanicoHorario } from './agendamento-form/MobileSecaoMecanicoHorario'
import { MobileSecaoLogistica, MobileSecaoServico } from './agendamento-form/MobileSecaoLogisticaServico'
import {
  MobileAvisoAtraso,
  MobileAvisoConflito,
  MobileExclusaoAgendamento,
} from './agendamento-form/MobileAvisosAgendamento'

/**
 * Modal mobile (tela cheia) de novo/edição de agendamento (ADR-003).
 * Compartilha estado e regras com o modal desktop via `useAgendamentoFormWorkflow`.
 */
export function MobileAgendaAgendamentoModal(props) {
  const { isOpen, onClose, agendamentoParaEditar = null, onTratarAtraso } = props
  const form = useAgendamentoFormWorkflow(props)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {form.emEdicao ? 'Editar Agendamento' : 'Novo Agendamento'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <MobileAvisoAtraso agendamento={agendamentoParaEditar} onTratarAtraso={onTratarAtraso} />
        <MobileAvisoConflito form={form} />
        <MobileSecaoCliente form={form} />
        <MobileSecaoVeiculo form={form} />
        <MobileSecaoMecanicoHorario form={form} />
        <MobileSecaoLogistica form={form} />
        <MobileSecaoServico form={form} />
        <MobileExclusaoAgendamento form={form} />
      </main>

      <footer
        className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={() => form.salvar()}
          className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} weight="bold" />
          {form.emEdicao ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
        </button>
      </footer>
    </div>
  )
}
