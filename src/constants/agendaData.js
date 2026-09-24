// Módulo Central de Dados e Regras da Agenda - Mecânica Gabriel
// Diretrizes: Regra 1 (sem scroll janela), 4, 5 (sem '&'), 6 (react-select), 7 (sem verde), 14 (gestão e secretária)

export const STORAGE_KEY_AGENDAMENTOS = 'dev_oficina_agenda_agendamentos'
export const STORAGE_KEY_FILA_ESPERA = 'dev_oficina_agenda_fila'

// Lista de Mecânicos da Oficina (Somente os nomes dos profissionais, sem box)
export const MECANICOS_AGENDA = []

// Fallback exibido quando nenhum mecânico ativo está cadastrado
export const MECANICO_VAZIO = { id: '', value: '', nome: 'Nenhum mecânico cadastrado' }

// Horário de Funcionamento da Oficina: Segunda a Sexta, 08h às 18h
export const HORARIOS_GRADE = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00', // Intervalo de Almoço
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]

export const DIAS_SEMANA_NOMES = [
  { indice: 1, chave: 'seg', nome: 'Segunda-feira', abrev: 'Seg' },
  { indice: 2, chave: 'ter', nome: 'Terça-feira', abrev: 'Ter' },
  { indice: 3, chave: 'qua', nome: 'Quarta-feira', abrev: 'Qua' },
  { indice: 4, chave: 'qui', nome: 'Quinta-feira', abrev: 'Qui' },
  { indice: 5, chave: 'sex', nome: 'Sexta-feira', abrev: 'Sex' },
]

// Logística de Entrega / Busca do Carro
export const OPCOES_LOGISTICA = [
  {
    valor: 'CLIENTE_LEVA',
    rotulo: 'Cliente vai levar o carro na oficina',
    descricao: 'O cliente traz o veículo pessoalmente no horário combinado',
  },
  {
    valor: 'OFICINA_BUSCA',
    rotulo: 'Oficina deve buscar o carro (Leva e Traz)',
    descricao: 'A oficina retira o veículo no endereço do cliente',
  },
]

// Prioridades da Fila de Atendimento: Garantia é Prioridade 1 (topo absoluto)
export const PRIORIDADE_FILA = {
  GARANTIA: {
    valor: 'GARANTIA',
    rotulo: 'Garantia de Serviço (Prioridade 1)',
    ordemPeso: 1,
    corBadge: 'bg-[#0f172a] text-white border border-[#0f172a]',
    descricao: 'Atendimento prioritário por garantia de serviço',
  },
  RETORNO: {
    valor: 'RETORNO',
    rotulo: 'Retorno Técnico (Prioridade 2)',
    ordemPeso: 2,
    corBadge: 'bg-sky-100 text-sky-900 border border-sky-300',
    descricao: 'Ajuste ou revisão técnica pós-serviço',
  },
  URGENTE: {
    valor: 'URGENTE',
    rotulo: 'Pane Urgente / Socorro (Prioridade 3)',
    ordemPeso: 3,
    corBadge: 'bg-amber-100 text-amber-900 border border-amber-300',
    descricao: 'Veículo com problema crítico ou emergencial',
  },
  NORMAL: {
    valor: 'NORMAL',
    rotulo: 'Ordem de Chegada Convencional',
    ordemPeso: 4,
    corBadge: 'bg-slate-100 text-slate-800 border border-slate-200',
    descricao: 'Atendimento comum por ordem rigorosa de chegada',
  },
}

// Helper para calcular as datas da semana ativa (Segunda a Sexta)
export function obterDatasDaSemana(dataReferencia = new Date()) {
  const data = new Date(dataReferencia)
  const diaSemana = data.getDay() // 0 = Dom, 1 = Seg ... 6 = Sab
  const distanciaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana

  const segunda = new Date(data)
  segunda.setDate(data.getDate() + distanciaParaSegunda)
  segunda.setHours(0, 0, 0, 0)

  return DIAS_SEMANA_NOMES.map((d, index) => {
    const diaAtual = new Date(segunda)
    diaAtual.setDate(segunda.getDate() + index)
    const diaStr = String(diaAtual.getDate()).padStart(2, '0')
    const mesStr = String(diaAtual.getMonth() + 1).padStart(2, '0')
    const anoStr = diaAtual.getFullYear()
    const dataIso = `${anoStr}-${mesStr}-${diaStr}`
    const dataBr = `${diaStr}/${mesStr}/${anoStr}`

    return {
      ...d,
      dataIso,
      dataBr,
      objetoDate: diaAtual,
      isHoje: new Date().toISOString().slice(0, 10) === dataIso,
    }
  })
}

