import React, { useState } from 'react'
import { toast } from 'sonner'
import { useGradeMecanico } from '../../hooks/useGradeMecanico'
import { CabecalhoDiasGrade, ColunaHorariosGrade, estiloLinhasGrade } from './grade/CabecalhoDiasGrade'
import { CardAgendamentoGrade } from './grade/CardAgendamentoGrade'
import { CardOcupacaoOSGrade, SlotLivreGrade } from './grade/BlocosLivreOcupadoGrade'
import { ModalConfirmarAlocacaoFila } from './grade/ModalConfirmarAlocacaoFila'

/**
 * Grade semanal (desktop) do mecânico ativo — ADR-003.
 * Cascata de atrasos, ocupações de OS e montagem dos blocos vêm de `useGradeMecanico`.
 */
export function AgendaGradeSemanal({
  mecanicoAtivo, // Mecânico selecionado
  semanaDias = [],
  agendamentos = [],
  fila = [],
  onNovoAgendamento,
  onEditarAgendamento,
  onTratarAtraso,
  onPreencherHorarioAutomatico, // Função para alocar direto o 1º da fila sem preencher nada
}) {
  const { montarBlocos, totalNoDia } = useGradeMecanico(agendamentos, mecanicoAtivo)

  // Modal de confirmação rápida para enviar horário ao 1º da fila
  const [modalConfirmacaoAlocacao, setModalConfirmacaoAlocacao] = useState(null)

  const primeiroFila = fila && fila.length > 0 ? fila[0] : null

  // Ação ao clicar no botão discreto de enviar horário ao 1º cliente da fila
  const handleSolicitarEnvioAoPrimeiroFila = (diaObj, horario) => {
    if (!primeiroFila) {
      toast.info('Não há clientes na fila de atendimento no momento.')
      return
    }
    setModalConfirmacaoAlocacao({ diaObj, horario, cliente: primeiroFila })
  }

  // Confirmação com 1 clique (sem precisar preencher nada!)
  const handleConfirmarAlocacaoAutomatica = () => {
    if (!modalConfirmacaoAlocacao) return
    const { diaObj, horario, cliente } = modalConfirmacaoAlocacao
    if (onPreencherHorarioAutomatico) {
      onPreencherHorarioAutomatico(diaObj.chave, horario, cliente)
    }
    setModalConfirmacaoAlocacao(null)
  }

  const renderizarBloco = (bloco) => {
    if (bloco.tipo === 'agendamento') {
      return (
        <CardAgendamentoGrade
          key={bloco.chave}
          bloco={bloco}
          onEditarAgendamento={onEditarAgendamento}
          onTratarAtraso={onTratarAtraso}
        />
      )
    }

    if (bloco.tipo === 'ocupado_os') {
      return <CardOcupacaoOSGrade key={bloco.chave} bloco={bloco} />
    }

    const diaObj = semanaDias.find((d) => d.chave === bloco.diaChave)
    return (
      <SlotLivreGrade
        key={bloco.chave}
        bloco={bloco}
        primeiroFila={primeiroFila}
        onEnviarAoPrimeiroFila={() => handleSolicitarEnvioAoPrimeiroFila(diaObj, bloco.horario)}
        onAgendar={() => onNovoAgendamento(bloco.diaChave, bloco.horario)}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* 1. Cabeçalho das Colunas: Dias da Semana */}
      <CabecalhoDiasGrade semanaDias={semanaDias} totalNoDia={totalNoDia} />

      {/* 2. Área da Grade Semanal com CSS Grid de Linhas Ampliadas (115px) para Eliminar Truncamento */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-[80px_repeat(5,1fr)]">
          <ColunaHorariosGrade />

          {/* Colunas dos 5 Dias (Seg a Sex) */}
          {semanaDias.map((dia) => (
            <div
              key={dia.chave}
              className={`border-r border-slate-200 last:border-r-0 relative p-1 ${dia.isHoje ? 'bg-sky-50/10' : ''}`}
              style={estiloLinhasGrade}
            >
              {montarBlocos(dia.chave).map(renderizarBloco)}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Modal de Confirmação Rápida: Alocação Automática do 1º da Fila (Sem preencher nada!) */}
      <ModalConfirmarAlocacaoFila
        alocacao={modalConfirmacaoAlocacao}
        mecanicoNome={mecanicoAtivo?.nome}
        onCancelar={() => setModalConfirmacaoAlocacao(null)}
        onConfirmar={handleConfirmarAlocacaoAutomatica}
      />
    </div>
  )
}
