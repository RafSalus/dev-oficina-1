import cepPromise from 'cep-promise'

/**
 * Consulta CEP utilizando a biblioteca cep-promise com contingência (fallback) automática para ViaCEP
 * @param {string} cepRaw - CEP com ou sem formatação (ex: '86812-405' ou '86812405')
 * @returns {Promise<{ cep: string, logradouro: string, bairro: string, cidade: string, uf: string }>}
 */
export async function consultarCepApi(cepRaw) {
  const cepLimpo = (cepRaw || '').replace(/\D/g, '')

  if (cepLimpo.length !== 8) {
    throw new Error('Informe um CEP válido com 8 dígitos.')
  }

  try {
    const res = await cepPromise(cepLimpo, { timeout: 5000 })
    return {
      cep: res.cep ? String(res.cep).padStart(8, '0') : cepLimpo,
      logradouro: res.street || '',
      bairro: res.neighborhood || '',
      cidade: res.city || '',
      uf: (res.state || '').toUpperCase(),
    }
  } catch {
    // Fallback de contingência direto para ViaCEP via fetch
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        throw new Error('CEP não localizado na base de dados.')
      }

      return {
        cep: cepLimpo,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        uf: (data.uf || '').toUpperCase(),
      }
    } catch (fallbackErr) {
      throw new Error(fallbackErr.message || 'Falha ao consultar o CEP. Preencha manualmente.')
    }
  }
}
