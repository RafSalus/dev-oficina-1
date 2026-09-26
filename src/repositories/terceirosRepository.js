/**
 * Repositório assíncrono de Terceiros e Fornecedores (Story 2.7 / FR25).
 * Implementa padrão fail-closed com persistência no Supabase Postgres
 * e modo local isolado para testes/desenvolvimento.
 */

import { getSupabaseDataClient } from '../lib/supabase'
import {
  executarRepositorio,
  executarOperacao,
} from './supabaseHelpers'
import {
  ErroRepositorio,
  CODIGOS_ERRO,
  MENSAGENS_PADRAO,
  mapearErroPostgres,
} from './erroRepositorio'
import {
  terceiroParaLinha,
  linhaParaTerceiro,
} from './mapeadores/suprimentos'

export const STORAGE_KEY_TERCEIROS = 'dev_oficina_terceiros_v2'

function getStoredTerceiros() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TERCEIROS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
    const legacy = localStorage.getItem('dev_oficina_cadastros_terceiros')
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy)
      if (Array.isArray(parsedLegacy)) return parsedLegacy
    }
    return []
  } catch {
    return []
  }
}

function setStoredTerceiros(data) {
  try {
    localStorage.setItem(STORAGE_KEY_TERCEIROS, JSON.stringify(data))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('dev_oficina_terceiros_updated'))
      window.dispatchEvent(new Event('storage'))
    }
  } catch (err) {
    console.error('Erro ao gravar terceiros no storage:', err)
  }
}

export async function carregarTerceiros() {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('terceiros').select('*').order('created_at', { ascending: false })
      const data = await executarOperacao(query, {
        entidade: 'terceiros',
        operacao: 'carregarTerceiros',
      })
      return (data || []).map((linha) => linhaParaTerceiro(linha))
    },
    local: () => {
      return getStoredTerceiros()
    },
    contexto: { entidade: 'terceiros', operacao: 'carregarTerceiros' },
  })
}

export async function obterTerceiroPorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('terceiros').select('*').eq('id', id).maybeSingle()
      const data = await executarOperacao(query, {
        entidade: 'terceiros',
        operacao: 'obterTerceiroPorId',
      })
      return data ? linhaParaTerceiro(data) : null
    },
    local: () => {
      const lista = getStoredTerceiros()
      const found = lista.find((t) => String(t.id) === String(id) || String(t.value) === String(id))
      return found || null
    },
    contexto: { entidade: 'terceiros', operacao: 'obterTerceiroPorId' },
  })
}

export async function salvarTerceiro(terceiro) {
  if (!terceiro || typeof terceiro !== 'object') {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'Dados de terceiro inválidos.')
  }

  const idExistente = terceiro.id && !String(terceiro.id).startsWith('terc-') ? terceiro.id : null

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const payloadLinha = terceiroParaLinha(terceiro)

      const contexto = {
        entidade: 'terceiros',
        operacao: 'salvarTerceiro',
      }

      if (idExistente) {
        delete payloadLinha.id
        let updateQuery = client.from('terceiros').update(payloadLinha).eq('id', idExistente)
        if (terceiro.updatedAt) {
          updateQuery = updateQuery.eq('updated_at', terceiro.updatedAt)
        }

        const resposta = await updateQuery.select().maybeSingle()
        if (resposta.error) {
          throw mapearErroPostgres(resposta.error, contexto)
        }

        if (!resposta.data) {
          const { data: linhaAtual } = await client.from('terceiros').select('id, updated_at').eq('id', idExistente).maybeSingle()
          if (linhaAtual && terceiro.updatedAt && linhaAtual.updated_at !== terceiro.updatedAt) {
            throw new ErroRepositorio(CODIGOS_ERRO.CONFLITO_EDICAO, MENSAGENS_PADRAO[CODIGOS_ERRO.CONFLITO_EDICAO], { contexto })
          }
          throw new ErroRepositorio(CODIGOS_ERRO.SEM_PERMISSAO, MENSAGENS_PADRAO[CODIGOS_ERRO.SEM_PERMISSAO], { contexto })
        }

        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('dev_oficina_terceiros_updated'))
        }
        return linhaParaTerceiro(resposta.data)
      } else {
        delete payloadLinha.id
        const resposta = await client.from('terceiros').insert(payloadLinha).select().single()
        const data = await executarOperacao(resposta, contexto, { esperaLinhasAfetadas: true })
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('dev_oficina_terceiros_updated'))
        }
        return linhaParaTerceiro(data)
      }
    },
    local: () => {
      const lista = getStoredTerceiros()
      const id = terceiro.id || terceiro.value || `terc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const index = lista.findIndex((t) => String(t.id) === String(id) || String(t.value) === String(id))
      const agora = new Date().toISOString()

      const salva = {
        ...terceiro,
        id,
        value: id,
        razaoSocial: terceiro.razaoSocial || terceiro.nome || '',
        nomeFantasia: terceiro.nomeFantasia || terceiro.razaoSocial || terceiro.nome || '',
        ativo: terceiro.ativo !== false,
        updatedAt: agora,
        dataAtualizacao: agora,
      }

      if (index >= 0) {
        lista[index] = salva
      } else {
        salva.createdAt = agora
        salva.dataCadastro = agora
        lista.unshift(salva)
      }

      setStoredTerceiros(lista)
      return salva
    },
    contexto: { entidade: 'terceiros', operacao: 'salvarTerceiro' },
  })
}

export async function excluirTerceiro(id) {
  if (!id) return Promise.resolve(false)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const contexto = {
        entidade: 'terceiros',
        operacao: 'excluirTerceiro',
      }
      const query = client.from('terceiros').delete().eq('id', id)
      await executarOperacao(query, contexto, { esperaLinhasAfetadas: true })
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('dev_oficina_terceiros_updated'))
      }
      return true
    },
    local: () => {
      const lista = getStoredTerceiros()
      const filtrada = lista.filter((t) => String(t.id) !== String(id) && String(t.value) !== String(id))
      if (filtrada.length !== lista.length) {
        setStoredTerceiros(filtrada)
        return true
      }
      return false
    },
    contexto: { entidade: 'terceiros', operacao: 'excluirTerceiro' },
  })
}
