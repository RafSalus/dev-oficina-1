/**
 * Repositório assíncrono de Veículos (Story 2.5 / ADR-005).
 * Persistência no Supabase Postgres, fail-closed, verificação de janela operacional
 * e modo local (dev_oficina_veiculos_v2).
 */

import { getSupabaseDataClient } from '../lib/supabase'
import { executarRepositorio, executarOperacao } from './supabaseHelpers'
import { ErroRepositorio, CODIGOS_ERRO, MENSAGENS_PADRAO, mapearErroPostgres } from './erroRepositorio'
import { veiculoParaLinha, linhaParaVeiculo } from './mapeadores/clientesVeiculos'

export const STORAGE_KEY_VEICULOS = 'dev_oficina_veiculos_v2'
export const STORAGE_KEY_CLIENTES = 'dev_oficina_clientes_v2'

function getStoredVeiculos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VEICULOS)
    return raw ? JSON.parse(raw) || [] : []
  } catch {
    return []
  }
}

function setStoredVeiculos(veiculos) {
  try {
    localStorage.setItem(STORAGE_KEY_VEICULOS, JSON.stringify(veiculos))
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('dev_oficina_veiculos_v2_updated'))
    }
  } catch (err) {
    console.error('Erro ao gravar veículos no storage:', err)
  }
}

function gerarProximoCodigoLocal(veiculosExistentes) {
  let maxNum = 0
  if (Array.isArray(veiculosExistentes)) {
    veiculosExistentes.forEach((v) => {
      if (v?.codigoVeiculo) {
        const match = String(v.codigoVeiculo).match(/\d+/)
        if (match) {
          const num = parseInt(match[0], 10)
          if (num > maxNum) maxNum = num
        }
      }
    })
  }
  return `VEIC-${String(maxNum + 1).padStart(4, '0')}`
}

function normalizarPlaca(placa) {
  return (placa || '').toUpperCase().trim().replace(/[^A-Z0-9]/g, '')
}

async function tratarErroMutacaoVeiculo(err, client, contexto) {
  const code = String(err?.code || '')
  const msg = String(err?.message || '').toLowerCase()

  if (code === '42501' || msg.includes('row-level security') || msg.includes('permission denied')) {
    try {
      if (client?.rpc) {
        const { data: emHorario } = await client.rpc('em_horario_operacional')
        if (emHorario === false) {
          throw new ErroRepositorio(
            CODIGOS_ERRO.FORA_DO_HORARIO,
            MENSAGENS_PADRAO[CODIGOS_ERRO.FORA_DO_HORARIO],
            { erroOriginal: err, contexto }
          )
        }
      }
    } catch (rpcErr) {
      if (rpcErr instanceof ErroRepositorio) throw rpcErr
    }
  }

  throw mapearErroPostgres(err, contexto)
}

/**
 * Carrega todos os veículos da frota com os dados do cliente proprietário.
 */
export async function carregarVeiculos() {
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('veiculos').select('*, clientes(*)').order('created_at', { ascending: false })
      const data = await executarOperacao(query, { entidade: 'veiculos', operacao: 'carregarVeiculos' })
      return (data || []).map((linha) => linhaParaVeiculo(linha))
    },
    local: () => {
      const veiculos = getStoredVeiculos()
      let clientes = []
      try {
        const rawC = localStorage.getItem(STORAGE_KEY_CLIENTES)
        if (rawC) clientes = JSON.parse(rawC) || []
      } catch {}

      return veiculos.map((v) => {
        const cli = clientes.find((c) => c.id === v.clienteId || c.value === v.clienteId) || null
        if (cli) {
          return {
            ...v,
            clienteNome: cli.nome || '',
            clienteCodigo: cli.codigoCliente || '',
            clienteDocumento: cli.documento || '',
            clienteTelefone: cli.telefone || '',
            clienteTipoPessoa: cli.tipoPessoa || 'F',
            clienteCidade: cli.cidade || 'Apucarana',
            clienteUf: cli.uf || 'PR',
          }
        }
        return v
      })
    },
    contexto: { entidade: 'veiculos', operacao: 'carregarVeiculos' },
  })
}

/**
 * Obtém um veículo por seu identificador único.
 */
export async function obterVeiculoPorId(id) {
  if (!id) return Promise.resolve(null)
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('veiculos').select('*, clientes(*)').eq('id', id).maybeSingle()
      const data = await executarOperacao(query, { entidade: 'veiculos', operacao: 'obterVeiculoPorId' })
      return data ? linhaParaVeiculo(data) : null
    },
    local: () => {
      const veiculos = getStoredVeiculos()
      return veiculos.find((v) => String(v.id) === String(id) || String(v.value) === String(id)) || null
    },
    contexto: { entidade: 'veiculos', operacao: 'obterVeiculoPorId' },
  })
}

/**
 * Obtém um veículo pela placa normalizada.
 */
export async function obterVeiculoPorPlaca(placa) {
  const placaLimpa = normalizarPlaca(placa)
  if (!placaLimpa) return Promise.resolve(null)
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client.from('veiculos').select('*, clientes(*)').eq('placa', placaLimpa).maybeSingle()
      const data = await executarOperacao(query, { entidade: 'veiculos', operacao: 'obterVeiculoPorPlaca' })
      return data ? linhaParaVeiculo(data) : null
    },
    local: () => {
      const veiculos = getStoredVeiculos()
      return veiculos.find((v) => normalizarPlaca(v.placa) === placaLimpa) || null
    },
    contexto: { entidade: 'veiculos', operacao: 'obterVeiculoPorPlaca' },
  })
}

/**
 * Obtém os veículos vinculados a um determinado cliente.
 */
