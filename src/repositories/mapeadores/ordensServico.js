/**
 * Mapeadores bidirecionais para Ordens de Serviço (Story 2.14 / ADR-005).
 * Conversão DB (snake_case) ↔ Domínio (camelCase).
 */

export function mapearOrdemServicoParaDominio(db) {
  if (!db) return null

  const snapshotCliente = db.snapshot_cliente || {}
  const snapshotVeiculo = db.snapshot_veiculo || {}

  return {
    id: db.id,
    numeroOS: db.numero_os || '',
    clienteId: db.cliente_id || snapshotCliente.id || null,
    veiculoId: db.veiculo_id || snapshotVeiculo.id || null,
    mecanicoId: db.mecanico_id || null,
    mecanicoNome: db.mecanico_nome || 'Não atribuído',
    status: db.status || 'fila',
    prioridade: db.prioridade || 'normal',
    cliente: snapshotCliente,
    clienteNome: snapshotCliente.nome || snapshotCliente.razaoSocial || db.cliente_nome || '',
    clienteTelefone: snapshotCliente.telefone || snapshotCliente.celular || '',
    clienteDocumento: snapshotCliente.documento || snapshotCliente.cpf || snapshotCliente.cnpj || '',
    veiculo: snapshotVeiculo,
    veiculoPlaca: snapshotVeiculo.placa || db.placa || '',
    placa: snapshotVeiculo.placa || db.placa || '',
    veiculoModelo: snapshotVeiculo.modelo || snapshotVeiculo.marcaModelo || '',
    marcaModelo: snapshotVeiculo.marcaModelo || snapshotVeiculo.modelo || '',
    sintomasCliente: db.sintomas_cliente || '',
    descricaoProblema: db.sintomas_cliente || '',
    reclamacao: db.sintomas_cliente || '',
    diagnosticoTecnico: db.diagnostico_tecnico || '',
    diagnostico: db.diagnostico_tecnico || '',
    pecasOS: Array.isArray(db.itens_pecas) ? db.itens_pecas : [],
    servicosOS: Array.isArray(db.itens_servicos) ? db.itens_servicos : [],
    terceirosOS: Array.isArray(db.itens_terceiros) ? db.itens_terceiros : [],
    totalPecas: Number(db.subtotal_pecas) || 0,
    totalServicos: Number(db.subtotal_servicos) || 0,
    totalTerceiros: Number(db.subtotal_terceiros) || 0,
    descontoTotal: Number(db.desconto_geral) || 0,
    descontoGeralOS: Number(db.desconto_geral) || 0,
    valorTotal: Number(db.valor_total) || 0,
    kmEntrada: db.km_entrada !== null && db.km_entrada !== undefined ? String(db.km_entrada) : '',
    nivelCombustivel: db.nivel_combustivel || '1/2',
    checklistEntrada: db.checklist_entrada || {},
    checklistSaida: db.checklist_saida || null,
    fotosEntrada: Array.isArray(db.fotos_entrada) ? db.fotos_entrada : [],
    assinaturaCliente: db.assinatura_cliente || null,
    dataEntrada: db.data_entrada ? new Date(db.data_entrada).toLocaleDateString('pt-BR') : '',
    horaEntrada: db.data_entrada ? new Date(db.data_entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
    previsaoEntrega: db.previsao_entrega || null,
    dataFinalizacao: db.data_finalizacao ? new Date(db.data_finalizacao).toLocaleDateString('pt-BR') : null,
    createdAt: db.created_at || null,
    updatedAt: db.updated_at || null,
    snapshotCliente,
    snapshotVeiculo,
  }
}

export function mapearOrdemServicoParaDb(dominio) {
  if (!dominio) return {}

  const snapshotCliente = dominio.snapshotCliente || dominio.cliente || {
    id: dominio.clienteId || null,
    nome: dominio.clienteNome || '',
    telefone: dominio.clienteTelefone || '',
    documento: dominio.clienteDocumento || '',
  }

  const snapshotVeiculo = dominio.snapshotVeiculo || dominio.veiculo || {
    id: dominio.veiculoId || null,
    placa: dominio.veiculoPlaca || dominio.placa || '',
    modelo: dominio.veiculoModelo || dominio.marcaModelo || '',
    marcaModelo: dominio.marcaModelo || dominio.veiculoModelo || '',
  }

  const payload = {
    numero_os: dominio.numeroOS || null,
    cliente_id: dominio.clienteId || snapshotCliente.id || null,
    veiculo_id: dominio.veiculoId || snapshotVeiculo.id || null,
    mecanico_id: dominio.mecanicoId || null,
    mecanico_nome: dominio.mecanicoNome && dominio.mecanicoNome !== 'Não atribuído' ? dominio.mecanicoNome : null,
    status: dominio.status || 'fila',
    snapshot_cliente: snapshotCliente,
    snapshot_veiculo: snapshotVeiculo,
    sintomas_cliente: dominio.sintomasCliente || dominio.descricaoProblema || dominio.reclamacao || null,
    diagnostico_tecnico: dominio.diagnosticoTecnico || dominio.diagnostico || null,
    itens_pecas: Array.isArray(dominio.pecasOS) ? dominio.pecasOS : [],
    itens_servicos: Array.isArray(dominio.servicosOS) ? dominio.servicosOS : [],
    itens_terceiros: Array.isArray(dominio.terceirosOS) ? dominio.terceirosOS : [],
    subtotal_pecas: Number(dominio.totalPecas) || 0,
    subtotal_servicos: Number(dominio.totalServicos) || 0,
    subtotal_terceiros: Number(dominio.totalTerceiros) || 0,
    desconto_geral: Number(dominio.descontoTotal ?? dominio.descontoGeralOS) || 0,
    valor_total: Number(dominio.valorTotal) || 0,
    km_entrada: parseInt(String(dominio.kmEntrada || '0').replace(/\D/g, ''), 10) || 0,
    nivel_combustivel: dominio.nivelCombustivel || '1/2',
    checklist_entrada: dominio.checklistEntrada || {},
    fotos_entrada: Array.isArray(dominio.fotosEntrada) ? dominio.fotosEntrada : [],
    assinatura_cliente: dominio.assinaturaCliente || null,
  }

  if (dominio.id && !dominio.id.startsWith('os-temp-')) {
    payload.id = dominio.id
  }

  return payload
}
