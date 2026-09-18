// Dados Iniciais e Utilitários de Persistência dos Cadastros Base de Suprimentos
// Regra: Sem uso do caractere proibido ('&'), apenas a conjunção 'e'

export const CHAVE_STORAGE_SERVICOS = 'dev_oficina_cadastros_servicos'
export const CHAVE_STORAGE_PECAS = 'dev_oficina_cadastros_pecas'
export const CHAVE_STORAGE_TERCEIROS = 'dev_oficina_cadastros_terceiros'

export const CATEGORIAS_SERVICOS_OPCOES = [
  { value: 'Motor', label: 'Motor' },
  { value: 'Freios', label: 'Freios' },
  { value: 'Arrefecimento', label: 'Arrefecimento' },
  { value: 'Elétrica', label: 'Elétrica' },
  { value: 'Suspensão', label: 'Suspensão' },
  { value: 'Transmissão', label: 'Transmissão' },
  { value: 'Injeção Eletrônica', label: 'Injeção Eletrônica' },
  { value: 'Ar-Condicionado', label: 'Ar-Condicionado' },
  { value: 'Funilaria e Pintura', label: 'Funilaria e Pintura' },
  { value: 'Mecânica Geral', label: 'Mecânica Geral' },
]

export const UNIDADES_MEDIDA_OPCOES = [
  { value: 'UN', label: 'UN - Unidade' },
  { value: 'PC', label: 'PC - Peça' },
  { value: 'CX', label: 'CX - Caixa' },
  { value: 'LT', label: 'LT - Litro' },
  { value: 'KG', label: 'KG - Quilograma' },
  { value: 'MT', label: 'MT - Metro' },
  { value: 'PAR', label: 'PAR - Par' },
  { value: 'JG', label: 'JG - Jogo' },
]

export const CST_CSOSN_OPCOES = [
  { value: '060', label: '060 - Tributação sem permissão de crédito' },
  { value: '102', label: '102 - Tributação sem permissão de crédito' },
  { value: '202', label: '202 - Tributação sem permissão de crédito' },
  { value: '500', label: '500 - Substituição Tributária' },
]

export const CFOP_OPCOES = [
  { value: '5102', label: '5102 - Venda de mercadoria adquirida de terceiros' },
  { value: '5405', label: '5405 - Venda de mercadoria substituição tributária' },
  { value: '1102', label: '1102 - Compra para comercialização' },
]

export const TIPOS_SERVICO_TERCEIRO_OPCOES = [
  { value: 'Elétrica Automotiva', label: 'Elétrica Automotiva' },
  { value: 'Funilaria e Pintura', label: 'Funilaria e Pintura' },
  { value: 'Mecânica Diesel', label: 'Mecânica Diesel' },
  { value: 'Vidraçaria', label: 'Vidraçaria' },
  { value: 'Tapeçaria e Estofados', label: 'Tapeçaria e Estofados' },
  { value: 'Borracharia', label: 'Borracharia' },
  { value: 'Alinhamento e Balanceamento', label: 'Alinhamento e Balanceamento' },
  { value: 'Lavagem e Higienização', label: 'Lavagem e Higienização' },
  { value: 'Remoção de Pintura e Cola', label: 'Remoção de Pintura e Cola' },
  { value: 'Usinagem e Tornearia', label: 'Usinagem e Tornearia' },
  { value: 'Retífica de Motores', label: 'Retífica de Motores' },
  { value: 'Radiadores', label: 'Radiadores' },
]

