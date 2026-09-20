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
export const ITENS_PREVENTIVOS_CATALOGO = [
  {
    id: 'oleo_filtros',
    nome: 'Troca de Óleo e Filtros',
    categoria: 'Lubrificação',
    descricao: 'Óleo sintético ou semissintético, filtro de óleo, ar do motor e combustível',
    intervaloKmPadrao: 10000,
    intervaloMesesPadrao: 6,
    valorEstimadoMedio: 350.0,
    tempoEstimadoMinutos: 45,
    severidade: 'alta',
    icone: 'Drop',
  },
  {
    id: 'pastilhas_freio',
    nome: 'Pastilhas e Discos de Freio',
    categoria: 'Segurança e Freios',
    descricao: 'Inspeção de espessura de pastilhas dianteiras/traseiras, discos e sangria',
    intervaloKmPadrao: 20000,
    intervaloMesesPadrao: 12,
    valorEstimadoMedio: 420.0,
    tempoEstimadoMinutos: 60,
    severidade: 'alta',
    icone: 'Gauge',
  },
  {
    id: 'fluido_arrefecimento',
    nome: 'Fluido de Arrefecimento e Radiador',
    categoria: 'Arrefecimento',
    descricao: 'Limpeza química do sistema, aditivo orgânico concentrado e teste de estanqueidade',
    intervaloKmPadrao: 30000,
    intervaloMesesPadrao: 24,
    valorEstimadoMedio: 280.0,
    tempoEstimadoMinutos: 50,
    severidade: 'alta',
    icone: 'ThermometerHot',
  },
  {
    id: 'palhetas_limpador',
    nome: 'Troca de Palhetas do Limpador',
    categoria: 'Visibilidade e Conforto',
    descricao: 'Substituição das palhetas do para-brisa dianteiro e traseiro por silicone',
    intervaloKmPadrao: 10000,
    intervaloMesesPadrao: 6,
    valorEstimadoMedio: 120.0,
    tempoEstimadoMinutos: 15,
    severidade: 'baixa',
    icone: 'Wind',
  },
  {
    id: 'revisao_basica',
    nome: 'Revisão Básica Periódica',
    categoria: 'Revisão Periódica',
    descricao: 'Checklist de 30 itens, suspensão leve, freios, iluminação e calibração',
    intervaloKmPadrao: 10000,
    intervaloMesesPadrao: 6,
    valorEstimadoMedio: 480.0,
    tempoEstimadoMinutos: 90,
    severidade: 'media',
    icone: 'ShieldCheck',
  },
  {
    id: 'revisao_pesada_correia',
    nome: 'Revisão Pesada e Correia Dentada',
    categoria: 'Motor e Transmissão',
    descricao: 'Kit correia sincronizadora, tensionadores, bomba d água e velas de ignição',
    intervaloKmPadrao: 50000,
    intervaloMesesPadrao: 36,
    valorEstimadoMedio: 1650.0,
    tempoEstimadoMinutos: 240,
    severidade: 'alta',
    icone: 'Wrench',
  },
  {
    id: 'fluido_freio',
    nome: 'Fluido de Freio DOT 4 ou 5.1',
    categoria: 'Segurança e Freios',
    descricao: 'Teste de umidade/ebulição e sangria completa com máquina pressurizada',
    intervaloKmPadrao: 20000,
    intervaloMesesPadrao: 24,
    valorEstimadoMedio: 190.0,
    tempoEstimadoMinutos: 45,
    severidade: 'alta',
    icone: 'Gauge',
  },
  {
    id: 'alinhamento_balanceamento',
    nome: 'Alinhamento 3D e Balanceamento',
    categoria: 'Suspensão e Direção',
    descricao: 'Alinhamento a laser 3D, balanceamento das 4 rodas e rodízio de pneus',
    intervaloKmPadrao: 10000,
    intervaloMesesPadrao: 6,
    valorEstimadoMedio: 160.0,
    tempoEstimadoMinutos: 45,
    severidade: 'media',
    icone: 'Compass',
  },
  {
    id: 'ar_condicionado_cabine',
    nome: 'Higienização de Ar e Filtro Cabine',
    categoria: 'Climatização e Saúde',
    descricao: 'Aplicação de ozônio bactericida e troca do filtro de pólen antipoeira',
    intervaloKmPadrao: 10000,
    intervaloMesesPadrao: 6,
    valorEstimadoMedio: 180.0,
    tempoEstimadoMinutos: 30,
    severidade: 'baixa',
    icone: 'Fan',
  },
  {
    id: 'fluido_cambio',
    nome: 'Fluido de Câmbio Automático ou CVT',
    categoria: 'Motor e Transmissão',
    descricao: 'Troca por diálise com fluido sintético certificado e filtro de cárter',
    intervaloKmPadrao: 40000,
    intervaloMesesPadrao: 36,
    valorEstimadoMedio: 1100.0,
    tempoEstimadoMinutos: 120,
    severidade: 'alta',
    icone: 'GearSix',
  },
  {
    id: 'bateria_carga',
    nome: 'Bateria e Sistema Elétrico',
    categoria: 'Elétrica',
    descricao: 'Teste de condutância e CCA, carga do alternador e terminais de polo',
    intervaloKmPadrao: 30000,
    intervaloMesesPadrao: 24,
    valorEstimadoMedio: 490.0,
    tempoEstimadoMinutos: 25,
    severidade: 'media',
    icone: 'Lightning',
  },
  {
    id: 'revisao_garantia',
    nome: 'Revisão de Retorno e Garantia',
    categoria: 'Garantia de Serviços',
    descricao: 'Inspeção periódica obrigatória para revalidação de garantia da oficina',
    intervaloKmPadrao: 5000,
    intervaloMesesPadrao: 3,
    valorEstimadoMedio: 0.0, // Cortesia de fidelização
    tempoEstimadoMinutos: 30,
    severidade: 'alta',
    icone: 'SealCheck',
  },
]

