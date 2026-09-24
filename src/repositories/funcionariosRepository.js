import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
// (user_metadata.role) ao provisionar o login — ver supabase/functions/criar-login-funcionario.
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
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
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

/**
 * Carrega a lista de colaboradores com filtros opcionais.
 * @param {Object} [filtros]
 * @param {boolean} [filtros.apenasAtivos]
 * @param {string} [filtros.cargo]
 * @returns {Promise<Array>}
 */
export async function carregarFuncionarios({ apenasAtivos = false, cargo = null } = {}) {
  let lista = getStoredFuncionarios()

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('funcionarios').select('*')
      if (!error && Array.isArray(data) && data.length > 0) {
        lista = data.map((f) => ({
          ...f,
          cargoLabel: f.cargo_label || f.cargoLabel || f.cargo,
          boxElevador: f.box_elevador || f.boxElevador || '',
          comissaoServicos: Number(f.comissao_servicos ?? f.comissaoServicos ?? 0),
          comissaoPecas: Number(f.comissao_pecas ?? f.comissaoPecas ?? 0),
          dataAdmissao: f.data_admissao || f.dataAdmissao || '',
          horarioTrabalho: f.horario_trabalho || f.horarioTrabalho || '',
          authUserId: f.auth_user_id || f.authUserId || null,
        }))
        setStoredFuncionarios(lista)
      }
    } catch {
      // Fallback transparente para cache local
    }
  }

  if (apenasAtivos) {
    lista = lista.filter((f) => f.ativo)
  }
  if (cargo) {
    lista = lista.filter((f) => f.cargo === cargo)
  }
  return Promise.resolve(lista)
}

/**
 * Busca um colaborador por seu ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function obterFuncionarioPorId(id) {
  const lista = getStoredFuncionarios()
  const found = lista.find((f) => String(f.id) === String(id))
  return Promise.resolve(found || null)
}

/**
 * Retorna os mecânicos e eletricistas ativos elegíveis para atribuição de OS e Agenda.
 * @returns {Promise<Array>}
 */
export async function obterMecanicosAtivos() {
  const lista = getStoredFuncionarios()
  const elegiveis = lista
    .filter(
      (f) => f.ativo && (f.cargo === 'mecanico' || f.cargo === 'aux_mecanico' || f.cargo === 'gerente')
    )
    .map((f) => ({
      ...f,
      value: f.id,
      label: f.nome,
    }))
  return Promise.resolve(elegiveis)
}

/**
 * Cria ou atualiza um colaborador.
 * @param {Object} funcionario
 * @returns {Promise<Object>}
 */
export async function salvarFuncionario(funcionario) {
  const lista = getStoredFuncionarios()
  const id = funcionario.id || `func-${Date.now()}`
  const index = lista.findIndex((f) => String(f.id) === String(id))

  const cargoItem = CARGOS_FUNCIONARIO_OPCOES.find((c) => c.value === funcionario.cargo)
  const cargoLabel = cargoItem ? cargoItem.label : funcionario.cargo

  // authUserId nunca vem do formulário de cadastro — só é gravado pela Edge Function
  // criar-login-funcionario. Preserva o valor já existente ao editar, para não perder o
  // vínculo com a conta de login a cada "Salvar Colaborador".
  const authUserIdExistente = index >= 0 ? lista[index].authUserId : null

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
    lista[index] = atualizado
  } else {
    atualizado.dataCadastro = new Date().toISOString()
    lista.unshift(atualizado)
  }

  setStoredFuncionarios(lista)

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('funcionarios').upsert({
        id: atualizado.id,
        nome: atualizado.nome,
        cpf: atualizado.cpf,
        telefone: atualizado.telefone,
        cargo: atualizado.cargo,
        cargo_label: atualizado.cargoLabel,
        especialidade: atualizado.especialidade || null,
        email: atualizado.email || null,
        box_elevador: atualizado.boxElevador || null,
        comissao_servicos: atualizado.comissaoServicos,
        comissao_pecas: atualizado.comissaoPecas,
        data_admissao: atualizado.dataAdmissao || new Date().toISOString().slice(0, 10),
        horario_trabalho: atualizado.horarioTrabalho || '08:00 às 19:00',
        ativo: atualizado.ativo,
        observacoes: atualizado.observacoes || null,
      })
    } catch {
      // Fallback em caso de offline
    }
  }

  return Promise.resolve(atualizado)
}

/**
 * Alterna o status (ativo/inativo) de um colaborador.
 * @param {string} id
 * @param {boolean} ativo
 * @returns {Promise<Object|null>}
 */
export async function alternarStatusFuncionario(id, ativo) {
  const lista = getStoredFuncionarios()
  const index = lista.findIndex((f) => String(f.id) === String(id))
  if (index >= 0) {
    lista[index] = {
      ...lista[index],
      ativo: Boolean(ativo),
      dataAtualizacao: new Date().toISOString(),
    }
    setStoredFuncionarios(lista)

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('funcionarios').update({ ativo: Boolean(ativo) }).eq('id', id)
      } catch {}
    }

    return Promise.resolve(lista[index])
  }
  return Promise.resolve(null)
}

/**
 * Exclui um colaborador pelo identificador.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function excluirFuncionario(id) {
  const lista = getStoredFuncionarios()
  const filtrada = lista.filter((f) => String(f.id) !== String(id))
  if (filtrada.length !== lista.length) {
    setStoredFuncionarios(filtrada)

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('funcionarios').delete().eq('id', id)
      } catch {}
    }

    return Promise.resolve(true)
  }
  return Promise.resolve(false)
}

/**
 * Provisiona o login real (Supabase Auth) de um colaborador já cadastrado, via Edge Function
 * (única forma segura de usar a service_role key — nunca é exposta ao navegador). O funcionário
 * recebe um e-mail de convite do Supabase para definir a própria senha; o cargo é convertido
 * para o papel de portal correspondente (ver PAPEL_POR_CARGO) e gravado em user_metadata.role.
 *
 * Requer que `funcionario.email` esteja preenchido e que ainda não exista `authUserId`.
 * @param {string} funcionarioId
 * @returns {Promise<{ok: boolean, message?: string, authUserId?: string}>}
 */
export async function criarLoginFuncionario(funcionarioId) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, message: 'Recurso indisponível: Supabase não está configurado neste ambiente.' }
  }

  try {
    const { data, error } = await supabase.functions.invoke('criar-login-funcionario', {
      body: { funcionarioId },
    })

    if (error) {
      const mensagem = data?.message || error.message || 'Erro ao criar acesso de login.'
      return { ok: false, message: mensagem }
    }
    if (!data?.ok) {
      return { ok: false, message: data?.message || 'Erro ao criar acesso de login.' }
    }

    const lista = getStoredFuncionarios()
    const index = lista.findIndex((f) => String(f.id) === String(funcionarioId))
    if (index >= 0) {
      lista[index] = { ...lista[index], authUserId: data.authUserId }
      setStoredFuncionarios(lista)
    }

    return { ok: true, authUserId: data.authUserId }
  } catch (err) {
    return { ok: false, message: err.message || 'Erro ao chamar o serviço de criação de login.' }
  }
}
