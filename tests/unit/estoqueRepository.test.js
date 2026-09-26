import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import {
  CODIGOS_ERRO,
} from '../../src/repositories/erroRepositorio'
import {
  carregarMovimentacoes,
  registrarMovimentacao,
  obterKardexPeca,
  obterSaldoPeca,
} from '../../src/repositories/estoqueRepository'
import { salvarPeca } from '../../src/repositories/pecasRepository'

describe('estoqueRepository (Story 2.8)', () => {
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

  describe('Modo Remoto (Supabase RPC & Fail-Closed)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    it('carregarMovimentacoes: busca lista completa com embed de pecas', async () => {
      const mockMovs = [
        {
          id: 'mov-1',
          peca_id: 'peca-1',
          tipo: 'entrada',
          quantidade: 10,
          motivo: 'Compra inicial',
          documento_ref: 'NF-100',
          usuario: 'Admin',
          created_at: '2026-09-26T12:00:00Z',
          pecas: {
            codigo: 'FLT-01',
            nome: 'Filtro de Óleo',
          },
        },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockMovs, error: null })
      const mockSelect = vi.fn(() => ({ order: mockOrder }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const lista = await carregarMovimentacoes()
      expect(mockSelect).toHaveBeenCalledWith('*, pecas(codigo, nome)')
      expect(lista.length).toBe(1)
      expect(lista[0].id).toBe('mov-1')
      expect(lista[0].pecaCodigo).toBe('FLT-01')
      expect(lista[0].quantidade).toBe(10)
    })

    it('registrarMovimentacao: delega para RPC transacional registrar_movimentacao_estoque', async () => {
      const mockRpcResponse = {
        id: 'mov-gerada-rpc',
        peca_id: 'peca-123',
        tipo: 'entrada',
        quantidade: 5,
        motivo: 'Recebimento fornecedor',
        documento_ref: 'NF-555',
        usuario: 'Almoxarife',
        created_at: '2026-09-26T12:30:00Z',
      }

      const mockRpc = vi.fn().mockResolvedValue({ data: mockRpcResponse, error: null })
      const mockClient = {
        rpc: mockRpc,
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const res = await registrarMovimentacao({
        pecaId: 'peca-123',
        tipo: 'entrada',
        quantidade: 5,
        motivo: 'Recebimento fornecedor',
        documentoRef: 'NF-555',
        usuario: 'Almoxarife',
      })

      expect(mockRpc).toHaveBeenCalledWith('registrar_movimentacao_estoque', {
        p_peca_id: 'peca-123',
        p_tipo: 'entrada',
        p_quantidade: 5,
        p_motivo: 'Recebimento fornecedor',
        p_documento_ref: 'NF-555',
        p_usuario: 'Almoxarife',
        p_ordem_servico_id: null,
        p_os_item_id: null,
      })

      expect(res.id).toBe('mov-gerada-rpc')
      expect(res.quantidade).toBe(5)
    })

    it('registrarMovimentacao: rejeita segunda baixa para mesma OS e item (índice único)', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: '23505',
          message: 'duplicate key value violates unique constraint "uq_estoque_movimentacoes_os_item_saida"',
        },
      })
      const mockClient = {
        rpc: mockRpc,
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(
        registrarMovimentacao({
          pecaId: 'peca-123',
          tipo: 'saida',
          quantidade: 1,
          ordemServicoId: 'os-10',
          osItemId: 'item-99',
        })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
        message: 'Peça já foi baixada anteriormente para este item de OS.',
      })
    })

    it('obterKardexPeca: filtra movimentações da peça', async () => {
      const mockMovs = [
        {
          id: 'mov-peca-1',
          peca_id: 'peca-abc',
          tipo: 'saida',
          quantidade: 2,
          created_at: '2026-09-26T12:45:00Z',
        },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockMovs, error: null })
      const mockEq = vi.fn(() => ({ order: mockOrder }))
      const mockSelect = vi.fn(() => ({ eq: mockEq }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const kardex = await obterKardexPeca('peca-abc')
      expect(mockEq).toHaveBeenCalledWith('peca_id', 'peca-abc')
      expect(kardex.length).toBe(1)
      expect(kardex[0].quantidade).toBe(2)
    })

    it('fail-closed: falha na chamada RPC lança exceção sem fallback silencioso', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Connection refused', code: 'PGRST000' },
      })
      const mockClient = {
        rpc: mockRpc,
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(
        registrarMovimentacao({
          pecaId: 'peca-abc',
          tipo: 'entrada',
          quantidade: 10,
        })
      ).rejects.toThrow()
    })
  })

  describe('Modo Local (Offline / Testes)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('local')
    })

    it('registra entrada e atualiza saldo físico da peça', async () => {
      const peca = await salvarPeca({
        codigo: 'LOC-01',
        nome: 'Filtro Ar',
        estoqueAtual: 5,
      })

      const mov = await registrarMovimentacao({
        pecaId: peca.id,
        tipo: 'entrada',
        quantidade: 15,
        motivo: 'Reposição',
      })

      expect(mov.id).toBeDefined()
      expect(mov.saldoAnterior).toBe(5)
      expect(mov.saldoNovo).toBe(20)

      const saldoFinal = await obterSaldoPeca(peca.id)
      expect(saldoFinal).toBe(20)
    })

    it('registra saída respeitando piso zero', async () => {
      const peca = await salvarPeca({
        codigo: 'LOC-02',
        nome: 'Pastilha',
        estoqueAtual: 3,
      })

      const mov = await registrarMovimentacao({
        pecaId: peca.id,
        tipo: 'saida',
        quantidade: 10,
      })

      expect(mov.saldoNovo).toBe(0)
      const saldoFinal = await obterSaldoPeca(peca.id)
      expect(saldoFinal).toBe(0)
    })

    it('rejeita saída duplicada para mesmo ordemServicoId e osItemId localmente', async () => {
      const peca = await salvarPeca({
        codigo: 'LOC-03',
        nome: 'Disco de Freio',
        estoqueAtual: 10,
      })

      await registrarMovimentacao({
        pecaId: peca.id,
        tipo: 'saida',
        quantidade: 1,
        ordemServicoId: 'os-teste-1',
        osItemId: 'item-disco',
      })

      await expect(
        registrarMovimentacao({
          pecaId: peca.id,
          tipo: 'saida',
          quantidade: 1,
          ordemServicoId: 'os-teste-1',
          osItemId: 'item-disco',
        })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
      })
    })

    it('obterKardexPeca filtra as movimentações no modo local', async () => {
      const p1 = await salvarPeca({ codigo: 'LOC-P1', nome: 'Peça 1', estoqueAtual: 2 })
      const p2 = await salvarPeca({ codigo: 'LOC-P2', nome: 'Peça 2', estoqueAtual: 2 })

      await registrarMovimentacao({ pecaId: p1.id, tipo: 'entrada', quantidade: 5 })
      await registrarMovimentacao({ pecaId: p2.id, tipo: 'entrada', quantidade: 8 })

      const kardexP1 = await obterKardexPeca(p1.id)
      expect(kardexP1.length).toBe(1)
      expect(kardexP1[0].pecaId).toBe(p1.id)
      expect(kardexP1[0].quantidade).toBe(5)
    })
  })
})
