/**
 * Repositório assíncrono de Agenda Dinâmica e Fila de Espera — Story 2.10 / ADR-005.
 * Gravação por linha com controle de concorrência otimista (updated_at) e RPC transacional de cascata.
 */

import { getSupabaseDataClient } from '../lib/supabase'
import { executarRepositorio, executarOperacao } from './supabaseHelpers'
import { ErroRepositorio, CODIGOS_ERRO } from './erroRepositorio'
import {
  mapearAgendamentoParaDominio,
  mapearAgendamentoParaDb,
  mapearItemFilaParaDominio,
  mapearItemFilaParaDb,
} from './mapeadores/agenda'
import {
  carregarAgendamentos as carregarAgendamentosLocal,
  salvarAgendamentos as salvarAgendamentosLocal,
  carregarFilaEspera as carregarFilaEsperaLocal,
  salvarFilaEspera as salvarFilaEsperaLocal,
  ordenarFilaPorPrioridadeEChegada,
} from '../constants/agendaData'

// ==============================================================================
// AGENDAMENTOS
// ==============================================================================

export async function carregarAgendamentos() {
  return executarRepositorio({
    contexto: { entidade: 'agenda_agendamentos', operacao: 'carregar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('agenda_agendamentos').select('*').order('horario_inicio', { ascending: true }),
        { entidade: 'agenda_agendamentos', operacao: 'carregar' }
      )
      return (data || []).map(mapearAgendamentoParaDominio)
    },
    local: () => carregarAgendamentosLocal(),
  })
}

export async function obterAgendamentoPorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    contexto: { entidade: 'agenda_agendamentos', operacao: 'obterPorId' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('agenda_agendamentos').select('*').eq('id', id).maybeSingle(),
        { entidade: 'agenda_agendamentos', operacao: 'obterPorId' }
      )
      return data ? mapearAgendamentoParaDominio(data) : null
    },
    local: () => {
      const lista = carregarAgendamentosLocal()
      return lista.find((a) => String(a.id) === String(id)) || null
    },
  })
}

export async function criarAgendamento(dados) {
  return executarRepositorio({
    contexto: { entidade: 'agenda_agendamentos', operacao: 'criar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearAgendamentoParaDb(dados)
      const data = await executarOperacao(
        supabase.from('agenda_agendamentos').insert(payload).select().single(),
        { entidade: 'agenda_agendamentos', operacao: 'criar' }
      )
      return mapearAgendamentoParaDominio(data)
    },
    local: () => {
      const agendamentos = carregarAgendamentosLocal()
      const novo = {
        id: dados.id || `ag-${Date.now()}`,
        ...dados,
      }
      salvarAgendamentosLocal([novo, ...agendamentos])
      return novo
    },
  })
}

export async function atualizarAgendamento(id, dados, updatedAtLido = null) {
  return executarRepositorio({
    contexto: { entidade: 'agenda_agendamentos', operacao: 'atualizar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearAgendamentoParaDb({ ...dados, id })

      let query = supabase.from('agenda_agendamentos').update(payload).eq('id', id)
      if (updatedAtLido) {
        query = query.eq('updated_at', updatedAtLido)
      }

      const { data, error } = await query.select()
      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.CONFLITO_EDICAO,
          'Este agendamento foi alterado por outra pessoa. Recarregue a página.',
          { contexto: { entidade: 'agenda_agendamentos', operacao: 'atualizar', id } }
        )
      }

      return mapearAgendamentoParaDominio(data[0])
    },
    local: () => {
      const agendamentos = carregarAgendamentosLocal()
      const existe = agendamentos.some((a) => a.id === id)
      const atualizado = { ...dados, id }
      const novaLista = existe
        ? agendamentos.map((a) => (a.id === id ? atualizado : a))
        : [atualizado, ...agendamentos]
      salvarAgendamentosLocal(novaLista)
      return atualizado
    },
  })
}

export async function excluirAgendamento(id) {
  return executarRepositorio({
    contexto: { entidade: 'agenda_agendamentos', operacao: 'excluir' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      await executarOperacao(
        supabase.from('agenda_agendamentos').delete().eq('id', id),
        { entidade: 'agenda_agendamentos', operacao: 'excluir' }
      )
      return true
    },
    local: () => {
      const agendamentos = carregarAgendamentosLocal()
      const novaLista = agendamentos.filter((a) => a.id !== id)
      salvarAgendamentosLocal(novaLista)
      return true
    },
  })
}

