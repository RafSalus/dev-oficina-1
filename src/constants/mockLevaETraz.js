// Módulo de Gerenciamento e Persistência de Leva e Traz e Logística da Oficina
// Regras do Sistema: Sem uso do caractere proibido ('&'), apenas 'e'
// Gerencia busca de veículos, entrega de veículos, coleta de peças e translado de clientes

export const CHAVE_STORAGE_LEVA_E_TRAZ = 'dev_oficina_leva_e_traz'
export const CHAVE_STORAGE_FROTA_APOIO = 'dev_oficina_frota_apoio'

export const TIPOS_SERVICO_LOGISTICA = [
  { value: 'TODOS', label: 'Todos os Tipos de Serviço' },
  { value: 'busca_veiculo', label: 'Busca de Carro de Cliente' },
  { value: 'entrega_veiculo', label: 'Entrega de Carro de Cliente' },
  { value: 'translado_cliente', label: 'Leva e Traz de Cliente (Carona)' },
  { value: 'busca_pecas', label: 'Busca de Peças em Fornecedor' },
  { value: 'socorro_externo', label: 'Socorro Mecânico Externo' },
]

export const STATUS_LOGISTICA = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'agendado', label: 'Agendado na Fila' },
  { value: 'em_deslocamento', label: 'Em Rota e Deslocamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

export const VEICULOS_APOIO_PADRAO = [
  {
    id: 'apoio-1',
    codigo: 'APOIO-01',
    nome: 'Fiat Fiorino 1.4 Hard Working',
    placa: 'RAW-3H55',
    tipo: 'Furgão Utilitário',
    ano: '2021/2022',
    combustivel: 'FLEX',
    kmAtual: '89.420',
    status: 'disponivel', // 'disponivel' ou 'em_rota'
    emUsoPor: null,
  },
  {
    id: 'apoio-2',
    codigo: 'APOIO-02',
    nome: 'Volkswagen Gol 1.6 MSI Totalflex',
    placa: 'FJR-8D19',
    tipo: 'Veículo de Passeio e Carona',
    ano: '2020/2021',
    combustivel: 'FLEX',
    kmAtual: '73.150',
    status: 'disponivel',
    emUsoPor: null,
  },
  {
    id: 'apoio-3',
    codigo: 'APOIO-03',
    nome: 'Honda CG 160 Fan Cargo',
    placa: 'BDX-4K20',
    tipo: 'Moto Expressa para Peças',
    ano: '2022/2023',
    combustivel: 'FLEX',
    kmAtual: '24.800',
    status: 'disponivel',
    emUsoPor: null,
  },
]

export const MOTORISTAS_PADRAO = [
  { value: 'Marcos Aurélio', label: 'Marcos Aurélio (Motorista e Apoio de Pátio)', telefone: '(43) 99876-4411' },
  { value: 'Lucas Faria', label: 'Lucas Faria (Auxiliar de Logística e Pátio)', telefone: '(43) 99876-8822' },
  { value: 'Carlos Eduardo', label: 'Carlos Eduardo (Chefe de Oficina)', telefone: '(43) 99876-1122' },
  { value: 'Gabriel Amaral', label: 'Gabriel Amaral (Mecânico Especialista)', telefone: '(43) 99876-3344' },
  { value: 'Danilo Silva', label: 'Danilo Silva (Eletricista Automotivo)', telefone: '(43) 99876-7788' },
  { value: 'Rafael Salustiano', label: 'Rafael Salustiano (Mecânico Pleno)', telefone: '(43) 99876-5566' },
]

export const SEED_LEVA_E_TRAZ = [
  {
    id: 'desloc-1',
    codigo: 'LOG-0042',
    tipoServico: 'busca_veiculo',
    status: 'em_deslocamento',
    prioridade: 'alta',
    // Cliente e Veículo do Cliente
    clienteId: 'cli-0',
    clienteNome: 'Edgar Amaral da Silveira',
    clienteTelefone: '(43) 98812-6874',
    veiculoPlaca: 'ASF6I46',
    veiculoModelo: 'Fiat Doblo 1.8 Cargo',
    numeroOS: '002908',
    // Equipe (Dois funcionários: um dirige o carro de apoio, o outro traz o carro do cliente)
    quantidadeFuncionarios: 2,
    motoristaPrincipalNome: 'Marcos Aurélio',
    auxiliarNome: 'Lucas Faria',
    veiculoApoioId: 'apoio-1',
    veiculoApoioNome: 'Fiat Fiorino Oficina (RAW-3H55)',
    // Carona para cliente
    levarClienteEmbora: false,
    // Itens de Coleta de Peças
    fornecedorNome: '',
    pecasDescricao: '',
    // Endereços e Rota
    enderecoOrigem: 'Oficina Gabriel - R Tupinamba, 566',
    enderecoDestino: 'R Tupinamba, 566 - Bairro Centro, Apucarana - PR',
    cidade: 'Apucarana',
    kmEstimado: '14',
    kmInicial: '89.420',
    kmFinal: '',
    kmRealizado: '',
    // Prazos e Tempos
    data: new Date().toLocaleDateString('pt-BR'),
    horarioSaidaPrevisto: '14:15',
    horarioSaidaReal: '14:18',
    horarioRetornoPrevisto: '15:00',
    horarioRetornoReal: '',
    tempoEstimadoMinutos: 45,
    tempoRealMinutos: null,
    // Cobrança
    tipoCobranca: 'cortesia',
    valorTaxa: 0,
    observacoes: 'Cliente relatou barulho de arrefecimento. Dois funcionários escalados para trazer o Doblo com o furgão de apoio.',
  },
  {
    id: 'desloc-2',
    codigo: 'LOG-0043',
    tipoServico: 'busca_pecas',
    status: 'agendado',
    prioridade: 'urgente',
    // Cliente e OS associada
    clienteId: 'cli-0',
    clienteNome: 'Edgar Amaral da Silveira',
    clienteTelefone: '(43) 98812-6874',
    veiculoPlaca: 'ASF6I46',
    veiculoModelo: 'Fiat Doblo 1.8 Cargo',
    numeroOS: '002908',
    // Equipe (1 funcionário para coleta expressa)
    quantidadeFuncionarios: 1,
    motoristaPrincipalNome: 'Lucas Faria',
    auxiliarNome: '',
    veiculoApoioId: 'apoio-3',
    veiculoApoioNome: 'Honda CG 160 Cargo (BDX-4K20)',
    levarClienteEmbora: false,
    // Fornecedor e Peças
    fornecedorNome: 'Radiadores e Distribuidora Apucarana',
    fornecedorTelefone: '(43) 3422-9900',
    pecasDescricao: '1x Tubo Suporte de Arrefecimento Valclei e 2x Abraçadeiras 14x22',
    enderecoOrigem: 'Oficina Gabriel - R Tupinamba, 566',
    enderecoDestino: 'Av. Brasil, 1420 - Parque Industrial, Apucarana - PR',
    cidade: 'Apucarana',
    kmEstimado: '8',
    kmInicial: '24.800',
    kmFinal: '',
    kmRealizado: '',
    data: new Date().toLocaleDateString('pt-BR'),
    horarioSaidaPrevisto: '15:30',
    horarioSaidaReal: '',
    horarioRetornoPrevisto: '16:05',
    horarioRetornoReal: '',
    tempoEstimadoMinutos: 35,
    tempoRealMinutos: null,
    tipoCobranca: 'cortesia',
    valorTaxa: 0,
    observacoes: 'Buscar peças com urgência para montagem imediata do arrefecimento da OS #002908.',
  },
  {
    id: 'desloc-3',
    codigo: 'LOG-0044',
    tipoServico: 'translado_cliente',
    status: 'agendado',
    prioridade: 'normal',
    clienteId: 'cli-2',
    clienteNome: 'Mariana Duarte Souza',
    clienteTelefone: '(43) 98845-1290',
    veiculoPlaca: 'BDX9F12',
    veiculoModelo: 'Hyundai HB20 1.0 Sense',
    numeroOS: '002915',
    quantidadeFuncionarios: 1,
    motoristaPrincipalNome: 'Marcos Aurélio',
    auxiliarNome: '',
    veiculoApoioId: 'apoio-2',
    veiculoApoioNome: 'Volkswagen Gol Apoio (FJR-8D19)',
    levarClienteEmbora: true,
    fornecedorNome: '',
    pecasDescricao: '',
    enderecoOrigem: 'Oficina Gabriel - R Tupinamba, 566',
    enderecoDestino: 'Av. Ayrton Senna, 1150, Apto 802 - Gleba Palhano, Londrina - PR',
    cidade: 'Londrina',
    kmEstimado: '16',
    kmInicial: '73.150',
    kmFinal: '',
    kmRealizado: '',
    data: new Date().toLocaleDateString('pt-BR'),
    horarioSaidaPrevisto: '16:15',
    horarioSaidaReal: '',
    horarioRetornoPrevisto: '17:00',
    horarioRetornoReal: '',
    tempoEstimadoMinutos: 45,
    tempoRealMinutos: null,
    tipoCobranca: 'cortesia',
    valorTaxa: 0,
    observacoes: 'Cliente deixou o veículo para revisão de suspensão e solicitou translado até sua residência.',
  },
  {
    id: 'desloc-4',
    codigo: 'LOG-0041',
    tipoServico: 'entrega_veiculo',
    status: 'concluido',
    prioridade: 'normal',
    clienteId: 'cli-1',
    clienteNome: 'Carlos Eduardo Silveira',
    clienteTelefone: '(43) 99123-4567',
    veiculoPlaca: 'BRA2E19',
    veiculoModelo: 'Chevrolet Onix 1.0 Turbo',
    numeroOS: '002830',
    // Entrega envolveu 2 funcionários (um levou o Onix, o outro seguiu na Fiorino para retorno)
    quantidadeFuncionarios: 2,
    motoristaPrincipalNome: 'Marcos Aurélio',
    auxiliarNome: 'Danilo Silva',
    veiculoApoioId: 'apoio-1',
    veiculoApoioNome: 'Fiat Fiorino Oficina (RAW-3H55)',
    levarClienteEmbora: false,
    fornecedorNome: '',
    pecasDescricao: '',
    enderecoOrigem: 'Oficina Gabriel - R Tupinamba, 566',
    enderecoDestino: 'Rua das Palmeiras, 342 - Centro, Londrina - PR',
    cidade: 'Londrina',
    kmEstimado: '12',
    kmInicial: '89.408',
    kmFinal: '89.420',
    kmRealizado: '12',
    data: new Date().toLocaleDateString('pt-BR'),
    horarioSaidaPrevisto: '10:00',
    horarioSaidaReal: '10:05',
    horarioRetornoPrevisto: '10:50',
    horarioRetornoReal: '10:45',
    tempoEstimadoMinutos: 50,
    tempoRealMinutos: 40,
    tipoCobranca: 'cortesia',
    valorTaxa: 0,
    observacoes: 'Veículo entregue higienizado e revisado diretamente nas mãos do cliente com recibo assinado.',
  },
  {
    id: 'desloc-5',
    codigo: 'LOG-0040',
    tipoServico: 'socorro_externo',
    status: 'concluido',
    prioridade: 'urgente',
    clienteId: 'cli-3',
    clienteNome: 'Transportadora Rápido Norte Ltda',
    clienteTelefone: '(43) 3344-9000',
    veiculoPlaca: 'RAW3H55',
    veiculoModelo: 'Fiat Fiorino 1.4 Hard Working',
    numeroOS: '002890',
    quantidadeFuncionarios: 2,
    motoristaPrincipalNome: 'Gabriel Amaral',
    auxiliarNome: 'Marcos Aurélio',
    veiculoApoioId: 'apoio-1',
    veiculoApoioNome: 'Fiat Fiorino Oficina (RAW-3H55)',
    levarClienteEmbora: false,
    fornecedorNome: '',
    pecasDescricao: 'Bateria Moura 60Ah e Cabos de Transferência',
    enderecoOrigem: 'Oficina Gabriel - R Tupinamba, 566',
    enderecoDestino: 'Rodovia Celso Garcia Cid, KM 378 - Londrina - PR',
    cidade: 'Londrina',
    kmEstimado: '22',
    kmInicial: '89.386',
    kmFinal: '89.408',
    kmRealizado: '22',
    data: '18/08/2026',
    horarioSaidaPrevisto: '11:00',
    horarioSaidaReal: '11:02',
    horarioRetornoPrevisto: '12:00',
    horarioRetornoReal: '11:50',
    tempoEstimadoMinutos: 60,
    tempoRealMinutos: 48,
    tipoCobranca: 'cobrado',
    valorTaxa: 80,
    observacoes: 'Socorro para teste de alternador e substituição de bateria na rodovia. Veículo liberado para viagem.',
  },
]

export function carregarDeslocamentos() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_LEVA_E_TRAZ)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao carregar deslocamentos:', e)
  }

  salvarDeslocamentos(SEED_LEVA_E_TRAZ)
  return SEED_LEVA_E_TRAZ
}

