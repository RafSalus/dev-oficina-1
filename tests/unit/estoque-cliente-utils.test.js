import { describe, it, expect } from 'vitest'
import {
  situacaoEstoque,
  calcularMetricasEstoque,
  filtrarPosicaoEstoque,
  calcularReposicaoEstoque,
  totalInvestimentoReposicao,
  filtrarMovimentacoes,
  textoListaReposicao,
} from '../../src/utils/estoque/estoqueCalculos'
import {
  formDoCliente,
  validarCliente,
  validarVeiculo,
  montarVeiculoCliente,
  temDadosPreenchidos,
  filtrarVeiculos,
} from '../../src/utils/clientes/clienteFormulario'

const PECAS = [
  { id: 'a', nome: 'Bateria', codigo: 'BAT', categoria: 'Elétrica', estoqueAtual: 0, estoqueMinimo: 1, precoCusto: 400, precoVenda: 600 },
  { id: 'b', nome: 'Amortecedor', codigo: 'AMT', categoria: 'Suspensão', estoqueAtual: 2, estoqueMinimo: 2, precoCusto: 200, precoVenda: 320 },
  { id: 'c', nome: 'Correia', codigo: 'COR', categoria: 'Motor', estoqueAtual: 8, estoqueMinimo: 2, precoCusto: 50, precoVenda: 90 },
]

describe('Utilitários puros de Estoque (Story 2.0 / Task 4)', () => {
  it('classifica a situação e calcula os indicadores', () => {
    expect(PECAS.map(situacaoEstoque)).toEqual(['ZERADO', 'REPOSICAO', 'ADEQUADO'])
    expect(calcularMetricasEstoque(PECAS)).toMatchObject({
      totalItens: 3,
      totalUnidades: 10,
      valorCustoTotal: '800,00',
      valorVendaTotal: '1.360,00',
      itensAbaixoMinimo: 1,
      itensZerados: 1,
      itensReposicaoTotal: 2,
    })
  })

  it('filtra por nível e ordena por valor em estoque', () => {
    const base = { busca: '', categoria: 'TODAS', ordenacao: 'NOME_ASC' }
    expect(filtrarPosicaoEstoque(PECAS, { ...base, status: 'ALERTA_GERAL' }).map((p) => p.id)).toEqual(['b', 'a'])
    expect(filtrarPosicaoEstoque(PECAS, { ...base, status: 'ZERADO' }).map((p) => p.id)).toEqual(['a'])
    // b e c empatam em R$ 400 em estoque: a ordenação é estável e mantém a ordem original
    expect(filtrarPosicaoEstoque(PECAS, { ...base, status: 'TODOS', ordenacao: 'MAIOR_VALOR' }).map((p) => p.id)).toEqual(['b', 'c', 'a'])
    expect(filtrarPosicaoEstoque(PECAS, { ...base, status: 'TODOS', ordenacao: 'MENOR_ESTOQUE' }).map((p) => p.id)).toEqual(['a', 'b', 'c'])
    expect(filtrarPosicaoEstoque(PECAS, { ...base, status: 'TODOS', busca: 'susp' }).map((p) => p.id)).toEqual(['b'])
  })

  it('sugere reposição e monta a lista de compras', () => {
    const itens = calcularReposicaoEstoque(PECAS)
    expect(itens.map((i) => [i.id, i.sugestaoCompra, i.custoEstimado])).toEqual([
      ['a', 2, 800],
      ['b', 2, 400],
    ])
    const total = totalInvestimentoReposicao(itens)
    expect(total).toBe('1.200,00')
    expect(textoListaReposicao(itens, total)).toContain('Sugestão de Compra: *2 UN*')
  })

  it('filtra o Kardex por tipo e busca', () => {
    const movs = [
      { tipo: 'ENTRADA', pecaCodigo: 'BAT', documento: 'NF 1' },
      { tipo: 'SAIDA', pecaCodigo: 'COR', responsavel: 'Rafael' },
    ]
    expect(filtrarMovimentacoes(movs, { busca: 'rafael', tipo: 'TODOS' })).toHaveLength(1)
    expect(filtrarMovimentacoes(movs, { busca: '', tipo: 'ENTRADA' })[0].pecaCodigo).toBe('BAT')
  })
})

describe('Utilitários puros do cadastro de Cliente (Story 2.0 / Task 4)', () => {
  it('prepara o cliente para edição e detecta PJ pelo tamanho do documento', () => {
    const form = formDoCliente({ documento: '11.222.333/0001-81', cep: '86800000', veiculos: null }, '0000009')
    expect(form).toMatchObject({ codigoCliente: '0000009', tipoPessoa: 'J', cep: '86800-000', cidade: 'Apucarana', ativo: true, veiculos: [] })
  })

  it('valida o cliente na ordem nome, documento, dígitos e telefone', () => {
    const base = { tipoPessoa: 'F', nome: 'Ana', documento: '529.982.247-25', telefone: '(43) 9' }
    expect(validarCliente({ ...base, nome: ' ' }).mensagem).toBe('O nome do cliente é obrigatório.')
    expect(validarCliente({ ...base, documento: '' }).mensagem).toBe('Informe o CPF do cliente.')
    expect(validarCliente({ ...base, documento: '111.111.111-11' })).toEqual({
      tipo: 'error',
      mensagem: 'CPF inválido. Verifique os dígitos informados.',
    })
    expect(validarCliente({ ...base, telefone: '' }).tipo).toBe('warning')
    expect(validarCliente(base)).toBeNull()
  })

  it('valida e monta o veículo com placa normalizada', () => {
    expect(validarVeiculo({ placa: 'ABC1D23', marca: 'Fiat', modelo: '' })).toBe('Selecione ou informe o modelo do veículo.')
    const v = montarVeiculoCliente({ placa: ' abc-1234 ', marca: 'Fiat ', modelo: ' Uno', ano: '2010', cor: '', kmPadrao: '' }, '0000003')
    expect(v).toMatchObject({ placa: 'ABC-1234', marcaModelo: 'Fiat Uno', label: 'ABC-1234 - Fiat Uno (2010 - N/D)', combustivel: 'FLEX' })
    expect(v.id).toBe(v.value)
  })

  it('detecta dados preenchidos e filtra veículos', () => {
    expect(temDadosPreenchidos({ nome: '', documento: '', telefone: '', veiculos: [] })).toBe(false)
    expect(temDadosPreenchidos({ veiculos: [{}] })).toBe(true)
    expect(filtrarVeiculos([{ placa: 'AAA1111', marca: 'Fiat' }, { placa: 'BBB2222', modelo: 'Gol' }], ' GOL ')).toHaveLength(1)
  })
})
