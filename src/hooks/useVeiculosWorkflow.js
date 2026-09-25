import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  carregarTodosVeiculosDaFrota,
  salvarVeiculoNaFrota,
  excluirVeiculoDaFrota,
} from '../constants/mockClientesVeiculos'

export const FILTRO_PROPRIETARIO_OPCOES = [
  { value: 'TODOS', label: 'Todos os Proprietários' },
  { value: 'PF', label: 'Clientes Particulares (PF)' },
  { value: 'PJ', label: 'Empresas e Frotistas (PJ)' },
]

export const FILTRO_COMBUSTIVEL_OPCOES = [
  { value: 'TODOS', label: 'Todos os Combustíveis' },
  { value: 'FLEX', label: 'Flex' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HIBRIDO', label: 'Híbrido' },
  { value: 'ELETRICO', label: 'Elétrico' },
  { value: 'GNV', label: 'GNV' },
]

export const FILTRO_STATUS_OPCOES = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'ATIVOS', label: 'Somente Ativos na Frota' },
  { value: 'INATIVOS', label: 'Somente Inativos' },
]

/**
 * Domain Hook para Gestão da Frota de Veículos (ADR-003 / NFR18).
 * Unifica listagem, filtros avançados, métricas da frota e ações operacionais
 * (estacionar, vincular OS, alternar status, salvar e excluir) entre Desktop e Mobile.
 */
