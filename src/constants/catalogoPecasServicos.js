// Catalogo de Sugestoes de Pecas, Servicos e Gerador de Laudo Tecnico
// Regra: Sem uso do caractere proibido (apenas 'e')

export const SUGESTOES_PECAS = [
  { value: 'Pastilhas de Freio Dianteiras', label: 'Pastilhas de Freio Dianteiras', categoria: 'Freios' },
  { value: 'Pastilhas de Freio Traseiras', label: 'Pastilhas de Freio Traseiras', categoria: 'Freios' },
  { value: 'Discos de Freio Ventilados Dianteiros', label: 'Discos de Freio Ventilados Dianteiros', categoria: 'Freios' },
  { value: 'Discos de Freio Traseiros', label: 'Discos de Freio Traseiros', categoria: 'Freios' },
  { value: 'Cilindro Mestre de Freio', label: 'Cilindro Mestre de Freio', categoria: 'Freios' },
  { value: 'Fluido de Freio DOT 4', label: 'Fluido de Freio DOT 4', categoria: 'Freios' },
  { value: 'Amortecedores Dianteiros (Par)', label: 'Amortecedores Dianteiros (Par)', categoria: 'Suspensão' },
  { value: 'Amortecedores Traseiros (Par)', label: 'Amortecedores Traseiros (Par)', categoria: 'Suspensão' },
  { value: 'Kit Batentes e Coifas dos Amortecedores', label: 'Kit Batentes e Coifas dos Amortecedores', categoria: 'Suspensão' },
  { value: 'Bieletas da Barra Estabilizadora (Par)', label: 'Bieletas da Barra Estabilizadora (Par)', categoria: 'Suspensão' },
  { value: 'Buchas da Barra Estabilizadora', label: 'Buchas da Barra Estabilizadora', categoria: 'Suspensão' },
  { value: 'Buchas da Bandeja de Suspensão', label: 'Buchas da Bandeja de Suspensão', categoria: 'Suspensão' },
  { value: 'Pivôs de Suspensão Dianteira', label: 'Pivôs de Suspensão Dianteira', categoria: 'Suspensão' },
  { value: 'Terminais de Direção (Par)', label: 'Terminais de Direção (Par)', categoria: 'Direção' },
  { value: 'Articulações Axiais de Direção', label: 'Articulações Axiais de Direção', categoria: 'Direção' },
  { value: 'Juntas Homocinéticas Fixas (Roda)', label: 'Juntas Homocinéticas Fixas (Roda)', categoria: 'Transmissão' },
  { value: 'Kit de Embreagem (Platô, Disco e Rolamento)', label: 'Kit de Embreagem (Platô, Disco e Rolamento)', categoria: 'Transmissão' },
  { value: 'Correia Dentada de Sincronismo', label: 'Correia Dentada de Sincronismo', categoria: 'Motor' },
  { value: 'Tensor e Polia Guia da Correia Dentada', label: 'Tensor e Polia Guia da Correia Dentada', categoria: 'Motor' },
  { value: 'Correia de Acessórios (Poli-V)', label: 'Correia de Acessórios (Poli-V)', categoria: 'Motor' },
  { value: 'Bomba d Água de Arrefecimento', label: 'Bomba d Água de Arrefecimento', categoria: 'Arrefecimento' },
  { value: 'Válvula Termostática com Carcaça', label: 'Válvula Termostática com Carcaça', categoria: 'Arrefecimento' },
  { value: 'Radiador de Arrefecimento', label: 'Radiador de Arrefecimento', categoria: 'Arrefecimento' },
  { value: 'Reservatório de Expansão e Tampa', label: 'Reservatório de Expansão e Tampa', categoria: 'Arrefecimento' },
  { value: 'Líquido de Arrefecimento Aditivo Orgânico', label: 'Líquido de Arrefecimento Aditivo Orgânico', categoria: 'Arrefecimento' },
  { value: 'Velas de Ignição (Jogo 4 unidades)', label: 'Velas de Ignição (Jogo 4 unidades)', categoria: 'Ignição' },
  { value: 'Cabos de Vela de Ignição', label: 'Cabos de Vela de Ignição', categoria: 'Ignição' },
  { value: 'Bobina de Ignição', label: 'Bobina de Ignição', categoria: 'Ignição' },
  { value: 'Bicos Injetores de Combustível', label: 'Bicos Injetores de Combustível', categoria: 'Alimentação' },
  { value: 'Bomba de Combustível (Refil e Pré-filtro)', label: 'Bomba de Combustível (Refil e Pré-filtro)', categoria: 'Alimentação' },
  { value: 'Filtro de Combustível', label: 'Filtro de Combustível', categoria: 'Filtros' },
  { value: 'Filtro de Ar do Motor', label: 'Filtro de Ar do Motor', categoria: 'Filtros' },
  { value: 'Filtro de Cabine (Ar Condicionado)', label: 'Filtro de Cabine (Ar Condicionado)', categoria: 'Filtros' },
  { value: 'Filtro de Óleo Lubrificante', label: 'Filtro de Óleo Lubrificante', categoria: 'Filtros' },
  { value: 'Óleo de Motor Sintético 5W30 (Litro)', label: 'Óleo de Motor Sintético 5W30 (Litro)', categoria: 'Lubrificantes' },
  { value: 'Junta da Tampa de Válvulas', label: 'Junta da Tampa de Válvulas', categoria: 'Motor' },
  { value: 'Bateria Automotiva 60Ah', label: 'Bateria Automotiva 60Ah', categoria: 'Elétrica' },
  { value: 'Alternador / Regulador de Tensão', label: 'Alternador / Regulador de Tensão', categoria: 'Elétrica' },
  { value: 'Motor de Partida (Arranque)', label: 'Motor de Partida (Arranque)', categoria: 'Elétrica' },
  { value: 'Gás Refrigerante R134a para Ar Condicionado', label: 'Gás Refrigerante R134a para Ar Condicionado', categoria: 'Ar Condicionado' },
  { value: 'Compressor de Ar Condicionado', label: 'Compressor de Ar Condicionado', categoria: 'Ar Condicionado' },
  { value: 'Silencioso Traseiro do Escapamento', label: 'Silencioso Traseiro do Escapamento', categoria: 'Escapamento' },
  { value: 'Pneu Dianteiro 185/65 R15', label: 'Pneu Dianteiro 185/65 R15', categoria: 'Pneus' },
]

