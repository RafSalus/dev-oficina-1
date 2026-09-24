import { describe, it, expect } from 'vitest'
import {
  filtrarOrdensAbertas,
  filtrarOrdensFinalizadas,
  calcularMetricasAbertas,
  calcularMetricasFinalizadas,
} from '../../src/utils/ordemServico/osListaCalculos'
import { montarPecaRapida, montarTerceiroRapido, valorLiquidoTerceiro, opcoesParceirosTerceirizados } from '../../src/utils/ordemServico/osItensRapidos'
import { formatMoeda, urlWhatsApp, mensagemItemAdicional } from '../../src/utils/ordemServico/osMensagens'
import { montarAbasPainel } from '../../src/components/ordem-servico/painel/painelOSConfig'

describe('Utilitários puros de Ordem de Serviço (Story 2.0 / Task 3)', () => {
  const ordens = [
    { numeroOS: '1', status: 'fila', prioridade: 'urgente', cliente: 'Ana', valorTotal: 100 },
    { numeroOS: '2', status: 'fila', prioridade: 'normal', cliente: 'Beto', relatoCliente: 'freio chiando', valorTotal: 50 },
    { numeroOS: '3', status: 'aguardando_pecas', prioridade: 'normal', cliente: 'Caio', valorTotal: '25.5' },
  ]

  it('filtra OS abertas por status, prioridade e busca na queixa', () => {
    expect(filtrarOrdensAbertas(ordens, { busca: '', status: 'fila', prioridade: 'todas' })).toHaveLength(2)
    expect(filtrarOrdensAbertas(ordens, { busca: '', status: 'todos', prioridade: 'urgente' })).toHaveLength(1)
    expect(filtrarOrdensAbertas(ordens, { busca: 'FREIO', status: 'todos', prioridade: 'todas' })[0].numeroOS).toBe('2')
    expect(filtrarOrdensFinalizadas([{ notaFiscal: 'NFS-e 77' }], '77')).toHaveLength(1)
  })

  it('calcula métricas das OS abertas e arquivadas', () => {
    expect(calcularMetricasAbertas(ordens)).toMatchObject({ totalAbertas: 3, naFila: 2, aguardandoPecas: 1, somaValorTotal: 175.5 })
    expect(calcularMetricasFinalizadas([{ valorTotal: 300, totalPecas: 200 }, { valorTotal: 100 }])).toMatchObject({
      total: 2,
      ticketMedio: 200,
      somaPecas: 200,
      garantiasAtivas: 2,
    })
    expect(calcularMetricasFinalizadas([]).ticketMedio).toBe(0)
  })

  it('manda para cotação a peça sem cadastro ou sem saldo suficiente', () => {
    const cadastro = { codigo: 'P1', nome: 'Filtro', estoqueAtual: 2, precoVenda: 30, unidade: 'UN' }
    const comSaldo = montarPecaRapida({ peca: cadastro }, '2')
    expect(comSaldo.paraCotacao).toBe(false)
    expect(comSaldo.item).toMatchObject({ precoUnitario: 30, statusEstoque: 'em_estoque', fornecedorNome: 'Estoque Interno' })

    expect(montarPecaRapida({ peca: cadastro }, '3').item).toMatchObject({ precoUnitario: 0, statusEstoque: 'para_cotacao' })
    const avulsa = montarPecaRapida({ value: 'Junta do cabeçote', label: 'Junta do cabeçote' }, '1')
    expect(avulsa).toMatchObject({ nome: 'Junta do cabeçote', paraCotacao: true })
    expect(avulsa.item.codigo).toBe('A COTAR')
    expect(montarPecaRapida(null, '1').nome).toBe('')
  })

  it('monta o terceiro e calcula o valor líquido', () => {
    const item = montarTerceiroRapido({ descricao: ' Retífica ', selecao: null, quantidade: '2', valor: 150 })
    expect(item).toMatchObject({ nome: 'Retífica', parceiroNome: 'Parceiro a definir', quantidade: 2, valorVenda: 150 })
    expect(valorLiquidoTerceiro({ valorVenda: 100, quantidade: 1, desconto: 150 })).toBe(0)

    const parceiros = opcoesParceirosTerceirizados([
      { id: 'a', nomeFantasia: 'Retífica X', categoriaFornecedor: 'Serviços Externos', tipoServico: 'Motor' },
      { id: 'b', nomeFantasia: 'Autopeças Y', categoriaFornecedor: 'Autopeças' },
    ])
    expect(parceiros).toEqual([expect.objectContaining({ value: 'a', label: 'Retífica X • Motor' })])
  })

  it('formata moeda e monta links de WhatsApp com e sem telefone', () => {
    expect(formatMoeda('1234.5')).toBe('1.234,50')
    expect(formatMoeda(undefined)).toBe('0,00')
    expect(urlWhatsApp('(43) 9999-1111', 'oi')).toBe('https://api.whatsapp.com/send?phone=554399991111&text=oi')
    expect(urlWhatsApp('', 'oi')).toBe('https://api.whatsapp.com/send?text=oi')
    expect(mensagemItemAdicional({ cliente: 'Ana', numeroOS: '9' }, 'Pneu', 'opcional', 'L')).toContain('*melhoria*')
  })

  it('mostra a aba da etapa atual além das abas fixas', () => {
    expect(montarAbasPainel({ status: 'fila' }).map((a) => a.id)).toEqual(['resumo', 'itens', 'vistoria'])
    const abas = montarAbasPainel({ status: 'pronto_retirada', pecasOS: [{}], servicosOS: [{}, {}] })
    expect(abas.map((a) => a.id)).toEqual(['resumo', 'itens', 'vistoria', 'execucao'])
    expect(abas[1].label).toBe('Itens (3)')
  })
})
