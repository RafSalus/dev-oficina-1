import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import { CODIGOS_ERRO } from '../../src/repositories/erroRepositorio'
import {
  carregarDeslocamentos,
  criarNovoDeslocamento,
  atualizarDeslocamento,
  iniciarDeslocamento,
  finalizarDeslocamento,
  excluirDeslocamento,
  carregarVeiculosDeApoio,
  criarVeiculoApoio,
  excluirVeiculoApoio,
} from '../../src/repositories/levaETrazRepository'

describe('levaETrazRepository (Story 2.12)', () => {
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

  describe('Modo Remoto (Supabase, Sequences e Concorrência Otimista)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    it('carregarDeslocamentos: busca deslocamentos ordenados por data decrescente', async () => {
      const mockDeslocsDb = [
        {
          id: 'desloc-1',
          codigo: 'LOG-0001',
          tipo_servico: 'busca_veiculo',
          status: 'agendado',
          cliente_nome: 'Roberto Dias',
          veiculo_placa: 'ABC1234',
          motorista_principal_nome: 'Gabriel Mecânico',
          created_at: '2026-09-26T10:00:00Z',
          updated_at: '2026-09-26T10:00:00Z',
        },
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: mockDeslocsDb, error: null })
      const selectMock = vi.fn().mockReturnValue({ order: orderMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await carregarDeslocamentos()
      expect(fromMock).toHaveBeenCalledWith('leva_e_traz_deslocamentos')
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(res).toHaveLength(1)
      expect(res[0]).toMatchObject({
        id: 'desloc-1',
        codigo: 'LOG-0001',
        tipoServico: 'busca_veiculo',
        clienteNome: 'Roberto Dias',
      })
    })

    it('fail-closed: lança erro se Supabase falhar', async () => {
      const orderMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Network connection lost', code: 'P0001' },
      })
      const selectMock = vi.fn().mockReturnValue({ order: orderMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      await expect(carregarDeslocamentos()).rejects.toThrow()
    })

    it('criarNovoDeslocamento: persiste dados sem enviar id/codigo (gerados pelo banco)', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: {
          id: 'desloc-gerado-db',
          codigo: 'LOG-0005',
          tipo_servico: 'entrega_veiculo',
          status: 'agendado',
          cliente_nome: 'Fernanda Lima',
          data: '26/09/2026',
          created_at: '2026-09-26T10:00:00Z',
          updated_at: '2026-09-26T10:00:00Z',
        },
        error: null,
      })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      let payloadEnviado = null
      const insertMock = vi.fn().mockImplementation((payload) => {
        payloadEnviado = payload
        return { select: selectMock }
      })
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const dados = {
        tipoServico: 'entrega_veiculo',
        clienteNome: 'Fernanda Lima',
        veiculoPlaca: 'BRA2E19',
      }

      const res = await criarNovoDeslocamento(dados)
      expect(insertMock).toHaveBeenCalled()
      expect(payloadEnviado.id).toBeUndefined()
      expect(payloadEnviado.codigo).toBeUndefined()
      expect(res.id).toBe('desloc-gerado-db')
      expect(res.codigo).toBe('LOG-0005')
    })

    it('atualizarDeslocamento: lança CONFLITO_EDICAO se zero linhas forem afetadas', async () => {
      const selectMock = vi.fn().mockResolvedValue({ data: [], error: null })
      const eqUpdatedMock = vi.fn().mockReturnValue({ select: selectMock })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqUpdatedMock, select: selectMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      const fromMock = vi.fn().mockReturnValue({ update: updateMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      await expect(
        atualizarDeslocamento('desloc-1', { status: 'concluido' }, '2026-09-26T00:00:00Z')
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.CONFLITO_EDICAO,
      })
    })

    it('iniciarDeslocamento: muda status para em_deslocamento e atualiza veículo de apoio', async () => {
      // Mock obterDeslocamentoPorId
      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: {
          id: 'desloc-10',
          codigo: 'LOG-0010',
          status: 'agendado',
          veiculo_apoio_id: 'apoio-1',
          motorista_principal_nome: 'Carlos Mecânico',
          updated_at: '2026-09-26T10:00:00Z',
        },
        error: null,
      })
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock }),
      })

      // Mock update deslocamento
      const selectUpdateMock = vi.fn().mockResolvedValue({
        data: [{
          id: 'desloc-10',
          codigo: 'LOG-0010',
          status: 'em_deslocamento',
          veiculo_apoio_id: 'apoio-1',
          motorista_principal_nome: 'Carlos Mecânico',
          updated_at: '2026-09-26T10:05:00Z',
        }],
        error: null,
      })
      const eqUpdateMock = vi.fn().mockReturnValue({ select: selectUpdateMock, eq: vi.fn().mockReturnValue({ select: selectUpdateMock }) })
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateMock })

      // Mock update apoio
      const selectApoioMock = vi.fn().mockResolvedValue({
        data: [{ id: 'apoio-1', status: 'em_rota', em_uso_por: 'Carlos Mecânico' }],
        error: null,
      })
      const eqApoioMock = vi.fn().mockReturnValue({ select: selectApoioMock, eq: vi.fn().mockReturnValue({ select: selectApoioMock }) })
      const updateApoioMock = vi.fn().mockReturnValue({ eq: eqApoioMock })

      const fromMock = vi.fn().mockImplementation((table) => {
        if (table === 'leva_e_traz_deslocamentos') {
          return { select: selectMock, update: updateMock }
        }
        if (table === 'frota_apoio') {
          return { update: updateApoioMock }
        }
        return {}
      })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await iniciarDeslocamento('desloc-10', '2026-09-26T10:00:00Z')
      expect(res.status).toBe('em_deslocamento')
      expect(updateApoioMock).toHaveBeenCalled()
    })

    it('finalizarDeslocamento: muda status para concluido e libera veículo de apoio', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: {
          id: 'desloc-10',
          codigo: 'LOG-0010',
          status: 'em_deslocamento',
          km_inicial: '10000',
          veiculo_apoio_id: 'apoio-1',
          updated_at: '2026-09-26T10:05:00Z',
        },
        error: null,
      })
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock }),
      })

      const selectUpdateMock = vi.fn().mockResolvedValue({
        data: [{
          id: 'desloc-10',
          codigo: 'LOG-0010',
          status: 'concluido',
          km_realizado: '50',
          updated_at: '2026-09-26T11:00:00Z',
        }],
        error: null,
      })
      const eqUpdateMock = vi.fn().mockReturnValue({ select: selectUpdateMock, eq: vi.fn().mockReturnValue({ select: selectUpdateMock }) })
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateMock })

      const selectApoioMock = vi.fn().mockResolvedValue({
        data: [{ id: 'apoio-1', status: 'disponivel', km_atual: '10050' }],
        error: null,
      })
      const eqApoioMock = vi.fn().mockReturnValue({ select: selectApoioMock, eq: vi.fn().mockReturnValue({ select: selectApoioMock }) })
      const updateApoioMock = vi.fn().mockReturnValue({ eq: eqApoioMock })

      const fromMock = vi.fn().mockImplementation((table) => {
        if (table === 'leva_e_traz_deslocamentos') {
          return { select: selectMock, update: updateMock }
        }
        if (table === 'frota_apoio') {
          return { update: updateApoioMock }
        }
        return {}
      })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await finalizarDeslocamento('desloc-10', { kmFinal: '10050' }, '2026-09-26T10:05:00Z')
      expect(res.status).toBe('concluido')
      expect(updateApoioMock).toHaveBeenCalled()
    })

    it('criarVeiculoApoio: cria registro de frota com sequence no banco', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: {
          id: 'apoio-novo-db',
          codigo: 'APOIO-03',
          modelo: 'Fiorino 1.4',
          placa: 'FIO1414',
          status: 'disponivel',
        },
        error: null,
      })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      let payloadEnviado = null
      const insertMock = vi.fn().mockImplementation((payload) => {
        payloadEnviado = payload
        return { select: selectMock }
      })
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await criarVeiculoApoio({ modelo: 'Fiorino 1.4', placa: 'FIO1414' })
      expect(insertMock).toHaveBeenCalled()
      expect(payloadEnviado.codigo).toBeUndefined() // ID e código gerados pelo banco!
      expect(res.id).toBe('apoio-novo-db')
      expect(res.codigo).toBe('APOIO-03')
    })
  })

  describe('Modo Local (Offline / Testes)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('local')
    })

    it('executa ciclo de vida completo de deslocamento e veículo de apoio localmente', async () => {
      // 1. Cria veículo de apoio
      const apoio = await criarVeiculoApoio({
        modelo: 'Mobi 1.0',
        placa: 'MOB1122',
      })
      expect(apoio.id).toBeTruthy()
      expect(apoio.status).toBe('disponivel')

      // 2. Cria deslocamento
      const desloc = await criarNovoDeslocamento({
        tipoServico: 'busca_veiculo',
        clienteNome: 'Mariana Souza',
        veiculoPlaca: 'MAR1234',
        veiculoApoioId: apoio.id,
      })
      expect(desloc.id).toBeTruthy()
      expect(desloc.status).toBe('agendado')

      // 3. Inicia deslocamento
      const iniciado = await iniciarDeslocamento(desloc.id)
      expect(iniciado.status).toBe('em_deslocamento')

      // 4. Finaliza deslocamento
      const finalizado = await finalizarDeslocamento(desloc.id, {
        kmFinal: '25',
      })
      expect(finalizado.status).toBe('concluido')

      // 5. Exclui deslocamento e veículo de apoio
      await excluirDeslocamento(desloc.id)
      const listaPosExclusao = await carregarDeslocamentos()
      expect(listaPosExclusao.some((d) => d.id === desloc.id)).toBe(false)

      await excluirVeiculoApoio(apoio.id)
      const apoiosPosExclusao = await carregarVeiculosDeApoio()
      expect(apoiosPosExclusao.some((a) => a.id === apoio.id)).toBe(false)
    })
  })
})
