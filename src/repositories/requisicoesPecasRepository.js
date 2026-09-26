/**
 * Repositório assíncrono de Requisições de Peças — Story 2.15 / ADR-005.
 * Supabase (fail-closed, sem fallback em falha) ou localStorage apenas no modo local (dev/teste).
 * RLS D5: o mecânico só lê e cria as próprias requisições; o solicitante vem da sessão.
 */

import { getSupabaseDataClient } from '../lib/supabase'
import { executarRepositorio, executarOperacao } from './supabaseHelpers'
import { ErroRepositorio, CODIGOS_ERRO } from './erroRepositorio'
import {
  mapearRequisicaoParaDominio,
  mapearNovaRequisicaoParaDb,
  statusParaCodigo,
  statusParaRotulo,
  formatarDataHora,
} from './mapeadores/requisicoesPecas'

export const STORAGE_KEY_REQUISICOES_PECAS = 'dev_oficina_requisicoes_pecas'

const CONTEXTO = { entidade: 'requisicoes_pecas' }

function lerLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUISICOES_PECAS)
    const lista = raw ? JSON.parse(raw) : []
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function gravarLocal(lista) {
  localStorage.setItem(STORAGE_KEY_REQUISICOES_PECAS, JSON.stringify(lista))
}

function validarNova(dados) {
  if (!dados || !String(dados.pecaNome || '').trim()) {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'Informe a peça a ser requisitada.', {
      contexto: { ...CONTEXTO, operacao: 'criar' },
    })
  }
}

/**
 * Requisições visíveis para a sessão (mais recentes primeiro). Para o mecânico, o RLS devolve
 * só as dele (D5).
 * @returns {Promise<Array>}
 */
export async function carregarRequisicoesPecas() {
  const contexto = { ...CONTEXTO, operacao: 'carregar' }
  return executarRepositorio({
    contexto,
    remoto: async () => {
      const data = await executarOperacao(
        getSupabaseDataClient().from('requisicoes_pecas').select('*').order('created_at', { ascending: false }),
        contexto
      )
      return (data || []).map(mapearRequisicaoParaDominio)
    },
    local: () => lerLocal(),
  })
}

/**
 * Cria uma requisição. No Supabase o id, o solicitante (funcionario_atual_id) e a data vêm do banco.
 * @param {{numeroOS, veiculo, pecaNome, codigoPeca, quantidade, urgencia, mecanicoNome, ordemServicoId?, pecaId?}} dados
 * @returns {Promise<Object>} requisição criada
 */
export async function criarRequisicaoPeca(dados) {
  validarNova(dados)
  const contexto = { ...CONTEXTO, operacao: 'criar' }
  return executarRepositorio({
    contexto,
    remoto: async () => {
      const data = await executarOperacao(
        getSupabaseDataClient()
          .from('requisicoes_pecas')
          .insert(mapearNovaRequisicaoParaDb(dados))
          .select()
          .single(),
        contexto,
        { esperaLinhasAfetadas: true }
      )
      return mapearRequisicaoParaDominio(data)
    },
    local: () => {
      const linha = mapearNovaRequisicaoParaDb(dados)
      const agora = new Date().toISOString()
      const nova = mapearRequisicaoParaDominio({
        ...linha,
        id: `req-${Date.now()}`,
        status: 'aguardando_separacao',
        created_at: agora,
        updated_at: agora,
      })
      gravarLocal([nova, ...lerLocal()])
      return nova
    },
  })
}

/**
 * Atualiza só o status (atender/recusar/cancelar). Não gera movimentação de estoque (AC6).
 * @param {string} id
 * @param {string} status código ('atendida') ou rótulo ('Atendida')
 * @param {{motivoRecusa?: string}} [extras]
 * @returns {Promise<Object>} requisição atualizada
 */
export async function atualizarStatusRequisicao(id, status, { motivoRecusa } = {}) {
  const codigo = status ? statusParaCodigo(status) : null
  const contexto = { ...CONTEXTO, operacao: 'atualizarStatus' }
  if (!id || !codigo) {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, `Status de requisição inválido: ${status}`, { contexto })
  }
  const campos = { status: codigo }
  // atendido_em/atendido_por_id são registrados pelo banco (trigger), não pelo cliente
  if (codigo === 'recusada') campos.motivo_recusa = motivoRecusa || null

  return executarRepositorio({
    contexto,
    remoto: async () => {
      const data = await executarOperacao(
        getSupabaseDataClient().from('requisicoes_pecas').update(campos).eq('id', id).select().single(),
        contexto,
        { esperaLinhasAfetadas: true }
      )
      return mapearRequisicaoParaDominio(data)
    },
    local: () => {
      const lista = lerLocal()
      const indice = lista.findIndex((r) => r.id === id)
      if (indice < 0) {
        throw new ErroRepositorio(CODIGOS_ERRO.SEM_PERMISSAO, 'Requisição não encontrada.', { contexto })
      }
      lista[indice] = {
        ...lista[indice],
        status: statusParaRotulo(codigo),
        motivoRecusa: campos.motivo_recusa ?? lista[indice].motivoRecusa ?? '',
        atualizadoEm: new Date().toISOString(),
        dataHora: lista[indice].dataHora || formatarDataHora(lista[indice].criadoEm),
      }
      gravarLocal(lista)
      return lista[indice]
    },
  })
}
