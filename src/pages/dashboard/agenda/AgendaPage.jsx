import React from 'react'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useAgendaWorkflow } from '../../../hooks/useAgendaWorkflow'
import { AgendaGradeSemanal } from '../../../components/agenda/AgendaGradeSemanal'
import { AgendaAgendamentoModal } from '../../../components/agenda/AgendaAgendamentoModal'
import { AgendaTratarAtrasoModal } from '../../../components/agenda/AgendaTratarAtrasoModal'
import { AgendaFilaDedicada } from '../../../components/agenda/AgendaFilaDedicada'
import { AgendaHeader } from './components/AgendaHeader'
import { SeletorMecanicosGrade } from './components/SeletorMecanicosGrade'
import { MobileAgendaPage } from './mobile/MobileAgendaPage'

/**
 * Agenda Dinâmica e Fila de Atendimento (ADR-003 / NFR17 / NFR18).
 * Container desktop; estado e regras vivem em `useAgendaWorkflow`, compartilhado com o mobile.
 */
export default function AgendaPage() {
  const isMobile = useIsMobile()
  const workflow = useAgendaWorkflow()

  if (isMobile) {
    return <MobileAgendaPage workflow={workflow} />
  }

  return (
    <div className="h-full flex flex-col gap-2.5 overflow-hidden text-slate-800 select-none">
      {/* 1. Barra Executiva Superior Compacta (Padrão do Sistema sem banner gigante) */}
      <AgendaHeader workflow={workflow} />

      {/* 2. Conteúdo da Aba Selecionada */}
      {workflow.abaAtivaPrincipal === 'grade' ? (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden">
          <SeletorMecanicosGrade workflow={workflow} />

          {/* Grade Semanal do Mecânico Ativo */}
          <main className="flex-1 p-3 overflow-hidden flex flex-col min-h-0 bg-slate-50">
            <AgendaGradeSemanal
              mecanicoAtivo={workflow.mecanicoAtivo}
              semanaDias={workflow.semanaDias}
              agendamentos={workflow.agendamentosMecanico}
              fila={workflow.filaEspera}
              onNovoAgendamento={workflow.abrirNovoAgendamento}
              onEditarAgendamento={workflow.editarAgendamento}
              onTratarAtraso={workflow.abrirTratarAtraso}
              onPreencherHorarioAutomatico={workflow.preencherHorarioAutomatico}
            />
          </main>
        </div>
      ) : (
        /* Tela Dedicada da Fila de Atendimento */
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden flex flex-col">
          <AgendaFilaDedicada fila={workflow.filaEspera} onAtualizarFila={workflow.atualizarFila} />
        </div>
      )}

      {/* 3. Modais Operacionais */}
      {workflow.isModalAgendamentoAberto && (
        <AgendaAgendamentoModal
          isOpen={workflow.isModalAgendamentoAberto}
          onClose={workflow.fecharModalAgendamento}
          onSalvar={workflow.salvarAgendamento}
          onExcluir={workflow.excluirAgendamento}
          agendamentoParaEditar={workflow.agendamentoEmEdicao}
          diaPreSelecionado={workflow.slotPreSelecionado.dia}
          horarioPreSelecionado={workflow.slotPreSelecionado.horario}
          mecanicoPreSelecionado={workflow.mecanicoAtivo.id}
          agendamentosExistentes={workflow.agendamentos}
        />
      )}

      {workflow.isModalAtrasoAberto && workflow.agendamentoAtrasadoAlvo && (
        <AgendaTratarAtrasoModal
          isOpen={workflow.isModalAtrasoAberto}
          onClose={workflow.fecharModalAtraso}
          agendamento={workflow.agendamentoAtrasadoAlvo}
          onSalvarAtraso={workflow.salvarAtrasoTratado}
          agendamentosExistentes={workflow.agendamentos}
        />
      )}
    </div>
  )
}
