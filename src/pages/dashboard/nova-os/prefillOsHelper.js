/**
 * Utilitário puro de preenchimento inicial (prefill) da Ordem de Serviço
 * a partir de itens da Fila da Agenda, edições de OS existentes ou preventiva.
 */
export function resolverPrefillOs(dadosIniciais, listaClientes = []) {
  const state = dadosIniciais
  const veiculoParam = state.veiculo || {}
  const placaAlvo = (state.veiculoPlaca || state.placa || veiculoParam.placa || '').toUpperCase().trim()
  const clienteIdAlvo = state.clienteId || veiculoParam.clienteId
  const clienteNomeAlvo = state.clienteNome || veiculoParam.clienteNome

  let clienteEncontrado = null
  if (clienteIdAlvo) {
    clienteEncontrado = listaClientes.find((c) => c.value === clienteIdAlvo || c.id === clienteIdAlvo)
  }
  if (!clienteEncontrado && placaAlvo) {
    clienteEncontrado = listaClientes.find(
      (c) => Array.isArray(c.veiculos) && c.veiculos.some((v) => (v.placa || '').toUpperCase().trim() === placaAlvo)
    )
  }
  if (!clienteEncontrado && clienteNomeAlvo) {
    clienteEncontrado = listaClientes.find((c) => c.nome?.toLowerCase().trim() === clienteNomeAlvo.toLowerCase().trim())
  }

  let veiculoEncontrado = null
  if (clienteEncontrado && Array.isArray(clienteEncontrado.veiculos)) {
    if (state.veiculoId) {
      veiculoEncontrado = clienteEncontrado.veiculos.find((v) => v.value === state.veiculoId || v.id === state.veiculoId)
    }
    if (!veiculoEncontrado && placaAlvo) {
      veiculoEncontrado = clienteEncontrado.veiculos.find((v) => (v.placa || '').toUpperCase().trim() === placaAlvo)
    }
    if (!veiculoEncontrado && clienteEncontrado.veiculos.length > 0) {
      veiculoEncontrado = clienteEncontrado.veiculos[0]
    }
  }

  const ehOsExistente = Boolean(state.numeroOS)
  const itens = state.itensPreventivosSugeridos || []
  let relatoTexto = state.relatoCliente || state.relatoPreventivo || state.motivo || ''

  if (!ehOsExistente && !relatoTexto && Array.isArray(itens) && itens.length > 0) {
    const linhas = itens
      .map((item) => {
        const nome = item.nome || item.itemNome || 'Item Preventivo'
        const motivo = item.motivoAlerta ? ` - ${item.motivoAlerta}` : ''
        return `• ${nome}${motivo}`
      })
      .join('\n')

    relatoTexto = [
      'REVISAO PREVENTIVA E PONTOS DE ATENCAO:',
      linhas,
      '',
      'Veiculo recepcionado para inspecao preventiva geral.',
    ].join('\n')
  }

  const patch = ehOsExistente
    ? { ...state }
    : {
        clienteId: clienteEncontrado ? clienteEncontrado.value || clienteEncontrado.id : clienteIdAlvo || '',
        cliente: clienteEncontrado ? clienteEncontrado.nome : clienteNomeAlvo || '',
        telefone: clienteEncontrado ? clienteEncontrado.telefone || '' : state.clienteTelefone || veiculoParam.clienteTelefone || '',
        documento: clienteEncontrado ? clienteEncontrado.documento || '' : veiculoParam.clienteDocumento || '',
        email: clienteEncontrado ? clienteEncontrado.email || '' : '',
        endereco: clienteEncontrado ? clienteEncontrado.endereco || '' : veiculoParam.clienteCidade || '',

        veiculoId: veiculoEncontrado ? veiculoEncontrado.value || veiculoEncontrado.id : state.veiculoId || veiculoParam.id || veiculoParam.value || '',
        placa: veiculoEncontrado ? veiculoEncontrado.placa : placaAlvo || veiculoParam.placa || '',
        marcaModelo: veiculoEncontrado
          ? veiculoEncontrado.marcaModelo || `${veiculoEncontrado.marca || ''} ${veiculoEncontrado.modelo || ''}`.trim()
          : state.veiculoModelo || veiculoParam.marcaModelo || `${veiculoParam.marca || ''} ${veiculoParam.modelo || ''}`.trim(),
        ano: veiculoEncontrado ? veiculoEncontrado.ano : veiculoParam.ano || '',
        cor: veiculoEncontrado ? veiculoEncontrado.cor : veiculoParam.cor || '',
        km: veiculoEncontrado ? veiculoEncontrado.kmPadrao || veiculoEncontrado.kmAtual || '' : veiculoParam.kmPadrao || veiculoParam.kmAtual || '',

        tipoAtendimento: state.tipoAtendimento || (itens.length > 0 ? 'preventiva' : 'orcamento'),
        relatoCliente: relatoTexto,
        filaEsperaId: state.filaEsperaId || '',
        mecanicoId: state.mecanicoPreferencialId || '',
      }

  return { patch, ehOsExistente }
}
