// Dados, chaves de storage e utilitários do módulo PDV (Ponto de Venda)
// Regra: Sem uso do caractere proibido ('&'), apenas 'e'

export const CHAVE_STORAGE_VENDAS = 'dev_oficina_pdv_vendas'
export const CHAVE_STORAGE_NOTAS_FISCAIS = 'dev_oficina_notas_fiscais'
export const CHAVE_STORAGE_PDV_MODAL_PAGAMENTO = 'dev_oficina_pdv_modal_pagamento'

export const FORMAS_PAGAMENTO_OPCOES = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'debito', label: 'Cartão de Débito' },
  { value: 'credito', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto Bancário' },
]

export const PARCELAS_OPCOES = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  return { value: n, label: n === 1 ? 'À vista (1x)' : `${n}x sem juros` }
})

export const TIPO_NOTA_OPCOES = [
  { value: 'nfce', label: 'NFC-e (Cupom Fiscal Eletrônico)' },
  { value: 'nfe', label: 'NF-e (Nota Fiscal Eletrônica)' },
]

export function formatMoeda(valor) {
  return (Number(valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function carregarLista(chave) {
  try {
    const raw = localStorage.getItem(chave)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function salvarLista(chave, lista) {
  try {
    localStorage.setItem(chave, JSON.stringify(lista))
  } catch (e) {
    console.error('Erro ao salvar dados do PDV:', e)
  }
}

export function carregarVendasPDV() {
  return carregarLista(CHAVE_STORAGE_VENDAS)
}

export function carregarNotasFiscais() {
  return carregarLista(CHAVE_STORAGE_NOTAS_FISCAIS)
}

export function gerarNumeroVenda() {
  const vendas = carregarVendasPDV()
  const maiorNumero = vendas.reduce((max, v) => {
    const n = parseInt(String(v.numeroVenda || '0').replace(/\D/g, ''), 10) || 0
    return n > max ? n : max
  }, 5200)
  return String(maiorNumero + 1).padStart(6, '0')
}

export function gerarChaveAcessoMock() {
  return ''
}

export function gerarProtocoloMock() {
  return ''
}

export function calcularTotaisCarrinho(itens, descontoGeral = 0, tipoDescontoGeral = 'valor') {
  const subtotal = itens.reduce((acc, item) => {
    const bruto = (Number(item.quantidade) || 0) * (Number(item.precoUnitario) || 0)
    const descontoItem = Number(item.desconto) || 0
    return acc + Math.max(0, bruto - descontoItem)
  }, 0)

  const descontoGeralValor =
    tipoDescontoGeral === 'percentual'
      ? subtotal * (Math.min(100, Math.max(0, Number(descontoGeral) || 0)) / 100)
      : Math.max(0, Number(descontoGeral) || 0)

  const totalGeral = Math.max(0, subtotal - descontoGeralValor)

  return { subtotal, descontoGeralValor, totalGeral }
}

export function registrarVendaPDV(venda) {
  const vendas = carregarVendasPDV()
  vendas.unshift(venda)
  salvarLista(CHAVE_STORAGE_VENDAS, vendas)

  const notas = carregarNotasFiscais()
  notas.unshift({
    id: venda.id,
    numeroVenda: venda.numeroVenda,
    tipoNota: venda.tipoNota,
    numeroNota: venda.numeroNota,
    serie: venda.serie,
    chaveAcesso: venda.chaveAcesso,
    protocolo: venda.protocolo,
    dataEmissao: venda.dataHora,
    cliente: venda.cliente?.nome || 'Consumidor Final',
    documentoCliente: venda.documentoNota || '',
    valorTotal: venda.totalGeral,
    numeroOSVinculada: venda.numeroOSVinculada || null,
    status: 'emitida',
  })
  salvarLista(CHAVE_STORAGE_NOTAS_FISCAIS, notas)

  return venda
}
