import { useState, useEffect, useMemo } from 'react'
import {
  carregarPedidosCompra,
  carregarCotacoes,
  obterDemandasDasOSs,
} from '../constants/comprasData'
import {
  carregarPecasCadastradas,
  carregarTerceirosCadastrados,
} from '../constants/cadastrosSuprimentosData'
import {
  calcularMetricasCompras,
  calcularItensReposicao,
  filtrarPedidos,
  filtrarDemandas,
  filtrarCotacoes,
} from '../utils/compras/comprasCalculos'

/** Eventos que disparam nova leitura dos dados de Compras. */
const EVENTOS_SINCRONIZACAO = [
  'storage',
  'dev_oficina_compras_updated',
  'dev_oficina_cotacoes_updated',
  'dev_oficina_estoque_updated',
  'dev_oficina_pecas_updated',
  'dev_oficina_ordens_updated',
]

/** Adapta o onChange do react-select: opção limpa volta para 'TODOS'. */
const aoSelecionar = (setter) => (opt) => setter(opt ? opt.value : 'TODOS')

/**
 * Dados sincronizados, filtros e indicadores da tela de Compras e Cotações
 * (Story 2.0 / ADR-003). Escuta os eventos de storage do módulo de suprimentos
 * e mantém pedidos, cotações, demandas de OS, catálogo e fornecedores atualizados.
 *
 * @returns {{
 *   pedidos: Array, cotacoes: Array, demandasOS: Array, pecasCatalogo: Array, fornecedores: Array,
 *   recarregar: {pedidos: Function, cotacoes: Function, demandas: Function, pecas: Function},
 *   filtros: object, metricas: object, pedidosFiltrados: Array, demandasFiltradas: Array,
 *   cotacoesFiltradas: Array, itensReposicao: Array
 * }}
 */
export function useComprasDados() {
  const [pedidos, setPedidos] = useState([])
  const [cotacoes, setCotacoes] = useState([])
  const [demandasOS, setDemandasOS] = useState([])
  const [pecasCatalogo, setPecasCatalogo] = useState([])
  const [fornecedores, setFornecedores] = useState([])

  // Filtros das abas
  const [buscaPedidos, setBuscaPedidos] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroFornecedor, setFiltroFornecedor] = useState('TODOS')
  const [buscaDemandas, setBuscaDemandas] = useState('')
  const [buscaCotacoes, setBuscaCotacoes] = useState('')
  const [filtroStatusCotacao, setFiltroStatusCotacao] = useState('TODOS')

  useEffect(() => {
    const sincronizarTudo = () => {
      setPedidos(carregarPedidosCompra())
      setCotacoes(carregarCotacoes())
      setDemandasOS(obterDemandasDasOSs())
      setPecasCatalogo(carregarPecasCadastradas())
      setFornecedores(carregarTerceirosCadastrados())
    }

    sincronizarTudo()
    EVENTOS_SINCRONIZACAO.forEach((evt) => window.addEventListener(evt, sincronizarTudo))
    return () => {
      EVENTOS_SINCRONIZACAO.forEach((evt) => window.removeEventListener(evt, sincronizarTudo))
    }
  }, [])

  const recarregar = useMemo(
    () => ({
      pedidos: () => setPedidos(carregarPedidosCompra()),
      cotacoes: () => setCotacoes(carregarCotacoes()),
      demandas: () => setDemandasOS(obterDemandasDasOSs()),
      pecas: () => setPecasCatalogo(carregarPecasCadastradas()),
    }),
    []
  )

  const metricas = useMemo(
    () => calcularMetricasCompras({ pedidos, cotacoes, demandasOS, pecasCatalogo }),
    [pedidos, cotacoes, demandasOS, pecasCatalogo]
  )

  const pedidosFiltrados = useMemo(
    () => filtrarPedidos(pedidos, { busca: buscaPedidos, status: filtroStatus, fornecedorId: filtroFornecedor }),
    [pedidos, buscaPedidos, filtroStatus, filtroFornecedor]
  )

  const demandasFiltradas = useMemo(
    () => filtrarDemandas(demandasOS, buscaDemandas),
    [demandasOS, buscaDemandas]
  )

  const cotacoesFiltradas = useMemo(
    () => filtrarCotacoes(cotacoes, { busca: buscaCotacoes, status: filtroStatusCotacao }),
    [cotacoes, buscaCotacoes, filtroStatusCotacao]
  )

  const itensReposicao = useMemo(() => calcularItensReposicao(pecasCatalogo), [pecasCatalogo])

  const filtros = {
    buscaPedidos,
    setBuscaPedidos,
    filtroStatus,
    selecionarStatusPedido: aoSelecionar(setFiltroStatus),
    filtroFornecedor,
    selecionarFornecedor: aoSelecionar(setFiltroFornecedor),
    buscaDemandas,
    setBuscaDemandas,
    buscaCotacoes,
    setBuscaCotacoes,
    filtroStatusCotacao,
    selecionarStatusCotacao: aoSelecionar(setFiltroStatusCotacao),
  }

  return {
    pedidos,
    cotacoes,
    demandasOS,
    pecasCatalogo,
    fornecedores,
    recarregar,
    filtros,
    metricas,
    pedidosFiltrados,
    demandasFiltradas,
    cotacoesFiltradas,
    itensReposicao,
  }
}
