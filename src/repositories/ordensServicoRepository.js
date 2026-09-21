import {
  ITENS_CHECKLIST_ENTRADA,
  checklistCompleto,
  carregarAssinaturaVistoria,
} from '../constants/checklistItems'

export const STORAGE_KEY_ORDENS = 'dev_oficina_ordens_servico'
export const STORAGE_KEY_ORCAMENTOS = 'dev_oficina_orcamentos'

// Atenção: 'em_diagnostico' precisa permanecer no índice 1 — várias telas usam
// STATUS_ORCAMENTO[1] como fallback padrão (PainelDetalhesOS, portal do cliente e do mecânico).
// Por isso os status novos do Kanban ('fila' e 'terceirizado') são adicionados no final da lista.
export const STATUS_ORCAMENTO = [
  { value: 'todos', label: 'Todos os Status', color: 'zinc' },
  { value: 'em_diagnostico', label: 'Em Diagnóstico', color: 'slate', badgeBg: 'bg-[#f2f4f7]', badgeText: 'text-[#344054]', border: 'border-[#d0d5dd]' },
  { value: 'aguardando_pecas', label: 'Aguardando Peças', color: 'amber', badgeBg: 'bg-amber-50', badgeText: 'text-amber-800', border: 'border-amber-200' },
  { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação', color: 'sky', badgeBg: 'bg-[#e0f2fe]', badgeText: 'text-[#0369a1]', border: 'border-[#bae6fd]' },
  { value: 'aprovado_execucao', label: 'Aprovado e Em Execução', color: 'navy', badgeBg: 'bg-[#101828]', badgeText: 'text-white', border: 'border-[#101828]' },
  { value: 'pronto_retirada', label: 'Pronto para Retirada', color: 'blue', badgeBg: 'bg-[#0284c7]', badgeText: 'text-white', border: 'border-[#0284c7]' },
  { value: 'fila', label: 'Na Fila', color: 'zinc', badgeBg: 'bg-zinc-100', badgeText: 'text-zinc-700', border: 'border-zinc-200' },
  { value: 'terceirizado', label: 'Terceirizado', color: 'violet', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700', border: 'border-violet-200' },
]

// Status a partir dos quais uma OS pode ser faturada no PDV (orçamento aprovado e execução
// iniciada). Usado como allowlist única em PainelDetalhesOS, OrcamentoOSListPage e PDVPage —
// nunca checar isso como "status !== aguardando_aprovacao", pois libera etapas anteriores demais.
export const STATUS_PERMITE_FATURAMENTO = ['aprovado_execucao', 'pronto_retirada']

// A secretária pode colocar uma OS na Fila sem a Vistoria de Entrada preenchida (ela pode
// ficar pendente até esse ponto), mas para avançar para Diagnóstico ela precisa estar
// completa e aprovada (assinada digitalmente) pelo cliente — além de ter mecânico atribuído.
// Retorna o motivo do bloqueio (para exibir ao usuário) ou null quando pode avançar.
export function motivoImpedimentoDiagnostico(dados) {
  if (!(dados?.mecanicoId || dados?.mecanicoNome)) {
    return 'Atribua um mecânico responsável a esta OS antes de mover para Diagnóstico.'
  }
  if (!checklistCompleto(dados?.checklistEntrada, ITENS_CHECKLIST_ENTRADA)) {
    return 'Finalize todos os itens da Vistoria de Entrada antes de mover para Diagnóstico.'
  }
  if (!carregarAssinaturaVistoria(dados?.numeroOS)) {
    return 'A Vistoria de Entrada ainda não foi aprovada (assinada) pelo cliente.'
  }
  return null
}

export function podeIniciarDiagnostico(dados) {
  return motivoImpedimentoDiagnostico(dados) === null
}

export const PRIORIDADE_OPTIONS = [
  { value: 'todas', label: 'Todas as Prioridades' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'retorno', label: 'Retorno e Garantia' },
]

export const SEED_ORDENS_ABERTAS = [
  {
    numeroOS: '002908',
    dataEntrada: '19/08/2026',
    horaEntrada: '13:05',
    dataEmissao: '19/08/26',
    horaEmissao: '13:05',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Carlos Eduardo',
    clienteId: 'cli-0',
    cliente: 'EDGAR AMARAL DA SILVEIRA',
    documento: '033.687.739-09',
    telefone: '(43) 98812-6874',
    email: 'edgar.silveira@email.com',
    endereco: 'R TUPINAMBA, 566 - Apucarana - PR',
    cidade: 'APUCARANA',
    uf: 'PR',
    cep: '86812-405',
    placa: 'ASF6I46',
    marca: 'FIAT',
    modelo: 'DOBLO 1.8 CARGO',
    marcaModelo: 'Fiat Doblo 1.8 Cargo',
    ano: '2009/2010',
    cor: 'Branca',
    combustivel: 'FLEX',
    km: '280.812',
    kmAnterior: '279.003',
    relatoCliente: 'Barulho na frente ao passar em desníveis e vazamento de água pelo arrefecimento com aquecimento rápido.',
    laudoTecnico: 'Identificado tubo de arrefecimento ressecado com fissura e anel de vedação desgastado. Necessária substituição imediata com limpeza do arrefecimento.',
    status: 'aguardando_aprovacao',
    prioridade: 'normal',
    previsaoEntregaData: '21/08/2026',
    previsaoEntregaHora: '18:00',
    condicaoPagamentoOS: 'À vista com 5% de desconto no PIX ou até 10x no cartão',
    descontoGeralOS: '0.00',
    pecasOS: [
      { codigo: '10039B', nome: 'ANEL VEDADOR DA ADM', unidade: 'UN', quantidade: 4, precoUnitario: 15.0, desconto: 0, marca: 'SABO' },
      { codigo: '0018969', nome: 'TUBO SUPORTE ARREFECIMENTO', unidade: 'PC', quantidade: 1, precoUnitario: 200.0, desconto: 0, marca: 'VALCLEI' },
      { codigo: '2682', nome: 'ABRACADEIRA 14X22', unidade: 'UN', quantidade: 2, precoUnitario: 10.0, desconto: 0, marca: 'SUPREMA' },
      { codigo: '010804', nome: 'ADITIVO A05 PRONTO USO', unidade: 'LT', quantidade: 1, precoUnitario: 40.0, desconto: 0, marca: 'PARAFLU' },
      { codigo: 'DIVERSAS', nome: 'PEÇAS - PARAFUSO C/ PORCA E ARRUELA', unidade: 'PC', quantidade: 1, precoUnitario: 10.0, desconto: 0, marca: 'PADRAO' },
    ],
    servicosOS: [
      { codigo: '01845', nome: 'TROCA TUBO DE AGUA DO COLETOR DE ADM', unidade: 'MO', quantidade: 1, precoUnitario: 300.0, desconto: 0, tempoHoras: '2.5' },
    ],
    terceirosOS: [
      {
        id: 'terc-1',
        codigo: '0019',
        nome: 'TESTE DE ESTANQUEIDADE E PRESSAO DO RADIADOR',
        parceiroNome: 'Radiadores Apucarana',
        quantidade: 1,
        custo: 80.0,
        valorVenda: 120.0,
        precoUnitario: 120.0,
        desconto: 0,
      },
    ],
    totalPecas: 330.0,
    totalServicos: 300.0,
    totalTerceiros: 120.0,
    descontoTotal: 0.0,
    valorTotal: 750.0,
  },
  {
    numeroOS: '002909',
    dataEntrada: '19/08/2026',
    horaEntrada: '08:30',
    dataEmissao: '19/08/26',
    horaEmissao: '08:30',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Gabriel Amaral',
    clienteId: 'cli-1',
    cliente: 'CARLOS EDUARDO SILVEIRA',
    documento: '284.910.482-15',
    telefone: '(43) 99123-4567',
    email: 'carlos.silveira@email.com',
    endereco: 'Rua das Palmeiras, 342 - Londrina - PR',
    cidade: 'LONDRINA',
    uf: 'PR',
    cep: '86010-000',
    placa: 'BRA2E19',
    marca: 'CHEVROLET',
    modelo: 'ONIX 1.0 TURBO',
    marcaModelo: 'Chevrolet Onix 1.0 Turbo',
    ano: '2022/2023',
    cor: 'Preto Ouro Negro',
    combustivel: 'FLEX',
    km: '38.450',
    relatoCliente: 'Luz da injeção acesa intermitente, falha de aceleração em subidas e consumo elevado de combustível.',
    laudoTecnico: 'Diagnóstico com scanner acusando falha no bico injetor do cilindro 2 e descalibração na sonda lambda.',
    status: 'em_diagnostico',
    prioridade: 'normal',
    previsaoEntregaData: '20/08/2026',
    previsaoEntregaHora: '17:00',
    condicaoPagamentoOS: 'Em até 6x no cartão de crédito',
    descontoGeralOS: '0.00',
    pecasOS: [
      { codigo: '001290', nome: 'VELA DE IGNICAO IRIDIUM', unidade: 'JG', quantidade: 1, precoUnitario: 180.0, desconto: 0, marca: 'NGK' },
    ],
    servicosOS: [
      { codigo: '00921', nome: 'DIAGNOSTICO COMPUTADORIZADO E TESTE DE BICOS', unidade: 'MO', quantidade: 1, precoUnitario: 220.0, desconto: 0, tempoHoras: '1.5' },
    ],
    terceirosOS: [],
    totalPecas: 180.0,
    totalServicos: 220.0,
    totalTerceiros: 0.0,
    descontoTotal: 0.0,
    valorTotal: 400.0,
  },
  {
    numeroOS: '002910',
    dataEntrada: '18/08/2026',
    horaEntrada: '14:15',
    dataEmissao: '18/08/26',
    horaEmissao: '14:15',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Rafael Salustiano',
    clienteId: 'cli-2',
    cliente: 'MARIANA DUARTE SOUZA',
    documento: '049.321.890-44',
    telefone: '(43) 98845-1290',
    email: 'mariana.souza@gmail.com',
    endereco: 'Av. Ayrton Senna, 1150 - Gleba Palhano, Londrina - PR',
    cidade: 'LONDRINA',
    uf: 'PR',
    cep: '86050-460',
    placa: 'BDX9F12',
    marca: 'HYUNDAI',
    modelo: 'HB20 1.0 SENSE',
    marcaModelo: 'Hyundai HB20 1.0 Sense',
    ano: '2020/2021',
    cor: 'Branco Polar',
    combustivel: 'FLEX',
    km: '64.800',
    relatoCliente: 'Barulho metálico áspero ao frear e pedal vibrando nas frenagens médias em rodovia.',
    laudoTecnico: 'Discos de freio dianteiros com empenamento e pastilhas no final da vida útil. Bieletas com folga na bucha.',
    status: 'aguardando_pecas',
    prioridade: 'urgente',
    previsaoEntregaData: '20/08/2026',
    previsaoEntregaHora: '16:30',
    condicaoPagamentoOS: 'PIX à vista com 5% de desconto',
    descontoGeralOS: '0.00',
    pecasOS: [
      { codigo: '011290', nome: 'PASTILHA DE FREIO CERAMICA', unidade: 'JG', quantidade: 1, precoUnitario: 195.0, desconto: 0, marca: 'FRAS-LE' },
      { codigo: '011291', nome: 'DISCO DE FREIO VENTILADO', unidade: 'PR', quantidade: 1, precoUnitario: 380.0, desconto: 0, marca: 'FREMAX' },
      { codigo: '011292', nome: 'FLUIDO DE FREIO DOT 4 500ML', unidade: 'FR', quantidade: 2, precoUnitario: 35.0, desconto: 0, marca: 'VARGAS' },
      { codigo: '015290', nome: 'BIELETA BARRA ESTABILIZADORA', unidade: 'PR', quantidade: 1, precoUnitario: 95.0, desconto: 0, marca: 'COFAP' },
    ],
    servicosOS: [
      { codigo: '00341', nome: 'SUBSTITUICAO DISCOS E PASTILHAS DE FREIO', unidade: 'MO', quantidade: 1, precoUnitario: 220.0, desconto: 0, tempoHoras: '1.8' },
      { codigo: '00342', nome: 'SANGRIA E TROCA DE FLUIDO DOT4', unidade: 'MO', quantidade: 1, precoUnitario: 130.0, desconto: 0, tempoHoras: '1.0' },
    ],
    terceirosOS: [],
    totalPecas: 735.0,
    totalServicos: 350.0,
    totalTerceiros: 0.0,
    descontoTotal: 0.0,
    valorTotal: 1085.0,
  },
  {
    numeroOS: '002911',
    dataEntrada: '18/08/2026',
    horaEntrada: '09:00',
    dataEmissao: '18/08/26',
    horaEmissao: '09:00',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Carlos Eduardo',
    clienteId: 'cli-3',
    cliente: 'TRANSPORTADORA RÁPIDO NORTE LTDA',
    documento: '14.892.401/0001-92',
    telefone: '(43) 3344-9000',
    email: 'frotas@rapidolondrina.com.br',
    endereco: 'Rodovia Celso Garcia Cid, KM 378 - Londrina - PR',
    cidade: 'LONDRINA',
    uf: 'PR',
    cep: '86040-000',
    placa: 'RAW3H55',
    marca: 'FIAT',
    modelo: 'FIORINO 1.4 HARD WORKING',
    marcaModelo: 'Fiat Fiorino 1.4 Hard Working',
    ano: '2021/2022',
    cor: 'Branco Banchisa',
    combustivel: 'FLEX',
    km: '89.300',
    relatoCliente: 'Revisão periódica programada de 90.000 KM para veículos de entrega rápida da frota.',
    laudoTecnico: 'Troca de kit da correia dentada, tensor, bomba de água e troca de óleos e filtros. Veículo apto após serviços.',
    status: 'aprovado_execucao',
    prioridade: 'urgente',
    previsaoEntregaData: '19/08/2026',
    previsaoEntregaHora: '17:30',
    condicaoPagamentoOS: 'Faturamento em 28 dias boleto para PJ',
    descontoGeralOS: '50.00',
    pecasOS: [
      { codigo: '009182', nome: 'CORREIA DENTADA SINCRONIZADORA', unidade: 'UN', quantidade: 1, precoUnitario: 120.0, desconto: 0, marca: 'GATES' },
      { codigo: '009183', nome: 'TENSOR DA CORREIA DENTADA', unidade: 'UN', quantidade: 1, precoUnitario: 145.0, desconto: 0, marca: 'INA' },
      { codigo: '008271', nome: 'BOMBA DAGUA MOTOR FIRE', unidade: 'UN', quantidade: 1, precoUnitario: 240.0, desconto: 0, marca: 'URBA' },
      { codigo: '006722', nome: 'OLEO SINTETICO 5W30 SP', unidade: 'LT', quantidade: 4, precoUnitario: 52.0, desconto: 0, marca: 'PETRONAS' },
      { codigo: '006721', nome: 'FILTRO DE OLEO MOTOR', unidade: 'UN', quantidade: 1, precoUnitario: 38.0, desconto: 0, marca: 'FRAM' },
      { codigo: '006723', nome: 'FILTRO DE AR MOTOR', unidade: 'UN', quantidade: 1, precoUnitario: 45.0, desconto: 0, marca: 'TECFIL' },
    ],
    servicosOS: [
      { codigo: '00501', nome: 'TROCA KIT CORREIA DENTADA E BOMBA DAGUA', unidade: 'MO', quantidade: 1, precoUnitario: 380.0, desconto: 0, tempoHoras: '3.0' },
      { codigo: '00502', nome: 'REVISAO GERAL DE FLUIDOS E FILTROS', unidade: 'MO', quantidade: 1, precoUnitario: 140.0, desconto: 0, tempoHoras: '1.2' },
    ],
    terceirosOS: [],
    totalPecas: 796.0,
    totalServicos: 520.0,
    totalTerceiros: 0.0,
    descontoTotal: 50.0,
    valorTotal: 1266.0,
  },
  {
    numeroOS: '002912',
    dataEntrada: '17/08/2026',
    horaEntrada: '10:20',
    dataEmissao: '17/08/26',
    horaEmissao: '10:20',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Gabriel Amaral',
    clienteId: 'cli-4',
    cliente: 'LUCIANA MENDONÇA',
    documento: '582.109.843-20',
    telefone: '(43) 99654-2211',
    email: 'luciana.mendonca@gmail.com',
    endereco: 'Rua Piauí, 890 - Centro, Londrina - PR',
    cidade: 'LONDRINA',
    uf: 'PR',
    cep: '86010-420',
    placa: 'RHJ4A88',
    marca: 'TOYOTA',
    modelo: 'COROLLA CROSS XRE 2.0',
    marcaModelo: 'Toyota Corolla Cross XRE 2.0',
    ano: '2021/2022',
    cor: 'Prata Lua Nova',
    combustivel: 'FLEX',
    km: '52.120',
    relatoCliente: 'Odor desagradável ao ligar o ar condicionado e leve puxada da direção para a direita.',
    laudoTecnico: 'Higienização por ozônio do sistema de climatização, troca do filtro de carvão ativado e alinhamento/balanceamento computadorizado concluídos.',
    status: 'pronto_retirada',
    prioridade: 'normal',
    previsaoEntregaData: '19/08/2026',
    previsaoEntregaHora: '11:30',
    condicaoPagamentoOS: 'Cartão de débito ou PIX',
    descontoGeralOS: '0.00',
    pecasOS: [
      { codigo: '006725', nome: 'FILTRO AR CONDICIONADO CABINE CARVAO ATIVADO', unidade: 'UN', quantidade: 1, precoUnitario: 80.0, desconto: 0, marca: 'WEGA' },
      { codigo: '008910', nome: 'HIGIENIZADOR DE AR CONDICIONADO GRANADA', unidade: 'UN', quantidade: 1, precoUnitario: 40.0, desconto: 0, marca: 'WURTH' },
    ],
    servicosOS: [
      { codigo: '00710', nome: 'HIGIENIZACAO POR OZONIO E TROCA FILTRO CABINE', unidade: 'MO', quantidade: 1, precoUnitario: 120.0, desconto: 0, tempoHoras: '0.8' },
      { codigo: '00711', nome: 'ALINHAMENTO 3D E BALANCEAMENTO DE 4 RODAS', unidade: 'MO', quantidade: 1, precoUnitario: 140.0, desconto: 0, tempoHoras: '1.0' },
    ],
    terceirosOS: [],
    totalPecas: 120.0,
    totalServicos: 260.0,
    totalTerceiros: 0.0,
    descontoTotal: 0.0,
    valorTotal: 380.0,
  },
  {
    numeroOS: '002913',
    dataEntrada: '19/08/2026',
    horaEntrada: '09:15',
    dataEmissao: '19/08/26',
    horaEmissao: '09:15',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Carlos Eduardo',
    clienteId: 'cli-5',
    cliente: 'ROBERTO FAGUNDES NETO',
    documento: '719.452.190-33',
    telefone: '(43) 99188-3344',
    email: 'roberto.fagundes@uol.com.br',
    endereco: 'Rua Sergipe, 1400 - Londrina - PR',
    cidade: 'LONDRINA',
    uf: 'PR',
    cep: '86010-540',
    placa: 'RBD3A45',
    marca: 'VOLKSWAGEN',
    modelo: 'T-CROSS 1.0 TSI',
    marcaModelo: 'Volkswagen T-Cross 1.0 TSI',
    ano: '2021/2021',
    cor: 'Cinza Platinum',
    combustivel: 'FLEX',
    km: '48.900',
    relatoCliente: 'Pedal de embreagem pesado e com ruído metálico ao pisar. Dificuldade de engate da 1ª marcha e ré.',
    laudoTecnico: 'Rolamento de desengate com folga axial excessiva e platô com marcas de superaquecimento. Recomendada troca do kit de embreagem e fluido hidráulico.',
    status: 'aguardando_aprovacao',
    prioridade: 'normal',
    previsaoEntregaData: '22/08/2026',
    previsaoEntregaHora: '12:00',
    condicaoPagamentoOS: 'Em até 10x sem juros no cartão',
    descontoGeralOS: '0.00',
    pecasOS: [
      { codigo: '018901', nome: 'KIT EMBREAGEM PLATO DISCO ROLAMENTO', unidade: 'JG', quantidade: 1, precoUnitario: 1250.0, desconto: 0, marca: 'LUK' },
      { codigo: '011292', nome: 'FLUIDO HIDRAULICO DOT 4', unidade: 'FR', quantidade: 1, precoUnitario: 35.0, desconto: 0, marca: 'VARGAS' },
    ],
    servicosOS: [
      { codigo: '00892', nome: 'SUBSTITUICAO KIT DE EMBREAGEM E SANGRIA', unidade: 'MO', quantidade: 1, precoUnitario: 650.0, desconto: 0, tempoHoras: '4.5' },
    ],
    terceirosOS: [],
    totalPecas: 1285.0,
    totalServicos: 650.0,
    totalTerceiros: 0.0,
    descontoTotal: 0.0,
    valorTotal: 1935.0,
  },
]

export function obterOrdensAbertas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDENS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => {
          const tTerc = (item.terceirosOS || []).reduce(
            (acc, t) => acc + ((parseFloat(t.valorVenda || t.precoFinal || t.precoUnitario) || 0) * (parseFloat(t.quantidade) || 1) - (parseFloat(t.desconto) || 0)),
            0
          )
          return {
            ...item,
            totalTerceiros: item.totalTerceiros !== undefined ? item.totalTerceiros : tTerc,
          }
        })
      }
    }
  } catch (e) {
    console.error('Erro ao ler ordens abertas do storage:', e)
  }

  // Inicializa com seed se vazio
  salvarOrdensAbertas(SEED_ORDENS_ABERTAS)
  return SEED_ORDENS_ABERTAS
}

