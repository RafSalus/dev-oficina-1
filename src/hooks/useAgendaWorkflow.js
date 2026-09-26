import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  MECANICOS_AGENDA,
  MECANICO_VAZIO,
  obterDatasDaSemana,
  recalcularCascataDeAtrasos,
  carregarAgendamentos as carregarAgendamentosLocal,
  salvarAgendamentos as salvarAgendamentosLocal,
  carregarFilaEspera as carregarFilaEsperaLocal,
  salvarFilaEspera as salvarFilaEsperaLocal,
} from '../constants/agendaData'
import {
  carregarAgendamentos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
  carregarFilaEspera,
  excluirItemFilaEspera,
  aplicarCascataAtrasos,
} from '../repositories/agendaRepository'
import { obterMecanicosAtivos } from '../repositories/funcionariosRepository'
import { isModoRemoto } from '../repositories/supabaseHelpers'

/**
 * Casamento flexível de IDs de mecânico (prefixos `mec-` ou `func-`).
 */
export function matchMecanico(agendamento, mecanico) {
  if (!agendamento || !mecanico) return false
  const mecId = String(mecanico.id || mecanico.value || '')
  const agMecId = String(agendamento.mecanicoId || '')
  return (
    agMecId === mecId ||
    agMecId === mecId.replace('func-', 'mec-') ||
    agMecId === mecId.replace('mec-', 'func-')
  )
}

/**
 * Indica se um agendamento corresponde ao termo de busca (cliente, placa, modelo ou serviço).
 * Termo vazio corresponde a qualquer agendamento.
 */
export function agendamentoCorrespondeBusca(agendamento, termoBusca) {
  const termo = (termoBusca || '').toLowerCase().trim()
  if (!termo) return true
  return Boolean(
    agendamento.clienteNome?.toLowerCase().includes(termo) ||
      agendamento.veiculoPlaca?.toLowerCase().includes(termo) ||
      agendamento.veiculoModelo?.toLowerCase().includes(termo) ||
      agendamento.servicoDescricao?.toLowerCase().includes(termo)
  )
}

/**
 * Monta o agendamento criado ao alocar o 1º cliente da fila em um horário livre.
 */
export function criarAgendamentoDaFila({ mecanico, diaChave, horario, clienteFila }) {
  return {
    id: `ag-fila-${Date.now()}`,
    mecanicoId: mecanico.id,
    mecanicoNome: mecanico.nome,
    clienteNome: clienteFila.clienteNome,
    clienteTelefone: clienteFila.clienteTelefone,
    veiculoModelo: clienteFila.veiculoModelo,
    veiculoPlaca: clienteFila.veiculoPlaca,
    servicoDescricao: clienteFila.motivo || 'Atendimento agendado a partir da fila',
    diaChave,
    horarioInicio: horario,
    duracaoHoras: 1,
    tipoLogistica: 'CLIENTE_LEVA',
    horarioVeiculo: horario,
    enderecoColeta: '',
    observacoes: `[Alocado automaticamente do 1º da fila de atendimento (${clienteFila.prioridade})]`,
    emAtraso: false,
    tempoAtrasoMinutos: 0,
    criadoEm: new Date().toISOString(),
  }
}

/**
 * Hook de domínio da Agenda Dinâmica e Fila de Espera (ADR-003 / NFR18).
 * Fonte única de estado, carga, persistência e ações para as telas desktop e mobile.
 * Toda leitura e escrita passa por `constants/agendaData.js` (ponto de troca da Story 2.10).
 */
