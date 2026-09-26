import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import { CODIGOS_ERRO } from '../../src/repositories/erroRepositorio'
import {
  carregarAgendamentos,
  obterAgendamentoPorId,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
  aplicarCascataAtrasos,
  carregarFilaEspera,
  obterItemFilaEsperaPorId,
  criarItemFilaEspera,
  atualizarItemFilaEspera,
  excluirItemFilaEspera,
} from '../../src/repositories/agendaRepository'

describe('agendaRepository (Story 2.10)', () => {
  beforeEach(() => {
    localStorage.clear()
    setModoOperacaoOverride(null)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    setModoOperacaoOverride(null)
    vi.restoreAllMocks()
    localStorage.clear()
  })

  describe('Modo Remoto (Supabase, Concorrência Otimista e Fail-Closed)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    it('carregarAgendamentos: busca agendamentos ordenados por horário', async () => {
      const mockAgendamentosDb = [
        {
          id: 'ag-1',
          mecanico_id: 'mec-1',
          mecanico_nome: 'Gabriel Mecânico',
          cliente_nome: 'Carlos Souza',
          veiculo_modelo: 'Civic 2.0',
          servico_descricao: 'Troca de pastilhas',
          dia_chave: 'seg',
          horario_inicio: '08:00',
          duracao_horas: 2,
          created_at: '2026-09-26T10:00:00Z',
          updated_at: '2026-09-26T10:00:00Z',
        },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockAgendamentosDb, error: null })
      const mockSelect = vi.fn(() => ({ order: mockOrder }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const ags = await carregarAgendamentos()
      expect(mockClient.from).toHaveBeenCalledWith('agenda_agendamentos')
      expect(mockOrder).toHaveBeenCalledWith('horario_inicio', { ascending: true })
      expect(ags.length).toBe(1)
      expect(ags[0].id).toBe('ag-1')
      expect(ags[0].clienteNome).toBe('Carlos Souza')
      expect(ags[0].veiculoModelo).toBe('Civic 2.0')
      expect(ags[0].duracaoHoras).toBe(2)
    })

    it('criarAgendamento: insere registro e retorna objeto mapeado', async () => {
      const novo = {
        mecanicoId: 'mec-1',
        mecanicoNome: 'Gabriel',
        clienteNome: 'Mariana Lima',
        veiculoModelo: 'Gol 1.6',
        servicoDescricao: 'Revisão',
        diaChave: 'ter',
        horarioInicio: '09:00',
        duracaoHoras: 1,
      }

      const mockInserted = {
        id: 'ag-uuid-novo',
        mecanico_id: 'mec-1',
        mecanico_nome: 'Gabriel',
        cliente_nome: 'Mariana Lima',
        veiculo_modelo: 'Gol 1.6',
        servico_descricao: 'Revisão',
        dia_chave: 'ter',
        horario_inicio: '09:00',
        duracao_horas: 1,
        created_at: '2026-09-26T11:00:00Z',
        updated_at: '2026-09-26T11:00:00Z',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockInserted, error: null })
      const mockSelect = vi.fn(() => ({ single: mockSingle }))
      const mockInsert = vi.fn(() => ({ select: mockSelect }))
      const mockClient = {
        from: vi.fn(() => ({ insert: mockInsert })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const criado = await criarAgendamento(novo)
      expect(criado.id).toBe('ag-uuid-novo')
      expect(criado.clienteNome).toBe('Mariana Lima')
      expect(criado.diaChave).toBe('ter')
    })

    it('atualizarAgendamento: atualiza linha verificando updated_at com sucesso', async () => {
      const mockUpdated = {
        id: 'ag-1',
        mecanico_id: 'mec-1',
        cliente_nome: 'Carlos Alterado',
        veiculo_modelo: 'Civic',
        servico_descricao: 'Troca de pastilhas',
        dia_chave: 'seg',
        horario_inicio: '10:00',
        updated_at: '2026-09-26T11:00:00Z',
      }

      const mockSelect = vi.fn().mockResolvedValue({ data: [mockUpdated], error: null })
      const mockEqUpdated = vi.fn(() => ({ select: mockSelect }))
      const mockEqId = vi.fn(() => ({ eq: mockEqUpdated }))
      const mockUpdate = vi.fn(() => ({ eq: mockEqId }))
      const mockClient = {
        from: vi.fn(() => ({ update: mockUpdate })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const atualizado = await atualizarAgendamento(
        'ag-1',
        { clienteNome: 'Carlos Alterado', horarioInicio: '10:00' },
        '2026-09-26T10:00:00Z'
      )

      expect(mockEqId).toHaveBeenCalledWith('id', 'ag-1')
      expect(mockEqUpdated).toHaveBeenCalledWith('updated_at', '2026-09-26T10:00:00Z')
      expect(atualizado.clienteNome).toBe('Carlos Alterado')
      expect(atualizado.horarioInicio).toBe('10:00')
    })

    it('atualizarAgendamento: lança CONFLITO_EDICAO quando 0 linhas são afetadas por concorrência', async () => {
      // Retorna array vazio simulando que o updated_at no banco não bate com o lido
      const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockEqUpdated = vi.fn(() => ({ select: mockSelect }))
      const mockEqId = vi.fn(() => ({ eq: mockEqUpdated }))
      const mockUpdate = vi.fn(() => ({ eq: mockEqId }))
      const mockClient = {
        from: vi.fn(() => ({ update: mockUpdate })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(
        atualizarAgendamento(
          'ag-1',
          { horarioInicio: '11:00' },
          '2026-09-26T09:00:00Z' // valor obsoleto
        )
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.CONFLITO_EDICAO,
      })
    })

    it('excluirAgendamento: deleta por id', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn(() => ({ eq: mockEq }))
      const mockClient = {
        from: vi.fn(() => ({ delete: mockDelete })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const ok = await excluirAgendamento('ag-1')
      expect(ok).toBe(true)
      expect(mockEq).toHaveBeenCalledWith('id', 'ag-1')
    })

    it('aplicarCascataAtrasos: delega para RPC transacional aplicar_cascata_atrasos_agenda', async () => {
      const mockRpcResponse = { sucesso: true, total_afetado: 3 }
      const mockRpc = vi.fn().mockResolvedValue({ data: mockRpcResponse, error: null })
      const mockClient = { rpc: mockRpc }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const itens = [
        { id: 'ag-1', updatedAt: '2026-09-26T10:00:00Z', diaChave: 'seg', horarioInicio: '09:00', foiEmpurradoCascata: true },
        { id: 'ag-2', updatedAt: '2026-09-26T10:00:00Z', diaChave: 'seg', horarioInicio: '10:00', foiEmpurradoCascata: true },
      ]

      const res = await aplicarCascataAtrasos(itens)
      expect(mockRpc).toHaveBeenCalledWith('aplicar_cascata_atrasos_agenda', {
        p_itens: expect.arrayContaining([
          expect.objectContaining({ id: 'ag-1', updated_at_lido: '2026-09-26T10:00:00Z' }),
        ]),
      })
      expect(res.sucesso).toBe(true)
    })

    it('aplicarCascataAtrasos: lança CONFLITO_EDICAO se a RPC retornar erro P0003', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'P0003', message: 'Conflito de edição' },
      })
      const mockClient = { rpc: mockRpc }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(aplicarCascataAtrasos([{ id: 'ag-1' }])).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.CONFLITO_EDICAO,
      })
    })

    it('carregarFilaEspera: ordena por prioridade (Garantia P1) e horário de chegada', async () => {
      const mockFilaDb = [
        {
          id: 'fila-1',
          cliente_nome: 'Cliente Normal',
          prioridade: 'NORMAL',
          hora_chegada: '08:00',
        },
        {
          id: 'fila-2',
          cliente_nome: 'Cliente Garantia',
          prioridade: 'GARANTIA',
          hora_chegada: '09:30',
        },
      ]

      const mockSelect = vi.fn().mockResolvedValue({ data: mockFilaDb, error: null })
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const fila = await carregarFilaEspera()
      expect(fila.length).toBe(2)
      // Garantia (P1) deve estar em 1º lugar independente do horário
      expect(fila[0].prioridade).toBe('GARANTIA')
      expect(fila[0].clienteNome).toBe('Cliente Garantia')
      expect(fila[1].prioridade).toBe('NORMAL')
    })

    it('carregarAgendamentos: falha fechada (fail-closed) em erro remoto', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '42501', message: 'permission denied for table agenda_agendamentos' },
            }),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(carregarAgendamentos()).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.SEM_PERMISSAO,
      })
    })
  })

  describe('Modo Local (Fallback e Isolamento)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('local')
    })

    it('executa CRUD por linha de agendamentos localmente', async () => {
      const agsIniciais = await carregarAgendamentos()
      expect(Array.isArray(agsIniciais)).toBe(true)

      const criado = await criarAgendamento({
        clienteNome: 'Cliente Teste Local',
        veiculoModelo: 'Argo',
        servicoDescricao: 'Alinhamento',
        diaChave: 'qua',
        horarioInicio: '14:00',
      })
      expect(criado.id).toBeTruthy()

      const obtido = await obterAgendamentoPorId(criado.id)
      expect(obtido).toBeTruthy()
      expect(obtido.clienteNome).toBe('Cliente Teste Local')

      const atualizado = await atualizarAgendamento(criado.id, {
        ...criado,
        clienteNome: 'Cliente Teste Atualizado',
      })
      expect(atualizado.clienteNome).toBe('Cliente Teste Atualizado')

      await excluirAgendamento(criado.id)
      const aposExclusao = await obterAgendamentoPorId(criado.id)
      expect(aposExclusao).toBeNull()
    })

    it('executa CRUD por linha da fila de espera localmente', async () => {
      const filaInicial = await carregarFilaEspera()
      expect(Array.isArray(filaInicial)).toBe(true)

      const itemCriado = await criarItemFilaEspera({
        clienteNome: 'Fila Local Cliente',
        veiculoModelo: 'Onix',
        motivo: 'Barulho na suspensão',
        prioridade: 'URGENTE',
        horaChegada: '10:15',
      })
      expect(itemCriado.id).toBeTruthy()

      const itemObtido = await obterItemFilaEsperaPorId(itemCriado.id)
      expect(itemObtido.clienteNome).toBe('Fila Local Cliente')

      const itemAtualizado = await atualizarItemFilaEspera(itemCriado.id, {
        ...itemCriado,
        motivo: 'Barulho corrigido',
      })
      expect(itemAtualizado.motivo).toBe('Barulho corrigido')

      await excluirItemFilaEspera(itemCriado.id)
      const aposExcluir = await obterItemFilaEsperaPorId(itemCriado.id)
      expect(aposExcluir).toBeNull()
    })
  })
})
