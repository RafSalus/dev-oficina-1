import { calcularTotalItens, calcularValorTotal, calcularTotalCategoriaComAprovacao } from '../utils/osCalculos'
import { SEED_ORDENS_ABERTAS } from './seeds/seedOrdensAbertas'
import { SEED_ORDENS_FINALIZADAS } from './seeds/seedOrdensFinalizadas'

export { SEED_ORDENS_ABERTAS } from './seeds/seedOrdensAbertas'
export { SEED_ORDENS_FINALIZADAS } from './seeds/seedOrdensFinalizadas'

// Validações de transição de status da máquina de estados da OS (Story 1.11): mantidas
// re-exportadas aqui para que o proxy `mockOrdensAbertas.js` (`export *`) e os mais de 25
// consumidores existentes continuem enxergando a mesma superfície pública sem nenhuma
// mudança de caminho de import.
export {
  motivoImpedimentoDiagnostico,
  podeIniciarDiagnostico,
  motivoImpedimentoAvancoPorItemAdicional,
} from '../utils/osTransicaoValidation'

export const STORAGE_KEY_ORDENS = 'dev_oficina_ordens_servico'
export const STORAGE_KEY_ORCAMENTOS = 'dev_oficina_orcamentos'

// Atenção: 'em_diagnostico' precisa permanecer no índice 1 — várias telas usam
// STATUS_ORCAMENTO[1] como fallback padrão (PainelDetalhesOS, portal do cliente e do mecânico).
// Por isso os status novos do Kanban ('fila' e 'terceirizado') são adicionados no final da lista.
export const STATUS_ORCAMENTO = [
  { value: 'todos', label: 'Todos os Status', color: 'zinc' },
  { value: 'em_diagnostico', label: 'Em Diagnóstico', color: 'slate', badgeBg: 'bg-[#f2f4f7]', badgeText: 'text-[#344054]', border: 'border-[#d0d5dd]' },
  { value: 'aguardando_pecas', label: 'Aguardando Peças', color: 'amber', badgeBg: 'bg-amber-50', badgeText: 'text-amber-800', border: 'border-amber-200' },
  { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação', color: 'sky', badgeBg: 'bg-[#e0f2fe]', badgeText: 'text-[#0369a1]', border: 'border-[#bae6fd]' },
  { value: 'aprovado_execucao', label: 'Aprovado e Em Execução', color: 'navy', badgeBg: 'bg-[#101828]', badgeText: 'text-white', border: 'border-[#101828]' },
  { value: 'pronto_retirada', label: 'Pronto para Retirada', color: 'blue', badgeBg: 'bg-[#0284c7]', badgeText: 'text-white', border: 'border-[#0284c7]' },
  { value: 'fila', label: 'Na Fila', color: 'zinc', badgeBg: 'bg-zinc-100', badgeText: 'text-zinc-700', border: 'border-zinc-200' },
  { value: 'terceirizado', label: 'Terceirizado', color: 'violet', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700', border: 'border-violet-200' },
]

// Status a partir dos quais uma OS pode ser faturada no PDV (orçamento aprovado e execução
// iniciada). Usado como allowlist única em PainelDetalhesOS, OrcamentoOSListPage e PDVPage —
// nunca checar isso como "status !== aguardando_aprovacao", pois libera etapas anteriores demais.
export const STATUS_PERMITE_FATURAMENTO = ['aprovado_execucao', 'pronto_retirada']

export const PRIORIDADE_OPTIONS = [
  { value: 'todas', label: 'Todas as Prioridades' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'retorno', label: 'Retorno e Garantia' },
]

export function obterOrdensAbertas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDENS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => {
          const tTerc = calcularTotalItens(item.terceirosOS, (t) => t.valorVenda || t.precoFinal || t.precoUnitario)
          return {
            ...item,
            totalTerceiros: item.totalTerceiros !== undefined ? item.totalTerceiros : tTerc,
          }
        })
      }
    }
  } catch (e) {
    console.error('Erro ao ler ordens abertas do storage:', e)
  }

  // Inicializa com seed se vazio
  salvarOrdensAbertas(SEED_ORDENS_ABERTAS)
  return SEED_ORDENS_ABERTAS
}

