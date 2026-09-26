/**
 * Repositório assíncrono de Peças e Produtos (Story 2.7 / FR25).
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
  pecaParaLinha,
  linhaParaPeca,
} from './mapeadores/suprimentos'

export const STORAGE_KEY_PECAS = 'dev_oficina_pecas_v2'

function getStoredPecas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PECAS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
    const legacy = localStorage.getItem('dev_oficina_cadastros_pecas')
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy)
      if (Array.isArray(parsedLegacy)) return parsedLegacy
    }
    return []
  } catch {
    return []
  }
}

function setStoredPecas(data) {
  try {
    localStorage.setItem(STORAGE_KEY_PECAS, JSON.stringify(data))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('dev_oficina_pecas_updated'))
      window.dispatchEvent(new Event('storage'))
    }
  } catch (err) {
    console.error('Erro ao gravar peças no storage:', err)
  }
}

export async function carregarPecas() {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('pecas').select('*').order('created_at', { ascending: false })
      const data = await executarOperacao(query, {
        entidade: 'pecas',
        operacao: 'carregarPecas',
      })
      return (data || []).map((linha) => linhaParaPeca(linha))
    },
    local: () => {
      return getStoredPecas()
    },
    contexto: { entidade: 'pecas', operacao: 'carregarPecas' },
  })
}

export async function obterPecaPorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('pecas').select('*').or(`id.eq.${id},codigo.eq.${id}`).maybeSingle()
      const data = await executarOperacao(query, {
        entidade: 'pecas',
        operacao: 'obterPecaPorId',
      })
      return data ? linhaParaPeca(data) : null
    },
    local: () => {
      const lista = getStoredPecas()
      const found = lista.find((p) => String(p.id) === String(id) || String(p.codigo) === String(id) || String(p.value) === String(id))
      return found || null
    },
    contexto: { entidade: 'pecas', operacao: 'obterPecaPorId' },
  })
}

export async function salvarPeca(peca) {
  if (!peca || typeof peca !== 'object') {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'Dados de peça inválidos.')
  }

  const idExistente = peca.id && !String(peca.id).startsWith('peca-') ? peca.id : null

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const payloadLinha = pecaParaLinha(peca)

      const contexto = {
        entidade: 'pecas',
        operacao: 'salvarPeca',
        mensagensCustomizadas: {
          [CODIGOS_ERRO.DUPLICADO]: 'Código já cadastrado',
        },
      }

      if (idExistente) {
        delete payloadLinha.id
        let updateQuery = client.from('pecas').update(payloadLinha).eq('id', idExistente)
        if (peca.updatedAt) {
          updateQuery = updateQuery.eq('updated_at', peca.updatedAt)
        }

        const resposta = await updateQuery.select().maybeSingle()
        if (resposta.error) {
          throw mapearErroPostgres(resposta.error, contexto)
        }

        if (!resposta.data) {
          const { data: linhaAtual } = await client.from('pecas').select('id, updated_at').eq('id', idExistente).maybeSingle()
          if (linhaAtual && peca.updatedAt && linhaAtual.updated_at !== peca.updatedAt) {
            throw new ErroRepositorio(CODIGOS_ERRO.CONFLITO_EDICAO, MENSAGENS_PADRAO[CODIGOS_ERRO.CONFLITO_EDICAO], { contexto })
          }
          throw new ErroRepositorio(CODIGOS_ERRO.SEM_PERMISSAO, MENSAGENS_PADRAO[CODIGOS_ERRO.SEM_PERMISSAO], { contexto })
        }

        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('dev_oficina_pecas_updated'))
        }
        return linhaParaPeca(resposta.data)
      } else {
        delete payloadLinha.id
        const resposta = await client.from('pecas').insert(payloadLinha).select().single()
        const data = await executarOperacao(resposta, contexto, { esperaLinhasAfetadas: true })
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('dev_oficina_pecas_updated'))
        }
        return linhaParaPeca(data)
      }
    },
    local: () => {
      const lista = getStoredPecas()
      const cod = (peca.codigo || '').trim().toUpperCase()

      if (cod) {
        const duplicado = lista.find(
          (p) => (p.id !== peca.id && p.value !== peca.id) && (p.codigo || '').trim().toUpperCase() === cod
        )
        if (duplicado) {
          throw new ErroRepositorio(CODIGOS_ERRO.DUPLICADO, 'Código já cadastrado')
        }
      }

      const id = peca.id || peca.value || `peca-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const index = lista.findIndex((p) => String(p.id) === String(id) || String(p.value) === String(id))
      const agora = new Date().toISOString()

      const salva = {
        ...peca,
        id,
        value: id,
        codigo: cod || peca.codigo,
        estoqueAtual: Number(peca.estoqueAtual ?? peca.estoque ?? 0),
        estoque: Number(peca.estoqueAtual ?? peca.estoque ?? 0),
        precoVenda: Number(peca.precoVenda ?? peca.precoUnitario ?? 0),
        precoUnitario: Number(peca.precoVenda ?? peca.precoUnitario ?? 0),
        ativo: peca.ativo !== false,
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

      setStoredPecas(lista)
      return salva
    },
    contexto: { entidade: 'pecas', operacao: 'salvarPeca' },
  })
}

export async function excluirPeca(id) {
  if (!id) return Promise.resolve(false)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const contexto = {
        entidade: 'pecas',
        operacao: 'excluirPeca',
      }
      const query = client.from('pecas').delete().eq('id', id)
      await executarOperacao(query, contexto, { esperaLinhasAfetadas: true })
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('dev_oficina_pecas_updated'))
      }
      return true
    },
    local: () => {
      const lista = getStoredPecas()
      const filtrada = lista.filter((p) => String(p.id) !== String(id) && String(p.value) !== String(id))
      if (filtrada.length !== lista.length) {
        setStoredPecas(filtrada)
        return true
      }
      return false
    },
    contexto: { entidade: 'pecas', operacao: 'excluirPeca' },
  })
}
