import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import {
  carregarVeiculosEstacionados,
  excluirVeiculoEstacionado,
  obterHistoricoCompletoVeiculo,
} from '../repositories/veiculosEstacionadosRepository'

export const FILTRO_SITUACAO_OPCOES = [
  { value: 'TODOS', label: 'Todas as Situações' },
  { value: 'COM_COMPRADOR', label: 'Comprador Informado' },
  { value: 'SEM_COMPRADOR', label: 'Aguardando Novo Dono' },
]

export function useEstacionadosWorkflow() {
  const [estacionados, setEstacionados] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('TODOS')
  const [filtroMarca, setFiltroMarca] = useState('TODOS')

  // Modais
  const [modalEstacionarAberto, setModalEstacionarAberto] = useState(false)
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false)
  const [modalVincularAberto, setModalVincularAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null)

  const recarregarEstacionados = useCallback(() => {
    let cancelado = false
    carregarVeiculosEstacionados()
      .then((lista) => {
        if (!cancelado && Array.isArray(lista)) {
          setEstacionados(lista)
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar veículos estacionados:', err)
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    const cleanup = recarregarEstacionados()
    const handleStorage = () => recarregarEstacionados()
    window.addEventListener('storage', handleStorage)
    return () => {
      if (cleanup) cleanup()
      window.removeEventListener('storage', handleStorage)
    }
  }, [recarregarEstacionados])

  // Extrai montadoras presentes nos veículos estacionados
  const opcoesMarcas = useMemo(() => {
    const marcasSet = new Set()
    estacionados.forEach((v) => {
      if (v.marca) marcasSet.add(v.marca.toUpperCase().trim())
    })
    const ordenadas = Array.from(marcasSet).sort()
    return [
      { value: 'TODOS', label: 'Todas as Montadoras' },
      ...ordenadas.map((m) => ({ value: m, label: m })),
    ]
  }, [estacionados])

  // Indicadores e métricas do pátio de estacionados
  const metricas = useMemo(() => {
    const total = estacionados.length
    const comComprador = estacionados.filter(
      (v) => v.novoDonoNome && v.novoDonoNome.trim().length > 0
    ).length
    const semComprador = total - comComprador

    let totalManutencoes = 0
    estacionados.forEach((v) => {
      const hist = obterHistoricoCompletoVeiculo(v.placa, v)
      totalManutencoes += hist.length
    })

    return {
      total,
      comComprador,
      semComprador,
      totalManutencoes,
    }
  }, [estacionados])

  // Filtragem dos veículos estacionados
  const estacionadosFiltrados = useMemo(() => {
    return estacionados.filter((v) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marca || '').toLowerCase().includes(termo) ||
        (v.modelo || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || '').toLowerCase().includes(termo) ||
        (v.codigoVeiculo || '').toLowerCase().includes(termo) ||
        (v.antigoClienteNome || '').toLowerCase().includes(termo) ||
        (v.novoDonoNome || '').toLowerCase().includes(termo) ||
        (v.motivoVenda || '').toLowerCase().includes(termo) ||
        (v.chassi || '').toLowerCase().includes(termo)

      const temComprador = Boolean(v.novoDonoNome && v.novoDonoNome.trim().length > 0)
      const matchSituacao =
        filtroSituacao === 'TODOS' ||
        (filtroSituacao === 'COM_COMPRADOR' && temComprador) ||
        (filtroSituacao === 'SEM_COMPRADOR' && !temComprador)

      const matchMarca =
        filtroMarca === 'TODOS' ||
        (v.marca || '').toUpperCase().trim() === filtroMarca

      return matchBusca && matchSituacao && matchMarca
    })
  }, [estacionados, busca, filtroSituacao, filtroMarca])

  const temFiltroAtivo = busca !== '' || filtroSituacao !== 'TODOS' || filtroMarca !== 'TODOS'

  const handleLimparFiltros = useCallback(() => {
    setBusca('')
    setFiltroSituacao('TODOS')
    setFiltroMarca('TODOS')
  }, [])

  // Abertura de Modais
  const handleAbrirEstacionar = useCallback(() => {
    setVeiculoSelecionado(null)
    setModalEstacionarAberto(true)
  }, [])

  const handleAbrirHistorico = useCallback((veiculo) => {
    setVeiculoSelecionado(veiculo)
    setModalHistoricoAberto(true)
  }, [])

  const handleAbrirVincular = useCallback((veiculo) => {
    setVeiculoSelecionado(veiculo)
    setModalVincularAberto(true)
  }, [])

  const handleAbrirEditar = useCallback((veiculo) => {
    setVeiculoSelecionado(veiculo)
    setModalEditarAberto(true)
  }, [])

  const handleExcluir = useCallback(
    async (veiculo) => {
      try {
        await excluirVeiculoEstacionado(veiculo.id)
        recarregarEstacionados()
        toast.success(`Veículo placa ${veiculo.placa} removido dos estacionados.`)
      } catch {
        toast.error('Erro ao excluir veículo estacionado.')
      }
    },
    [recarregarEstacionados]
  )

  return {
    estacionados,
    busca,
    setBusca,
    filtroSituacao,
    setFiltroSituacao,
    filtroMarca,
    setFiltroMarca,
    opcoesMarcas,
    metricas,
    estacionadosFiltrados,
    temFiltroAtivo,
    handleLimparFiltros,
    modalEstacionarAberto,
    setModalEstacionarAberto,
    modalHistoricoAberto,
    setModalHistoricoAberto,
    modalVincularAberto,
    setModalVincularAberto,
    modalEditarAberto,
    setModalEditarAberto,
    veiculoSelecionado,
    setVeiculoSelecionado,
    handleAbrirEstacionar,
    handleAbrirHistorico,
    handleAbrirVincular,
    handleAbrirEditar,
    handleExcluir,
    recarregarEstacionados,
  }
}
