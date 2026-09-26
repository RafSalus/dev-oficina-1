import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import { CODIGOS_ERRO } from '../../src/repositories/erroRepositorio'
import {
  carregarCompras,
  obterCompraPorId,
  salvarCompra,
  excluirCompra,
  receberCompraNoEstoque,
  buscarCotacoes,
  obterCotacaoPorId,
  salvarCotacaoAutodepecas,
  excluirCotacaoAutodepecas,
  buscarCotacaoPorOS,
  aprovarCotacaoEGerarPedidoCompra,
} from '../../src/repositories/comprasRepository'
import {
  mapearStatusPedidoParaDb,
  mapearStatusPedidoParaDominio,
  mapearStatusCotacaoParaDb,
  mapearStatusCotacaoParaDominio,
} from '../../src/repositories/mapeadores/compras'

describe('comprasRepository (Story 2.9)', () => {
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

  describe('Mapeadores de Status (AC3)', () => {
    it('mapeia status de cotação CANCELADA para cancelada e vice-versa', () => {
      expect(mapearStatusCotacaoParaDb('CANCELADA')).toBe('cancelada')
      expect(mapearStatusCotacaoParaDominio('cancelada')).toBe('CANCELADA')
      expect(mapearStatusCotacaoParaDb('EM_COTACAO')).toBe('em_cotacao')
      expect(mapearStatusCotacaoParaDominio('em_cotacao')).toBe('EM_COTACAO')
      expect(mapearStatusCotacaoParaDb('RESPONDIDA')).toBe('respondida')
      expect(mapearStatusCotacaoParaDominio('respondida')).toBe('RESPONDIDA')
      expect(mapearStatusCotacaoParaDb('APROVADA')).toBe('aprovada')
      expect(mapearStatusCotacaoParaDominio('aprovada')).toBe('APROVADA')
    })

    it('mapeia status de pedido entre banco e domínio', () => {
      expect(mapearStatusPedidoParaDb('RECEBIDO')).toBe('entregue')
      expect(mapearStatusPedidoParaDominio('entregue')).toBe('RECEBIDO')
      expect(mapearStatusPedidoParaDb('AGUARDANDO_ENTREGA')).toBe('aprovado')
      expect(mapearStatusPedidoParaDominio('aprovado')).toBe('AGUARDANDO_ENTREGA')
      expect(mapearStatusPedidoParaDb('CANCELADO')).toBe('cancelado')
      expect(mapearStatusPedidoParaDominio('cancelado')).toBe('CANCELADO')
      expect(mapearStatusPedidoParaDb('RASCUNHO')).toBe('pendente')
      expect(mapearStatusPedidoParaDominio('pendente')).toBe('RASCUNHO')
      expect(mapearStatusPedidoParaDominio('pendente', { statusOriginal: 'EM_COTACAO' })).toBe('EM_COTACAO')
    })
  })

  describe('Modo Remoto (Supabase & Fail-Closed)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    it('carregarCompras: consulta compras_pedidos e mapeia registros', async () => {
      const mockPedidosDb = [
        {
          id: 'ped-uuid-1',
          numero_pedido: 'PED-2026-001',
          fornecedor_id: 'forn-1',
          status: 'aprovado',
          itens: [{ codigo: 'FLT-01', nome: 'Filtro', quantidade: 2, precoCusto: 50 }],
          valor_total: '100.00',
          data_previsao_entrega: '2026-09-28',
          ordem_servico_ref: 'OS-100',
          metadata: {
            fornecedorNome: 'Auto Peças Distribuidora',
            clienteNome: 'João Silva',
            veiculoPlaca: 'ABC-1234',
          },
          created_at: '2026-09-26T10:00:00Z',
          updated_at: '2026-09-26T10:00:00Z',
        },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockPedidosDb, error: null })
      const mockSelect = vi.fn(() => ({ order: mockOrder }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const resultado = await carregarCompras()
      expect(mockClient.from).toHaveBeenCalledWith('compras_pedidos')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(resultado.length).toBe(1)
      expect(resultado[0].numeroPedido).toBe('PED-2026-001')
      expect(resultado[0].status).toBe('AGUARDANDO_ENTREGA')
      expect(resultado[0].fornecedorNome).toBe('Auto Peças Distribuidora')
      expect(resultado[0].valorTotal).toBe(100)
    })

    it('carregarCompras: falha fechada (fail-closed) em caso de erro remoto', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '42501', message: 'permission denied for table compras_pedidos' },
            }),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(carregarCompras()).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.SEM_PERMISSAO,
      })
    })

    it('obterCompraPorId: busca por id ou numero_pedido', async () => {
      const mockPedidoDb = {
        id: 'ped-uuid-1',
        numero_pedido: 'PED-2026-001',
        status: 'entregue',
        valor_total: '150.00',
        metadata: { fornecedorNome: 'Distribuidora X' },
      }

      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockPedidoDb, error: null })
      const mockOr = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
      const mockSelect = vi.fn(() => ({ or: mockOr }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const pedido = await obterCompraPorId('PED-2026-001')
      expect(mockOr).toHaveBeenCalledWith('id.eq.PED-2026-001,numero_pedido.eq.PED-2026-001')
      expect(pedido.status).toBe('RECEBIDO')
      expect(pedido.numeroPedido).toBe('PED-2026-001')
    })

    it('salvarCompra: insere novo pedido e retorna mapeado', async () => {
      const novoPedido = {
        fornecedorId: 'forn-1',
        status: 'AGUARDANDO_ENTREGA',
        valorTotal: 250,
        previsaoEntrega: '2026-09-30',
        itens: [{ nome: 'Pastilha de Freio', quantidade: 1, precoCusto: 250 }],
      }

      const mockInserted = {
        id: 'ped-uuid-novo',
        numero_pedido: 'PED-2026-002',
        fornecedor_id: 'forn-1',
        status: 'aprovado',
        itens: novoPedido.itens,
        valor_total: '250.00',
        data_previsao_entrega: '2026-09-30',
        metadata: { fornecedorNome: '', statusOriginal: 'AGUARDANDO_ENTREGA' },
        created_at: '2026-09-26T12:00:00Z',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockInserted, error: null })
      const mockSelect = vi.fn(() => ({ single: mockSingle }))
      const mockInsert = vi.fn(() => ({ select: mockSelect }))
      const mockClient = {
        from: vi.fn(() => ({ insert: mockInsert })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const salvo = await salvarCompra(novoPedido)
      expect(salvo.id).toBe('ped-uuid-novo')
      expect(salvo.numeroPedido).toBe('PED-2026-002')
      expect(salvo.status).toBe('AGUARDANDO_ENTREGA')
    })

    it('excluirCompra: remove pedido de compras_pedidos', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn(() => ({ eq: mockEq }))
      const mockClient = {
        from: vi.fn(() => ({ delete: mockDelete })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const ok = await excluirCompra('ped-uuid-1')
      expect(ok).toBe(true)
      expect(mockEq).toHaveBeenCalledWith('id', 'ped-uuid-1')
    })

    it('receberCompraNoEstoque: delega para RPC receber_pedido_compra', async () => {
      const mockPedidoRecebido = {
        id: 'ped-1',
        numero_pedido: 'PED-2026-001',
        status: 'entregue',
        valor_total: '300.00',
        metadata: {
          dataRecebimento: '2026-09-26T15:00:00Z',
          documentoEntrada: 'NF-999',
        },
      }

      const mockRpc = vi.fn().mockResolvedValue({ data: mockPedidoRecebido, error: null })
      const mockClient = { rpc: mockRpc }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const recebido = await receberCompraNoEstoque('ped-1', { documento: 'NF-999' })
      expect(mockRpc).toHaveBeenCalledWith('receber_pedido_compra', {
        p_pedido_id: 'ped-1',
        p_documento: 'NF-999',
      })
      expect(recebido.status).toBe('RECEBIDO')
    })

    it('buscarCotacoes: busca cotações ativas com ordenação', async () => {
      const mockCotacoesDb = [
        {
          id: 'cot-1',
          numero_cotacao: 'COT-2026-9041',
          ordem_servico_ref: 'OS-100',
          status: 'em_cotacao',
          itens: [{ id: 'it-1', nome: 'Amortecedor' }],
          propostas_fornecedores: [{ id: 'forn-1', nome: 'Auto Peças Z' }],
          created_at: '2026-09-26T10:00:00Z',
        },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockCotacoesDb, error: null })
      const mockSelect = vi.fn(() => ({ order: mockOrder }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const cotacoes = await buscarCotacoes()
      expect(mockClient.from).toHaveBeenCalledWith('compras_cotacoes')
      expect(cotacoes.length).toBe(1)
      expect(cotacoes[0].numeroCotacao).toBe('COT-2026-9041')
      expect(cotacoes[0].status).toBe('EM_COTACAO')
      expect(cotacoes[0].numeroOS).toBe('OS-100')
    })

    it('buscarCotacaoPorOS: localiza cotação vinculada à OS ignorando canceladas', async () => {
      const mockCotacao = {
        id: 'cot-1',
        numero_cotacao: 'COT-2026-9041',
        ordem_servico_ref: 'OS-100',
        status: 'em_cotacao',
      }

      const mockLimit = vi.fn().mockResolvedValue({ data: [mockCotacao], error: null })
      const mockOrder = vi.fn(() => ({ limit: mockLimit }))
      const mockNeq = vi.fn(() => ({ order: mockOrder }))
      const mockEq = vi.fn(() => ({ neq: mockNeq }))
      const mockSelect = vi.fn(() => ({ eq: mockEq }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const cotacao = await buscarCotacaoPorOS('OS-100')
      expect(mockEq).toHaveBeenCalledWith('ordem_servico_ref', 'OS-100')
      expect(mockNeq).toHaveBeenCalledWith('status', 'cancelada')
      expect(cotacao.numeroCotacao).toBe('COT-2026-9041')
    })

    it('aprovarCotacaoEGerarPedidoCompra: delega para RPC aprovar_cotacao_gerar_pedido', async () => {
      const mockRpcResponse = {
        cotacao: {
          id: 'cot-1',
          numero_cotacao: 'COT-2026-9041',
          status: 'aprovada',
        },
        pedido: {
          id: 'ped-gerado-1',
          numero_pedido: 'PED-2026-003',
          status: 'aprovado',
          fornecedor_id: 'forn-1',
          valor_total: '450.00',
        },
      }

      const mockRpc = vi.fn().mockResolvedValue({ data: mockRpcResponse, error: null })
      const mockClient = { rpc: mockRpc }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const res = await aprovarCotacaoEGerarPedidoCompra('cot-1', 'forn-1')
      expect(mockRpc).toHaveBeenCalledWith('aprovar_cotacao_gerar_pedido', {
        p_cotacao_id: 'cot-1',
        p_fornecedor_id: 'forn-1',
      })
      expect(res.cotacao.status).toBe('APROVADA')
      expect(res.pedido.status).toBe('AGUARDANDO_ENTREGA')
      expect(res.pedido.numeroPedido).toBe('PED-2026-003')
    })
  })

  describe('Modo Local (Fallback e Isolamento)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('local')
    })

    it('executa CRUD de compras localmente com sucesso', async () => {
      const comprasIniciais = await carregarCompras()
      expect(Array.isArray(comprasIniciais)).toBe(true)

      const salvo = await salvarCompra({
        fornecedorId: 'terc-1',
        fornecedorNome: 'Auto Peças Local',
        status: 'RASCUNHO',
        valorTotal: 100,
        itens: [{ nome: 'Bucha', quantidade: 2, precoCusto: 50 }],
      })

      expect(salvo.id).toBeTruthy()
      expect(salvo.numeroPedido).toMatch(/^PED-\d{4}-\d+$/)

      const obtido = await obterCompraPorId(salvo.id)
      expect(obtido).toBeTruthy()
      expect(obtido.fornecedorNome).toBe('Auto Peças Local')

      await excluirCompra(salvo.id)
      const aposExclusao = await obterCompraPorId(salvo.id)
      expect(aposExclusao).toBeNull()
    })

    it('executa CRUD de cotações localmente com sucesso', async () => {
      const cotacoesIniciais = await buscarCotacoes()
      expect(Array.isArray(cotacoesIniciais)).toBe(true)

      const salva = await salvarCotacaoAutodepecas({
        clienteNome: 'Maria Santos',
        veiculoPlaca: 'XYZ-9876',
        status: 'EM_COTACAO',
        itens: [{ nome: 'Correia Dentada', quantidade: 1 }],
      })

      expect(salva.id).toBeTruthy()
      const obtida = await obterCotacaoPorId(salva.id)
      expect(obtida).toBeTruthy()
      expect(obtida.clienteNome).toBe('Maria Santos')

      await excluirCotacaoAutodepecas(salva.id)
      const aposExclusao = await obterCotacaoPorId(salva.id)
      expect(aposExclusao).toBeNull()
    })
  })
})