export function salvarDeslocamentos(lista) {
  try {
    localStorage.setItem(CHAVE_STORAGE_LEVA_E_TRAZ, JSON.stringify(lista))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  } catch (e) {
    console.error('Erro ao salvar deslocamentos:', e)
  }
}

export function carregarVeiculosDeApoio() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_FROTA_APOIO)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao ler frota de apoio:', e)
  }

  salvarVeiculosDeApoio(VEICULOS_APOIO_PADRAO)
  return VEICULOS_APOIO_PADRAO
}

export function salvarVeiculosDeApoio(lista) {
  try {
    localStorage.setItem(CHAVE_STORAGE_FROTA_APOIO, JSON.stringify(lista))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  } catch (e) {
    console.error('Erro ao salvar frota de apoio:', e)
  }
}

export function gerarProximoCodigoDeslocamento() {
  const lista = carregarDeslocamentos()
  let maxNum = 44
  lista.forEach((item) => {
    if (item.codigo) {
      const match = String(item.codigo).match(/\d+/)
      if (match) {
        const n = parseInt(match[0], 10)
        if (n > maxNum) maxNum = n
      }
    }
  })
  return `LOG-${String(maxNum + 1).padStart(4, '0')}`
}

export function criarNovoDeslocamento(dados) {
  const lista = carregarDeslocamentos()
  const proximoCodigo = gerarProximoCodigoDeslocamento()

  const novo = {
    ...dados,
    id: `desloc-${Date.now()}`,
    codigo: proximoCodigo,
    status: dados.status || 'agendado',
    data: dados.data || new Date().toLocaleDateString('pt-BR'),
  }

  lista.unshift(novo)
  salvarDeslocamentos(lista)
  return novo
}

