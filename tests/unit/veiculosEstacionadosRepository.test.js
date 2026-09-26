import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as supabaseLib from '../../src/lib/supabase'
import { setModoOperacaoOverride } from '../../src/repositories/supabaseHelpers'
import { CODIGOS_ERRO } from '../../src/repositories/erroRepositorio'
import * as clientesRepository from '../../src/repositories/clientesRepository'
import * as veiculosRepository from '../../src/repositories/veiculosRepository'
import {
  carregarVeiculosEstacionados,
  obterVeiculoEstacionadoPorId,
  estacionarVeiculo,
  vincularVeiculoEstacionadoAoCliente,
  atualizarVeiculoEstacionado,
  excluirVeiculoEstacionado,
  obterHistoricoCompletoVeiculo,
} from '../../src/repositories/veiculosEstacionadosRepository'

describe('veiculosEstacionadosRepository (Story 2.11)', () => {
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

  describe('Modo Remoto (Supabase, ID no banco e Fail-Closed)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('remoto')
    })

    it('carregarVeiculosEstacionados: carrega veículos estacionados ordenados', async () => {
      const mockDb = [
        {
          id: 'estac-1',
          placa: 'ABC1D23',
          marca: 'Fiat',
          modelo: 'Palio',
          ano: '2015',
          cor: 'Prata',
          km_atual: '85000',
          data_estacionamento: '2026-09-26',
          antigo_cliente_nome: 'João Silva',
          historico_manutencoes: [{ numeroOS: 'OS-101', laudoTecnico: 'Revisão' }],
          created_at: '2026-09-26T12:00:00Z',
          updated_at: '2026-09-26T12:00:00Z',
        },
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: mockDb, error: null })
      const selectMock = vi.fn().mockReturnValue({ order: orderMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await carregarVeiculosEstacionados()
      expect(fromMock).toHaveBeenCalledWith('veiculos_estacionados')
      expect(selectMock).toHaveBeenCalledWith('*')
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(res).toHaveLength(1)
      expect(res[0]).toMatchObject({
        id: 'estac-1',
        placa: 'ABC1D23',
        marca: 'Fiat',
        modelo: 'Palio',
        antigoClienteNome: 'João Silva',
        historicoManutencoes: [{ numeroOS: 'OS-101', laudoTecnico: 'Revisão' }],
      })
    })

    it('fail-closed: lança ErroRepositorio se Supabase falhar', async () => {
      const orderMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'DB connection failure', code: 'P0001' },
      })
      const selectMock = vi.fn().mockReturnValue({ order: orderMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      await expect(carregarVeiculosEstacionados()).rejects.toThrow()
    })

    it('estacionarVeiculo: persiste veículo com ID gerado pelo banco e remove da frota ativa', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: {
          id: 'estac-gerado-db',
          placa: 'BRA2E19',
          marca: 'Toyota',
          modelo: 'Corolla',
          km_atual: '50000',
          data_estacionamento: '26/09/2026',
          antigo_cliente_nome: 'Marcos Proprietário',
          historico_manutencoes: [],
          created_at: '2026-09-26T12:00:00Z',
          updated_at: '2026-09-26T12:00:00Z',
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
      vi.spyOn(veiculosRepository, 'excluirVeiculo').mockResolvedValue(true)

      const veiculoOrigem = {
        id: 'veic-123',
        placa: 'BRA2E19',
        marca: 'Toyota',
        modelo: 'Corolla',
        clienteId: 'cli-77',
        clienteNome: 'Marcos Proprietário',
      }
      const dadosVenda = {
        dataVenda: '26/09/2026',
        kmNaVenda: '50000',
        motivoVenda: 'Vendido para terceiro',
      }

      const resultado = await estacionarVeiculo({ veiculo: veiculoOrigem, dadosVenda })
      expect(insertMock).toHaveBeenCalled()
      expect(payloadEnviado.id).toBeUndefined() // ID deve ser gerado pelo banco!
      expect(veiculosRepository.excluirVeiculo).toHaveBeenCalledWith('veic-123')
      expect(resultado.id).toBe('estac-gerado-db')
      expect(resultado.placa).toBe('BRA2E19')
    })

    it('vincularVeiculoEstacionadoAoCliente: vincula a cliente existente preservando histórico', async () => {
      const mockEstacionadoDb = {
        id: 'estac-55',
        placa: 'XYZ9876',
        marca: 'Honda',
        modelo: 'Fit',
        km_atual: '70000',
        data_estacionamento: '2026-09-20',
        historico_manutencoes: [{ numeroOS: 'OS-900', laudoTecnico: 'Troca de amortecedores' }],
      }

      // Mock obterVeiculoEstacionadoPorId
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockEstacionadoDb, error: null })
      const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

      // Mock delete
      const deleteEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const deleteMock = vi.fn().mockReturnValue({ eq: deleteEqMock })

      const fromMock = vi.fn().mockImplementation((table) => {
        if (table === 'veiculos_estacionados') {
          return { select: selectMock, delete: deleteMock }
        }
        return {}
      })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      vi.spyOn(clientesRepository, 'obterClientePorId').mockResolvedValue({
        id: 'cli-novo-dono',
        nome: 'Marina Compradora',
      })
      let veiculoSalvoFrota = null
      vi.spyOn(veiculosRepository, 'salvarVeiculo').mockImplementation(async (v) => {
        veiculoSalvoFrota = v
        return { ...v, id: 'veic-novo-id' }
      })

      const resultado = await vincularVeiculoEstacionadoAoCliente({
        veiculoEstacionadoId: 'estac-55',
        clienteDestinoId: 'cli-novo-dono',
      })

      expect(resultado.clienteId).toBe('cli-novo-dono')
      expect(resultado.clienteNome).toBe('Marina Compradora')
      expect(veiculoSalvoFrota).toBeTruthy()
      expect(veiculoSalvoFrota.clienteId).toBe('cli-novo-dono')
      expect(veiculoSalvoFrota.placa).toBe('XYZ9876')
      expect(veiculoSalvoFrota.historicoManutencoes).toEqual([
        { numeroOS: 'OS-900', laudoTecnico: 'Troca de amortecedores' },
      ])
      expect(deleteMock).toHaveBeenCalled()
    })

    it('vincularVeiculoEstacionadoAoCliente: cadastra novo cliente e vincula com histórico preservado', async () => {
      const mockEstacionadoDb = {
        id: 'estac-66',
        placa: 'KTM1122',
        marca: 'Ford',
        modelo: 'Ka',
        km_atual: '30000',
        historico_manutencoes: [{ numeroOS: 'OS-750', servico: 'Troca de óleo' }],
      }

      const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockEstacionadoDb, error: null })
      const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
      const deleteEqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const deleteMock = vi.fn().mockReturnValue({ eq: deleteEqMock })

      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({
        from: vi.fn().mockReturnValue({ select: selectMock, delete: deleteMock }),
      })

      vi.spyOn(clientesRepository, 'salvarCliente').mockResolvedValue({
        id: 'cli-recem-cadastrado',
        nome: 'Lucas Santos',
      })
      let frotaCriada = null
      vi.spyOn(veiculosRepository, 'salvarVeiculo').mockImplementation(async (v) => {
        frotaCriada = v
        return { ...v, id: 'veic-ka-1' }
      })

      const resultado = await vincularVeiculoEstacionadoAoCliente({
        veiculoEstacionadoId: 'estac-66',
        novoClienteData: {
          nome: 'Lucas Santos',
          telefone: '11999998888',
        },
      })

      expect(clientesRepository.salvarCliente).toHaveBeenCalled()
      expect(resultado.clienteId).toBe('cli-recem-cadastrado')
      expect(resultado.clienteNome).toBe('Lucas Santos')
      expect(frotaCriada.historicoManutencoes).toEqual([
        { numeroOS: 'OS-750', servico: 'Troca de óleo' },
      ])
    })

    it('atualizarVeiculoEstacionado: emite CONFLITO_EDICAO se 0 linhas forem afetadas', async () => {
      const selectMock = vi.fn().mockResolvedValue({ data: [], error: null })
      const eqUpdatedMock = vi.fn().mockReturnValue({ select: selectMock })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqUpdatedMock, select: selectMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })
      const fromMock = vi.fn().mockReturnValue({ update: updateMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      await expect(
        atualizarVeiculoEstacionado('estac-1', { observacoes: 'Alteração' }, '2026-09-26T00:00:00Z')
      ).rejects.toMatchObject({
        codigo: CODIGOS_ERRO.CONFLITO_EDICAO,
      })
    })

    it('excluirVeiculoEstacionado: remove do banco com fail-closed', async () => {
      const eqMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
      const fromMock = vi.fn().mockReturnValue({ delete: deleteMock })
      vi.spyOn(supabaseLib, 'getSupabaseDataClient').mockReturnValue({ from: fromMock })

      const res = await excluirVeiculoEstacionado('estac-99')
      expect(res).toBe(true)
      expect(fromMock).toHaveBeenCalledWith('veiculos_estacionados')
      expect(eqMock).toHaveBeenCalledWith('id', 'estac-99')
    })
  })

  describe('Modo Local (Offline / Testes)', () => {
    beforeEach(() => {
      setModoOperacaoOverride('local')
    })

    it('executa fluxo completo localmente com integridade e preservação de histórico', async () => {
      vi.spyOn(veiculosRepository, 'excluirVeiculo').mockResolvedValue(true)
      vi.spyOn(veiculosRepository, 'salvarVeiculo').mockImplementation(async (v) => ({ ...v, id: 'veic-local' }))
      vi.spyOn(clientesRepository, 'obterClientePorId').mockResolvedValue({ id: 'cli-1', nome: 'Dono Local' })

      const veiculoInicial = {
        id: 'v-local-1',
        placa: 'LOC1A23',
        marca: 'Volkswagen',
        modelo: 'Gol',
        clienteId: 'cli-antigo',
        clienteNome: 'Antigo Dono',
      }

      // 1. Estaciona
      const estacionado = await estacionarVeiculo({
        veiculo: veiculoInicial,
        dadosVenda: {
          dataVenda: '26/09/2026',
          kmNaVenda: '45000',
          motivoVenda: 'Vendido',
        },
      })
      expect(estacionado.id).toBeTruthy()
      expect(estacionado.placa).toBe('LOC1A23')

      // 2. Consulta por ID e lista
      const obtido = await obterVeiculoEstacionadoPorId(estacionado.id)
      expect(obtido).toBeTruthy()
      expect(obtido.placa).toBe('LOC1A23')

      const lista = await carregarVeiculosEstacionados()
      expect(lista.some((v) => v.id === estacionado.id)).toBe(true)

      // 3. Atualiza anotações
      const atualizado = await atualizarVeiculoEstacionado(estacionado.id, {
        observacoes: 'Aguardando vistoria',
      })
      expect(atualizado.observacoes).toBe('Aguardando vistoria')

      // 4. Vincula a novo cliente
      const vinculo = await vincularVeiculoEstacionadoAoCliente({
        veiculoEstacionadoId: estacionado.id,
        clienteDestinoId: 'cli-1',
      })
      expect(vinculo.clienteNome).toBe('Dono Local')

      // 5. Veículo não deve mais estar na lista de estacionados
      const listaPosVinculo = await carregarVeiculosEstacionados()
      expect(listaPosVinculo.some((v) => v.id === estacionado.id)).toBe(false)
    })
  })

  describe('obterHistoricoCompletoVeiculo', () => {
    it('agrega histórico do objeto e formata placa', () => {
      const hist = obterHistoricoCompletoVeiculo('abc1d23', {
        historicoManutencoes: [
          { numeroOS: 'OS-1', dataEntrada: '2026-09-01' },
          { numeroOS: 'OS-2', dataEntrada: '2026-09-10' },
        ],
      })
      expect(hist).toHaveLength(2)
      expect(hist.map((h) => h.numeroOS)).toEqual(['OS-2', 'OS-1'])
    })
  })
})
