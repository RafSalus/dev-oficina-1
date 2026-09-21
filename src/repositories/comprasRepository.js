import {
  carregarPedidosCompra,
  salvarPedidoCompra,
  excluirPedidoCompra,
  receberPedidoCompra,
  carregarCotacoes,
  salvarCotacao,
  excluirCotacao,
  obterCotacaoPorOS,
  aprovarCotacaoEGerarPedido,
} from '../constants/comprasData'

// --- PEDIDOS DE COMPRA ---

export async function carregarCompras() {
  return Promise.resolve(carregarPedidosCompra())
}

export async function obterCompraPorId(id) {
  const lista = carregarPedidosCompra()
  const found = lista.find((p) => String(p.id) === String(id) || String(p.numeroPedido) === String(id))
  return Promise.resolve(found || null)
}

export async function salvarCompra(dadosPedido) {
  const comId = {
    id: dadosPedido.id || `pc-${Date.now()}`,
    ...dadosPedido,
  }
  return Promise.resolve(salvarPedidoCompra(comId))
}

export async function excluirCompra(id) {
  return Promise.resolve(excluirPedidoCompra(id))
}

export async function receberCompraNoEstoque(id, params) {
  return Promise.resolve(receberPedidoCompra(id, params))
}

// --- COTAÇÕES DE AUTOPEÇAS ---

export async function buscarCotacoes() {
  return Promise.resolve(carregarCotacoes())
}

export async function obterCotacaoPorId(id) {
  const lista = carregarCotacoes()
  const found = lista.find((c) => String(c.id) === String(id) || String(c.numeroCotacao) === String(id))
  return Promise.resolve(found || null)
}

export async function salvarCotacaoAutodepecas(dadosCotacao) {
  const comId = {
    id: dadosCotacao.id || `cot-${Date.now()}`,
    ...dadosCotacao,
  }
  return Promise.resolve(salvarCotacao(comId))
}

export async function excluirCotacaoAutodepecas(id) {
  return Promise.resolve(excluirCotacao(id))
}

export async function buscarCotacaoPorOS(numeroOS) {
  return Promise.resolve(obterCotacaoPorOS(numeroOS))
}

export async function aprovarCotacaoEGerarPedidoCompra(cotacaoId, fornecedorId) {
  return Promise.resolve(aprovarCotacaoEGerarPedido(cotacaoId, fornecedorId))
}
