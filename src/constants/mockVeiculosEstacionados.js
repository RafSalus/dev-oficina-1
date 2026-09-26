// Módulo de Gerenciamento e Persistência de Veículos Estacionados
// Regras do Sistema: Sem uso do caractere proibido ('&'), apenas 'e'
// Mantém histórico completo de manutenção mesmo após a venda do veículo pelo antigo proprietário

import * as clientesRepository from '../repositories/clientesRepository'
import * as veiculosRepository from '../repositories/veiculosRepository'
import {
  obterOrdensAbertas,
  obterOrdensFinalizadas,
} from '../pages/dashboard/orcamento/mockOrdensAbertas'

export const CHAVE_STORAGE_ESTACIONADOS = 'dev_oficina_veiculos_estacionados'

export const SEED_VEICULOS_ESTACIONADOS = []

/**
 * Carrega a lista de veículos estacionados do localStorage
 * Se não houver, inicializa com o seed padrão
 */
export function carregarVeiculosEstacionados() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_ESTACIONADOS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao carregar veículos estacionados:', e)
  }

  salvarVeiculosEstacionados(SEED_VEICULOS_ESTACIONADOS)
  return SEED_VEICULOS_ESTACIONADOS
}

/**
 * Salva a lista de veículos estacionados no localStorage e dispara evento de sincronização
 */
export function salvarVeiculosEstacionados(lista) {
  try {
    localStorage.setItem(CHAVE_STORAGE_ESTACIONADOS, JSON.stringify(lista))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  } catch (e) {
    console.error('Erro ao salvar veículos estacionados:', e)
  }
}

/**
 * Obtém o prontuário histórico completo de manutenções de um veículo
 * Agrega o histórico interno do veículo estacionado com quaisquer Ordens de Serviço
 * abertas e finalizadas presentes no sistema da oficina Gabriel para aquela placa.
 */
export function obterHistoricoCompletoVeiculo(placa, veiculoEstacionado = null) {
  const placaLimpa = String(placa || '').toUpperCase().trim()
  const historicoMapa = new Map()

  // 1. Manutenções registradas no próprio objeto do veículo
  if (veiculoEstacionado && Array.isArray(veiculoEstacionado.historicoManutencoes)) {
    veiculoEstacionado.historicoManutencoes.forEach((m) => {
      if (m && m.numeroOS) {
        historicoMapa.set(String(m.numeroOS), {
          ...m,
          origem: 'prontuario_historico',
        })
      }
    })
  }

  // 2. Ordens de Serviço Finalizadas no sistema da oficina
  try {
    const finalizadas = obterOrdensFinalizadas()
    finalizadas.forEach((os) => {
      const osPlaca = String(os.placa || '').toUpperCase().trim()
      if (osPlaca === placaLimpa && os.numeroOS) {
        historicoMapa.set(String(os.numeroOS), {
          numeroOS: os.numeroOS,
          dataEntrada: os.dataFinalizacao || os.dataEntrada || os.dataEmissao,
          km: os.km || '—',
          clienteNaEpoca: os.cliente,
          mecanicoNome: os.mecanicoNome || 'Mecânica Gabriel',
          status: 'finalizada',
          valorTotal: Number(os.valorTotal || 0),
          garantiaAte: os.garantiaAte || '90 dias após entrega',
          laudoTecnico: os.laudoTecnico || os.relatoCliente || 'Serviços concluídos e revisados.',
          servicos: Array.isArray(os.servicosOS)
            ? os.servicosOS.map((s) => ({
                nome: s.nome,
                tempoHoras: s.tempoHoras || '1.0',
                valor: Number(s.precoUnitario || 0) * (Number(s.quantidade) || 1),
              }))
            : [],
          pecas: Array.isArray(os.pecasOS)
            ? os.pecasOS.map((p) => ({
                nome: p.nome,
                quantidade: Number(p.quantidade) || 1,
                valor: Number(p.precoUnitario || 0) * (Number(p.quantidade) || 1),
              }))
            : [],
          origem: 'sistema_oficina',
        })
      }
    })
  } catch {}

  // 3. Ordens de Serviço Abertas/Em Andamento no sistema
  try {
    const abertas = obterOrdensAbertas()
    abertas.forEach((os) => {
      const osPlaca = String(os.placa || '').toUpperCase().trim()
      if (osPlaca === placaLimpa && os.numeroOS) {
        historicoMapa.set(String(os.numeroOS), {
          numeroOS: os.numeroOS,
          dataEntrada: os.dataEntrada || os.dataEmissao,
          km: os.km || '—',
          clienteNaEpoca: os.cliente,
          mecanicoNome: os.mecanicoNome || 'Em atendimento',
          status: os.status || 'em_andamento',
          valorTotal: Number(os.valorTotal || 0),
          garantiaAte: 'Em execução',
          laudoTecnico: os.laudoTecnico || os.relatoCliente || 'Ordem de serviço em andamento na oficina.',
          servicos: Array.isArray(os.servicosOS)
            ? os.servicosOS.map((s) => ({
                nome: s.nome,
                tempoHoras: s.tempoHoras || '1.0',
                valor: Number(s.precoUnitario || 0) * (Number(s.quantidade) || 1),
              }))
            : [],
          pecas: Array.isArray(os.pecasOS)
            ? os.pecasOS.map((p) => ({
                nome: p.nome,
                quantidade: Number(p.quantidade) || 1,
                valor: Number(p.precoUnitario || 0) * (Number(p.quantidade) || 1),
              }))
            : [],
          origem: 'sistema_oficina',
        })
      }
    })
  } catch {}

  // Ordena por data decrescente (mais recente primeiro)
  return Array.from(historicoMapa.values()).sort((a, b) => {
    return String(b.numeroOS || '').localeCompare(String(a.numeroOS || ''))
  })
}

