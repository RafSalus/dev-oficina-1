// Utilitário de Rotas, Trajetos e Integração com o Google Maps
// Regras do Sistema: Sem uso do caractere proibido ('&'), apenas 'e'

export const ENDERECO_OFICINA_PADRAO = 'Mecânica Gabriel - R Tupinamba, 566, Apucarana - PR'

/**
 * Gera a URL oficial do Google Maps para abrir o trajeto e iniciar navegação GPS
 * @param {object} params
 * @param {string} params.origem Ponto de partida (ex: Oficina Gabriel)
 * @param {string} params.destino Ponto de destino (ex: Residência do cliente ou fornecedor)
 * @param {boolean} params.idaEVolta Se deve incluir o retorno à oficina (circuito completo)
 * @returns {string} URL pronta para navegação no Google Maps
 */
export function gerarLinkGoogleMapsTrajeto({
  origem = ENDERECO_OFICINA_PADRAO,
  destino,
  idaEVolta = true,
}) {
  if (!destino) return 'https://www.google.com/maps'

  const origEnc = encodeURIComponent(origem || ENDERECO_OFICINA_PADRAO)
  const destEnc = encodeURIComponent(destino)

  if (idaEVolta) {
    // Rota com ponto intermediário (vai até o destino e retorna para a oficina)
    return `https://www.google.com/maps/dir/?api=1&origin=${origEnc}&destination=${origEnc}&waypoints=${destEnc}&travelmode=driving`
  }

  // Apenas trajeto de ida
  return `https://www.google.com/maps/dir/?api=1&origin=${origEnc}&destination=${destEnc}&travelmode=driving`
}

/**
 * Calcula a estimativa inteligente de distância (KM) e tempo de deslocamento (minutos)
 * considerando ida, parada de atendimento e retorno à oficina.
 * @param {object} params
 * @param {string} params.origem Ponto de saída
 * @param {string} params.destino Ponto de destino
 * @param {string} params.cidade Cidade principal
 * @param {boolean} params.idaEVolta Se é circuito completo de ida e volta
 * @param {string} params.tipoVeiculo 'carro', 'moto' ou 'furgão'
 * @returns {object} { kmIda, kmTotal, tempoMinutosIda, tempoMinutosTotal, resumoTexto }
 */
export function calcularEstimativaTrajeto({
  origem = ENDERECO_OFICINA_PADRAO,
  destino = '',
  cidade = 'Apucarana',
  idaEVolta = true,
  tipoVeiculo = 'carro',
}) {
  const destLower = String(destino || '').toLowerCase()
  const cidLower = String(cidade || '').toLowerCase()

  let kmBaseIda = 6 // padrão urbano dentro da mesma cidade
  let tempoBaseIda = 15 // minutos padrão para 6 km urbanos com semáforos

  // 1. Verificação de distâncias intermunicipais comuns no Paraná
  if (cidLower.includes('londrina') || destLower.includes('londrina')) {
    kmBaseIda = 52
    tempoBaseIda = 50
    if (destLower.includes('gleba palhano') || destLower.includes('ayrton senna')) {
      kmBaseIda = 55
      tempoBaseIda = 55
    }
  } else if (cidLower.includes('maringa') || destLower.includes('maringa')) {
    kmBaseIda = 68
    tempoBaseIda = 65
  } else if (cidLower.includes('arapongas') || destLower.includes('arapongas')) {
    kmBaseIda = 18
    tempoBaseIda = 22
  } else if (cidLower.includes('cambe') || destLower.includes('cambe')) {
    kmBaseIda = 44
    tempoBaseIda = 45
  } else if (cidLower.includes('rolandia') || destLower.includes('rolandia')) {
    kmBaseIda = 32
    tempoBaseIda = 35
  } else if (cidLower.includes('jandaia') || destLower.includes('jandaia')) {
    kmBaseIda = 25
    tempoBaseIda = 28
  } else {
    // Deslocamentos locais em Apucarana por bairros / zonas
    if (destLower.includes('parque industrial') || destLower.includes('distrito industrial')) {
      kmBaseIda = 9
      tempoBaseIda = 18
    } else if (destLower.includes('centro')) {
      kmBaseIda = 3.5
      tempoBaseIda = 10
    } else if (destLower.includes('zona norte') || destLower.includes('jardim ponta grossa')) {
      kmBaseIda = 8
      tempoBaseIda = 16
    } else if (destLower.includes('zona leste') || destLower.includes('vila nova')) {
      kmBaseIda = 5
      tempoBaseIda = 12
    } else {
      kmBaseIda = 6
      tempoBaseIda = 15
    }
  }

  // Ajuste fino para motos (tráfego mais ágil)
  if (tipoVeiculo === 'moto') {
    tempoBaseIda = Math.max(8, Math.round(tempoBaseIda * 0.8))
  }

  // Tempo de parada no local (carregar peças, inspecionar carro ou embarcar cliente)
  const tempoParadaLocal = 10 // 10 minutos de parada média

  if (idaEVolta) {
    const kmTotal = Math.round(kmBaseIda * 2)
    const tempoTotal = Math.round(tempoBaseIda * 2 + tempoParadaLocal)
    return {
      kmIda: Math.round(kmBaseIda),
      kmTotal,
      tempoMinutosIda: tempoBaseIda,
      tempoMinutosTotal: tempoTotal,
      resumoTexto: `Ida e Volta: ${kmTotal} km • ~${tempoTotal} min (com ${tempoParadaLocal} min de atendimento no local)`,
    }
  }

  return {
    kmIda: Math.round(kmBaseIda),
    kmTotal: Math.round(kmBaseIda),
    tempoMinutosIda: tempoBaseIda,
    tempoMinutosTotal: tempoBaseIda,
    resumoTexto: `Apenas Ida: ${Math.round(kmBaseIda)} km • ~${tempoBaseIda} min`,
  }
}
