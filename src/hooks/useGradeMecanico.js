import { useMemo } from 'react'
import {
  HORARIOS_GRADE,
  obterOcupacoesOSMecanico,
  recalcularCascataDeAtrasos,
} from '../constants/agendaData'

/**
 * Gera os blocos de um dia da grade: agendamento, OS em andamento ou horário livre.
 * Cada bloco ocupa `span` linhas a partir de `startRow` (1-based), sem sobreposição.
 */
export function montarBlocosDoDia({ diaChave, agendamentos = [], ocupacoesOS = [] }) {
  const horasOcupadas = new Set()
  const blocos = []

  HORARIOS_GRADE.forEach((horario, index) => {
    if (horasOcupadas.has(index)) return // Já coberto pelo span de um bloco anterior

    // 1. Agendamento começando nesta hora (já ajustado pela cascata se houve atraso)
    const ag = agendamentos.find((a) => a.diaChave === diaChave && a.horarioInicio === horario)
    if (ag) {
      const duracao = Math.min(Number(ag.duracaoHoras || 1), HORARIOS_GRADE.length - index)
      for (let h = index; h < index + duracao; h++) horasOcupadas.add(h)
      blocos.push({
        tipo: 'agendamento',
        chave: `ag-${ag.id}-${diaChave}-${horario}`,
        dado: ag,
        startRow: index + 1,
        span: duracao,
        horario,
      })
      return
    }

    // 2. Ocupação em OS começando nesta hora
    const os = ocupacoesOS.find((o) => o.diaChave === diaChave && o.horarioInicio === horario)
    if (os) {
      const duracao = Math.min(Number(os.duracaoHoras || 2), HORARIOS_GRADE.length - index)
      for (let h = index; h < index + duracao; h++) horasOcupadas.add(h)
      blocos.push({
        tipo: 'ocupado_os',
        chave: `os-${os.id}-${diaChave}-${horario}`,
        dado: os,
        startRow: index + 1,
        span: duracao,
        horario,
      })
      return
    }

    // 3. Slot livre (1 hora de duração)
    horasOcupadas.add(index)
    blocos.push({
      tipo: 'livre',
      chave: `livre-${diaChave}-${horario}`,
      horario,
      diaChave,
      startRow: index + 1,
      span: 1,
      isAlmoco: horario === '12:00',
    })
  })

  return blocos
}

/**
 * Grade de um mecânico: aplica a cascata de atrasos e expõe as ocupações de OS.
 * Compartilhado pela grade semanal desktop e pela linha do tempo mobile (NFR18).
 */
export function useGradeMecanico(agendamentos, mecanicoAtivo) {
  // Recálculo Dinâmico em Cascata: quando houver atraso, os agendamentos subsequentes
  // vão se empurrando dinamicamente ao longo das horas e até passando para o dia seguinte
  const agendamentosComCascata = useMemo(() => {
    if (!mecanicoAtivo) return []
    return recalcularCascataDeAtrasos(agendamentos, mecanicoAtivo.id).filter(
      (a) => a.mecanicoId === mecanicoAtivo.id
    )
  }, [agendamentos, mecanicoAtivo])

  // Ocupações de Ordens de Serviço (OS em andamento na oficina) deste mecânico
  const ocupacoesOS = useMemo(() => obterOcupacoesOSMecanico(mecanicoAtivo?.id), [mecanicoAtivo])

  const montarBlocos = (diaChave) =>
    montarBlocosDoDia({ diaChave, agendamentos: agendamentosComCascata, ocupacoesOS })

  const totalNoDia = (diaChave) =>
    agendamentosComCascata.filter((a) => a.diaChave === diaChave).length +
    ocupacoesOS.filter((o) => o.diaChave === diaChave).length

  return { agendamentosComCascata, ocupacoesOS, montarBlocos, totalNoDia }
}
