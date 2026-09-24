// Módulo de Gerenciamento e Rastreio de Manutenções Preventivas e Saúde da Frota
// Regras do Sistema: Sem uso do caractere proibido ('&'), apenas 'e'
// Foco em retenção de clientes, garantia de serviços e geração ativa de receita

import {
  carregarTodosVeiculosDaFrota,
  salvarVeiculoNaFrota,
  carregarClientesCadastrados,
  salvarClientesCadastrados,
} from './mockClientesVeiculos'
import { carregarVeiculosEstacionados } from './mockVeiculosEstacionados'
import { obterHistoricoCompletoVeiculo } from './mockVeiculosEstacionados'

export const CHAVE_STORAGE_PREVENTIVA = 'dev_oficina_manutencoes_preventivas'

/**
 * Catálogo padrão de itens preventivos e receitas potenciais da oficina
 */
export const ITENS_PREVENTIVOS_CATALOGO = []

/**
 * Registros seed com manutenções preventivas para a frota ativa
 */
export const SEED_MANUTENCOES_PREVENTIVAS = []

/**
 * Converte data em string DD/MM/AAAA para objeto Date
 */
export function converterDataParaDate(dataStr) {
  if (!dataStr) return new Date()
  const partes = String(dataStr).split('/')
  if (partes.length === 3) {
    const dia = parseInt(partes[0], 10)
    const mes = parseInt(partes[1], 10) - 1
    const ano = parseInt(partes[2], 10)
    return new Date(ano, mes, dia)
  }
  return new Date()
}

/**
 * Adiciona meses a uma data
 */
export function adicionarMesesAData(dataStr, meses) {
  const date = converterDataParaDate(dataStr)
  date.setMonth(date.getMonth() + meses)
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const ano = date.getFullYear()
  return `${dia}/${mes}/${ano}`
}

/**
 * Calcula diferença em dias entre hoje e uma data DD/MM/AAAA
 * Se positivo: faltam X dias. Se negativo: atrasado há X dias.
 */
export function calcularDiasRestantes(dataLimiteStr) {
  if (!dataLimiteStr) return 0
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = converterDataParaDate(dataLimiteStr)
  limite.setHours(0, 0, 0, 0)
  const diffMs = limite.getTime() - hoje.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Carrega a lista de manutenções preventivas do localStorage
 */
export function carregarManutencoesPreventivas() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_PREVENTIVA)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao ler manutenções preventivas:', e)
  }

  salvarManutencoesPreventivas(SEED_MANUTENCOES_PREVENTIVAS)
  return SEED_MANUTENCOES_PREVENTIVAS
}

/**
 * Salva manutenções preventivas no localStorage e sincroniza
 */
export function salvarManutencoesPreventivas(lista) {
  try {
    localStorage.setItem(CHAVE_STORAGE_PREVENTIVA, JSON.stringify(lista))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  } catch (e) {
    console.error('Erro ao salvar manutenções preventivas:', e)
  }
}

/**
 * Carrega veículos ativos da oficina (exclui veículos que estão na tela Estacionados)
 */
export function carregarVeiculosAtivosPreventiva() {
  const todosVeiculos = carregarTodosVeiculosDaFrota()
  const estacionados = carregarVeiculosEstacionados()
  const placasEstacionadas = new Set(
    estacionados.map((e) => (e.placa || '').toUpperCase().trim()).filter(Boolean)
  )

  return todosVeiculos.filter((v) => {
    const placa = (v.placa || '').toUpperCase().trim()
    return v.ativo !== false && !placasEstacionadas.has(placa)
  })
}

/**
 * Avalia detalhadamente o estado de saúde e oportunidades de um veículo específico
 */
