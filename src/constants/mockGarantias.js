/**
 * Mock data e helpers de persistência local para a tela de Garantias (UI/UX)
 * Permite prototipação e validação dinâmica sem tocar nos repositórios Supabase.
 */

const STORAGE_KEY = 'dev_oficina_garantias'

export const MOCK_GARANTIAS_INICIAIS = [
  {
    id: 'GAR-2026-001',
    numeroOS: 'OS-2026-0812',
    clienteNome: 'Carlos Eduardo Silva',
    clienteTelefone: '11987654321',
    veiculo: 'Toyota Corolla 2.0 XEi 2021',
    placa: 'BRA2E19',
    tipo: 'MISTO', // PECA, SERVICO, MISTO
    descricao: 'Substituição de Amortecedores Dianteiros e Pastilhas de Freio Cerâmica',
    itensCobertos: [
      { nome: 'Par Amortecedores Dianteiros Cofap', tipo: 'PECA', garantiaMeses: 12, garantiaKm: 20000 },
      { nome: 'Pastilhas de Freio Dianteiras Fras-le', tipo: 'PECA', garantiaMeses: 6, garantiaKm: 10000 },
      { nome: 'Mão de Obra de Suspensão e Freio', tipo: 'SERVICO', garantiaMeses: 3, garantiaKm: 5000 },
    ],
    dataExecucao: '2026-08-10',
    dataValidade: '2027-08-10',
    quilometragemExecucao: 68500,
    quilometragemLimite: 88500,
    mecanicoResponsavel: 'Marcelo Oliveira',
    fornecedorPecas: 'Cofap Distribuidora SP',
    status: 'ATIVA', // ATIVA | A_VENCER | EXPIRADA | ACIONADA
    diasRestantes: 320,
    valorTotalOS: 2450.0,
    acionamentos: [],
    observacoes: 'Cliente orientado sobre revisão preventiva aos 73.500 km.',
  },
  {
    id: 'GAR-2026-002',
    numeroOS: 'OS-2026-0740',
    clienteNome: 'Mariana Rodrigues Costa',
    clienteTelefone: '11976543210',
    veiculo: 'Honda Civic 1.5 Touring 2019',
    placa: 'RHK4F22',
    tipo: 'SERVICO',
    descricao: 'Troca de Correia Dentada e Bomba d’Água',
    itensCobertos: [
      { nome: 'Kit Correia Dentada Gates', tipo: 'PECA', garantiaMeses: 6, garantiaKm: 10000 },
      { nome: 'Instalação e Sincronismo do Motor', tipo: 'SERVICO', garantiaMeses: 3, garantiaKm: 5000 },
    ],
    dataExecucao: '2026-07-02',
    dataValidade: '2026-10-02',
    quilometragemExecucao: 92400,
    quilometragemLimite: 97400,
    mecanicoResponsavel: 'Renato Tavares',
    fornecedorPecas: 'Gates do Brasil',
    status: 'A_VENCER',
    diasRestantes: 8,
    valorTotalOS: 1890.0,
    acionamentos: [],
    observacoes: 'Garantia legal e contratual próxima ao vencimento. Recomendado contato preventivo.',
  },
  {
    id: 'GAR-2026-003',
    numeroOS: 'OS-2026-0695',
    clienteNome: 'Fernando Albuquerque',
    clienteTelefone: '11998877665',
    veiculo: 'Volkswagen T-Cross 1.0 TSI 2022',
    placa: 'FXT9A33',
    tipo: 'PECA',
    descricao: 'Bateria Heliar 60Ah Start-Stop',
    itensCobertos: [
      { nome: 'Bateria Heliar EFB 60Ah', tipo: 'PECA', garantiaMeses: 24, garantiaKm: 0 },
    ],
    dataExecucao: '2026-05-18',
    dataValidade: '2028-05-18',
    quilometragemExecucao: 41200,
    quilometragemLimite: 0,
    mecanicoResponsavel: 'Marcelo Oliveira',
    fornecedorPecas: 'Heliar Brasil Distribuidora',
    status: 'ATIVA',
    diasRestantes: 601,
    valorTotalOS: 820.0,
    acionamentos: [],
    observacoes: 'Certificado de garantia original do fabricante entregue no porta-luvas.',
  },
  {
    id: 'GAR-2026-004',
    numeroOS: 'OS-2026-0580',
    clienteNome: 'Roberto Mendes Peixoto',
    clienteTelefone: '11981234567',
    veiculo: 'Jeep Compass 2.0 Longitude 2020',
    placa: 'JEP8C77',
    tipo: 'MISTO',
    descricao: 'Troca de Discos de Freio e Sangria do Sistema ABS',
    itensCobertos: [
      { nome: 'Par de Discos de Freio Fremax', tipo: 'PECA', garantiaMeses: 6, garantiaKm: 10000 },
      { nome: 'Fluido de Freio DOT 5.1 Motul', tipo: 'PECA', garantiaMeses: 3, garantiaKm: 5000 },
      { nome: 'Serviço Especializado de Sangria Eletrônica', tipo: 'SERVICO', garantiaMeses: 3, garantiaKm: 5000 },
    ],
    dataExecucao: '2026-04-10',
    dataValidade: '2026-07-10',
    quilometragemExecucao: 74000,
    quilometragemLimite: 79000,
    mecanicoResponsavel: 'Luciano Silva',
    fornecedorPecas: 'Fremax Componentes',
    status: 'EXPIRADA',
    diasRestantes: 0,
    valorTotalOS: 1450.0,
    acionamentos: [],
    observacoes: 'Período regular de garantia expirado sem ocorrências.',
  },
  {
    id: 'GAR-2026-005',
    numeroOS: 'OS-2026-0830',
    clienteNome: 'Juliana Vasconcelos',
    clienteTelefone: '11977778888',
    veiculo: 'Hyundai Creta 1.6 Prestige 2021',
    placa: 'CRT5B99',
    tipo: 'MISTO',
    descricao: 'Reparo do Sistema de Arrefecimento e Troca de Válvula Termostática',
    itensCobertos: [
      { nome: 'Válvula Termostática Wahler', tipo: 'PECA', garantiaMeses: 6, garantiaKm: 10000 },
      { nome: 'Aditivo Concentrado Orgânico Tirreno', tipo: 'PECA', garantiaMeses: 6, garantiaKm: 10000 },
      { nome: 'Limpeza e Teste de Pressão do Bloco', tipo: 'SERVICO', garantiaMeses: 3, garantiaKm: 5000 },
    ],
    dataExecucao: '2026-08-28',
    dataValidade: '2026-11-28',
    quilometragemExecucao: 53100,
    quilometragemLimite: 58100,
    mecanicoResponsavel: 'Renato Tavares',
    fornecedorPecas: 'BorgWarner / Wahler',
    status: 'ACIONADA',
    diasRestantes: 65,
    valorTotalOS: 980.0,
    acionamentos: [
      {
        id: 'AC-01',
        dataAcionamento: '2026-09-22',
        motivoReclamacao: 'Cliente relatou leve oscilação no ponteiro de temperatura após rodovia.',
        statusAcionamento: 'EM_ANALISE', // EM_ANALISE | PROCEDENTE | IMPROCEDENTE | CONCLUIDO
        prioridadeFila: 'PRIORIDADE_1_GARANTIA',
        parecerTecnico: 'Agendado para teste de estanqueidade e aferição por scanner.',
        resolucao: null,
      },
    ],
    observacoes: 'Acionamento registrado. Prioridade máxima na fila da oficina.',
  },
  {
    id: 'GAR-2026-006',
    numeroOS: 'OS-2026-0855',
    clienteNome: 'Patrícia Nogueira',
    clienteTelefone: '11983332211',
    veiculo: 'Chevrolet Onix Plus 1.0 Turbo 2023',
    placa: 'ONX1H88',
    tipo: 'MISTO',
    descricao: 'Troca de Coxim do Motor Superior e Inferior',
    itensCobertos: [
      { nome: 'Coxim Motor Direito Sampel', tipo: 'PECA', garantiaMeses: 6, garantiaKm: 10000 },
      { nome: 'Limitador de Torque Inferior', tipo: 'PECA', garantiaMeses: 6, garantiaKm: 10000 },
      { nome: 'Mão de Obra de Troca de Suportes', tipo: 'SERVICO', garantiaMeses: 3, garantiaKm: 5000 },
    ],
    dataExecucao: '2026-09-12',
    dataValidade: '2027-03-12',
    quilometragemExecucao: 31800,
    quilometragemLimite: 41800,
    mecanicoResponsavel: 'Marcelo Oliveira',
    fornecedorPecas: 'Sampel Autopeças',
    status: 'ATIVA',
    diasRestantes: 169,
    valorTotalOS: 1120.0,
    acionamentos: [],
    observacoes: 'Peças com selo original e NF arquivada.',
  },
]

export function carregarGarantias() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_GARANTIAS_INICIAIS))
      return MOCK_GARANTIAS_INICIAIS
    }
    return JSON.parse(raw)
  } catch (error) {
    console.error('Erro ao ler garantias do localStorage:', error)
    return MOCK_GARANTIAS_INICIAIS
  }
}

export function salvarGarantias(garantias) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(garantias))
    window.dispatchEvent(new Event('storage'))
  } catch (error) {
    console.error('Erro ao salvar garantias no localStorage:', error)
  }
}

export function calcularMetricasGarantias(garantias = []) {
  const ativas = garantias.filter((g) => g.status === 'ATIVA').length
  const aVencer = garantias.filter((g) => g.status === 'A_VENCER').length
  const expiradas = garantias.filter((g) => g.status === 'EXPIRADA').length
  const acionadas = garantias.filter((g) => g.status === 'ACIONADA').length
  const total = garantias.length

  // Taxa de retorno de garantia (% sobre o total de serviços executados com garantia)
  const taxaRetorno = total > 0 ? ((acionadas / total) * 100).toFixed(1) : '0.0'

  return {
    total,
    ativas,
    aVencer,
    expiradas,
    acionadas,
    taxaRetorno,
  }
}
