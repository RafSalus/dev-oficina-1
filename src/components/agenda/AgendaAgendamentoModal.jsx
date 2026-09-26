import React from 'react'
import { CheckCircle, Trash } from '@phosphor-icons/react'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { useAgendamentoFormWorkflow } from '../../hooks/useAgendamentoFormWorkflow'
import { BannerConflitoAgendamento } from './agendamento-form/BannerConflitoAgendamento'
import {
  SecaoClienteAgendamento,
  SecaoVeiculoAgendamento,
} from './agendamento-form/SecaoClienteVeiculoAgendamento'
import { SecaoMecanicoHorarioAgendamento } from './agendamento-form/SecaoMecanicoHorarioAgendamento'
import {
  SecaoLogisticaAgendamento,
  SecaoServicoAgendamento,
} from './agendamento-form/SecaoLogisticaServicoAgendamento'

const botaoCancelarClass =
  'px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors'

/**
 * Modal desktop de novo/edição de agendamento (ADR-003).
 * Estado e regras vivem em `useAgendamentoFormWorkflow`, compartilhado com o mobile.
 */
export function AgendaAgendamentoModal(props) {
  const { isOpen, onClose } = props
  const form = useAgendamentoFormWorkflow(props)

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo={form.emEdicao ? 'Editar Agendamento de Atendimento' : 'Novo Agendamento de Atendimento'}
      larguraPadrao={840}
      alturaPadrao={680}
      larguraMinima={600}
      alturaMinima={480}
      larguraMaxima={1200}
      alturaMaxima={880}
      storageKey="modal_agenda_agendamento_cliente"
    >
      <div className="flex flex-col h-full bg-white text-slate-800">
        {/* Banner de Aviso de Conflito */}
        <BannerConflitoAgendamento form={form} />

        {/* Formulário Principal com rolagem oculta */}
        <form onSubmit={form.salvar} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
          <SecaoClienteAgendamento form={form} />
          <SecaoVeiculoAgendamento form={form} />
          <SecaoMecanicoHorarioAgendamento form={form} />
          <SecaoLogisticaAgendamento form={form} />
          <SecaoServicoAgendamento form={form} />
        </form>

        {/* Rodapé do Modal */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 shrink-0 flex items-center justify-between">
          <div>
            {form.podeExcluir ? (
              <button
                type="button"
                onClick={form.excluir}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash size={15} />
                Excluir Agendamento
              </button>
            ) : (
              <button type="button" onClick={onClose} className={botaoCancelarClass}>
                Cancelar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {form.emEdicao && (
              <button type="button" onClick={onClose} className={botaoCancelarClass}>
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={form.salvar}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0284c7] hover:bg-sky-600 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle size={16} weight="bold" />
              {form.emEdicao ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
            </button>
          </div>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
