/**
 * Funções puras do fluxo de aprovação de orçamento pelo cliente (Story 2.0 / ADR-003):
 * normalização dos itens aprováveis, totais, galeria de fotos, laudo e mensagens de WhatsApp.
 */
import { gerarLaudoTecnico } from '../../constants/catalogoPecasServicos'

/**
 * Diferenças de comportamento entre a página pública (/aprovacao/:id) e o Portal do Cliente
 * (/cliente/servicos), preservadas da implementação original de cada tela.
 */
export const COMPORTAMENTO_POR_ORIGEM = {
  publica: {
    usarOSDoClienteLogado: false,
    avisarAlteracaoItem: false,
    mensagemAprovado: 'Orçamento aprovado com sucesso! A oficina já foi notificada.',
  },
  portal: {
    usarOSDoClienteLogado: true,
    avisarAlteracaoItem: true,
    mensagemAprovado: 'Orçamento aprovado com sucesso! A oficina já foi notificada para iniciar os serviços.',
  },
}

/** WhatsApp da oficina que recebe confirmações e dúvidas do cliente. */
export const WHATSAPP_OFICINA = '5543998544106'

/**
 * Mapa `itemId -> metadados` (classificação, motivo e resposta) salvos na OS.
 * @param {Array<object>} [itensAprovacaoOS]
 * @returns {Map<string, object>}
 */
export function mapearMetadataPorItem(itensAprovacaoOS) {
  return new Map((itensAprovacaoOS || []).map((it) => [it.itemId, it]))
}

/**
 * Lista normalizada de peças, serviços e terceiros que o cliente pode aprovar.
 * Itens sem classificação salva são tratados como essenciais.
 * @param {object} dadosOS
 * @param {Map<string, object>} metadataPorItem
 * @returns {Array<object>}
 */
export function normalizarItensAprovaveis(dadosOS, metadataPorItem) {
  const montar = (lista, categoria, precoField) =>
    (lista || []).map((item, idx) => {
      const itemId = item.id || item.codigo || `${categoria}-${idx}`
      const meta = metadataPorItem.get(itemId)
      const preco = parseFloat(item[precoField] ?? item.precoUnitario) || 0
      const qtd = parseFloat(item.quantidade) || 1
      const desconto = parseFloat(item.desconto) || 0
      return {
        itemId,
        categoria,
        nome: item.nome,
        codigo: item.codigo,
        quantidade: qtd,
        precoUnitario: preco,
        subtotal: Math.max(0, preco * qtd - desconto),
        foto: item.fotoUrl || item.foto || null,
        motivo: meta?.motivo || item.motivoSeguranca || item.motivoOpcional || item.observacaoFoto || '',
        classificacao: meta?.classificacao || 'essencial',
        parceiroNome: item.parceiroNome,
      }
    })

  const terceirosNormalizados = (dadosOS.terceirosOS || []).map((t) => ({
    ...t,
    precoUnitario: t.valorVenda ?? t.precoFinal ?? t.precoUnitario,
  }))

  return [
    ...montar(dadosOS.pecasOS, 'peca', 'precoUnitario'),
    ...montar(dadosOS.servicosOS, 'servico', 'valorUnitario'),
    ...montar(terceirosNormalizados, 'terceiro', 'precoUnitario'),
  ]
}

/**
 * Respostas iniciais do cliente: recusado só quando já foi recusado antes.
 * @param {Array<object>} itens
 * @param {Map<string, object>} metadataPorItem
 * @returns {Object<string, 'aprovado'|'recusado'>}
 */
export function respostasIniciais(itens, metadataPorItem) {
  return Object.fromEntries(
    itens.map((item) => [
      item.itemId,
      metadataPorItem.get(item.itemId)?.respostaCliente === 'recusado' ? 'recusado' : 'aprovado',
    ])
  )
}

/**
 * Totais do orçamento considerando apenas os itens não recusados.
 * @param {Array<object>} itens
 * @param {Object<string, string>} respostas
 * @param {number|string} descontoGeralOS
 * @returns {object}
 */
export function calcularTotaisAprovacao(itens, respostas, descontoGeralOS) {
  const somaPorCategoria = (categoria) =>
    itens
      .filter((it) => it.categoria === categoria && respostas[it.itemId] !== 'recusado')
      .reduce((acc, it) => acc + it.subtotal, 0)

  const subTotalPecas = somaPorCategoria('peca')
  const subTotalServicos = somaPorCategoria('servico')
  const subTotalTerceiros = somaPorCategoria('terceiro')
  const descGeral = parseFloat(descontoGeralOS) || 0
  const totalGeral = Math.max(0, subTotalPecas + subTotalServicos + subTotalTerceiros - descGeral)

  return {
    subTotalPecas,
    subTotalServicos,
    subTotalTerceiros,
    descGeral,
    totalGeral,
    valorPixComDesconto: totalGeral * 0.95,
    valorParcelado10x: (totalGeral / 10).toFixed(2),
  }
}

