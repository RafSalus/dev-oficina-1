import { isSupabaseConfigured, getSupabaseDataClient } from '../lib/supabase'
import {
  executarRepositorio,
  executarOperacao,
  paraCamelCase,
  isModoRemoto,
} from './supabaseHelpers'

export const STORAGE_KEY_FUNCIONARIOS = 'dev_oficina_funcionarios'

// Cargos e o portal correspondente (Story: login e cadastro de funcionários):
// analista -> acesso de admin (/gestao); gerente, mecanico, aux_mecanico -> acesso de
// mecânico (/mecanico); secretaria -> /secretaria. Ver PAPEL_POR_CARGO abaixo.
export const CARGOS_FUNCIONARIO_OPCOES = [
  { value: 'analista', label: 'Analista' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'mecanico', label: 'Mecânico' },
  { value: 'aux_mecanico', label: 'Aux. Mecânico' },
  { value: 'secretaria', label: 'Secretária' },
]

// Mapeia o cargo de RH para o papel (role) usado pelo ProtectedRoute/Supabase Auth
// (app_metadata.role, gravado só pelo servidor) ao provisionar o login — ver
// supabase/functions/criar-login-funcionario.
export const PAPEL_POR_CARGO = {
  analista: 'admin',
  gerente: 'mecanico',
  mecanico: 'mecanico',
  aux_mecanico: 'mecanico',
  secretaria: 'secretaria',
}

export const SEED_FUNCIONARIOS = []

function getStoredFuncionarios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FUNCIONARIOS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FUNCIONARIOS, JSON.stringify([]))
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setStoredFuncionarios(lista) {
  try {
    localStorage.setItem(STORAGE_KEY_FUNCIONARIOS, JSON.stringify(lista))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('dev_oficina_funcionarios_updated'))
    }
  } catch (err) {
    console.error('Erro ao gravar funcionários:', err)
  }
}

function normalizarFuncionarioCamel(f) {
  if (!f) return null
  const itemCamel = paraCamelCase(f)
  return {
    ...itemCamel,
    cargoLabel: f.cargo_label || itemCamel.cargoLabel || itemCamel.cargo,
    boxElevador: f.box_elevador || itemCamel.boxElevador || '',
    comissaoServicos: Number(itemCamel.comissaoServicos ?? 0),
    comissaoPecas: Number(itemCamel.comissaoPecas ?? 0),
    dataAdmissao: f.data_admissao || itemCamel.dataAdmissao || '',
    horarioTrabalho: f.horario_trabalho || itemCamel.horarioTrabalho || '',
    authUserId: f.auth_user_id || itemCamel.authUserId || null,
  }
}

/**
 * Carrega a lista de colaboradores com filtros opcionais.
 * @param {Object} [filtros]
 * @param {boolean} [filtros.apenasAtivos]
 * @param {string} [filtros.cargo]
 * @returns {Promise<Array>}
 */
export async function carregarFuncionarios({ apenasAtivos = false, cargo = null } = {}) {
  let lista = await executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const resposta = await client.from('funcionarios').select('*')
      const data = await executarOperacao(resposta, {
        entidade: 'funcionarios',
        operacao: 'carregarFuncionarios',
      })
      return (data || []).map(normalizarFuncionarioCamel)
    },
    local: () => getStoredFuncionarios(),
    contexto: { entidade: 'funcionarios', operacao: 'carregarFuncionarios' },
  })

  if (apenasAtivos) {
    lista = lista.filter((f) => f.ativo)
  }
  if (cargo) {
    lista = lista.filter((f) => f.cargo === cargo)
  }
  return lista
}

