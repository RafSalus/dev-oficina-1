import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  obterOrdensAbertas,
  obterOrdensFinalizadas,
  atualizarStatusOrdem,
  atualizarChecklistSaida,
  adicionarItemNaOrdem,
  adicionarItemAdicional,
  atualizarFotoPecaOrdem,
  excluirOrdem,
  finalizarEArquivarOrdem,
  reabrirOrdemFinalizada,
  STATUS_ORCAMENTO,
  PRIORIDADE_OPTIONS,
} from '../pages/dashboard/orcamento/mockOrdensAbertas'
import { motivoBloqueioTransicao } from '../pages/dashboard/orcamento/statusTransicao'
import { ITENS_CHECKLIST_SAIDA, checklistCompleto } from '../constants/checklistItems'
import {
  filtrarOrdensAbertas,
  filtrarOrdensFinalizadas,
  calcularMetricasAbertas,
  calcularMetricasFinalizadas,
} from '../utils/ordemServico/osListaCalculos'
import {
  linkAprovacaoCliente,
  urlWhatsApp,
  mensagemOrcamentoDisponivel,
} from '../utils/ordemServico/osMensagens'

const STORAGE_KEY_VISUALIZACAO_OS = 'dev_oficina_os_visualizacao'
const mesmaOS = (a, b) => Boolean(a && b) && String(a.numeroOS ?? a) === String(b.numeroOS ?? b)

/**
 * Workflow da lista de Ordens de Serviço (Story 2.0 / ADR-003, NFR18): abas Abertas/Arquivos,
 * visualização lista ou Kanban, filtros, métricas, painel de detalhes, modal de abertura/edição,
 * portão de faturamento (checklist de saída + PDV) e compartilhamento com o cliente.
 * Compartilhado pelas versões desktop e mobile.
 *
 * @returns {object} Listas, filtros, métricas, `selecao`, `modais` e `acoes`.
 */
