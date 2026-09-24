/**
 * Leitura da OS e persistência local das aprovações do cliente (Story 2.0 / ADR-003).
 * Camada provisória sobre localStorage até a migração da aprovação pública (Story 2.17).
 */
import { obterOrdensAbertas, obterOrdensFinalizadas } from '../../pages/dashboard/orcamento/mockOrdensAbertas'

const CHAVE_APROVACOES = 'dev_oficina_aprovacoes'

/** Estrutura vazia usada quando nenhuma OS é localizada. */
export const OS_VAZIA = {
  numeroOS: '',
  dataEmissao: '',
  horaEmissao: '',
  consultorResponsavel: '',
  cliente: '',
  documento: '',
  telefone: '',
  placa: '',
  marcaModelo: '',
  ano: '',
  cor: '',
  km: '',
  relatoCliente: '',
  mecanicoNome: '',
  laudoTecnico: '',
  pecasOS: [],
  servicosOS: [],
  terceirosOS: [],
  descontoGeralOS: 0,
}

/**
 * OS alvo da aprovação: a da rota ou, no portal, a OS do cliente aguardando aprovação
 * (senão a primeira aberta).
 * @param {string} [numeroOSParam]
 * @param {string} [clienteId]
 * @returns {string}
 */
export function resolverNumeroOSAlvo(numeroOSParam, clienteId) {
  if (numeroOSParam) return String(numeroOSParam).trim()
  if (!clienteId) return ''
  const doCliente = obterOrdensAbertas().filter((os) => os.clienteId === clienteId)
  if (doCliente.length === 0) return ''
  const aguardando = doCliente.find((os) => os.status === 'aguardando_aprovacao')
  return String((aguardando || doCliente[0]).numeroOS)
}

/**
 * Localiza a OS entre abertas, finalizadas, orçamentos salvos ou rascunho.
 * @param {string} numeroOS
 * @returns {object}
 */
export function carregarDadosOS(numeroOS) {
  if (!numeroOS) return OS_VAZIA

  try {
    const ordemReal =
      obterOrdensAbertas().find((o) => String(o.numeroOS) === String(numeroOS)) ||
      obterOrdensFinalizadas().find((o) => String(o.numeroOS) === String(numeroOS))
    if (ordemReal) return ordemReal

    const orcamentosRaw = localStorage.getItem('dev_oficina_orcamentos')
    if (orcamentosRaw) {
      const orcamentos = JSON.parse(orcamentosRaw)
      if (orcamentos[numeroOS]) return orcamentos[numeroOS]
    }

    const draftRaw = localStorage.getItem('dev_oficina_draft_os')
    if (draftRaw) {
      const draft = JSON.parse(draftRaw)
      if (draft.cliente || draft.pecasOS?.length || draft.servicosOS?.length) {
        return { ...draft, numeroOS }
      }
    }
  } catch (e) {
    console.error('[aprovacaoStorage] Erro ao carregar dados da OS:', e)
  }

  return { ...OS_VAZIA, numeroOS }
}

/**
 * Aprovação já registrada para a OS, se houver.
 * @param {string} numeroOS
 * @returns {{dataHora: string, responsavel: string, formaPagamento: string}|null}
 */
export function lerAprovacaoSalva(numeroOS) {
  try {
    const aprovacoes = JSON.parse(localStorage.getItem(CHAVE_APROVACOES) || '{}')
    return aprovacoes[numeroOS] || null
  } catch (e) {
    console.error('[aprovacaoStorage] Erro ao checar status de aprovação:', e)
    return null
  }
}

/**
 * Grava o registro de aprovação da OS.
 * @param {object} registro - Precisa conter `numeroOS`.
 */
export function salvarAprovacao(registro) {
  try {
    const aprovacoes = JSON.parse(localStorage.getItem(CHAVE_APROVACOES) || '{}')
    aprovacoes[registro.numeroOS] = registro
    localStorage.setItem(CHAVE_APROVACOES, JSON.stringify(aprovacoes))
  } catch (err) {
    console.error('[aprovacaoStorage] Erro ao salvar aprovação:', err)
  }
}

/**
 * Data e hora da aprovação no formato exibido ao cliente ("24/09/2026 às 19:40").
 * @param {Date} [agora]
 * @returns {string}
 */
export function formatarDataHoraAprovacao(agora = new Date()) {
  return `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}
