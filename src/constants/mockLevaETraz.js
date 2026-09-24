// Módulo de Gerenciamento e Persistência de Leva e Traz e Logística da Oficina
// Regras do Sistema: Sem uso do caractere proibido ('&'), apenas 'e'
// Gerencia busca de veículos, entrega de veículos, coleta de peças e translado de clientes

export const CHAVE_STORAGE_LEVA_E_TRAZ = 'dev_oficina_leva_e_traz'
export const CHAVE_STORAGE_FROTA_APOIO = 'dev_oficina_frota_apoio'

export const TIPOS_SERVICO_LOGISTICA = [
  { value: 'TODOS', label: 'Todos os Tipos de Serviço' },
  { value: 'busca_veiculo', label: 'Busca de Carro de Cliente' },
  { value: 'entrega_veiculo', label: 'Entrega de Carro de Cliente' },
  { value: 'translado_cliente', label: 'Leva e Traz de Cliente (Carona)' },
  { value: 'busca_pecas', label: 'Busca de Peças em Fornecedor' },
  { value: 'socorro_externo', label: 'Socorro Mecânico Externo' },
]

export const STATUS_LOGISTICA = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'agendado', label: 'Agendado na Fila' },
  { value: 'em_deslocamento', label: 'Em Rota e Deslocamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

export const VEICULOS_APOIO_PADRAO = []

export const MOTORISTAS_PADRAO = []

export const SEED_LEVA_E_TRAZ = []

export function carregarDeslocamentos() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_LEVA_E_TRAZ)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao carregar deslocamentos:', e)
  }

  salvarDeslocamentos(SEED_LEVA_E_TRAZ)
  return SEED_LEVA_E_TRAZ
}

export function salvarDeslocamentos(lista) {
  try {
    localStorage.setItem(CHAVE_STORAGE_LEVA_E_TRAZ, JSON.stringify(lista))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  } catch (e) {
    console.error('Erro ao salvar deslocamentos:', e)
  }
}

export function carregarVeiculosDeApoio() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_FROTA_APOIO)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao ler frota de apoio:', e)
  }

  salvarVeiculosDeApoio(VEICULOS_APOIO_PADRAO)
  return VEICULOS_APOIO_PADRAO
}

export function salvarVeiculosDeApoio(lista) {
  try {
    localStorage.setItem(CHAVE_STORAGE_FROTA_APOIO, JSON.stringify(lista))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  } catch (e) {
    console.error('Erro ao salvar frota de apoio:', e)
  }
}

export function gerarProximoCodigoDeslocamento() {
  const lista = carregarDeslocamentos()
  let maxNum = 0
  lista.forEach((item) => {
    if (item.codigo) {
      const match = String(item.codigo).match(/\d+/)
      if (match) {
        const n = parseInt(match[0], 10)
        if (n > maxNum) maxNum = n
      }
    }
  })
  return `LOG-${String(maxNum + 1).padStart(4, '0')}`
}

export function criarNovoDeslocamento(dados) {
  const lista = carregarDeslocamentos()
  const proximoCodigo = gerarProximoCodigoDeslocamento()

  const novo = {
    ...dados,
    id: `desloc-${Date.now()}`,
    codigo: proximoCodigo,
    status: dados.status || 'agendado',
    data: dados.data || new Date().toLocaleDateString('pt-BR'),
  }

  lista.unshift(novo)
  salvarDeslocamentos(lista)
  return novo
}

export function atualizarDeslocamento(dadosAtualizados) {
  const lista = carregarDeslocamentos()
  const index = lista.findIndex((item) => item.id === dadosAtualizados.id)
  if (index !== -1) {
    lista[index] = {
      ...lista[index],
      ...dadosAtualizados,
    }
    salvarDeslocamentos(lista)
    return lista[index]
  }
  return null
}

export function iniciarDeslocamento(id) {
  const lista = carregarDeslocamentos()
  const index = lista.findIndex((item) => item.id === id)
  if (index === -1) return null

  const agora = new Date()
  const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  lista[index] = {
    ...lista[index],
    status: 'em_deslocamento',
    horarioSaidaReal: lista[index].horarioSaidaReal || horaAtual,
  }

  // Se tem veículo de apoio, marca como em_rota
  if (lista[index].veiculoApoioId) {
    const apoioFrota = carregarVeiculosDeApoio()
    const apoioIdx = apoioFrota.findIndex((v) => v.id === lista[index].veiculoApoioId)
    if (apoioIdx !== -1) {
      apoioFrota[apoioIdx].status = 'em_rota'
      apoioFrota[apoioIdx].emUsoPor = lista[index].motoristaPrincipalNome
      salvarVeiculosDeApoio(apoioFrota)
    }
  }

  salvarDeslocamentos(lista)
  return lista[index]
}