// Agendamentos Iniciais de Exemplo
export const AGENDAMENTOS_INICIAIS = []

// Ocupações de Mecânicos em Ordens de Serviço (OS em andamento no pátio)
export const OCUPACOES_OS_MECANICOS = []

export function obterOcupacoesOSMecanico(mecanicoId) {
  return OCUPACOES_OS_MECANICOS.filter((o) => o.mecanicoId === mecanicoId)
}

// Fila de Espera / Recepção (Ordem de chegada com prioridade absoluta para Garantias)
export const FILA_ESPERA_INICIAL = []

// Carregamento e Salvamento de Agendamentos
export function carregarAgendamentos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AGENDAMENTOS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return AGENDAMENTOS_INICIAIS
}

export function salvarAgendamentos(agendamentos) {
  try {
    localStorage.setItem(STORAGE_KEY_AGENDAMENTOS, JSON.stringify(agendamentos))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_agenda_updated'))
  } catch {}
}

// Carregamento e Salvamento da Fila de Espera
export function carregarFilaEspera() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILA_ESPERA)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return ordenarFilaPorPrioridadeEChegada(parsed)
      }
    }
  } catch {}
  return ordenarFilaPorPrioridadeEChegada(FILA_ESPERA_INICIAL)
}

export function salvarFilaEspera(fila) {
  try {
    const ordenada = ordenarFilaPorPrioridadeEChegada(fila)
    localStorage.setItem(STORAGE_KEY_FILA_ESPERA, JSON.stringify(ordenada))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_fila_updated'))
  } catch {}
}

// Ordenação Rigorosa: Garantia (P1) > Retorno (P2) > Urgente (P3) > Normal por Horário de Chegada
export function ordenarFilaPorPrioridadeEChegada(fila) {
  if (!Array.isArray(fila)) return []
  return [...fila].sort((a, b) => {
    const pesoA = PRIORIDADE_FILA[a.prioridade]?.ordemPeso || 99
    const pesoB = PRIORIDADE_FILA[b.prioridade]?.ordemPeso || 99

    if (pesoA !== pesoB) {
      return pesoA - pesoB // Menor peso vem primeiro (1 = Garantia)
    }

    // Mesmo peso: desempata rigorosamente por hora de chegada
    const horaA = a.horaChegada || '99:99'
    const horaB = b.horaChegada || '99:99'
    return horaA.localeCompare(horaB)
  })
}

// Verificação de Conflitos na Grade do Mecânico
export function verificarConflitoGrade({
  mecanicoId,
  diaChave,
  horarioInicio,
  duracaoHoras = 1,
  idIgnorar = null,
  agendamentos = [],
}) {
  const horaNumInicio = parseInt(horarioInicio.split(':')[0], 10)
  const horaNumFim = horaNumInicio + Number(duracaoHoras)

  const conflito = agendamentos.find((ag) => {
    if (idIgnorar && ag.id === idIgnorar) return false
    if (ag.mecanicoId !== mecanicoId) return false
    if (ag.diaChave !== diaChave) return false

    const agHoraInicio = parseInt(ag.horarioInicio.split(':')[0], 10)
    const agHoraFim = agHoraInicio + Number(ag.duracaoHoras || 1)

    // Sobreposição de intervalos [inicio, fim)
    return Math.max(horaNumInicio, agHoraInicio) < Math.min(horaNumFim, agHoraFim)
  })

  return conflito || null
}

// Recálculo Dinâmico em Cascata: quando houver atraso, os agendamentos subsequentes
// são empurrados para os horários seguintes e, se exceder 18:00, transferidos para o dia seguinte às 08:00
const DIAS_ORDEM_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex']

