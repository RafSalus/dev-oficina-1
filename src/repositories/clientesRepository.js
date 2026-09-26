/**
 * Repositório assíncrono de Clientes (Story 2.5 / ADR-005).
 * Implementa padrão fail-closed com persistência no Supabase Postgres
 * e modo local isolado (dev_oficina_clientes_v2) para testes/dev.
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
  clienteParaLinha,
  linhaParaCliente,
  normalizarDigitos,
} from './mapeadores/clientesVeiculos'
export { obterVeiculosDoCliente } from './veiculosRepository'

export const STORAGE_KEY_CLIENTES = 'dev_oficina_clientes_v2'
export const STORAGE_KEY_VEICULOS = 'dev_oficina_veiculos_v2'

function getStoredClientes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLIENTES)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setStoredClientes(clientes) {
  try {
    localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('dev_oficina_clientes_v2_updated'))
    }
  } catch (err) {
    console.error('Erro ao gravar clientes no storage:', err)
  }
}

function gerarProximoCodigoLocal(clientesExistentes) {
  let maxNum = 165
  if (Array.isArray(clientesExistentes)) {
    clientesExistentes.forEach((cli) => {
      if (cli && cli.codigoCliente) {
        const parsed = parseInt(String(cli.codigoCliente).replace(/\D/g, ''), 10)
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed
        }
      }
    })
  }
  return String(maxNum + 1).padStart(7, '0')
}

/**
 * Carrega a lista de clientes cadastrados.
 * @param {object} [opcoes]
 * @param {boolean} [opcoes.incluirVeiculos=false] - Se true, inclui os veículos vinculados
 * @returns {Promise<Array<object>>}
 */
export async function carregarClientes({ incluirVeiculos = false } = {}) {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const selectQuery = incluirVeiculos ? '*, veiculos(*)' : '*'
      const query = client
        .from('clientes')
        .select(selectQuery)
        .order('created_at', { ascending: false })

      const data = await executarOperacao(query, {
        entidade: 'clientes',
        operacao: 'carregarClientes',
      })

      return (data || []).map((linha) => linhaParaCliente(linha))
    },
    local: () => {
      const lista = getStoredClientes()
      if (!incluirVeiculos) return lista

      let veiculos = []
      try {
        const rawV = localStorage.getItem(STORAGE_KEY_VEICULOS)
        if (rawV) veiculos = JSON.parse(rawV) || []
      } catch {}

      return lista.map((cli) => {
        const veicsDoCli = veiculos.filter((v) => v.clienteId === cli.id || v.clienteId === cli.value)
        return { ...cli, veiculos: veicsDoCli }
      })
    },
    contexto: { entidade: 'clientes', operacao: 'carregarClientes' },
  })
}

/**
 * Busca um cliente pelo seu identificador único.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function obterClientePorId(id) {
  if (!id) return Promise.resolve(null)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client
        .from('clientes')
        .select('*, veiculos(*)')
        .eq('id', id)
        .maybeSingle()

      const data = await executarOperacao(query, {
        entidade: 'clientes',
        operacao: 'obterClientePorId',
      })

      return data ? linhaParaCliente(data) : null
    },
    local: () => {
      const lista = getStoredClientes()
      const found = lista.find((c) => String(c.id) === String(id) || String(c.value) === String(id))
      return found || null
    },
    contexto: { entidade: 'clientes', operacao: 'obterClientePorId' },
  })
}

/**
 * Busca cliente por CPF/CNPJ com normalização de dígitos no servidor.
 * @param {string} documento
 * @returns {Promise<object|null>}
 */
export async function buscarClientePorDocumento(documento) {
  const digitos = normalizarDigitos(documento)
  if (!digitos) return Promise.resolve(null)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client
        .from('clientes')
        .select('*, veiculos(*)')
        .eq('cpf_cnpj', digitos)
        .maybeSingle()

      const data = await executarOperacao(query, {
        entidade: 'clientes',
        operacao: 'buscarClientePorDocumento',
      })

      return data ? linhaParaCliente(data) : null
    },
    local: () => {
      const lista = getStoredClientes()
      const found = lista.find((c) => normalizarDigitos(c.documento || c.cpfCnpj || c.cpf_cnpj) === digitos)
      return found || null
    },
    contexto: { entidade: 'clientes', operacao: 'buscarClientePorDocumento' },
  })
}

/**
 * Salva ou atualiza um cliente com checagem otimista de updated_at (ADR-005 §2.7).
 * @param {object} cliente
 * @returns {Promise<object>} Cliente salvo no formato do front
 */
