import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import {
  CODIGOS_ERRO,
} from '../../src/repositories/erroRepositorio'
import {
  carregarClientes,
  obterClientePorId,
  buscarClientePorDocumento,
  salvarCliente,
  excluirCliente,
  STORAGE_KEY_VEICULOS,
} from '../../src/repositories/clientesRepository'

describe('clientesRepository (Story 2.5)', () => {
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

  describe('Modo Remoto (Supabase)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    it('carregarClientes: busca clientes sem e com embed de veículos', async () => {
      const mockData = [
        {
          id: 'uuid-1',
          codigo_cliente: '0000166',
          nome: 'Carlos Eduardo',
          cpf_cnpj: '11122233344',
          telefone: '(43) 99999-1111',
          tipo: 'PF',
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

      const lista = await carregarClientes()
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(lista.length).toBe(1)
      expect(lista[0].id).toBe('uuid-1')
      expect(lista[0].codigoCliente).toBe('0000166')
      expect(lista[0].tipoPessoa).toBe('F')

      // Com embed de veículos
      await carregarClientes({ incluirVeiculos: true })
      expect(mockSelect).toHaveBeenCalledWith('*, veiculos(*)')
    })

    it('obterClientePorId: retorna cliente formatado ou null se não existir', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'uuid-1',
          codigo_cliente: '0000166',
          nome: 'Carlos Eduardo',
          cpf_cnpj: '11122233344',
          telefone: '(43) 99999-1111',
          tipo: 'PF',
        },
        error: null,
      })

      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle: mockSingle })),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const cliente = await obterClientePorId('uuid-1')
      expect(cliente).not.toBeNull()
      expect(cliente.nome).toBe('Carlos Eduardo')
      expect(cliente.codigoCliente).toBe('0000166')

      mockSingle.mockResolvedValueOnce({ data: null, error: null })
      const inexistente = await obterClientePorId('uuid-inexistente')
      expect(inexistente).toBeNull()
    })

    it('buscarClientePorDocumento: busca no banco normalizando apenas os dígitos', async () => {
      const mockEq = vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'uuid-1', nome: 'Carlos Eduardo', cpf_cnpj: '11122233344' },
          error: null,
        }),
      }))
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({ eq: mockEq })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const cliente = await buscarClientePorDocumento('111.222.333-44')
      expect(mockEq).toHaveBeenCalledWith('cpf_cnpj', '11122233344')
      expect(cliente).not.toBeNull()
      expect(cliente.documento).toBe('11122233344')
    })

    it('salvarCliente INSERT: envia sem id nem codigoCliente e recebe dados gerados pelo banco', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'uuid-gerado-pelo-banco',
          codigo_cliente: '0000166',
          nome: 'Cliente Novo',
          cpf_cnpj: '12345678901',
          telefone: '(43) 99999-9999',
          tipo: 'PF',
          ativo: true,
        },
        error: null,
      })

      let payloadEnviado = null
      const mockClient = {
        from: vi.fn(() => ({
          insert: vi.fn((p) => {
            payloadEnviado = p
            return {
              select: vi.fn(() => ({ single: mockSingle })),
            }
          }),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const salvo = await salvarCliente({
        id: 'cli-temp-123',
        nome: 'Cliente Novo',
        documento: '123.456.789-01',
        telefone: '(43) 99999-9999',
      })

      expect(payloadEnviado.id).toBeUndefined()
      expect(payloadEnviado.codigo_cliente).toBeUndefined()
      expect(salvo.id).toBe('uuid-gerado-pelo-banco')
      expect(salvo.codigoCliente).toBe('0000166')
    })

    it('salvarCliente duplicado: traduz erro 23505 para mensagem amigável "CPF/CNPJ já cadastrado"', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '23505', message: 'duplicate key value violates unique constraint' },
              }),
            })),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(
        salvarCliente({ nome: 'Duplicado', documento: '111.111.111-11', telefone: '123' })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
        message: 'CPF/CNPJ já cadastrado',
      })
    })

    it('excluirCliente com veículo: captura erro FK 23503 e lança mensagem amigável', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '23503', message: 'foreign key constraint "veiculos_cliente_id_fkey" violated' },
              }),
            })),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(excluirCliente('uuid-cli-com-veiculo')).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.REFERENCIA_INVALIDA,
        message: 'Cliente possui veículos vinculados; transfira ou exclua os veículos antes',
      })
    })
  })

  describe('Modo Local (Offline / Testes)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('local')
    })

    it('salva e recupera cliente localmente com código iniciando em 0000166', async () => {
      const cliente1 = await salvarCliente({
        nome: 'Primeiro Local',
        documento: '123.456.789-01',
        telefone: '(43) 99111-2222',
      })

      expect(cliente1.id).toBeDefined()
      expect(cliente1.codigoCliente).toBe('0000166')

      const cliente2 = await salvarCliente({
        nome: 'Segundo Local',
        documento: '987.654.321-09',
        telefone: '(43) 99333-4444',
      })

      expect(cliente2.codigoCliente).toBe('0000167')

      const lista = await carregarClientes()
      expect(lista.length).toBe(2)

      const achado = await buscarClientePorDocumento('12345678901')
      expect(achado.nome).toBe('Primeiro Local')
    })

    it('impede CPF/CNPJ duplicado no modo local', async () => {
      await salvarCliente({
        nome: 'Existente',
        documento: '111.222.333-44',
        telefone: '(43) 99999-1111',
      })

      await expect(
        salvarCliente({
          nome: 'Tentativa Duplicada',
          documento: '11122233344',
          telefone: '(43) 98888-2222',
        })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
        message: 'CPF/CNPJ já cadastrado',
      })
    })

    it('impede exclusão de cliente no modo local se houver veículos vinculados', async () => {
      const cli = await salvarCliente({
        nome: 'Com Veiculos',
        documento: '333.444.555-66',
        telefone: '(43) 99999-3333',
      })

      // Simula veículo vinculado no storage de veículos
      localStorage.setItem(
        STORAGE_KEY_VEICULOS,
        JSON.stringify([{ id: 'veic-1', clienteId: cli.id, placa: 'ABC1234' }])
      )

      await expect(excluirCliente(cli.id)).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.REFERENCIA_INVALIDA,
        message: 'Cliente possui veículos vinculados; transfira ou exclua os veículos antes',
      })

      // Remove veículo vinculado e tenta novamente
      localStorage.setItem(STORAGE_KEY_VEICULOS, JSON.stringify([]))
      const excluido = await excluirCliente(cli.id)
      expect(excluido).toBe(true)

      const apos = await obterClientePorId(cli.id)
      expect(apos).toBeNull()
    })
  })
})
