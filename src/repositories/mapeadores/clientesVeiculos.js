/**
 * Mapeadores puros e isolados entre o modelo do frontend e o Postgres Supabase (Story 2.5).
 * Conversão bidirecional:
 * - Clientes: JS/Formulário <-> Linha da tabela public.clientes
 * - Veículos: JS/Formulário <-> Linha da tabela public.veiculos
 */

/**
 * Normaliza qualquer documento removendo caracteres não-numéricos.
 * @param {string|number|null} doc
 * @returns {string}
 */
export function normalizarDigitos(doc) {
  if (!doc) return ''
  return String(doc).replace(/\D/g, '')
}

/**
 * Formata endereço string a partir dos dados estruturados.
 * @param {object} end
 * @returns {string}
 */
export function formatarEnderecoString(end = {}) {
  if (!end || typeof end !== 'object') return ''
  const { logradouro, numero, complemento, bairro, cidade, uf } = end
  if (!logradouro && !bairro && !cidade) return ''

  const comp = complemento ? ` (${complemento})` : ''
  const num = numero || 'S/N'
  const logr = logradouro || ''
  const brr = bairro ? ` - ${bairro}` : ''
  const cidUf = cidade || uf ? `, ${cidade || ''} - ${uf || ''}` : ''

  return `${logr}, ${num}${comp}${brr}${cidUf}`.trim()
}

/**
 * Converte um objeto cliente do frontend para o formato da tabela public.clientes do Postgres.
 * @param {object} cliente
 * @returns {object} Objeto pronto para inserção/atualização no Supabase
 */
export function clienteParaLinha(cliente) {
  if (!cliente || typeof cliente !== 'object') return {}

  const docLimpo = normalizarDigitos(cliente.documento || cliente.cpfCnpj || cliente.cpf_cnpj)
  const ehPJ = cliente.tipoPessoa === 'J' || cliente.tipo === 'PJ' || docLimpo.length > 11
  const tipo = ehPJ ? 'PJ' : 'PF'

  const nome = (cliente.nome || '').trim()
  const nomeFantasia = (cliente.nomeFantasia || cliente.nome_fantasia || nome).trim()

  const endJson = {
    cep: normalizarDigitos(cliente.cep || cliente.endereco?.cep || ''),
    logradouro: (cliente.logradouro || cliente.endereco?.logradouro || '').trim(),
    numero: (cliente.numero || cliente.endereco?.numero || '').trim(),
    complemento: (cliente.complemento || cliente.endereco?.complemento || '').trim(),
    bairro: (cliente.bairro || cliente.endereco?.bairro || '').trim(),
    cidade: (cliente.cidade || cliente.endereco?.cidade || 'Apucarana').trim(),
    uf: (cliente.uf || cliente.endereco?.uf || 'PR').trim(),
  }

  const linha = {
    nome,
    tipo,
    cpf_cnpj: docLimpo,
    nome_fantasia: nomeFantasia || nome,
    rg_ie: (cliente.rgIe || cliente.rg_ie || '').trim() || null,
    telefone: (cliente.telefone || '').trim(),
    telefone_secundario: (cliente.telefoneFixo || cliente.telefone_secundario || '').trim() || null,
    email: (cliente.email || '').trim() || null,
    endereco: endJson,
    observacoes: (cliente.observacoes || '').trim() || null,
    ativo: cliente.ativo !== false,
  }

  // Apenas define id e codigo_cliente se já existirem explicitamente e não forem IDs temporários do front
  const id = cliente.id || cliente.value
  if (id && !String(id).startsWith('cli-')) {
    linha.id = String(id)
  }

  if (cliente.codigoCliente || cliente.codigo_cliente) {
    linha.codigo_cliente = String(cliente.codigoCliente || cliente.codigo_cliente)
  }

  return linha
}

/**
 * Converte uma linha da tabela public.clientes para o formato esperado pelo frontend.
 * @param {object} linha
 * @param {Array<object>} [veiculos=[]] - Lista opcional de veículos vinculados
 * @returns {object}
 */
export function linhaParaCliente(linha, veiculos = []) {
  if (!linha || typeof linha !== 'object') return null

  const end = (typeof linha.endereco === 'object' && linha.endereco !== null) ? linha.endereco : {}
  const tipoPessoa = linha.tipo === 'PJ' ? 'J' : 'F'
  const codigoCliente = linha.codigo_cliente || ''
  const nome = linha.nome || ''
  const telefone = linha.telefone || ''

  const veiculosMapeados = (Array.isArray(linha.veiculos) && linha.veiculos.length > 0)
    ? linha.veiculos.map((v) => linhaParaVeiculo(v, linha))
    : (Array.isArray(veiculos) ? veiculos.map((v) => linhaParaVeiculo(v, linha)) : [])

  return {
    id: linha.id,
    value: linha.id,
    codigoCliente,
    tipoPessoa,
    tipo: linha.tipo || 'PF',
    nome,
    nomeFantasia: linha.nome_fantasia || nome,
    documento: linha.cpf_cnpj || '',
    cpfCnpj: linha.cpf_cnpj || '',
    rgIe: linha.rg_ie || '',
    telefone,
    telefoneFixo: linha.telefone_secundario || '',
    email: linha.email || '',
    cep: end.cep || '',
    logradouro: end.logradouro || '',
    numero: end.numero || '',
    complemento: end.complemento || '',
    bairro: end.bairro || '',
    cidade: end.cidade || 'Apucarana',
    uf: end.uf || 'PR',
    endereco: formatarEnderecoString(end),
    observacoes: linha.observacoes || '',
    ativo: linha.ativo !== false,
    label: `${codigoCliente ? `${codigoCliente} - ` : ''}${nome} - ${telefone}`.trim(),
    veiculos: veiculosMapeados,
    createdAt: linha.created_at,
    updatedAt: linha.updated_at,
  }
}