export async function obterVeiculosDoCliente(clienteId) {
  if (!clienteId) return Promise.resolve([])
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const query = client
        .from('veiculos')
        .select('*, clientes(*)')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
      const data = await executarOperacao(query, { entidade: 'veiculos', operacao: 'obterVeiculosDoCliente' })
      return (data || []).map((linha) => linhaParaVeiculo(linha))
    },
    local: () => {
      const veiculos = getStoredVeiculos()
      return veiculos.filter((v) => String(v.clienteId) === String(clienteId))
    },
    contexto: { entidade: 'veiculos', operacao: 'obterVeiculosDoCliente' },
  })
}

/**
 * Salva ou atualiza um veículo (com transferência de proprietário e checagem de horário).
 */
export async function salvarVeiculo(veiculo) {
  if (!veiculo || typeof veiculo !== 'object') {
    throw new ErroRepositorio(CODIGOS_ERRO.ERRO_DESCONHECIDO, 'Dados de veículo inválidos.')
  }

  const idExistente = veiculo.id && !String(veiculo.id).startsWith('veic-') ? veiculo.id : null

  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const payloadLinha = veiculoParaLinha(veiculo)
      const contexto = {
        entidade: 'veiculos',
        operacao: 'salvarVeiculo',
        mensagensCustomizadas: { [CODIGOS_ERRO.DUPLICADO]: 'Placa já cadastrada' },
      }

      try {
        if (idExistente) {
          delete payloadLinha.id
          let updateQuery = client.from('veiculos').update(payloadLinha).eq('id', idExistente)
          if (veiculo.updatedAt) {
            updateQuery = updateQuery.eq('updated_at', veiculo.updatedAt)
          }

          const resposta = await updateQuery.select('*, clientes(*)').maybeSingle()
          if (resposta.error) {
            return await tratarErroMutacaoVeiculo(resposta.error, client, contexto)
          }

          if (!resposta.data) {
            const { data: linhaAtual } = await client.from('veiculos').select('id, updated_at').eq('id', idExistente).maybeSingle()
            if (linhaAtual && veiculo.updatedAt && linhaAtual.updated_at !== veiculo.updatedAt) {
              throw new ErroRepositorio(CODIGOS_ERRO.CONFLITO_EDICAO, MENSAGENS_PADRAO[CODIGOS_ERRO.CONFLITO_EDICAO], { contexto })
            }
            return await tratarErroMutacaoVeiculo({ code: '42501' }, client, contexto)
          }

          return linhaParaVeiculo(resposta.data)
        } else {
          delete payloadLinha.id
          delete payloadLinha.codigo_veiculo

          const resposta = await client.from('veiculos').insert(payloadLinha).select('*, clientes(*)').single()
          if (resposta.error) {
            return await tratarErroMutacaoVeiculo(resposta.error, client, contexto)
          }
          return linhaParaVeiculo(resposta.data)
        }
      } catch (err) {
        if (err instanceof ErroRepositorio) throw err
        return await tratarErroMutacaoVeiculo(err, client, contexto)
      }
    },
    local: () => {
      const lista = getStoredVeiculos()
      const placaFormatada = normalizarPlaca(veiculo.placa)

      if (placaFormatada) {
        const duplicado = lista.find(
          (v) => (v.id !== veiculo.id && v.value !== veiculo.id) && normalizarPlaca(v.placa) === placaFormatada
        )
        if (duplicado) throw new ErroRepositorio(CODIGOS_ERRO.DUPLICADO, 'Placa já cadastrada')
      }

      const id = veiculo.id || veiculo.value || `veic-${Date.now()}`
      const index = lista.findIndex((v) => String(v.id) === String(id) || String(v.value) === String(id))
      const codigoFinal = veiculo.codigoVeiculo || gerarProximoCodigoLocal(lista)
      const marca = (veiculo.marca || '').trim()
      const modelo = (veiculo.modelo || '').trim()
      const marcaModelo = veiculo.marcaModelo || `${marca} ${modelo}`.trim()
      const agora = new Date().toISOString()

      const veiculoSalvo = {
        ...veiculo,
        id,
        value: id,
        placa: placaFormatada,
        marca,
        modelo,
        marcaModelo,
        codigoVeiculo: codigoFinal,
        label: `${placaFormatada} - ${marcaModelo} (${veiculo.ano || 'N/D'} - ${veiculo.cor || 'N/D'})`.trim(),
        ativo: veiculo.ativo !== false,
        updatedAt: agora,
      }

      if (index >= 0) {
        lista[index] = veiculoSalvo
      } else {
        veiculoSalvo.createdAt = agora
        lista.unshift(veiculoSalvo)
      }

      setStoredVeiculos(lista)
      return veiculoSalvo
    },
    contexto: { entidade: 'veiculos', operacao: 'salvarVeiculo' },
  })
}

/**
 * Exclui um veículo pelo identificador único.
 */
export async function excluirVeiculo(id) {
  if (!id) return Promise.resolve(false)
  return executarRepositorio({
    remoto: async () => {
      const client = getSupabaseDataClient()
      const contexto = { entidade: 'veiculos', operacao: 'excluirVeiculo' }
      try {
        const resposta = await client.from('veiculos').delete().eq('id', id).select('id')
        await executarOperacao(resposta, contexto, { esperaLinhasAfetadas: true })
        return true
      } catch (err) {
        if (err instanceof ErroRepositorio) throw err
        return await tratarErroMutacaoVeiculo(err, client, contexto)
      }
    },
    local: () => {
      const lista = getStoredVeiculos()
      const filtrada = lista.filter((v) => String(v.id) !== String(id) && String(v.value) !== String(id))
      if (filtrada.length === lista.length) return false
      setStoredVeiculos(filtrada)
      return true
    },
    contexto: { entidade: 'veiculos', operacao: 'excluirVeiculo' },
  })
}
