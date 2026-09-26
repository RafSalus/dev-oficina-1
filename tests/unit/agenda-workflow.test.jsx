import React from 'react'
import { render, screen, renderHook, act, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { toast } from 'sonner'
import AgendaPage from '../../src/pages/dashboard/agenda/AgendaPage'
import * as useIsMobileModule from '../../src/hooks/useIsMobile'
import { useAgendaWorkflow, matchMecanico, agendamentoCorrespondeBusca } from '../../src/hooks/useAgendaWorkflow'
import { useAgendamentoFormWorkflow, validarAgendamento } from '../../src/hooks/useAgendamentoFormWorkflow'
import {
  useFilaEsperaWorkflow,
  filtrarFila,
  calcularMetricasFila,
  construirItemFila,
  inserirNaFila,
} from '../../src/hooks/useFilaEsperaWorkflow'
import { montarBlocosDoDia } from '../../src/hooks/useGradeMecanico'
import { STORAGE_KEY_AGENDAMENTOS, STORAGE_KEY_FILA_ESPERA } from '../../src/constants/agendaData'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

vi.mock('../../src/repositories/funcionariosRepository', () => ({
  obterMecanicosAtivos: vi.fn(async () => [{ id: 'mec-1', nome: 'João Mecânico' }]),
}))

const agendamentoBase = {
  id: 'ag-1',
  mecanicoId: 'mec-1',
  mecanicoNome: 'João Mecânico',
  clienteNome: 'Maria Souza',
  veiculoModelo: 'Fiat Uno',
  veiculoPlaca: 'ABC1D23',
  servicoDescricao: 'Troca de óleo',
  diaChave: 'seg',
  horarioInicio: '09:00',
  duracaoHoras: 2,
}

const itemFila = (id, prioridade, horaChegada, extra = {}) => ({
  id,
  prioridade,
  horaChegada,
  clienteNome: `Cliente ${id}`,
  veiculoModelo: 'Gol',
  veiculoPlaca: '',
  motivo: 'Revisão',
  ...extra,
})

describe('Agenda e Fila decompostas (Story 2.0e / ADR-003)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(false)
  })

  describe('useAgendaWorkflow — carga e persistência', () => {
    it('carrega agendamentos e fila do storage e persiste um novo agendamento', async () => {
      localStorage.setItem(STORAGE_KEY_AGENDAMENTOS, JSON.stringify([agendamentoBase]))
      localStorage.setItem(STORAGE_KEY_FILA_ESPERA, JSON.stringify([itemFila('f1', 'NORMAL', '08:00')]))

      const { result } = renderHook(() => useAgendaWorkflow())
      await waitFor(() => expect(result.current.mecanicoAtivo.id).toBe('mec-1'))

      expect(result.current.agendamentos).toHaveLength(1)
      expect(result.current.totalFila).toBe(1)
      expect(result.current.agendamentosMecanico).toHaveLength(1)

      act(() => result.current.salvarAgendamento({ ...agendamentoBase, id: 'ag-2', horarioInicio: '14:00' }))

      const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY_AGENDAMENTOS))
      expect(salvos.map((a) => a.id)).toEqual(['ag-2', 'ag-1'])
      expect(result.current.isModalAgendamentoAberto).toBe(false)
    })

    it('aloca o 1º da fila no slot livre e remove o cliente da fila', async () => {
      const cliente = itemFila('f1', 'GARANTIA', '08:10')
      localStorage.setItem(STORAGE_KEY_FILA_ESPERA, JSON.stringify([cliente]))

      const { result } = renderHook(() => useAgendaWorkflow())
      await waitFor(() => expect(result.current.mecanicoAtivo.id).toBe('mec-1'))

      act(() => result.current.preencherHorarioAutomatico('ter', '10:00', cliente))

      expect(result.current.filaEspera).toHaveLength(0)
      expect(result.current.agendamentos[0]).toMatchObject({
        mecanicoId: 'mec-1',
        clienteNome: 'Cliente f1',
        diaChave: 'ter',
        horarioInicio: '10:00',
      })
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY_FILA_ESPERA))).toEqual([])
      expect(toast.success).toHaveBeenCalled()
    })

    it('filtra agendamentos por busca e casa IDs de mecânico mec-/func-', () => {
      expect(matchMecanico({ mecanicoId: 'mec-7' }, { id: 'func-7' })).toBe(true)
      expect(matchMecanico({ mecanicoId: 'mec-7' }, { id: 'func-8' })).toBe(false)
      expect(agendamentoCorrespondeBusca(agendamentoBase, 'abc1')).toBe(true)
      expect(agendamentoCorrespondeBusca(agendamentoBase, 'palio')).toBe(false)
      expect(agendamentoCorrespondeBusca(agendamentoBase, '   ')).toBe(true)
    })
  })

  describe('useAgendamentoFormWorkflow — conflito de horário', () => {
    const abrirFormulario = (props = {}) =>
      renderHook(() =>
        useAgendamentoFormWorkflow({
          isOpen: true,
          onClose: vi.fn(),
          onSalvar: props.onSalvar || vi.fn(),
          diaPreSelecionado: 'seg',
          horarioPreSelecionado: '10:00',
          mecanicoPreSelecionado: 'mec-1',
          agendamentosExistentes: [agendamentoBase],
        })
      )

    it('detecta conflito e bloqueia o salvamento até marcar "Permitir sobreposição"', async () => {
      const onSalvar = vi.fn()
      const { result } = abrirFormulario({ onSalvar })
      await waitFor(() => expect(result.current.opcoesMecanicos).toHaveLength(1))

      expect(result.current.conflitoDetectado?.id).toBe('ag-1')

      act(() => {
        result.current.setClienteNome('Pedro')
        result.current.setVeiculoModelo('Onix')
        result.current.setServicoDescricao('Freios')
      })
      act(() => result.current.salvar())
      expect(onSalvar).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Maria Souza'))

      act(() => result.current.setIgnorarConflito(true))
      act(() => result.current.salvar())
      expect(onSalvar).toHaveBeenCalledWith(
        expect.objectContaining({ clienteNome: 'Pedro', mecanicoId: 'mec-1', diaChave: 'seg', horarioInicio: '10:00' })
      )
    })

    it('sem conflito quando o horário não se sobrepõe', async () => {
      const { result } = abrirFormulario()
      act(() => result.current.setHorarioInicio('11:00'))
      expect(result.current.conflitoDetectado).toBeNull()
    })

    it('valida campos obrigatórios na ordem cliente → veículo → serviço', () => {
      const base = { clienteNome: 'A', veiculoModelo: 'B', servicoDescricao: 'C', conflito: null, ignorarConflito: false }
      expect(validarAgendamento({ ...base, clienteNome: ' ' })).toMatch(/cliente/)
      expect(validarAgendamento({ ...base, veiculoModelo: '' })).toMatch(/veículo/)
      expect(validarAgendamento({ ...base, servicoDescricao: '' })).toMatch(/serviço/)
      expect(validarAgendamento(base)).toBeNull()
    })
  })

  describe('useFilaEsperaWorkflow — ordenação, filtros e métricas', () => {
    const fila = [
      itemFila('n1', 'NORMAL', '08:00'),
      itemFila('u1', 'URGENTE', '09:00', { veiculoPlaca: 'XYZ9A99' }),
      itemFila('g1', 'GARANTIA', '10:00'),
      itemFila('n0', 'NORMAL', '07:30'),
    ]

    it('ordena por prioridade e, no empate, por hora de chegada', () => {
      const { result } = renderHook(() => useFilaEsperaWorkflow({ fila, onAtualizarFila: vi.fn() }))
      expect(result.current.filaOrdenada.map((f) => f.id)).toEqual(['g1', 'u1', 'n0', 'n1'])
      expect(result.current.primeiroFila.id).toBe('g1')
      expect(result.current.metricasFila).toEqual({ total: 4, garantias: 1, retornos: 0, urgentes: 1, normais: 2 })
    })

    it('filtra por prioridade e por busca', () => {
      const { result } = renderHook(() => useFilaEsperaWorkflow({ fila, onAtualizarFila: vi.fn() }))
      act(() => result.current.setFiltroPrioridade('NORMAL'))
      expect(result.current.filaFiltrada.map((f) => f.id)).toEqual(['n0', 'n1'])

      act(() => {
        result.current.setFiltroPrioridade('TODOS')
        result.current.setBusca('xyz9')
      })
      expect(result.current.filaFiltrada.map((f) => f.id)).toEqual(['u1'])
      expect(filtrarFila(fila, { busca: 'inexistente' })).toEqual([])
      expect(calcularMetricasFila([]).total).toBe(0)
    })

    it('remove da fila e insere novo item reordenado', () => {
      const onAtualizarFila = vi.fn()
      const { result } = renderHook(() => useFilaEsperaWorkflow({ fila, onAtualizarFila }))
      act(() => result.current.removerDaFila(fila[0]))
      expect(onAtualizarFila).toHaveBeenCalledWith(fila.slice(1))

      const { item } = construirItemFila(
        { clienteNome: ' Ana ', clienteTelefone: '', veiculoModelo: '', veiculoPlaca: 'abc', motivo: '', prioridade: 'RETORNO' },
        { veiculoModelo: 'Veículo do Cliente', motivo: 'Atendimento presencial na oficina' }
      )
      expect(item).toMatchObject({ clienteNome: 'Ana', veiculoModelo: 'Veículo do Cliente', veiculoPlaca: 'ABC', tempoEstimadoMinutos: 45 })
      expect(inserirNaFila(fila, item).map((f) => f.prioridade)[1]).toBe('RETORNO')
    })
  })

  describe('montarBlocosDoDia — grade compartilhada desktop/mobile', () => {
    it('ocupa as horas do agendamento e marca o almoço como livre', () => {
      const blocos = montarBlocosDoDia({ diaChave: 'seg', agendamentos: [agendamentoBase] })
      const bloco = blocos.find((b) => b.tipo === 'agendamento')
      expect(bloco).toMatchObject({ startRow: 2, span: 2, horario: '09:00' })
      expect(blocos.some((b) => b.horario === '10:00')).toBe(false)
      expect(blocos.find((b) => b.horario === '12:00')).toMatchObject({ tipo: 'livre', isAlmoco: true })
      expect(blocos.reduce((soma, b) => soma + b.span, 0)).toBe(10)
    })
  })

  describe('Renderização desktop e mobile', () => {
    it('renderiza a agenda desktop com as abas Agenda Semanal e Fila', async () => {
      render(
        <MemoryRouter>
          <AgendaPage />
        </MemoryRouter>
      )
      expect(screen.getByText('Agenda Semanal')).toBeDefined()
      expect(screen.getByText('Fila de Atendimento')).toBeDefined()
      expect(await screen.findByText('Novo Agendamento')).toBeDefined()
    })

    it('renderiza a agenda mobile quando isMobile é verdadeiro', async () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)
      render(
        <MemoryRouter>
          <AgendaPage />
        </MemoryRouter>
      )
      expect(screen.getByText('Agenda')).toBeDefined()
      expect(await screen.findByText('Fim do expediente')).toBeDefined()
    })

    it('desktop: abre o modal de novo agendamento pelo botão do cabeçalho', async () => {
      render(
        <MemoryRouter>
          <AgendaPage />
        </MemoryRouter>
      )
      fireEvent.click(await screen.findByText('Novo Agendamento'))
      expect(await screen.findByText('Novo Agendamento de Atendimento')).toBeDefined()
      expect(screen.getByText('1. Seleção do Cliente')).toBeDefined()
    })

    it('mobile: envia o 1º da fila para um horário livre da linha do tempo', async () => {
      vi.spyOn(useIsMobileModule, 'useIsMobile').mockReturnValue(true)
      localStorage.setItem(
        STORAGE_KEY_FILA_ESPERA,
        JSON.stringify([itemFila('f1', 'GARANTIA', '08:10', { clienteNome: 'Carlos Garantia' })])
      )
      render(
        <MemoryRouter>
          <AgendaPage />
        </MemoryRouter>
      )

      // Espera o mecânico ativo carregar (mec-1) antes de alocar o slot
      await screen.findByText(/Agenda de João Mecânico/)
      const slots = await screen.findAllByText('Horário livre • Enviar ao 1º da fila')
      fireEvent.click(slots[0])
      fireEvent.click(await screen.findByText('Confirmar'))

      await waitFor(() => expect(JSON.parse(localStorage.getItem(STORAGE_KEY_FILA_ESPERA))).toEqual([]))
      const agenda = JSON.parse(localStorage.getItem(STORAGE_KEY_AGENDAMENTOS))
      expect(agenda[0]).toMatchObject({ clienteNome: 'Carlos Garantia', mecanicoId: 'mec-1', horarioInicio: '08:00' })
      expect(await screen.findByText('Carlos Garantia')).toBeDefined()
    })
  })
})
