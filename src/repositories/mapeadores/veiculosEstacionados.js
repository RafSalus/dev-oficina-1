/**
 * Mapeadores bidirecionais para Veículos Estacionados (Story 2.11 / ADR-005).
 * Conversão DB (snake_case) ↔ Domínio (camelCase).
 */

export function mapearVeiculoEstacionadoParaDominio(db) {
  if (!db) return null

  return {
    id: db.id,
    veiculoId: db.veiculo_id || null,
    placa: db.placa || '',
    codigoVeiculo: db.codigo_veiculo || '',
    marca: db.marca || '',
    modelo: db.modelo || '',
    marcaModelo: db.marca_modelo || `${db.marca || ''} ${db.modelo || ''}`.trim(),
    ano: db.ano || '',
    cor: db.cor || '',
    combustivel: db.combustivel || 'FLEX',
    kmAtual: db.km_atual || '',
    chassi: db.chassi || '',
    renavam: db.renavam || '',
    dataEstacionamento: db.data_estacionamento || '',
    motivoVenda: db.motivo_venda || '',
    antigoClienteId: db.antigo_cliente_id || '',
    antigoClienteNome: db.antigo_cliente_nome || '',
    antigoClienteTelefone: db.antigo_cliente_telefone || '',
    antigoClienteDocumento: db.antigo_cliente_documento || '',
    novoDonoNome: db.novo_dono_nome || '',
    novoDonoTelefone: db.novo_dono_telefone || '',
    novoDonoDocumento: db.novo_dono_documento || '',
    novoDonoEmail: db.novo_dono_email || '',
    observacoes: db.observacoes || '',
    historicoManutencoes: Array.isArray(db.historico_manutencoes) ? db.historico_manutencoes : [],
    createdAt: db.created_at || null,
    updatedAt: db.updated_at || null,
  }
}

export function mapearVeiculoEstacionadoParaDb(dominio) {
  if (!dominio) return {}

  const payload = {
    placa: String(dominio.placa || '').toUpperCase().trim(),
    codigo_veiculo: dominio.codigoVeiculo || null,
    marca: dominio.marca || null,
    modelo: dominio.modelo || null,
    marca_modelo: dominio.marcaModelo || `${dominio.marca || ''} ${dominio.modelo || ''}`.trim() || null,
    ano: dominio.ano ? String(dominio.ano) : null,
    cor: dominio.cor || null,
    combustivel: dominio.combustivel || 'FLEX',
    km_atual: dominio.kmAtual ? String(dominio.kmAtual) : null,
    chassi: dominio.chassi || null,
    renavam: dominio.renavam || null,
    data_estacionamento: dominio.dataEstacionamento || new Date().toLocaleDateString('pt-BR'),
    motivo_venda: dominio.motivoVenda || null,
    antigo_cliente_id: dominio.antigoClienteId || null,
    antigo_cliente_nome: dominio.antigoClienteNome || null,
    antigo_cliente_telefone: dominio.antigoClienteTelefone || null,
    antigo_cliente_documento: dominio.antigoClienteDocumento || null,
    novo_dono_nome: dominio.novoDonoNome || null,
    novo_dono_telefone: dominio.novoDonoTelefone || null,
    novo_dono_documento: dominio.novoDonoDocumento || null,
    novo_dono_email: dominio.novoDonoEmail || null,
    observacoes: dominio.observacoes || null,
    historico_manutencoes: Array.isArray(dominio.historicoManutencoes) ? dominio.historicoManutencoes : [],
  }

  if (dominio.veiculoId) {
    payload.veiculo_id = dominio.veiculoId
  }

  if (dominio.id) {
    payload.id = dominio.id
  }

  return payload
}
