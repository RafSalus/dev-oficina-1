/**
 * Repositório assíncrono de Serviços (Story 2.7 / FR25).
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
  servicoParaLinha,
  linhaParaServico,
} from './mapeadores/suprimentos'

export const STORAGE_KEY_SERVICOS = 'dev_oficina_servicos_v2'

function getStoredServicos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SERVICOS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
    const legacy = localStorage.getItem('dev_oficina_cadastros_servicos')
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy)
      if (Array.isArray(parsedLegacy)) return parsedLegacy
    }
    return []
  } catch {
    return []
  }
}

function setStoredServicos(data) {
  try {
    localStorage.setItem(STORAGE_KEY_SERVICOS, JSON.stringify(data))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('dev_oficina_servicos_updated'))
      window.dispatchEvent(new Event('storage'))
    }
  } catch (err) {
    console.error('Erro ao gravar serviços no storage:', err)
  }
}

export async function carregarServicos() {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('servicos').select('*').order('created_at', { ascending: false })
      const data = await executarOperacao(query, {
        entidade: 'servicos',
        operacao: 'carregarServicos',
      })
      return (data || []).map((linha) => linhaParaServico(linha))
    },
    local: () => {
      return getStoredServicos()
    },
    contexto: { entidade: 'servicos', operacao: 'carregarServicos' },
  })
}

export async function obterServicoPorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('servicos').select('*').or(`id.eq.${id},codigo.eq.${id}`).maybeSingle()
      const data = await executarOperacao(query, {
        entidade: 'servicos',
        operacao: 'obterServicoPorId',
      })
      return data ? linhaParaServico(data) : null
    },
    local: () => {
      const lista = getStoredServicos()
      const found = lista.find((s) => String(s.id) === String(id) || String(s.codigo) === String(id) || String(s.value) === String(id))
      return found || null
    },
    contexto: { entidade: 'servicos', operacao: 'obterServicoPorId' },
  })
}

export async function salvarServico(servico) {
  if (!servico || typeof servico !== 'object') {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'Dados de serviço inválidos.')
  }

  const idExistente = servico.id && !String(servico.id).startsWith('serv-') ? servico.id : null

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const payloadLinha = servicoParaLinha(servico)

      const contexto = {
        entidade: 'servicos',
        operacao: 'salvarServico',
        mensagensCustomizadas: {
          [CODIGOS_ERRO.DUPLICADO]: 'Código já cadastrado',
        },
      }

      if (idExistente) {
        delete payloadLinha.id
        let updateQuery = client.from('servicos').update(payloadLinha).eq('id', idExistente)
        if (servico.updatedAt) {
          updateQuery = updateQuery.eq('updated_at', servico.updatedAt)
        }

        const resposta = await updateQuery.select().maybeSingle()
        if (resposta.error) {
          throw mapearErroPostgres(resposta.error, contexto)
        }

        if (!resposta.data) {
          const { data: linhaAtual } = await client.from('servicos').select('id, updated_at').eq('id', idExistente).maybeSingle()
          if (linhaAtual && servico.updatedAt && linhaAtual.updated_at !== servico.updatedAt) {
            throw new ErroRepositorio(CODIGOS_ERRO.CONFLITO_EDICAO, MENSAGENS_PADRAO[CODIGOS_ERRO.CONFLITO_EDICAO], { contexto })
          }
          throw new ErroRepositorio(CODIGOS_ERRO.SEM_PERMISSAO, MENSAGENS_PADRAO[CODIGOS_ERRO.SEM_PERMISSAO], { contexto })
        }

        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('dev_oficina_servicos_updated'))
        }
        return linhaParaServico(resposta.data)
      } else {
        delete payloadLinha.id
        const resposta = await client.from('servicos').insert(payloadLinha).select().single()
        const data = await executarOperacao(resposta, contexto, { esperaLinhasAfetadas: true })
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('dev_oficina_servicos_updated'))
        }
        return linhaParaServico(data)
      }
    },
    local: () => {
      const lista = getStoredServicos()
      const cod = (servico.codigo || '').trim().toUpperCase()

      if (cod) {
        const duplicado = lista.find(
          (s) => (s.id !== servico.id && s.value !== servico.id) && (s.codigo || '').trim().toUpperCase() === cod
        )
        if (duplicado) {
          throw new ErroRepositorio(CODIGOS_ERRO.DUPLICADO, 'Código já cadastrado')
        }
      }

      const id = servico.id || servico.value || `serv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const index = lista.findIndex((s) => String(s.id) === String(id) || String(s.value) === String(id))
      const agora = new Date().toISOString()

      const salva = {
        ...servico,
        id,
        value: id,
        codigo: cod || servico.codigo,
        valorMaoDeObra: Number(servico.valorMaoDeObra ?? servico.valorUnitario ?? servico.valor ?? 0),
        valorUnitario: Number(servico.valorMaoDeObra ?? servico.valorUnitario ?? servico.valor ?? 0),
        ativo: servico.ativo !== false,
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

      setStoredServicos(lista)
      return salva
    },
    contexto: { entidade: 'servicos', operacao: 'salvarServico' },
  })
}

export async function excluirServico(id) {
  if (!id) return Promise.resolve(false)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const contexto = {
        entidade: 'servicos',
        operacao: 'excluirServico',
      }
      const query = client.from('servicos').delete().eq('id', id)
      await executarOperacao(query, contexto, { esperaLinhasAfetadas: true })
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('dev_oficina_servicos_updated'))
      }
      return true
    },
    local: () => {
      const lista = getStoredServicos()
      const filtrada = lista.filter((s) => String(s.id) !== String(id) && String(s.value) !== String(id))
      if (filtrada.length !== lista.length) {
        setStoredServicos(filtrada)
        return true
      }
      return false
    },
    contexto: { entidade: 'servicos', operacao: 'excluirServico' },
  })
}