export function calcularSaudeVeiculo(veiculo, todasPreventivas = null) {
  const preventivas = todasPreventivas || carregarManutencoesPreventivas()
  const placaLimpa = (veiculo.placa || '').toUpperCase().trim()
  const kmAtualNum = parseFloat(String(veiculo.kmPadrao || veiculo.kmAtual || '0').replace(/\./g, '').replace(',', '.')) || 0

  const registrosDoVeiculo = preventivas.filter(
    (p) => (p.placa || '').toUpperCase().trim() === placaLimpa
  )

  const itensAvaliados = []
  let itensVencidos = 0
  let itensAtencao = 0
  let itensEmDia = 0
  let temGarantiaPendente = false
  let receitaPotencialTotal = 0

  // Avalia cada item do catálogo preventivo
  ITENS_PREVENTIVOS_CATALOGO.forEach((catalogoItem) => {
    const reg = registrosDoVeiculo.find((r) => r.itemId === catalogoItem.id)

    let ultimaKm = reg ? reg.ultimaExecucaoKm : Math.max(0, kmAtualNum - (catalogoItem.intervaloKmPadrao * 0.7))
    let ultimaData = reg ? reg.ultimaExecucaoData : '01/01/2026'
    let intervaloKm = reg && reg.intervaloKm ? reg.intervaloKm : catalogoItem.intervaloKmPadrao
    let intervaloMeses = reg && reg.intervaloMeses ? reg.intervaloMeses : catalogoItem.intervaloMesesPadrao

    let proximaKm = ultimaKm + intervaloKm
    let proximaData = adicionarMesesAData(ultimaData, intervaloMeses)

    let kmRestante = Math.round(proximaKm - kmAtualNum)
    let diasRestantes = calcularDiasRestantes(proximaData)

    // Avaliação de Status
    let status = 'em_dia'
    let motivoAlerta = ''

    if (catalogoItem.id === 'revisao_garantia') {
      if (reg && reg.garantiaPendente) {
        temGarantiaPendente = true
        if (diasRestantes <= 0 || kmRestante <= 0) {
          status = 'vencido'
          motivoAlerta = 'Garantia em risco! Prazo ou quilometragem limite de retorno ultrapassados.'
        } else if (diasRestantes <= 20 || kmRestante <= 1000) {
          status = 'atencao'
          motivoAlerta = `Revisão de garantia pendente (restam ${diasRestantes} dias ou ${kmRestante} km)`
        } else {
          status = 'em_dia'
          motivoAlerta = `Retorno de garantia agendado até ${proximaData}`
        }
      } else {
        status = 'em_dia'
        motivoAlerta = 'Sem garantias pendentes de inspeção no momento'
      }
    } else {
      if (kmRestante <= 0 || diasRestantes <= 0) {
        status = 'vencido'
        itensVencidos++
        receitaPotencialTotal += catalogoItem.valorEstimadoMedio
        if (kmRestante <= 0 && diasRestantes <= 0) {
          motivoAlerta = `Atrasado há ${Math.abs(kmRestante)} km e ${Math.abs(diasRestantes)} dias`
        } else if (kmRestante <= 0) {
          motivoAlerta = `Atrasado há ${Math.abs(kmRestante)} km da revisão recomendada`
        } else {
          motivoAlerta = `Prazo de tempo excedido há ${Math.abs(diasRestantes)} dias`
        }
      } else if (kmRestante <= 1000 || diasRestantes <= 30) {
        status = 'atencao'
        itensAtencao++
        receitaPotencialTotal += catalogoItem.valorEstimadoMedio
        motivoAlerta = `Vence em breve (${kmRestante} km ou ${diasRestantes} dias restantes)`
      } else {
        status = 'em_dia'
        itensEmDia++
        motivoAlerta = `Em dia (próxima aos ${proximaKm.toLocaleString('pt-BR')} km ou em ${proximaData})`
      }
    }

    itensAvaliados.push({
      ...catalogoItem,
      registroId: reg ? reg.id : null,
      ultimaExecucaoKm: ultimaKm,
      ultimaExecucaoData: ultimaData,
      proximaRecomendadaKm: proximaKm,
      proximaRecomendadaData: proximaData,
      kmRestante,
      diasRestantes,
      status,
      motivoAlerta,
      mecanicoNome: reg ? reg.mecanicoNome : 'Equipe Mecânica Gabriel',
      observacoes: reg ? reg.observacoes : '',
      servicoOrigem: reg ? reg.servicoOrigem : '',
    })
  })

  // Cálculo da Pontuação de Saúde (0 a 100)
  let healthScore = 100
  itensAvaliados.forEach((item) => {
    if (item.status === 'vencido') {
      healthScore -= item.severidade === 'alta' ? 22 : 12
    } else if (item.status === 'atencao') {
      healthScore -= item.severidade === 'alta' ? 10 : 5
    }
  })
  if (temGarantiaPendente) {
    const itemGarantia = itensAvaliados.find((i) => i.id === 'revisao_garantia')
    if (itemGarantia && itemGarantia.status === 'vencido') {
      healthScore -= 20
    }
  }
  healthScore = Math.max(10, Math.min(100, Math.round(healthScore)))

  // Classificação geral do veículo
  let statusGeral = 'em_dia'
  if (itensVencidos > 0) {
    statusGeral = 'critico'
  } else if (temGarantiaPendente) {
    statusGeral = 'garantia_pendente'
  } else if (itensAtencao > 0) {
    statusGeral = 'atencao'
  }

  return {
    veiculo,
    placa: placaLimpa,
    kmAtualNum,
    healthScore,
    statusGeral,
    itensVencidos,
    itensAtencao,
    itensEmDia,
    temGarantiaPendente,
    receitaPotencialTotal,
    itensAvaliados,
  }
}

