/**
 * Regras puras do cadastro de cliente e veículos (Story 2.0 / ADR-003): estado inicial,
 * normalização para edição, validação, montagem do payload e do veículo.
 */
import { validarCPF, validarCNPJ, formatarCEP, formatarTelefone } from '../fiscalValidators'

export const COMBUSTIVEL_OPCOES = [
  { value: 'FLEX', label: 'Flex (Álcool e Gasolina)' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ETANOL', label: 'Etanol / Álcool' },
  { value: 'DIESEL', label: 'Diesel S10 / S500' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'GNV', label: 'GNV (Gás Natural Veicular)' },
]

export const FORM_CLIENTE_INICIAL = {
  codigoCliente: '',
  tipoPessoa: 'F', // 'F' para Física (CPF) ou 'J' para Jurídica (CNPJ)
  nome: '',
  nomeFantasia: '',
  documento: '',
  rgIe: '',
  telefone: '',
  telefoneFixo: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: 'Apucarana',
  uf: 'PR',
  observacoes: '',
  ativo: true,
  veiculos: [],
}

export const NOVO_VEICULO_INICIAL = {
  codigoVeiculo: '',
  placa: '',
  marca: '',
  marcaCodigo: '',
  modelo: '',
  modeloCodigo: '',
  ano: '',
  anoCodigo: '',
  cor: '',
  combustivel: 'FLEX',
  kmPadrao: '',
}

/** Rótulo do documento conforme o tipo de pessoa. */
export const rotuloDocumento = (tipoPessoa) => (tipoPessoa === 'F' ? 'CPF' : 'CNPJ')

/**
 * Formulário preenchido com um cliente existente, com máscaras e padrões aplicados.
 * @param {object} cliente
 * @param {string} codigoPadrao - Código usado se o cliente ainda não tiver um.
 * @returns {object}
 */
export function formDoCliente(cliente, codigoPadrao) {
  return {
    ...cliente,
    codigoCliente: cliente.codigoCliente || codigoPadrao,
    tipoPessoa: cliente.tipoPessoa || (cliente.documento?.length > 14 ? 'J' : 'F'),
    nome: cliente.nome || '',
    nomeFantasia: cliente.nomeFantasia || '',
    documento: cliente.documento || '',
    rgIe: cliente.rgIe || '',
    telefone: formatarTelefone(cliente.telefone || ''),
    telefoneFixo: formatarTelefone(cliente.telefoneFixo || ''),
    email: cliente.email || '',
    cep: formatarCEP(cliente.cep || ''),
    logradouro: cliente.logradouro || '',
    numero: cliente.numero || '',
    complemento: cliente.complemento || '',
    bairro: cliente.bairro || '',
    cidade: cliente.cidade || 'Apucarana',
    uf: cliente.uf || 'PR',
    observacoes: cliente.observacoes || '',
    ativo: cliente.ativo !== false,
    veiculos: Array.isArray(cliente.veiculos) ? [...cliente.veiculos] : [],
  }
}

/**
 * CPF (pessoa física) ou CNPJ (jurídica) com dígitos verificadores válidos.
 * @param {string} documento
 * @param {'F'|'J'} tipoPessoa
 * @returns {boolean}
 */
export function documentoEhValido(documento, tipoPessoa) {
  if (!documento) return false
  return tipoPessoa === 'F' ? validarCPF(documento) : validarCNPJ(documento)
}

/**
 * Primeira pendência que impede salvar o cliente.
 * @param {object} form
 * @returns {{tipo: 'warning'|'error', mensagem: string}|null}
 */
export function validarCliente(form) {
  const doc = rotuloDocumento(form.tipoPessoa)
  if (!form.nome?.trim()) return { tipo: 'warning', mensagem: 'O nome do cliente é obrigatório.' }
  if (!form.documento?.trim()) return { tipo: 'warning', mensagem: `Informe o ${doc} do cliente.` }
  if (!documentoEhValido(form.documento, form.tipoPessoa)) {
    return { tipo: 'error', mensagem: `${doc} inválido. Verifique os dígitos informados.` }
  }
  if (!form.telefone?.trim()) return { tipo: 'warning', mensagem: 'Informe o telefone celular ou WhatsApp para contato.' }
  return null
}

/**
 * Payload final do cliente (campos aparados, label e endereço completo).
 * @param {object} form
 * @param {object|null} clienteOriginal - Cliente em edição (mantém `value`/`id`).
 * @param {string} codigoFinal
 * @returns {object}
 */
export function montarPayloadCliente(form, clienteOriginal, codigoFinal) {
  const aparar = (campo) => form[campo]?.trim() || ''
  const nome = form.nome.trim()
  const telefone = form.telefone.trim()
  return {
    ...form,
    codigoCliente: codigoFinal,
    value: clienteOriginal?.value || `cli-${Date.now()}`,
    id: clienteOriginal?.id || `cli-${Date.now()}`,
    label: `${codigoFinal ? `${codigoFinal} - ` : ''}${nome} - ${telefone}`,
    nome,
    nomeFantasia: aparar('nomeFantasia') || nome,
    documento: form.documento.trim(),
    rgIe: aparar('rgIe'),
    telefone,
    telefoneFixo: aparar('telefoneFixo'),
    email: aparar('email'),
    cep: aparar('cep'),
    logradouro: aparar('logradouro'),
    numero: aparar('numero'),
    complemento: aparar('complemento'),
    bairro: aparar('bairro'),
    cidade: aparar('cidade'),
    uf: form.uf || 'PR',
    endereco: `${form.logradouro || ''}, ${form.numero || 'S/N'}${form.complemento ? ` (${form.complemento})` : ''} - ${form.bairro || ''}, ${form.cidade || ''} - ${form.uf || ''}`.trim(),
    observacoes: aparar('observacoes'),
    ativo: Boolean(form.ativo),
    veiculos: form.veiculos || [],
  }
}

/**
 * O formulário já tem algo digitado que se perderia ao cancelar.
 * @param {object} form
 * @returns {boolean}
 */
export function temDadosPreenchidos(form) {
  return Boolean(form.nome?.trim() || form.documento?.trim() || form.telefone?.trim() || form.veiculos?.length > 0)
}

/**
 * Primeira pendência do veículo em inclusão (placa, marca e modelo são obrigatórios).
 * @param {object} veiculo
 * @returns {string|null}
 */
export function validarVeiculo(veiculo) {
  if (!veiculo.placa?.trim()) return 'Informe a placa do veículo.'
  if (!veiculo.marca?.trim()) return 'Selecione ou informe a marca do veículo.'
  if (!veiculo.modelo?.trim()) return 'Selecione ou informe o modelo do veículo.'
  return null
}

/**
 * Veículo pronto para a lista do cliente, com placa normalizada e rótulo para selects.
 * @param {object} veiculo - Dados digitados/escolhidos na FIPE.
 * @param {string} codigoFinal
 * @returns {object}
 */
export function montarVeiculoCliente(veiculo, codigoFinal) {
  const id = `veic-${Date.now()}`
  const placa = veiculo.placa.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  const marca = veiculo.marca.trim()
  const modelo = veiculo.modelo.trim()
  const marcaModelo = `${marca} ${modelo}`.trim()
  return {
    value: id,
    id,
    codigoVeiculo: codigoFinal,
    label: `${placa} - ${marcaModelo} (${veiculo.ano || 'N/D'} - ${veiculo.cor || 'N/D'})`,
    placa,
    marca,
    modelo,
    marcaModelo,
    ano: veiculo.ano?.trim() || '',
    cor: veiculo.cor?.trim() || '',
    combustivel: veiculo.combustivel || 'FLEX',
    kmPadrao: veiculo.kmPadrao?.trim() || '',
  }
}

/**
 * Veículos filtrados por placa, marca, modelo ou marca/modelo.
 * @param {Array<object>} veiculos
 * @param {string} busca
 * @returns {Array<object>}
 */
export function filtrarVeiculos(veiculos, busca) {
  const termo = busca.trim().toLowerCase()
  if (!termo) return veiculos
  return veiculos.filter((v) =>
    ['placa', 'marca', 'modelo', 'marcaModelo'].some((c) => (v[c] || '').toLowerCase().includes(termo))
  )
}
