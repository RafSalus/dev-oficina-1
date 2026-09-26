import React, { useState, useMemo } from 'react'
import { MobileAgendaAgendamentoModal } from './MobileAgendaAgendamentoModal'
import { MobileAgendaTratarAtrasoModal } from './MobileAgendaTratarAtrasoModal'
import { MobileAgendaFilaFormModal } from './MobileAgendaFilaFormModal'
import { MobileAgendaTopo } from './components/MobileAgendaTopo'
import { MobileAbaGrade } from './components/MobileAbaGrade'
import { MobileAbaFila } from './components/MobileAbaFila'
import { useMecanicosAgenda } from '../../../../hooks/useMecanicosAgenda'
import { useGradeMecanico } from '../../../../hooks/useGradeMecanico'
import { useFilaEsperaWorkflow } from '../../../../hooks/useFilaEsperaWorkflow'

/**
 * Agenda mobile (ADR-003 / NFR18): consome o mesmo `useAgendaWorkflow` do desktop,
 * recebido do container `AgendaPage`, e os hooks compartilhados de grade e fila.
 */
export function MobileAgendaPage({ workflow }) {
  const { semanaDias, mecanicoAtivo, agendamentos, filaEspera } = workflow
  const mecanicosAgenda = useMecanicosAgenda()

  const [diaSelecionadoChave, setDiaSelecionadoChave] = useState(() => {
    const hoje = semanaDias.find((d) => d.isHoje)
    return hoje ? hoje.chave : semanaDias[0]?.chave || 'seg'
  })
  const [isModalFilaAberto, setIsModalFilaAberto] = useState(false)
  const [slotEnvioConfirmando, setSlotEnvioConfirmando] = useState(null)

  // Agenda completa do mecânico ativo (ignora o filtro de busca) para que os horários
  // livres exibidos na linha do tempo reflitam a real disponibilidade do dia
  const agendamentosMecanicoCompleto = useMemo(() => {
    if (!mecanicoAtivo) return []
    return agendamentos.filter((a) => a.mecanicoId === mecanicoAtivo.id)
  }, [agendamentos, mecanicoAtivo])

  const grade = useGradeMecanico(agendamentosMecanicoCompleto, mecanicoAtivo)
  const filaWorkflow = useFilaEsperaWorkflow({ fila: filaEspera, onAtualizarFila: workflow.atualizarFila })
  const { primeiroFila } = filaWorkflow

  const handleConfirmarEnvioSlot = (horario) => {
    if (!primeiroFila) return
    workflow.preencherHorarioAutomatico(diaSelecionadoChave, horario, primeiroFila)
    setSlotEnvioConfirmando(null)
  }

  const handleAcaoRapida = () =>
    workflow.abaAtivaPrincipal === 'grade'
      ? workflow.abrirNovoAgendamento(diaSelecionadoChave, '08:00')
      : setIsModalFilaAberto(true)

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Segmentado Agenda / Fila + Ação Rápida */}
      <MobileAgendaTopo workflow={workflow} onAcaoRapida={handleAcaoRapida} />

      {workflow.abaAtivaPrincipal === 'grade' ? (
        <MobileAbaGrade
          workflow={workflow}
          mecanicosAgenda={mecanicosAgenda}
          grade={grade}
          diaSelecionadoChave={diaSelecionadoChave}
          onSelecionarDia={setDiaSelecionadoChave}
          primeiroFila={primeiroFila}
          slotEnvioConfirmando={slotEnvioConfirmando}
          onSlotEnvioConfirmando={setSlotEnvioConfirmando}
          onConfirmarEnvioSlot={handleConfirmarEnvioSlot}
        />
      ) : (
        <MobileAbaFila filaWorkflow={filaWorkflow} mecanicosAgenda={mecanicosAgenda} />
      )}

      {/* Modal de Novo/Editar Agendamento */}
      {workflow.isModalAgendamentoAberto && (
        <MobileAgendaAgendamentoModal
          isOpen={workflow.isModalAgendamentoAberto}
          onClose={workflow.fecharModalAgendamento}
          onSalvar={workflow.salvarAgendamento}
          onExcluir={workflow.excluirAgendamento}
          agendamentoParaEditar={workflow.agendamentoEmEdicao}
          diaPreSelecionado={workflow.slotPreSelecionado.dia}
          horarioPreSelecionado={workflow.slotPreSelecionado.horario}
          mecanicoPreSelecionado={mecanicoAtivo?.id}
          agendamentosExistentes={agendamentos}
          onTratarAtraso={(ag) => {
            workflow.fecharModalAgendamento()
            workflow.abrirTratarAtraso(ag)
          }}
        />
      )}

      {/* Modal de Tratamento de Atraso */}
      {workflow.isModalAtrasoAberto && workflow.agendamentoAtrasadoAlvo && (
        <MobileAgendaTratarAtrasoModal
          isOpen={workflow.isModalAtrasoAberto}
          onClose={workflow.fecharModalAtraso}
          agendamento={workflow.agendamentoAtrasadoAlvo}
          onSalvarAtraso={workflow.salvarAtrasoTratado}
          agendamentosExistentes={agendamentos}
        />
      )}

      {/* Modal de Inserir Cliente na Fila */}
      {isModalFilaAberto && (
        <MobileAgendaFilaFormModal
          isOpen={isModalFilaAberto}
          onClose={() => setIsModalFilaAberto(false)}
          fila={filaEspera}
          onAtualizarFila={workflow.atualizarFila}
        />
      )}
    </div>
  )
}