/**
 * Atualiza o odômetro de um veículo ativo e recalcula toda a frota
 */
export function atualizarHodometroVeiculo(placa, novoKm) {
  const placaLimpa = (placa || '').toUpperCase().trim()
  const kmFormatado = String(novoKm).trim()

  const clientes = carregarClientesCadastrados()
  let veiculoAtualizado = null

  const novosClientes = clientes.map((cli) => {
    if (!Array.isArray(cli.veiculos)) return cli
    const veiculosAtualizados = cli.veiculos.map((v) => {
      if ((v.placa || '').toUpperCase().trim() === placaLimpa) {
        veiculoAtualizado = {
          ...v,
          kmPadrao: kmFormatado,
          kmAtual: kmFormatado,
        }
        return veiculoAtualizado
      }
      return v
    })
    return {
      ...cli,
      veiculos: veiculosAtualizados,
    }
  })

  salvarClientesCadastrados(novosClientes)
  return veiculoAtualizado
}

/**
 * Registra a execução de um serviço preventivo no veículo
 */
export function registrarExecucaoPreventiva(dados) {
  const lista = carregarManutencoesPreventivas()
  const placaLimpa = (dados.placa || '').toUpperCase().trim()

  const novoRegistro = {
    id: dados.id || `prev-${Date.now()}`,
    placa: placaLimpa,
    itemId: dados.itemId,
    ultimaExecucaoKm: parseFloat(String(dados.km || '0').replace(/\./g, '').replace(',', '.')) || 0,
    ultimaExecucaoData: dados.data || new Date().toLocaleDateString('pt-BR'),
    intervaloKm: parseInt(dados.intervaloKm, 10) || 10000,
    intervaloMeses: parseInt(dados.intervaloMeses, 10) || 6,
    mecanicoNome: dados.mecanicoNome || '',
    observacoes: dados.observacoes || '',
    garantiaPendente: Boolean(dados.garantiaPendente),
    servicoOrigem: dados.servicoOrigem || '',
    prazoGarantiaLimite: dados.prazoGarantiaLimite || '',
  }

  // Remove registro anterior do mesmo item para a mesma placa
  const filtrados = lista.filter(
    (item) => !((item.placa || '').toUpperCase().trim() === placaLimpa && item.itemId === dados.itemId)
  )

  filtrados.unshift(novoRegistro)
  salvarManutencoesPreventivas(filtrados)

  // Se o KM da execução for superior ao atual do veículo, atualiza o hodômetro do veículo
  if (dados.atualizarKmVeiculo && dados.km) {
    atualizarHodometroVeiculo(placaLimpa, dados.km)
  }

  return novoRegistro
}
