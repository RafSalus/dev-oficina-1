/**
 * Hook de domínio unificado para o fluxo de aprovação de orçamento do cliente (NFR18 / ADR-003).
 * Orquestra a OS alvo, as respostas do cliente por item (essencial vs. opcional), os totais em
 * tempo real e a persistência da decisão. Cálculos puros vivem em `utils/aprovacao/`.
 * Compartilhado pelo portal autenticado (/cliente/servicos) e pelo link público (/aprovacao/:id).
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { useCliente } from '../context/ClienteContext'
import {
  atualizarStatusOrdem,
  registrarAprovacaoItens,
  responderItemAdicional,
} from '../pages/dashboard/orcamento/mockOrdensAbertas'
import {
  resolverNumeroOSAlvo,
  carregarDadosOS,
  lerAprovacaoSalva,
  salvarAprovacao,
  formatarDataHoraAprovacao,
} from '../utils/aprovacao/aprovacaoStorage'
import {
  mapearMetadataPorItem,
  normalizarItensAprovaveis,
  respostasIniciais,
  calcularTotaisAprovacao,
  listarFotosDasPecas,
  montarLaudoOficial,
  linkConfirmacaoAprovacao,
  linkDuvidasOrcamento,
} from '../utils/aprovacao/aprovacaoCalculos'

/**
 * @param {string} [numeroOSParam] - Número da OS vindo dos parâmetros de rota (/aprovacao/:id)
 * @returns {Object} Estado e métodos do fluxo de aprovação
 */
