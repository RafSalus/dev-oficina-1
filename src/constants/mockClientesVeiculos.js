export const MOCK_CLIENTES_VEICULOS = []

export const CHAVE_STORAGE_CLIENTES = 'dev_oficina_cadastros_clientes'

export function carregarClientesCadastrados() {
  let clientes = MOCK_CLIENTES_VEICULOS
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_CLIENTES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        clientes = parsed
      }
    }
  } catch {}

  // Garante que todo veículo possua um código único sequencial automático (VEIC-0001...)
  let maxVeicIndex = 0
  let precisaSalvar = false

  // Primeiro passo: identificar o maior número já existente
  clientes.forEach((cli) => {
    if (Array.isArray(cli.veiculos)) {
      cli.veiculos.forEach((v) => {
        if (v && v.codigoVeiculo) {
          const match = String(v.codigoVeiculo).match(/\d+/)
          if (match) {
            const num = parseInt(match[0], 10)
            if (num > maxVeicIndex) maxVeicIndex = num
          }
        }
      })
    }
  })

  // Segundo passo: atribuir código aos veículos que ainda não possuírem
  const clientesNormalizados = clientes.map((cli) => {
    if (!Array.isArray(cli.veiculos)) return cli
    const veiculosAtualizados = cli.veiculos.map((v) => {
      if (!v.codigoVeiculo) {
        maxVeicIndex++
        precisaSalvar = true
        return {
          ...v,
          codigoVeiculo: `VEIC-${String(maxVeicIndex).padStart(4, '0')}`,
        }
      }
      return v
    })
    return {
      ...cli,
      veiculos: veiculosAtualizados,
    }
  })

  if (precisaSalvar) {
    salvarClientesCadastrados(clientesNormalizados)
  }

  return clientesNormalizados
}

export function salvarClientesCadastrados(clientes) {
  try {
    localStorage.setItem(CHAVE_STORAGE_CLIENTES, JSON.stringify(clientes))
  } catch {}
}

/**
 * Gera automaticamente o próximo código sequencial de cliente
 * @returns {string} Código com 7 dígitos (ex: '0000166')
 */