/**
 * Busca um colaborador por seu ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function obterFuncionarioPorId(id) {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const resposta = await client.from('funcionarios').select('*').eq('id', id).maybeSingle()
      const data = await executarOperacao(resposta, {
        entidade: 'funcionarios',
        operacao: 'obterFuncionarioPorId',
      })
      return normalizarFuncionarioCamel(data) ?? null
    },
    local: () => {
      const lista = getStoredFuncionarios()
      const found = lista.find((f) => String(f.id) === String(id))
      return found || null
    },
    contexto: { entidade: 'funcionarios', operacao: 'obterFuncionarioPorId' },
  })
}

export const CARGOS_ELEGIVEIS_ATRIBUICAO = ['mecanico', 'aux_mecanico', 'gerente']

// Exposição mínima (Regra 14): só identificação, nunca CPF, telefone, comissão ou e-mail.
function projetarMecanicoAtivo(f) {
  return {
    id: f.id,
    nome: f.nome,
    cargo: f.cargo,
    ativo: true,
    value: f.id,
    label: f.nome,
  }
}

/**
 * Retorna os mecânicos ativos elegíveis para atribuição de OS e Agenda, com exposição mínima
 * (id, nome, cargo). No Supabase usa a RPC `obter_mecanicos_ativos()` (Story 2.3), acessível à
 * secretaria sem abrir a tabela `funcionarios`.
 * @returns {Promise<Array<{id: string, nome: string, cargo: string, ativo: boolean, value: string, label: string}>>}
 */
export async function obterMecanicosAtivos() {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const resposta = await client.rpc('obter_mecanicos_ativos')
      const data = await executarOperacao(resposta, {
        entidade: 'funcionarios',
        operacao: 'obterMecanicosAtivos',
      })
      return (data || []).map(projetarMecanicoAtivo)
    },
    local: () =>
      getStoredFuncionarios()
        .filter((f) => f.ativo && CARGOS_ELEGIVEIS_ATRIBUICAO.includes(f.cargo))
        .map(projetarMecanicoAtivo),
    contexto: { entidade: 'funcionarios', operacao: 'obterMecanicosAtivos' },
  })
}

/**
 * Cria ou atualiza um colaborador.
 * @param {Object} funcionario
 * @returns {Promise<Object>}
 */
export async function salvarFuncionario(funcionario) {
  const id = funcionario.id || `func-${Date.now()}`
  const cargoItem = CARGOS_FUNCIONARIO_OPCOES.find((c) => c.value === funcionario.cargo)
  const cargoLabel = cargoItem ? cargoItem.label : funcionario.cargo

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const payloadSnake = {
        id,
        nome: funcionario.nome,
        cpf: funcionario.cpf ? funcionario.cpf.replace(/\D/g, '') : null,
        telefone: funcionario.telefone || null,
        cargo: funcionario.cargo,
        cargo_label: funcionario.cargoLabel || cargoLabel,
        especialidade: funcionario.especialidade || null,
        email: funcionario.email ? funcionario.email.trim().toLowerCase() : null,
        box_elevador: funcionario.boxElevador || null,
        comissao_servicos: Number(funcionario.comissaoServicos) || 0,
        comissao_pecas: Number(funcionario.comissaoPecas) || 0,
        data_admissao: funcionario.dataAdmissao || new Date().toISOString().slice(0, 10),
        horario_trabalho: funcionario.horarioTrabalho || '08:00 às 19:00',
        ativo: funcionario.ativo !== false,
        observacoes: funcionario.observacoes || null,
      }
      if (funcionario.authUserId) {
        payloadSnake.auth_user_id = funcionario.authUserId
      }

      const resposta = await client
        .from('funcionarios')
        .upsert(payloadSnake)
        .select()
        .single()

      const data = await executarOperacao(
        resposta,
        { entidade: 'funcionarios', operacao: 'salvarFuncionario' },
        { esperaLinhasAfetadas: true }
      )

      return normalizarFuncionarioCamel(data)
    },
    local: () => {
      const listaLocal = getStoredFuncionarios()
      const index = listaLocal.findIndex((f) => String(f.id) === String(id))
      const authUserIdExistente = index >= 0 ? listaLocal[index].authUserId : null

      const atualizado = {
        ...funcionario,
        id,
        cargoLabel: funcionario.cargoLabel || cargoLabel,
        comissaoServicos: Number(funcionario.comissaoServicos) || 0,
        comissaoPecas: Number(funcionario.comissaoPecas) || 0,
        ativo: funcionario.ativo !== false,
        authUserId: funcionario.authUserId || authUserIdExistente || null,
        dataAtualizacao: new Date().toISOString(),
      }

      if (index >= 0) {
        listaLocal[index] = atualizado
      } else {
        atualizado.dataCadastro = new Date().toISOString()
        listaLocal.unshift(atualizado)
      }
      setStoredFuncionarios(listaLocal)
      return atualizado
    },
    contexto: { entidade: 'funcionarios', operacao: 'salvarFuncionario' },
    esperaLinhasAfetadas: true,
  })
}

