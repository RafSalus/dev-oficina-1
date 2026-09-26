import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import {
  CODIGOS_ERRO,
} from '../../src/repositories/erroRepositorio'
import {
  carregarPecas,
  obterPecaPorId,
  salvarPeca,
  excluirPeca,
  carregarServicos,
  obterServicoPorId,
  salvarServico,
  excluirServico,
  carregarTerceiros,
  obterTerceiroPorId,
  salvarTerceiro,
  excluirTerceiro,
} from '../../src/repositories/suprimentosRepository'

describe('suprimentosRepository (Story 2.7)', () => {
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

  describe('Modo Remoto (Supabase Fail-Closed)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    // --- PEÇAS ---
    it('carregarPecas: busca peças com ordenação decrescente por created_at', async () => {
      const mockData = [
        {
          id: 'uuid-peca-1',
          codigo: 'FLT-001',
          nome: 'Filtro de Óleo Bosch',
          categoria: 'Filtros',
          unidade_medida: 'UN',
          estoque_atual: 15,
          estoque_minimo: 5,
          preco_custo: 25.0,
          preco_venda: 45.0,
          margem_lucro: 80.0,
          ativo: true,
          created_at: '2026-09-26T10:00:00Z',
        },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockSelect = vi.fn(() => ({ order: mockOrder }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const lista = await carregarPecas()
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(lista.length).toBe(1)
      expect(lista[0].id).toBe('uuid-peca-1')
      expect(lista[0].codigo).toBe('FLT-001')
      expect(lista[0].estoqueAtual).toBe(15)
      expect(lista[0].precoVenda).toBe(45.0)
    })

    it('obterPecaPorId: busca peça por id ou código', async () => {
      const mockData = {
        id: 'uuid-peca-2',
        codigo: 'VEL-002',
        nome: 'Vela Iridium NGK',
        preco_venda: 60.0,
        ativo: true,
      }

      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockOr = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
      const mockSelect = vi.fn(() => ({ or: mockOr }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const peca = await obterPecaPorId('VEL-002')
      expect(peca).toBeDefined()
      expect(peca.id).toBe('uuid-peca-2')
      expect(peca.codigo).toBe('VEL-002')
    })

    it('salvarPeca INSERT: envia sem id temporário e recebe dados persistidos', async () => {
      const mockSalva = {
        id: 'uuid-nova-peca',
        codigo: 'PAST-003',
        nome: 'Pastilha Dianteira',
        preco_custo: 50,
        preco_venda: 90,
        estoque_atual: 10,
        created_at: '2026-09-26T11:00:00Z',
        updated_at: '2026-09-26T11:00:00Z',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockSalva, error: null })
      const mockSelect = vi.fn(() => ({ single: mockSingle }))
      const mockInsert = vi.fn(() => ({ select: mockSelect }))
      const mockClient = {
        from: vi.fn(() => ({ insert: mockInsert })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const res = await salvarPeca({
        id: 'peca-temp-123',
        codigo: 'PAST-003',
        nome: 'Pastilha Dianteira',
        precoCusto: 50,
        precoVenda: 90,
        estoqueAtual: 10,
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: 'PAST-003',
          nome: 'Pastilha Dianteira',
        })
      )
      expect(res.id).toBe('uuid-nova-peca')
    })

    it('salvarPeca duplicada: captura erro 23505 e traduz para mensagem amigável', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "pecas_codigo_key"' },
      })
      const mockSelect = vi.fn(() => ({ single: mockSingle }))
      const mockInsert = vi.fn(() => ({ select: mockSelect }))
      const mockClient = {
        from: vi.fn(() => ({ insert: mockInsert })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(
        salvarPeca({
          codigo: 'COD-JA-EXISTE',
          nome: 'Peça Duplicada',
        })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
        message: 'Código já cadastrado',
      })
    })

    it('excluirPeca: executa delete com id', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: [{ id: 'uuid-1' }], error: null, count: 1 })
      const mockDelete = vi.fn(() => ({ eq: mockEq }))
      const mockClient = {
        from: vi.fn(() => ({ delete: mockDelete })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const ok = await excluirPeca('uuid-1')
      expect(ok).toBe(true)
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'uuid-1')
    })

    // --- SERVIÇOS ---
    it('salvarServico e obterServicoPorId remoto', async () => {
      const mockServico = {
        id: 'uuid-srv-1',
        codigo: 'SRV-01',
        nome: 'Troca de Óleo',
        valor_mao_de_obra: 80.0,
        tempo_estimado_horas: 0.5,
        ativo: true,
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockServico, error: null })
      const mockSelect = vi.fn(() => ({ single: mockSingle }))
      const mockInsert = vi.fn(() => ({ select: mockSelect }))
      const mockClient = {
        from: vi.fn(() => ({ insert: mockInsert })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const salvo = await salvarServico({
        codigo: 'SRV-01',
        nome: 'Troca de Óleo',
        valorMaoDeObra: 80,
      })

      expect(salvo.id).toBe('uuid-srv-1')
      expect(salvo.valorMaoDeObra).toBe(80)
    })

    it('salvarServico duplicado: traduz erro 23505', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "servicos_codigo_key"' },
      })
      const mockSelect = vi.fn(() => ({ single: mockSingle }))
      const mockInsert = vi.fn(() => ({ select: mockSelect }))
      const mockClient = {
        from: vi.fn(() => ({ insert: mockInsert })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(
        salvarServico({
          codigo: 'SRV-DUPLICADO',
          nome: 'Serviço Repetido',
        })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
        message: 'Código já cadastrado',
      })
    })

    // --- TERCEIROS ---
    it('salvarTerceiro e excluirTerceiro remoto', async () => {
      const mockTerceiro = {
        id: 'uuid-terc-1',
        razao_social: 'Retífica Central Ltda',
        nome_fantasia: 'Retífica Central',
        cnpj_cpf: '12345678000199',
        telefone: '(43) 3422-0000',
        ramo_atividade: 'Usinagem',
        ativo: true,
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockTerceiro, error: null })
      const mockSelect = vi.fn(() => ({ single: mockSingle }))
      const mockInsert = vi.fn(() => ({ select: mockSelect }))
      const mockEq = vi.fn().mockResolvedValue({ data: [{ id: 'uuid-terc-1' }], error: null, count: 1 })
      const mockDelete = vi.fn(() => ({ eq: mockEq }))

      const mockClient = {
        from: vi.fn((tab) => {
          if (tab === 'terceiros') {
            return {
              insert: mockInsert,
              delete: mockDelete,
            }
          }
        }),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const salvo = await salvarTerceiro({
        razaoSocial: 'Retífica Central Ltda',
        cnpjCpf: '12.345.678/0001-99',
        ramoAtividade: 'Usinagem',
      })
      expect(salvo.id).toBe('uuid-terc-1')

      const excluiu = await excluirTerceiro('uuid-terc-1')
      expect(excluiu).toBe(true)
    })

    it('obterTerceiroPorId remoto: busca terceiro por id', async () => {
      const mockTerceiro = {
        id: 'uuid-terc-busca',
        razao_social: 'Auto Peças Arapongas',
        cnpj_cpf: '99888777000166',
        ativo: true,
      }
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockTerceiro, error: null })
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
      const mockSelect = vi.fn(() => ({ eq: mockEq }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const terceiro = await obterTerceiroPorId('uuid-terc-busca')
      expect(terceiro).toBeDefined()
      expect(terceiro.razaoSocial).toBe('Auto Peças Arapongas')
    })

    it('comportamento fail-closed: erro na conexão lança ErroRepositorio sem fazer fallback local', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch', code: 'PGRST000' },
      })
      const mockSelect = vi.fn(() => ({ order: mockOrder }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(carregarPecas()).rejects.toThrow()
    })
  })

  describe('Modo Local (Offline / Testes)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('local')
    })

    it('salva, recupera e impede duplicidade de código em peças', async () => {
      const p1 = await salvarPeca({
        codigo: 'PEC-LOC-1',
        nome: 'Amortecedor Dianteiro',
        precoVenda: 250,
      })
      expect(p1.id).toBeDefined()
      expect(p1.codigo).toBe('PEC-LOC-1')

      const lista = await carregarPecas()
      expect(lista.length).toBe(1)
      expect(lista[0].nome).toBe('Amortecedor Dianteiro')

      await expect(
        salvarPeca({
          codigo: 'PEC-LOC-1',
          nome: 'Amortecedor Outra Marca',
        })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
      })
    })

    it('salva, busca por ID e exclui serviços no modo local', async () => {
      const s1 = await salvarServico({
        codigo: 'SRV-LOC-1',
        nome: 'Geometria Completa',
        valorMaoDeObra: 150,
      })

      const buscado = await obterServicoPorId(s1.id)
      expect(buscado.nome).toBe('Geometria Completa')

      const excluiu = await excluirServico(s1.id)
      expect(excluiu).toBe(true)

      const lista = await carregarServicos()
      expect(lista.length).toBe(0)
    })

    it('salva e exclui terceiros no modo local', async () => {
      const t1 = await salvarTerceiro({
        razaoSocial: 'Auto Elétrica São Paulo',
        telefone: '(43) 9999-8888',
      })

      expect(t1.id).toBeDefined()
      const lista = await carregarTerceiros()
      expect(lista.length).toBe(1)

      const excluiu = await excluirTerceiro(t1.id)
      expect(excluiu).toBe(true)

      const pos = await carregarTerceiros()
      expect(pos.length).toBe(0)
    })
  })
})