export function finalizarDeslocamento(id, dadosRetorno = {}) {
  const lista = carregarDeslocamentos()
  const index = lista.findIndex((item) => item.id === id)
  if (index === -1) return null

  const agora = new Date()
  const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const kmInicialNum = parseFloat(String(lista[index].kmInicial || '0').replace(/\./g, '').replace(',', '.')) || 0
  const kmFinalNum = parseFloat(String(dadosRetorno.kmFinal || '0').replace(/\./g, '').replace(',', '.')) || 0
  let kmRealizado = dadosRetorno.kmRealizado
  if (!kmRealizado && kmFinalNum > kmInicialNum) {
    kmRealizado = String(Math.round(kmFinalNum - kmInicialNum))
  }

  lista[index] = {
    ...lista[index],
    ...dadosRetorno,
    status: 'concluido',
    horarioRetornoReal: dadosRetorno.horarioRetornoReal || horaAtual,
    kmRealizado: kmRealizado || lista[index].kmEstimado || '',
  }

  // Libera veículo de apoio
  if (lista[index].veiculoApoioId) {
    const apoioFrota = carregarVeiculosDeApoio()
    const apoioIdx = apoioFrota.findIndex((v) => v.id === lista[index].veiculoApoioId)
    if (apoioIdx !== -1) {
      apoioFrota[apoioIdx].status = 'disponivel'
      apoioFrota[apoioIdx].emUsoPor = null
      if (dadosRetorno.kmFinal) {
        apoioFrota[apoioIdx].kmAtual = dadosRetorno.kmFinal
      }
      salvarVeiculosDeApoio(apoioFrota)
    }
  }

  salvarDeslocamentos(lista)
  return lista[index]
}

export function cancelarDeslocamento(id, motivo = '') {
  const lista = carregarDeslocamentos()
  const index = lista.findIndex((item) => item.id === id)
  if (index === -1) return null

  lista[index] = {
    ...lista[index],
    status: 'cancelado',
    motivoCancelamento: motivo,
  }

  // Libera veículo de apoio caso estivesse reservado
  if (lista[index].veiculoApoioId) {
    const apoioFrota = carregarVeiculosDeApoio()
    const apoioIdx = apoioFrota.findIndex((v) => v.id === lista[index].veiculoApoioId)
    if (apoioIdx !== -1) {
      apoioFrota[apoioIdx].status = 'disponivel'
      apoioFrota[apoioIdx].emUsoPor = null
      salvarVeiculosDeApoio(apoioFrota)
    }
  }

  salvarDeslocamentos(lista)
  return lista[index]
}

export function excluirDeslocamento(id) {
  const lista = carregarDeslocamentos()
  const filtrados = lista.filter((item) => item.id !== id)
  salvarDeslocamentos(filtrados)
}

export function gerarProximoCodigoApoio() {
  const lista = carregarVeiculosDeApoio()
  let maxNum = 0
  lista.forEach((item) => {
    if (item.codigo) {
      const match = String(item.codigo).match(/\d+/)
      if (match) {
        const n = parseInt(match[0], 10)
        if (n > maxNum) maxNum = n
      }
    }
  })
  return `APOIO-${String(maxNum + 1).padStart(2, '0')}`
}

export function criarVeiculoApoio(dados) {
  const lista = carregarVeiculosDeApoio()
  const proximoCodigo = gerarProximoCodigoApoio()

  const novo = {
    ...dados,
    id: `apoio-${Date.now()}`,
    codigo: proximoCodigo,
    status: 'disponivel',
    emUsoPor: null,
  }

  lista.push(novo)
  salvarVeiculosDeApoio(lista)
  return novo
}

export function atualizarVeiculoApoio(dadosAtualizados) {
  const lista = carregarVeiculosDeApoio()
  const index = lista.findIndex((item) => item.id === dadosAtualizados.id)
  if (index !== -1) {
    lista[index] = {
      ...lista[index],
      ...dadosAtualizados,
    }
    salvarVeiculosDeApoio(lista)
    return lista[index]
  }
  return null
}

export function excluirVeiculoApoio(id) {
  const lista = carregarVeiculosDeApoio()
  const filtrados = lista.filter((item) => item.id !== id)
  salvarVeiculosDeApoio(filtrados)
}