export function salvarOrdensAbertas(lista) {
  try {
    localStorage.setItem(STORAGE_KEY_ORDENS, JSON.stringify(lista))
  } catch (e) {
    console.error('Erro ao salvar ordens abertas:', e)
  }
}

// Autoatribuição do mecânico ("Puxar OS"): só funciona em uma OS que ainda não tem mecânico
// nenhum atribuído — reatribuir uma OS que já está com outro mecânico continua sendo uma ação
// exclusiva da secretária/gestão (seletor de mecânico em OsFormularioAbertura.jsx). É o único
// caminho do sistema em que o próprio mecânico grava mecanicoId/mecanicoNome numa OS.
export function assumirOrdemSemMecanico(numeroOS, mecanicoId, mecanicoNome) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return { erro: 'OS não encontrada.' }

  const os = lista[index]
  if (os.mecanicoId || (os.mecanicoNome && os.mecanicoNome !== 'Não atribuído')) {
    return { erro: `Esta OS já está atribuída a ${os.mecanicoNome}.` }
  }

  lista[index] = { ...os, mecanicoId, mecanicoNome }
  salvarOrdensAbertas(lista)
  return { os: lista[index] }
}

export function atualizarStatusOrdem(numeroOS, novoStatus) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((item) => String(item.numeroOS) === String(numeroOS))
  if (index !== -1) {
    lista[index] = {
      ...lista[index],
      status: novoStatus,
      dataAtualizacao: new Date().toISOString(),
    }
    salvarOrdensAbertas(lista)
    return lista[index]
  }
  return null
}

