import React from 'react'
import { CaretLeft, CaretRight, Wrench, MagnifyingGlass } from '@phosphor-icons/react'
import { agendamentoCorrespondeBusca } from '../../../../../hooks/useAgendaWorkflow'
import { AgendamentoCard, OcupacaoOsCard } from './AgendaCardsMobile'
import { TimelineRow, SlotLivre } from './TimelineMobile'

function SeletorMecanicosMobile({ workflow, mecanicosAgenda }) {
  const { agendamentos, mecanicoSelecionadoId } = workflow

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
      {mecanicosAgenda.map((mec) => {
        const isAtivo = mecanicoSelecionadoId === mec.id
        const totalMec = agendamentos.filter((a) => a.mecanicoId === mec.id).length
        const temAtraso = agendamentos.some((a) => a.mecanicoId === mec.id && a.emAtraso)
        return (
          <button
            key={mec.id}
            type="button"
            onClick={() => workflow.setMecanicoSelecionadoId(mec.id)}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
              isAtivo ? 'bg-[#101828] border-[#101828] text-white' : 'bg-white border-[#d0d5dd] text-[#344054]'
            }`}
          >
            <Wrench size={13} className={isAtivo ? 'text-[#0284c7]' : 'text-[#98a2b3]'} />
            <span>{mec.nome.split(' ')[0]}</span>
            {temAtraso && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isAtivo ? 'bg-white/15 text-white' : 'bg-[#f2f4f7] text-[#667085]'
              }`}
            >
              {totalMec}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function NavegadorSemanaMobile({ workflow }) {
  const { semanaDias } = workflow
  return (
    <div className="flex items-center bg-white p-1 rounded-xl border border-[#d0d5dd] shadow-2xs mb-2.5">
      <button
        type="button"
        onClick={workflow.irParaSemanaAnterior}
        className="p-2 text-[#475467] active:bg-[#f2f4f7] rounded-lg"
        aria-label="Semana anterior"
      >
        <CaretLeft size={16} weight="bold" />
      </button>
      <button
        type="button"
        onClick={workflow.irParaSemanaAtual}
        className="flex-1 py-1.5 text-xs font-bold text-[#101828] active:bg-[#f2f4f7] rounded-lg"
      >
        {semanaDias[0]?.dataBr} a {semanaDias[4]?.dataBr}
      </button>
      <button
        type="button"
        onClick={workflow.irParaProximaSemana}
        className="p-2 text-[#475467] active:bg-[#f2f4f7] rounded-lg"
        aria-label="Próxima semana"
      >
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  )
}

function SeletorDiasMobile({ semanaDias, diaSelecionadoChave, onSelecionarDia, totalNoDia }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-2.5 -mx-4 px-4">
      {semanaDias.map((dia) => {
        const isAtivo = diaSelecionadoChave === dia.chave
        const totalDia = totalNoDia(dia.chave)
        return (
          <button
            key={dia.chave}
            type="button"
            onClick={() => onSelecionarDia(dia.chave)}
            className={`shrink-0 min-w-[64px] px-2 py-2 rounded-xl border flex flex-col items-center gap-0.5 transition-colors ${
              isAtivo ? 'bg-[#0284c7] border-[#0284c7] text-white' : 'bg-white border-[#d0d5dd] text-[#344054]'
            }`}
          >
            <span className="text-[10px] font-bold uppercase">{dia.abrev}</span>
            <span className="text-xs font-extrabold">{dia.dataBr.slice(0, 5)}</span>
            {dia.isHoje && (
              <span
                className={`text-[8px] font-extrabold uppercase px-1 rounded ${
                  isAtivo ? 'bg-white/20 text-white' : 'bg-[#e0f2fe] text-[#0284c7]'
                }`}
              >
                Hoje
              </span>
            )}
            {totalDia > 0 && (
              <span
                className={`text-[9px] font-bold px-1 rounded-full ${
                  isAtivo ? 'bg-white/20 text-white' : 'bg-[#f2f4f7] text-[#667085]'
                }`}
              >
                {totalDia}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Aba de agenda mobile: seletor de mecânico, semana, dia, busca e a linha do tempo do dia
 * (agendamentos, OS em andamento e horários livres).
 */
export function MobileAbaGrade({
  workflow,
  mecanicosAgenda,
  grade,
  diaSelecionadoChave,
  onSelecionarDia,
  primeiroFila,
  slotEnvioConfirmando,
  onSlotEnvioConfirmando,
  onConfirmarEnvioSlot,
}) {
  const { semanaDias, termoBusca, mecanicoAtivo } = workflow
  const diaAtualObj = semanaDias.find((d) => d.chave === diaSelecionadoChave) || semanaDias[0]
  const blocosDoDia = grade.montarBlocos(diaSelecionadoChave)

  const renderizarBloco = (bloco) => {
    if (bloco.tipo === 'agendamento') {
      if (!agendamentoCorrespondeBusca(bloco.dado, termoBusca)) {
        return (
          <TimelineRow key={bloco.dado.id} horario={bloco.horario} corDot="bg-[#d0d5dd]">
            <div className="rounded-xl border border-dashed border-[#e4e7ec] bg-[#f8fafc] px-3.5 py-2.5">
              <span className="text-xs font-semibold text-[#98a2b3]">Ocupado • não corresponde à busca</span>
            </div>
          </TimelineRow>
        )
      }
      return (
        <TimelineRow key={bloco.dado.id} horario={bloco.horario} corDot={bloco.dado.emAtraso ? 'bg-rose-500' : 'bg-[#0284c7]'}>
          <AgendamentoCard agendamento={bloco.dado} onClick={() => workflow.editarAgendamento(bloco.dado)} />
        </TimelineRow>
      )
    }

    if (bloco.tipo === 'ocupado_os') {
      return (
        <TimelineRow key={bloco.dado.id} horario={bloco.horario} corDot="bg-[#667085]">
          <OcupacaoOsCard ocupacao={bloco.dado} />
        </TimelineRow>
      )
    }

    return (
      <TimelineRow key={`livre-${bloco.horario}`} horario={bloco.horario} corDot="bg-[#d0d5dd]">
        <SlotLivre
          horario={bloco.horario}
          isAlmoco={bloco.isAlmoco}
          primeiroFila={primeiroFila}
          confirmando={slotEnvioConfirmando === bloco.horario}
          onIniciarEnvio={() => onSlotEnvioConfirmando(bloco.horario)}
          onConfirmarEnvio={() => onConfirmarEnvioSlot(bloco.horario)}
          onCancelarEnvio={() => onSlotEnvioConfirmando(null)}
          onAgendar={() => workflow.abrirNovoAgendamento(diaSelecionadoChave, bloco.horario)}
        />
      </TimelineRow>
    )
  }

  return (
    <>
      <SeletorMecanicosMobile workflow={workflow} mecanicosAgenda={mecanicosAgenda} />
      <NavegadorSemanaMobile workflow={workflow} />
      <SeletorDiasMobile
        semanaDias={semanaDias}
        diaSelecionadoChave={diaSelecionadoChave}
        onSelecionarDia={onSelecionarDia}
        totalNoDia={grade.totalNoDia}
      />

      {/* Busca */}
      <div className="relative mb-3">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => workflow.setTermoBusca(e.target.value)}
          placeholder="Filtrar cliente ou placa no dia..."
          className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#d0d5dd] bg-white text-sm font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:border-[#0284c7]"
        />
      </div>

      {/* Linha do Tempo do Dia: mostra ocupados, OS em andamento e horários livres */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#98a2b3] mb-2.5">
          {diaAtualObj?.nome} • Agenda de {mecanicoAtivo?.nome} • 08h às 18h
        </p>
        {blocosDoDia.map(renderizarBloco)}

        {/* Marco de Fim de Expediente às 18h */}
        <TimelineRow horario="18:00" isLast corDot="bg-[#d0d5dd]">
          <div className="px-1 py-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#98a2b3]">Fim do expediente</span>
          </div>
        </TimelineRow>
      </div>
    </>
  )
}