/**
 * Estaciona um veículo que foi vendido por um cliente da oficina
 * Remove o veículo da frota ativa do antigo proprietário e adiciona aos Estacionados
 * Preserva 100% de todo o histórico de manutenções e especificações técnicas
 */
export async function estacionarVeiculo({ veiculo, dadosVenda }) {
  const estacionados = carregarVeiculosEstacionados()
  const placaFormatada = String(veiculo.placa || '').toUpperCase().trim()

  // 1. Extrai histórico completo acumulado do veículo
  const historicoAcumulado = obterHistoricoCompletoVeiculo(placaFormatada, veiculo)

  // 2. Cria o registro de veículo estacionado
  const novoEstacionado = {
    id: `estac-${Date.now()}`,
    placa: placaFormatada,
    codigoVeiculo: veiculo.codigoVeiculo || '',
    marca: veiculo.marca || (veiculo.marcaModelo ? veiculo.marcaModelo.split(' ')[0] : ''),
    modelo: veiculo.modelo || (veiculo.marcaModelo ? veiculo.marcaModelo.split(' ').slice(1).join(' ') : ''),
    marcaModelo: veiculo.marcaModelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim(),
    ano: veiculo.ano || '',
    cor: veiculo.cor || '',
    combustivel: veiculo.combustivel || 'FLEX',
    kmAtual: dadosVenda.kmNaVenda || veiculo.kmPadrao || veiculo.km || '',
    chassi: veiculo.chassi || '',
    renavam: veiculo.renavam || '',
    dataEstacionamento: dadosVenda.dataVenda || new Date().toLocaleDateString('pt-BR'),
    motivoVenda: dadosVenda.motivoVenda || 'Cliente vendeu o veículo e novo proprietário ainda não é cliente da oficina',
    // Dados do antigo proprietário
    antigoClienteId: veiculo.clienteId || '',
    antigoClienteNome: veiculo.clienteNome || 'Cliente anterior',
    antigoClienteTelefone: veiculo.clienteTelefone || '',
    antigoClienteDocumento: veiculo.clienteDocumento || '',
    // Dados do novo proprietário provisório (se fornecidos)
    novoDonoNome: dadosVenda.novoDonoNome || '',
    novoDonoTelefone: dadosVenda.novoDonoTelefone || '',
    novoDonoDocumento: dadosVenda.novoDonoDocumento || '',
    novoDonoEmail: dadosVenda.novoDonoEmail || '',
    observacoes: dadosVenda.observacoes || '',
    // Histórico de manutenções 100% preservado
    historicoManutencoes: historicoAcumulado,
  }

  // 3. Adiciona na lista de Estacionados (no início)
  estacionados.unshift(novoEstacionado)
  salvarVeiculosEstacionados(estacionados)

  // 4. Remove o veículo da frota ativa chamando o repositório
  try {
    const ident = veiculo.id || veiculo.value || veiculo.placa
    if (ident) {
      await veiculosRepository.excluirVeiculo(ident)
    }
  } catch (e) {
    console.error('Erro ao desvincular veículo da frota ativa no repositório:', e)
  }

  return novoEstacionado
}