export const ESTADOS_BRASIL_OPCOES = [
  { value: 'AC', label: 'Acre (AC)' },
  { value: 'AL', label: 'Alagoas (AL)' },
  { value: 'AP', label: 'Amapá (AP)' },
  { value: 'AM', label: 'Amazonas (AM)' },
  { value: 'BA', label: 'Bahia (BA)' },
  { value: 'CE', label: 'Ceará (CE)' },
  { value: 'DF', label: 'Distrito Federal (DF)' },
  { value: 'ES', label: 'Espírito Santo (ES)' },
  { value: 'GO', label: 'Goiás (GO)' },
  { value: 'MA', label: 'Maranhão (MA)' },
  { value: 'MT', label: 'Mato Grosso (MT)' },
  { value: 'MS', label: 'Mato Grosso do Sul (MS)' },
  { value: 'MG', label: 'Minas Gerais (MG)' },
  { value: 'PA', label: 'Pará (PA)' },
  { value: 'PB', label: 'Paraíba (PB)' },
  { value: 'PR', label: 'Paraná (PR)' },
  { value: 'PE', label: 'Pernambuco (PE)' },
  { value: 'PI', label: 'Piauí (PI)' },
  { value: 'RJ', label: 'Rio de Janeiro (RJ)' },
  { value: 'RN', label: 'Rio Grande do Norte (RN)' },
  { value: 'RS', label: 'Rio Grande do Sul (RS)' },
  { value: 'RO', label: 'Rondônia (RO)' },
  { value: 'RR', label: 'Roraima (RR)' },
  { value: 'SC', label: 'Santa Catarina (SC)' },
  { value: 'SP', label: 'São Paulo (SP)' },
  { value: 'SE', label: 'Sergipe (SE)' },
  { value: 'TO', label: 'Tocantins (TO)' },
]

export const SERVICOS_INICIAIS = [
  {
    id: 'srv-1',
    codigo: 'SRV-001',
    nome: 'Troca de Óleo e Filtro',
    descricao: 'Substituição técnica do óleo lubrificante do cárter com troca do elemento filtrante e sangria.',
    categoria: 'Motor',
    valorMaoDeObra: 150.0,
    tempoEstimado: 1.5,
    cnae: '45201-04',
    codigoServicoIBPT: '14.01',
    aliquotaISS: 5.0,
    ativo: true,
  },
  {
    id: 'srv-2',
    codigo: 'SRV-002',
    nome: 'Substituição de Pastilhas e Discos de Freio',
    descricao: 'Desmontagem das pinças, troca de pastilhas dianteiras, retífica ou substituição de discos e sangria.',
    categoria: 'Freios',
    valorMaoDeObra: 180.0,
    tempoEstimado: 1.5,
    cnae: '45201-04',
    codigoServicoIBPT: '14.01',
    aliquotaISS: 5.0,
    ativo: true,
  },
  {
    id: 'srv-3',
    codigo: 'SRV-003',
    nome: 'Troca de Amortecedores e Batentes Dianteiros',
    descricao: 'Substituição das torres de amortecedor, coifas, batentes de poliuretano e calibração de carga.',
    categoria: 'Suspensão',
    valorMaoDeObra: 280.0,
    tempoEstimado: 2.5,
    cnae: '45201-04',
    codigoServicoIBPT: '14.01',
    aliquotaISS: 5.0,
    ativo: true,
  },
  {
    id: 'srv-4',
    codigo: 'SRV-004',
    nome: 'Limpeza e Sangria de Arrefecimento com Aditivo',
    descricao: 'Descontaminação do radiador e bloco do motor com máquina pneumática e abastecimento de líquido orgânico.',
    categoria: 'Arrefecimento',
    valorMaoDeObra: 240.0,
    tempoEstimado: 2.0,
    cnae: '45201-04',
    codigoServicoIBPT: '14.01',
    aliquotaISS: 5.0,
    ativo: true,
  },
  {
    id: 'srv-5',
    codigo: 'SRV-005',
    nome: 'Alinhamento 3D e Balanceamento Dinâmico',
    descricao: 'Alinhamento computadorizado das 4 rodas, correção de convergência e balanceamento com contrapesos.',
    categoria: 'Mecânica Geral',
    valorMaoDeObra: 90.0,
    tempoEstimado: 0.8,
    cnae: '45201-04',
    codigoServicoIBPT: '14.01',
    aliquotaISS: 5.0,
    ativo: true,
  },
  {
    id: 'srv-6',
    codigo: 'SRV-006',
    nome: 'Troca de Correia Dentada e Tensor de Sincronismo',
    descricao: 'Sincronismo micrométrico do comando de válvulas, troca do tensionador e correia de alta resistência.',
    categoria: 'Motor',
    valorMaoDeObra: 350.0,
    tempoEstimado: 3.0,
    cnae: '45201-04',
    codigoServicoIBPT: '14.01',
    aliquotaISS: 5.0,
    ativo: true,
  },
  {
    id: 'srv-7',
    codigo: 'SRV-007',
    nome: 'Diagnóstico Eletrônico Avançado via Scanner OBD-II',
    descricao: 'Varredura completa de DTCs, análise de parâmetros de injeção, sonda lambda e sensores de rotação.',
    categoria: 'Injeção Eletrônica',
    valorMaoDeObra: 150.0,
    tempoEstimado: 1.0,
    cnae: '45201-04',
    codigoServicoIBPT: '14.01',
    aliquotaISS: 5.0,
    ativo: true,
  },
  {
    id: 'srv-8',
    codigo: 'SRV-008',
    nome: 'Recarga de Gás Ecológico e Higienização de Ar',
    descricao: 'Vácuo estático nas tubulações, recarga com gás R134a e oxi-sanitização da cabine por ozônio.',
    categoria: 'Ar-Condicionado',
    valorMaoDeObra: 200.0,
    tempoEstimado: 1.2,
    cnae: '45201-04',
    codigoServicoIBPT: '14.01',
    aliquotaISS: 5.0,
    ativo: true,
  },
]

