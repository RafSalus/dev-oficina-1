/**
 * Repositório assíncrono de Estoque e Movimentações (Kardex) — Story 2.8 / ADR-005.
 * Implementa padrão fail-closed com persistência no Supabase Postgres via RPC transacional
 * e modo local isolado para testes e offline.
 */

import { getSupabaseDataClient } from '../lib/supabase'
import {
  executarRepositorio,
  executarOperacao,
} from './supabaseHelpers'
import {
  ErroRepositorio,
  CODIGOS_ERRO,
  mapearErroPostgres,
} from './erroRepositorio'
import {
  linhaParaMovimentacao,
} from './mapeadores/estoque'
import { obterPecaPorId, salvarPeca } from './pecasRepository'

export const STORAGE_KEY_MOVIMENTACOES = 'dev_oficina_movimentacoes_v2'

function getStoredMovimentacoes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOVIMENTACOES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
    const legacy = localStorage.getItem('dev_oficina_movimentacoes_estoque')
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy)
      if (Array.isArray(parsedLegacy)) return parsedLegacy
    }
    return []
  } catch {
    return []
  }
}

function setStoredMovimentacoes(data) {
  try {
    localStorage.setItem(STORAGE_KEY_MOVIMENTACOES, JSON.stringify(data))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('dev_oficina_movimentacoes_updated'))
      window.dispatchEvent(new Event('storage'))
    }
  } catch (err) {
    console.error('Erro ao gravar movimentações no storage:', err)
  }
}

/**
 * Carrega a lista completa de movimentações do Kardex.
 * @returns {Promise<Array<object>>}
 */
export async function carregarMovimentacoes() {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client
        .from('estoque_movimentacoes')
        .select('*, pecas(codigo, nome)')
        .order('created_at', { ascending: false })

      const data = await executarOperacao(query, {
        entidade: 'estoque_movimentacoes',
        operacao: 'carregarMovimentacoes',
      })
      return (data || []).map((linha) => linhaParaMovimentacao(linha))
    },
    local: () => {
      return getStoredMovimentacoes()
    },
    contexto: { entidade: 'estoque_movimentacoes', operacao: 'carregarMovimentacoes' },
  })
}

/**
 * Registra uma movimentação atômica no Kardex via RPC transacional do Postgres (AC2 / ADR-005 §2.4).
 * O saldo da peça é recalculado e persistido dentro da mesma transação no banco.
 *
 * @param {object} mov - Dados da movimentação
 * @param {string} mov.pecaId - ID da peça
 * @param {'entrada'|'saida'|'ajuste'|'ENTRADA'|'SAIDA'|'AJUSTE'} mov.tipo - Tipo da movimentação
 * @param {number} mov.quantidade - Quantidade movimentada (inteiro positivo)
 * @param {string} [mov.motivo] - Motivo do lançamento
 * @param {string} [mov.documentoRef] - Documento ou referência
 * @param {string} [mov.usuario] - Usuário responsável (default funcionario atual ou Sistema)
 * @param {string} [mov.ordemServicoId] - ID da OS vinculada (se aplicável)
 * @param {string} [mov.osItemId] - ID do item da OS (se aplicável)
 * @returns {Promise<object>} Movimentação registrada
 */
