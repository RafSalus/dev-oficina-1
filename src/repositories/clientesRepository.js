import { MOCK_CLIENTES_VEICULOS } from '../constants/mockClientesVeiculos'

export const STORAGE_KEY_CLIENTES = 'dev_oficina_clientes'

function getStoredClientes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLIENTES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(MOCK_CLIENTES_VEICULOS))
      return [...MOCK_CLIENTES_VEICULOS]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [...MOCK_CLIENTES_VEICULOS]
  } catch {
    return [...MOCK_CLIENTES_VEICULOS]
  }
}

function setStoredClientes(clientes) {
  try {
    localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes))
  } catch (err) {
    console.error('Erro ao gravar clientes no storage:', err)
  }
}

/**
 * Carrega a lista completa de clientes cadastrados.
 * @returns {Promise<Array>}
 */
export async function carregarClientes() {
  return Promise.resolve(getStoredClientes())
}

/**
 * Busca um cliente por seu identificador único (value ou id).
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function obterClientePorId(id) {
  const lista = getStoredClientes()
  const found = lista.find((c) => String(c.value) === String(id) || String(c.id) === String(id))
  return Promise.resolve(found || null)
}

/**
 * Busca um cliente pelo CPF ou CNPJ (apenas dígitos).
 * @param {string} documento
 * @returns {Promise<Object|null>}
 */
export async function buscarClientePorDocumento(documento) {
  const digits = (documento || '').replace(/\D/g, '')
  if (!digits) return Promise.resolve(null)
  const lista = getStoredClientes()
  const found = lista.find((c) => {
    const cDoc = (c.documento || '').replace(/\D/g, '')
    return cDoc === digits
  })
  return Promise.resolve(found || null)
}

/**
 * Cria ou atualiza um cliente no cadastro.
 * @param {Object} cliente
 * @returns {Promise<Object>}
 */
export async function salvarCliente(cliente) {
  const lista = getStoredClientes()
  const id = cliente.value || cliente.id || `cli-${Date.now()}`
  const index = lista.findIndex((c) => String(c.value) === String(id) || String(c.id) === String(id))

  const clienteAtualizado = {
    ...cliente,
    value: id,
    id,
    dataAtualizacao: new Date().toISOString(),
  }

  if (index >= 0) {
    lista[index] = clienteAtualizado
  } else {
    clienteAtualizado.dataCadastro = new Date().toISOString()
    lista.unshift(clienteAtualizado)
  }

  setStoredClientes(lista)
  return Promise.resolve(clienteAtualizado)
}

/**
 * Exclui um cliente pelo identificador.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function excluirCliente(id) {
  const lista = getStoredClientes()
  const filtrada = lista.filter((c) => String(c.value) !== String(id) && String(c.id) !== String(id))
  if (filtrada.length !== lista.length) {
    setStoredClientes(filtrada)
    return Promise.resolve(true)
  }
  return Promise.resolve(false)
}

/**
 * Retorna a lista de veículos pertencentes a um cliente específico.
 * @param {string} clienteId
 * @returns {Promise<Array>}
 */
export async function obterVeiculosDoCliente(clienteId) {
  const cliente = await obterClientePorId(clienteId)
  return Promise.resolve(cliente?.veiculos || [])
}