export const PECAS_INICIAIS = [
  {
    id: 'pec-1',
    codigo: 'PEC-001',
    nome: 'Filtro de Óleo Blindado',
    codigoFabricante: 'FL-3012',
    gtin: '7891234567890',
    ncm: '84212300',
    cfop: '5102',
    cst: '060',
    unidade: 'UN',
    precoCusto: 25.0,
    precoVenda: 45.0,
    margemLucro: 80.0,
    estoqueMinimo: 10,
    estoqueAtual: 50,
    localizacao: 'Prateleira A3',
    ativo: true,
  },
  {
    id: 'pec-2',
    codigo: 'PEC-002',
    nome: 'Jogo de Pastilhas de Freio Dianteiras Cerâmica',
    codigoFabricante: 'HQ-2144',
    gtin: '7891234567890',
    ncm: '87083090',
    cfop: '5405',
    cst: '500',
    unidade: 'JG',
    precoCusto: 85.0,
    precoVenda: 160.0,
    margemLucro: 88.24,
    estoqueMinimo: 4,
    estoqueAtual: 12,
    localizacao: 'Prateleira B2',
    ativo: true,
  },
  {
    id: 'pec-3',
    codigo: 'PEC-003',
    nome: 'Par de Amortecedores Dianteiros Pressurizados',
    codigoFabricante: 'MP-3245',
    gtin: '7891234567890',
    ncm: '87088000',
    cfop: '5102',
    cst: '102',
    unidade: 'PAR',
    precoCusto: 320.0,
    precoVenda: 580.0,
    margemLucro: 81.25,
    estoqueMinimo: 2,
    estoqueAtual: 5,
    localizacao: 'Prateleira C1',
    ativo: true,
  },
  {
    id: 'pec-4',
    codigo: 'PEC-004',
    nome: 'Óleo Sintético 5W30 API SP (Frasco 1 Litro)',
    codigoFabricante: 'LUB-5W30',
    gtin: '7891234567890',
    ncm: '27101932',
    cfop: '5405',
    cst: '500',
    unidade: 'LT',
    precoCusto: 28.0,
    precoVenda: 52.0,
    margemLucro: 85.71,
    estoqueMinimo: 24,
    estoqueAtual: 60,
    localizacao: 'Bancada Óleo 1',
    ativo: true,
  },
  {
    id: 'pec-5',
    codigo: 'PEC-005',
    nome: 'Aditivo Concentrado Orgânico Paraflu A05',
    codigoFabricante: 'RAD-A05',
    gtin: '7891234567890',
    ncm: '38200000',
    cfop: '5102',
    cst: '060',
    unidade: 'LT',
    precoCusto: 22.0,
    precoVenda: 40.0,
    margemLucro: 81.82,
    estoqueMinimo: 8,
    estoqueAtual: 3,
    localizacao: 'Prateleira A1',
    ativo: true,
  },
  {
    id: 'pec-6',
    codigo: 'PEC-006',
    nome: 'Kit Correia Dentada de Sincronismo e Tensor',
    codigoFabricante: 'CT-1049',
    gtin: '7891234567890',
    ncm: '40103100',
    cfop: '5102',
    cst: '102',
    unidade: 'UN',
    precoCusto: 65.0,
    precoVenda: 125.0,
    margemLucro: 92.31,
    estoqueMinimo: 3,
    estoqueAtual: 7,
    localizacao: 'Prateleira B1',
    ativo: true,
  },
]

