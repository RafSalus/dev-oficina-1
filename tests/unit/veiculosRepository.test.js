import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import {
  CODIGOS_ERRO,
} from '../../src/repositories/erroRepositorio'
import {
  carregarVeiculos,
  obterVeiculoPorId,
  obterVeiculoPorPlaca,
  obterVeiculosDoCliente,
  salvarVeiculo,
  excluirVeiculo,
  STORAGE_KEY_CLIENTES,
} from '../../src/repositories/veiculosRepository'

describe('veiculosRepository (Story 2.5)', () => {
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

    it('carregarVeiculos: busca frota completa enriquecida com dados do proprietário', async () => {
      const mockData = [
        {
          id: 'v-1',
          codigo_veiculo: 'VEIC-0001',
          cliente_id: 'c-1',
          placa: 'ABC1D23',
          marca: 'Fiat',
          modelo: 'Palio',
          ano: '2018',
          cor: 'Branco',
          km_atual: 50000,
          clientes: {
            id: 'c-1',
            nome: 'Carlos Eduardo',
            codigo_cliente: '0000166',
            cpf_cnpj: '11122233344',
            telefone: '(43) 99999-1111',
            tipo: 'PF',
            endereco: { cidade: 'Apucarana', uf: 'PR' },
          },
        },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockSelect = vi.fn(() => ({ order: mockOrder }))
      const mockClient = {
        from: vi.fn(() => ({ select: mockSelect })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const veiculos = await carregarVeiculos()
      expect(mockSelect).toHaveBeenCalledWith('*, clientes(*)')
      expect(veiculos.length).toBe(1)
      expect(veiculos[0].id).toBe('v-1')
      expect(veiculos[0].codigoVeiculo).toBe('VEIC-0001')
      expect(veiculos[0].marcaModelo).toBe('Fiat Palio')
      expect(veiculos[0].kmPadrao).toBe('50000')
      // Proprietário
      expect(veiculos[0].clienteId).toBe('c-1')
      expect(veiculos[0].clienteNome).toBe('Carlos Eduardo')
      expect(veiculos[0].clienteCodigo).toBe('0000166')
      expect(veiculos[0].clienteDocumento).toBe('11122233344')
    })

    it('obterVeiculoPorPlaca: busca no banco normalizando placa para A-Z0-9', async () => {
      const mockEq = vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'v-2', placa: 'XYZ9876', marca: 'VW', modelo: 'Gol' },
          error: null,
        }),
      }))
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({ eq: mockEq })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const veiculo = await obterVeiculoPorPlaca('xyz-9876')
      expect(mockEq).toHaveBeenCalledWith('placa', 'XYZ9876')
      expect(veiculo).not.toBeNull()
      expect(veiculo.placa).toBe('XYZ9876')
    })

    it('obterVeiculosDoCliente: filtra veículos pelo cliente_id', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [{ id: 'v-3', cliente_id: 'cli-99', placa: 'AAA1111', marca: 'Ford', modelo: 'Ka' }],
        error: null,
      })
      const mockEq = vi.fn(() => ({ order: mockOrder }))
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({ eq: mockEq })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const veiculos = await obterVeiculosDoCliente('cli-99')
      expect(mockEq).toHaveBeenCalledWith('cliente_id', 'cli-99')
      expect(veiculos.length).toBe(1)
      expect(veiculos[0].placa).toBe('AAA1111')
    })

    it('salvarVeiculo INSERT: deixa id e codigoVeiculo para o banco gerar', async () => {
      let payloadEnviado = null
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'uuid-veic-banco',
          codigo_veiculo: 'VEIC-0001',
          cliente_id: 'c-1',
          placa: 'NEW0001',
          marca: 'Toyota',
          modelo: 'Yaris',
        },
        error: null,
      })

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

      const salvo = await salvarVeiculo({
        id: 'veic-temp-1',
        clienteId: 'c-1',
        placa: 'new-0001',
        marca: 'Toyota',
        modelo: 'Yaris',
      })

      expect(payloadEnviado.id).toBeUndefined()
      expect(payloadEnviado.codigo_veiculo).toBeUndefined()
      expect(payloadEnviado.placa).toBe('NEW0001')
      expect(salvo.id).toBe('uuid-veic-banco')
      expect(salvo.codigoVeiculo).toBe('VEIC-0001')
    })

    it('salvarVeiculo duplicado: traduz erro 23505 para "Placa já cadastrada"', async () => {
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
        salvarVeiculo({ placa: 'DUP0001', marca: 'VW', modelo: 'Gol' })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
        message: 'Placa já cadastrada',
      })
    })

    it('salvarVeiculo fora de horário (42501): detecta em_horario_operacional = false e lança FORA_DO_HORARIO', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '42501', message: 'new row violates row-level security policy for table "veiculos"' },
              }),
            })),
          })),
        })),
        rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      await expect(
        salvarVeiculo({ placa: 'NOITE01', marca: 'Chevrolet', modelo: 'Onix' })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.FORA_DO_HORARIO,
        message: 'Operação permitida apenas das 08h às 19h.',
      })
      expect(mockClient.rpc).toHaveBeenCalledWith('em_horario_operacional')
    })

    it('excluirVeiculo: executa deleção com espera de linhas afetadas', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn().mockResolvedValue({ data: [{ id: 'v-del' }], error: null }),
            })),
          })),
        })),
      }
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue(mockClient)

      const excluido = await excluirVeiculo('v-del')
      expect(excluido).toBe(true)
    })
  })

  describe('Modo Local (Offline / Testes)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('local')
    })

    it('salva e recupera veículos localmente gerando VEIC-0001 sequencial', async () => {
      const v1 = await salvarVeiculo({
        placa: 'abc-1234',
        marca: 'Fiat',
        modelo: 'Uno',
      })
      expect(v1.id).toBeDefined()
      expect(v1.codigoVeiculo).toBe('VEIC-0001')
      expect(v1.placa).toBe('ABC1234')

      const v2 = await salvarVeiculo({
        placa: 'xyz-9999',
        marca: 'Ford',
        modelo: 'Ka',
      })
      expect(v2.codigoVeiculo).toBe('VEIC-0002')

      const lista = await carregarVeiculos()
      expect(lista.length).toBe(2)

      const porPlaca = await obterVeiculoPorPlaca('abc-1234')
      expect(porPlaca.marca).toBe('Fiat')
    })

    it('impede placa duplicada no modo local', async () => {
      await salvarVeiculo({
        placa: 'CLO1234',
        marca: 'Fiat',
        modelo: 'Mobi',
      })

      await expect(
        salvarVeiculo({
          placa: 'clo-1234',
          marca: 'Fiat',
          modelo: 'Mobi Clone',
        })
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DUPLICADO,
        message: 'Placa já cadastrada',
      })
    })

    it('carregarVeiculos no modo local enriquece dados do proprietário a partir de dev_oficina_clientes_v2', async () => {
      localStorage.setItem(
        STORAGE_KEY_CLIENTES,
        JSON.stringify([
          {
            id: 'c-loc-1',
            nome: 'Ana Paula',
            codigoCliente: '0000166',
            documento: '99988877766',
            telefone: '(43) 98888-0000',
            tipoPessoa: 'F',
            cidade: 'Apucarana',
            uf: 'PR',
          },
        ])
      )

      await salvarVeiculo({
        clienteId: 'c-loc-1',
        placa: 'ANA0001',
        marca: 'Honda',
        modelo: 'Fit',
      })

      const frota = await carregarVeiculos()
      expect(frota.length).toBe(1)
      expect(frota[0].clienteNome).toBe('Ana Paula')
      expect(frota[0].clienteCodigo).toBe('0000166')
      expect(frota[0].clienteCidade).toBe('Apucarana')
    })

    it('transfere proprietário e permite exclusão no modo local', async () => {
      const v = await salvarVeiculo({
        clienteId: 'c-antigo',
        placa: 'TRF0001',
        marca: 'Renault',
        modelo: 'Sandero',
      })

      // Transfere proprietário
      const transferido = await salvarVeiculo({
        ...v,
        clienteId: 'c-novo',
      })
      expect(transferido.clienteId).toBe('c-novo')

      const excluido = await excluirVeiculo(v.id)
      expect(excluido).toBe(true)

      const apos = await obterVeiculoPorId(v.id)
      expect(apos).toBeNull()
    })
  })
})