export function useAgendaWorkflow() {
  // Aba Ativa Principal: 'grade' (Agenda Semanal) | 'fila' (Fila de Atendimento Dedicada)
  const [abaAtivaPrincipal, setAbaAtivaPrincipal] = useState('grade')

  // Estado da Semana Ativa
  const [dataReferencia, setDataReferencia] = useState(new Date())
  const semanaDias = useMemo(() => obterDatasDaSemana(dataReferencia), [dataReferencia])

  // Lista dinâmica de mecânicos vindos do repositório de funcionários
  const [mecanicosLista, setMecanicosLista] = useState(MECANICOS_AGENDA)

  // Mecânico Selecionado: Mostra SOMENTE a agenda deste mecânico
  const [mecanicoSelecionadoId, setMecanicoSelecionadoId] = useState(MECANICOS_AGENDA[0]?.id || '')

  // Dados Centrais
  const [agendamentos, setAgendamentos] = useState([])
  const [filaEspera, setFilaEspera] = useState([])
  const [termoBusca, setTermoBusca] = useState('')

  // Modais
  const [isModalAgendamentoAberto, setIsModalAgendamentoAberto] = useState(false)
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null)
  const [slotPreSelecionado, setSlotPreSelecionado] = useState({ dia: 'seg', horario: '08:00' })

  const [isModalAtrasoAberto, setIsModalAtrasoAberto] = useState(false)
  const [agendamentoAtrasadoAlvo, setAgendamentoAtrasadoAlvo] = useState(null)

  // Carregar lista dinâmica de colaboradores mecânicos ativos
  useEffect(() => {
    let cancelado = false
    const carregarMecs = async () => {
      try {
        const ativos = await obterMecanicosAtivos()
        if (!cancelado && ativos && ativos.length > 0) {
          setMecanicosLista(ativos)
        }
      } catch (err) {
        console.error('Erro ao carregar mecânicos para agenda:', err)
      }
    }

    carregarMecs()

    const handleUpdate = () => carregarMecs()
    window.addEventListener('dev_oficina_funcionarios_updated', handleUpdate)
    return () => {
      cancelado = true
      window.removeEventListener('dev_oficina_funcionarios_updated', handleUpdate)
    }
  }, [])

  // Carregar dados e sincronizar com storage/eventos
  useEffect(() => {
    let cancelado = false
    const recarregarDados = () => {
      setAgendamentos(carregarAgendamentosLocal())
      setFilaEspera(carregarFilaEsperaLocal())

      if (isModoRemoto()) {
        carregarAgendamentos()
          .then((ags) => {
            if (!cancelado && ags) setAgendamentos(ags)
          })
          .catch(() => {})

        carregarFilaEspera()
          .then((fila) => {
            if (!cancelado && fila) setFilaEspera(fila)
          })
          .catch(() => {})
      }
    }

    recarregarDados()

    const handleFilaUpdate = () => {
      setFilaEspera(carregarFilaEsperaLocal())
      if (isModoRemoto()) {
        carregarFilaEspera()
          .then((fila) => {
            if (!cancelado && fila) setFilaEspera(fila)
          })
          .catch(() => {})
      }
    }

    window.addEventListener('dev_oficina_agenda_updated', recarregarDados)
    window.addEventListener('dev_oficina_fila_updated', handleFilaUpdate)
    window.addEventListener('storage', recarregarDados)

    return () => {
      cancelado = true
      window.removeEventListener('dev_oficina_agenda_updated', recarregarDados)
      window.removeEventListener('dev_oficina_fila_updated', handleFilaUpdate)
      window.removeEventListener('storage', recarregarDados)
    }
  }, [])

  // Mecânico Ativo Atual
  const mecanicoAtivo = useMemo(() => {
    return (
      mecanicosLista.find((m) => m.id === mecanicoSelecionadoId) ||
      mecanicosLista[0] ||
      MECANICO_VAZIO
    )
  }, [mecanicosLista, mecanicoSelecionadoId])

  // Navegação da Semana
  const irParaSemanaAnterior = () => {
    const nova = new Date(dataReferencia)
    nova.setDate(nova.getDate() - 7)
    setDataReferencia(nova)
  }

  const irParaProximaSemana = () => {
    const nova = new Date(dataReferencia)
    nova.setDate(nova.getDate() + 7)
    setDataReferencia(nova)
  }

  const irParaSemanaAtual = () => {
    setDataReferencia(new Date())
  }

  // Agendamentos filtrados por mecânico ativo e busca
  const agendamentosMecanico = useMemo(() => {
    return agendamentos.filter(
      (a) => matchMecanico(a, mecanicoAtivo) && agendamentoCorrespondeBusca(a, termoBusca)
    )
  }, [agendamentos, mecanicoAtivo, termoBusca])

  // Contadores
  const totalFila = filaEspera.length
  const totalGarantiasFila = filaEspera.filter((f) => f.prioridade === 'GARANTIA').length

  // Abertura de Modal de Agendamento Manual
  const abrirNovoAgendamento = (diaChave = 'seg', horario = '08:00') => {
    setSlotPreSelecionado({ dia: diaChave, horario })
    setAgendamentoEmEdicao(null)
    setIsModalAgendamentoAberto(true)
  }

  const editarAgendamento = (agendamento) => {
    setAgendamentoEmEdicao(agendamento)
    setSlotPreSelecionado({
      dia: agendamento.diaChave,
      horario: agendamento.horarioInicio,
    })
    setIsModalAgendamentoAberto(true)
  }

  const fecharModalAgendamento = () => {
    setIsModalAgendamentoAberto(false)
  }

  const salvarAgendamento = (agendamentoSalvo) => {
    const existe = agendamentos.some((a) => a.id === agendamentoSalvo.id)
    const novaLista = existe
      ? agendamentos.map((a) => (a.id === agendamentoSalvo.id ? agendamentoSalvo : a))
      : [agendamentoSalvo, ...agendamentos]
    salvarAgendamentosLocal(novaLista)
    setAgendamentos(novaLista)
    setIsModalAgendamentoAberto(false)

    if (isModoRemoto()) {
      if (existe) {
        atualizarAgendamento(agendamentoSalvo.id, agendamentoSalvo, agendamentoSalvo.updatedAt).catch((err) => {
          toast.error(err.message || 'Erro ao atualizar agendamento')
        })
      } else {
        criarAgendamento(agendamentoSalvo).catch((err) => {
          toast.error(err.message || 'Erro ao criar agendamento')
        })
      }
    }
  }

  const excluirAgendamentoAcao = (id) => {
    const novaLista = agendamentos.filter((a) => a.id !== id)
    salvarAgendamentosLocal(novaLista)
    setAgendamentos(novaLista)
    setIsModalAgendamentoAberto(false)

    if (isModoRemoto()) {
      excluirAgendamento(id).catch((err) => {
        toast.error(err.message || 'Erro ao excluir agendamento')
      })
    }
  }

  const abrirTratarAtraso = (agendamento) => {
    setAgendamentoAtrasadoAlvo(agendamento)
    setIsModalAtrasoAberto(true)
  }

  const fecharModalAtraso = () => {
    setIsModalAtrasoAberto(false)
    setAgendamentoAtrasadoAlvo(null)
  }

  const salvarAtrasoTratado = (agendamentoAtualizado) => {
    const novaLista = agendamentos.map((a) =>
      a.id === agendamentoAtualizado.id ? agendamentoAtualizado : a
    )
    const listaCascata = recalcularCascataDeAtrasos(novaLista, agendamentoAtualizado.mecanicoId)
    salvarAgendamentosLocal(listaCascata)
    setAgendamentos(listaCascata)
    setIsModalAtrasoAberto(false)

    if (isModoRemoto()) {
      aplicarCascataAtrasos(listaCascata).catch((err) => {
        toast.error(err.message || 'Erro ao aplicar cascata de atrasos')
      })
    }
  }

  const atualizarFila = (novaFila) => {
    salvarFilaEsperaLocal(novaFila)
    setFilaEspera(novaFila)
  }

  // Preenchimento Automático do Horário a partir do 1º Cliente da Fila
  const preencherHorarioAutomatico = (diaChave, horario, clienteFila) => {
    if (!clienteFila) return
    if (!mecanicoAtivo.id) {
      toast.error('Cadastre um mecânico ativo em Funcionários antes de agendar.')
      return
    }

    const novoAgendamento = criarAgendamentoDaFila({
      mecanico: mecanicoAtivo,
      diaChave,
      horario,
      clienteFila,
    })

    // 1. Adiciona na grade de agendamentos
    const novaListaAg = [novoAgendamento, ...agendamentos]
    salvarAgendamentosLocal(novaListaAg)
    setAgendamentos(novaListaAg)

    // 2. Remove o cliente da fila de espera
    const novaFila = filaEspera.filter((f) => f.id !== clienteFila.id)
    salvarFilaEsperaLocal(novaFila)
    setFilaEspera(novaFila)

    if (isModoRemoto()) {
      criarAgendamento(novoAgendamento).catch(() => {})
      excluirItemFilaEspera(clienteFila.id).catch(() => {})
    }

    toast.success(
      `Slot preenchido automaticamente! ${clienteFila.clienteNome} foi agendado(a) com ${mecanicoAtivo.nome} às ${horario}.`
    )
  }

  return {
    abaAtivaPrincipal,
    setAbaAtivaPrincipal,
    semanaDias,
    irParaSemanaAnterior,
    irParaProximaSemana,
    irParaSemanaAtual,
    mecanicosLista,
    mecanicoSelecionadoId,
    setMecanicoSelecionadoId,
    mecanicoAtivo,
    agendamentos,
    agendamentosMecanico,
    filaEspera,
    termoBusca,
    setTermoBusca,
    totalFila,
    totalGarantiasFila,
    isModalAgendamentoAberto,
    agendamentoEmEdicao,
    slotPreSelecionado,
    abrirNovoAgendamento,
    editarAgendamento,
    fecharModalAgendamento,
    salvarAgendamento,
    excluirAgendamento: excluirAgendamentoAcao,
    isModalAtrasoAberto,
    agendamentoAtrasadoAlvo,
    abrirTratarAtraso,
    fecharModalAtraso,
    salvarAtrasoTratado,
    atualizarFila,
    preencherHorarioAutomatico,
  }
}