export function atualizarDeslocamento(dadosAtualizados) {
  const lista = carregarDeslocamentos()
  const index = lista.findIndex((item) => item.id === dadosAtualizados.id)
  if (index !== -1) {
    lista[index] = {
      ...lista[index],
      ...dadosAtualizados,
    }
    salvarDeslocamentos(lista)
    return lista[index]
  }
  return null
}

export function iniciarDeslocamento(id) {
  const lista = carregarDeslocamentos()
  const index = lista.findIndex((item) => item.id === id)
  if (index === -1) return null

  const agora = new Date()
  const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  lista[index] = {
    ...lista[index],
    status: 'em_deslocamento',
    horarioSaidaReal: lista[index].horarioSaidaReal || horaAtual,
  }

  // Se tem veículo de apoio, marca como em_rota
  if (lista[index].veiculoApoioId) {
    const apoioFrota = carregarVeiculosDeApoio()
    const apoioIdx = apoioFrota.findIndex((v) => v.id === lista[index].veiculoApoioId)
    if (apoioIdx !== -1) {
      apoioFrota[apoioIdx].status = 'em_rota'
      apoioFrota[apoioIdx].emUsoPor = lista[index].motoristaPrincipalNome
      salvarVeiculosDeApoio(apoioFrota)
    }
  }

  salvarDeslocamentos(lista)
  return lista[index]
}