export function useOrdensServicoLista() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const [abaAtiva, setAbaAtiva] = useState('abertas')
  const [visualizacao, setVisualizacao] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_VISUALIZACAO_OS) === 'kanban' ? 'kanban' : 'lista'
    } catch {
      return 'lista'
    }
  })

  const [ordensAbertas, setOrdensAbertas] = useState(() => obterOrdensAbertas())
  const [ordensFinalizadas, setOrdensFinalizadas] = useState(() => obterOrdensFinalizadas())

  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState(STATUS_ORCAMENTO[0])
  const [filtroPrioridade, setFiltroPrioridade] = useState(PRIORIDADE_OPTIONS[0])

  const [ordemSelecionada, setOrdemSelecionada] = useState(null)
  // Sub-aba a abrir de cara no painel (atalho do Kanban para o lançamento de terceiros)
  const [subAbaAlvoPainel, setSubAbaAlvoPainel] = useState(null)
  const [osParaImpressao, setOsParaImpressao] = useState(null)
  const [modalImpressaoAberta, setModalImpressaoAberta] = useState(false)
  const [osParaChecklistSaida, setOsParaChecklistSaida] = useState(null)
  const [modalNovaOsAberto, setModalNovaOsAberto] = useState(false)
  const [dadosNovaOsPreenchidos, setDadosNovaOsPreenchidos] = useState(null)

  // Chegou pelo botão "Abrir OS" da Fila de Atendimento (Agenda): abre o modal preenchido
  useEffect(() => {
    if (location.state?.filaEsperaId || location.state?.veiculoPlaca || location.state?.clienteNome) {
      setDadosNovaOsPreenchidos(location.state)
      setModalNovaOsAberto(true)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.state])

  const abertasFiltradas = useMemo(
    () => filtrarOrdensAbertas(ordensAbertas, { busca, status: filtroStatus.value, prioridade: filtroPrioridade.value }),
    [ordensAbertas, busca, filtroStatus, filtroPrioridade]
  )
  const finalizadasFiltradas = useMemo(() => filtrarOrdensFinalizadas(ordensFinalizadas, busca), [ordensFinalizadas, busca])
  const metricasAbertas = useMemo(() => calcularMetricasAbertas(ordensAbertas), [ordensAbertas])
  const metricasFinalizadas = useMemo(() => calcularMetricasFinalizadas(ordensFinalizadas), [ordensFinalizadas])

  /** Relê as duas listas e atualiza a OS aberta no painel (ou fecha se ela sumiu da aba). */
  const recarregarListas = () => {
    const abertas = obterOrdensAbertas()
    const finalizadas = obterOrdensFinalizadas()
    setOrdensAbertas(abertas)
    setOrdensFinalizadas(finalizadas)
    if (ordemSelecionada) {
      const listaAtual = abaAtiva === 'abertas' ? abertas : finalizadas
      setOrdemSelecionada(listaAtual.find((item) => mesmaOS(item, ordemSelecionada)) || null)
    }
  }

  /** Executa uma mutação no repositório e recarrega as listas se ela devolveu a OS. */
  const aplicar = (mutacao) => (...args) => {
    const resultado = mutacao(...args)
    if (resultado) recarregarListas()
    return resultado
  }

  const desselecionarSeFor = (numeroOS) => {
    if (mesmaOS(ordemSelecionada, numeroOS)) setOrdemSelecionada(null)
  }

  const alternarSelecao = (os) => setOrdemSelecionada((prev) => (prev?.numeroOS === os.numeroOS ? null : os))

  const trocarAba = (aba) => {
    setAbaAtiva(aba)
    setOrdemSelecionada(null)
  }

  const alternarVisualizacao = (modo) => {
    setVisualizacao(modo)
    // No Kanban o status já é representado pelas colunas: evita um filtro escondido ativo
    if (modo === 'kanban') setFiltroStatus(STATUS_ORCAMENTO[0])
    try {
      localStorage.setItem(STORAGE_KEY_VISUALIZACAO_OS, modo)
    } catch {}
  }

  const limparFiltros = () => {
    setBusca('')
    setFiltroStatus(STATUS_ORCAMENTO[0])
    setFiltroPrioridade(PRIORIDADE_OPTIONS[0])
  }

  const abrirCotacao = (os) => navigate(`${basePath}/compras/cotacao?os=${os.numeroOS}`)
  const navegarParaPDV = (os) => navigate(`${basePath}/pdv?os=${os.numeroOS}`)

  // Ponto único de faturamento: exige o Checklist de Saída preenchido antes do PDV
  const faturarNoPDV = (os) => {
    if (!checklistCompleto(os.checklistSaida, ITENS_CHECKLIST_SAIDA)) {
      setOsParaChecklistSaida(os)
      return
    }
    navegarParaPDV(os)
  }

  const confirmarChecklistSaida = ({ checklistSaida, checklistSaidaObs, kmSaida }) => {
    const os = osParaChecklistSaida
    if (!os) return
    const atualizada = atualizarChecklistSaida(os.numeroOS, { checklistSaida, checklistSaidaObs, kmSaida })
    recarregarListas()
    setOsParaChecklistSaida(null)
    if (atualizada) {
      toast.success('Checklist de saída registrado. Redirecionando para o PDV...')
      navegarParaPDV(atualizada)
    }
  }

  // Atalhos do Kanban: Cotação vai para a tela de cotação; Terceirizado abre o painel na aba
  const abrirEdicaoRapida = (os, aba) => {
    if (aba === 'pecas') {
      abrirCotacao(os)
      return
    }
    setOrdemSelecionada(os)
    setSubAbaAlvoPainel('terceirizado')
  }

  // A coluna "Finalizar" não arquiva direto: passa pelo mesmo portão de faturamento
  const moverStatusKanban = (numeroOS, novoStatus) => {
    const osAtual = ordensAbertas.find((o) => mesmaOS(o, numeroOS))
    const motivo = motivoBloqueioTransicao(osAtual, novoStatus)
    if (motivo) {
      toast.warning(motivo)
      return
    }
    const atualizada = aplicar(atualizarStatusOrdem)(numeroOS, novoStatus)
    if (atualizada && novoStatus === 'pronto_retirada') {
      toast.success(`OS #${numeroOS} pronta para retirada.`)
      faturarNoPDV(atualizada)
    }
  }

  const finalizarEArquivar = (numeroOS) => {
    if (!finalizarEArquivarOrdem(numeroOS)) return
    recarregarListas()
    desselecionarSeFor(numeroOS)
    toast.success(`Ordem de Serviço #${numeroOS} finalizada com sucesso e movida para os Arquivos!`)
  }

  const reabrirOrdem = (numeroOS) => {
    if (!reabrirOrdemFinalizada(numeroOS)) return
    recarregarListas()
    desselecionarSeFor(numeroOS)
    toast.success(`Ordem de Serviço #${numeroOS} reaberta e movida de volta para as OS Abertas!`)
  }

  const excluir = (numeroOS) => {
    setOrdensAbertas(excluirOrdem(numeroOS))
    desselecionarSeFor(numeroOS)
  }

  const abrirImpressao = (os) => {
    setOsParaImpressao(os)
    setModalImpressaoAberta(true)
  }

  const copiarLink = (os, e) => {
    e?.stopPropagation()
    navigator.clipboard.writeText(linkAprovacaoCliente(os.numeroOS))
    toast.success(`Link de aprovação da OS #${os.numeroOS} copiado com sucesso!`)
  }

  const dispararWhatsApp = (os, e) => {
    e?.stopPropagation()
    window.open(urlWhatsApp(os.telefone, mensagemOrcamentoDisponivel(os, linkAprovacaoCliente(os.numeroOS))), '_blank')
    toast.success('Disparo de orçamento via WhatsApp preparado!')
  }

  const abrirNovaOS = () => {
    try {
      localStorage.removeItem('dev_oficina_draft_os')
    } catch {}
    setDadosNovaOsPreenchidos(null)
    setModalNovaOsAberto(true)
  }

  const editarOS = (os) => {
    setDadosNovaOsPreenchidos(os)
    setModalNovaOsAberto(true)
  }

  return {
    abaAtiva,
    visualizacao,
    ordensAbertas,
    ordensFinalizadas,
    abertasFiltradas,
    finalizadasFiltradas,
    metricasAbertas,
    metricasFinalizadas,
    filtros: { busca, setBusca, filtroStatus, setFiltroStatus, filtroPrioridade, setFiltroPrioridade, limparFiltros },
    selecao: { ordemSelecionada, subAbaAlvoPainel, alternarSelecao },
    modais: {
      modalImpressaoAberta,
      osParaImpressao,
      fecharImpressao: () => setModalImpressaoAberta(false),
      osParaChecklistSaida,
      fecharChecklistSaida: () => setOsParaChecklistSaida(null),
      modalNovaOsAberto,
      dadosNovaOsPreenchidos,
      fecharNovaOS: () => {
        setModalNovaOsAberto(false)
        setDadosNovaOsPreenchidos(null)
      },
    },
    acoes: {
      trocarAba,
      alternarVisualizacao,
      recarregarListas,
      fecharPainel: () => {
        setOrdemSelecionada(null)
        setSubAbaAlvoPainel(null)
      },
      atualizarStatus: aplicar(atualizarStatusOrdem),
      adicionarItem: aplicar(adicionarItemNaOrdem),
      reportarItemAdicional: aplicar(adicionarItemAdicional),
      atualizarFotoPeca: aplicar(atualizarFotoPecaOrdem),
      abrirCotacao,
      abrirEdicaoRapida,
      faturarNoPDV,
      confirmarChecklistSaida,
      moverStatusKanban,
      finalizarEArquivar,
      reabrirOrdem,
      excluir,
      abrirImpressao,
      copiarLink,
      dispararWhatsApp,
      abrirNovaOS,
      editarOS,
    },
  }
}