export async function aplicarCascataAtrasos(itensCascata) {
  return executarRepositorio({
    contexto: { entidade: 'agenda_agendamentos', operacao: 'aplicarCascata' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = (itensCascata || []).map((it) => ({
        id: it.id,
        updated_at_lido: it.updatedAt || it.updated_at || null,
        dia_chave: it.diaChave,
        dia_original: it.diaOriginal,
        horario_inicio: it.horarioInicio,
        horario_original: it.horarioOriginal,
        foi_empurrado_cascata: it.foiEmpurradoCascata,
        empurrado_minutos: it.empurradoMinutos,
        empurrado_de_dia: it.empurradoDeDia,
        motivo_empurrado: it.motivoEmpurrado,
        em_atraso: it.emAtraso,
        tempo_atraso_minutos: it.tempoAtrasoMinutos,
      }))

      const { data, error } = await supabase.rpc('aplicar_cascata_atrasos_agenda', {
        p_itens: payload,
      })

      if (error) {
        if (error.code === 'P0003') {
          throw new ErroRepositorio(
            CODIGOS_ERRO.CONFLITO_EDICAO,
            'Conflito de edição na cascata de atrasos. Recarregue a página.'
          )
        }
        throw error
      }

      return data
    },
    local: () => {
      salvarAgendamentosLocal(itensCascata)
      return { sucesso: true, total_afetado: itensCascata.length }
    },
  })
}

// ==============================================================================
// FILA DE ESPERA
// ==============================================================================

export async function carregarFilaEspera() {
  return executarRepositorio({
    contexto: { entidade: 'agenda_fila_espera', operacao: 'carregar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('agenda_fila_espera').select('*'),
        { entidade: 'agenda_fila_espera', operacao: 'carregar' }
      )
      const listaDominio = (data || []).map(mapearItemFilaParaDominio)
      return ordenarFilaPorPrioridadeEChegada(listaDominio)
    },
    local: () => carregarFilaEsperaLocal(),
  })
}

export async function obterItemFilaEsperaPorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    contexto: { entidade: 'agenda_fila_espera', operacao: 'obterPorId' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const data = await executarOperacao(
        supabase.from('agenda_fila_espera').select('*').eq('id', id).maybeSingle(),
        { entidade: 'agenda_fila_espera', operacao: 'obterPorId' }
      )
      return data ? mapearItemFilaParaDominio(data) : null
    },
    local: () => {
      const fila = carregarFilaEsperaLocal()
      return fila.find((f) => String(f.id) === String(id)) || null
    },
  })
}

export async function criarItemFilaEspera(dados) {
  return executarRepositorio({
    contexto: { entidade: 'agenda_fila_espera', operacao: 'criar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearItemFilaParaDb(dados)
      const data = await executarOperacao(
        supabase.from('agenda_fila_espera').insert(payload).select().single(),
        { entidade: 'agenda_fila_espera', operacao: 'criar' }
      )
      return mapearItemFilaParaDominio(data)
    },
    local: () => {
      const fila = carregarFilaEsperaLocal()
      const novo = {
        id: dados.id || `fila-${Date.now()}`,
        ...dados,
      }
      const novaFila = [novo, ...fila]
      salvarFilaEsperaLocal(novaFila)
      return novo
    },
  })
}

export async function atualizarItemFilaEspera(id, dados, updatedAtLido = null) {
  return executarRepositorio({
    contexto: { entidade: 'agenda_fila_espera', operacao: 'atualizar' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      const payload = mapearItemFilaParaDb({ ...dados, id })

      let query = supabase.from('agenda_fila_espera').update(payload).eq('id', id)
      if (updatedAtLido) {
        query = query.eq('updated_at', updatedAtLido)
      }

      const { data, error } = await query.select()
      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        throw new ErroRepositorio(
          CODIGOS_ERRO.CONFLITO_EDICAO,
          'Este item da fila foi alterado por outra pessoa. Recarregue a página.',
          { contexto: { entidade: 'agenda_fila_espera', operacao: 'atualizar', id } }
        )
      }

      return mapearItemFilaParaDominio(data[0])
    },
    local: () => {
      const fila = carregarFilaEsperaLocal()
      const atualizado = { ...dados, id }
      const novaFila = fila.map((f) => (f.id === id ? atualizado : f))
      salvarFilaEsperaLocal(novaFila)
      return atualizado
    },
  })
}

export async function excluirItemFilaEspera(id) {
  return executarRepositorio({
    contexto: { entidade: 'agenda_fila_espera', operacao: 'excluir' },
    remoto: async () => {
      const supabase = getSupabaseDataClient()
      await executarOperacao(
        supabase.from('agenda_fila_espera').delete().eq('id', id),
        { entidade: 'agenda_fila_espera', operacao: 'excluir' }
      )
      return true
    },
    local: () => {
      const fila = carregarFilaEsperaLocal()
      const novaFila = fila.filter((f) => f.id !== id)
      salvarFilaEsperaLocal(novaFila)
      return true
    },
  })
}
