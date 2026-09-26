/**
 * Operações remotas Supabase para Ordens de Serviço (Story 2.14 / ADR-005).
 * Fail-closed, checagem de updated_at (CONFLITO_EDICAO) e RPCs de baixa de estoque.
 */

import { getSupabaseDataClient } from '../lib/supabase'
import { executarOperacao } from './supabaseHelpers'
import { ErroRepositorio, CODIGOS_ERRO } from './erroRepositorio'
import {
  mapearOrdemServicoParaDominio,
  mapearOrdemServicoParaDb,
} from './mapeadores/ordensServico'

const STATUS_FINALIZADOS = ['finalizada', 'cancelada']

export async function carregarOrdensServicoRemoto({ filtro = 'todas' } = {}) {
  const supabase = getSupabaseDataClient()
  let query = supabase.from('ordens_servico').select('*')

  if (filtro === 'abertas') {
    query = query.not('status', 'in', `(${STATUS_FINALIZADOS.join(',')})`)
  } else if (filtro === 'finalizadas') {
    query = query.in('status', STATUS_FINALIZADOS)
  }

  query = query.order('created_at', { ascending: false })

  const data = await executarOperacao(query, {
    entidade: 'ordens_servico',
    operacao: 'carregar',
  })

  return (data || []).map(mapearOrdemServicoParaDominio)
}

export async function obterOrdemServicoPorIdRemoto(idOuNumeroOS) {
  if (!idOuNumeroOS) return null
  const supabase = getSupabaseDataClient()

  // Tenta por id primeiro; se não encontrar, tenta por numero_os
  let query = supabase.from('ordens_servico').select('*').eq('id', idOuNumeroOS).maybeSingle()
  let data = await executarOperacao(query, { entidade: 'ordens_servico', operacao: 'obterPorId' })

  if (!data) {
    query = supabase.from('ordens_servico').select('*').eq('numero_os', idOuNumeroOS).maybeSingle()
    data = await executarOperacao(query, { entidade: 'ordens_servico', operacao: 'obterPorNumeroOS' })
  }

  return data ? mapearOrdemServicoParaDominio(data) : null
}

export async function salvarOrdemServicoRemoto(osData) {
  const supabase = getSupabaseDataClient()
  const payload = mapearOrdemServicoParaDb(osData)

  if (payload.id) {
    let query = supabase.from('ordens_servico').update(payload).eq('id', payload.id)
    if (osData.updatedAt) {
      query = query.eq('updated_at', osData.updatedAt)
    }

    const data = await executarOperacao(query.select().maybeSingle(), {
      entidade: 'ordens_servico',
      operacao: 'atualizar',
    })

    if (!data && osData.updatedAt) {
      throw new ErroRepositorio(
        CODIGOS_ERRO.CONFLITO_EDICAO,
        'A Ordem de Serviço foi alterada por outro usuário. Recarregue os dados e tente novamente.'
      )
    }

    return mapearOrdemServicoParaDominio(data)
  }

  // Novo registro (INSERT)
  const data = await executarOperacao(
    supabase.from('ordens_servico').insert(payload).select().single(),
    { entidade: 'ordens_servico', operacao: 'inserir' }
  )

  return mapearOrdemServicoParaDominio(data)
}

export async function transicionarStatusOSRemoto(osIdOuNumero, novoStatus, updatedAtEsperado) {
  const supabase = getSupabaseDataClient()
  let query = supabase
    .from('ordens_servico')
    .update({ status: novoStatus, updated_at: new Date().toISOString() })

  // Suporta busca por ID ou por numero_os
  if (osIdOuNumero.length > 10 || osIdOuNumero.includes('-')) {
    query = query.eq('id', osIdOuNumero)
  } else {
    query = query.eq('numero_os', osIdOuNumero)
  }

  if (updatedAtEsperado) {
    query = query.eq('updated_at', updatedAtEsperado)
  }

  const data = await executarOperacao(query.select().maybeSingle(), {
    entidade: 'ordens_servico',
    operacao: 'transicionarStatus',
  })

  if (!data && updatedAtEsperado) {
    throw new ErroRepositorio(
      CODIGOS_ERRO.CONFLITO_EDICAO,
      'Conflito de edição: a Ordem de Serviço foi atualizada concorrentemente.'
    )
  }

  return data ? mapearOrdemServicoParaDominio(data) : null
}

export async function vincularMecanicoOSRemoto(osIdOuNumero, mecanicoId, mecanicoNome, updatedAtEsperado) {
  const supabase = getSupabaseDataClient()
  let query = supabase
    .from('ordens_servico')
    .update({ mecanico_id: mecanicoId, mecanico_nome: mecanicoNome, updated_at: new Date().toISOString() })

  if (osIdOuNumero.length > 10 || osIdOuNumero.includes('-')) {
    query = query.eq('id', osIdOuNumero)
  } else {
    query = query.eq('numero_os', osIdOuNumero)
  }

  if (updatedAtEsperado) {
    query = query.eq('updated_at', updatedAtEsperado)
  }

  const data = await executarOperacao(query.select().maybeSingle(), {
    entidade: 'ordens_servico',
    operacao: 'vincularMecanico',
  })

  if (!data && updatedAtEsperado) {
    throw new ErroRepositorio(
      CODIGOS_ERRO.CONFLITO_EDICAO,
      'Conflito de edição: a Ordem de Serviço foi atribuída ou modificada concorrentemente.'
    )
  }

  return data ? mapearOrdemServicoParaDominio(data) : null
}

export async function aplicarPecaNaOSRemoto(osId, itemId, pecaId, quantidade) {
  const supabase = getSupabaseDataClient()
  const { data, error } = await supabase.rpc('aplicar_peca_na_os', {
    os_id: osId,
    item_id: itemId,
    peca_id: pecaId,
    quantidade: parseInt(quantidade, 10),
  })

  if (error) {
    throw new ErroRepositorio(
      CODIGOS_ERRO.OPERACAO_INVALIDA,
      `Erro ao aplicar peça na OS: ${error.message}`,
      error
    )
  }

  return data
}

export async function devolverPecaDaOSRemoto(osId, itemId, pecaId, quantidade) {
  const supabase = getSupabaseDataClient()
  const { data, error } = await supabase.rpc('devolver_peca_da_os', {
    os_id: osId,
    item_id: itemId,
    peca_id: pecaId,
    quantidade: parseInt(quantidade, 10),
  })

  if (error) {
    throw new ErroRepositorio(
      CODIGOS_ERRO.OPERACAO_INVALIDA,
      `Erro ao devolver peça ao estoque: ${error.message}`,
      error
    )
  }

  return data
}