export const SUGESTOES_SERVICOS = [
  { value: 'Substituição das Pastilhas e Discos de Freio', label: 'Substituição das Pastilhas e Discos de Freio', categoria: 'Freios' },
  { value: 'Sangria do Sistema de Freio e Troca de Fluido', label: 'Sangria do Sistema de Freio e Troca de Fluido', categoria: 'Freios' },
  { value: 'Substituição dos Amortecedores Dianteiros e Batentes', label: 'Substituição dos Amortecedores Dianteiros e Batentes', categoria: 'Suspensão' },
  { value: 'Substituição dos Amortecedores Traseiros', label: 'Substituição dos Amortecedores Traseiros', categoria: 'Suspensão' },
  { value: 'Troca de Bieletas e Buchas da Barra Estabilizadora', label: 'Troca de Bieletas e Buchas da Barra Estabilizadora', categoria: 'Suspensão' },
  { value: 'Substituição das Buchas de Bandeja e Pivôs', label: 'Substituição das Buchas de Bandeja e Pivôs', categoria: 'Suspensão' },
  { value: 'Alinhamento de Direção Computadorizado 3D', label: 'Alinhamento de Direção Computadorizado 3D', categoria: 'Geometria' },
  { value: 'Balanceamento Dinâmico das 4 Rodas', label: 'Balanceamento Dinâmico das 4 Rodas', categoria: 'Geometria' },
  { value: 'Troca do Kit de Correia Dentada e Tensionadores', label: 'Troca do Kit de Correia Dentada e Tensionadores', categoria: 'Motor' },
  { value: 'Substituição da Bomba d Água e Limpeza de Arrefecimento', label: 'Substituição da Bomba d Água e Limpeza de Arrefecimento', categoria: 'Arrefecimento' },
  { value: 'Limpeza e Equalização de Bicos Injetores em Ultrassom', label: 'Limpeza e Equalização de Bicos Injetores em Ultrassom', categoria: 'Injeção' },
  { value: 'Troca de Velas e Cabos de Ignição', label: 'Troca de Velas e Cabos de Ignição', categoria: 'Ignição' },
  { value: 'Troca de Óleo do Motor e Substituição de Todos os Filtros', label: 'Troca de Óleo do Motor e Substituição de Todos os Filtros', categoria: 'Revisão' },
  { value: 'Troca do Kit de Embreagem Completo com Retífica do Volante', label: 'Troca do Kit de Embreagem Completo com Retífica do Volante', categoria: 'Transmissão' },
  { value: 'Diagnóstico Eletrônico Completo com Scanner OBD-II', label: 'Diagnóstico Eletrônico Completo com Scanner OBD-II', categoria: 'Diagnóstico' },
  { value: 'Substituição da Bateria e Teste do Sistema de Carga', label: 'Substituição da Bateria e Teste do Sistema de Carga', categoria: 'Elétrica' },
  { value: 'Recarga de Gás Ecológico e Higienização do Ar Condicionado', label: 'Recarga de Gás Ecológico e Higienização do Ar Condicionado', categoria: 'Climatização' },
  { value: 'Troca da Junta da Tampa de Válvulas e Eliminação de Vazamento', label: 'Troca da Junta da Tampa de Válvulas e Eliminação de Vazamento', categoria: 'Motor' },
  { value: 'Retífica e Plaina de Cabeçote de Alumínio', label: 'Retífica e Plaina de Cabeçote de Alumínio (Terceiro)', categoria: 'Retífica' },
  { value: 'Teste Hidrostático de Cabeçote (Trinca)', label: 'Teste Hidrostático de Cabeçote (Trinca - Terceiro)', categoria: 'Retífica' },
  { value: 'Usinagem e Torneamento de Volante do Motor', label: 'Usinagem e Torneamento de Volante do Motor (Terceiro)', categoria: 'Usinagem' },
  { value: 'Reparo e Desbloqueio de Módulo de Injeção ECU', label: 'Reparo e Desbloqueio de Módulo de Injeção ECU (Terceiro)', categoria: 'Eletrônica' },
  { value: 'Solda TIG Especial em Cárter de Alumínio', label: 'Solda TIG Especial em Cárter de Alumínio (Terceiro)', categoria: 'Soldas' },
  { value: 'Recondicionamento de Caixa de Direção Hidráulica', label: 'Recondicionamento de Caixa de Direção Hidráulica (Terceiro)', categoria: 'Direção' },
  { value: 'Varetagem e Solda em Radiador', label: 'Varetagem e Solda em Radiador (Terceiro)', categoria: 'Radiadores' },
  { value: 'Transporte em Guincho Plataforma', label: 'Transporte em Guincho Plataforma (Terceiro)', categoria: 'Guincho' },
]