/**
 * Vincula um veículo estacionado a um cliente (novo ou já cadastrado)
 * O veículo sai da lista de Estacionados e passa a compor a frota ativa do novo cliente
 * Todo o histórico de manutenção é integralmente mantido
 */
export async function vincularVeiculoEstacionadoAoCliente({
  veiculoEstacionadoId,
  clienteDestinoId = null,
  novoClienteData = null,
}) {
  const estacionados = carregarVeiculosEstacionados()
  const index = estacionados.findIndex((item) => item.id === veiculoEstacionadoId)
  if (index === -1) {
    throw new Error('Veículo estacionado não encontrado.')
  }

  const veiculoEstacionado = estacionados[index]
  let idDoClienteDestino = clienteDestinoId
  let nomeDoClienteDestino = ''

  // 1. Caso seja o cadastro de um novo cliente na oficina
  if (novoClienteData) {
    const salvo = await clientesRepository.salvarCliente({
      ...novoClienteData,
      tipoPessoa: novoClienteData.tipoPessoa || 'F',
      nome: novoClienteData.nome.trim(),
    })
    idDoClienteDestino = salvo.id
    nomeDoClienteDestino = salvo.nome
  } else {
    // Cliente existente selecionado
    try {
      const cliEncontrado = await clientesRepository.obterClientePorId(idDoClienteDestino)
      if (cliEncontrado) {
        nomeDoClienteDestino = cliEncontrado.nome
      }
    } catch {}
  }

  // 2. Prepara o veículo para voltar à frota ativa com o novo cliente
  const veiculoParaFrota = {
    codigoVeiculo: veiculoEstacionado.codigoVeiculo || '',
    placa: veiculoEstacionado.placa,
    marca: veiculoEstacionado.marca,
    modelo: veiculoEstacionado.modelo,
    marcaModelo: veiculoEstacionado.marcaModelo,
    ano: veiculoEstacionado.ano,
    cor: veiculoEstacionado.cor,
    combustivel: veiculoEstacionado.combustivel,
    kmPadrao: veiculoEstacionado.kmAtual,
    chassi: veiculoEstacionado.chassi,
    renavam: veiculoEstacionado.renavam,
    ativo: true,
    clienteId: idDoClienteDestino,
    historicoManutencoes: veiculoEstacionado.historicoManutencoes || [],
  }

  // 3. Salva o veículo na frota ativa do novo cliente
  const salvoVeiculo = await veiculosRepository.salvarVeiculo(veiculoParaFrota)

  // 4. Remove o veículo da lista de Estacionados
  estacionados.splice(index, 1)
  salvarVeiculosEstacionados(estacionados)

  return {
    clienteId: idDoClienteDestino,
    clienteNome: nomeDoClienteDestino,
    veiculo: salvoVeiculo,
  }
}

/**
 * Atualiza anotações ou dados do veículo estacionado
 */
export function atualizarVeiculoEstacionado(veiculoAtualizado) {
  const estacionados = carregarVeiculosEstacionados()
  const index = estacionados.findIndex((item) => item.id === veiculoAtualizado.id)
  if (index !== -1) {
    estacionados[index] = {
      ...estacionados[index],
      ...veiculoAtualizado,
    }
    salvarVeiculosEstacionados(estacionados)
    return estacionados[index]
  }
  return null
}

/**
 * Exclui um veículo da lista de estacionados
 */
export function excluirVeiculoEstacionado(id) {
  const estacionados = carregarVeiculosEstacionados()
  const filtrados = estacionados.filter((item) => item.id !== id)
  salvarVeiculosEstacionados(filtrados)
}
