/**
 * Mapeadores bidirecionais para Leva e Traz e Frota de Apoio (Story 2.12 / ADR-005).
 * Conversão DB (snake_case) ↔ Domínio (camelCase).
 */

export function mapearFrotaApoioParaDominio(db) {
  if (!db) return null
  return {
    id: db.id,
    codigo: db.codigo || '',
    modelo: db.modelo || '',
    placa: db.placa || '',
    ano: db.ano || '',
    cor: db.cor || '',
    kmAtual: db.km_atual || '',
    combustivel: db.combustivel || 'FLEX',
    status: db.status || 'disponivel',
    emUsoPor: db.em_uso_por || null,
    observacoes: db.observacoes || '',
    createdAt: db.created_at || null,
    updatedAt: db.updated_at || null,
  }
}

export function mapearFrotaApoioParaDb(dominio) {
  if (!dominio) return {}
  const payload = {
    modelo: dominio.modelo || '',
    placa: String(dominio.placa || '').toUpperCase().trim(),
    ano: dominio.ano ? String(dominio.ano) : null,
    cor: dominio.cor || null,
    km_atual: dominio.kmAtual ? String(dominio.kmAtual) : null,
    combustivel: dominio.combustivel || 'FLEX',
    status: dominio.status || 'disponivel',
    em_uso_por: dominio.emUsoPor || null,
    observacoes: dominio.observacoes || null,
  }
  if (dominio.codigo) payload.codigo = dominio.codigo
  if (dominio.id) payload.id = dominio.id
  return payload
}

export function mapearDeslocamentoParaDominio(db) {
  if (!db) return null
  return {
    id: db.id,
    codigo: db.codigo || '',
    tipoServico: db.tipo_servico || 'busca_veiculo',
    prioridade: db.prioridade || 'normal',
    status: db.status || 'agendado',
    data: db.data || '',
    horarioPrevisto: db.horario_previsto || '',
    horarioSaidaReal: db.horario_saida_real || '',
    horarioRetornoReal: db.horario_retorno_real || '',
    clienteId: db.cliente_id || null,
    clienteNome: db.cliente_nome || '',
    clienteTelefone: db.cliente_telefone || '',
    veiculoId: db.veiculo_id || null,
    veiculoModelo: db.veiculo_modelo || '',
    veiculoPlaca: db.veiculo_placa || '',
    numeroOS: db.numero_os || '',
    quantidadeFuncionarios: Number(db.quantidade_funcionarios || 1),
    motoristaPrincipalId: db.motorista_principal_id || null,
    motoristaPrincipalNome: db.motorista_principal_nome || '',
    motoristaPrincipalCargo: db.motorista_principal_cargo || '',
    auxiliarId: db.auxiliar_id || null,
    auxiliarNome: db.auxiliar_nome || '',
    auxiliarCargo: db.auxiliar_cargo || '',
    veiculoApoioId: db.veiculo_apoio_id || null,
    veiculoApoioNome: db.veiculo_apoio_nome || '',
    veiculoApoioPlaca: db.veiculo_apoio_placa || '',
    levarClienteEmbora: Boolean(db.levar_cliente_embora),
    fornecedorNome: db.fornecedor_nome || '',
    fornecedorTelefone: db.fornecedor_telefone || '',
    pecasDescricao: db.pecas_descricao || '',
    enderecoOrigem: db.endereco_origem || '',
    enderecoDestino: db.endereco_destino || '',
    distanciaKm: db.distancia_km || '',
    tempoEstimadoMinutos: db.tempo_estimado_minutos || null,
    kmEstimado: db.km_estimado || '',
    kmInicial: db.km_inicial || '',
    kmFinal: db.km_final || '',
    kmRealizado: db.km_realizado || '',
    cobrarCliente: Boolean(db.cobrar_cliente),
    valorCobrado: Number(db.valor_cobrado || 0),
    observacoes: db.observacoes || '',
    motivoCancelamento: db.motivo_cancelamento || '',
    createdAt: db.created_at || null,
    updatedAt: db.updated_at || null,
  }
}

export function mapearDeslocamentoParaDb(dominio) {
  if (!dominio) return {}
  const payload = {
    tipo_servico: dominio.tipoServico || 'busca_veiculo',
    prioridade: dominio.prioridade || 'normal',
    status: dominio.status || 'agendado',
    data: dominio.data || new Date().toLocaleDateString('pt-BR'),
    horario_previsto: dominio.horarioPrevisto || null,
    horario_saida_real: dominio.horarioSaidaReal || null,
    horario_retorno_real: dominio.horarioRetornoReal || null,
    cliente_id: dominio.clienteId || null,
    cliente_nome: dominio.clienteNome || null,
    cliente_telefone: dominio.clienteTelefone || null,
    veiculo_id: dominio.veiculoId || null,
    veiculo_modelo: dominio.veiculoModelo || null,
    veiculo_placa: dominio.veiculoPlaca ? String(dominio.veiculoPlaca).toUpperCase().trim() : null,
    numero_os: dominio.numeroOS || null,
    quantidade_funcionarios: Number(dominio.quantidadeFuncionarios || 1),
    motorista_principal_id: dominio.motoristaPrincipalId || null,
    motorista_principal_nome: dominio.motoristaPrincipalNome || null,
    motorista_principal_cargo: dominio.motoristaPrincipalCargo || null,
    auxiliar_id: dominio.auxiliarId || null,
    auxiliar_nome: dominio.auxiliarNome || null,
    auxiliar_cargo: dominio.auxiliarCargo || null,
    veiculo_apoio_id: dominio.veiculoApoioId || null,
    veiculo_apoio_nome: dominio.veiculoApoioNome || null,
    veiculo_apoio_placa: dominio.veiculoApoioPlaca ? String(dominio.veiculoApoioPlaca).toUpperCase().trim() : null,
    levar_cliente_embora: Boolean(dominio.levarClienteEmbora),
    fornecedor_nome: dominio.fornecedorNome || null,
    fornecedor_telefone: dominio.fornecedorTelefone || null,
    pecas_descricao: dominio.pecasDescricao || null,
    endereco_origem: dominio.enderecoOrigem || null,
    endereco_destino: dominio.enderecoDestino || null,
    distancia_km: dominio.distanciaKm || null,
    tempo_estimado_minutos: dominio.tempoEstimadoMinutos ? Number(dominio.tempoEstimadoMinutos) : null,
    km_estimado: dominio.kmEstimado ? String(dominio.kmEstimado) : null,
    km_inicial: dominio.kmInicial ? String(dominio.kmInicial) : null,
    km_final: dominio.kmFinal ? String(dominio.kmFinal) : null,
    km_realizado: dominio.kmRealizado ? String(dominio.kmRealizado) : null,
    cobrar_cliente: Boolean(dominio.cobrarCliente),
    valor_cobrado: Number(dominio.valorCobrado || 0),
    observacoes: dominio.observacoes || null,
    motivo_cancelamento: dominio.motivoCancelamento || null,
  }
  if (dominio.codigo) payload.codigo = dominio.codigo
  if (dominio.id) payload.id = dominio.id
  return payload
}