export const CATALOGO_SERVICOS_TABELA = [
  {
    codigo: 'SRV-001',
    nome: 'Substituição das Pastilhas e Discos de Freio Dianteiros',
    codigoPeca: 'PEC-FR-01',
    nomePeca: 'Pastilhas e Discos Dianteiros',
    categoria: 'Freios',
    tempoEstimado: '1.5',
    precoPadrao: 180.00,
  },
  {
    codigo: 'SRV-002',
    nome: 'Sangria do Sistema de Freio e Substituição de Fluido',
    codigoPeca: 'PEC-FR-05',
    nomePeca: 'Fluido de Freio DOT 4',
    categoria: 'Freios',
    tempoEstimado: '0.8',
    precoPadrao: 120.00,
  },
  {
    codigo: 'SRV-003',
    nome: 'Substituição dos Amortecedores Dianteiros e Batentes',
    codigoPeca: 'PEC-SP-01',
    nomePeca: 'Amortecedores Dianteiros e Batentes',
    categoria: 'Suspensão',
    tempoEstimado: '2.5',
    precoPadrao: 280.00,
  },
  {
    codigo: 'SRV-004',
    nome: 'Troca de Bieletas e Buchas da Barra Estabilizadora',
    codigoPeca: 'PEC-SP-03',
    nomePeca: 'Bieletas e Buchas',
    categoria: 'Suspensão',
    tempoEstimado: '1.0',
    precoPadrao: 140.00,
  },
  {
    codigo: 'SRV-005',
    nome: 'Alinhamento de Direção Computadorizado 3D',
    codigoPeca: 'PEC-GEO-00',
    nomePeca: 'Serviço Puro (Sem peça)',
    categoria: 'Geometria',
    tempoEstimado: '0.8',
    precoPadrao: 90.00,
  },
  {
    codigo: 'SRV-006',
    nome: 'Balanceamento Dinâmico das 4 Rodas',
    codigoPeca: 'PEC-GEO-01',
    nomePeca: 'Contrapesos de Rodagem',
    categoria: 'Geometria',
    tempoEstimado: '0.7',
    precoPadrao: 80.00,
  },
  {
    codigo: 'SRV-007',
    nome: 'Troca do Kit de Correia Dentada e Tensionadores',
    codigoPeca: 'PEC-MOT-01',
    nomePeca: 'Kit de Correia Dentada e Tensor',
    categoria: 'Motor',
    tempoEstimado: '3.0',
    precoPadrao: 350.00,
  },
  {
    codigo: 'SRV-008',
    nome: 'Substituição da Bomba d Água e Limpeza de Arrefecimento',
    codigoPeca: 'PEC-ARR-01',
    nomePeca: 'Bomba d Água e Aditivo Orgânico',
    categoria: 'Arrefecimento',
    tempoEstimado: '2.0',
    precoPadrao: 240.00,
  },
  {
    codigo: 'SRV-009',
    nome: 'Limpeza e Equalização de Bicos Injetores em Ultrassom',
    codigoPeca: 'PEC-ALM-01',
    nomePeca: 'Kit de Vedação dos Injetores',
    categoria: 'Injeção',
    tempoEstimado: '1.5',
    precoPadrao: 190.00,
  },
  {
    codigo: 'SRV-010',
    nome: 'Troca de Velas e Cabos de Ignição',
    codigoPeca: 'PEC-IGN-01',
    nomePeca: 'Velas e Cabos de Ignição',
    categoria: 'Ignição',
    tempoEstimado: '0.8',
    precoPadrao: 110.00,
  },
  {
    codigo: 'SRV-011',
    nome: 'Troca de Óleo do Motor e Substituição de Todos os Filtros',
    codigoPeca: 'PEC-LUB-01',
    nomePeca: 'Óleo Sintético e Filtros Gerais',
    categoria: 'Revisão',
    tempoEstimado: '0.8',
    precoPadrao: 90.00,
  },
  {
    codigo: 'SRV-012',
    nome: 'Troca do Kit de Embreagem com Retífica do Volante',
    codigoPeca: 'PEC-TR-01',
    nomePeca: 'Kit de Embreagem (Platô e Disco)',
    categoria: 'Transmissão',
    tempoEstimado: '4.5',
    precoPadrao: 480.00,
  },
  {
    codigo: 'SRV-013',
    nome: 'Diagnóstico Eletrônico Completo com Scanner OBD-II',
    codigoPeca: 'PEC-DIA-00',
    nomePeca: 'Serviço de Diagnóstico',
    categoria: 'Diagnóstico',
    tempoEstimado: '1.0',
    precoPadrao: 150.00,
  },
  {
    codigo: 'SRV-014',
    nome: 'Recarga de Gás Ecológico e Higienização de Ar Condicionado',
    codigoPeca: 'PEC-AC-01',
    nomePeca: 'Gás R134a e Filtro de Cabine',
    categoria: 'Climatização',
    tempoEstimado: '1.2',
    precoPadrao: 200.00,
  },
]

