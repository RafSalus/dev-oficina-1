import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useComprasWorkflow } from '../../../../hooks/useComprasWorkflow'
import { MobileCompraFormModal } from './MobileCompraFormModal'
import { MobilePecaFormModal } from './MobilePecaFormModal'
import { MobileComprasHeader } from './compras/MobileComprasHeader'
import { MobileAbaPedidos } from './compras/MobileAbaPedidos'
import { MobileAbaCotacoes } from './compras/MobileAbaCotacoes'
import { MobileAbaDemandas } from './compras/MobileAbaDemandas'
import { MobileAbaReposicao } from './compras/MobileAbaReposicao'

/**
 * Container principal da tela de Compras e Cotações no Mobile (Story 2.0b / ADR-003).
 * Consome exclusivamente o hook de domínio `useComprasWorkflow` e orquestra
 * os subcomponentes apresentacionais dedicados.
 */
export function MobileComprasPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const {
    pedidos,
    cotacoes,
    demandasFiltradas,
    itensReposicao,
    metricas,
    abaAtiva,
    setAbaAtiva,
    demandasSelecionadas,
    acoes,
  } = useComprasWorkflow()

  // Filtros locais de apresentação
  const [termoBusca, setTermoBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  // Modais locais de cadastro rápido
  const [modalCompraAberto, setModalCompraAberto] = useState(false)
  const [pedidoParaEditar, setPedidoParaEditar] = useState(null)
  const [demandaParaComprar, setDemandaParaComprar] = useState(null)
  const [modalPecaAberto, setModalPecaAberto] = useState(false)
  const [pecaParaEditar, setPecaParaEditar] = useState(null)

  // Filtragem dos pedidos de compra
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const matchStatus = filtroStatus === 'TODOS' || p.status === filtroStatus
      const q = termoBusca.toLowerCase()
      const matchBusca =
        !termoBusca ||
        p.numeroPedido?.toLowerCase().includes(q) ||
        p.fornecedorNome?.toLowerCase().includes(q) ||
        p.numeroOS?.toLowerCase().includes(q) ||
        (p.itens || []).some((it) => it.nome?.toLowerCase().includes(q))
      return matchStatus && matchBusca
    })
  }, [pedidos, filtroStatus, termoBusca])

  // Filtragem das cotações
  const cotacoesFiltradas = useMemo(() => {
    return cotacoes.filter((c) => {
      const q = termoBusca.toLowerCase()
      return (
        !termoBusca ||
        c.id?.toLowerCase().includes(q) ||
        c.numeroOS?.toLowerCase().includes(q) ||
        c.veiculoModelo?.toLowerCase().includes(q) ||
        (c.itens || []).some((it) => it.nome?.toLowerCase().includes(q))
      )
    })
  }, [cotacoes, termoBusca])

  const handleNovoPedido = () => {
    setPedidoParaEditar(null)
    setDemandaParaComprar(null)
    setModalCompraAberto(true)
  }

  const handleEditarPedido = (pedido) => {
    setPedidoParaEditar(pedido)
    setDemandaParaComprar(null)
    setModalCompraAberto(true)
  }

  const handleAbrirCotacao = (cotacao) => {
    navigate(`${basePath}/compras/cotacao/${cotacao.id}`, { state: { cotacao } })
  }

  const handleSalvarPedido = (dados) => {
    acoes.salvarCompra(dados)
    setModalCompraAberto(false)
    setPedidoParaEditar(null)
    setDemandaParaComprar(null)
  }

  const handleExcluirPedido = (pedido) => {
    acoes.excluirCompra(pedido)
    setModalCompraAberto(false)
    setPedidoParaEditar(null)
    setDemandaParaComprar(null)
  }

  const handleSalvarPeca = (dados) => {
    toast.success(`Peça "${dados.nome}" cadastrada com sucesso!`)
    setModalPecaAberto(false)
    setPecaParaEditar(null)
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      {/* Cabeçalho, chips e navegação de abas */}
      <MobileComprasHeader
        metricas={metricas}
        abaAtiva={abaAtiva}
        onMudarAba={setAbaAtiva}
        termoBusca={termoBusca}
        onMudarBusca={setTermoBusca}
        filtroStatus={filtroStatus}
        onMudarStatus={setFiltroStatus}
        onNovoPedido={handleNovoPedido}
      />

      {/* Conteúdo dinâmico da aba ativa */}
      {abaAtiva === 'pedidos' && (
        <MobileAbaPedidos
          pedidos={pedidosFiltrados}
          onEditar={handleEditarPedido}
          onReceber={acoes.receberCompra}
          onWhatsapp={acoes.copiarPedidoWhatsApp}
        />
      )}

      {abaAtiva === 'cotacoes' && (
        <MobileAbaCotacoes
          cotacoes={cotacoesFiltradas}
          onAbrir={handleAbrirCotacao}
          onWhatsapp={acoes.copiarLinkCotacaoWhatsApp}
          onAprovar={acoes.aprovarCotacaoDireto}
          onExcluir={acoes.excluirCotacao}
        />
      )}

      {abaAtiva === 'demandas_os' && (
        <MobileAbaDemandas
          demandas={demandasFiltradas}
          demandasSelecionadas={demandasSelecionadas}
          onAlternarDemanda={acoes.alternarDemanda}
          onCotarDemanda={acoes.abrirCotacaoDemanda}
          onCotarAgrupada={acoes.abrirCotacaoAgrupada}
        />
      )}

      {abaAtiva === 'reposicao' && (
        <MobileAbaReposicao
          itensReposicao={itensReposicao}
          onCotarReposicao={acoes.abrirCotacaoReposicao}
          onCopiarWhatsApp={acoes.copiarListaReposicaoWhatsApp}
        />
      )}

      {/* Modais de Compra e Catálogo */}
      <MobileCompraFormModal
        isOpen={modalCompraAberto}
        onClose={() => {
          setModalCompraAberto(false)
          setPedidoParaEditar(null)
          setDemandaParaComprar(null)
        }}
        onSalvar={handleSalvarPedido}
        onExcluir={handleExcluirPedido}
        pedidoParaEditar={pedidoParaEditar}
        demandaInicial={demandaParaComprar}
      />

      <MobilePecaFormModal
        isOpen={modalPecaAberto}
        onClose={() => {
          setModalPecaAberto(false)
          setPecaParaEditar(null)
        }}
        onSalvar={handleSalvarPeca}
        pecaParaEditar={pecaParaEditar}
      />
    </div>
  )
}
export default MobileComprasPage
