import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  carregarClientes,
  obterClientePorId,
  buscarClientePorDocumento,
  salvarCliente,
  excluirCliente,
  obterVeiculosDoCliente,
} from '../../src/repositories/clientesRepository'
import {
  carregarPecas,
  salvarPeca,
  excluirPeca,
  carregarServicos,
  salvarServico,
  carregarTerceiros,
  salvarTerceiro,
} from '../../src/repositories/suprimentosRepository'
import {
  carregarMovimentacoes,
  registrarMovimentacao,
  obterSaldoPeca,
} from '../../src/repositories/estoqueRepository'
import {
  carregarCompras,
  salvarCompra,
} from '../../src/repositories/comprasRepository'
import {
  carregarFuncionarios,
  obterMecanicosAtivos,
  obterFuncionarioPorId,
  salvarFuncionario,
  alternarStatusFuncionario,
  excluirFuncionario,
} from '../../src/repositories/funcionariosRepository'

describe('Story 1.5 & Story 1.10: Camada de Repositórios Assíncronos (Async Contract First)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('clientesRepository', () => {
    it('deve retornar uma Promise com uma lista vazia quando não há clientes cadastrados', async () => {
      const clientes = await carregarClientes()
      expect(Array.isArray(clientes)).toBe(true)
      expect(clientes.length).toBe(0)
    })

    it('deve buscar cliente por ID e por documento', async () => {
      const primeiro = await salvarCliente({
        nome: 'Cliente Busca Teste',
        documento: '555.666.777-88',
        telefone: '(43) 98888-7777',
      })

      const porId = await obterClientePorId(primeiro.value ?? primeiro.id)
      expect(porId).not.toBeNull()
      expect(porId.nome).toBe(primeiro.nome)

      const porDoc = await buscarClientePorDocumento(primeiro.documento)
      expect(porDoc).not.toBeNull()
      expect(porDoc.nome).toBe(primeiro.nome)
    })

    it('deve salvar novo cliente e permitir exclusão', async () => {
      const novo = {
        nome: 'Cliente Teste Repositório',
        documento: '111.222.333-44',
        telefone: '(43) 99999-8888',
      }
      const salvo = await salvarCliente(novo)
      expect(salvo.id).toBeDefined()
      expect(salvo.nome).toBe('Cliente Teste Repositório')

      const recuperado = await obterClientePorId(salvo.id)
      expect(recuperado).not.toBeNull()

      const excluido = await excluirCliente(salvo.id)
      expect(excluido).toBe(true)

      const aposExclusao = await obterClientePorId(salvo.id)
      expect(aposExclusao).toBeNull()
    })

    it('deve retornar a lista de veículos de um cliente', async () => {
      const todos = await carregarClientes()
      const clienteComVeiculos = todos.find((c) => c.veiculos && c.veiculos.length > 0)
      if (clienteComVeiculos) {
        const veiculos = await obterVeiculosDoCliente(clienteComVeiculos.value)
        expect(Array.isArray(veiculos)).toBe(true)
        expect(veiculos.length).toBeGreaterThan(0)
      }
    })
  })

  describe('suprimentosRepository', () => {
    it('deve carregar e salvar peças de forma assíncrona', async () => {
      const pecas = await carregarPecas()
      expect(Array.isArray(pecas)).toBe(true)

      const novaPeca = {
        codigo: 'TEST-001',
        nome: 'Filtro de Teste Repositório',
        precoUnitario: 35.0,
      }
      const salva = await salvarPeca(novaPeca)
      expect(salva.id).toBeDefined()

      const excluiu = await excluirPeca(salva.id)
      expect(excluiu).toBe(true)
    })

    it('deve carregar e salvar serviços e terceiros', async () => {
      const servicos = await carregarServicos()
      expect(Array.isArray(servicos)).toBe(true)

      const terceiros = await carregarTerceiros()
      expect(Array.isArray(terceiros)).toBe(true)

      const novoServ = await salvarServico({ nome: 'Alinhamento Especial', valorUnitario: 120 })
      expect(novoServ.id).toBeDefined()

      const novoTerc = await salvarTerceiro({ razaoSocial: 'Torno e Solda Teste' })
      expect(novoTerc.id).toBeDefined()
    })
  })

  describe('estoqueRepository', () => {
    it('deve registrar movimentação de estoque e atualizar saldo da peça', async () => {
      const peca = await salvarPeca({
        codigo: 'PEC-ESTOQUE',
        nome: 'Vela de Ignição',
        estoque: 10,
        estoqueAtual: 10,
      })

      // Registrar entrada de 5 unidades
      await registrarMovimentacao({
        pecaId: peca.id,
        tipo: 'entrada',
        quantidade: 5,
        motivo: 'Compra NF 1234',
      })

      const saldoAposEntrada = await obterSaldoPeca(peca.id)
      expect(saldoAposEntrada).toBe(15)

      // Registrar saída de 3 unidades
      await registrarMovimentacao({
        pecaId: peca.id,
        tipo: 'saida',
        quantidade: 3,
        motivo: 'Consumo na OS 100',
      })

      const saldoAposSaida = await obterSaldoPeca(peca.id)
      expect(saldoAposSaida).toBe(12)

      const todasMovs = await carregarMovimentacoes()
      expect(Array.isArray(todasMovs)).toBe(true)
      expect(todasMovs.length).toBeGreaterThan(0)
    })
  })

  describe('comprasRepository', () => {
    it('deve carregar pedidos de compra e salvar novo pedido', async () => {
      const compras = await carregarCompras()
      expect(Array.isArray(compras)).toBe(true)

      const nova = await salvarCompra({
        fornecedorNome: 'Auto Peças Londrina',
        itens: [{ descricao: 'Correia', quantidade: 2, valorUnitario: 50 }],
        valorTotal: 100,
      })
      expect(nova.id).toBeDefined()
    })
  })

  describe('funcionariosRepository (Story 1.10 / Story de login e cadastro)', () => {
    it('deve auto-semear apenas o administrador real (sem dados mock de equipe)', async () => {
      const equipe = await carregarFuncionarios()
      expect(Array.isArray(equipe)).toBe(true)
      expect(equipe.length).toBeGreaterThanOrEqual(1)

      const admin = await obterFuncionarioPorId('admin-rafael')
      expect(admin).not.toBeNull()
      expect(admin.nome).toContain('Rafael Amaral Salustiano')
      expect(admin.cargo).toBe('analista')
      expect(admin.authUserId).toBe('b0815410-e82e-4034-aa87-567faf2f6500')
    })

    it('deve filtrar mecânico, aux. mecânico e gerente como elegíveis para escala de trabalho', async () => {
      await salvarFuncionario({ nome: 'Mecânico Teste', cargo: 'mecanico', ativo: true })
      await salvarFuncionario({ nome: 'Aux Teste', cargo: 'aux_mecanico', ativo: true })
      await salvarFuncionario({ nome: 'Gerente Teste', cargo: 'gerente', ativo: true })
      await salvarFuncionario({ nome: 'Secretária Teste', cargo: 'secretaria', ativo: true })

      const mecanicos = await obterMecanicosAtivos()
      expect(Array.isArray(mecanicos)).toBe(true)
      expect(mecanicos.every((m) => m.ativo)).toBe(true)
      expect(mecanicos.every((m) => ['mecanico', 'aux_mecanico', 'gerente'].includes(m.cargo))).toBe(true)
      expect(mecanicos.some((m) => m.cargo === 'secretaria')).toBe(false)
    })

    it('deve salvar, alternar status e excluir colaborador', async () => {
      const novo = {
        nome: 'Roberto Teste',
        cpf: '777.888.999-00',
        telefone: '(43) 99111-2233',
        cargo: 'mecanico',
        comissaoServicos: 10,
        comissaoPecas: 2,
      }
      const salvo = await salvarFuncionario(novo)
      expect(salvo.id).toBeDefined()
      expect(salvo.ativo).toBe(true)

      const inativado = await alternarStatusFuncionario(salvo.id, false)
      expect(inativado.ativo).toBe(false)

      const excluiu = await excluirFuncionario(salvo.id)
      expect(excluiu).toBe(true)

      const busca = await obterFuncionarioPorId(salvo.id)
      expect(busca).toBeNull()
    })
  })
})
