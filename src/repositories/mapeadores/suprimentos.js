/**
 * Mapeadores puros entre o modelo do frontend e as tabelas public.pecas, public.servicos, public.terceiros do Postgres (Story 2.7).
 */

/**
 * Converte objeto de peça do frontend para a linha do Postgres.
 * @param {object} peca
 * @returns {object}
 */
export function pecaParaLinha(peca) {
  if (!peca || typeof peca !== 'object') return {}

  const precoVenda = Number(peca.precoVenda ?? peca.precoUnitario ?? 0) || 0
  const precoCusto = Number(peca.precoCusto ?? 0) || 0
  const estoqueAtual = Number(peca.estoqueAtual ?? peca.estoque ?? 0) || 0
  const estoqueMinimo = Number(peca.estoqueMinimo ?? 0) || 0

  let margem = Number(peca.margemLucro ?? 0) || 0
  if (!margem && precoCusto > 0 && precoVenda > precoCusto) {
    margem = Number((((precoVenda - precoCusto) / precoCusto) * 100).toFixed(2))
  }

  const linha = {
    codigo: (peca.codigo || '').trim().toUpperCase(),
    nome: (peca.nome || '').trim(),
    descricao: (peca.descricao || '').trim() || null,
    categoria: (peca.categoria || 'Geral').trim(),
    unidade_medida: (peca.unidadeMedida || peca.unidade || 'UN').trim().toUpperCase(),
    estoque_atual: estoqueAtual,
    estoque_minimo: estoqueMinimo,
    preco_custo: precoCusto,
    preco_venda: precoVenda,
    margem_lucro: margem,
    localizacao: (peca.localizacao || '').trim() || null,
    fornecedor_padrao: (peca.fornecedorPadrao || peca.fornecedor || '').trim() || null,
    cst_csosn: (peca.cstCsosn || peca.cst_csosn || '102').trim() || null,
    cfop: (peca.cfop || '5102').trim() || null,
    ncm: (peca.ncm || '8708.29.99').trim() || null,
    ativo: peca.ativo !== false,
  }

  const id = peca.id || peca.value
  if (id && !String(id).startsWith('peca-')) {
    linha.id = String(id)
  }

  return linha
}

/**
 * Converte linha da tabela public.pecas do Postgres para o formato do frontend.
 * @param {object} linha
 * @returns {object}
 */
export function linhaParaPeca(linha) {
  if (!linha || typeof linha !== 'object') return null

  const precoVenda = Number(linha.preco_venda ?? 0)
  const precoCusto = Number(linha.preco_custo ?? 0)
  const estoqueAtual = Number(linha.estoque_atual ?? 0)
  const estoqueMinimo = Number(linha.estoque_minimo ?? 0)
  const margemLucro = Number(linha.margem_lucro ?? 0)

  return {
    id: linha.id,
    value: linha.id,
    codigo: linha.codigo || '',
    nome: linha.nome || '',
    descricao: linha.descricao || '',
    categoria: linha.categoria || 'Geral',
    unidade: linha.unidade_medida || 'UN',
    unidadeMedida: linha.unidade_medida || 'UN',
    estoqueAtual,
    estoque: estoqueAtual,
    estoqueMinimo,
    precoCusto,
    precoVenda,
    precoUnitario: precoVenda,
    margemLucro,
    localizacao: linha.localizacao || '',
    fornecedorPadrao: linha.fornecedor_padrao || '',
    fornecedor: linha.fornecedor_padrao || '',
    cstCsosn: linha.cst_csosn || '',
    cfop: linha.cfop || '',
    ncm: linha.ncm || '',
    ativo: linha.ativo !== false,
    createdAt: linha.created_at,
    dataCadastro: linha.created_at,
    updatedAt: linha.updated_at,
    dataAtualizacao: linha.updated_at,
  }
}

/**
 * Converte objeto de serviço do frontend para a linha do Postgres.
 * @param {object} servico
 * @returns {object}
 */
export function servicoParaLinha(servico) {
  if (!servico || typeof servico !== 'object') return {}

  const valorMaoDeObra = Number(servico.valorMaoDeObra ?? servico.valorUnitario ?? servico.valor ?? 0) || 0
  const tempoEstimadoHoras = Number(servico.tempoEstimadoHoras ?? servico.tempoEstimado ?? 1) || 1
  const aliquotaIss = Number(servico.aliquotaIss ?? servico.aliquotaISS ?? 5) || 5

  const linha = {
    codigo: (servico.codigo || '').trim().toUpperCase(),
    nome: (servico.nome || '').trim(),
    descricao: (servico.descricao || '').trim() || null,
    categoria: (servico.categoria || 'Mecânica Geral').trim(),
    valor_mao_de_obra: valorMaoDeObra,
    tempo_estimado_horas: tempoEstimadoHoras,
    cnae: (servico.cnae || '4520-0/01').trim() || null,
    codigo_servico_ibpt: (servico.codigoServicoIbpt || servico.codigoServicoIBPT || '14.01').trim() || null,
    aliquota_iss: aliquotaIss,
    ativo: servico.ativo !== false,
  }

  const id = servico.id || servico.value
  if (id && !String(id).startsWith('serv-')) {
    linha.id = String(id)
  }

  return linha
}

