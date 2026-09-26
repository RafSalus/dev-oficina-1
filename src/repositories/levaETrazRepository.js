/**
 * Repositório assíncrono de Leva e Traz e Frota de Apoio — Story 2.12 / ADR-005.
 * Gravação com códigos por SEQUENCE, concorrência otimista (updated_at) e RLS FR25.
 */

import { getSupabaseDataClient } from '../lib/supabase'
import { executarRepositorio, executarOperacao } from './supabaseHelpers'
import { ErroRepositorio, CODIGOS_ERRO } from './erroRepositorio'
import {
  mapearFrotaApoioParaDominio,
  mapearFrotaApoioParaDb,
  mapearDeslocamentoParaDominio,
  mapearDeslocamentoParaDb,
} from './mapeadores/levaETraz'
import {
  carregarDeslocamentos as carregarDeslocamentosLocal,
  carregarVeiculosDeApoio as carregarVeiculosDeApoioLocal,
  criarNovoDeslocamento as criarNovoDeslocamentoLocal,
  atualizarDeslocamento as atualizarDeslocamentoLocal,
  iniciarDeslocamento as iniciarDeslocamentoLocal,
  finalizarDeslocamento as finalizarDeslocamentoLocal,
  cancelarDeslocamento as cancelarDeslocamentoLocal,
  excluirDeslocamento as excluirDeslocamentoLocal,
  criarVeiculoApoio as criarVeiculoApoioLocal,
  atualizarVeiculoApoio as atualizarVeiculoApoioLocal,
  excluirVeiculoApoio as excluirVeiculoApoioLocal,
} from '../constants/mockLevaETraz'

// ==============================================================================
// FROTA DE APOIO
// ==============================================================================

export async function carregarVeiculosDeApoio() {
  return executarRepositorio({
    contexto: { entidade: 'frota_apoio', operacao: 'carregar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('frota_apoio').select('*').order('codigo', { ascending: true }),
        { entidade: 'frota_apoio', operacao: 'carregar' }
      )
      return (data || []).map(mapearFrotaApoioParaDominio)
    },
    local: () => carregarVeiculosDeApoioLocal(),
  })
}

export async function obterVeiculoDeApoioPorId(id) {
  if (!id) return Promise.resolve(null)
  return executarRepositorio({
    contexto: { entidade: 'frota_apoio', operacao: 'obterPorId' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('frota_apoio').select('*').eq('id', id).maybeSingle(),
        { entidade: 'frota_apoio', operacao: 'obterPorId' }
      )
      return data ? mapearFrotaApoioParaDominio(data) : null
    },
    local: () => {
      const lista = carregarVeiculosDeApoioLocal()
      return lista.find((v) => String(v.id) === String(id)) || null
    },
  })
}

export async function criarVeiculoApoio(dados) {
  return executarRepositorio({
    contexto: { entidade: 'frota_apoio', operacao: 'criar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearFrotaApoioParaDb(dados)
      delete payload.id
      delete payload.codigo // Gerado por trigger/sequence no Postgres!

      const data = await executarOperacao(
        supabase.from('frota_apoio').insert(payload).select().single(),
        { entidade: 'frota_apoio', operacao: 'criar' }
      )
      return mapearFrotaApoioParaDominio(data)
    },
    local: () => criarVeiculoApoioLocal(dados),
  })
}

export async function atualizarVeiculoApoio(idOuObjeto, dados = null, updatedAtLido = null) {
  const id = typeof idOuObjeto === 'object' ? idOuObjeto.id : idOuObjeto
  const payloadDados = typeof idOuObjeto === 'object' ? idOuObjeto : (dados || {})
  const updatedAt = typeof idOuObjeto === 'object' ? (idOuObjeto.updatedAt || updatedAtLido) : updatedAtLido

  return executarRepositorio({
    contexto: { entidade: 'frota_apoio', operacao: 'atualizar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearFrotaApoioParaDb({ ...payloadDados, id })

      let query = supabase.from('frota_apoio').update(payload).eq('id', id)
      if (updatedAt) {
        query = query.eq('updated_at', updatedAt)
      }

      const { data, error } = await query.select()
      if (error) throw error
      if (!data || data.length === 0) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.CONFLITO_EDICAO,
          'Veículo de apoio foi modificado concorrentemente.',
          { contexto: { entidade: 'frota_apoio', operacao: 'atualizar' } }
        )
      }
      return mapearFrotaApoioParaDominio(data[0])
    },
    local: () => atualizarVeiculoApoioLocal({ ...payloadDados, id }),
  })
}

