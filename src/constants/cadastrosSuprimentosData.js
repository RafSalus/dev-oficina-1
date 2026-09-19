// Dados Iniciais e Utilitários de Persistência dos Cadastros Base de Suprimentos
// Regra: Sem uso do caractere proibido ('&'), apenas a conjunção 'e'

export const CHAVE_STORAGE_SERVICOS = 'dev_oficina_cadastros_servicos'
export const CHAVE_STORAGE_PECAS = 'dev_oficina_cadastros_pecas'
export const CHAVE_STORAGE_TERCEIROS = 'dev_oficina_cadastros_terceiros'
export const CHAVE_STORAGE_MOVIMENTACOES_ESTOQUE = 'dev_oficina_movimentacoes_estoque'

export const CATEGORIAS_PECAS_OPCOES = [
  { value: 'Freios', label: 'Freios' },
  { value: 'Suspensão', label: 'Suspensão' },
  { value: 'Motor', label: 'Motor' },
  { value: 'Lubrificantes e Filtros', label: 'Lubrificantes e Filtros' },
  { value: 'Arrefecimento', label: 'Arrefecimento' },
  { value: 'Elétrica e Ignição', label: 'Elétrica e Ignição' },
  { value: 'Transmissão', label: 'Transmissão' },
  { value: 'Direção', label: 'Direção' },
  { value: 'Ar Condicionado', label: 'Ar Condicionado' },
  { value: 'Escapamento', label: 'Escapamento' },
  { value: 'Pneus e Rodas', label: 'Pneus e Rodas' },
  { value: 'Outros Componentes', label: 'Outros Componentes' },
]

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

export const CATEGORIAS_FORNECEDOR_OPCOES = [
  { value: 'Autopeças', label: 'Autopeças (Peças e Componentes)' },
  { value: 'Serviços Externos', label: 'Serviços Externos (Terceirizados)' },
  { value: 'Distribuidora', label: 'Distribuidora de Peças e Insumos' },
  { value: 'Ambos', label: 'Ambos (Peças e Serviços)' },
]

export const RAMOS_FORNECEDOR_OPCOES = [
  // Autopeças e Distribuidoras
  { value: 'Autopeças em Geral', label: 'Autopeças em Geral' },
  { value: 'Distribuidora de Autopeças', label: 'Distribuidora de Autopeças' },
  { value: 'Autopeças Elétricas e Injeção', label: 'Autopeças Elétricas e Injeção' },
  { value: 'Autopeças de Freios e Suspensão', label: 'Autopeças de Freios e Suspensão' },
  { value: 'Autopeças de Motor e Câmbio', label: 'Autopeças de Motor e Câmbio' },
  { value: 'Acessórios e Iluminação', label: 'Acessórios e Iluminação' },
  { value: 'Desmanche e Peças Usadas', label: 'Desmanche e Peças Usadas' },
  { value: 'Pneus e Rodas', label: 'Pneus e Rodas' },
  { value: 'Óleos e Fluidos Lubrificantes', label: 'Óleos e Fluidos Lubrificantes' },
  // Serviços Terceirizados e Especializados
  { value: 'Retífica de Motores', label: 'Retífica de Motores' },
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
  { value: 'Radiadores', label: 'Radiadores' },
]

export const TIPOS_SERVICO_TERCEIRO_OPCOES = RAMOS_FORNECEDOR_OPCOES

