import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const STORAGE_KEY_FUNCIONARIOS = 'dev_oficina_funcionarios'

export const CARGOS_FUNCIONARIO_OPCOES = [
  { value: 'mecanico', label: 'Mecânico Especialista' },
  { value: 'secretaria', label: 'Secretária / Atendimento' },
  { value: 'gerente', label: 'Gerente Geral' },
  { value: 'eletricista', label: 'Eletricista Automotivo' },
  { value: 'auxiliar', label: 'Auxiliar de Mecânica' },
]

export const SEED_FUNCIONARIOS = [
  {
    id: 'admin-rafael',
    nome: 'Rafael Amaral Salustiano',
    cpf: '401.928.374-55',
    telefone: '(43) 99185-1501',
    cargo: 'gerente',
    cargoLabel: 'Administrador & Proprietário',
    especialidade: 'Direção Geral, Diagnóstico Avançado e Gestão da Oficina',
    email: 'rtzrafael@gmail.com',
    endereco: 'Rua Aquiles, 554, Vila Shangri-La, Apucarana - PR',
    cep: '86812-480',
    numero: '554',
    comissaoServicos: 0,
    comissaoPecas: 0,
    dataAdmissao: '2020-01-01',
    horarioTrabalho: 'Integral / Acesso 24h',
    boxElevador: 'Geral / Administrativo',
    ativo: true,
    observacoes: 'Sócio-proprietário e Administrador do Sistema.',
  },
  {
    id: 'func-carlos',
    nome: 'Carlos Eduardo Silveira',
    cpf: '284.910.482-15',
    telefone: '(43) 99876-1122',
    cargo: 'mecanico',
    cargoLabel: 'Chefe de Oficina',
    especialidade: 'Injeção Eletrônica e Motor',
    email: 'carlos.eduardo@mecanicagabriel.com.br',
    comissaoServicos: 15.0,
    comissaoPecas: 2.5,
    dataAdmissao: '2022-03-10',
    horarioTrabalho: '08:00 às 19:00',
    boxElevador: 'Box 01 (Elevador Hidráulico)',
    ativo: true,
    observacoes: 'Chefe da equipe técnica de oficina.',
  },
  {
    id: 'func-gabriel',
    nome: 'Gabriel Amaral',
    cpf: '392.817.409-88',
    telefone: '(43) 99876-3344',
    cargo: 'mecanico',
    cargoLabel: 'Mecânico Especialista',
    especialidade: 'Suspensão, Freios e Geometria 3D',
    email: 'gabriel.amaral@mecanicagabriel.com.br',
    comissaoServicos: 12.0,
    comissaoPecas: 2.0,
    dataAdmissao: '2023-01-15',
    horarioTrabalho: '08:00 às 19:00',
    boxElevador: 'Box 02 (Alinhador 3D)',
    ativo: true,
    observacoes: 'Especialista em alinhamento 3D e suspensão esportiva.',
  },
  {
    id: 'func-rafael',
    nome: 'Rafael Salustiano',
    cpf: '401.928.374-55',
    telefone: '(43) 99876-5566',
    cargo: 'mecanico',
    cargoLabel: 'Mecânico Pleno',
    especialidade: 'Transmissão, Câmbio e Embreagem',
    email: 'rafael.salustiano@mecanicagabriel.com.br',
    comissaoServicos: 10.0,
    comissaoPecas: 2.0,
    dataAdmissao: '2023-08-01',
    horarioTrabalho: '08:00 às 19:00',
    boxElevador: 'Box 03 (Elevador 4 Toneladas)',
    ativo: true,
    observacoes: 'Responsável pelas trocas de embreagem e reparos de transmissão.',
  },
  {
    id: 'func-bianca',
    nome: 'Bianca Amaral',
    cpf: '512.637.819-20',
    telefone: '(43) 99812-4455',
    cargo: 'secretaria',
    cargoLabel: 'Secretária e Recepção',
    especialidade: 'Atendimento, Triagem e Orçamentos',
    email: 'bianca.amaral@mecanicagabriel.com.br',
    comissaoServicos: 2.0,
    comissaoPecas: 1.0,
    dataAdmissao: '2021-06-20',
    horarioTrabalho: '08:00 às 19:00',
    ativo: true,
    observacoes: 'Responsável pela recepção presencial, checklist de entrada e orçamentos.',
  },
  {
    id: 'func-danilo',
    nome: 'Danilo Silva',
    cpf: '601.782.910-33',
    telefone: '(43) 99876-9900',
    cargo: 'eletricista',
    cargoLabel: 'Eletricista Automotivo',
    especialidade: 'Elétrica, Baterias e Ar Condicionado',
    email: 'danilo.silva@mecanicagabriel.com.br',
    comissaoServicos: 12.0,
    comissaoPecas: 2.0,
    dataAdmissao: '2024-02-01',
    horarioTrabalho: '08:00 às 19:00',
    boxElevador: 'Box 05 (Bancada Elétrica)',
    ativo: true,
    observacoes: 'Técnico certificado em diagnósticos elétricos e ar condicionado.',
  },
]

function getStoredFuncionarios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FUNCIONARIOS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FUNCIONARIOS, JSON.stringify(SEED_FUNCIONARIOS))
      return [...SEED_FUNCIONARIOS]
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      // Garantir que Rafael Amaral Salustiano esteja sempre registrado
      const indexAdmin = parsed.findIndex((f) => f.email === 'rtzrafael@gmail.com')
      if (indexAdmin < 0) {
        parsed.unshift(SEED_FUNCIONARIOS[0])
        localStorage.setItem(STORAGE_KEY_FUNCIONARIOS, JSON.stringify(parsed))
      }
      return parsed
    }
    return [...SEED_FUNCIONARIOS]
  } catch {
    return [...SEED_FUNCIONARIOS]
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
      (f) => f.ativo && (f.cargo === 'mecanico' || f.cargo === 'eletricista' || f.cargo === 'auxiliar')
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

  const atualizado = {
    ...funcionario,
    id,
    cargoLabel: funcionario.cargoLabel || cargoLabel,
    comissaoServicos: Number(funcionario.comissaoServicos) || 0,
    comissaoPecas: Number(funcionario.comissaoPecas) || 0,
    ativo: funcionario.ativo !== false,
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