export function gerarProximoCodigoCliente() {
  const clientes = carregarClientesCadastrados()
  let maxNum = 165
  if (Array.isArray(clientes)) {
    clientes.forEach((cli) => {
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
 * Carrega todos os veículos de toda a frota atendida pela oficina,
 * enriquecidos com os dados de seus respectivos clientes proprietários.
 * @returns {Array<object>}
 */
export function carregarTodosVeiculosDaFrota() {
  const clientes = carregarClientesCadastrados()
  const todosVeiculos = []

  if (Array.isArray(clientes)) {
    clientes.forEach((cli, cliIndex) => {
      if (Array.isArray(cli.veiculos)) {
        cli.veiculos.forEach((v, vIndex) => {
          const placaLimpa = (v.placa || '').toUpperCase().trim()
          todosVeiculos.push({
            ...v,
            id: v.id || v.value || `veic-${cliIndex}-${vIndex}-${placaLimpa}`,
            value: v.value || v.id || `veic-${cliIndex}-${vIndex}-${placaLimpa}`,
            placa: placaLimpa,
            codigoVeiculo: v.codigoVeiculo || `VEIC-${String(todosVeiculos.length + 1).padStart(4, '0')}`,
            marca: v.marca || (v.marcaModelo ? v.marcaModelo.split(' ')[0] : ''),
            modelo: v.modelo || (v.marcaModelo ? v.marcaModelo.split(' ').slice(1).join(' ') : ''),
            marcaModelo: v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim(),
            combustivel: v.combustivel || 'FLEX',
            ativo: v.ativo !== false,
            // Dados do Cliente Proprietário
            clienteId: cli.value || cli.id,
            clienteNome: cli.nome,
            clienteCodigo: cli.codigoCliente || '',
            clienteDocumento: cli.documento || '',
            clienteTelefone: cli.telefone || '',
            clienteTipoPessoa: cli.tipoPessoa || (cli.documento && cli.documento.replace(/\D/g, '').length > 11 ? 'J' : 'F'),
            clienteCidade: cli.cidade || 'Apucarana',
            clienteUf: cli.uf || 'PR',
          })
        })
      }
    })
  }

  return todosVeiculos
}

/**
 * Gera o próximo código sequencial de veículo na frota
 * @param {Array<object>} veiculosAdicionais Lista opcional de veículos já incluídos em tela mas ainda não persistidos
 * @returns {string} Código no formato 'VEIC-0001'
 */
export function gerarProximoCodigoVeiculo(veiculosAdicionais = []) {
  const frotaBase = carregarTodosVeiculosDaFrota()
  const veiculos = [...frotaBase, ...(Array.isArray(veiculosAdicionais) ? veiculosAdicionais : [])]
  let maxNum = 0
  veiculos.forEach((v) => {
    if (v && v.codigoVeiculo) {
      const match = String(v.codigoVeiculo).match(/\d+/)
      if (match) {
        const n = parseInt(match[0], 10)
        if (n > maxNum) maxNum = n
      }
    }
  })
  return `VEIC-${String(maxNum + 1).padStart(4, '0')}`
}

/**
 * Salva ou atualiza um veículo na base de clientes da oficina
 * @param {object} veiculoData Dados do veículo a salvar
 * @param {string} clienteIdOriginal ID do cliente anterior (caso haja transferência de proprietário)
 * @returns {object} Veículo salvo
 */
export function salvarVeiculoNaFrota(veiculoData, clienteIdOriginal = null) {
  const clientes = carregarClientesCadastrados()
  const clienteNovoId = veiculoData.clienteId
  const placaFormatada = (veiculoData.placa || '').toUpperCase().trim()

  const veiculoFormatado = {
    ...veiculoData,
    placa: placaFormatada,
    marcaModelo: veiculoData.marcaModelo || `${veiculoData.marca || ''} ${veiculoData.modelo || ''}`.trim(),
    ativo: veiculoData.ativo !== false,
  }

  const clientesAtualizados = clientes.map((cli) => {
    const cliId = cli.value || cli.id
    const veiculosDoCli = Array.isArray(cli.veiculos) ? [...cli.veiculos] : []

    // Se é o cliente original e houve transferência para outro cliente
    if (clienteIdOriginal && clienteIdOriginal !== clienteNovoId && cliId === clienteIdOriginal) {
      return {
        ...cli,
        veiculos: veiculosDoCli.filter(
          (v) => (v.placa || '').toUpperCase().trim() !== placaFormatada && v.value !== veiculoFormatado.value && v.id !== veiculoFormatado.id
        ),
      }
    }

    // Se é o cliente proprietário do veículo (novo ou mantido)
    if (cliId === clienteNovoId) {
      const indexExistente = veiculosDoCli.findIndex(
        (v) =>
          (v.placa && v.placa.toUpperCase().trim() === placaFormatada) ||
          (veiculoFormatado.id && (v.id === veiculoFormatado.id || v.value === veiculoFormatado.id)) ||
          (veiculoFormatado.value && (v.value === veiculoFormatado.value || v.id === veiculoFormatado.value))
      )

      if (indexExistente >= 0) {
        veiculosDoCli[indexExistente] = {
          ...veiculosDoCli[indexExistente],
          ...veiculoFormatado,
        }
      } else {
        veiculosDoCli.push(veiculoFormatado)
      }

      return {
        ...cli,
        veiculos: veiculosDoCli,
      }
    }

    return cli
  })

  salvarClientesCadastrados(clientesAtualizados)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'))
  }
  return veiculoFormatado
}

/**
 * Remove um veículo da frota
 * @param {string} placaOuId Placa ou ID do veículo a ser excluído
 */
export function excluirVeiculoDaFrota(placaOuId) {
  const clientes = carregarClientesCadastrados()
  const identificador = String(placaOuId).toUpperCase().trim()

  const clientesAtualizados = clientes.map((cli) => {
    if (!Array.isArray(cli.veiculos)) return cli
    return {
      ...cli,
      veiculos: cli.veiculos.filter(
        (v) =>
          (v.placa || '').toUpperCase().trim() !== identificador &&
          v.value !== placaOuId &&
          v.id !== placaOuId
      ),
    }
  })

  salvarClientesCadastrados(clientesAtualizados)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'))
  }
}
