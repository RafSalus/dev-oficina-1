import { getSupabaseDataClient } from '../lib/supabase'
import { executarRepositorio, executarOperacao } from './supabaseHelpers'
import {
  mapearPedidoParaDominio,
  mapearPedidoParaDb,
  mapearCotacaoParaDominio,
  mapearCotacaoParaDb,
} from './mapeadores/compras'
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

// ==============================================================================
// PEDIDOS DE COMPRA
// ==============================================================================

export async function carregarCompras() {
  return executarRepositorio({
    contexto: { entidade: 'compras_pedidos', operacao: 'carregar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('compras_pedidos').select('*').order('created_at', { ascending: false }),
        { entidade: 'compras_pedidos', operacao: 'carregar' }
      )
      return (data || []).map(mapearPedidoParaDominio)
    },
    local: () => carregarPedidosCompra(),
  })
}

export async function obterCompraPorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    contexto: { entidade: 'compras_pedidos', operacao: 'obterPorId' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('compras_pedidos').select('*').or(`id.eq.${id},numero_pedido.eq.${id}`).maybeSingle(),
        { entidade: 'compras_pedidos', operacao: 'obterPorId' }
      )
      return data ? mapearPedidoParaDominio(data) : null
    },
    local: () => {
      const lista = carregarPedidosCompra()
      const found = lista.find((p) => String(p.id) === String(id) || String(p.numeroPedido) === String(id))
      return found || null
    },
  })
}

export async function salvarCompra(dadosPedido) {
  return executarRepositorio({
    contexto: { entidade: 'compras_pedidos', operacao: 'salvar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearPedidoParaDb(dadosPedido)

      const query = payload.id
        ? supabase.from('compras_pedidos').upsert(payload).select().single()
        : supabase.from('compras_pedidos').insert(payload).select().single()

      const data = await executarOperacao(query, { entidade: 'compras_pedidos', operacao: 'salvar' })
      return mapearPedidoParaDominio(data)
    },
    local: () => {
      const comId = {
        id: dadosPedido.id || `pc-${Date.now()}`,
        ...dadosPedido,
      }
      return salvarPedidoCompra(comId)
    },
  })
}

export async function excluirCompra(id) {
  return executarRepositorio({
    contexto: { entidade: 'compras_pedidos', operacao: 'excluir' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      await executarOperacao(
        supabase.from('compras_pedidos').delete().eq('id', id),
        { entidade: 'compras_pedidos', operacao: 'excluir' }
      )
      return true
    },
    local: () => excluirPedidoCompra(id),
  })
}

export async function receberCompraNoEstoque(id, params = {}) {
  return executarRepositorio({
    contexto: { entidade: 'compras_pedidos', operacao: 'receber' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.rpc('receber_pedido_compra', {
          p_pedido_id: id,
          p_documento: params?.documento || null,
        }),
        { entidade: 'compras_pedidos', operacao: 'receber' }
      )
      return mapearPedidoParaDominio(data)
    },
    local: () => receberPedidoCompra(id, params),
  })
}

// ==============================================================================
// COTAÇÕES DE AUTOPEÇAS
// ==============================================================================

export async function buscarCotacoes() {
  return executarRepositorio({
    contexto: { entidade: 'compras_cotacoes', operacao: 'buscar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('compras_cotacoes').select('*').order('created_at', { ascending: false }),
        { entidade: 'compras_cotacoes', operacao: 'buscar' }
      )
      return (data || []).map(mapearCotacaoParaDominio)
    },
    local: () => carregarCotacoes(),
  })
}

export async function obterCotacaoPorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    contexto: { entidade: 'compras_cotacoes', operacao: 'obterPorId' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('compras_cotacoes').select('*').or(`id.eq.${id},numero_cotacao.eq.${id}`).maybeSingle(),
        { entidade: 'compras_cotacoes', operacao: 'obterPorId' }
      )
      return data ? mapearCotacaoParaDominio(data) : null
    },
    local: () => {
      const lista = carregarCotacoes()
      const found = lista.find((c) => String(c.id) === String(id) || String(c.numeroCotacao) === String(id))
      return found || null
    },
  })
}

export async function salvarCotacaoAutodepecas(dadosCotacao) {
  return executarRepositorio({
    contexto: { entidade: 'compras_cotacoes', operacao: 'salvar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearCotacaoParaDb(dadosCotacao)

      const query = payload.id
        ? supabase.from('compras_cotacoes').upsert(payload).select().single()
        : supabase.from('compras_cotacoes').insert(payload).select().single()

      const data = await executarOperacao(query, { entidade: 'compras_cotacoes', operacao: 'salvar' })
      return mapearCotacaoParaDominio(data)
    },
    local: () => {
      const comId = {
        id: dadosCotacao.id || `cot-${Date.now()}`,
        ...dadosCotacao,
      }
      return salvarCotacao(comId)
    },
  })
}

export async function excluirCotacaoAutodepecas(id) {
  return executarRepositorio({
    contexto: { entidade: 'compras_cotacoes', operacao: 'excluir' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      await executarOperacao(
        supabase.from('compras_cotacoes').delete().eq('id', id),
        { entidade: 'compras_cotacoes', operacao: 'excluir' }
      )
      return true
    },
    local: () => excluirCotacao(id),
  })
}

export async function buscarCotacaoPorOS(numeroOS) {
  if (!numeroOS) return Promise.resolve(null)

  return executarRepositorio({
    contexto: { entidade: 'compras_cotacoes', operacao: 'buscarPorOS' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase
          .from('compras_cotacoes')
          .select('*')
          .eq('ordem_servico_ref', String(numeroOS))
          .neq('status', 'cancelada')
          .order('created_at', { ascending: false })
          .limit(1),
        { entidade: 'compras_cotacoes', operacao: 'buscarPorOS' }
      )
      return data && data.length > 0 ? mapearCotacaoParaDominio(data[0]) : null
    },
    local: () => obterCotacaoPorOS(numeroOS),
  })
}

export async function aprovarCotacaoEGerarPedidoCompra(cotacaoId, fornecedorId) {
  return executarRepositorio({
    contexto: { entidade: 'compras_cotacoes', operacao: 'aprovarCotacao' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.rpc('aprovar_cotacao_gerar_pedido', {
          p_cotacao_id: cotacaoId,
          p_fornecedor_id: fornecedorId,
        }),
        { entidade: 'compras_cotacoes', operacao: 'aprovarCotacao' }
      )
      return {
        cotacao: mapearCotacaoParaDominio(data?.cotacao),
        pedido: mapearPedidoParaDominio(data?.pedido),
      }
    },
    local: () => aprovarCotacaoEGerarPedido(cotacaoId, fornecedorId),
  })
}
