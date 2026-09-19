/**
 * Serviço de Integração com a API da Tabela FIPE (Veículos)
 * Regra: Apenas especificações técnicas do veículo (Marca, Modelo, Ano e Combustível), SEM valores/preços.
 */

const FIPE_BASE_URL = 'https://parallelum.com.br/fipe/api/v1/carros'

// Cache em memória para evitar chamadas de rede redundantes
const cacheMarcas = { dados: null, timestamp: 0 }
const cacheModelos = new Map()
const cacheAnos = new Map()

// Lista de contingência das marcas mais comuns do Brasil
const MARCAS_CONTINGENCIA = [
  { codigo: '23', nome: 'Chevrolet' },
  { codigo: '21', nome: 'Fiat' },
  { codigo: '22', nome: 'Ford' },
  { codigo: '25', nome: 'Honda' },
  { codigo: '26', nome: 'Hyundai' },
  { codigo: '29', nome: 'Jeep' },
  { codigo: '43', nome: 'Nissan' },
  { codigo: '48', nome: 'Renault' },
  { codigo: '56', nome: 'Toyota' },
  { codigo: '59', nome: 'Volkswagen' },
  { codigo: '13', nome: 'Citroën' },
  { codigo: '44', nome: 'Peugeot' },
  { codigo: '41', nome: 'Mitsubishi' },
  { codigo: '7', nome: 'BMW' },
  { codigo: '39', nome: 'Mercedes-Benz' },
  { codigo: '6', nome: 'Audi' },
  { codigo: '60', nome: 'Volvo' },
  { codigo: '31', nome: 'Kia Motors' },
  { codigo: '83', nome: 'Chery' },
  { codigo: '170', nome: 'BYD' },
  { codigo: '171', nome: 'GWM' },
]

/**
 * Normaliza o combustível do texto da FIPE para o padrão do sistema
 * @param {string} textoCombustivel
 * @returns {string} Código de combustível (FLEX, GASOLINA, DIESEL, etc.)
 */
export function normalizarCombustivelFipe(textoCombustivel = '') {
  const upper = String(textoCombustivel).toUpperCase()
  if (upper.includes('FLEX') || upper.includes('ÁLCOOL') || upper.includes('ALCOOL') || upper.includes('ETANOL')) {
    return 'FLEX'
  }
  if (upper.includes('DIESEL')) {
    return 'DIESEL'
  }
  if (upper.includes('HÍBRIDO') || upper.includes('HIBRIDO')) {
    return 'HIBRIDO'
  }
  if (upper.includes('ELÉTRICO') || upper.includes('ELETRICO')) {
    return 'ELETRICO'
  }
  if (upper.includes('GNV')) {
    return 'GNV'
  }
  if (upper.includes('GASOLINA')) {
    return 'GASOLINA'
  }
  return 'FLEX'
}

/**
 * Extrai o ano puro a partir do texto do ano da FIPE (ex: '2022 Flex' -> '2022')
 * @param {string} textoAno
 * @returns {string} Ano com 4 dígitos
 */
export function extrairAnoFipe(textoAno = '') {
  const match = String(textoAno).match(/\b(19\d{2}|20\d{2})\b/)
  return match ? match[1] : ''
}

/**
 * Consulta a lista de marcas da Tabela FIPE
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export async function buscarMarcasFipe() {
  if (cacheMarcas.dados && Date.now() - cacheMarcas.timestamp < 3600000) {
    return cacheMarcas.dados
  }

  try {
    const res = await fetch(`${FIPE_BASE_URL}/marcas`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      throw new Error('Falha na resposta da API FIPE')
    }

    const marcas = await res.json()
    if (!Array.isArray(marcas) || marcas.length === 0) {
      throw new Error('Lista de marcas vazia')
    }

    const formatadas = marcas.map((m) => {
      // Limpeza de prefixos como 'VW - VolksWagen' ou 'GM - Chevrolet' para apresentação mais limpa
      let nomeFormatado = m.nome
      if (m.nome === 'GM - Chevrolet') nomeFormatado = 'Chevrolet'
      else if (m.nome === 'VW - VolksWagen') nomeFormatado = 'Volkswagen'

      return {
        value: String(m.codigo),
        label: nomeFormatado,
        nomeOriginal: m.nome,
      }
    })

    cacheMarcas.dados = formatadas
    cacheMarcas.timestamp = Date.now()
    return formatadas
  } catch {
    // Retorna a lista de contingência das marcas mais comuns
    return MARCAS_CONTINGENCIA.map((m) => ({
      value: String(m.codigo),
      label: m.nome,
      nomeOriginal: m.nome,
    }))
  }
}

/**
 * Consulta a lista de modelos de uma marca na Tabela FIPE
 * @param {string|number} codigoMarca
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export async function buscarModelosFipe(codigoMarca) {
  if (!codigoMarca) return []

  const key = String(codigoMarca)
  if (cacheModelos.has(key)) {
    return cacheModelos.get(key)
  }

  try {
    const res = await fetch(`${FIPE_BASE_URL}/marcas/${codigoMarca}/modelos`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      throw new Error('Falha ao buscar modelos na FIPE')
    }

    const data = await res.json()
    const lista = Array.isArray(data.modelos) ? data.modelos : []

    const formatados = lista.map((mod) => ({
      value: String(mod.codigo),
      label: mod.nome,
    }))

    cacheModelos.set(key, formatados)
    return formatados
  } catch (err) {
    console.warn('Aviso: Falha ao consultar modelos na FIPE', err)
    return []
  }
}

/**
 * Consulta anos e versões disponíveis para um modelo na Tabela FIPE
 * @param {string|number} codigoMarca
 * @param {string|number} codigoModelo
 * @returns {Promise<Array<{ value: string, label: string, ano: string, combustivel: string }>>}
 */
export async function buscarAnosFipe(codigoMarca, codigoModelo) {
  if (!codigoMarca || !codigoModelo) return []

  const key = `${codigoMarca}_${codigoModelo}`
  if (cacheAnos.has(key)) {
    return cacheAnos.get(key)
  }

  try {
    const res = await fetch(
      `${FIPE_BASE_URL}/marcas/${codigoMarca}/modelos/${codigoModelo}/anos`,
      { headers: { Accept: 'application/json' } }
    )

    if (!res.ok) {
      throw new Error('Falha ao buscar anos na FIPE')
    }

    const data = await res.json()
    if (!Array.isArray(data)) return []

    const formatados = data.map((item) => {
      const anoPuro = extrairAnoFipe(item.nome)
      const combustivelNormalizado = normalizarCombustivelFipe(item.nome)

      return {
        value: String(item.codigo),
        label: item.nome, // Ex: '2022 Flex' ou '2021 Gasolina'
        ano: anoPuro || item.nome.slice(0, 4),
        combustivel: combustivelNormalizado,
      }
    })

    cacheAnos.set(key, formatados)
    return formatados
  } catch (err) {
    console.warn('Aviso: Falha ao consultar anos na FIPE', err)
    return []
  }
}
