/**
 * Mapeadores bidirecionais para Manutenção Preventiva (Story 2.13 / ADR-005).
 * Conversão DB (snake_case) ↔ Domínio (camelCase).
 */

export function formatarDataIsoParaBr(dataIso) {
  if (!dataIso) return ''
  const partes = String(dataIso).split('T')[0].split('-')
  if (partes.length === 3) {
    return `${partes[2].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[0]}`
  }
  return dataIso
}

export function formatarDataBrParaIso(dataBr) {
  if (!dataBr) return null
  const partes = String(dataBr).split('/')
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`
  }
  return dataBr
}

export function mapearManutencaoPreventivaParaDominio(db) {
  if (!db) return null

  return {
    id: db.id,
    veiculoId: db.veiculo_id || null,
    placa: (db.placa || '').toUpperCase().trim(),
    itemId: db.item_id || '',
    ultimaExecucaoKm: typeof db.ultima_execucao_km === 'number'
      ? db.ultima_execucao_km
      : parseFloat(String(db.ultima_execucao_km || '0').replace(',', '.')) || 0,
    ultimaExecucaoData: formatarDataIsoParaBr(db.ultima_execucao_data) || '01/01/2026',
    intervaloKm: parseInt(db.intervalo_km, 10) || 10000,
    intervaloMeses: parseInt(db.intervalo_meses, 10) || 6,
    mecanicoNome: db.mecanico_nome || '',
    mecanicoId: db.mecanico_id || null,
    observacoes: db.observacoes || '',
    garantiaPendente: Boolean(db.garantia_pendente),
    servicoOrigem: db.servico_origem || '',
    prazoGarantiaLimite: formatarDataIsoParaBr(db.prazo_garantia_limite) || '',
    createdAt: db.created_at || null,
    updatedAt: db.updated_at || null,
  }
}

export function mapearManutencaoPreventivaParaDb(dominio, veiculoId) {
  if (!dominio) return {}

  const payload = {
    veiculo_id: veiculoId || dominio.veiculoId,
    placa: String(dominio.placa || '').toUpperCase().trim(),
    item_id: dominio.itemId,
    ultima_execucao_km: typeof dominio.km === 'number'
      ? dominio.km
      : typeof dominio.ultimaExecucaoKm === 'number'
        ? dominio.ultimaExecucaoKm
        : parseFloat(String(dominio.km || dominio.ultimaExecucaoKm || '0').replace(/\./g, '').replace(',', '.')) || 0,
    ultima_execucao_data: formatarDataBrParaIso(dominio.data || dominio.ultimaExecucaoData) || new Date().toISOString().split('T')[0],
    intervalo_km: parseInt(dominio.intervaloKm, 10) || 10000,
    intervalo_meses: parseInt(dominio.intervaloMeses, 10) || 6,
    mecanico_nome: dominio.mecanicoNome || null,
    mecanico_id: dominio.mecanicoId || null,
    observacoes: dominio.observacoes || null,
    garantia_pendente: Boolean(dominio.garantiaPendente),
    servico_origem: dominio.servicoOrigem || null,
    prazo_garantia_limite: formatarDataBrParaIso(dominio.prazoGarantiaLimite) || null,
  }

  if (dominio.id && !dominio.id.startsWith('prev-')) {
    payload.id = dominio.id
  }

  return payload
}