export function finalizarDeslocamento(id, dadosRetorno = {}) {
  const lista = carregarDeslocamentos()
  const index = lista.findIndex((item) => item.id === id)
  if (index === -1) return null

  const agora = new Date()
  const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const kmInicialNum = parseFloat(String(lista[index].kmInicial || '0').replace(/\./g, '').replace(',', '.')) || 0
  const kmFinalNum = parseFloat(String(dadosRetorno.kmFinal || '0').replace(/\./g, '').replace(',', '.')) || 0
  let kmRealizado = dadosRetorno.kmRealizado
  if (!kmRealizado && kmFinalNum > kmInicialNum) {
    kmRealizado = String(Math.round(kmFinalNum - kmInicialNum))
  }

  lista[index] = {
    ...lista[index],
    ...dadosRetorno,
    status: 'concluido',
    horarioRetornoReal: dadosRetorno.horarioRetornoReal || horaAtual,
    kmRealizado: kmRealizado || lista[index].kmEstimado || '',
  }

  // Libera veículo de apoio
  if (lista[index].veiculoApoioId) {
    const apoioFrota = carregarVeiculosDeApoio()
    const apoioIdx = apoioFrota.findIndex((v) => v.id === lista[index].veiculoApoioId)
    if (apoioIdx !== -1) {
      apoioFrota[apoioIdx].status = 'disponivel'
      apoioFrota[apoioIdx].emUsoPor = null
      if (dadosRetorno.kmFinal) {
        apoioFrota[apoioIdx].kmAtual = dadosRetorno.kmFinal
      }
      salvarVeiculosDeApoio(apoioFrota)
    }
  }

  salvarDeslocamentos(lista)
  return lista[index]
}