/**
 * Registros seed com manutenções preventivas para a frota ativa
 */
export const SEED_MANUTENCOES_PREVENTIVAS = [
  // Veículo 1: BRA2E19 (Onix 1.0 Turbo - Carlos Eduardo Silveira) - KM Atual: 38.450
  {
    id: 'prev-1',
    placa: 'BRA2E19',
    itemId: 'oleo_filtros',
    ultimaExecucaoKm: 27500,
    ultimaExecucaoData: '10/01/2026',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Utilizado óleo 5W30 Dexos1 Gen3 com filtro Mahle.',
  },
  {
    id: 'prev-2',
    placa: 'BRA2E19',
    itemId: 'pastilhas_freio',
    ultimaExecucaoKm: 19000,
    ultimaExecucaoData: '15/06/2025',
    intervaloKm: 20000,
    intervaloMeses: 12,
    mecanicoNome: 'Gabriel Amaral',
    observacoes: 'Substituídas pastilhas dianteiras Fras-le. Discos em meia vida.',
  },
  {
    id: 'prev-3',
    placa: 'BRA2E19',
    itemId: 'palhetas_limpador',
    ultimaExecucaoKm: 25000,
    ultimaExecucaoData: '05/11/2025',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Palhetas de silicone dianteiras.',
  },
  {
    id: 'prev-4',
    placa: 'BRA2E19',
    itemId: 'ar_condicionado_cabine',
    ultimaExecucaoKm: 27500,
    ultimaExecucaoData: '10/01/2026',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Higienização por granada química e filtro carvão ativado.',
  },

  // Veículo 2: BDX9F12 (HB20 1.0 Sense - Mariana Duarte Souza) - KM Atual: 64.800
  {
    id: 'prev-5',
    placa: 'BDX9F12',
    itemId: 'oleo_filtros',
    ultimaExecucaoKm: 58000,
    ultimaExecucaoData: '02/03/2026',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Gabriel Amaral',
    observacoes: 'Óleo sintético 5W30 API SP e todos os filtros.',
  },
  {
    id: 'prev-6',
    placa: 'BDX9F12',
    itemId: 'fluido_arrefecimento',
    ultimaExecucaoKm: 32000,
    ultimaExecucaoData: '14/07/2024',
    intervaloKm: 30000,
    intervaloMeses: 24,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Aditivo orgânico verde e água desmineralizada.',
  },
  {
    id: 'prev-7',
    placa: 'BDX9F12',
    itemId: 'revisao_garantia',
    ultimaExecucaoKm: 62500,
    ultimaExecucaoData: '18/06/2026',
    intervaloKm: 3000,
    intervaloMeses: 3,
    mecanicoNome: 'Gabriel Amaral',
    servicoOrigem: 'Troca do kit de embreagem e retentor do volante',
    prazoGarantiaLimite: '18/09/2026',
    garantiaPendente: true,
    observacoes: 'Retorno obrigatório de 90 dias para reaperto e teste de embreagem para validação de 1 ano de garantia.',
  },

  // Veículo 3: RAW3H55 (Fiat Fiorino - Transportadora Rápido Norte) - KM Atual: 89.300
  {
    id: 'prev-8',
    placa: 'RAW3H55',
    itemId: 'revisao_pesada_correia',
    ultimaExecucaoKm: 40000,
    ultimaExecucaoData: '12/04/2024',
    intervaloKm: 50000,
    intervaloMeses: 36,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Kit Correia Dentada Gates com tensor Ina.',
  },
  {
    id: 'prev-9',
    placa: 'RAW3H55',
    itemId: 'oleo_filtros',
    ultimaExecucaoKm: 81000,
    ultimaExecucaoData: '20/05/2026',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Gabriel Amaral',
    observacoes: 'Óleo Selènia 15W40 semissintético.',
  },
  {
    id: 'prev-10',
    placa: 'RAW3H55',
    itemId: 'pastilhas_freio',
    ultimaExecucaoKm: 68000,
    ultimaExecucaoData: '10/11/2025',
    intervaloKm: 20000,
    intervaloMeses: 12,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Substituição de pastilhas e lonas traseiras.',
  },

  // Veículo 4: BCP4K10 (Jeep Compass - Lucas Vinicius Alcantara) - KM Atual: 41.950
  {
    id: 'prev-11',
    placa: 'BCP4K10',
    itemId: 'pastilhas_freio',
    ultimaExecucaoKm: 21500,
    ultimaExecucaoData: '08/08/2025',
    intervaloKm: 20000,
    intervaloMeses: 12,
    mecanicoNome: 'Gabriel Amaral',
    observacoes: 'Pastilhas de cerâmica Cobreq.',
  },
  {
    id: 'prev-12',
    placa: 'BCP4K10',
    itemId: 'revisao_garantia',
    ultimaExecucaoKm: 39500,
    ultimaExecucaoData: '10/07/2026',
    intervaloKm: 3000,
    intervaloMeses: 3,
    mecanicoNome: 'Carlos Eduardo',
    servicoOrigem: 'Amortecedores dianteiros Monroe e batentes',
    prazoGarantiaLimite: '10/10/2026',
    garantiaPendente: true,
    observacoes: 'Revisão dos 3 meses de garantia dos amortecedores dianteiros para manter garantia de fábrica Monroe.',
  },
  {
    id: 'prev-13',
    placa: 'BCP4K10',
    itemId: 'alinhamento_balanceamento',
    ultimaExecucaoKm: 31000,
    ultimaExecucaoData: '15/01/2026',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Geometria de suspensão e rodízio cruzado.',
  },

  // Veículo 5: ASF6I46 (Fiat Doblo - Edgar Amaral da Silveira) - KM Atual: 280.812
  {
    id: 'prev-14',
    placa: 'ASF6I46',
    itemId: 'oleo_filtros',
    ultimaExecucaoKm: 279003,
    ultimaExecucaoData: '10/08/2026',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Óleo sintético 5W30 e todos os filtros substituídos na OS #002895.',
  },
  {
    id: 'prev-15',
    placa: 'ASF6I46',
    itemId: 'fluido_arrefecimento',
    ultimaExecucaoKm: 245000,
    ultimaExecucaoData: '02/09/2024',
    intervaloKm: 30000,
    intervaloMeses: 24,
    mecanicoNome: 'Gabriel Amaral',
    observacoes: 'Substituição recomendada urgente na OS #002908 em andamento.',
  },

  // Veículo 6: RHJ4A88 (Toyota Corolla Cross - Carlos Eduardo Silveira) - KM Atual: 52.120
  {
    id: 'prev-16',
    placa: 'RHJ4A88',
    itemId: 'oleo_filtros',
    ultimaExecucaoKm: 49800,
    ultimaExecucaoData: '14/06/2026',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Gabriel Amaral',
    observacoes: 'Óleo original Toyota 0W20 sintético.',
  },
  {
    id: 'prev-17',
    placa: 'RHJ4A88',
    itemId: 'fluido_cambio',
    ultimaExecucaoKm: 0,
    ultimaExecucaoData: '15/01/2022',
    intervaloKm: 60000,
    intervaloMeses: 48,
    mecanicoNome: 'Fábrica',
    observacoes: 'Fluido da transmissão Direct Shift CVT. Previsão de primeira troca aos 60.000 KM.',
  },

  // Veículo 7: RDK7C21 (Renault Master - Transportadora Rápido Norte) - KM Atual: 142.600
  {
    id: 'prev-18',
    placa: 'RDK7C21',
    itemId: 'oleo_filtros',
    ultimaExecucaoKm: 130000,
    ultimaExecucaoData: '10/02/2026',
    intervaloKm: 10000,
    intervaloMeses: 6,
    mecanicoNome: 'Carlos Eduardo',
    observacoes: 'Óleo 5W30 DPF Diesel. Ultrapassou a quilometragem recomendada em 2.600 km!',
  },
  {
    id: 'prev-19',
    placa: 'RDK7C21',
    itemId: 'pastilhas_freio',
    ultimaExecucaoKm: 125000,
    ultimaExecucaoData: '18/12/2025',
    intervaloKm: 20000,
    intervaloMeses: 12,
    mecanicoNome: 'Gabriel Amaral',
    observacoes: 'Pastilhas de van para serviço pesado.',
  },
]

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
      if (Array.isArray(parsed) && parsed.length > 0) {
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
    mecanicoNome: dados.mecanicoNome || 'Gabriel Amaral',
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
