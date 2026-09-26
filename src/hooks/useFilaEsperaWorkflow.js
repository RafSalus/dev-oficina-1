import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { ordenarFilaPorPrioridadeEChegada } from '../constants/agendaData'

/**
 * Filtra a fila por prioridade (`'TODOS'` não filtra) e por termo de busca
 * (cliente, placa, modelo ou motivo).
 */
export function filtrarFila(fila, { busca = '', filtroPrioridade = 'TODOS' } = {}) {
  const termo = busca.toLowerCase().trim()
  return fila.filter((item) => {
    if (filtroPrioridade !== 'TODOS' && item.prioridade !== filtroPrioridade) return false
    if (!termo) return true
    return Boolean(
      item.clienteNome?.toLowerCase().includes(termo) ||
        item.veiculoPlaca?.toLowerCase().includes(termo) ||
        item.veiculoModelo?.toLowerCase().includes(termo) ||
        item.motivo?.toLowerCase().includes(termo)
    )
  })
}

/**
 * Contagem da fila por prioridade.
 */
export function calcularMetricasFila(fila) {
  const contar = (prioridade) => fila.filter((f) => f.prioridade === prioridade).length
  return {
    total: fila.length,
    garantias: contar('GARANTIA'),
    retornos: contar('RETORNO'),
    urgentes: contar('URGENTE'),
    normais: contar('NORMAL'),
  }
}

/**
 * Monta um novo item da fila com a hora de chegada atual.
 * `padroes` define os valores usados quando modelo/motivo vêm em branco.
 */
export function construirItemFila(dados, padroes = {}) {
  const agora = new Date()
  const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`

  const item = {
    id: `fila-${Date.now()}`,
    clienteNome: dados.clienteNome.trim(),
    clienteTelefone: dados.clienteTelefone.trim(),
    veiculoModelo: dados.veiculoModelo.trim() || padroes.veiculoModelo || '',
    veiculoPlaca: (dados.veiculoPlaca || '').toUpperCase().trim(),
    motivo: dados.motivo.trim() || padroes.motivo || '',
    prioridade: dados.prioridade,
    horaChegada: horaAtual,
    dataChegada: agora.toISOString().slice(0, 10),
    mecanicoPreferencialId: dados.mecanicoPreferencialId || null,
    tempoEstimadoMinutos: Number(dados.tempoEstimadoMinutos) || 45,
  }

  return { item, horaAtual }
}

/**
 * Insere o item na fila já reordenada por prioridade e chegada.
 */
export function inserirNaFila(fila, item) {
  return ordenarFilaPorPrioridadeEChegada([item, ...fila])
}

/**
 * Hook de domínio da Fila de Espera: ordenação, filtros, métricas e remoção,
 * compartilhado pela fila dedicada desktop e pela aba de fila mobile (NFR18).
 */
export function useFilaEsperaWorkflow({ fila = [], onAtualizarFila }) {
  const [busca, setBusca] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('TODOS')

  // Fila rigorosamente ordenada
  const filaOrdenada = useMemo(() => ordenarFilaPorPrioridadeEChegada(fila), [fila])
  const primeiroFila = filaOrdenada.length > 0 ? filaOrdenada[0] : null

  const filaFiltrada = useMemo(
    () => filtrarFila(filaOrdenada, { busca, filtroPrioridade }),
    [filaOrdenada, busca, filtroPrioridade]
  )

  const metricasFila = useMemo(() => calcularMetricasFila(fila), [fila])

  const removerDaFila = (item) => {
    onAtualizarFila(fila.filter((f) => f.id !== item.id))
    toast.info(`${item.clienteNome} removido(a) da fila de atendimento.`)
  }

  return {
    busca,
    setBusca,
    filtroPrioridade,
    setFiltroPrioridade,
    filaOrdenada,
    primeiroFila,
    filaFiltrada,
    metricasFila,
    removerDaFila,
  }
}