/**
 * Alterna o status (ativo/inativo) de um colaborador.
 * @param {string} id
 * @param {boolean} ativo
 * @returns {Promise<Object|null>}
 */
export async function alternarStatusFuncionario(id, ativo) {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const resposta = await client
        .from('funcionarios')
        .update({ ativo: Boolean(ativo) })
        .eq('id', id)
        .select()
        .single()

      const data = await executarOperacao(
        resposta,
        { entidade: 'funcionarios', operacao: 'alternarStatusFuncionario' },
        { esperaLinhasAfetadas: true }
      )

      return normalizarFuncionarioCamel(data)
    },
    local: () => {
      const lista = getStoredFuncionarios()
      const index = lista.findIndex((f) => String(f.id) === String(id))
      if (index >= 0) {
        lista[index] = {
          ...lista[index],
          ativo: Boolean(ativo),
          dataAtualizacao: new Date().toISOString(),
        }
        setStoredFuncionarios(lista)
        return lista[index]
      }
      return null
    },
    contexto: { entidade: 'funcionarios', operacao: 'alternarStatusFuncionario' },
    esperaLinhasAfetadas: true,
  })
}

/**
 * Exclui um colaborador pelo identificador.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function excluirFuncionario(id) {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const resposta = await client.from('funcionarios').delete().eq('id', id).select()
      await executarOperacao(
        resposta,
        { entidade: 'funcionarios', operacao: 'excluirFuncionario' },
        { esperaLinhasAfetadas: true }
      )
      return true
    },
    local: () => {
      const lista = getStoredFuncionarios()
      const filtrada = lista.filter((f) => String(f.id) !== String(id))
      if (filtrada.length !== lista.length) {
        setStoredFuncionarios(filtrada)
        return true
      }
      return false
    },
    contexto: { entidade: 'funcionarios', operacao: 'excluirFuncionario' },
    esperaLinhasAfetadas: true,
  })
}

/**
 * Provisiona o login real (Supabase Auth) de um colaborador já cadastrado, via Edge Function
 * (única forma segura de usar a service_role key — nunca é exposta ao navegador).
 * @param {string} funcionarioId
 * @returns {Promise<{ok: boolean, message?: string, authUserId?: string}>}
 */
export async function criarLoginFuncionario(funcionarioId) {
  const client = getSupabaseDataClient()
  if (!isSupabaseConfigured || !client) {
    return { ok: false, message: 'Recurso indisponível: Supabase não está configurado neste ambiente.' }
  }

  try {
    const { data, error } = await client.functions.invoke('criar-login-funcionario', {
      body: { funcionarioId },
    })

    if (error) {
      console.error('[funcionariosRepository][criarLoginFuncionario] Erro na Edge Function:', error)
      const mensagem = data?.message || error.message || 'Erro ao criar acesso de login.'
      return { ok: false, message: mensagem }
    }
    if (!data?.ok) {
      return { ok: false, message: data?.message || 'Erro ao criar acesso de login.' }
    }

    if (!isModoRemoto()) {
      const lista = getStoredFuncionarios()
      const index = lista.findIndex((f) => String(f.id) === String(funcionarioId))
      if (index >= 0) {
        lista[index] = { ...lista[index], authUserId: data.authUserId }
        setStoredFuncionarios(lista)
      }
    }

    return { ok: true, authUserId: data.authUserId }
  } catch (err) {
    console.error('[funcionariosRepository][criarLoginFuncionario] Falha de comunicação:', err)
    return { ok: false, message: err.message || 'Erro ao chamar o serviço de criação de login.' }
  }
}