export function cancelarDeslocamento(id, motivo = '') {
  const lista = carregarDeslocamentos()
  const index = lista.findIndex((item) => item.id === id)
  if (index === -1) return null

  lista[index] = {
    ...lista[index],
    status: 'cancelado',
    motivoCancelamento: motivo,
  }

  // Libera veículo de apoio caso estivesse reservado
  if (lista[index].veiculoApoioId) {
    const apoioFrota = carregarVeiculosDeApoio()
    const apoioIdx = apoioFrota.findIndex((v) => v.id === lista[index].veiculoApoioId)
    if (apoioIdx !== -1) {
      apoioFrota[apoioIdx].status = 'disponivel'
      apoioFrota[apoioIdx].emUsoPor = null
      salvarVeiculosDeApoio(apoioFrota)
    }
  }

  salvarDeslocamentos(lista)
  return lista[index]
}

export function excluirDeslocamento(id) {
  const lista = carregarDeslocamentos()
  const filtrados = lista.filter((item) => item.id !== id)
  salvarDeslocamentos(filtrados)
}

export function gerarProximoCodigoApoio() {
  const lista = carregarVeiculosDeApoio()
  let maxNum = 0
  lista.forEach((item) => {
    if (item.codigo) {
      const match = String(item.codigo).match(/\d+/)
      if (match) {
        const n = parseInt(match[0], 10)
        if (n > maxNum) maxNum = n
      }
    }
  })
  return `APOIO-${String(maxNum + 1).padStart(2, '0')}`
}

export function criarVeiculoApoio(dados) {
  const lista = carregarVeiculosDeApoio()
  const proximoCodigo = gerarProximoCodigoApoio()

  const novo = {
    ...dados,
    id: `apoio-${Date.now()}`,
    codigo: proximoCodigo,
    status: 'disponivel',
    emUsoPor: null,
  }

  lista.push(novo)
  salvarVeiculosDeApoio(lista)
  return novo
}

export function atualizarVeiculoApoio(dadosAtualizados) {
  const lista = carregarVeiculosDeApoio()
  const index = lista.findIndex((item) => item.id === dadosAtualizados.id)
  if (index !== -1) {
    lista[index] = {
      ...lista[index],
      ...dadosAtualizados,
    }
    salvarVeiculosDeApoio(lista)
    return lista[index]
  }
  return null
}

export function excluirVeiculoApoio(id) {
  const lista = carregarVeiculosDeApoio()
  const filtrados = lista.filter((item) => item.id !== id)
  salvarVeiculosDeApoio(filtrados)
}