/**
 * Gera o Laudo Tecnico formal da Oficina a partir das Pecas identificadas (com fotos)
 * e dos Servicos recomendados pelo mecanico.
 */
export function gerarLaudoTecnico({
  cliente = '',
  placa = '',
  marcaModelo = '',
  km = '',
  relatoCliente = '',
  mecanicoNome = '',
  pecas = [],
  servicos = [],
}) {
  const dataFormatada = new Date().toLocaleDateString('pt-BR')
  const horaFormatada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  let laudo = `LAUDO TÉCNICO DE DIAGNÓSTICO MECÂNICO\n`
  laudo += `Data da Inspeção: ${dataFormatada} às ${horaFormatada}\n`
  laudo += `======================================================================\n\n`

  laudo += `1. DADOS DE IDENTIFICAÇÃO:\n`
  laudo += `• Veículo: ${marcaModelo || 'Não informado'} | Placa: ${placa || 'Sem placa'}\n`
  laudo += `• Quilometragem de Entrada: ${km ? `${km} km` : 'Não informada'}\n`
  laudo += `• Titular / Cliente: ${cliente || 'Não identificado'}\n`
  laudo += `• Mecânico Responsável: ${mecanicoNome || 'Mecânico da Oficina'}\n\n`

  if (relatoCliente?.trim()) {
    laudo += `2. QUEIXA INICIAL RELATADA PELO CLIENTE:\n`
    laudo += `"${relatoCliente.trim()}"\n\n`
  }

  laudo += `3. PEÇAS IDENTIFICADAS PARA TROCA OU REPARO:\n`
  if (pecas.length === 0) {
    laudo += `• Nenhuma peça de reposição apontada no momento.\n\n`
  } else {
    pecas.forEach((peca, idx) => {
      const qtd = peca.quantidade ? `(Qtd: ${peca.quantidade})` : '(Qtd: 1)'
      const fotoStatus = peca.fotoUrl ? '[Registro Fotográfico Anexado]' : '[Sem foto]'
      const obs = peca.observacao ? ` - Detalhe: ${peca.observacao}` : ''
      laudo += `${idx + 1}. ${peca.nome} ${qtd} ${fotoStatus}${obs}\n`
    })
    laudo += `\n`
  }

  laudo += `4. SERVIÇOS TÉCNICOS A SEREM EXECUTADOS:\n`
  if (servicos.length === 0) {
    laudo += `• Nenhum serviço específico selecionado.\n\n`
  } else {
    servicos.forEach((servico, idx) => {
      const obs = servico.observacao ? ` (${servico.observacao})` : ''
      laudo += `${idx + 1}. ${servico.nome}${obs}\n`
    })
    laudo += `\n`
  }

  laudo += `======================================================================\n`
  laudo += `PARECER TÉCNICO FINAL:\n`
  laudo += `Após inspeção física e diagnóstica na oficina mecânica, as intervenções\n`
  laudo += `acima descritas foram julgadas necessárias para restaurar a perfeita\n`
  laudo += `segurança, dirigibilidade e vida útil dos componentes do veículo.\n`
  laudo += `Orçamento encaminhado para aprovação do cliente.`

  return laudo
}
