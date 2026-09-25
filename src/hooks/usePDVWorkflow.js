import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  carregarServicosCadastrados,
} from '../constants/cadastrosSuprimentosData'
import {
  obterOrdensAbertas,
  finalizarEArquivarOrdem,
  STATUS_ORCAMENTO,
  STATUS_PERMITE_FATURAMENTO,
} from '../pages/dashboard/orcamento/mockOrdensAbertas'
import {
  calcularTotaisCarrinho,
  registrarVendaPDV,
} from '../pages/dashboard/pdv/pdvData'
import {
  proximoUid,
  resumoFormasPagamento,
  converterOSParaItensCarrinho,
  baixarEstoqueItensVendidos,
  construirVendaPDV,
} from '../pages/dashboard/pdv/pdvWorkflowHelpers'

/**
 * Hook de domínio do PDV (Story 2.0b / ADR-003).
 * Centraliza catálogo, carrinho, vínculo de OS, regras de desconto e finalização de pagamento.
 */
export function usePDVWorkflow() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])
  const [abaCatalogo, setAbaCatalogo] = useState('pecas')
  const [buscaCatalogo, setBuscaCatalogo] = useState('')

  const [itensCarrinho, setItensCarrinho] = useState([])
  const [osVinculada, setOsVinculada] = useState(null)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null)
  const [buscaOS, setBuscaOS] = useState('')

  const [descontoGeral, setDescontoGeral] = useState(0)
  const [tipoDescontoGeral, setTipoDescontoGeral] = useState('valor')

  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false)
  const [processandoPagamento, setProcessandoPagamento] = useState(false)
  const [reciboAberto, setReciboAberto] = useState(false)
  const [vendaFinalizada, setVendaFinalizada] = useState(null)
  const [confirmandoNovaVenda, setConfirmandoNovaVenda] = useState(false)

  // Sincronização do catálogo com o Almoxarifado
  useEffect(() => {
    const sincronizar = () => {
      setPecas(carregarPecasCadastradas())
      setServicos(carregarServicosCadastrados())
    }
    sincronizar()
    window.addEventListener('dev_oficina_estoque_updated', sincronizar)
    return () => window.removeEventListener('dev_oficina_estoque_updated', sincronizar)
  }, [])

  // Carrega OS vinculada via parâmetro de rota (?os=NUMERO)
  useEffect(() => {
    const numeroOS = searchParams.get('os')
    if (!numeroOS) return
    carregarOSParaFaturamento(numeroOS)
    setSearchParams({}, { replace: true })
  }, [])

  const carregarOSParaFaturamento = (numeroOS) => {
    const ordens = obterOrdensAbertas()
    const os = ordens.find((item) => String(item.numeroOS) === String(numeroOS).trim())
    if (!os) {
      toast.warning(`Ordem de Serviço #${numeroOS} não foi encontrada entre as OS abertas.`)
      return
    }

    if (!STATUS_PERMITE_FATURAMENTO.includes(os.status)) {
      const statusLabel = STATUS_ORCAMENTO.find((s) => s.value === os.status)?.label || os.status
      toast.warning(
        `OS #${os.numeroOS} ainda está em "${statusLabel}". Só é possível faturar depois que o orçamento for aprovado e a execução iniciada.`
      )
      return
    }

    setOsVinculada(os)
    setItensCarrinho(converterOSParaItensCarrinho(os))
    setDescontoGeral(Number(os.descontoGeralOS) || 0)
    setTipoDescontoGeral('valor')
    setClienteSelecionado(null)
    setVeiculoSelecionado(null)
    setBuscaOS('')
    toast.success(`OS #${os.numeroOS} carregada no PDV para faturamento.`)
  }

  const handleBuscarOS = () => {
    if (!buscaOS.trim()) return
    carregarOSParaFaturamento(buscaOS.trim())
  }

  const handleDesvincularOS = () => {
    setOsVinculada(null)
    toast.info('OS desvinculada. Os itens permanecem no carrinho para conferência.')
  }

  const handleNovaVenda = () => {
    if (itensCarrinho.length === 0) {
      toast.info('O carrinho já está vazio.')
      return
    }
    setConfirmandoNovaVenda(true)
  }

  const confirmarNovaVenda = () => {
    setItensCarrinho([])
    setOsVinculada(null)
    setClienteSelecionado(null)
    setVeiculoSelecionado(null)
    setDescontoGeral(0)
    setTipoDescontoGeral('valor')
    setConfirmandoNovaVenda(false)
    toast.success('Nova venda iniciada com carrinho limpo.')
  }

  const pecasFiltradas = useMemo(() => {
    const termo = buscaCatalogo.trim().toLowerCase()
    return pecas.filter((p) => {
      if (p.ativo === false) return false
      if (!termo) return true
      return (
        p.nome?.toLowerCase().includes(termo) ||
        p.codigo?.toLowerCase().includes(termo) ||
        p.gtin?.toLowerCase().includes(termo) ||
        p.codigoFabricante?.toLowerCase().includes(termo)
      )
    })
  }, [pecas, buscaCatalogo])

  const servicosFiltrados = useMemo(() => {
    const termo = buscaCatalogo.trim().toLowerCase()
    return servicos.filter((s) => {
      if (s.ativo === false) return false
      if (!termo) return true
      return s.nome?.toLowerCase().includes(termo) || s.codigo?.toLowerCase().includes(termo)
    })
  }, [servicos, buscaCatalogo])

  const handleAdicionarPeca = (peca) => {
    const disponivel = Number(peca.estoqueAtual) || 0
    if (disponivel <= 0) {
      toast.warning(`"${peca.nome}" está sem estoque disponível no almoxarifado.`)
      return
    }

    setItensCarrinho((prev) => {
      const existente = prev.find((item) => item.pecaId === peca.id && !item.origemOS)
      if (existente) {
        if (existente.quantidade + 1 > disponivel) {
          toast.warning(`Estoque insuficiente. Disponível: ${disponivel} ${peca.unidade || 'UN'}.`)
          return prev
        }
        return prev.map((item) =>
          item.uid === existente.uid ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [
        ...prev,
        {
          uid: proximoUid('peca'),
          tipo: 'peca',
          origemOS: false,
          codigo: peca.codigo,
          nome: peca.nome,
          unidade: peca.unidade || 'UN',
          quantidade: 1,
          precoUnitario: Number(peca.precoVenda) || 0,
          desconto: 0,
          pecaId: peca.id,
          estoqueDisponivel: disponivel,
        },
      ]
    })
  }

  const handleAdicionarServico = (servico) => {
    setItensCarrinho((prev) => {
      const existente = prev.find(
        (item) => item.tipo === 'servico' && item.codigo === servico.codigo && !item.origemOS
      )
      if (existente) {
        return prev.map((item) =>
          item.uid === existente.uid ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [
        ...prev,
        {
          uid: proximoUid('servico'),
          tipo: 'servico',
          origemOS: false,
          codigo: servico.codigo,
          nome: servico.nome,
          unidade: 'MO',
          quantidade: 1,
          precoUnitario: Number(servico.valorMaoDeObra) || 0,
          desconto: 0,
        },
      ]
    })
  }

  const handleAlterarQuantidade = (uid, delta) => {
    setItensCarrinho((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item
        const novaQtd = Math.max(1, item.quantidade + delta)
        if (item.tipo === 'peca' && !item.origemOS && novaQtd > (item.estoqueDisponivel || 0)) {
          toast.warning(`Estoque insuficiente. Disponível: ${item.estoqueDisponivel || 0} ${item.unidade}.`)
          return item
        }
        return { ...item, quantidade: novaQtd }
      })
    )
  }

  const handleAlterarDescontoItem = (uid, valor) => {
    setItensCarrinho((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item
        const bruto = item.quantidade * item.precoUnitario
        const desconto = Math.max(0, Math.min(Number(valor) || 0, bruto))
        return { ...item, desconto }
      })
    )
  }

  const handleRemoverItem = (uid) => {
    setItensCarrinho((prev) => prev.filter((item) => item.uid !== uid))
  }

  const totais = useMemo(
    () => calcularTotaisCarrinho(itensCarrinho, descontoGeral, tipoDescontoGeral),
    [itensCarrinho, descontoGeral, tipoDescontoGeral]
  )

  const clienteInfo = osVinculada
    ? {
        nome: osVinculada.cliente,
        documento: osVinculada.documento,
        telefone: osVinculada.telefone,
      }
    : clienteSelecionado
      ? {
          nome: clienteSelecionado.nome,
          documento: clienteSelecionado.documento,
          telefone: clienteSelecionado.telefone,
        }
      : null

  const veiculoInfo = osVinculada
    ? { placa: osVinculada.placa, marcaModelo: osVinculada.marcaModelo }
    : veiculoSelecionado
      ? { placa: veiculoSelecionado.placa, marcaModelo: veiculoSelecionado.marcaModelo }
      : null

  const handleAbrirPagamento = () => {
    if (itensCarrinho.length === 0) {
      toast.warning('Adicione ao menos um item ao carrinho antes de finalizar a venda.')
      return
    }
    setModalPagamentoAberto(true)
  }

  const handleConfirmarPagamento = ({ formasPagamento, tipoNota, documentoNota, troco }) => {
    if (processandoPagamento) return
    setProcessandoPagamento(true)

    const venda = construirVendaPDV({
      itensCarrinho,
      totais,
      clienteInfo,
      veiculoInfo,
      osVinculada,
      formasPagamento,
      tipoNota,
      documentoNota,
      troco,
    })

    registrarVendaPDV(venda)
    baixarEstoqueItensVendidos(itensCarrinho, osVinculada)

    if (osVinculada) {
      finalizarEArquivarOrdem(osVinculada.numeroOS, {
        formaPagamento: resumoFormasPagamento(formasPagamento),
        notaFiscal: `${tipoNota === 'nfe' ? 'NF-e' : 'NFC-e'} #${venda.numeroVenda}`,
        valorTotal: totais.totalGeral,
      })
    }

    toast.success(`Venda #${venda.numeroVenda} finalizada e nota fiscal emitida com sucesso!`)

    setModalPagamentoAberto(false)
    setVendaFinalizada(venda)
    setReciboAberto(true)

    setItensCarrinho([])
    setOsVinculada(null)
    setClienteSelecionado(null)
    setVeiculoSelecionado(null)
    setDescontoGeral(0)
    setTipoDescontoGeral('valor')
    setProcessandoPagamento(false)
  }

  return {
    abaCatalogo,
    setAbaCatalogo,
    buscaCatalogo,
    setBuscaCatalogo,
    pecasFiltradas,
    servicosFiltrados,
    itensCarrinho,
    osVinculada,
    clienteSelecionado,
    setClienteSelecionado,
    veiculoSelecionado,
    setVeiculoSelecionado,
    buscaOS,
    setBuscaOS,
    descontoGeral,
    setDescontoGeral,
    tipoDescontoGeral,
    setTipoDescontoGeral,
    totais,
    clienteInfo,
    veiculoInfo,
    modais: {
      modalPagamentoAberto,
      setModalPagamentoAberto,
      processandoPagamento,
      reciboAberto,
      setReciboAberto,
      vendaFinalizada,
      confirmandoNovaVenda,
      setConfirmandoNovaVenda,
    },
    acoes: {
      adicionarPeca: handleAdicionarPeca,
      adicionarServico: handleAdicionarServico,
      alterarQuantidade: handleAlterarQuantidade,
      alterarDescontoItem: handleAlterarDescontoItem,
      removerItem: handleRemoverItem,
      buscarOS: handleBuscarOS,
      desvincularOS: handleDesvincularOS,
      solicitarNovaVenda: handleNovaVenda,
      confirmarNovaVenda,
      abrirPagamento: handleAbrirPagamento,
      confirmarPagamento: handleConfirmarPagamento,
    },
  }
}