export function salvarOrdensAbertas(lista) {
  try {
    localStorage.setItem(STORAGE_KEY_ORDENS, JSON.stringify(lista))
  } catch (e) {
    console.error('Erro ao salvar ordens abertas:', e)
  }
}

// Autoatribuição do mecânico ("Puxar OS"): só funciona em uma OS que ainda não tem mecânico
// nenhum atribuído — reatribuir uma OS que já está com outro mecânico continua sendo uma ação
// exclusiva da secretária/gestão (seletor de mecânico em OsFormularioAbertura.jsx). É o único
// caminho do sistema em que o próprio mecânico grava mecanicoId/mecanicoNome numa OS.
export function assumirOrdemSemMecanico(numeroOS, mecanicoId, mecanicoNome) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return { erro: 'OS não encontrada.' }

  const os = lista[index]
  if (os.mecanicoId || (os.mecanicoNome && os.mecanicoNome !== 'Não atribuído')) {
    return { erro: `Esta OS já está atribuída a ${os.mecanicoNome}.` }
  }

  lista[index] = { ...os, mecanicoId, mecanicoNome }
  salvarOrdensAbertas(lista)
  return { os: lista[index] }
}

export function atualizarStatusOrdem(numeroOS, novoStatus) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((item) => String(item.numeroOS) === String(numeroOS))
  if (index !== -1) {
    lista[index] = {
      ...lista[index],
      status: novoStatus,
      dataAtualizacao: new Date().toISOString(),
    }
    salvarOrdensAbertas(lista)
    return lista[index]
  }
  return null
}