export const TERCEIROS_INICIAIS = [
  {
    id: 'terc-1',
    razaoSocial: 'Auto Elétrica Silva LTDA',
    nomeFantasia: 'Elétrica Silva',
    cnpj: '12345678000190',
    inscricaoEstadual: '123456789',
    inscricaoMunicipal: '55441',
    tipoServico: 'Elétrica Automotiva',
    contato: {
      nome: 'João Silva',
      telefone: '(43) 99999-1234',
      email: 'contato@eletricasilva.com.br',
    },
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: '',
      bairro: 'Centro',
      cidade: 'Apucarana',
      uf: 'PR',
      cep: '86812405',
    },
    ativo: true,
  },
  {
    id: 'terc-2',
    razaoSocial: 'Retífica Bandeirantes de Motores e Cabeçotes Ltda',
    nomeFantasia: 'Retífica Bandeirantes',
    cnpj: '04567891000145',
    inscricaoEstadual: '987654321',
    inscricaoMunicipal: '88211',
    tipoServico: 'Retífica de Motores',
    contato: {
      nome: 'Carlos Bandeira',
      telefone: '(43) 98822-3344',
      email: 'contato@retificabandeirantes.com.br',
    },
    endereco: {
      logradouro: 'Avenida Brasil',
      numero: '450',
      complemento: 'Galpão 2',
      bairro: 'Barra Funda',
      cidade: 'Apucarana',
      uf: 'PR',
      cep: '86800010',
    },
    ativo: true,
  },
  {
    id: 'terc-3',
    razaoSocial: 'Radiadores e Serviços Térmicos Apucarana Ltda',
    nomeFantasia: 'Radiadores Apucarana',
    cnpj: '18923456000112',
    inscricaoEstadual: '456789123',
    inscricaoMunicipal: '33120',
    tipoServico: 'Radiadores',
    contato: {
      nome: 'Roberto Varas',
      telefone: '(43) 99111-5566',
      email: 'atendimento@radiadoresapucarana.com.br',
    },
    endereco: {
      logradouro: 'Rua Ponta Grossa',
      numero: '890',
      complemento: '',
      bairro: 'Vila Nova',
      cidade: 'Apucarana',
      uf: 'PR',
      cep: '86802120',
    },
    ativo: true,
  },
  {
    id: 'terc-4',
    razaoSocial: 'Detailing e Vidraçaria Automotiva Apucarana Eireli',
    nomeFantasia: 'Detailing Apucarana',
    cnpj: '22334455000178',
    inscricaoEstadual: '321654987',
    inscricaoMunicipal: '11090',
    tipoServico: 'Vidraçaria',
    contato: {
      nome: 'Marcos Rocha',
      telefone: '(43) 99677-8899',
      email: 'contato@detailingapucarana.com.br',
    },
    endereco: {
      logradouro: 'Avenida Curitiba',
      numero: '1520',
      complemento: 'Loja B',
      bairro: 'Centro',
      cidade: 'Apucarana',
      uf: 'PR',
      cep: '86800700',
    },
    ativo: true,
  },
]

// Helpers de Leitura e Escrita sincronizados no localStorage

export function carregarServicosCadastrados() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_SERVICOS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return SERVICOS_INICIAIS
}

export function salvarServicosCadastrados(servicos) {
  try {
    localStorage.setItem(CHAVE_STORAGE_SERVICOS, JSON.stringify(servicos))
  } catch {}
}

export function carregarPecasCadastradas() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_PECAS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return PECAS_INICIAIS
}

export function salvarPecasCadastradas(pecas) {
  try {
    localStorage.setItem(CHAVE_STORAGE_PECAS, JSON.stringify(pecas))
  } catch {}
}

export function carregarTerceirosCadastrados() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_TERCEIROS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return TERCEIROS_INICIAIS
}

export function salvarTerceirosCadastrados(terceiros) {
  try {
    localStorage.setItem(CHAVE_STORAGE_TERCEIROS, JSON.stringify(terceiros))
  } catch {}
}