/**
 * Galeria de evidências: fotos do diagnóstico, das peças e dos serviços de terceiros.
 * @param {object} dadosOS
 * @returns {Array<{id: string, nome: string, fotoUrl: string, observacao: string}>}
 */
export function listarFotosDasPecas(dadosOS) {
  const comFoto = (lista, montar) => (lista || []).filter((p) => p.fotoUrl).map(montar)
  return [
    ...comFoto(dadosOS.pecasDiagnostico, (p) => ({
      id: p.id || p.nome,
      nome: p.nome,
      fotoUrl: p.fotoUrl,
      observacao: p.observacao || 'Registro fotográfico feito durante o diagnóstico técnico.',
    })),
    ...comFoto(dadosOS.pecasOS, (p) => ({
      id: p.codigo || p.id,
      nome: p.nome,
      fotoUrl: p.fotoUrl,
      observacao: p.observacaoFoto || p.observacoes || 'Registro de avaria e desgaste físico.',
    })),
    ...comFoto(dadosOS.terceirosOS, (t) => ({
      id: t.codigo || t.id,
      nome: t.nome,
      fotoUrl: t.fotoUrl,
      observacao: t.observacoes || 'Necessidade de intervenção e reparo externo.',
    })),
  ]
}

/**
 * Laudo técnico homologado da OS.
 * @param {object} dadosOS
 * @param {string} [nomeClienteAtivo] - Usado quando a OS não tem o nome do cliente.
 * @returns {string}
 */
export function montarLaudoOficial(dadosOS, nomeClienteAtivo = '') {
  return gerarLaudoTecnico({
    cliente: dadosOS.cliente || nomeClienteAtivo || '',
    placa: dadosOS.placa || '',
    marcaModelo: dadosOS.marcaModelo || '',
    km: dadosOS.km || '',
    relatoCliente: dadosOS.relatoCliente || '',
    mecanicoNome: dadosOS.mecanicoNome || '',
    pecas: (dadosOS.pecasOS || []).map((p) => ({
      nome: `${p.nome} (Cód: ${p.codigo || 'N/D'})`,
      quantidade: p.quantidade,
      fotoUrl: p.fotoUrl,
      observacao: p.motivoSeguranca || p.observacaoFoto || '',
    })),
    servicos: (dadosOS.servicosOS || []).map((s) => ({
      nome: s.nome,
      observacao: `Tempo: ${s.tempoEstimado || s.tempoHoras || '1h'} • Cód: ${s.codigo || 'N/D'}`,
    })),
  })
}

const descreverVeiculo = (dadosOS) => `${dadosOS.marcaModelo || 'Veículo'} (Placa ${dadosOS.placa || 'Sem placa'})`

/**
 * Link de WhatsApp confirmando a aprovação do orçamento para a oficina.
 * @param {object} dadosOS
 * @param {{nomeResponsavel: string, formaPagamento: string, totalGeral: number}} aprovacao
 * @returns {string}
 */
export function linkConfirmacaoAprovacao(dadosOS, { nomeResponsavel, formaPagamento, totalGeral }) {
  const nomeFinal = nomeResponsavel || dadosOS.cliente || 'Cliente Titular'
  const condicao = formaPagamento === 'pix' ? 'À vista no PIX (com 5% de desconto)' : 'Cartão de Crédito'
  const msg = `Olá, equipe da *Mecânica Gabriel*! 👋%0A%0AConfirmo a *APROVAÇÃO DO ORÇAMENTO*:%0A📄 *Orçamento:* #${dadosOS.numeroOS}%0A🚗 *Veículo:* ${descreverVeiculo(dadosOS)}%0A👤 *Autorizado por:* ${nomeFinal}%0A💰 *Valor Total:* R$ ${totalGeral.toFixed(2)}%0A💳 *Condição:* ${condicao}%0A%0APodem iniciar os serviços conforme o orçamento aprovado! 👍`
  return `https://wa.me/${WHATSAPP_OFICINA}?text=${msg}`
}

/**
 * Link de WhatsApp para o cliente tirar dúvidas sobre o orçamento.
 * @param {object} dadosOS
 * @returns {string}
 */
export function linkDuvidasOrcamento(dadosOS) {
  const msg = `Olá, equipe da *Mecânica Gabriel*! 👋%0A%0AEstou analisando o *Orçamento #${dadosOS.numeroOS}* do meu veículo *${descreverVeiculo(dadosOS)}* e gostaria de tirar algumas dúvidas antes da aprovação.`
  return `https://wa.me/${WHATSAPP_OFICINA}?text=${msg}`
}
