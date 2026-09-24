import { describe, it, expect } from 'vitest'
import {
  extrairTelefoneLimpo,
  filtrarFornecedoresAutoPecas,
  criarFornecedoresIniciais,
  calcularTotalRespostas,
  menorProposta,
} from '../../src/utils/compras/cotacaoHelpers'
import {
  calcularMetricasCompras,
  calcularItensReposicao,
  filtrarPedidos,
  filtrarCotacoes,
} from '../../src/utils/compras/comprasCalculos'
import { incluirDemandaNaCotacao, montarCotacaoAgrupada } from '../../src/utils/compras/cotacaoFabrica'
import { derivarStatusCotacao, resolverFornecedorVencedor, montarPedidoDaCotacao } from '../../src/utils/compras/cotacaoPedido'
import { textoPedidoCompra, linkWhatsAppCotacao } from '../../src/utils/compras/mensagensWhatsApp'

describe('Utilitários puros de Compras e Cotações (Story 2.0 / Task 2)', () => {
  it('extrai somente dígitos do WhatsApp e usa fallback para números curtos', () => {
    expect(extrairTelefoneLimpo({ whatsapp: '(43) 98888-7777' })).toBe('43988887777')
    expect(extrairTelefoneLimpo({ telefone: '123' })).toBe('43998544106')
    expect(extrairTelefoneLimpo(null)).toBe('43998544106')
  })

  it('prioriza autopeças e limita os fornecedores iniciais a 3', () => {
    const terceiros = [
      { id: 'a', categoria: 'Retífica' },
      { id: 'b', ramoAtividade: 'Distribuidora de Peças' },
      { id: 'c', categoria: 'Auto Peças' },
      { id: 'd', categoria: 'Peça usada' },
      { id: 'e', categoria: 'Autopeças' },
    ]
    expect(filtrarFornecedoresAutoPecas(terceiros).map((t) => t.id)).toEqual(['b', 'c', 'd', 'e'])
    const iniciais = criarFornecedoresIniciais(terceiros, 'Parceira')
    expect(iniciais.map((f) => f.id)).toEqual(['b', 'c', 'd'])
    expect(iniciais[0]).toMatchObject({ nome: 'Parceira', status: 'AGUARDANDO', valorTotal: null })
    expect(criarFornecedoresIniciais([])).toEqual([])
  })

  it('soma preço x quantidade ignorando preços vazios ou inválidos', () => {
    const itens = [
      { id: '1', quantidade: 2 },
      { id: '2', quantidade: 1 },
      { id: '3', quantidade: 5 },
    ]
    expect(calcularTotalRespostas(itens, { 1: { preco: '10' }, 2: { preco: '' }, 3: { preco: 'abc' } })).toBe(20)
  })

  it('calcula métricas e sugestão de reposição', () => {
    const metricas = calcularMetricasCompras({
      pedidos: [
        { status: 'AGUARDANDO_ENTREGA', valorTotal: 100 },
        { status: 'RECEBIDO', valorTotal: 1234.5 },
      ],
      cotacoes: [{ status: 'EM_COTACAO' }, { status: 'APROVADA' }],
      demandasOS: [{ precisaComprar: true }, { precisaComprar: false }],
      pecasCatalogo: [{ estoqueAtual: 0, estoqueMinimo: 2 }],
    })
    expect(metricas).toEqual({
      pedidosEmAberto: 1,
      cotacoesAtivas: 1,
      demandasPendentes: 1,
      valorEmAberto: '100,00',
      itensAbaixoMinimo: 1,
      valorRecebidoTotal: '1.234,50',
    })

    const [item] = calcularItensReposicao([{ id: 'p', estoqueAtual: 1, estoqueMinimo: 3, precoCusto: 10 }])
    expect(item).toMatchObject({ atual: 1, min: 3, deficit: 2, sugestao: 5, custoTotal: 50 })
  })

  it('filtra pedidos e cotações por busca e status', () => {
    const pedidos = [
      { numeroPedido: 'PC-1', fornecedorNome: 'Norte', status: 'RECEBIDO', fornecedorId: 'f1' },
      { numeroPedido: 'PC-2', fornecedorNome: 'Sul', status: 'AGUARDANDO_ENTREGA', fornecedorId: 'f2' },
    ]
    expect(filtrarPedidos(pedidos, { busca: 'sul', status: 'TODOS', fornecedorId: 'TODOS' })).toHaveLength(1)
    expect(filtrarPedidos(pedidos, { busca: '', status: 'RECEBIDO', fornecedorId: 'f2' })).toHaveLength(0)

    const cotacoes = [{ id: 'COT-1', status: 'EM_COTACAO', itens: [{ nome: 'Correia', marcaSugerida: 'Gates' }] }]
    expect(filtrarCotacoes(cotacoes, { busca: 'gates', status: 'TODOS' })).toHaveLength(1)
    expect(filtrarCotacoes(cotacoes, { busca: '', status: 'APROVADA' })).toHaveLength(0)
  })

  it('não duplica a peça da demanda numa cotação existente', () => {
    const cotacao = { id: 'C', itens: [{ nome: 'Pastilha', codigo: 'P1' }] }
    expect(incluirDemandaNaCotacao(cotacao, { itemNome: 'PASTILHA', itemCodigo: 'X' }).alterada).toBe(false)
    const { cotacao: nova, alterada } = incluirDemandaNaCotacao(cotacao, {
      itemNome: 'Disco',
      itemCodigo: 'SEM CODIGO',
      numeroOS: '9',
    })
    expect(alterada).toBe(true)
    expect(nova.itens[1]).toMatchObject({ nome: 'Disco', codigo: '', observacoes: 'Solicitado na OS #9' })
  })

  it('só preenche o veículo da cotação agrupada quando todas as demandas são da mesma OS', () => {
    const d = (numeroOS) => ({ numeroOS, veiculoPlaca: `PL-${numeroOS}`, itemNome: 'X', itemCodigo: 'SEM CODIGO' })
    expect(montarCotacaoAgrupada({ id: 'C1', demandas: [d('1'), d('1')], terceiros: [] }).veiculoPlaca).toBe('PL-1')
    expect(montarCotacaoAgrupada({ id: 'C2', demandas: [d('1'), d('2')], terceiros: [] }).veiculoPlaca).toBe('')
  })

  it('resolve vencedor, status e pedido gerado a partir da cotação', () => {
    const fornecedores = [
      { id: 'a', nome: 'A', status: 'RESPONDIDA', valorTotal: 50, respostasItens: { i1: { preco: '25', marca: 'Bosch' } } },
      { id: 'b', nome: 'B', status: 'RESPONDIDA', valorTotal: 40, respostasItens: {} },
    ]
    expect(menorProposta(fornecedores).id).toBe('b')
    expect(resolverFornecedorVencedor(fornecedores, null).id).toBe('b')
    expect(resolverFornecedorVencedor(fornecedores, 'a').id).toBe('a')
    expect(derivarStatusCotacao(fornecedores, null)).toBe('RESPONDIDA')
    expect(derivarStatusCotacao([], 'a')).toBe('APROVADA')

    const pedido = montarPedidoDaCotacao(
      { id: 'C', numeroOS: '', itens: [{ id: 'i1', nome: 'Vela', quantidade: 2 }] },
      fornecedores[0]
    )
    expect(pedido.origemTipo).toBe('REPOSICAO_ESTOQUE')
    expect(pedido.itens[0]).toMatchObject({ precoCusto: 25, valorTotal: 50, marca: 'Bosch', unidade: 'UN' })
  })

  it('monta o texto do pedido e o link de WhatsApp da cotação', () => {
    const texto = textoPedidoCompra({
      numeroPedido: 'PC-9',
      fornecedorNome: 'Norte',
      dataEmissao: '2026-09-20T12:00:00.000Z',
      itens: [{ codigo: 'X1', nome: 'Filtro', quantidade: 2 }],
      valorTotal: 30,
    })
    expect(texto).toContain('Pedido: *PC-9*')
    expect(texto).toContain('1. [X1] Filtro - Qtd: *2 UN*')
    expect(texto).toContain('Valor Total: R$ 30.00')

    const link = linkWhatsAppCotacao('43988887777', { nome: 'Norte' }, { itens: [] }, 'http://x/cotacao/C1')
    expect(link.startsWith('https://wa.me/5543988887777?text=')).toBe(true)
    expect(link).toContain('http://x/cotacao/C1')
  })
})
