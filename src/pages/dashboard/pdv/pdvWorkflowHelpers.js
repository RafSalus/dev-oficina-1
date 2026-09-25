import {
  carregarPecasCadastradas,
  registrarMovimentacaoEstoque,
} from '../../../constants/cadastrosSuprimentosData'
import {
  FORMAS_PAGAMENTO_OPCOES,
  gerarChaveAcessoMock,
  gerarNumeroVenda,
  gerarProtocoloMock,
} from './pdvData'

let seqUid = 0
export function proximoUid(prefixo) {
  seqUid += 1
  return `${prefixo}-${Date.now()}-${seqUid}`
}

export function resumoFormasPagamento(formasPagamento) {
  return (formasPagamento || [])
    .map((f) => {
      const opcao = FORMAS_PAGAMENTO_OPCOES.find((o) => o.value === f.metodo)
      const parcela = (f.metodo === 'credito' || f.metodo === 'boleto') && f.parcelas > 1 ? ` ${f.parcelas}x` : ''
      return `${opcao?.label || f.metodo}${parcela}`
    })
    .join(' + ')
}

/**
 * Converte peças, serviços e terceiros de uma OS aprovada para itens do carrinho do PDV.
 */
export function converterOSParaItensCarrinho(os) {
  return [
    ...(os.pecasOS || []).map((p) => ({
      uid: proximoUid('os-peca'),
      tipo: 'peca',
      origemOS: true,
      codigo: p.codigo,
      nome: p.nome,
      unidade: p.unidade || 'UN',
      quantidade: Number(p.quantidade) || 1,
      precoUnitario: Number(p.precoUnitario) || 0,
      desconto: Number(p.desconto) || 0,
      pecaId: null,
    })),
    ...(os.servicosOS || []).map((s) => ({
      uid: proximoUid('os-servico'),
      tipo: 'servico',
      origemOS: true,
      codigo: s.codigo,
      nome: s.nome,
      unidade: s.unidade || 'MO',
      quantidade: Number(s.quantidade) || 1,
      precoUnitario: Number(s.precoUnitario ?? s.valorUnitario) || 0,
      desconto: Number(s.desconto) || 0,
    })),
    ...(os.terceirosOS || []).map((t) => ({
      uid: proximoUid('os-terceiro'),
      tipo: 'terceiro',
      origemOS: true,
      codigo: t.codigo || '—',
      nome: `${t.nome}${t.parceiroNome ? ` (${t.parceiroNome})` : ''}`,
      unidade: 'SV',
      quantidade: Number(t.quantidade) || 1,
      precoUnitario: Number(t.valorVenda ?? t.precoUnitario) || 0,
      desconto: Number(t.desconto) || 0,
    })),
  ]
}

/**
 * Baixa estoque das peças vendidas (avulsas ou associadas à OS).
 */
export function baixarEstoqueItensVendidos(itens, osVinculada) {
  const catalogo = carregarPecasCadastradas()
  itens
    .filter((item) => item.tipo === 'peca')
    .forEach((item) => {
      const pecaCatalogo = item.pecaId
        ? catalogo.find((p) => p.id === item.pecaId)
        : catalogo.find((p) => p.codigo === item.codigo)
      if (!pecaCatalogo) return
      try {
        registrarMovimentacaoEstoque({
          pecaId: pecaCatalogo.id,
          tipo: 'SAIDA',
          quantidade: item.quantidade,
          motivo: item.origemOS ? 'Aplicação em Ordem de Serviço' : 'Venda de Balcão (PDV)',
          documento: osVinculada ? `OS #${osVinculada.numeroOS}` : 'Venda Avulsa PDV',
          responsavel: 'Operador do PDV',
        })
      } catch {
        // Ignora se não houver saldo sem travar venda
      }
    })
  window.dispatchEvent(new Event('dev_oficina_estoque_updated'))
}

/**
 * Monta o registro de venda finalizada.
 */
export function construirVendaPDV({
  itensCarrinho,
  totais,
  clienteInfo,
  veiculoInfo,
  osVinculada,
  formasPagamento,
  tipoNota,
  documentoNota,
  troco,
}) {
  const numero = gerarNumeroVenda()
  return {
    id: proximoUid('venda'),
    numeroVenda: numero,
    numeroNota: numero,
    serie: '001',
    tipoNota,
    documentoNota,
    dataHora: new Date().toLocaleString('pt-BR'),
    cliente: clienteInfo,
    veiculo: veiculoInfo,
    numeroOSVinculada: osVinculada?.numeroOS || null,
    itens: itensCarrinho,
    subtotal: totais.subtotal,
    descontoGeralValor: totais.descontoGeralValor,
    totalGeral: totais.totalGeral,
    formasPagamento,
    troco,
    chaveAcesso: gerarChaveAcessoMock(),
    protocolo: gerarProtocoloMock(),
  }
}