// Grava o Checklist de Saída (liberação do veículo) na OS. Chamado antes de faturar no PDV.
export function atualizarChecklistSaida(numeroOS, { checklistSaida, checklistSaidaObs, kmSaida }) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((item) => String(item.numeroOS) === String(numeroOS))
  if (index === -1) return null
  lista[index] = {
    ...lista[index],
    checklistSaida,
    checklistSaidaObs,
    kmSaida,
  }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Acrescenta uma peça ou serviço avulso a uma OS já aberta (usado no "inserir rápido" da aba
// Diagnóstico do painel lateral, sem precisar reabrir o wizard inteiro) e recalcula os totais.
export function adicionarItemNaOrdem(numeroOS, tipo, item) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const chave = tipo === 'servico' ? 'servicosOS' : tipo === 'peca' ? 'pecasOS' : tipo === 'terceiro' ? 'terceirosOS' : null
  if (!chave) return null

  const listaAtualizada = [...(os[chave] || []), item]

  const totalPecas = (tipo === 'peca' ? listaAtualizada : os.pecasOS || []).reduce(
    (acc, p) => acc + ((parseFloat(p.precoUnitario) || 0) * (parseFloat(p.quantidade) || 1) - (parseFloat(p.desconto) || 0)),
    0
  )
  const totalServicos = (tipo === 'servico' ? listaAtualizada : os.servicosOS || []).reduce(
    (acc, s) => acc + ((parseFloat(s.precoUnitario ?? s.valorUnitario) || 0) * (parseFloat(s.quantidade) || 1) - (parseFloat(s.desconto) || 0)),
    0
  )
  const totalTerceiros = (tipo === 'terceiro' ? listaAtualizada : os.terceirosOS || []).reduce(
    (acc, t) => acc + ((parseFloat(t.valorVenda ?? t.precoFinal ?? t.precoUnitario) || 0) * (parseFloat(t.quantidade) || 1) - (parseFloat(t.desconto) || 0)),
    0
  )
  const descontoTotal = parseFloat(os.descontoGeralOS ?? os.descontoTotal) || 0
  const valorTotal = Math.max(0, totalPecas + totalServicos + totalTerceiros - descontoTotal)

  lista[index] = {
    ...os,
    [chave]: listaAtualizada,
    totalPecas,
    totalServicos,
    totalTerceiros,
    valorTotal,
  }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Fecha o ciclo Cotação → OS: aplica o preço final negociado com o fornecedor vencedor nas
// peças da OS que estavam marcadas "Para Cotação". A CotacaoPage regenera o `id` dos itens a
// cada etapa do fluxo (importação → cotação → pedido de compra), então o casamento com as
// peças da OS é feito por `codigo`, não por `id`. Chamada ao concluir o pedido de compra.
export function atualizarPecasAposCotacao(numeroOS, itensCotados, fornecedorNome) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const porCodigo = new Map((itensCotados || []).map((it) => [String(it.codigo || '').toUpperCase(), it]))

  const pecasAtualizadas = (os.pecasOS || []).map((p) => {
    const cotado = porCodigo.get(String(p.codigo || '').toUpperCase())
    if (!cotado) return p
    return {
      ...p,
      precoUnitario: Number(cotado.precoCusto ?? cotado.valorTotal ?? p.precoUnitario) || p.precoUnitario,
      statusEstoque: 'cotado',
      fornecedorNome: fornecedorNome || cotado.fornecedorNome || p.fornecedorNome,
    }
  })

  const totalPecas = pecasAtualizadas.reduce(
    (acc, p) => acc + ((parseFloat(p.precoUnitario) || 0) * (parseFloat(p.quantidade) || 1) - (parseFloat(p.desconto) || 0)),
    0
  )
  const descontoTotal = parseFloat(os.descontoGeralOS ?? os.descontoTotal) || 0
  const valorTotal = Math.max(0, totalPecas + (Number(os.totalServicos) || 0) + (Number(os.totalTerceiros) || 0) - descontoTotal)

  lista[index] = { ...os, pecasOS: pecasAtualizadas, totalPecas, valorTotal }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Grava a resposta do cliente por item do orçamento (modelo essencial/opcional — ver
// AprovacaoOrcamentoClientePage.jsx) e recalcula o valorTotal considerando só os itens ainda
// aprovados. Itens opcionais recusados não são removidos de pecasOS/servicosOS/terceirosOS —
// continuam registrados (o que foi oferecido/recusado fica no histórico), só saem do total.
// `itensAprovacaoOS` é `[{ itemId, categoria: 'peca'|'servico'|'terceiro', classificacao, motivo, respostaCliente }]`.
export function registrarAprovacaoItens(numeroOS, itensAprovacaoOS) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const porItem = new Map((itensAprovacaoOS || []).map((it) => [it.itemId, it]))

  const somaCategoria = (itens, categoria, precoField) =>
    (itens || []).reduce((acc, item, idx) => {
      const itemId = item.id || item.codigo || `${categoria}-${idx}`
      const resposta = porItem.get(itemId)
      if (resposta && resposta.respostaCliente === 'recusado') return acc
      const preco = parseFloat(item[precoField] ?? item.precoUnitario) || 0
      const qtd = parseFloat(item.quantidade) || 1
      const desconto = parseFloat(item.desconto) || 0
      return acc + Math.max(0, preco * qtd - desconto)
    }, 0)

  const totalPecas = somaCategoria(os.pecasOS, 'peca', 'precoUnitario')
  const totalServicos = somaCategoria(os.servicosOS, 'servico', 'valorUnitario')
  const totalTerceiros = (os.terceirosOS || []).reduce((acc, item, idx) => {
    const itemId = item.id || item.codigo || `terceiro-${idx}`
    const resposta = porItem.get(itemId)
    if (resposta && resposta.respostaCliente === 'recusado') return acc
    const preco = parseFloat(item.valorVenda ?? item.precoFinal ?? item.precoUnitario) || 0
    const qtd = parseFloat(item.quantidade) || 1
    const desconto = parseFloat(item.desconto) || 0
    return acc + Math.max(0, preco * qtd - desconto)
  }, 0)

  const descontoTotal = parseFloat(os.descontoGeralOS ?? os.descontoTotal) || 0
  const valorTotal = Math.max(0, totalPecas + totalServicos + totalTerceiros - descontoTotal)

  lista[index] = { ...os, itensAprovacaoOS, totalPecas, totalServicos, totalTerceiros, valorTotal }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Item novo encontrado durante a Execução (peça quebrou, item de segurança precisa trocar
// para continuar com segurança) — modelo separado do orçamento original (itensAprovacaoOS),
// pois representa uma negociação em aberto, não o que já foi fechado com o cliente. Reportado
// pelo mecânico (ou secretaria/gestão), aparece para o cliente na mesma página de aprovação.
export function adicionarItemAdicional(numeroOS, item) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const novoItem = {
    id: `adit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    criadoEm: new Date().toISOString(),
    status: 'pendente_cliente', // 'pendente_cliente' | 'aprovado' | 'recusado'
    resolvidoEm: null,
    ...item,
  }

  lista[index] = { ...os, itensAdicionaisOS: [...(os.itensAdicionaisOS || []), novoItem] }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Resposta do cliente a um item adicional: 'aprovado' materializa o item nos arrays
// financeiros reais da OS (via adicionarItemNaOrdem, já preparada para peça/serviço/terceiro);
// 'recusado' só marca o status, sem tocar em pecasOS/servicosOS/terceirosOS.
export function responderItemAdicional(numeroOS, itemAdicionalId, resposta) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const itemAdicional = (os.itensAdicionaisOS || []).find((it) => it.id === itemAdicionalId)
  if (!itemAdicional) return null

  const itensAtualizados = (os.itensAdicionaisOS || []).map((it) =>
    it.id === itemAdicionalId ? { ...it, status: resposta, resolvidoEm: new Date().toISOString() } : it
  )
  lista[index] = { ...os, itensAdicionaisOS: itensAtualizados }
  salvarOrdensAbertas(lista)

  if (resposta === 'aprovado') {
    return adicionarItemNaOrdem(numeroOS, itemAdicional.categoria, {
      id: `${itemAdicional.categoria}-${Date.now()}`,
      codigo: 'ADITIVO',
      nome: itemAdicional.descricao,
      unidade: itemAdicional.categoria === 'servico' ? 'MO' : 'UN',
      quantidade: 1,
      precoUnitario: Number(itemAdicional.valorEstimado) || 0,
      valorVenda: Number(itemAdicional.valorEstimado) || 0,
      desconto: 0,
      parceiroNome: itemAdicional.categoria === 'terceiro' ? itemAdicional.parceiroNome || 'A definir' : undefined,
    })
  }

  return lista[index]
}

// Gate de bloqueio ortogonal ao status (não é uma etapa nova do Kanban, é uma trava condicional
// sobre "Aprovado e Em Execução"): item de segurança ainda sem resposta do cliente impede a OS
// de avançar. Itens opcionais pendentes nunca bloqueiam — ficam só como aviso.
export function motivoImpedimentoAvancoPorItemAdicional(dados) {
  const pendenteSeguranca = (dados?.itensAdicionaisOS || []).find(
    (it) => it.classificacao === 'seguranca' && it.status === 'pendente_cliente'
  )
  if (pendenteSeguranca) {
    return `Existe um item de segurança ("${pendenteSeguranca.descricao}") aguardando aprovação do cliente antes de continuar.`
  }
  return null
}

// Anexa a foto (tirada na hora pela câmera) a uma peça específica já lançada na OS
export function atualizarFotoPecaOrdem(numeroOS, itemId, fotoUrl) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const pecasAtualizadas = (os.pecasOS || []).map((p) => (p.id === itemId ? { ...p, fotoUrl } : p))

  lista[index] = { ...os, pecasOS: pecasAtualizadas }
  salvarOrdensAbertas(lista)
  return lista[index]
}

export function excluirOrdem(numeroOS) {
  const lista = obterOrdensAbertas()
  const filtrada = lista.filter((item) => String(item.numeroOS) !== String(numeroOS))
  salvarOrdensAbertas(filtrada)
  return filtrada
}

export function gerarProximoNumeroOS() {
  const abertas = obterOrdensAbertas()
  let finalizadas = []
  try {
    const rawFin = localStorage.getItem(STORAGE_KEY_FINALIZADAS)
    if (rawFin) {
      finalizadas = JSON.parse(rawFin)
    }
  } catch (e) {}

  const todas = [...(Array.isArray(abertas) ? abertas : []), ...(Array.isArray(finalizadas) ? finalizadas : [])]

  let maxNum = 2913
  todas.forEach((os) => {
    if (os && os.numeroOS) {
      const parsed = parseInt(String(os.numeroOS).replace(/\D/g, ''), 10)
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed
      }
    }
  })

  const proximo = maxNum + 1
  return String(proximo).padStart(6, '0')
}

export function adicionarOuAtualizarOrdem(osData) {
  const lista = obterOrdensAbertas()
  const numeroOS = osData.numeroOS || gerarProximoNumeroOS()
  const index = lista.findIndex((item) => String(item.numeroOS) === String(numeroOS))

  // Calcula totais se não existirem
  const totalPecas = (osData.pecasOS || []).reduce(
    (acc, p) => acc + ((parseFloat(p.precoUnitario) || 0) * (parseFloat(p.quantidade) || 1) - (parseFloat(p.desconto) || 0)),
    0
  )
  const totalServicos = (osData.servicosOS || []).reduce(
    (acc, s) => acc + ((parseFloat(s.precoUnitario ?? s.valorUnitario) || 0) * (parseFloat(s.quantidade) || 1) - (parseFloat(s.desconto) || 0)),
    0
  )
  const totalTerceiros = (osData.terceirosOS || []).reduce(
    (acc, t) => acc + ((parseFloat(t.valorVenda) || 0) - (parseFloat(t.desconto) || 0)),
    0
  )
  const descontoTotal = parseFloat(osData.descontoGeralOS) || 0
  const valorTotal = Math.max(0, totalPecas + totalServicos + totalTerceiros - descontoTotal)

  const registroCompleto = {
    ...osData,
    numeroOS,
    status: osData.status || 'aguardando_aprovacao',
    prioridade: osData.prioridade || 'normal',
    dataEntrada: osData.dataEntrada || new Date().toLocaleDateString('pt-BR'),
    horaEntrada: osData.horaEntrada || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    totalPecas,
    totalServicos,
    totalTerceiros,
    descontoTotal,
    valorTotal,
  }

  if (index !== -1) {
    lista[index] = registroCompleto
  } else {
    lista.unshift(registroCompleto)
  }

  salvarOrdensAbertas(lista)
  return registroCompleto
}

export const salvarOrdemAberta = adicionarOuAtualizarOrdem

export const STORAGE_KEY_FINALIZADAS = 'dev_oficina_ordens_finalizadas'

export const SEED_ORDENS_FINALIZADAS = [
  {
    numeroOS: '002895',
    dataEntrada: '08/08/2026',
    horaEntrada: '09:00',
    dataEmissao: '08/08/26',
    horaEmissao: '09:00',
    dataFinalizacao: '10/08/2026',
    horaFinalizacao: '16:45',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Carlos Eduardo',
    clienteId: 'cli-0',
    cliente: 'EDGAR AMARAL DA SILVEIRA',
    documento: '033.687.739-09',
    telefone: '(43) 98812-6874',
    email: 'edgar.silveira@email.com',
    endereco: 'R TUPINAMBA, 566 - Apucarana - PR',
    cidade: 'APUCARANA',
    uf: 'PR',
    cep: '86812-405',
    placa: 'ASF6I46',
    marca: 'FIAT',
    modelo: 'DOBLO 1.8 CARGO',
    marcaModelo: 'Fiat Doblo 1.8 Cargo',
    ano: '2009/2010',
    cor: 'Branca',
    combustivel: 'FLEX',
    km: '279.003',
    relatoCliente: 'Revisão básica periódica para viagem curta de trabalho e troca preventiva de lubrificantes.',
    laudoTecnico: 'Troca de óleo do motor 5W30, filtro de óleo, filtro de combustível e filtro de ar do motor. Inspeção geral de suspensão OK.',
    status: 'finalizada',
    prioridade: 'normal',
    garantiaAte: '10/11/2026',
    formaPagamento: 'PIX à vista',
    notaFiscal: 'NFS-e #002814',
    condicaoPagamentoOS: 'Pago via PIX com 5% de desconto',
    descontoGeralOS: '0.00',
    pecasOS: [
      { codigo: '006722', nome: 'OLEO SINTETICO 5W30 SP', unidade: 'LT', quantidade: 4, precoUnitario: 52.0, desconto: 0, marca: 'PETRONAS' },
      { codigo: '006721', nome: 'FILTRO DE OLEO MOTOR', unidade: 'UN', quantidade: 1, precoUnitario: 38.0, desconto: 0, marca: 'FRAM' },
      { codigo: '006723', nome: 'FILTRO DE AR MOTOR', unidade: 'UN', quantidade: 1, precoUnitario: 45.0, desconto: 0, marca: 'TECFIL' },
      { codigo: '006724', nome: 'FILTRO DE COMBUSTIVEL', unidade: 'UN', quantidade: 1, precoUnitario: 32.0, desconto: 0, marca: 'MAHLE' },
    ],
    servicosOS: [
      { codigo: '00101', nome: 'TROCA DE OLEO E FILTROS COM REVISAO BASICA', unidade: 'MO', quantidade: 1, precoUnitario: 120.0, desconto: 0, tempoHoras: '1.0' },
    ],
    terceirosOS: [],
    totalPecas: 323.0,
    totalServicos: 120.0,
    totalTerceiros: 0.0,
    descontoTotal: 0.0,
    valorTotal: 443.0,
  },
  {
    numeroOS: '002896',
    dataEntrada: '11/08/2026',
    horaEntrada: '11:10',
    dataEmissao: '11/08/26',
    horaEmissao: '11:10',
    dataFinalizacao: '12/08/2026',
    horaFinalizacao: '17:30',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Rafael Salustiano',
    clienteId: 'cli-2',
    cliente: 'MARIANA DUARTE SOUZA',
    documento: '049.321.890-44',
    telefone: '(43) 98845-1290',
    email: 'mariana.souza@gmail.com',
    endereco: 'Av. Ayrton Senna, 1150 - Gleba Palhano, Londrina - PR',
    cidade: 'LONDRINA',
    uf: 'PR',
    cep: '86050-460',
    placa: 'BDX9F12',
    marca: 'HYUNDAI',
    modelo: 'HB20 1.0 SENSE',
    marcaModelo: 'Hyundai HB20 1.0 Sense',
    ano: '2020/2021',
    cor: 'Branco Polar',
    combustivel: 'FLEX',
    km: '61.200',
    relatoCliente: 'Barulho de batida seca na dianteira direita ao passar em lombadas e asfalto irregular.',
    laudoTecnico: 'Amortecedor dianteiro direito vazando óleo e kit batente estourado. Substituído par de amortecedores e batentes.',
    status: 'finalizada',
    prioridade: 'normal',
    garantiaAte: '12/11/2026',
    formaPagamento: 'Cartão de Crédito 3x',
    notaFiscal: 'NFS-e #002819',
    condicaoPagamentoOS: 'Em 3x no cartão sem juros',
    descontoGeralOS: '0.00',
    pecasOS: [
      { codigo: '014290', nome: 'AMORTECEDOR DIANTEIRO PRESSURIZADO', unidade: 'PR', quantidade: 1, precoUnitario: 680.0, desconto: 0, marca: 'COFAP' },
      { codigo: '014291', nome: 'KIT BATENTE E COIFA AMORTECEDOR', unidade: 'JG', quantidade: 1, precoUnitario: 130.0, desconto: 0, marca: 'SAMPEL' },
    ],
    servicosOS: [
      { codigo: '00205', nome: 'SUBSTITUICAO AMORTECEDORES DIANTEIROS E ALINHAMENTO', unidade: 'MO', quantidade: 1, precoUnitario: 240.0, desconto: 0, tempoHoras: '2.0' },
    ],
    terceirosOS: [],
    totalPecas: 810.0,
    totalServicos: 240.0,
    totalTerceiros: 0.0,
    descontoTotal: 0.0,
    valorTotal: 1050.0,
  },
  {
    numeroOS: '002897',
    dataEntrada: '14/08/2026',
    horaEntrada: '08:00',
    dataEmissao: '14/08/26',
    horaEmissao: '08:00',
    dataFinalizacao: '15/08/2026',
    horaFinalizacao: '18:15',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Carlos Eduardo',
    clienteId: 'cli-3',
    cliente: 'TRANSPORTADORA RÁPIDO NORTE LTDA',
    documento: '14.892.401/0001-92',
    telefone: '(43) 3344-9000',
    email: 'frotas@rapidolondrina.com.br',
    endereco: 'Rodovia Celso Garcia Cid, KM 378 - Londrina - PR',
    cidade: 'LONDRINA',
    uf: 'PR',
    cep: '86040-000',
    placa: 'RAW3H55',
    marca: 'FIAT',
    modelo: 'FIORINO 1.4 HARD WORKING',
    marcaModelo: 'Fiat Fiorino 1.4 Hard Working',
    ano: '2021/2022',
    cor: 'Branco Banchisa',
    combustivel: 'FLEX',
    km: '79.800',
    relatoCliente: 'Revisão preventiva periódica de 80.000 KM para veículos de entrega da frota.',
    laudoTecnico: 'Troca de velas de ignição, cabos de vela, limpeza de bicos e troca de fluidos de freio.',
    status: 'finalizada',
    prioridade: 'normal',
    garantiaAte: '15/11/2026',
    formaPagamento: 'Faturamento Boleto 28D',
    notaFiscal: 'NFS-e #002824',
    condicaoPagamentoOS: 'Faturado para PJ em 28 dias',
    descontoGeralOS: '40.00',
    pecasOS: [
      { codigo: '001290', nome: 'VELA DE IGNICAO GREEN PLUG', unidade: 'JG', quantidade: 1, precoUnitario: 110.0, desconto: 0, marca: 'NGK' },
      { codigo: '001291', nome: 'CABOS DE VELA SILICONE', unidade: 'JG', quantidade: 1, precoUnitario: 160.0, desconto: 0, marca: 'NGK' },
      { codigo: '011292', nome: 'FLUIDO DE FREIO DOT 4 500ML', unidade: 'FR', quantidade: 2, precoUnitario: 35.0, desconto: 0, marca: 'VARGAS' },
    ],
    servicosOS: [
      { codigo: '00311', nome: 'REVISAO ELETRICA DE IGNICAO E SANGRIA DE FREIOS', unidade: 'MO', quantidade: 1, precoUnitario: 260.0, desconto: 0, tempoHoras: '2.2' },
    ],
    terceirosOS: [],
    totalPecas: 340.0,
    totalServicos: 260.0,
    totalTerceiros: 0.0,
    descontoTotal: 40.0,
    valorTotal: 560.0,
  },
  {
    numeroOS: '002898',
    dataEntrada: '15/08/2026',
    horaEntrada: '10:40',
    dataEmissao: '15/08/26',
    horaEmissao: '10:40',
    dataFinalizacao: '16/08/2026',
    horaFinalizacao: '15:20',
    consultorResponsavel: 'BIANCA',
    mecanicoNome: 'Gabriel Amaral',
    clienteId: 'cli-1',
    cliente: 'CARLOS EDUARDO SILVEIRA',
    documento: '284.910.482-15',
    telefone: '(43) 99123-4567',
    email: 'carlos.silveira@email.com',
    endereco: 'Rua das Palmeiras, 342 - Londrina - PR',
    cidade: 'LONDRINA',
    uf: 'PR',
    cep: '86010-000',
    placa: 'BRA2E19',
    marca: 'CHEVROLET',
    modelo: 'ONIX 1.0 TURBO',
    marcaModelo: 'Chevrolet Onix 1.0 Turbo',
    ano: '2022/2023',
    cor: 'Preto Ouro Negro',
    combustivel: 'FLEX',
    km: '34.100',
    relatoCliente: 'Chiado no freio ao parar nos semáforos da cidade.',
    laudoTecnico: 'Pastilhas de freio dianteiras gastas atingindo marcador acústico. Discos em ótimo estado. Pastilhas substituídas.',
    status: 'finalizada',
    prioridade: 'normal',
    garantiaAte: '16/11/2026',
    formaPagamento: 'Cartão de Débito',
    notaFiscal: 'NFS-e #002830',
    condicaoPagamentoOS: 'Cartão de Débito',
    descontoGeralOS: '0.00',
    pecasOS: [
      { codigo: '011290', nome: 'PASTILHA DE FREIO DIANTEIRA CERAMICA', unidade: 'JG', quantidade: 1, precoUnitario: 195.0, desconto: 0, marca: 'FRAS-LE' },
    ],
    servicosOS: [
      { codigo: '00140', nome: 'SUBSTITUICAO DE PASTILHAS DE FREIO E TESTE DE RODAGEM', unidade: 'MO', quantidade: 1, precoUnitario: 130.0, desconto: 0, tempoHoras: '1.0' },
    ],
    terceirosOS: [],
    totalPecas: 195.0,
    totalServicos: 130.0,
    totalTerceiros: 0.0,
    descontoTotal: 0.0,
    valorTotal: 325.0,
  },
]

export function obterOrdensFinalizadas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FINALIZADAS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao ler ordens finalizadas do storage:', e)
  }

  salvarOrdensFinalizadas(SEED_ORDENS_FINALIZADAS)
  return SEED_ORDENS_FINALIZADAS
}

export function salvarOrdensFinalizadas(lista) {
  try {
    localStorage.setItem(STORAGE_KEY_FINALIZADAS, JSON.stringify(lista))
  } catch (e) {
    console.error('Erro ao salvar ordens finalizadas:', e)
  }
}

export function finalizarEArquivarOrdem(numeroOS, dadosComplementares = {}) {
  const abertas = obterOrdensAbertas()
  const index = abertas.findIndex((item) => String(item.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const osParaFinalizar = abertas[index]

  // Remove de abertas
  abertas.splice(index, 1)
  salvarOrdensAbertas(abertas)

  // Prepara registro finalizado
  const agora = new Date()
  const garantiaData = new Date(agora)
  garantiaData.setDate(garantiaData.getDate() + 90)

  const osFinalizada = {
    ...osParaFinalizar,
    ...dadosComplementares,
    status: 'finalizada',
    dataFinalizacao: dadosComplementares.dataFinalizacao || agora.toLocaleDateString('pt-BR'),
    horaFinalizacao: dadosComplementares.horaFinalizacao || agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    garantiaAte: dadosComplementares.garantiaAte || garantiaData.toLocaleDateString('pt-BR'),
    formaPagamento: dadosComplementares.formaPagamento || 'PIX ou Cartão',
    notaFiscal: dadosComplementares.notaFiscal || `NFS-e #${Math.floor(2800 + Math.random() * 500)}`,
  }

  const finalizadas = obterOrdensFinalizadas()
  finalizadas.unshift(osFinalizada)
  salvarOrdensFinalizadas(finalizadas)

  return osFinalizada
}

export function reabrirOrdemFinalizada(numeroOS) {
  const finalizadas = obterOrdensFinalizadas()
  const index = finalizadas.findIndex((item) => String(item.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const osParaReabrir = finalizadas[index]

  // Remove de finalizadas
  finalizadas.splice(index, 1)
  salvarOrdensFinalizadas(finalizadas)

  // Adiciona de volta em abertas com status pronto_retirada ou aprovado_execucao
  const osReaberta = {
    ...osParaReabrir,
    status: 'aprovado_execucao',
    dataReabertura: new Date().toISOString(),
  }

  const abertas = obterOrdensAbertas()
  abertas.unshift(osReaberta)
  salvarOrdensAbertas(abertas)

  return osReaberta
}