export async function registrarMovimentacao(mov) {
  if (!mov || typeof mov !== 'object') {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'Dados de movimentação inválidos.')
  }

  const pecaId = mov.pecaId || mov.peca_id
  if (!pecaId) {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'ID da peça é obrigatório para registrar movimentação.')
  }

  const tipo = (mov.tipo || '').toLowerCase().trim()
  if (!['entrada', 'saida', 'ajuste'].includes(tipo)) {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'Tipo de movimentação inválido (use entrada, saida ou ajuste).')
  }

  const quantidade = Math.max(1, Math.round(Number(mov.quantidade) || 0))
  const motivo = (mov.motivo || '').trim() || null
  const documentoRef = (mov.documentoRef || mov.documento || '').trim() || null
  const usuario = (mov.usuario || mov.responsavel || '').trim() || null
  const ordemServicoId = mov.ordemServicoId || mov.ordem_servico_id || null
  const osItemId = mov.osItemId || mov.os_item_id || null

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const contexto = {
        entidade: 'estoque_movimentacoes',
        operacao: 'registrarMovimentacao',
        mensagensCustomizadas: {
          [CODIGOS_ERRO.DUPLICADO]: 'Peça já foi baixada anteriormente para este item de OS.',
        },
      }

      const resposta = await client.rpc('registrar_movimentacao_estoque', {
        p_peca_id: pecaId,
        p_tipo: tipo,
        p_quantidade: quantidade,
        p_motivo: motivo,
        p_documento_ref: documentoRef,
        p_usuario: usuario,
        p_ordem_servico_id: ordemServicoId,
        p_os_item_id: osItemId,
      })

      if (resposta.error) {
        throw mapearErroPostgres(resposta.error, contexto)
      }

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('dev_oficina_movimentacoes_updated'))
        window.dispatchEvent(new CustomEvent('dev_oficina_pecas_updated'))
        window.dispatchEvent(new Event('storage'))
      }

      return linhaParaMovimentacao(resposta.data)
    },
    local: async () => {
      const lista = getStoredMovimentacoes()

      // Validação de duplicidade de baixa por OS/item no modo local (AC5)
      if (tipo === 'saida' && ordemServicoId && osItemId) {
        const jaBaixado = lista.find(
          (m) =>
            m.tipo === 'saida' &&
            String(m.ordemServicoId) === String(ordemServicoId) &&
            String(m.osItemId) === String(osItemId)
        )
        if (jaBaixado) {
          throw new ErroRepositorio(CODIGOS_ERRO.DUPLICADO, 'Peça já foi baixada anteriormente para este item de OS.')
        }
      }

      // Atualiza o saldo físico da peça localmente (AC3)
      const peca = await obterPecaPorId(pecaId)
      if (!peca) {
        throw new ErroRepositorio(CODIGOS_ERRO.REGISTRO_NAO_ENCONTRADO, 'Peça não encontrada no almoxarifado.')
      }

      const saldoAnterior = Number(peca.estoqueAtual ?? peca.estoque ?? 0)
      let saldoNovo = saldoAnterior

      if (tipo === 'entrada') {
        saldoNovo = saldoAnterior + quantidade
      } else if (tipo === 'saida') {
        saldoNovo = Math.max(0, saldoAnterior - quantidade)
      } else if (tipo === 'ajuste') {
        saldoNovo = Math.max(0, quantidade)
      }

      await salvarPeca({
        ...peca,
        estoqueAtual: saldoNovo,
        estoque: saldoNovo,
      })

      const agora = new Date().toISOString()
      const novaMov = {
        id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        pecaId,
        peca_id: pecaId,
        pecaCodigo: peca.codigo || '',
        pecaNome: peca.nome || '',
        tipo,
        quantidade,
        saldoAnterior,
        saldoNovo,
        motivo: motivo || 'Movimentação manual do almoxarifado',
        documento: documentoRef || 'Registro Avulso',
        documentoRef: documentoRef || 'Registro Avulso',
        responsavel: usuario || 'Sistema',
        usuario: usuario || 'Sistema',
        ordemServicoId,
        osItemId,
        dataHora: agora,
        data: agora,
        createdAt: agora,
      }

      lista.unshift(novaMov)
      setStoredMovimentacoes(lista)
      return novaMov
    },
    contexto: { entidade: 'estoque_movimentacoes', operacao: 'registrarMovimentacao' },
  })
}

/**
 * Retorna o histórico de movimentações (Kardex) de uma peça específica.
 * @param {string} pecaId
 * @returns {Promise<Array<object>>}
 */
export async function obterKardexPeca(pecaId) {
  if (!pecaId) return Promise.resolve([])

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client
        .from('estoque_movimentacoes')
        .select('*, pecas(codigo, nome)')
        .eq('peca_id', pecaId)
        .order('created_at', { ascending: false })

      const data = await executarOperacao(query, {
        entidade: 'estoque_movimentacoes',
        operacao: 'obterKardexPeca',
      })
      return (data || []).map((linha) => linhaParaMovimentacao(linha))
    },
    local: () => {
      const lista = getStoredMovimentacoes()
      return lista.filter((m) => String(m.pecaId || m.peca_id) === String(pecaId))
    },
    contexto: { entidade: 'estoque_movimentacoes', operacao: 'obterKardexPeca' },
  })
}

/**
 * Retorna o saldo atual de uma peça no estoque.
 * @param {string} pecaId
 * @returns {Promise<number>}
 */
export async function obterSaldoPeca(pecaId) {
  const peca = await obterPecaPorId(pecaId)
  if (!peca) return Promise.resolve(0)
  return Promise.resolve(Number(peca.estoqueAtual ?? peca.estoque ?? 0))
}
