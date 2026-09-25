import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import {
  carregarDeslocamentos,
  carregarVeiculosDeApoio,
  iniciarDeslocamento,
  excluirDeslocamento,
} from '../constants/mockLevaETraz'

export const FILTRO_EQUIPE_OPCOES = [
  { value: 'TODOS', label: 'Todas as Equipes' },
  { value: '1', label: '1 Funcionário (Individual)' },
  { value: '2', label: '2 Funcionários (Carro de Apoio)' },
]

export function useLevaETrazWorkflow() {
  const [deslocamentos, setDeslocamentos] = useState([])
  const [veiculosApoio, setVeiculosApoio] = useState([])

  // Controle de Abas
  const [abaAtiva, setAbaAtiva] = useState('roteiro') // 'roteiro', 'historico', 'frota_apoio'

  // Filtros e Pesquisa
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroEquipe, setFiltroEquipe] = useState('TODOS')

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [deslocamentoSelecionado, setDeslocamentoSelecionado] = useState(null)
  const [modalVeiculoApoioAberto, setModalVeiculoApoioAberto] = useState(false)
  const [veiculoApoioEditando, setVeiculoApoioEditando] = useState(null)

  const recarregarDados = useCallback(() => {
    setDeslocamentos(carregarDeslocamentos())
    setVeiculosApoio(carregarVeiculosDeApoio())
  }, [])

  useEffect(() => {
    recarregarDados()
    window.addEventListener('storage', recarregarDados)
    return () => window.removeEventListener('storage', recarregarDados)
  }, [recarregarDados])

  // Métricas e Indicadores do Dia
  const metricas = useMemo(() => {
    const total = deslocamentos.length
    const emRota = deslocamentos.filter((d) => d.status === 'em_deslocamento').length
    const agendados = deslocamentos.filter((d) => d.status === 'agendado').length
    const concluidos = deslocamentos.filter((d) => d.status === 'concluido').length

    const veiculosClientes = deslocamentos.filter(
      (d) => d.tipoServico === 'busca_veiculo' || d.tipoServico === 'entrega_veiculo'
    ).length

    const coletaPecas = deslocamentos.filter((d) => d.tipoServico === 'busca_pecas').length

    const kmTotal = deslocamentos.reduce((acc, curr) => {
      const km = parseFloat(String(curr.kmRealizado || curr.kmEstimado || 0).replace(/\./g, '').replace(',', '.')) || 0
      return acc + km
    }, 0)

    return {
      total,
      emRota,
      agendados,
      concluidos,
      veiculosClientes,
      coletaPecas,
      kmTotal: Math.round(kmTotal),
    }
  }, [deslocamentos])

  // Filtragem dos deslocamentos (Desktop)
  const deslocamentosFiltrados = useMemo(() => {
    return deslocamentos.filter((d) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (d.codigo || '').toLowerCase().includes(termo) ||
        (d.clienteNome || '').toLowerCase().includes(termo) ||
        (d.veiculoPlaca || '').toLowerCase().includes(termo) ||
        (d.veiculoModelo || '').toLowerCase().includes(termo) ||
        (d.fornecedorNome || '').toLowerCase().includes(termo) ||
        (d.motoristaPrincipalNome || '').toLowerCase().includes(termo) ||
        (d.auxiliarNome || '').toLowerCase().includes(termo) ||
        (d.enderecoDestino || '').toLowerCase().includes(termo)

      const matchTipo = filtroTipo === 'TODOS' || d.tipoServico === filtroTipo
      const matchStatus = filtroStatus === 'TODOS' || d.status === filtroStatus
      const matchEquipe =
        filtroEquipe === 'TODOS' || String(d.quantidadeFuncionarios) === filtroEquipe

      if (abaAtiva === 'roteiro') {
        const matchAbaRoteiro = d.status === 'agendado' || d.status === 'em_deslocamento'
        return matchBusca && matchTipo && matchStatus && matchEquipe && matchAbaRoteiro
      }

      return matchBusca && matchTipo && matchStatus && matchEquipe
    })
  }, [deslocamentos, busca, filtroTipo, filtroStatus, filtroEquipe, abaAtiva])

  // Filtragem dos deslocamentos (Mobile)
  const deslocamentosFiltradosMobile = useMemo(() => {
    return deslocamentos.filter((d) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (d.codigo || '').toLowerCase().includes(termo) ||
        (d.clienteNome || '').toLowerCase().includes(termo) ||
        (d.veiculoPlaca || '').toLowerCase().includes(termo) ||
        (d.motoristaPrincipalNome || '').toLowerCase().includes(termo) ||
        (d.enderecoDestino || '').toLowerCase().includes(termo)

      if (abaAtiva === 'roteiro') {
        return matchBusca && (d.status === 'agendado' || d.status === 'em_deslocamento')
      }
      if (abaAtiva === 'historico') {
        return matchBusca && d.status === 'concluido'
      }
      return matchBusca
    })
  }, [deslocamentos, busca, abaAtiva])

  const temFiltroAtivo =
    busca !== '' || filtroTipo !== 'TODOS' || filtroStatus !== 'TODOS' || filtroEquipe !== 'TODOS'

  const handleLimparFiltros = useCallback(() => {
    setBusca('')
    setFiltroTipo('TODOS')
    setFiltroStatus('TODOS')
    setFiltroEquipe('TODOS')
  }, [])

  // Ações de Fluxo
  const handleIniciarViagem = useCallback(
    (d) => {
      iniciarDeslocamento(d.id)
      recarregarDados()
      toast.success(`Deslocamento #${d.codigo} iniciado! Veículo de apoio em rota.`)
    },
    [recarregarDados]
  )

  const handleAbrirFinalizar = useCallback((d) => {
    setDeslocamentoSelecionado(d)
    setModalFinalizarAberto(true)
  }, [])

  const handleAbrirDetalhes = useCallback((d) => {
    setDeslocamentoSelecionado(d)
    setModalDetalhesAberto(true)
  }, [])

  const handleExcluir = useCallback(
    (d) => {
      excluirDeslocamento(d.id)
      recarregarDados()
      toast.success(`Deslocamento #${d.codigo} removido com sucesso.`)
    },
    [recarregarDados]
  )

  const handleAbrirNovo = useCallback(() => {
    setModalNovoAberto(true)
  }, [])

  const handleEditarVeiculoApoio = useCallback((v) => {
    setVeiculoApoioEditando(v)
    setModalVeiculoApoioAberto(true)
  }, [])

  const handleNovoVeiculoApoio = useCallback(() => {
    setVeiculoApoioEditando(null)
    setModalVeiculoApoioAberto(true)
  }, [])

  return {
    deslocamentos,
    veiculosApoio,
    abaAtiva,
    setAbaAtiva,
    busca,
    setBusca,
    filtroTipo,
    setFiltroTipo,
    filtroStatus,
    setFiltroStatus,
    filtroEquipe,
    setFiltroEquipe,
    temFiltroAtivo,
    handleLimparFiltros,
    metricas,
    deslocamentosFiltrados,
    deslocamentosFiltradosMobile,
    modalNovoAberto,
    setModalNovoAberto,
    modalFinalizarAberto,
    setModalFinalizarAberto,
    modalDetalhesAberto,
    setModalDetalhesAberto,
    deslocamentoSelecionado,
    setDeslocamentoSelecionado,
    modalVeiculoApoioAberto,
    setModalVeiculoApoioAberto,
    veiculoApoioEditando,
    setVeiculoApoioEditando,
    recarregarDados,
    handleIniciarViagem,
    handleAbrirFinalizar,
    handleAbrirDetalhes,
    handleExcluir,
    handleAbrirNovo,
    handleEditarVeiculoApoio,
    handleNovoVeiculoApoio,
  }
}
