import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { STATUS_ORCAMENTO } from '../pages/dashboard/orcamento/mockOrdensAbertas'
import { podeTransicionarPara, motivoBloqueioTransicao } from '../pages/dashboard/orcamento/statusTransicao'
import { carregarAssinaturaVistoria } from '../constants/checklistItems'
import { ABA_ESTAGIO_POR_STATUS } from '../components/ordem-servico/painel/painelOSConfig'
import { linkAprovacaoCliente, urlWhatsApp, mensagemOrcamentoPronto } from '../utils/ordemServico/osMensagens'

const ABAS_FIXAS = ['resumo', 'itens', 'vistoria']

/**
 * Estado do painel de detalhes da OS (Story 2.0 / ADR-003): aba ativa por etapa,
 * troca de status com as regras de transição, compartilhamento com o cliente,
 * aprovação rápida e exclusão com confirmação. Fecha com a tecla Escape.
 *
 * @param {{os: object|null, initialSubTab: string|null, onClose: Function,
 *   onAtualizarStatus: Function, onExcluir: Function}} params
 * @returns {object}
 */
export function usePainelDetalhesOS({ os, initialSubTab, onClose, onAtualizarStatus, onExcluir }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'resumo')
  const [copiado, setCopiado] = useState(false)
  const [confirmandoAprovarRapido, setConfirmandoAprovarRapido] = useState(false)
  const [confirmandoExclusaoOS, setConfirmandoExclusaoOS] = useState(false)
  const assinaturaVistoria = useMemo(() => carregarAssinaturaVistoria(os?.numeroOS), [os?.numeroOS, os?.checklistEntrada])

  const abaEstagio = os ? ABA_ESTAGIO_POR_STATUS[os.status] : null
  const abasVisiveis = useMemo(() => (abaEstagio ? [...ABAS_FIXAS, abaEstagio] : ABAS_FIXAS), [abaEstagio])

  // O atalho do Kanban pode pedir uma aba-alvo; se a aba ativa deixou de existir para o
  // status atual (ex.: a OS acabou de ser aprovada), volta para o Resumo.
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab)
      return
    }
    setActiveSubTab((atual) => (abasVisiveis.includes(atual) ? atual : 'resumo'))
  }, [initialSubTab, os?.numeroOS, os?.status, abasVisiveis])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!os) return { os: null }

  const statusAtual = STATUS_ORCAMENTO.find((s) => s.value === os.status) || STATUS_ORCAMENTO[1]
  const linkCliente = linkAprovacaoCliente(os.numeroOS)

  const copiarLink = () => {
    navigator.clipboard.writeText(linkCliente)
    setCopiado(true)
    toast.success(`Link de aprovação da OS #${os.numeroOS} copiado para a área de transferência!`)
    setTimeout(() => setCopiado(false), 2500)
  }

  const enviarWhatsapp = () => {
    window.open(urlWhatsApp(os.telefone, mensagemOrcamentoPronto(os, linkCliente)), '_blank')
    toast.success('Disparo de orçamento via WhatsApp preparado!')
  }

  const alterarStatus = (opt) => {
    if (!opt || opt.value === os.status) return
    if (!podeTransicionarPara(os.status, opt.value)) {
      toast.warning('Só é possível mover a OS para a etapa anterior ou a etapa seguinte, sem pular colunas.')
      return
    }
    const motivo = motivoBloqueioTransicao(os, opt.value)
    if (motivo) {
      toast.warning(motivo)
      return
    }
    onAtualizarStatus(os.numeroOS, opt.value)
    toast.success(`Status da OS #${os.numeroOS} alterado para "${opt.label}"!`)
  }

  const confirmarAprovacaoRapida = () => {
    onAtualizarStatus(os.numeroOS, 'aprovado_execucao')
    toast.success(`Orçamento #${os.numeroOS} aprovado! Status atualizado para Aprovado e Em Execução.`)
    setConfirmandoAprovarRapido(false)
  }

  const confirmarExclusaoOS = () => {
    onExcluir(os.numeroOS)
    toast.success(`OS #${os.numeroOS} cancelada e removida com sucesso.`)
    setConfirmandoExclusaoOS(false)
  }

  return {
    os,
    statusAtual,
    linkCliente,
    activeSubTab,
    setActiveSubTab,
    assinaturaVistoria,
    copiado,
    copiarLink,
    enviarWhatsapp,
    alterarStatus,
    confirmacoes: {
      confirmandoAprovarRapido,
      pedirAprovacaoRapida: () => setConfirmandoAprovarRapido(true),
      cancelarAprovacaoRapida: () => setConfirmandoAprovarRapido(false),
      confirmarAprovacaoRapida,
      confirmandoExclusaoOS,
      pedirExclusao: () => setConfirmandoExclusaoOS(true),
      cancelarExclusao: () => setConfirmandoExclusaoOS(false),
      confirmarExclusaoOS,
    },
  }
}
