import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { useClientesCadastrados } from './useClientesCadastrados'
import * as clientesRepository from '../repositories/clientesRepository'
import * as veiculosRepository from '../repositories/veiculosRepository'

export const FILTRO_TIPO_OPCOES = [
  { value: 'TODOS', label: 'Todos os Tipos (PF e PJ)' },
  { value: 'F', label: 'Pessoa Física (CPF)' },
  { value: 'J', label: 'Pessoa Jurídica (CNPJ)' },
]

export const FILTRO_STATUS_OPCOES = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'ATIVOS', label: 'Somente Ativos' },
  { value: 'INATIVOS', label: 'Somente Inativos' },
]

export const FILTRO_VEICULOS_OPCOES = [
  { value: 'TODOS', label: 'Todos os Clientes' },
  { value: 'COM_VEICULOS', label: 'Com Veículos Vinculados' },
  { value: 'SEM_VEICULOS', label: 'Sem Veículo Cadastrado' },
]

/**
 * Domain Hook para o fluxo de Clientes e Frotistas (ADR-003 / NFR18 / Story 2.6).
 * Unifica a lógica de estado, filtros, integração assíncrona com Supabase e métricas
 * entre as versões Desktop e Mobile.
 */
export function useClientesWorkflow() {
  const { clientes, carregando, erro, recarregar } = useClientesCadastrados({ incluirVeiculos: true })

  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroVeiculos, setFiltroVeiculos] = useState('TODOS')

  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null)
  const [clienteFrotaModal, setClienteFrotaModal] = useState(null)
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null)

  const metricas = useMemo(() => {
    const total = clientes.length
    const ativos = clientes.filter((c) => c.ativo !== false).length
    const totalPF = clientes.filter(
      (c) =>
        c.tipoPessoa === 'F' ||
        (!c.tipoPessoa && (c.documento || '').replace(/\D/g, '').length <= 11)
    ).length
    const totalPJ = total - totalPF
    const totalVeiculos = clientes.reduce(
      (acc, c) => acc + (c.veiculos?.length || 0),
      0
    )

    return {
      total,
      ativos,
      totalPF,
      totalPJ,
      totalVeiculos,
    }
  }, [clientes])

  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()

    return clientes.filter((cli) => {
      const docLimpo = (cli.documento || '').replace(/\D/g, '')
      const isPF =
        cli.tipoPessoa === 'F' || (!cli.tipoPessoa && docLimpo.length <= 11)

      const matchBusca =
        !termo ||
        cli.nome?.toLowerCase().includes(termo) ||
        cli.nomeFantasia?.toLowerCase().includes(termo) ||
        cli.codigoCliente?.toLowerCase().includes(termo) ||
        cli.documento?.toLowerCase().includes(termo) ||
        cli.telefone?.toLowerCase().includes(termo) ||
        cli.cidade?.toLowerCase().includes(termo) ||
        cli.veiculos?.some(
          (v) =>
            v.placa?.toLowerCase().includes(termo) ||
            v.marcaModelo?.toLowerCase().includes(termo)
        )

      const matchTipo =
        filtroTipo === 'TODOS' ||
        (filtroTipo === 'F' && isPF) ||
        (filtroTipo === 'J' && !isPF)

      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && cli.ativo !== false) ||
        (filtroStatus === 'INATIVOS' && cli.ativo === false)

      const qteVeiculos = cli.veiculos?.length || 0
      const matchVeiculos =
        filtroVeiculos === 'TODOS' ||
        (filtroVeiculos === 'COM_VEICULOS' && qteVeiculos > 0) ||
        (filtroVeiculos === 'SEM_VEICULOS' && qteVeiculos === 0)

      return matchBusca && matchTipo && matchStatus && matchVeiculos
    })
  }, [clientes, busca, filtroTipo, filtroStatus, filtroVeiculos])

  const filtrosAtivos =
    filtroTipo !== 'TODOS' ||
    filtroStatus !== 'TODOS' ||
    filtroVeiculos !== 'TODOS'

  const abrirNovo = useCallback(() => {
    setClienteEmEdicao(null)
    setModalAberto(true)
  }, [])

  const abrirEditar = useCallback((cli) => {
    setClienteEmEdicao(cli)
    setModalAberto(true)
  }, [])

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setClienteEmEdicao(null)
  }, [])

  const abrirFrota = useCallback((cli) => {
    setClienteFrotaModal(cli)
  }, [])

  const fecharFrota = useCallback(() => {
    setClienteFrotaModal(null)
  }, [])

  const salvarCliente = useCallback(
    async (dadosCliente) => {
      try {
        const salvo = await clientesRepository.salvarCliente(dadosCliente)
        // Se houver veículos pendentes para salvar no cliente
        if (Array.isArray(dadosCliente.veiculos) && dadosCliente.veiculos.length > 0) {
          for (const v of dadosCliente.veiculos) {
            try {
              await veiculosRepository.salvarVeiculo({
                ...v,
                clienteId: salvo.id,
              })
            } catch (errV) {
              console.error('Erro ao salvar veículo do cliente:', errV)
              toast.error(errV.message || 'Erro ao salvar veículo do cliente.')
            }
          }
        }
        toast.success(`Cliente "${salvo.nome}" salvo com sucesso!`)
        setModalAberto(false)
        setClienteEmEdicao(null)
        await recarregar()
        return salvo
      } catch (err) {
        toast.error(err.message || 'Erro ao salvar cliente.')
        throw err
      }
    },
    [recarregar]
  )

  const alternarStatus = useCallback(
    async (val) => {
      const cli = clientes.find((c) => c.value === val || c.id === val)
      if (!cli) return
      const novoStatus = !(cli.ativo !== false)
      try {
        await clientesRepository.salvarCliente({
          ...cli,
          ativo: novoStatus,
        })
        toast.info(
          `Status do cliente alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`
        )
        await recarregar()
      } catch (err) {
        toast.error(err.message || 'Erro ao alternar status do cliente.')
      }
    },
    [clientes, recarregar]
  )

  const iniciarExclusao = useCallback((val, nome) => {
    setClienteParaExcluir({ val, nome })
  }, [])

  const cancelarExclusao = useCallback(() => {
    setClienteParaExcluir(null)
  }, [])

  const confirmarExclusao = useCallback(async () => {
    if (!clienteParaExcluir) return
    const { val, nome } = clienteParaExcluir
    try {
      await clientesRepository.excluirCliente(val)
      toast.success(`Cliente "${nome}" excluído com sucesso.`)
      setClienteParaExcluir(null)
      await recarregar()
    } catch (err) {
      toast.error(err.message || 'Erro ao excluir cliente.')
    }
  }, [clienteParaExcluir, recarregar])

  const excluirDireto = useCallback(
    async (val) => {
      try {
        await clientesRepository.excluirCliente(val)
        toast.success('Cliente excluído com sucesso.')
        setModalAberto(false)
        setClienteEmEdicao(null)
        await recarregar()
      } catch (err) {
        toast.error(err.message || 'Erro ao excluir cliente.')
      }
    },
    [recarregar]
  )

  const limparFiltros = useCallback(() => {
    setBusca('')
    setFiltroTipo('TODOS')
    setFiltroStatus('TODOS')
    setFiltroVeiculos('TODOS')
  }, [])

  return {
    clientes,
    carregando,
    erro,
    recarregar,
    recarregarClientes: recarregar,
    metricas,
    busca,
    setBusca,
    filtroTipo,
    setFiltroTipo,
    filtroStatus,
    setFiltroStatus,
    filtroVeiculos,
    setFiltroVeiculos,
    filtrosAtivos,
    limparFiltros,
    clientesFiltrados,
    modalAberto,
    abrirNovo,
    abrirEditar,
    fecharModal,
    clienteEmEdicao,
    clienteFrotaModal,
    abrirFrota,
    fecharFrota,
    clienteParaExcluir,
    iniciarExclusao,
    cancelarExclusao,
    confirmarExclusao,
    excluirDireto,
    salvarCliente,
    alternarStatus,
  }
}