export async function excluirVeiculoApoio(id) {
  return executarRepositorio({
    contexto: { entidade: 'frota_apoio', operacao: 'excluir' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      await executarOperacao(
        supabase.from('frota_apoio').delete().eq('id', id),
        { entidade: 'frota_apoio', operacao: 'excluir' }
      )
      return true
    },
    local: () => {
      excluirVeiculoApoioLocal(id)
      return true
    },
  })
}

// ==============================================================================
// DESLOCAMENTOS LEVA E TRAZ
// ==============================================================================

export async function carregarDeslocamentos() {
  return executarRepositorio({
    contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'carregar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('leva_e_traz_deslocamentos').select('*').order('created_at', { ascending: false }),
        { entidade: 'leva_e_traz_deslocamentos', operacao: 'carregar' }
      )
      return (data || []).map(mapearDeslocamentoParaDominio)
    },
    local: () => carregarDeslocamentosLocal(),
  })
}

export async function obterDeslocamentoPorId(id) {
  if (!id) return Promise.resolve(null)
  return executarRepositorio({
    contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'obterPorId' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('leva_e_traz_deslocamentos').select('*').eq('id', id).maybeSingle(),
        { entidade: 'leva_e_traz_deslocamentos', operacao: 'obterPorId' }
      )
      return data ? mapearDeslocamentoParaDominio(data) : null
    },
    local: () => {
      const lista = carregarDeslocamentosLocal()
      return lista.find((d) => String(d.id) === String(id)) || null
    },
  })
}

export async function criarNovoDeslocamento(dados) {
  return executarRepositorio({
    contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'criar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearDeslocamentoParaDb(dados)
      delete payload.id
      delete payload.codigo // Gerado por trigger/sequence no Postgres!

      const data = await executarOperacao(
        supabase.from('leva_e_traz_deslocamentos').insert(payload).select().single(),
        { entidade: 'leva_e_traz_deslocamentos', operacao: 'criar' }
      )
      return mapearDeslocamentoParaDominio(data)
    },
    local: () => criarNovoDeslocamentoLocal(dados),
  })
}

export async function atualizarDeslocamento(idOuObjeto, dados = null, updatedAtLido = null) {
  const id = typeof idOuObjeto === 'object' ? idOuObjeto.id : idOuObjeto
  const payloadDados = typeof idOuObjeto === 'object' ? idOuObjeto : (dados || {})
  const updatedAt = typeof idOuObjeto === 'object' ? (idOuObjeto.updatedAt || updatedAtLido) : updatedAtLido

  return executarRepositorio({
    contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'atualizar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearDeslocamentoParaDb({ ...payloadDados, id })

      let query = supabase.from('leva_e_traz_deslocamentos').update(payload).eq('id', id)
      if (updatedAt) {
        query = query.eq('updated_at', updatedAt)
      }

      const { data, error } = await query.select()
      if (error) throw error
      if (!data || data.length === 0) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.CONFLITO_EDICAO,
          'Deslocamento foi modificado concorrentemente.',
          { contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'atualizar' } }
        )
      }
      return mapearDeslocamentoParaDominio(data[0])
    },
    local: () => atualizarDeslocamentoLocal({ ...payloadDados, id }),
  })
}