export const ESTADOS_BRASIL_OPCOES = [
  { value: 'AC', label: 'AC' },
  { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' },
  { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' },
  { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' },
  { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' },
  { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' },
  { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' },
  { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' },
  { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' },
  { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
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
    categoria: 'Lubrificantes e Filtros',
    codigoFabricante: 'FL-3012',
    gtin: '7891234567890',
    ncm: '84212300',
    cfop: '5102',
    cstCsosn: '060',
    unidade: 'UN',
    precoCusto: 25.0,
    precoVenda: 45.0,
    margemLucro: 80.0,
    estoqueMinimo: 10,
    estoqueAtual: 50,
    localizacao: 'Prateleira A3',
    fornecedorPreferencial: 'Auto Peças Central',
    ativo: true,
  },
  {
    id: 'pec-2',
    codigo: 'PEC-002',
    nome: 'Jogo de Pastilhas de Freio Dianteiras Cerâmica',
    categoria: 'Freios',
    codigoFabricante: 'HQ-2144',
    gtin: '7891234567890',
    ncm: '87083090',
    cfop: '5405',
    cstCsosn: '500',
    unidade: 'JG',
    precoCusto: 85.0,
    precoVenda: 160.0,
    margemLucro: 88.24,
    estoqueMinimo: 4,
    estoqueAtual: 12,
    localizacao: 'Prateleira B2',
    fornecedorPreferencial: 'Auto Peças Central',
    ativo: true,
  },
  {
    id: 'pec-3',
    codigo: 'PEC-003',
    nome: 'Par de Amortecedores Dianteiros Pressurizados',
    categoria: 'Suspensão',
    codigoFabricante: 'MP-3245',
    gtin: '7891234567890',
    ncm: '87088000',
    cfop: '5102',
    cstCsosn: '102',
    unidade: 'PAR',
    precoCusto: 320.0,
    precoVenda: 580.0,
    margemLucro: 81.25,
    estoqueMinimo: 3,
    estoqueAtual: 2,
    localizacao: 'Prateleira C1',
    fornecedorPreferencial: 'Auto Peças Central',
    ativo: true,
  },
  {
    id: 'pec-4',
    codigo: 'PEC-004',
    nome: 'Óleo Sintético 5W30 API SP (Frasco 1 Litro)',
    categoria: 'Lubrificantes e Filtros',
    codigoFabricante: 'LUB-5W30',
    gtin: '7891234567890',
    ncm: '27101932',
    cfop: '5405',
    cstCsosn: '500',
    unidade: 'LT',
    precoCusto: 28.0,
    precoVenda: 52.0,
    margemLucro: 85.71,
    estoqueMinimo: 24,
    estoqueAtual: 60,
    localizacao: 'Bancada Óleo 1',
    fornecedorPreferencial: 'Renova Peças Automotivas',
    ativo: true,
  },
  {
    id: 'pec-5',
    codigo: 'PEC-005',
    nome: 'Aditivo Concentrado Orgânico Paraflu A05',
    categoria: 'Arrefecimento',
    codigoFabricante: 'RAD-A05',
    gtin: '7891234567890',
    ncm: '38200000',
    cfop: '5102',
    cstCsosn: '060',
    unidade: 'LT',
    precoCusto: 22.0,
    precoVenda: 40.0,
    margemLucro: 81.82,
    estoqueMinimo: 8,
    estoqueAtual: 3,
    localizacao: 'Prateleira A1',
    fornecedorPreferencial: 'Renova Peças Automotivas',
    ativo: true,
  },
  {
    id: 'pec-6',
    codigo: 'PEC-006',
    nome: 'Kit Correia Dentada de Sincronismo e Tensor',
    categoria: 'Motor',
    codigoFabricante: 'CT-1049',
    gtin: '7891234567890',
    ncm: '40103100',
    cfop: '5102',
    cstCsosn: '102',
    unidade: 'UN',
    precoCusto: 65.0,
    precoVenda: 125.0,
    margemLucro: 92.31,
    estoqueMinimo: 3,
    estoqueAtual: 0,
    localizacao: 'Prateleira B1',
    fornecedorPreferencial: 'Distribuidora União Autopeças',
    ativo: true,
  },
  {
    id: 'pec-7',
    codigo: 'PEC-007',
    nome: 'Discos de Freio Ventilados Dianteiros (Par)',
    categoria: 'Freios',
    codigoFabricante: 'HF-32A',
    gtin: '7891234567890',
    ncm: '87083090',
    cfop: '5405',
    cstCsosn: '500',
    unidade: 'PAR',
    precoCusto: 160.0,
    precoVenda: 290.0,
    margemLucro: 81.25,
    estoqueMinimo: 2,
    estoqueAtual: 4,
    localizacao: 'Prateleira B3',
    fornecedorPreferencial: 'Auto Peças Central',
    ativo: true,
  },
  {
    id: 'pec-8',
    codigo: 'PEC-008',
    nome: 'Velas de Ignição Iridium (Jogo 4 unidades)',
    categoria: 'Elétrica e Ignição',
    codigoFabricante: 'NGK-BKR6',
    gtin: '7891234567890',
    ncm: '85111000',
    cfop: '5102',
    cstCsosn: '102',
    unidade: 'JG',
    precoCusto: 95.0,
    precoVenda: 180.0,
    margemLucro: 89.47,
    estoqueMinimo: 3,
    estoqueAtual: 6,
    localizacao: 'Armário Elétrica 2',
    fornecedorPreferencial: 'Rei das Peças Express',
    ativo: true,
  },
  {
    id: 'pec-9',
    codigo: 'PEC-009',
    nome: 'Bateria Automotiva 60Ah Selada Livre de Manutenção',
    categoria: 'Elétrica e Ignição',
    codigoFabricante: 'BAT-60D',
    gtin: '7891234567890',
    ncm: '85071010',
    cfop: '5405',
    cstCsosn: '500',
    unidade: 'UN',
    precoCusto: 280.0,
    precoVenda: 460.0,
    margemLucro: 64.29,
    estoqueMinimo: 2,
    estoqueAtual: 3,
    localizacao: 'Bancada Baterias',
    fornecedorPreferencial: 'Rei das Peças Express',
    ativo: true,
  },
  {
    id: 'pec-10',
    codigo: 'PEC-010',
    nome: 'Bieletas da Barra Estabilizadora Dianteira (Par)',
    categoria: 'Suspensão',
    codigoFabricante: 'BL-5501',
    gtin: '7891234567890',
    ncm: '87088000',
    cfop: '5102',
    cstCsosn: '102',
    unidade: 'PAR',
    precoCusto: 52.0,
    precoVenda: 98.0,
    margemLucro: 88.46,
    estoqueMinimo: 2,
    estoqueAtual: 1,
    localizacao: 'Prateleira C2',
    fornecedorPreferencial: 'Auto Peças Central',
    ativo: true,
  },
  {
    id: 'pec-11',
    codigo: 'PEC-011',
    nome: 'Filtro de Cabine e Ar Condicionado com Carvão',
    categoria: 'Ar Condicionado',
    codigoFabricante: 'FC-902',
    gtin: '7891234567890',
    ncm: '84213990',
    cfop: '5102',
    cstCsosn: '060',
    unidade: 'UN',
    precoCusto: 26.0,
    precoVenda: 48.0,
    margemLucro: 84.62,
    estoqueMinimo: 4,
    estoqueAtual: 8,
    localizacao: 'Prateleira A2',
    fornecedorPreferencial: 'Renova Peças Automotivas',
    ativo: true,
  },
  {
    id: 'pec-12',
    codigo: 'PEC-012',
    nome: 'Bomba de Água com Carcaça e Junta',
    categoria: 'Arrefecimento',
    codigoFabricante: 'BA-770',
    gtin: '7891234567890',
    ncm: '84133090',
    cfop: '5102',
    cstCsosn: '102',
    unidade: 'UN',
    precoCusto: 130.0,
    precoVenda: 235.0,
    margemLucro: 80.77,
    estoqueMinimo: 2,
    estoqueAtual: 0,
    localizacao: 'Prateleira A1',
    fornecedorPreferencial: 'Distribuidora União Autopeças',
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
    categoriaFornecedor: 'Serviços Externos',
    tipoServico: 'Elétrica Automotiva',
    contatoNome: 'João Silva',
    contatoTelefone: '(43) 99999-1234',
    contatoEmail: 'contato@eletricasilva.com.br',
    contato: {
      nome: 'João Silva',
      telefone: '(43) 99999-1234',
      email: 'contato@eletricasilva.com.br',
    },
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: '',
    bairro: 'Centro',
    cidade: 'Apucarana',
    uf: 'PR',
    cep: '86812405',
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
    categoriaFornecedor: 'Serviços Externos',
    tipoServico: 'Retífica de Motores',
    contatoNome: 'Carlos Bandeira',
    contatoTelefone: '(43) 98822-3344',
    contatoEmail: 'contato@retificabandeirantes.com.br',
    contato: {
      nome: 'Carlos Bandeira',
      telefone: '(43) 98822-3344',
      email: 'contato@retificabandeirantes.com.br',
    },
    logradouro: 'Avenida Brasil',
    numero: '450',
    complemento: 'Galpão 2',
    bairro: 'Barra Funda',
    cidade: 'Apucarana',
    uf: 'PR',
    cep: '86800010',
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
    categoriaFornecedor: 'Serviços Externos',
    tipoServico: 'Radiadores',
    contatoNome: 'Roberto Varas',
    contatoTelefone: '(43) 99111-5566',
    contatoEmail: 'atendimento@radiadoresapucarana.com.br',
    contato: {
      nome: 'Roberto Varas',
      telefone: '(43) 99111-5566',
      email: 'atendimento@radiadoresapucarana.com.br',
    },
    logradouro: 'Rua Ponta Grossa',
    numero: '890',
    complemento: '',
    bairro: 'Vila Nova',
    cidade: 'Apucarana',
    uf: 'PR',
    cep: '86802120',
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
    categoriaFornecedor: 'Serviços Externos',
    tipoServico: 'Vidraçaria',
    contatoNome: 'Marcos Rocha',
    contatoTelefone: '(43) 99677-8899',
    contatoEmail: 'contato@detailingapucarana.com.br',
    contato: {
      nome: 'Marcos Rocha',
      telefone: '(43) 99677-8899',
      email: 'contato@detailingapucarana.com.br',
    },
    logradouro: 'Avenida Curitiba',
    numero: '1520',
    complemento: 'Loja B',
    bairro: 'Centro',
    cidade: 'Apucarana',
    uf: 'PR',
    cep: '86800700',
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
  {
    id: 'terc-5',
    razaoSocial: 'Distribuidora Paranaense de Autopeças S/A',
    nomeFantasia: 'Dipa Autopeças e Componentes',
    cnpj: '01234567000189',
    inscricaoEstadual: '901234567',
    inscricaoMunicipal: '77210',
    categoriaFornecedor: 'Autopeças',
    tipoServico: 'Distribuidora de Autopeças',
    contatoNome: 'Luciana Martins',
    contatoTelefone: '(43) 99888-4455',
    contatoEmail: 'pedidos@dipaautopecas.com.br',
    contato: {
      nome: 'Luciana Martins',
      telefone: '(43) 99888-4455',
      email: 'pedidos@dipaautopecas.com.br',
    },
    logradouro: 'Avenida Curitiba',
    numero: '1500',
    complemento: 'Pavilhão A',
    bairro: 'Centro',
    cidade: 'Apucarana',
    uf: 'PR',
    cep: '86800000',
    endereco: {
      logradouro: 'Avenida Curitiba',
      numero: '1500',
      complemento: 'Pavilhão A',
      bairro: 'Centro',
      cidade: 'Apucarana',
      uf: 'PR',
      cep: '86800000',
    },
    ativo: true,
  },
  {
    id: 'terc-6',
    razaoSocial: 'Apucarana Peças e Acessórios Automotivos Ltda',
    nomeFantasia: 'Apucarana Auto Peças',
    cnpj: '11223344000155',
    inscricaoEstadual: '812345678',
    inscricaoMunicipal: '66100',
    categoriaFornecedor: 'Autopeças',
    tipoServico: 'Autopeças em Geral',
    contatoNome: 'Fernando Costa',
    contatoTelefone: '(43) 99777-2233',
    contatoEmail: 'contato@apucaranaautopecas.com.br',
    contato: {
      nome: 'Fernando Costa',
      telefone: '(43) 99777-2233',
      email: 'contato@apucaranaautopecas.com.br',
    },
    logradouro: 'Rua Rio de Janeiro',
    numero: '420',
    complemento: '',
    bairro: 'Jardim Apucarana',
    cidade: 'Apucarana',
    uf: 'PR',
    cep: '86808000',
    endereco: {
      logradouro: 'Rua Rio de Janeiro',
      numero: '420',
      complemento: '',
      bairro: 'Jardim Apucarana',
      cidade: 'Apucarana',
      uf: 'PR',
      cep: '86808000',
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({
          ...p,
          categoria: p.categoria || 'Outros Componentes',
          estoqueAtual: Number(p.estoqueAtual) || 0,
          estoqueMinimo: Number(p.estoqueMinimo) || 0,
          precoCusto: Number(p.precoCusto) || 0,
          precoVenda: Number(p.precoVenda) || 0,
        }))
      }
    }
  } catch {}
  return PECAS_INICIAIS
}

export function salvarPecasCadastradas(pecas) {
  try {
    localStorage.setItem(CHAVE_STORAGE_PECAS, JSON.stringify(pecas))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_pecas_updated'))
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

// Movimentações de Estoque (Auditoria e Kardex)
export const MOVIMENTACOES_ESTOQUE_INICIAIS = [
  {
    id: 'mov-1',
    dataHora: '2026-09-18T10:15:00',
    pecaId: 'pec-1',
    pecaCodigo: 'PEC-001',
    pecaNome: 'Filtro de Óleo Blindado',
    unidade: 'UN',
    tipo: 'ENTRADA',
    quantidade: 30,
    saldoAnterior: 20,
    saldoNovo: 50,
    motivo: 'Recebimento de Pedido de Compra de Fornecedor',
    documento: 'NF-e 045.291',
    responsavel: 'Rafael Almoxarife',
  },
  {
    id: 'mov-2',
    dataHora: '2026-09-18T14:30:00',
    pecaId: 'pec-4',
    pecaCodigo: 'PEC-004',
    pecaNome: 'Óleo Sintético 5W30 API SP (Frasco 1 Litro)',
    unidade: 'LT',
    tipo: 'SAIDA',
    quantidade: 4,
    saldoAnterior: 64,
    saldoNovo: 60,
    motivo: 'Aplicação técnica em Ordem de Serviço de Revisão',
    documento: 'OS #1042',
    responsavel: 'Gabriel Mecânico',
  },
  {
    id: 'mov-3',
    dataHora: '2026-09-18T16:00:00',
    pecaId: 'pec-2',
    pecaCodigo: 'PEC-002',
    pecaNome: 'Jogo de Pastilhas de Freio Dianteiras Cerâmica',
    unidade: 'JG',
    tipo: 'SAIDA',
    quantidade: 1,
    saldoAnterior: 13,
    saldoNovo: 12,
    motivo: 'Aplicação técnica em Manutenção do Sistema de Freios',
    documento: 'OS #1039',
    responsavel: 'Gabriel Mecânico',
  },
  {
    id: 'mov-4',
    dataHora: '2026-09-19T09:00:00',
    pecaId: 'pec-5',
    pecaCodigo: 'PEC-005',
    pecaNome: 'Aditivo Concentrado Orgânico Paraflu A05',
    unidade: 'LT',
    tipo: 'AJUSTE',
    quantidade: 3,
    saldoAnterior: 4,
    saldoNovo: 3,
    motivo: 'Ajuste de Balanço e Inventário Físico do Almoxarifado',
    documento: 'Balanço Semanal',
    responsavel: 'Rafael Almoxarife',
  },
]

export function carregarMovimentacoesEstoque() {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_MOVIMENTACOES_ESTOQUE)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return MOVIMENTACOES_ESTOQUE_INICIAIS
}

export function salvarMovimentacoesEstoque(movimentacoes) {
  try {
    localStorage.setItem(CHAVE_STORAGE_MOVIMENTACOES_ESTOQUE, JSON.stringify(movimentacoes))
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('dev_oficina_movimentacoes_updated'))
  } catch {}
}

export function registrarMovimentacaoEstoque({
  pecaId,
  tipo,
  quantidade,
  motivo,
  documento,
  responsavel,
}) {
  const listaPecas = carregarPecasCadastradas()
  const pecaIndex = listaPecas.findIndex((p) => p.id === pecaId)
  if (pecaIndex === -1) {
    throw new Error('Peça não encontrada no almoxarifado.')
  }

  const peca = listaPecas[pecaIndex]
  const qtd = Number(quantidade) || 0
  const saldoAnterior = Number(peca.estoqueAtual) || 0
  let saldoNovo = saldoAnterior

  if (tipo === 'ENTRADA') {
    saldoNovo = saldoAnterior + qtd
  } else if (tipo === 'SAIDA') {
    saldoNovo = Math.max(0, saldoAnterior - qtd)
  } else if (tipo === 'AJUSTE') {
    saldoNovo = Math.max(0, qtd)
  }

  const pecaAtualizada = {
    ...peca,
    estoqueAtual: saldoNovo,
  }

  const novasPecas = [...listaPecas]
  novasPecas[pecaIndex] = pecaAtualizada
  salvarPecasCadastradas(novasPecas)

  const novoMovimento = {
    id: `mov-${Date.now()}`,
    dataHora: new Date().toISOString(),
    pecaId: peca.id,
    pecaCodigo: peca.codigo,
    pecaNome: peca.nome,
    unidade: peca.unidade || 'UN',
    tipo,
    quantidade: qtd,
    saldoAnterior,
    saldoNovo,
    motivo: motivo || 'Movimentação manual do almoxarifado',
    documento: documento || 'Registro Avulso',
    responsavel: responsavel || 'Operador do Almoxarifado',
  }

  const listaMovs = carregarMovimentacoesEstoque()
  const novasMovs = [novoMovimento, ...listaMovs]
  salvarMovimentacoesEstoque(novasMovs)

  return { peca: pecaAtualizada, movimento: novoMovimento }
}

