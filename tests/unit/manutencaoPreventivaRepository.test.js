import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import { CODIGOS_ERRO } from '../../src/repositories/erroRepositorio'
import * as veiculosRepository from '../../src/repositories/veiculosRepository'
import * as veiculosEstacionadosRepository from '../../src/repositories/veiculosEstacionadosRepository'
import {
  carregarManutencoesPreventivas,
  carregarVeiculosAtivosPreventiva,
  atualizarHodometroVeiculo,
  registrarExecucaoPreventiva,
  calcularSaudeVeiculo,
} from '../../src/repositories/manutencaoPreventivaRepository'

describe('manutencaoPreventivaRepository (Story 2.13)', () => {
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

  describe('Modo Remoto (Supabase, RPC Hodômetro e Fail-Closed)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    it('carregarManutencoesPreventivas: busca registros ordenados e mapeia para camelCase', async () => {
      const mockDb = [
        {
          id: 'prev-1',
          veiculo_id: 'veic-100',
          placa: 'BRA2E19',
          item_id: 'oleo_filtros',
          ultima_execucao_km: 27500,
          ultima_execucao_data: '2026-01-10',
          intervalo_km: 10000,
          intervalo_meses: 6,
          mecanico_nome: 'Carlos Eduardo',
          observacoes: 'Óleo sintético 5W30',
          garantia_pendente: false,
          created_at: '2026-01-10T14:00:00Z',
          updated_at: '2026-01-10T14:00:00Z',
        },
      ]

      const order2 = vi.fn().mockResolvedValue({ data: mockDb, error: null })
      const order1 = vi.fn().mockReturnValue({ order: order2 })
      const selectMock = vi.fn().mockReturnValue({ order: order1 })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await carregarManutencoesPreventivas()
      expect(fromMock).toHaveBeenCalledWith('manutencoes_preventivas')
      expect(res).toHaveLength(1)
      expect(res[0].id).toBe('prev-1')
      expect(res[0].placa).toBe('BRA2E19')
      expect(res[0].itemId).toBe('oleo_filtros')
      expect(res[0].ultimaExecucaoKm).toBe(27500)
      expect(res[0].ultimaExecucaoData).toBe('10/01/2026')
      expect(res[0].mecanicoNome).toBe('Carlos Eduardo')
    })

    it('registrarExecucaoPreventiva: resolve veiculoId e insere registro na tabela', async () => {
      vi.spyOn(veiculosRepository, 'obterVeiculoPorPlaca').mockResolvedValue({
        id: 'veic-100',
        placa: 'BRA2E19',
        marcaModelo: 'Chevrolet Onix',
      })

      const insertedDb = {
        id: 'uuid-prev-123',
        veiculo_id: 'veic-100',
        placa: 'BRA2E19',
        item_id: 'pastilhas_freio',
        ultima_execucao_km: 30000,
        ultima_execucao_data: '2026-09-26',
        intervalo_km: 20000,
        intervalo_meses: 12,
        mecanico_nome: 'Gabriel Amaral',
        observacoes: 'Pastilhas trocadas',
        garantia_pendente: false,
        created_at: '2026-09-26T15:00:00Z',
        updated_at: '2026-09-26T15:00:00Z',
      }

      const singleMock = vi.fn().mockResolvedValue({ data: insertedDb, error: null })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const insertMock = vi.fn().mockReturnValue({ select: selectMock })
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock })

      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await registrarExecucaoPreventiva({
        placa: 'BRA2E19',
        itemId: 'pastilhas_freio',
        km: '30000',
        data: '26/09/2026',
        intervaloKm: 20000,
        intervaloMeses: 12,
        mecanicoNome: 'Gabriel Amaral',
        observacoes: 'Pastilhas trocadas',
      })

      expect(fromMock).toHaveBeenCalledWith('manutencoes_preventivas')
      expect(res.id).toBe('uuid-prev-123')
      expect(res.placa).toBe('BRA2E19')
      expect(res.itemId).toBe('pastilhas_freio')
      expect(res.ultimaExecucaoKm).toBe(30000)
    })

    it('registrarExecucaoPreventiva: lanca erro se veiculo nao existir no cadastro', async () => {
      vi.spyOn(veiculosRepository, 'obterVeiculoPorPlaca').mockResolvedValue(null)

      await expect(
        registrarExecucaoPreventiva({
          placa: 'INEXISTENTE',
          itemId: 'oleo_filtros',
        })
      ).rejects.toThrow('não encontrado no cadastro')
    })

    it('atualizarHodometroVeiculo: executa RPC restrita atualizar_hodometro_veiculo', async () => {
      const rpcMock = vi.fn().mockResolvedValue({
        data: { id: 'veic-100', placa: 'BRA2E19', km_atual: 45000 },
        error: null,
      })

      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ rpc: rpcMock })

      const res = await atualizarHodometroVeiculo('BRA2E19', '45000', false)
      expect(rpcMock).toHaveBeenCalledWith('atualizar_hodometro_veiculo', {
        placa: 'BRA2E19',
        novo_km: 45000,
        permitir_regressao: false,
      })
      expect(res.km_atual).toBe(45000)
    })

    it('atualizarHodometroVeiculo: falha com fail-closed se RPC retornar erro (ex: regressao nao permitida)', async () => {
      const rpcMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Novo KM (10000) não pode ser menor que o KM atual (20000)', code: '22003' },
      })

      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ rpc: rpcMock })

      await expect(
        atualizarHodometroVeiculo('BRA2E19', 10000, false)
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.OPERACAO_INVALIDA,
      })
    })

    it('atualizarHodometroVeiculo: valida placa e km invalido antes de chamar RPC', async () => {
      await expect(atualizarHodometroVeiculo('', 50000)).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DADOS_INVALIDOS,
      })

      await expect(atualizarHodometroVeiculo('ABC1234', 'invalido')).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.DADOS_INVALIDOS,
      })
    })

    it('Fail-closed: operacao que falha no Supabase rejeita sem gravar em localStorage', async () => {
      const order2 = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Erro de conexao com banco', code: 'PGRST000' },
      })
      const order1 = vi.fn().mockReturnValue({ order: order2 })
      const selectMock = vi.fn().mockReturnValue({ order: order1 })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      await expect(carregarManutencoesPreventivas()).rejects.toThrow()
      expect(localStorage.getItem('dev_oficina_manutencoes_preventivas')).toBeNull()
    })
  })

  describe('Integração de Frota e Saúde Pura', () => {
    it('carregarVeiculosAtivosPreventiva: filtra veiculos estacionados no patio', async () => {
      vi.spyOn(veiculosRepository, 'carregarVeiculos').mockResolvedValue([
        { id: 'v1', placa: 'AAA1111', marcaModelo: 'Carro Ativo', ativo: true },
        { id: 'v2', placa: 'BBB2222', marcaModelo: 'Carro Estacionado', ativo: true },
        { id: 'v3', placa: 'CCC3333', marcaModelo: 'Carro Inativo', ativo: false },
      ])

      vi.spyOn(veiculosEstacionadosRepository, 'carregarVeiculosEstacionados').mockResolvedValue([
        { id: 'estac-1', placa: 'BBB2222' },
      ])

      const ativos = await carregarVeiculosAtivosPreventiva()
      expect(ativos).toHaveLength(1)
      expect(ativos[0].placa).toBe('AAA1111')
    })

    it('calcularSaudeVeiculo: avalia veiculo com itens vencidos e calcula healthScore', () => {
      const veiculo = {
        placa: 'TEST001',
        modelo: 'Civic 2.0',
        kmAtual: '60000',
      }

      // Preventiva com óleo executado há 20.000 km atrás (vencido, intervalo padrão 10.000)
      const preventivas = [
        {
          placa: 'TEST001',
          itemId: 'oleo_filtros',
          ultimaExecucaoKm: 40000,
          ultimaExecucaoData: '01/01/2025',
          intervaloKm: 10000,
          intervaloMeses: 6,
        },
      ]

      const saude = calcularSaudeVeiculo(veiculo, preventivas)
      expect(saude.placa).toBe('TEST001')
      expect(saude.kmAtualNum).toBe(60000)
      expect(saude.statusGeral).toBe('critico')
      expect(saude.itensVencidos).toBeGreaterThan(0)
      expect(saude.healthScore).toBeLessThan(100)
    })
  })
})
