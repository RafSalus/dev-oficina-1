/**
 * Formatação e mensagens de WhatsApp das Ordens de Serviço (Story 2.0 / ADR-003).
 * Funções puras compartilhadas pela lista de OS e pelo painel de detalhes.
 */

/**
 * Valor em reais no padrão brasileiro, sem o símbolo ("1.234,50").
 * @param {number|string} val
 * @returns {string}
 */
export function formatMoeda(val) {
  const n = parseFloat(val) || 0
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Link público de aprovação do orçamento pelo cliente.
 * @param {string} numeroOS
 * @param {string} [origem=window.location.origin]
 * @returns {string}
 */
export function linkAprovacaoCliente(numeroOS, origem = window.location.origin) {
  return `${origem}/aprovacao/${numeroOS}`
}

/**
 * URL do WhatsApp (api.whatsapp.com) com a mensagem codificada. Sem telefone,
 * abre a escolha de contato.
 * @param {string} telefone - Telefone em qualquer formato (DDD + número).
 * @param {string} msg - Mensagem em texto puro.
 * @returns {string}
 */
export function urlWhatsApp(telefone, msg) {
  const foneLimpo = String(telefone || '').replace(/\D/g, '')
  return foneLimpo
    ? `https://api.whatsapp.com/send?phone=55${foneLimpo}&text=${encodeURIComponent(msg)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
}

/**
 * Mensagem de orçamento disponível, disparada pela lista de OS.
 * @param {object} os
 * @param {string} link - Link de aprovação.
 * @returns {string}
 */
export function mensagemOrcamentoDisponivel(os, link) {
  return `Olá, *${os.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nO orçamento da sua *${os.marcaModelo || 'veículo'}* (Placa: *${os.placa || '—'}*) referente à OS *#${os.numeroOS}* está disponível.\n\nValor Total: *R$ ${Number(os.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\nAcesse o link seguro para visualizar as peças, serviços e autorizar o orçamento online:\n👉 ${link}`
}

/**
 * Mensagem de orçamento pronto, disparada pelo painel de detalhes da OS.
 * @param {object} os
 * @param {string} link - Link de aprovação.
 * @returns {string}
 */
export function mensagemOrcamentoPronto(os, link) {
  return `Olá, *${os.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nO orçamento da sua *${os.marcaModelo || 'veículo'}* (Placa: *${os.placa || '—'}*) referente à OS *#${os.numeroOS}* está pronto no valor total de *R$ ${formatMoeda(os.valorTotal)}*.\n\nVocê pode conferir todos os itens, fotos do laudo técnico e autorizar diretamente pelo link seguro abaixo:\n👉 ${link}\n\nFicamos à disposição para qualquer dúvida!`
}

/**
 * Pedido de prazo e valor a um parceiro terceirizado.
 * @param {object} os
 * @param {string} nomeParceiro
 * @param {string} descricao - Serviço a terceirizar.
 * @returns {string}
 */
export function mensagemSolicitacaoParceiro(os, nomeParceiro, descricao) {
  return `Olá, *${nomeParceiro}*! Aqui é da *Mecânica Gabriel*.\n\nPrecisamos terceirizar um serviço da OS *#${os.numeroOS}* (${os.marcaModelo || 'veículo'} - Placa ${os.placa || '—'}):\n"${descricao || 'Serviço a definir'}"\n\nPode nos passar prazo e valor?`
}

/**
 * Aviso ao cliente de item adicional encontrado durante a execução.
 * @param {object} os
 * @param {string} descricao
 * @param {'seguranca'|'opcional'} classificacao
 * @param {string} link - Link de aprovação.
 * @returns {string}
 */
export function mensagemItemAdicional(os, descricao, classificacao, link) {
  const seguranca = classificacao === 'seguranca'
  return `Olá, *${os.cliente}*! Aqui é da *Mecânica Gabriel*.\n\nDurante a execução da OS *#${os.numeroOS}* (${os.marcaModelo || 'veículo'}), identificamos um item adicional de *${seguranca ? 'segurança' : 'melhoria'}*:\n"${descricao}"\n\nSua aprovação é necessária para ${seguranca ? 'continuarmos com segurança' : 'incluirmos este item'}. Confira e responda pelo link:\n👉 ${link}`
}
