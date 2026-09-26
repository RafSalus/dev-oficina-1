/**
 * Mapeadores bidirecionais para Agenda e Fila de Espera
 * Story 2.10: Conformidade com ADR-005 e NFR17
 */

/**
 * Converte linha de agenda_agendamentos para o formato de domínio
 */
export function mapearAgendamentoParaDominio(registroDb) {
  if (!registroDb) return null

  return {
    id: registroDb.id,
    mecanicoId: registroDb.mecanico_id || '',
    mecanicoNome: registroDb.mecanico_nome || '',
    clienteId: registroDb.cliente_id || null,
    clienteNome: registroDb.cliente_nome || '',
    clienteTelefone: registroDb.cliente_telefone || '',
    clienteEndereco: registroDb.cliente_endereco || '',
    veiculoId: registroDb.veiculo_id || null,
    veiculoModelo: registroDb.veiculo_modelo || '',
    veiculoPlaca: registroDb.veiculo_placa || '',
    servicoDescricao: registroDb.servico_descricao || '',
    diaChave: registroDb.dia_chave,
    dataAgendamento: registroDb.data_agendamento || null,
    horarioInicio: registroDb.horario_inicio,
    duracaoHoras: Number(registroDb.duracao_horas) || 1,
    tipoLogistica: registroDb.tipo_logistica || 'CLIENTE_LEVA',
    horarioVeiculo: registroDb.horario_veiculo || registroDb.horario_inicio,
    enderecoColeta: registroDb.endereco_coleta || '',
    observacoes: registroDb.observacoes || '',
    emAtraso: Boolean(registroDb.em_atraso),
    tempoAtrasoMinutos: Number(registroDb.tempo_atraso_minutos) || 0,
    foiEmpurradoCascata: Boolean(registroDb.foi_empurrado_cascata),
    empurradoDeDia: registroDb.empurrado_de_dia || null,
    empurradoMinutos: Number(registroDb.empurrado_minutos) || 0,
    motivoEmpurrado: registroDb.motivo_empurrado || '',
    horarioOriginal: registroDb.horario_original || registroDb.horario_inicio,
    diaOriginal: registroDb.dia_original || registroDb.dia_chave,
    criadoEm: registroDb.created_at,
    updatedAt: registroDb.updated_at,
  }
}

/**
 * Converte agendamento do domínio para payload de gravação no Postgres
 */
export function mapearAgendamentoParaDb(ag) {
  if (!ag) return null

  const dados = {
    mecanico_id: ag.mecanicoId || null,
    mecanico_nome: ag.mecanicoNome || null,
    cliente_id: ag.clienteId || null,
    cliente_nome: ag.clienteNome ? ag.clienteNome.trim() : '',
    cliente_telefone: ag.clienteTelefone ? ag.clienteTelefone.trim() : null,
    cliente_endereco: ag.clienteEndereco ? ag.clienteEndereco.trim() : null,
    veiculo_id: ag.veiculoId || null,
    veiculo_modelo: ag.veiculoModelo ? ag.veiculoModelo.trim() : '',
    veiculo_placa: (ag.veiculoPlaca || '').toUpperCase().trim(),
    servico_descricao: ag.servicoDescricao ? ag.servicoDescricao.trim() : '',
    dia_chave: ag.diaChave || 'seg',
    data_agendamento: ag.dataAgendamento || null,
    horario_inicio: ag.horarioInicio || '08:00',
    duracao_horas: Number(ag.duracaoHoras) || 1,
    tipo_logistica: ag.tipoLogistica || 'CLIENTE_LEVA',
    horario_veiculo: ag.horarioVeiculo || ag.horarioInicio || '08:00',
    endereco_coleta: ag.tipoLogistica === 'OFICINA_BUSCA' ? (ag.enderecoColeta || '').trim() : '',
    observacoes: ag.observacoes ? ag.observacoes.trim() : '',
    em_atraso: Boolean(ag.emAtraso),
    tempo_atraso_minutos: Number(ag.tempoAtrasoMinutos) || 0,
    foi_empurrado_cascata: Boolean(ag.foiEmpurradoCascata),
    empurrado_de_dia: ag.empurradoDeDia || null,
    empurrado_minutos: Number(ag.empurradoMinutos) || 0,
    motivo_empurrado: ag.motivoEmpurrado || null,
    horario_original: ag.horarioOriginal || ag.horarioInicio || '08:00',
    dia_original: ag.diaOriginal || ag.diaChave || 'seg',
  }

  if (ag.id) dados.id = ag.id

  return dados
}

/**
 * Converte linha de agenda_fila_espera para o formato de domínio
 */
export function mapearItemFilaParaDominio(registroDb) {
  if (!registroDb) return null

  return {
    id: registroDb.id,
    clienteId: registroDb.cliente_id || null,
    clienteNome: registroDb.cliente_nome || '',
    clienteTelefone: registroDb.cliente_telefone || '',
    veiculoId: registroDb.veiculo_id || null,
    veiculoModelo: registroDb.veiculo_modelo || '',
    veiculoPlaca: registroDb.veiculo_placa || '',
    motivo: registroDb.motivo || '',
    prioridade: registroDb.prioridade || 'NORMAL',
    horaChegada: registroDb.hora_chegada || '',
    dataChegada: registroDb.data_chegada || '',
    mecanicoPreferencialId: registroDb.mecanico_preferencial_id || null,
    tempoEstimadoMinutos: Number(registroDb.tempo_estimado_minutos) || 45,
    criadoEm: registroDb.created_at,
    updatedAt: registroDb.updated_at,
  }
}

/**
 * Converte item da fila de espera do domínio para payload de gravação no Postgres
 */
export function mapearItemFilaParaDb(item) {
  if (!item) return null

  const dados = {
    cliente_id: item.clienteId || null,
    cliente_nome: item.clienteNome ? item.clienteNome.trim() : '',
    cliente_telefone: item.clienteTelefone ? item.clienteTelefone.trim() : null,
    veiculo_id: item.veiculoId || null,
    veiculo_modelo: item.veiculoModelo ? item.veiculoModelo.trim() : '',
    veiculo_placa: (item.veiculoPlaca || '').toUpperCase().trim(),
    motivo: item.motivo ? item.motivo.trim() : '',
    prioridade: item.prioridade || 'NORMAL',
    hora_chegada: item.horaChegada || '08:00',
    data_chegada: item.dataChegada || new Date().toISOString().slice(0, 10),
    mecanico_preferencial_id: item.mecanicoPreferencialId || null,
    tempo_estimado_minutos: Number(item.tempoEstimadoMinutos) || 45,
  }

  if (item.id) dados.id = item.id

  return dados
}