/**
 * Converte um objeto veículo do frontend para o formato da tabela public.veiculos do Postgres.
 * @param {object} veiculo
 * @returns {object}
 */
export function veiculoParaLinha(veiculo) {
  if (!veiculo || typeof veiculo !== 'object') return {}

  const placa = (veiculo.placa || '').toUpperCase().trim().replace(/[^A-Z0-9]/g, '')
  const marca = (veiculo.marca || (veiculo.marcaModelo ? veiculo.marcaModelo.split(' ')[0] : '')).trim()
  const modelo = (veiculo.modelo || (veiculo.marcaModelo ? veiculo.marcaModelo.split(' ').slice(1).join(' ') : '')).trim()

  const kmRaw = veiculo.kmPadrao ?? veiculo.kmAtual ?? veiculo.km_atual
  const kmAtual = kmRaw != null && kmRaw !== '' ? parseInt(String(kmRaw).replace(/\D/g, ''), 10) || 0 : 0

  const linha = {
    cliente_id: veiculo.clienteId || veiculo.cliente_id || null,
    placa,
    marca,
    modelo,
    marca_codigo: veiculo.marcaCodigo || veiculo.marca_codigo || null,
    modelo_codigo: veiculo.modeloCodigo || veiculo.modelo_codigo || null,
    ano: veiculo.ano ? String(veiculo.ano).trim() : null,
    ano_codigo: veiculo.anoCodigo || veiculo.ano_codigo || null,
    combustivel: veiculo.combustivel || 'Flex',
    cor: (veiculo.cor || '').trim() || null,
    km_atual: kmAtual,
    chassi: (veiculo.chassi || '').trim() || null,
    renavam: (veiculo.renavam || '').trim() || null,
    observacoes: (veiculo.observacoes || '').trim() || null,
    ativo: veiculo.ativo !== false,
  }

  const id = veiculo.id || veiculo.value
  if (id && !String(id).startsWith('veic-')) {
    linha.id = String(id)
  }

  if (veiculo.codigoVeiculo || veiculo.codigo_veiculo) {
    linha.codigo_veiculo = String(veiculo.codigoVeiculo || veiculo.codigo_veiculo)
  }

  return linha
}

/**
 * Converte uma linha da tabela public.veiculos para o formato esperado pelo frontend.
 * @param {object} linha
 * @param {object|null} [clienteProprietario=null] - Dados opcionais do cliente para frota
 * @returns {object}
 */
export function linhaParaVeiculo(linha, clienteProprietario = null) {
  if (!linha || typeof linha !== 'object') return null

  const marca = linha.marca || ''
  const modelo = linha.modelo || ''
  const marcaModelo = `${marca} ${modelo}`.trim()
  const placa = (linha.placa || '').toUpperCase().trim()
  const codigoVeiculo = linha.codigo_veiculo || ''
  const ano = linha.ano || ''
  const cor = linha.cor || ''

  const veiculoFormatado = {
    id: linha.id,
    value: linha.id,
    codigoVeiculo,
    clienteId: linha.cliente_id || '',
    placa,
    marca,
    marcaCodigo: linha.marca_codigo || '',
    modelo,
    modeloCodigo: linha.modelo_codigo || '',
    marcaModelo,
    ano,
    anoCodigo: linha.ano_codigo || '',
    cor,
    combustivel: linha.combustivel || 'Flex',
    kmPadrao: linha.km_atual != null ? String(linha.km_atual) : '',
    kmAtual: linha.km_atual ?? 0,
    chassi: linha.chassi || '',
    renavam: linha.renavam || '',
    observacoes: linha.observacoes || '',
    ativo: linha.ativo !== false,
    label: `${placa} - ${marcaModelo} (${ano || 'N/D'} - ${cor || 'N/D'})`.trim(),
    createdAt: linha.created_at,
    updatedAt: linha.updated_at,
  }

  const c = clienteProprietario || linha.clientes || null
  if (c && typeof c === 'object') {
    const docLimpo = c.documento || c.cpf_cnpj || ''
    veiculoFormatado.clienteId = c.id || linha.cliente_id || ''
    veiculoFormatado.clienteNome = c.nome || ''
    veiculoFormatado.clienteCodigo = c.codigoCliente || c.codigo_cliente || ''
    veiculoFormatado.clienteDocumento = docLimpo
    veiculoFormatado.clienteTelefone = c.telefone || ''
    veiculoFormatado.clienteTipoPessoa = c.tipoPessoa || (c.tipo === 'PJ' || normalizarDigitos(docLimpo).length > 11 ? 'J' : 'F')
    veiculoFormatado.clienteCidade = c.cidade || c.endereco?.cidade || 'Apucarana'
    veiculoFormatado.clienteUf = c.uf || c.endereco?.uf || 'PR'
  }

  return veiculoFormatado
}
