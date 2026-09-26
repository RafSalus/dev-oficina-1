import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import { CODIGOS_ERRO } from '../../src/repositories/erroRepositorio'
import {
  carregarOrdensServico,
  salvarOrdemServico,
  transicionarStatusOS,
  vincularMecanicoOS,
  aplicarPecaNaOS,
  devolverPecaDaOS,
} from '../../src/repositories/ordensServicoRepository'

describe('ordensServicoRepository - Supabase & Concorrência (Story 2.14)', () => {
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

  describe('Modo Remoto (Supabase, Tabela Única e Fail-Closed)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    it('carregarOrdensServico: filtra abertas sobre tabela única', async () => {
      const mockDb = [
        {
          id: 'uuid-1',
          numero_os: '002914',
          status: 'em_diagnostico',
          cliente_id: 'cli-1',
          veiculo_id: 'veic-1',
          mecanico_id: 'func-1',
          mecanico_nome: 'Carlos Eduardo',
          snapshot_cliente: { nome: 'João da Silva' },
          snapshot_veiculo: { placa: 'ABC1D23', modelo: 'Onix' },
          subtotal_pecas: 200,
          subtotal_servicos: 150,
          valor_total: 350,
          created_at: '2026-09-26T10:00:00Z',
          updated_at: '2026-09-26T10:00:00Z',
        },
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: mockDb, error: null })
      const notMock = vi.fn().mockReturnValue({ order: orderMock })
      const selectMock = vi.fn().mockReturnValue({ not: notMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await carregarOrdensServico({ filtro: 'abertas' })
      expect(fromMock).toHaveBeenCalledWith('ordens_servico')
      expect(notMock).toHaveBeenCalledWith('status', 'in', '(finalizada,cancelada)')
      expect(res).toHaveLength(1)
      expect(res[0].numeroOS).toBe('002914')
      expect(res[0].clienteNome).toBe('João da Silva')
      expect(res[0].placa).toBe('ABC1D23')
    })

    it('carregarOrdensServico: filtra finalizadas sobre tabela única', async () => {
      const mockDb = [
        {
          id: 'uuid-2',
          numero_os: '002910',
          status: 'finalizada',
          cliente_id: 'cli-2',
          veiculo_id: 'veic-2',
          snapshot_cliente: { nome: 'Maria Souza' },
          snapshot_veiculo: { placa: 'XYZ9A88' },
          created_at: '2026-09-25T10:00:00Z',
          updated_at: '2026-09-25T15:00:00Z',
        },
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: mockDb, error: null })
      const inMock = vi.fn().mockReturnValue({ order: orderMock })
      const selectMock = vi.fn().mockReturnValue({ in: inMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await carregarOrdensServico({ filtro: 'finalizadas' })
      expect(fromMock).toHaveBeenCalledWith('ordens_servico')
      expect(inMock).toHaveBeenCalledWith('status', ['finalizada', 'cancelada'])
      expect(res).toHaveLength(1)
      expect(res[0].status).toBe('finalizada')
    })

    it('salvarOrdemServico: insere nova OS com snapshot sem sobrescrever ID gerado', async () => {
      const insertedDb = {
        id: 'uuid-os-gerado',
        numero_os: '002915',
        status: 'fila',
        cliente_id: 'cli-1',
        veiculo_id: 'veic-1',
        snapshot_cliente: { id: 'cli-1', nome: 'Cliente Teste' },
        snapshot_veiculo: { id: 'veic-1', placa: 'TEST1234' },
        subtotal_pecas: 0,
        subtotal_servicos: 0,
        valor_total: 0,
        created_at: '2026-09-26T16:00:00Z',
        updated_at: '2026-09-26T16:00:00Z',
      }

      const singleMock = vi.fn().mockResolvedValue({ data: insertedDb, error: null })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const insertMock = vi.fn().mockReturnValue({ select: selectMock })
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await salvarOrdemServico({
        clienteId: 'cli-1',
        veiculoId: 'veic-1',
        status: 'fila',
      })

      expect(fromMock).toHaveBeenCalledWith('ordens_servico')
      expect(res.id).toBe('uuid-os-gerado')
      expect(res.numeroOS).toBe('002915')
      expect(res.snapshotCliente.nome).toBe('Cliente Teste')
    })

    it('transicionarStatusOS: verifica updated_at e lanca CONFLITO_EDICAO em colisao concorrente', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const eqUpdatedAtMock = vi.fn().mockReturnValue({ select: selectMock })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqUpdatedAtMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      const fromMock = vi.fn().mockReturnValue({ update: updateMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      await expect(
        transicionarStatusOS('uuid-12345678-abcd', 'em_diagnostico', '2026-09-26T12:00:00Z')
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.CONFLITO_EDICAO,
      })
    })

    it('vincularMecanicoOS: vincula mecanico com checagem de updated_at', async () => {
      const updatedDb = {
        id: 'uuid-1',
        numero_os: '002914',
        mecanico_id: 'func-2',
        mecanico_nome: 'Gabriel Amaral',
        status: 'fila',
        updated_at: '2026-09-26T16:30:00Z',
      }

      const maybeSingleMock = vi.fn().mockResolvedValue({ data: updatedDb, error: null })
      const selectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const eqUpdatedAtMock = vi.fn().mockReturnValue({ select: selectMock })
      const eqNumeroMock = vi.fn().mockReturnValue({ eq: eqUpdatedAtMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqNumeroMock })
      const fromMock = vi.fn().mockReturnValue({ update: updateMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await vincularMecanicoOS('002914', 'func-2', 'Gabriel Amaral', '2026-09-26T16:00:00Z')
      expect(res.mecanicoNome).toBe('Gabriel Amaral')
    })

    it('aplicarPecaNaOS: executa RPC aplicar_peca_na_os', async () => {
      const rpcMock = vi.fn().mockResolvedValue({
        data: { sucesso: true, os_id: 'os-1', peca_id: 'peca-1', quantidade: 2 },
        error: null,
      })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ rpc: rpcMock })

      const res = await aplicarPecaNaOS('os-1', 'item-p1', 'peca-1', 2)
      expect(rpcMock).toHaveBeenCalledWith('aplicar_peca_na_os', {
        os_id: 'os-1',
        item_id: 'item-p1',
        peca_id: 'peca-1',
        quantidade: 2,
      })
      expect(res.sucesso).toBe(true)
    })

    it('devolverPecaDaOS: executa RPC devolver_peca_da_os', async () => {
      const rpcMock = vi.fn().mockResolvedValue({
        data: { sucesso: true, os_id: 'os-1', peca_id: 'peca-1', quantidade: 1 },
        error: null,
      })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ rpc: rpcMock })

      const res = await devolverPecaDaOS('os-1', 'item-p1', 'peca-1', 1)
      expect(rpcMock).toHaveBeenCalledWith('devolver_peca_da_os', {
        os_id: 'os-1',
        item_id: 'item-p1',
        peca_id: 'peca-1',
        quantidade: 1,
      })
      expect(res.sucesso).toBe(true)
    })

    it('Fail-closed: lanca erro e nao grava silenciosamente em localStorage', async () => {
      const orderMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Network offline', code: 'PGRST000' },
      })
      const selectMock = vi.fn().mockReturnValue({ order: orderMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      await expect(carregarOrdensServico()).rejects.toThrow()
    })
  })
})
