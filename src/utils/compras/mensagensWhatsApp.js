/**
 * Geradores puros dos textos de WhatsApp do módulo de Compras e Cotações
 * (Story 2.0 / ADR-003). Recebem os dados e devolvem a string pronta.
 */

/**
 * URL pública da cotação que a autopeça preenche.
 * @param {string} cotacaoId
 * @param {string} [origem=window.location.origin]
 * @returns {string}
 */
export function urlPublicaCotacao(cotacaoId, origem = window.location.origin) {
  return `${origem}/cotacao/${cotacaoId}`
}

/**
 * Texto do pedido de compra para colar no WhatsApp do fornecedor.
 * @param {object} pedido
 * @returns {string}
 */
export function textoPedidoCompra(pedido) {
  let texto = `*PEDIDO DE COMPRA DE AUTOPEÇAS - MECÂNICA GABRIEL*\n`
  texto += `Pedido: *${pedido.numeroPedido}*\n`
  texto += `Fornecedor: ${pedido.fornecedorNome}\n`
  if (pedido.numeroOS) {
    texto += `Aplicação: OS #${pedido.numeroOS} (${pedido.veiculoModelo || pedido.veiculoPlaca})\n`
  }
  texto += `Data de Emissão: ${new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')}\n`
  if (pedido.previsaoEntrega) {
    texto += `Previsão de Entrega: ${pedido.previsaoEntrega}\n`
  }
  texto += `\n*ITENS SOLICITADOS:*\n`
  pedido.itens.forEach((it, idx) => {
    texto += `${idx + 1}. [${it.codigo || 'SKU'}] ${it.nome} - Qtd: *${it.quantidade} ${it.unidade || 'UN'}*\n`
  })
  texto += `\nValor Total: R$ ${Number(pedido.valorTotal || 0).toFixed(2)}\n`
  texto += `Condição de Pagamento: ${pedido.formaPagamento || 'Boleto'}\n`
  if (pedido.observacoes) {
    texto += `Observações: ${pedido.observacoes}\n`
  }
  return texto
}

/**
 * Resumo da cotação com link público, para envio em massa aos fornecedores.
 * @param {object} cotacao
 * @param {string} url - URL pública da cotação.
 * @returns {string}
 */
export function textoResumoCotacao(cotacao, url) {
  let texto = `*COTAÇÃO DE AUTOPEÇAS - MECÂNICA GABRIEL*\n`
  texto += `Cotação: *#${cotacao.id}*\n`
  if (cotacao.veiculoPlaca || cotacao.veiculoModelo) {
    texto += `Veículo: ${cotacao.veiculoModelo || ''} (Placa: *${cotacao.veiculoPlaca}*)\n`
  }
  if (cotacao.numeroOS) {
    texto += `Aplicação: Ordem de Serviço #${cotacao.numeroOS}\n`
  }
  texto += `\n*Peças Solicitadas:*\n`
  ;(cotacao.itens || []).forEach((it, idx) => {
    texto += `${idx + 1}. [${it.codigo || 'SKU'}] ${it.nome} - Qtd: ${it.quantidade} ${it.unidade}`
    if (it.marcaSugerida) texto += ` (${it.marcaSugerida})`
    texto += `\n`
  })
  texto += `\n🔗 *Acesse e preencha seus preços no portal:*\n${url}`
  return texto
}

/**
 * Mensagem personalizada para um fornecedor, copiada para a área de transferência.
 * @param {object} fornecedor - Fornecedor cotado.
 * @param {object} cotacao - Dados da cotação (veículo, OS e itens).
 * @param {string} url - URL pública da cotação.
 * @returns {string}
 */
export function textoCotacaoParaFornecedor(fornecedor, cotacao, url) {
  const { veiculoPlaca, veiculoModelo, ano, km, numeroOS, itens } = cotacao
  let texto = `*COTAÇÃO DE AUTOPEÇAS - MECÂNICA GABRIEL*\n`
  texto += `Olá *${fornecedor.nome}*, precisamos cotar as seguintes peças:\n\n`
  if (veiculoPlaca || veiculoModelo) {
    texto += `🚗 *Veículo:* ${veiculoModelo || 'Veículo'} (Placa: *${veiculoPlaca}*)\n`
    if (ano) texto += `Ano: ${ano} • KM: ${km || 'Não informado'}\n`
  }
  if (numeroOS) {
    texto += `Aplicação: OS #${numeroOS}\n`
  }
  texto += `\n*ITENS SOLICITADOS (${itens.length} itens):*\n`
  itens.forEach((it, idx) => {
    texto += `${idx + 1}. [${it.codigo || 'SKU'}] *${it.nome}* - Qtd: *${it.quantidade} ${it.unidade}*`
    if (it.marcaSugerida) texto += ` (Marca sugerida: ${it.marcaSugerida})`
    if (it.observacoes) texto += ` - Obs: ${it.observacoes}`
    texto += `\n`
  })
  texto += `\n🔗 *Acesse e informe seus preços em 1 clique:*\n${url}\n\n`
  texto += `Agradecemos a parceria!`
  return texto
}

/**
 * Link wa.me com a lista de peças já no parâmetro `text` (quebras como %0A).
 * @param {string} telefoneLimpo - Telefone somente com dígitos (sem DDI).
 * @param {object} fornecedor - Fornecedor cotado.
 * @param {object} cotacao - Dados da cotação (veículo, OS e itens).
 * @param {string} url - URL pública da cotação.
 * @returns {string}
 */
export function linkWhatsAppCotacao(telefoneLimpo, fornecedor, cotacao, url) {
  const { veiculoPlaca, veiculoModelo, numeroOS, itens } = cotacao
  let msg = `Olá *${fornecedor.nome}*, segue lista de cotação de autopeças da *Mecânica Gabriel*:%0A%0A`
  if (veiculoPlaca) msg += `*Veículo:* ${veiculoModelo} (Placa: ${veiculoPlaca})%0A`
  if (numeroOS) msg += `*OS:* #${numeroOS}%0A`
  msg += `%0A*Itens Solicitados:*%0A`
  itens.forEach((it, idx) => {
    msg += `${idx + 1}. *${it.nome}* - ${it.quantidade} ${it.unidade} (Marca: ${it.marcaSugerida || 'Original'})%0A`
  })
  msg += `%0A*Preencha seus valores pelo link rápido:*%0A${url}`
  return telefoneLimpo ? `https://wa.me/55${telefoneLimpo}?text=${msg}` : `https://wa.me/?text=${msg}`
}

/**
 * Copia um texto para a área de transferência e notifica o resultado.
 * @param {string} texto
 * @param {{sucesso: Function, erro: Function}} callbacks
 * @returns {Promise<void>}
 */
export function copiarTexto(texto, { sucesso, erro }) {
  return navigator.clipboard.writeText(texto).then(sucesso).catch(erro)
}