export async function salvarCliente(cliente) {
  if (!cliente || typeof cliente !== 'object') {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'Dados de cliente inválidos.')
  }

  const idExistente = cliente.id && !String(cliente.id).startsWith('cli-') ? cliente.id : null

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const payloadLinha = clienteParaLinha(cliente)

      const contexto = {
        entidade: 'clientes',
        operacao: 'salvarCliente',
        mensagensCustomizadas: {
          [CODIGOS_ERRO.DUPLICADO]: 'CPF/CNPJ já cadastrado',
        },
      }

      if (idExistente) {
        // UPDATE por linha com verificação otimista de updated_at se informado
        delete payloadLinha.id
        let updateQuery = client.from('clientes').update(payloadLinha).eq('id', idExistente)

        if (cliente.updatedAt) {
          updateQuery = updateQuery.eq('updated_at', cliente.updatedAt)
        }

        const resposta = await updateQuery.select('*, veiculos(*)').maybeSingle()
        if (resposta.error) {
          throw mapearErroPostgres(resposta.error, contexto)
        }

        if (!resposta.data) {
          // Checa se a falha decorreu de concorrência (registro alterado concorrentemente)
          const { data: linhaAtual } = await client.from('clientes').select('id, updated_at').eq('id', idExistente).maybeSingle()
          if (linhaAtual && cliente.updatedAt && linhaAtual.updated_at !== cliente.updatedAt) {
            throw new ErroRepositorio(
              CODIGOS_ERRO.CONFLITO_EDICAO,
              MENSAGENS_PADRAO[CODIGOS_ERRO.CONFLITO_EDICAO],
              { contexto }
            )
          }
          throw new ErroRepositorio(
            CODIGOS_ERRO.SEM_PERMISSAO,
            MENSAGENS_PADRAO[CODIGOS_ERRO.SEM_PERMISSAO],
            { contexto }
          )
        }

        return linhaParaCliente(resposta.data)
      } else {
        // INSERT: deixa o banco gerar id e codigo_cliente
        delete payloadLinha.id
        delete payloadLinha.codigo_cliente

        const resposta = await client.from('clientes').insert(payloadLinha).select('*, veiculos(*)').single()
        const data = await executarOperacao(resposta, contexto, { esperaLinhasAfetadas: true })
        return linhaParaCliente(data)
      }
    },
    local: () => {
      const lista = getStoredClientes()
      const digitos = normalizarDigitos(cliente.documento || cliente.cpfCnpj)

      // Validação local de duplicidade de CPF/CNPJ
      if (digitos) {
        const duplicado = lista.find(
          (c) => (c.id !== cliente.id && c.value !== cliente.id) &&
            normalizarDigitos(c.documento || c.cpfCnpj) === digitos
        )
        if (duplicado) {
          throw new ErroRepositorio(CODIGOS_ERRO.DUPLICADO, 'CPF/CNPJ já cadastrado')
        }
      }

      const id = cliente.id || cliente.value || `cli-${Date.now()}`
      const index = lista.findIndex((c) => String(c.id) === String(id) || String(c.value) === String(id))

      let codigoFinal = cliente.codigoCliente
      if (!codigoFinal) {
        codigoFinal = gerarProximoCodigoLocal(lista)
      }

      const agora = new Date().toISOString()
      const clienteSalvo = {
        ...cliente,
        id,
        value: id,
        codigoCliente: codigoFinal,
        label: `${codigoFinal ? `${codigoFinal} - ` : ''}${cliente.nome || ''} - ${cliente.telefone || ''}`.trim(),
        ativo: cliente.ativo !== false,
        updatedAt: agora,
      }

      if (index >= 0) {
        lista[index] = clienteSalvo
      } else {
        clienteSalvo.createdAt = agora
        lista.unshift(clienteSalvo)
      }

      setStoredClientes(lista)
      return clienteSalvo
    },
    contexto: { entidade: 'clientes', operacao: 'salvarCliente' },
  })
}

/**
 * Exclui um cliente pelo identificador.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function excluirCliente(id) {
  if (!id) return Promise.resolve(false)

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const contexto = {
        entidade: 'clientes',
        operacao: 'excluirCliente',
        mensagensCustomizadas: {
          [CODIGOS_ERRO.REFERENCIA_INVALIDA]:
            'Cliente possui veículos vinculados; transfira ou exclua os veículos antes',
        },
      }

      const resposta = await client.from('clientes').delete().eq('id', id).select('id')
      await executarOperacao(resposta, contexto, { esperaLinhasAfetadas: true })
      return true
    },
    local: () => {
      // Checa se há veículos vinculados no modo local
      try {
        const rawV = localStorage.getItem(STORAGE_KEY_VEICULOS)
        if (rawV) {
          const veiculos = JSON.parse(rawV) || []
          const temVinculados = veiculos.some((v) => v.clienteId === id || v.clienteId === String(id))
          if (temVinculados) {
            throw new ErroRepositorio(
              CODIGOS_ERRO.REFERENCIA_INVALIDA,
              'Cliente possui veículos vinculados; transfira ou exclua os veículos antes'
            )
          }
        }
      } catch (err) {
        if (err instanceof ErroRepositorio) throw err
      }

      const lista = getStoredClientes()
      const filtrada = lista.filter((c) => String(c.id) !== String(id) && String(c.value) !== String(id))
      if (filtrada.length === lista.length) return false

      setStoredClientes(filtrada)
      return true
    },
    contexto: { entidade: 'clientes', operacao: 'excluirCliente' },
  })
}