/**
 * Converte linha da tabela public.servicos do Postgres para o formato do frontend.
 * @param {object} linha
 * @returns {object}
 */
export function linhaParaServico(linha) {
  if (!linha || typeof linha !== 'object') return null

  const valorMaoDeObra = Number(linha.valor_mao_de_obra ?? 0)
  const tempoEstimadoHoras = Number(linha.tempo_estimado_horas ?? 1)
  const aliquotaIss = Number(linha.aliquota_iss ?? 5)

  return {
    id: linha.id,
    value: linha.id,
    codigo: linha.codigo || '',
    nome: linha.nome || '',
    descricao: linha.descricao || '',
    categoria: linha.categoria || 'Mecânica Geral',
    valorMaoDeObra,
    valorUnitario: valorMaoDeObra,
    valor: valorMaoDeObra,
    tempoEstimadoHoras,
    tempoEstimado: tempoEstimadoHoras,
    cnae: linha.cnae || '',
    codigoServicoIbpt: linha.codigo_servico_ibpt || '',
    codigoServicoIBPT: linha.codigo_servico_ibpt || '',
    aliquotaIss,
    aliquotaISS: aliquotaIss,
    ativo: linha.ativo !== false,
    createdAt: linha.created_at,
    dataCadastro: linha.created_at,
    updatedAt: linha.updated_at,
    dataAtualizacao: linha.updated_at,
  }
}

/**
 * Converte objeto de terceiro/fornecedor do frontend para a linha do Postgres.
 * @param {object} terceiro
 * @returns {object}
 */
export function terceiroParaLinha(terceiro) {
  if (!terceiro || typeof terceiro !== 'object') return {}

  const tempoMedioRetorno = Number(terceiro.tempoMedioRetornoHoras ?? terceiro.tempoMedioRetorno ?? 24) || 24

  const linha = {
    razao_social: (terceiro.razaoSocial || terceiro.nome || '').trim(),
    nome_fantasia: (terceiro.nomeFantasia || terceiro.razaoSocial || terceiro.nome || '').trim() || null,
    cnpj_cpf: (terceiro.cnpjCpf || terceiro.cnpj || terceiro.cpf || terceiro.documento || '').replace(/\D/g, '') || null,
    telefone: (terceiro.telefone || '').trim() || null,
    email: (terceiro.email || '').trim() || null,
    ramo_atividade: (terceiro.ramoAtividade || terceiro.categoria || terceiro.tipoServico || 'Geral').trim() || null,
    tempo_medio_retorno_horas: tempoMedioRetorno,
    observacoes: (terceiro.observacoes || '').trim() || null,
    ativo: terceiro.ativo !== false,
  }

  const id = terceiro.id || terceiro.value
  if (id && !String(id).startsWith('terc-')) {
    linha.id = String(id)
  }

  return linha
}

/**
 * Converte linha da tabela public.terceiros do Postgres para o formato do frontend.
 * @param {object} linha
 * @returns {object}
 */
export function linhaParaTerceiro(linha) {
  if (!linha || typeof linha !== 'object') return null

  const tempoMedioRetornoHoras = Number(linha.tempo_medio_retorno_horas ?? 24)

  return {
    id: linha.id,
    value: linha.id,
    razaoSocial: linha.razao_social || '',
    nomeFantasia: linha.nome_fantasia || linha.razao_social || '',
    nome: linha.nome_fantasia || linha.razao_social || '',
    cnpjCpf: linha.cnpj_cpf || '',
    cnpj: linha.cnpj_cpf || '',
    documento: linha.cnpj_cpf || '',
    telefone: linha.telefone || '',
    email: linha.email || '',
    ramoAtividade: linha.ramo_atividade || 'Geral',
    categoria: linha.ramo_atividade || 'Geral',
    tempoMedioRetornoHoras,
    tempoMedioRetorno: tempoMedioRetornoHoras,
    observacoes: linha.observacoes || '',
    ativo: linha.ativo !== false,
    createdAt: linha.created_at,
    dataCadastro: linha.created_at,
    updatedAt: linha.updated_at,
    dataAtualizacao: linha.updated_at,
  }
}
