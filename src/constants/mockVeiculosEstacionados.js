// Módulo de Gerenciamento e Persistência de Veículos Estacionados
// Regras do Sistema: Sem uso do caractere proibido ('&'), apenas 'e'
// Mantém histórico completo de manutenção mesmo após a venda do veículo pelo antigo proprietário

import {
  carregarClientesCadastrados,
  salvarClientesCadastrados,
  salvarVeiculoNaFrota,
  gerarProximoCodigoCliente,
} from './mockClientesVeiculos'
import {
  obterOrdensAbertas,
  obterOrdensFinalizadas,
} from '../pages/dashboard/orcamento/mockOrdensAbertas'

export const CHAVE_STORAGE_ESTACIONADOS = 'dev_oficina_veiculos_estacionados'

export const SEED_VEICULOS_ESTACIONADOS = [
  {
    id: 'estac-1',
    placa: 'MKZ3A88',
    codigoVeiculo: 'VEIC-0034',
    marca: 'HONDA',
    modelo: 'CIVIC EXL 2.0 CVT',
    marcaModelo: 'Honda Civic EXL 2.0 CVT',
    ano: '2019/2020',
    cor: 'Prata Platinum',
    combustivel: 'FLEX',
    kmAtual: '68.420',
    chassi: '93HFA1670KZ102938',
    renavam: '00192837461',
    dataEstacionamento: '12/08/2026',
    motivoVenda: 'Cliente vendeu o veículo e novo proprietário ainda não é cliente da oficina',
    // Dados do antigo proprietário (cliente que vendeu)
    antigoClienteId: 'cli-1',
    antigoClienteNome: 'Carlos Eduardo Silveira',
    antigoClienteTelefone: '(43) 99123-4567',
    antigoClienteDocumento: '284.910.482-15',
    // Dados do novo proprietário (provisório ou interessado, se informado)
    novoDonoNome: 'Rodrigo Pires Alencar',
    novoDonoTelefone: '(43) 99111-2233',
    novoDonoDocumento: '412.873.991-04',
    novoDonoEmail: 'rodrigo.pires@email.com',
    observacoes: 'Comprador informou interesse em manter as manutenções na oficina Gabriel e planeja agendar a revisão dos 70.000 KM.',
    historicoManutencoes: [
      {
        numeroOS: '002715',
        dataEntrada: '14/01/2026',
        km: '60.150',
        clienteNaEpoca: 'Carlos Eduardo Silveira',
        mecanicoNome: 'Gabriel Amaral',
        status: 'finalizada',
        valorTotal: 1475.0,
        garantiaAte: '14/04/2026',
        laudoTecnico: 'Veículo em perfeito estado mecânico. Fluido CVT substituído preventivamente com troca dos filtros.',
        servicos: [
          { nome: 'Revisão dos 60.000 KM com Checklist Geral', tempoHoras: '2.5', valor: 280.0 },
          { nome: 'Troca de Fluido da Transmissão Automática CVT', tempoHoras: '1.5', valor: 220.0 },
          { nome: 'Alinhamento 3D e Balanceamento das 4 Rodas', tempoHoras: '1.0', valor: 140.0 },
        ],
        pecas: [
          { nome: 'Fluido de Câmbio HCF-2 Original Honda', quantidade: 4, valor: 360.0 },
          { nome: 'Filtro de Óleo do Câmbio CVT', quantidade: 1, valor: 125.0 },
          { nome: 'Filtro de Ar do Motor e Cabine', quantidade: 2, valor: 110.0 },
          { nome: 'Óleo Sintético 0W20 SP Honda', quantidade: 4, valor: 240.0 },
        ],
      },
      {
        numeroOS: '002510',
        dataEntrada: '18/06/2025',
        km: '50.300',
        clienteNaEpoca: 'Carlos Eduardo Silveira',
        mecanicoNome: 'Carlos Eduardo',
        status: 'finalizada',
        valorTotal: 840.0,
        garantiaAte: '18/09/2025',
        laudoTecnico: 'Sistema de freios inspecionado e pastilhas substituídas. Espessura dos discos dentro do padrão.',
        servicos: [
          { nome: 'Substituição das Pastilhas de Freio Dianteiras e Traseiras', tempoHoras: '2.0', valor: 240.0 },
          { nome: 'Sangria e Troca do Fluido de Freio DOT 4', tempoHoras: '1.0', valor: 120.0 },
        ],
        pecas: [
          { nome: 'Jogo de Pastilhas Dianteiras Cerâmica Fras-le', quantidade: 1, valor: 230.0 },
          { nome: 'Jogo de Pastilhas Traseiras Fras-le', quantidade: 1, valor: 180.0 },
          { nome: 'Fluido de Freio DOT 4 Bosch', quantidade: 2, valor: 70.0 },
        ],
      },
    ],
  },
  {
    id: 'estac-2',
    placa: 'FJR8D19',
    codigoVeiculo: 'VEIC-0052',
    marca: 'VOLKSWAGEN',
    modelo: 'GOL 1.6 MSI TOTALFLEX',
    marcaModelo: 'Volkswagen Gol 1.6 MSI Totalflex',
    ano: '2020/2021',
    cor: 'Branco Cristal',
    combustivel: 'FLEX',
    kmAtual: '72.900',
    chassi: '9BWAB45U7MP039182',
    renavam: '00284918273',
    dataEstacionamento: '28/07/2026',
    motivoVenda: 'Veículo repassado para terceiro em negociação particular',
    antigoClienteId: 'cli-2',
    antigoClienteNome: 'Mariana Duarte Souza',
    antigoClienteTelefone: '(43) 98845-1290',
    antigoClienteDocumento: '049.321.890-44',
    novoDonoNome: 'Marcos Vinicius de Souza',
    novoDonoTelefone: '(43) 99876-5432',
    novoDonoDocumento: '319.482.109-77',
    novoDonoEmail: '',
    observacoes: 'Mariana comunicou a venda na última visita. Novo dono pretende fazer inspeção da correia e suspensão.',
    historicoManutencoes: [
      {
        numeroOS: '002680',
        dataEntrada: '10/02/2026',
        km: '68.000',
        clienteNaEpoca: 'Mariana Duarte Souza',
        mecanicoNome: 'Gabriel Amaral',
        status: 'finalizada',
        valorTotal: 690.0,
        garantiaAte: '10/05/2026',
        laudoTecnico: 'Vazão dos bicos injetores equalizada por ultrassom. Motor operando com resposta rápida e econômica.',
        servicos: [
          { nome: 'Troca de Óleo e Filtros com Inspeção Geral', tempoHoras: '1.0', valor: 120.0 },
          { nome: 'Limpeza de Bicos Injetores por Ultrassom', tempoHoras: '1.5', valor: 180.0 },
        ],
        pecas: [
          { nome: 'Óleo Motor 5W40 Sintético Maxi Lub', quantidade: 4, valor: 210.0 },
          { nome: 'Filtro de Óleo, Ar e Combustível', quantidade: 3, valor: 135.0 },
          { nome: 'Aditivo de Limpeza de Injeção Koube', quantidade: 1, valor: 45.0 },
        ],
      },
    ],
  },
  {
    id: 'estac-3',
    placa: 'PQL5C42',
    codigoVeiculo: 'VEIC-0068',
    marca: 'TOYOTA',
    modelo: 'HILUX SRV 2.8 TURBO 4X4',
    marcaModelo: 'Toyota Hilux SRV 2.8 Turbo 4x4',
    ano: '2019/2019',
    cor: 'Cinza Granito',
    combustivel: 'DIESEL',
    kmAtual: '134.500',
    chassi: '8AJBA3CD4K0182741',
    renavam: '00392817263',
    dataEstacionamento: '05/09/2026',
    motivoVenda: 'Empresa renovou frota e vendeu a caminhonete no mercado local',
    antigoClienteId: 'cli-3',
    antigoClienteNome: 'Transportadora Rápido Norte Ltda',
    antigoClienteTelefone: '(43) 3344-9000',
    antigoClienteDocumento: '14.892.401/0001-92',
    novoDonoNome: '',
    novoDonoTelefone: '',
    novoDonoDocumento: '',
    novoDonoEmail: '',
    observacoes: 'Vendido sem identificação imediata do novo proprietário. Manter todo o histórico preservado para eventual consulta do comprador.',
    historicoManutencoes: [
      {
        numeroOS: '002820',
        dataEntrada: '15/05/2026',
        km: '130.000',
        clienteNaEpoca: 'Transportadora Rápido Norte Ltda',
        mecanicoNome: 'Carlos Eduardo',
        status: 'finalizada',
        valorTotal: 1620.0,
        garantiaAte: '15/08/2026',
        laudoTecnico: 'Cardan balanceado com cruzetas novas e engraxadas. Tração 4x4 e reduzida testadas com funcionamento perfeito.',
        servicos: [
          { nome: 'Revisão do Sistema de Tração 4x4 e Diferenciais', tempoHoras: '3.0', valor: 450.0 },
          { nome: 'Substituição das Cruzetas do Cardan Traseiro', tempoHoras: '2.0', valor: 280.0 },
          { nome: 'Troca de Óleo dos Diferenciais Dianteiro e Traseiro 80W90', tempoHoras: '1.5', valor: 180.0 },
        ],
        pecas: [
          { nome: 'Kit Cruzeta Cardan Spicer', quantidade: 2, valor: 390.0 },
          { nome: 'Óleo de Diferencial GL-5 80W90 Mobil', quantidade: 5, valor: 275.0 },
          { nome: 'Graxa Azul para Rolamentos e Mancais', quantidade: 1, valor: 45.0 },
        ],
      },
      {
        numeroOS: '002612',
        dataEntrada: '12/11/2025',
        km: '120.200',
        clienteNaEpoca: 'Transportadora Rápido Norte Ltda',
        mecanicoNome: 'Gabriel Amaral',
        status: 'finalizada',
        valorTotal: 1655.0,
        garantiaAte: '12/02/2026',
        laudoTecnico: 'Sistema de injeção diesel common rail regulado e sem fumaça. Filtro separador novo instalado.',
        servicos: [
          { nome: 'Revisão dos Injetores Diesel Common Rail e Bomba de Alta', tempoHoras: '4.0', valor: 600.0 },
          { nome: 'Substituição do Filtro Separador de Água e Filtro de Diesel', tempoHoras: '1.0', valor: 120.0 },
        ],
        pecas: [
          { nome: 'Kit Filtro de Combustível Original Toyota', quantidade: 1, valor: 210.0 },
          { nome: 'Filtro Separador Racor', quantidade: 1, valor: 145.0 },
          { nome: 'Calibração dos Bicos Injetores Denso', quantidade: 4, valor: 580.0 },
        ],
      },
    ],
  },
]

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
export function estacionarVeiculo({ veiculo, dadosVenda }) {
  const estacionados = carregarVeiculosEstacionados()
  const placaFormatada = String(veiculo.placa || '').toUpperCase().trim()

  // 1. Extrai histórico completo acumulado do veículo
  const historicoAcumulado = obterHistoricoCompletoVeiculo(placaFormatada, veiculo)

  // 2. Cria o registro de veículo estacionado
  const novoEstacionado = {
    id: `estac-${Date.now()}`,
    placa: placaFormatada,
    codigoVeiculo: veiculo.codigoVeiculo || `VEIC-${Math.floor(1000 + Math.random() * 9000)}`,
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

  // 4. Remove o veículo da frota ativa do antigo cliente nos cadastros
  try {
    const clientes = carregarClientesCadastrados()
    const clientesAtualizados = clientes.map((cli) => {
      if (!Array.isArray(cli.veiculos)) return cli
      return {
        ...cli,
        veiculos: cli.veiculos.filter(
          (v) => String(v.placa || '').toUpperCase().trim() !== placaFormatada && v.id !== veiculo.id && v.value !== veiculo.value
        ),
      }
    })
    salvarClientesCadastrados(clientesAtualizados)
  } catch (e) {
    console.error('Erro ao desvincular veículo do antigo cliente:', e)
  }

  return novoEstacionado
}

/**
 * Vincula um veículo estacionado a um cliente (novo ou já cadastrado)
 * O veículo sai da lista de Estacionados e passa a compor a frota ativa do novo cliente
 * Todo o histórico de manutenção é integralmente mantido
 */
export function vincularVeiculoEstacionadoAoCliente({
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
    const proximoCodigo = gerarProximoCodigoCliente()
    const novoClienteId = `cli-${Date.now()}`
    const novoClienteObj = {
      value: novoClienteId,
      id: novoClienteId,
      codigoCliente: proximoCodigo,
      tipoPessoa: novoClienteData.tipoPessoa || 'F',
      nome: novoClienteData.nome.trim(),
      documento: novoClienteData.documento || '',
      rgIe: novoClienteData.rgIe || '',
      telefone: novoClienteData.telefone || '',
      email: novoClienteData.email || '',
      cep: novoClienteData.cep || '',
      logradouro: novoClienteData.logradouro || '',
      numero: novoClienteData.numero || '',
      complemento: novoClienteData.complemento || '',
      bairro: novoClienteData.bairro || '',
      cidade: novoClienteData.cidade || 'Apucarana',
      uf: novoClienteData.uf || 'PR',
      endereco: `${novoClienteData.logradouro || ''} ${novoClienteData.numero || ''} - ${novoClienteData.cidade || 'Apucarana'} - ${novoClienteData.uf || 'PR'}`.trim(),
      ativo: true,
      veiculos: [],
    }

    const clientesAtuais = carregarClientesCadastrados()
    clientesAtuais.push(novoClienteObj)
    salvarClientesCadastrados(clientesAtuais)

    idDoClienteDestino = novoClienteId
    nomeDoClienteDestino = novoClienteObj.nome
  } else {
    // Cliente existente selecionado
    const clientesAtuais = carregarClientesCadastrados()
    const cliEncontrado = clientesAtuais.find((c) => (c.value || c.id) === idDoClienteDestino)
    if (cliEncontrado) {
      nomeDoClienteDestino = cliEncontrado.nome
    }
  }

  // 2. Prepara o veículo para voltar à frota ativa com o novo cliente
  const veiculoParaFrota = {
    id: `veic-${idDoClienteDestino}-${veiculoEstacionado.placa}`,
    value: `veic-${idDoClienteDestino}-${veiculoEstacionado.placa}`,
    codigoVeiculo: veiculoEstacionado.codigoVeiculo,
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
    // Preserva o histórico de manutenções no registro
    historicoManutencoes: veiculoEstacionado.historicoManutencoes || [],
  }

  // 3. Salva o veículo na frota ativa do novo cliente
  salvarVeiculoNaFrota(veiculoParaFrota)

  // 4. Remove o veículo da lista de Estacionados
  estacionados.splice(index, 1)
  salvarVeiculosEstacionados(estacionados)

  return {
    clienteId: idDoClienteDestino,
    clienteNome: nomeDoClienteDestino,
    veiculo: veiculoParaFrota,
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
