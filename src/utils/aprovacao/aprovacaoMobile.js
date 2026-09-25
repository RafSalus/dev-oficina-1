/**
 * Adaptador puro do `useAprovacaoOrcamento` para o formato consumido pela versão mobile
 * do Portal do Cliente (`MobileClienteServicosPage`), mantendo um único hook de domínio
 * para desktop e mobile (NFR18).
 */

const CATEGORIAS_MOBILE = { peca: 'pecas', servico: 'servicos', terceiro: 'terceiros' }

/**
 * Item aprovável no formato das seções mobile (`tipo`, `preco`, motivo por classificação).
 * @param {object} item - Item de `normalizarItensAprovaveis()`.
 * @returns {object}
 */
function itemMobile(item) {
  const essencial = item.classificacao === 'essencial'
  return {
    id: item.itemId,
    nome: item.nome,
    codigo: item.codigo,
    marca: item.marca || item.parceiroNome || '',
    quantidade: item.quantidade,
    // Preço líquido por unidade: a tela mobile exibe preco x quantidade, que precisa bater com o subtotal (já com desconto)
    preco: item.quantidade > 0 ? item.subtotal / item.quantidade : item.precoUnitario,
    tipo: essencial ? 'essencial' : 'opcional',
    motivoSeguranca: essencial ? item.motivo : '',
    motivoOpcional: essencial ? '' : item.motivo,
    foto: item.foto,
    fotoLegenda: item.motivo,
    estadoPeca: essencial ? 'Substituição necessária' : 'Recomendado',
  }
}

/**
 * Dados da OS e itens agrupados por categoria, no formato `servico` da tela mobile.
 * @param {object} dadosOS
 * @param {Array<object>} itensAprovaveis
 * @returns {object}
 */
export function montarServicoMobile(dadosOS, itensAprovaveis) {
  const grupos = { pecas: [], servicos: [], terceiros: [] }
  itensAprovaveis.forEach((item) => grupos[CATEGORIAS_MOBILE[item.categoria]]?.push(itemMobile(item)))
  return {
    numeroOS: dadosOS.numeroOS,
    consultor: dadosOS.consultorResponsavel || '',
    mecanico: dadosOS.mecanicoNome || '',
    veiculo: dadosOS.marcaModelo || '',
    placa: dadosOS.placa || '',
    ano: dadosOS.ano || '',
    km: dadosOS.km || '',
    relatoCliente: dadosOS.relatoCliente || '',
    ...grupos,
  }
}

/**
 * Ids dos itens mantidos no orçamento (não recusados pelo cliente).
 * @param {Array<object>} itensAprovaveis
 * @param {Object<string, string>} respostas
 * @returns {Set<string>}
 */
export function itensMarcadosMobile(itensAprovaveis, respostas) {
  return new Set(itensAprovaveis.filter((it) => respostas[it.itemId] !== 'recusado').map((it) => it.itemId))
}

/**
 * Totais no formato mobile (total aprovado, economia, PIX e parcela em 6x).
 * @param {object} totais - Resultado de `calcularTotaisAprovacao()`.
 * @param {Array<object>} itensAprovaveis
 * @returns {object}
 */
export function totaisMobile(totais, itensAprovaveis) {
  const totalOriginal = Math.max(0, itensAprovaveis.reduce((acc, it) => acc + it.subtotal, 0) - totais.descGeral)
  return {
    totalOriginal,
    totalAprovado: totais.totalGeral,
    economia: Math.max(0, totalOriginal - totais.totalGeral),
    pixDesconto: totais.valorPixComDesconto,
    parcelaCartao6x: (totais.totalGeral / 6).toFixed(2),
  }
}