export function useVeiculosWorkflow() {
  const navigate = useNavigate()
  const location = useLocation()

  const [veiculos, setVeiculos] = useState(() => carregarTodosVeiculosDaFrota())
  const [busca, setBusca] = useState('')
  const [filtroProprietario, setFiltroProprietario] = useState('TODOS')
  const [filtroCombustivel, setFiltroCombustivel] = useState('TODOS')
  const [filtroMarca, setFiltroMarca] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  const [modalAberto, setModalAberto] = useState(false)
  const [veiculoEmEdicao, setVeiculoEmEdicao] = useState(null)
  const [modalEstacionarAberto, setModalEstacionarAberto] = useState(false)
  const [veiculoParaEstacionar, setVeiculoParaEstacionar] = useState(null)
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState(null)

  const recarregarFrota = useCallback(() => {
    setVeiculos(carregarTodosVeiculosDaFrota())
  }, [])

  useEffect(() => {
    recarregarFrota()
    window.addEventListener('storage', recarregarFrota)
    return () => window.removeEventListener('storage', recarregarFrota)
  }, [recarregarFrota])

  const opcoesMarcas = useMemo(() => {
    const marcasSet = new Set()
    veiculos.forEach((v) => {
      if (v.marca) marcasSet.add(v.marca.toUpperCase().trim())
    })
    const ordenadas = Array.from(marcasSet).sort()
    return [
      { value: 'TODOS', label: 'Todas as Montadoras' },
      ...ordenadas.map((m) => ({ value: m, label: m })),
    ]
  }, [veiculos])

  const metricas = useMemo(() => {
    const total = veiculos.length
    const totalPF = veiculos.filter((v) => v.clienteTipoPessoa === 'F').length
    const totalPJ = veiculos.filter((v) => v.clienteTipoPessoa === 'J').length

    const montadorasSet = new Set(
      veiculos.map((v) => (v.marca || '').toUpperCase().trim()).filter(Boolean)
    )

    return {
      total,
      totalPF,
      totalPJ,
      totalMontadoras: montadorasSet.size,
    }
  }, [veiculos])

  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter((v) => {
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marca || '').toLowerCase().includes(termo) ||
        (v.modelo || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || '').toLowerCase().includes(termo) ||
        (v.codigoVeiculo || '').toLowerCase().includes(termo) ||
        (v.clienteNome || '').toLowerCase().includes(termo) ||
        (v.clienteCodigo || '').toLowerCase().includes(termo) ||
        (v.chassi || '').toLowerCase().includes(termo) ||
        (v.cor || '').toLowerCase().includes(termo)

      const matchProprietario =
        filtroProprietario === 'TODOS' ||
        (filtroProprietario === 'PF' && v.clienteTipoPessoa === 'F') ||
        (filtroProprietario === 'PJ' && v.clienteTipoPessoa === 'J')

      const matchCombustivel =
        filtroCombustivel === 'TODOS' ||
        (v.combustivel || 'FLEX').toUpperCase() === filtroCombustivel

      const matchMarca =
        filtroMarca === 'TODOS' ||
        (v.marca || '').toUpperCase().trim() === filtroMarca

      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && v.ativo !== false) ||
        (filtroStatus === 'INATIVOS' && v.ativo === false)

      return (
        matchBusca &&
        matchProprietario &&
        matchCombustivel &&
        matchMarca &&
        matchStatus
      )
    })
  }, [
    veiculos,
    busca,
    filtroProprietario,
    filtroCombustivel,
    filtroMarca,
    filtroStatus,
  ])

  const temFiltroAtivo =
    busca ||
    filtroProprietario !== 'TODOS' ||
    filtroCombustivel !== 'TODOS' ||
    filtroMarca !== 'TODOS' ||
    filtroStatus !== 'TODOS'

  const abrirNovo = useCallback(() => {
    setVeiculoEmEdicao(null)
    setModalAberto(true)
  }, [])

  const abrirEditar = useCallback((v) => {
    setVeiculoEmEdicao(v)
    setModalAberto(true)
  }, [])

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setVeiculoEmEdicao(null)
  }, [])

  const abrirEstacionar = useCallback((v) => {
    setVeiculoParaEstacionar(v)
    setModalEstacionarAberto(true)
  }, [])

  const fecharEstacionar = useCallback(() => {
    setModalEstacionarAberto(false)
    setVeiculoParaEstacionar(null)
  }, [])

  const salvarVeiculo = useCallback(
    (veiculoData, clienteIdOriginal) => {
      try {
        salvarVeiculoNaFrota(veiculoData, clienteIdOriginal)
        recarregarFrota()
        toast.success(
          veiculoEmEdicao
            ? `Veículo placa ${veiculoData.placa} atualizado com sucesso!`
            : `Veículo placa ${veiculoData.placa} cadastrado com sucesso na frota!`
        )
        setModalAberto(false)
        setVeiculoEmEdicao(null)
      } catch {
        toast.error('Erro ao salvar veículo na frota.')
      }
    },
    [veiculoEmEdicao, recarregarFrota]
  )

  const alternarStatus = useCallback(
    (veiculo) => {
      try {
        const novoStatus = !veiculo.ativo
        salvarVeiculoNaFrota({
          ...veiculo,
          ativo: novoStatus,
        })
        recarregarFrota()
        toast.success(
          `Veículo ${veiculo.placa} marcado como ${
            novoStatus ? 'Ativo na Frota' : 'Inativo'
          }.`
        )
      } catch {
        toast.error('Erro ao alternar status do veículo.')
      }
    },
    [recarregarFrota]
  )

  const iniciarExclusao = useCallback((veiculo) => {
    setVeiculoParaExcluir(veiculo)
  }, [])

  const cancelarExclusao = useCallback(() => {
    setVeiculoParaExcluir(null)
  }, [])

  const confirmarExclusao = useCallback(() => {
    if (!veiculoParaExcluir) return
    try {
      excluirVeiculoDaFrota(
        veiculoParaExcluir.placa ||
          veiculoParaExcluir.id ||
          veiculoParaExcluir.value
      )
      recarregarFrota()
      toast.success(
        `Veículo ${veiculoParaExcluir.placa} removido da frota com sucesso.`
      )
    } catch {
      toast.error('Erro ao excluir veículo.')
    } finally {
      setVeiculoParaExcluir(null)
    }
  }, [veiculoParaExcluir, recarregarFrota])

  const excluirDireto = useCallback(
    (veiculo) => {
      try {
        excluirVeiculoDaFrota(veiculo.placa || veiculo.id || veiculo.value)
        recarregarFrota()
        toast.success(`Veículo ${veiculo.placa} removido da frota.`)
        setModalAberto(false)
        setVeiculoEmEdicao(null)
      } catch {
        toast.error('Erro ao excluir veículo.')
      }
    },
    [recarregarFrota]
  )

  const iniciarOS = useCallback(
    (veiculo) => {
      toast.info(`Iniciando Ordem de Serviço para o veículo ${veiculo.placa}...`)
      const basePath = location.pathname.startsWith('/secretaria')
        ? '/secretaria'
        : '/gestao'
      navigate(`${basePath}/ordem-de-servico`, {
        state: {
          veiculoId: veiculo.value || veiculo.id,
          placa: veiculo.placa,
          clienteId: veiculo.clienteId,
          clienteNome: veiculo.clienteNome,
        },
      })
    },
    [location.pathname, navigate]
  )

  const limparFiltros = useCallback(() => {
    setBusca('')
    setFiltroProprietario('TODOS')
    setFiltroCombustivel('TODOS')
    setFiltroMarca('TODOS')
    setFiltroStatus('TODOS')
  }, [])

  return {
    veiculos,
    recarregarFrota,
    metricas,
    busca,
    setBusca,
    filtroProprietario,
    setFiltroProprietario,
    filtroCombustivel,
    setFiltroCombustivel,
    filtroMarca,
    setFiltroMarca,
    filtroStatus,
    setFiltroStatus,
    opcoesMarcas,
    temFiltroAtivo,
    limparFiltros,
    veiculosFiltrados,
    modalAberto,
    abrirNovo,
    abrirEditar,
    fecharModal,
    veiculoEmEdicao,
    modalEstacionarAberto,
    veiculoParaEstacionar,
    abrirEstacionar,
    fecharEstacionar,
    veiculoParaExcluir,
    iniciarExclusao,
    cancelarExclusao,
    confirmarExclusao,
    excluirDireto,
    salvarVeiculo,
    alternarStatus,
    iniciarOS,
  }
}