// Grava o Checklist de Saída (liberação do veículo) na OS. Chamado antes de faturar no PDV.
export function atualizarChecklistSaida(numeroOS, { checklistSaida, checklistSaidaObs, kmSaida }) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((item) => String(item.numeroOS) === String(numeroOS))
  if (index === -1) return null
  lista[index] = {
    ...lista[index],
    checklistSaida,
    checklistSaidaObs,
    kmSaida,
  }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Acrescenta uma peça ou serviço avulso a uma OS já aberta (usado no "inserir rápido" da aba
// Diagnóstico do painel lateral, sem precisar reabrir o wizard inteiro) e recalcula os totais.
export function adicionarItemNaOrdem(numeroOS, tipo, item) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const chave = tipo === 'servico' ? 'servicosOS' : tipo === 'peca' ? 'pecasOS' : tipo === 'terceiro' ? 'terceirosOS' : null
  if (!chave) return null

  const listaAtualizada = [...(os[chave] || []), item]

  const totalPecas = calcularTotalItens(tipo === 'peca' ? listaAtualizada : os.pecasOS, (p) => p.precoUnitario)
  const totalServicos = calcularTotalItens(tipo === 'servico' ? listaAtualizada : os.servicosOS, (s) => s.precoUnitario ?? s.valorUnitario)
  const totalTerceiros = calcularTotalItens(tipo === 'terceiro' ? listaAtualizada : os.terceirosOS, (t) => t.valorVenda ?? t.precoFinal ?? t.precoUnitario)
  const valorTotal = calcularValorTotal({ totalPecas, totalServicos, totalTerceiros }, os.descontoGeralOS ?? os.descontoTotal)

  lista[index] = {
    ...os,
    [chave]: listaAtualizada,
    totalPecas,
    totalServicos,
    totalTerceiros,
    valorTotal,
  }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Fecha o ciclo Cotação → OS: aplica o preço final negociado com o fornecedor vencedor nas
// peças da OS que estavam marcadas "Para Cotação". A CotacaoPage regenera o `id` dos itens a
// cada etapa do fluxo (importação → cotação → pedido de compra), então o casamento com as
// peças da OS é feito por `codigo`, não por `id`. Chamada ao concluir o pedido de compra.
export function atualizarPecasAposCotacao(numeroOS, itensCotados, fornecedorNome) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const porCodigo = new Map((itensCotados || []).map((it) => [String(it.codigo || '').toUpperCase(), it]))

  const pecasAtualizadas = (os.pecasOS || []).map((p) => {
    const cotado = porCodigo.get(String(p.codigo || '').toUpperCase())
    if (!cotado) return p
    return {
      ...p,
      precoUnitario: Number(cotado.precoCusto ?? cotado.valorTotal ?? p.precoUnitario) || p.precoUnitario,
      statusEstoque: 'cotado',
      fornecedorNome: fornecedorNome || cotado.fornecedorNome || p.fornecedorNome,
    }
  })

  const totalPecas = calcularTotalItens(pecasAtualizadas, (p) => p.precoUnitario)
  const valorTotal = calcularValorTotal(
    { totalPecas, totalServicos: Number(os.totalServicos) || 0, totalTerceiros: Number(os.totalTerceiros) || 0 },
    os.descontoGeralOS ?? os.descontoTotal
  )

  lista[index] = { ...os, pecasOS: pecasAtualizadas, totalPecas, valorTotal }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Grava a resposta do cliente por item do orçamento (modelo essencial/opcional — ver
// AprovacaoOrcamentoClientePage.jsx) e recalcula o valorTotal considerando só os itens ainda
// aprovados. Itens opcionais recusados não são removidos de pecasOS/servicosOS/terceirosOS —
// continuam registrados (o que foi oferecido/recusado fica no histórico), só saem do total.
// `itensAprovacaoOS` é `[{ itemId, categoria: 'peca'|'servico'|'terceiro', classificacao, motivo, respostaCliente }]`.
export function registrarAprovacaoItens(numeroOS, itensAprovacaoOS) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const porItem = new Map((itensAprovacaoOS || []).map((it) => [it.itemId, it]))

  const totalPecas = calcularTotalCategoriaComAprovacao(os.pecasOS, {
    resolverPreco: (item) => item.precoUnitario,
    prefixoId: 'peca',
    porItemMap: porItem,
  })
  const totalServicos = calcularTotalCategoriaComAprovacao(os.servicosOS, {
    resolverPreco: (item) => item.valorUnitario ?? item.precoUnitario,
    prefixoId: 'servico',
    porItemMap: porItem,
  })
  const totalTerceiros = calcularTotalCategoriaComAprovacao(os.terceirosOS, {
    resolverPreco: (item) => item.valorVenda ?? item.precoFinal ?? item.precoUnitario,
    resolverId: (item, idx) => item.id || item.codigo || `terceiro-${idx}`,
    porItemMap: porItem,
  })

  const valorTotal = calcularValorTotal({ totalPecas, totalServicos, totalTerceiros }, os.descontoGeralOS ?? os.descontoTotal)

  lista[index] = { ...os, itensAprovacaoOS, totalPecas, totalServicos, totalTerceiros, valorTotal }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Item novo encontrado durante a Execução (peça quebrou, item de segurança precisa trocar
// para continuar com segurança) — modelo separado do orçamento original (itensAprovacaoOS),
// pois representa uma negociação em aberto, não o que já foi fechado com o cliente. Reportado
// pelo mecânico (ou secretaria/gestão), aparece para o cliente na mesma página de aprovação.
export function adicionarItemAdicional(numeroOS, item) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const novoItem = {
    id: `adit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    criadoEm: new Date().toISOString(),
    status: 'pendente_cliente', // 'pendente_cliente' | 'aprovado' | 'recusado'
    resolvidoEm: null,
    ...item,
  }

  lista[index] = { ...os, itensAdicionaisOS: [...(os.itensAdicionaisOS || []), novoItem] }
  salvarOrdensAbertas(lista)
  return lista[index]
}

// Resposta do cliente a um item adicional: 'aprovado' materializa o item nos arrays
// financeiros reais da OS (via adicionarItemNaOrdem, já preparada para peça/serviço/terceiro);
// 'recusado' só marca o status, sem tocar em pecasOS/servicosOS/terceirosOS.
export function responderItemAdicional(numeroOS, itemAdicionalId, resposta) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const itemAdicional = (os.itensAdicionaisOS || []).find((it) => it.id === itemAdicionalId)
  if (!itemAdicional) return null

  const itensAtualizados = (os.itensAdicionaisOS || []).map((it) =>
    it.id === itemAdicionalId ? { ...it, status: resposta, resolvidoEm: new Date().toISOString() } : it
  )
  lista[index] = { ...os, itensAdicionaisOS: itensAtualizados }
  salvarOrdensAbertas(lista)

  if (resposta === 'aprovado') {
    return adicionarItemNaOrdem(numeroOS, itemAdicional.categoria, {
      id: `${itemAdicional.categoria}-${Date.now()}`,
      codigo: 'ADITIVO',
      nome: itemAdicional.descricao,
      unidade: itemAdicional.categoria === 'servico' ? 'MO' : 'UN',
      quantidade: 1,
      precoUnitario: Number(itemAdicional.valorEstimado) || 0,
      valorVenda: Number(itemAdicional.valorEstimado) || 0,
      desconto: 0,
      parceiroNome: itemAdicional.categoria === 'terceiro' ? itemAdicional.parceiroNome || 'A definir' : undefined,
    })
  }

  return lista[index]
}

// Anexa a foto (tirada na hora pela câmera) a uma peça específica já lançada na OS
export function atualizarFotoPecaOrdem(numeroOS, itemId, fotoUrl) {
  const lista = obterOrdensAbertas()
  const index = lista.findIndex((o) => String(o.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const os = lista[index]
  const pecasAtualizadas = (os.pecasOS || []).map((p) => (p.id === itemId ? { ...p, fotoUrl } : p))

  lista[index] = { ...os, pecasOS: pecasAtualizadas }
  salvarOrdensAbertas(lista)
  return lista[index]
}

export function excluirOrdem(numeroOS) {
  const lista = obterOrdensAbertas()
  const filtrada = lista.filter((item) => String(item.numeroOS) !== String(numeroOS))
  salvarOrdensAbertas(filtrada)
  return filtrada
}

export function gerarProximoNumeroOS() {
  const abertas = obterOrdensAbertas()
  let finalizadas = []
  try {
    const rawFin = localStorage.getItem(STORAGE_KEY_FINALIZADAS)
    if (rawFin) {
      finalizadas = JSON.parse(rawFin)
    }
  } catch (e) {}

  const todas = [...(Array.isArray(abertas) ? abertas : []), ...(Array.isArray(finalizadas) ? finalizadas : [])]

  let maxNum = 2913
  todas.forEach((os) => {
    if (os && os.numeroOS) {
      const parsed = parseInt(String(os.numeroOS).replace(/\D/g, ''), 10)
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed
      }
    }
  })

  const proximo = maxNum + 1
  return String(proximo).padStart(6, '0')
}

export function adicionarOuAtualizarOrdem(osData) {
  const lista = obterOrdensAbertas()
  const numeroOS = osData.numeroOS || gerarProximoNumeroOS()
  const index = lista.findIndex((item) => String(item.numeroOS) === String(numeroOS))

  // Calcula totais se não existirem
  const totalPecas = calcularTotalItens(osData.pecasOS, (p) => p.precoUnitario)
  const totalServicos = calcularTotalItens(osData.servicosOS, (s) => s.precoUnitario ?? s.valorUnitario)
  // NOTA: ao contrário dos outros pontos de cálculo deste arquivo, o total de terceiros aqui
  // não multiplica por quantidade nem usa cadeia de fallback de preço (só valorVenda) —
  // inconsistência pré-existente, preservada intencionalmente nesta refatoração (Story 1.11).
  const totalTerceiros = calcularTotalItens(osData.terceirosOS, (t) => t.valorVenda, { comQuantidade: false })
  const descontoTotal = parseFloat(osData.descontoGeralOS) || 0
  const valorTotal = calcularValorTotal({ totalPecas, totalServicos, totalTerceiros }, descontoTotal)

  const registroCompleto = {
    ...osData,
    numeroOS,
    status: osData.status || 'aguardando_aprovacao',
    prioridade: osData.prioridade || 'normal',
    dataEntrada: osData.dataEntrada || new Date().toLocaleDateString('pt-BR'),
    horaEntrada: osData.horaEntrada || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    totalPecas,
    totalServicos,
    totalTerceiros,
    descontoTotal,
    valorTotal,
  }

  if (index !== -1) {
    lista[index] = registroCompleto
  } else {
    lista.unshift(registroCompleto)
  }

  salvarOrdensAbertas(lista)
  return registroCompleto
}

export const salvarOrdemAberta = adicionarOuAtualizarOrdem

export const STORAGE_KEY_FINALIZADAS = 'dev_oficina_ordens_finalizadas'

export function obterOrdensFinalizadas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FINALIZADAS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Erro ao ler ordens finalizadas do storage:', e)
  }

  salvarOrdensFinalizadas(SEED_ORDENS_FINALIZADAS)
  return SEED_ORDENS_FINALIZADAS
}

export function salvarOrdensFinalizadas(lista) {
  try {
    localStorage.setItem(STORAGE_KEY_FINALIZADAS, JSON.stringify(lista))
  } catch (e) {
    console.error('Erro ao salvar ordens finalizadas:', e)
  }
}

export function finalizarEArquivarOrdem(numeroOS, dadosComplementares = {}) {
  const abertas = obterOrdensAbertas()
  const index = abertas.findIndex((item) => String(item.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const osParaFinalizar = abertas[index]

  // Remove de abertas
  abertas.splice(index, 1)
  salvarOrdensAbertas(abertas)

  // Prepara registro finalizado
  const agora = new Date()
  const garantiaData = new Date(agora)
  garantiaData.setDate(garantiaData.getDate() + 90)

  const osFinalizada = {
    ...osParaFinalizar,
    ...dadosComplementares,
    status: 'finalizada',
    dataFinalizacao: dadosComplementares.dataFinalizacao || agora.toLocaleDateString('pt-BR'),
    horaFinalizacao: dadosComplementares.horaFinalizacao || agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    garantiaAte: dadosComplementares.garantiaAte || garantiaData.toLocaleDateString('pt-BR'),
    formaPagamento: dadosComplementares.formaPagamento || 'PIX ou Cartão',
    notaFiscal: dadosComplementares.notaFiscal || `NFS-e #${Math.floor(2800 + Math.random() * 500)}`,
  }

  const finalizadas = obterOrdensFinalizadas()
  finalizadas.unshift(osFinalizada)
  salvarOrdensFinalizadas(finalizadas)

  return osFinalizada
}

export function reabrirOrdemFinalizada(numeroOS) {
  const finalizadas = obterOrdensFinalizadas()
  const index = finalizadas.findIndex((item) => String(item.numeroOS) === String(numeroOS))
  if (index === -1) return null

  const osParaReabrir = finalizadas[index]

  // Remove de finalizadas
  finalizadas.splice(index, 1)
  salvarOrdensFinalizadas(finalizadas)

  // Adiciona de volta em abertas com status pronto_retirada ou aprovado_execucao
  const osReaberta = {
    ...osParaReabrir,
    status: 'aprovado_execucao',
    dataReabertura: new Date().toISOString(),
  }

  const abertas = obterOrdensAbertas()
  abertas.unshift(osReaberta)
  salvarOrdensAbertas(abertas)

  return osReaberta
}