export async function iniciarDeslocamento(id, updatedAtLido = null) {
  return executarRepositorio({
    contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'iniciar' },
    remoto: async () => {
      const atual = await obterDeslocamentoPorId(id)
      if (!atual) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.REFERENCIA_INVALIDA,
          'Deslocamento não encontrado.',
          { contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'iniciar' } }
        )
      }

      const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const atualizado = await atualizarDeslocamento(
        id,
        {
          ...atual,
          status: 'em_deslocamento',
          horarioSaidaReal: atual.horarioSaidaReal || horaAtual,
        },
        updatedAtLido || atual.updatedAt
      )

      if (atual.veiculoApoioId) {
        await atualizarVeiculoApoio(atual.veiculoApoioId, {
          status: 'em_rota',
          emUsoPor: atual.motoristaPrincipalNome,
        }).catch((err) => {
          console.warn('Aviso: falha ao atualizar status do veículo de apoio:', err)
        })
      }

      return atualizado
    },
    local: () => iniciarDeslocamentoLocal(id),
  })
}

export async function finalizarDeslocamento(id, dadosRetorno = {}, updatedAtLido = null) {
  return executarRepositorio({
    contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'finalizar' },
    remoto: async () => {
      const atual = await obterDeslocamentoPorId(id)
      if (!atual) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.REFERENCIA_INVALIDA,
          'Deslocamento não encontrado.',
          { contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'finalizar' } }
        )
      }

      const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const kmInicialNum = parseFloat(String(atual.kmInicial || '0').replace(/\./g, '').replace(',', '.')) || 0
      const kmFinalNum = parseFloat(String(dadosRetorno.kmFinal || '0').replace(/\./g, '').replace(',', '.')) || 0
      let kmRealizado = dadosRetorno.kmRealizado
      if (!kmRealizado && kmFinalNum > kmInicialNum) {
        kmRealizado = String(Math.round(kmFinalNum - kmInicialNum))
      }

      const atualizado = await atualizarDeslocamento(
        id,
        {
          ...atual,
          ...dadosRetorno,
          status: 'concluido',
          horarioRetornoReal: dadosRetorno.horarioRetornoReal || horaAtual,
          kmRealizado: kmRealizado || atual.kmEstimado || '',
        },
        updatedAtLido || atual.updatedAt
      )

      if (atual.veiculoApoioId) {
        const payloadApoio = {
          status: 'disponivel',
          emUsoPor: null,
        }
        if (dadosRetorno.kmFinal) {
          payloadApoio.kmAtual = dadosRetorno.kmFinal
        }
        await atualizarVeiculoApoio(atual.veiculoApoioId, payloadApoio).catch((err) => {
          console.warn('Aviso: falha ao liberar veículo de apoio:', err)
        })
      }

      return atualizado
    },
    local: () => finalizarDeslocamentoLocal(id, dadosRetorno),
  })
}

export async function cancelarDeslocamento(id, motivo = '', updatedAtLido = null) {
  return executarRepositorio({
    contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'cancelar' },
    remoto: async () => {
      const atual = await obterDeslocamentoPorId(id)
      if (!atual) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.REFERENCIA_INVALIDA,
          'Deslocamento não encontrado.',
          { contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'cancelar' } }
        )
      }

      const atualizado = await atualizarDeslocamento(
        id,
        {
          ...atual,
          status: 'cancelado',
          motivoCancelamento: motivo,
        },
        updatedAtLido || atual.updatedAt
      )

      if (atual.veiculoApoioId) {
        await atualizarVeiculoApoio(atual.veiculoApoioId, {
          status: 'disponivel',
          emUsoPor: null,
        }).catch((err) => {
          console.warn('Aviso: falha ao liberar veículo de apoio:', err)
        })
      }

      return atualizado
    },
    local: () => cancelarDeslocamentoLocal(id, motivo),
  })
}

export async function excluirDeslocamento(id) {
  return executarRepositorio({
    contexto: { entidade: 'leva_e_traz_deslocamentos', operacao: 'excluir' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      await executarOperacao(
        supabase.from('leva_e_traz_deslocamentos').delete().eq('id', id),
        { entidade: 'leva_e_traz_deslocamentos', operacao: 'excluir' }
      )
      return true
    },
    local: () => {
      excluirDeslocamentoLocal(id)
      return true
    },
  })
}
