// Validadores e Formatadores Fiscais para Suprimentos e Faturamento (NFS-e e NF-e)
// Regra: Sem uso do caractere proibido ('&'), apenas 'e'

/**
 * Validação do Código de Barras GTIN / EAN (8, 12, 13 ou 14 dígitos)
 * Permite 'SEM GTIN' para produtos artesanais ou sem código oficial
 */
export function validarGTIN(gtin) {
  if (!gtin) return false
  const limpo = gtin.trim().toUpperCase()
  if (limpo === 'SEM GTIN' || limpo === 'SEMGTIN') return true

  // Deve conter 8, 12, 13 ou 14 dígitos numéricos
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(limpo)) return false

  // Cálculo do dígito verificador módulo 10 com pesos alternados 3 e 1 da direita para esquerda
  const digitos = limpo.split('').map(Number)
  const digitoInformado = digitos.pop()
  
  let multiplicador = 3
  let soma = 0
  for (let i = digitos.length - 1; i >= 0; i--) {
    soma += digitos[i] * multiplicador
    multiplicador = multiplicador === 3 ? 1 : 3
  }

  const resto = soma % 10
  const digitoCalculado = resto === 0 ? 0 : 10 - resto

  return digitoInformado === digitoCalculado
}

/**
 * Validação de CNPJ (14 dígitos com dígitos verificadores)
 */
export function validarCNPJ(cnpj) {
  if (!cnpj) return false
  const limpo = String(cnpj).replace(/[^\d]/g, '')

  if (limpo.length !== 14) return false
  if (/^(\d)\1+$/.test(limpo)) return false

  let soma = 0
  let peso = 2
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(limpo.charAt(i), 10) * peso
    peso = peso === 9 ? 2 : peso + 1
  }

  const resto = soma % 11
  const digito1 = resto < 2 ? 0 : 11 - resto

  soma = 0
  peso = 2
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(limpo.charAt(i), 10) * peso
    peso = peso === 9 ? 2 : peso + 1
  }

  const resto2 = soma % 11
  const digito2 = resto2 < 2 ? 0 : 11 - resto2

  return Number(limpo.charAt(12)) === digito1 && Number(limpo.charAt(13)) === digito2
}

/**
 * Formatação de CNPJ: 00.000.000/0000-00
 */
export function formatarCNPJ(valor) {
  if (!valor) return ''
  const apenasNumeros = String(valor).replace(/\D/g, '').slice(0, 14)
  return apenasNumeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

/**
 * Validação de NCM (8 dígitos numéricos)
 */
export function validarNCM(ncm) {
  if (!ncm) return false
  const limpo = String(ncm).replace(/\D/g, '')
  return limpo.length === 8
}

/**
 * Formatação de NCM: 0000.00.00
 */
export function formatarNCM(valor) {
  if (!valor) return ''
  const limpo = String(valor).replace(/\D/g, '').slice(0, 8)
  return limpo
    .replace(/^(\d{4})(\d)/, '$1.$2')
    .replace(/^(\d{4})\.(\d{2})(\d)/, '$1.$2.$3')
}

/**
 * Validação de CFOP (4 dígitos numéricos)
 */
export function validarCFOP(cfop) {
  if (!cfop) return false
  const limpo = String(cfop).replace(/\D/g, '')
  return limpo.length === 4
}

/**
 * Validação de CEP (8 dígitos numéricos)
 */
export function validarCEP(cep) {
  if (!cep) return false
  const limpo = String(cep).replace(/\D/g, '')
  return limpo.length === 8
}

/**
 * Formatação de CEP: 00000-000
 */
export function formatarCEP(valor) {
  if (!valor) return ''
  const limpo = String(valor).replace(/\D/g, '').slice(0, 8)
  return limpo.replace(/^(\d{5})(\d)/, '$1-$2')
}

/**
 * Formatação de Telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatarTelefone(valor) {
  if (!valor) return ''
  const limpo = String(valor).replace(/\D/g, '').slice(0, 11)
  if (limpo.length <= 10) {
    return limpo
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return limpo
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}