export function recalcularCascataDeAtrasos(agendamentos, mecanicoId) {
  if (!Array.isArray(agendamentos) || !mecanicoId) return agendamentos || []

  // Agendamentos de outros mecânicos permanecem sem alteração
  const outrosMecanicos = agendamentos.filter((a) => a.mecanicoId !== mecanicoId)
  const agsMec = agendamentos.filter((a) => a.mecanicoId === mecanicoId)

  let listaRecalculada = []
  let pendentesProximoDia = [] // Agendamentos que estouraram 18h e passam para o dia seguinte

  DIAS_ORDEM_SEMANA.forEach((diaChave, diaIdx) => {
    // Agendamentos que pertencem originalmente a este dia ou vieram empurrados do dia anterior
    const agsDoDia = [
      ...pendentesProximoDia,
      ...agsMec.filter((a) => {
        // Se já foi empurrado de outro dia, já está em pendentesProximoDia
        const diaOriginal = a.diaOriginal || a.diaChave
        return diaOriginal === diaChave
      }),
    ]
    pendentesProximoDia = []

    // Ordena pela hora de início original
    agsDoDia.sort((a, b) => {
      const hA = parseInt((a.horarioOriginal || a.horarioInicio || '08:00').split(':')[0], 10)
      const hB = parseInt((b.horarioOriginal || b.horarioInicio || '08:00').split(':')[0], 10)
      return hA - hB
    })

    let cursorHora = 8 // Início do expediente (08:00)

    agsDoDia.forEach((ag) => {
      const horaOriginalNum = parseInt((ag.horarioOriginal || ag.horarioInicio || '08:00').split(':')[0], 10)
      let horaInicioEfetiva = Math.max(horaOriginalNum, cursorHora)

      // Se cair exatamente no almoço (12:00), empurra para as 13:00 (retorno do almoço)
      if (horaInicioEfetiva === 12) {
        horaInicioEfetiva = 13
      }

      const duracao = Number(ag.duracaoHoras || 1)
      const atrasoHoras = Math.ceil(Number(ag.tempoAtrasoMinutos || 0) / 60)
      const duracaoTotal = duracao + atrasoHoras

      // Cálculo de término
      let horaFimEfetiva = horaInicioEfetiva + duracaoTotal
      if (horaInicioEfetiva < 12 && horaFimEfetiva > 12) {
        horaFimEfetiva += 1 // Acrescenta 1h de almoço
      }

      // Se a hora de início ou término estourar o expediente (18:00)
      if (horaInicioEfetiva >= 18 || horaFimEfetiva > 18) {
        if (diaIdx < DIAS_ORDEM_SEMANA.length - 1) {
          const proximoDiaChave = DIAS_ORDEM_SEMANA[diaIdx + 1]
          pendentesProximoDia.push({
            ...ag,
            diaChave: proximoDiaChave,
            diaOriginal: ag.diaOriginal || ag.diaChave,
            horarioInicio: '08:00',
            horarioOriginal: ag.horarioOriginal || ag.horarioInicio,
            foiEmpurradoCascata: true,
            empurradoDeDia: diaChave,
            empurradoMinutos: 0,
            motivoEmpurrado: `Transferido de ${diaChave.toUpperCase()} por atraso acumulado`,
          })
          return
        }
      }

      const novoHorarioInicioStr = `${String(horaInicioEfetiva).padStart(2, '0')}:00`
      const foiEmpurrado =
        novoHorarioInicioStr !== (ag.horarioOriginal || ag.horarioInicio) || !!ag.empurradoDeDia

      const minutosDiferenca = foiEmpurrado
        ? (horaInicioEfetiva - horaOriginalNum) * 60
        : 0

      const agProcessado = {
        ...ag,
        diaChave,
        diaOriginal: ag.diaOriginal || ag.diaChave,
        horarioInicio: novoHorarioInicioStr,
        horarioOriginal: ag.horarioOriginal || ag.horarioInicio,
        foiEmpurradoCascata: foiEmpurrado,
        empurradoMinutos: minutosDiferenca > 0 ? minutosDiferenca : ag.empurradoMinutos || 0,
      }

      listaRecalculada.push(agProcessado)
      cursorHora = horaFimEfetiva === 12 ? 13 : horaFimEfetiva
    })
  })

  // Se sobrou algum agendamento empurrado após a sexta-feira, mantém na grade com aviso
  if (pendentesProximoDia.length > 0) {
    listaRecalculada.push(...pendentesProximoDia)
  }

  return [...outrosMecanicos, ...listaRecalculada]
}