export function useAprovacaoOrcamento(numeroOSParam) {
  const { clienteAtivo } = useCliente()

  const numeroOSAlvo = useMemo(
    () => resolverNumeroOSAlvo(numeroOSParam, clienteAtivo?.value),
    [numeroOSParam, clienteAtivo?.value]
  )

  const [dadosOS, setDadosOS] = useState(() => carregarDadosOS(numeroOSAlvo))
  useEffect(() => {
    setDadosOS(carregarDadosOS(numeroOSAlvo))
  }, [numeroOSAlvo])

  // Estado de aprovação salvo
  const [aprovacao, setAprovacao] = useState({
    estaAprovado: false,
    dataHora: null,
    responsavel: '',
    formaPagamento: 'pix',
  })

  useEffect(() => {
    if (!numeroOSAlvo) return
    const salva = lerAprovacaoSalva(numeroOSAlvo)
    if (salva) {
      setAprovacao({
        estaAprovado: true,
        dataHora: salva.dataHora,
        responsavel: salva.responsavel || '',
        formaPagamento: salva.formaPagamento || 'pix',
      })
    }
  }, [numeroOSAlvo])

  const metadataPorItem = useMemo(() => mapearMetadataPorItem(dadosOS.itensAprovacaoOS), [dadosOS.itensAprovacaoOS])
  const itensAprovaveis = useMemo(() => normalizarItensAprovaveis(dadosOS, metadataPorItem), [dadosOS, metadataPorItem])

  // Resposta local do cliente por item ('aprovado' ou 'recusado')
  const [respostasLocais, setRespostasLocais] = useState({})
  useEffect(() => {
    setRespostasLocais(respostasIniciais(itensAprovaveis, metadataPorItem))
  }, [dadosOS.numeroOS, itensAprovaveis, metadataPorItem])

  // Alterna inclusão de item opcional; essenciais ficam travados
  const handleToggleItem = useCallback(
    (itemId, classificacao) => {
      if (aprovacao.estaAprovado) {
        toast.info('Este orçamento já foi aprovado e está em execução.')
        return
      }
      if (classificacao === 'essencial') {
        toast.warning('Itens essenciais de segurança não podem ser removidos do orçamento.')
        return
      }
      setRespostasLocais((prev) => {
        const novoStatus = prev[itemId] === 'recusado' ? 'aprovado' : 'recusado'
        if (novoStatus === 'aprovado') toast.success('Item complementar incluído no seu orçamento.')
        else toast.info('Item complementar removido do seu orçamento.')
        return { ...prev, [itemId]: novoStatus }
      })
    },
    [aprovacao.estaAprovado]
  )

  const totais = useMemo(
    () => calcularTotaisAprovacao(itensAprovaveis, respostasLocais, dadosOS.descontoGeralOS),
    [itensAprovaveis, respostasLocais, dadosOS.descontoGeralOS]
  )
  const fotosDasPecas = useMemo(() => listarFotosDasPecas(dadosOS), [dadosOS])
  const laudoOficial = useMemo(() => montarLaudoOficial(dadosOS, clienteAtivo?.nome), [dadosOS, clienteAtivo?.nome])

  const confirmarAprovacao = useCallback(
    ({ nomeResponsavel, formaPagamento }) => {
      const numero = dadosOS.numeroOS
      const nomeFinal = nomeResponsavel?.trim() || dadosOS.cliente || 'Cliente Titular'
      const dataHora = formatarDataHoraAprovacao()

      salvarAprovacao({
        numeroOS: numero,
        responsavel: nomeFinal,
        formaPagamento,
        dataHora,
        totalAprovado: totais.totalGeral,
      })

      registrarAprovacaoItens(
        numero,
        itensAprovaveis.map((item) => ({
          itemId: item.itemId,
          categoria: item.categoria,
          classificacao: item.classificacao,
          motivo: item.motivo,
          respostaCliente: respostasLocais[item.itemId] === 'recusado' ? 'recusado' : 'aprovado',
        }))
      )

      if (dadosOS.status === 'aguardando_aprovacao') {
        atualizarStatusOrdem(numero, 'aprovado_execucao')
      }

      setAprovacao({ estaAprovado: true, dataHora, responsavel: nomeFinal, formaPagamento })
      toast.success('Orçamento aprovado com sucesso! A oficina já foi notificada para iniciar os serviços.')
    },
    [dadosOS, itensAprovaveis, respostasLocais, totais.totalGeral]
  )

  // Resposta a item adicional reportado durante a execução
  const responderItemAdicionalOS = useCallback(
    (itemAdicionalId, resposta) => {
      const atualizada = responderItemAdicional(dadosOS.numeroOS, itemAdicionalId, resposta)
      if (!atualizada) return
      setDadosOS(atualizada)
      toast.success(
        resposta === 'aprovado'
          ? 'Item aprovado! A oficina já foi notificada e vai incluí-lo no serviço.'
          : 'Item recusado. A oficina foi notificada.'
      )
    },
    [dadosOS.numeroOS]
  )

  const enviarConfirmacaoWhatsApp = useCallback(() => {
    const link = linkConfirmacaoAprovacao(dadosOS, {
      nomeResponsavel: aprovacao.responsavel,
      formaPagamento: aprovacao.formaPagamento,
      totalGeral: totais.totalGeral,
    })
    window.open(link, '_blank')
  }, [dadosOS, aprovacao.responsavel, aprovacao.formaPagamento, totais.totalGeral])

  const tirarDuvidasWhatsApp = useCallback(() => window.open(linkDuvidasOrcamento(dadosOS), '_blank'), [dadosOS])

  return {
    numeroOS: dadosOS.numeroOS,
    temOS: Boolean(dadosOS.numeroOS),
    dadosOS,
    estaAprovado: aprovacao.estaAprovado,
    dataHoraAprovacao: aprovacao.dataHora,
    nomeResponsavelAprovacao: aprovacao.responsavel,
    formaPagamentoEscolhida: aprovacao.formaPagamento,
    itensAprovaveis,
    respostasLocais,
    totais,
    fotosDasPecas,
    laudoOficial,
    handleToggleItem,
    confirmarAprovacao,
    responderItemAdicionalOS,
    enviarConfirmacaoWhatsApp,
    tirarDuvidasWhatsApp,
  }
}
