import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  carregarFuncionarios,
  salvarFuncionario,
  alternarStatusFuncionario,
  excluirFuncionario,
} from '../../../../repositories/funcionariosRepository'
import { toast } from 'sonner'

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtroCargo, setFiltroCargo] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [termoBusca, setTermoBusca] = useState('')

  const recarregar = useCallback(async () => {
    try {
      const dados = await carregarFuncionarios()
      setFuncionarios(dados)
    } catch (err) {
      console.error('Erro ao carregar colaboradores:', err)
      toast.error('Erro ao carregar lista de colaboradores.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    recarregar()

    const handleAtualizacao = () => {
      recarregar()
    }

    window.addEventListener('dev_oficina_funcionarios_updated', handleAtualizacao)
    window.addEventListener('storage', handleAtualizacao)

    return () => {
      window.removeEventListener('dev_oficina_funcionarios_updated', handleAtualizacao)
      window.removeEventListener('storage', handleAtualizacao)
    }
  }, [recarregar])

  const salvar = async (dados) => {
    try {
      const salvo = await salvarFuncionario(dados)
      toast.success(
        dados.id
          ? `Colaborador "${salvo.nome}" atualizado com sucesso.`
          : `Colaborador "${salvo.nome}" cadastrado com sucesso.`
      )
      await recarregar()
      return salvo
    } catch (err) {
      console.error('Erro ao salvar colaborador:', err)
      toast.error('Não foi possível salvar o colaborador.')
      throw err
    }
  }

  const alternarStatus = async (id, statusAtual) => {
    try {
      const novoStatus = !statusAtual
      const atualizado = await alternarStatusFuncionario(id, novoStatus)
      if (atualizado) {
        toast.info(
          `Colaborador "${atualizado.nome}" ${novoStatus ? 'ativado' : 'inativado'} no sistema.`
        )
        await recarregar()
      }
      return atualizado
    } catch (err) {
      console.error('Erro ao alternar status do colaborador:', err)
      toast.error('Erro ao alterar status do colaborador.')
      throw err
    }
  }

  const excluir = async (id, nome) => {
    try {
      const sucesso = await excluirFuncionario(id)
      if (sucesso) {
        toast.success(`Colaborador "${nome}" removido do quadro com sucesso.`)
        await recarregar()
      }
      return sucesso
    } catch (err) {
      console.error('Erro ao excluir colaborador:', err)
      toast.error('Erro ao remover colaborador.')
      throw err
    }
  }

  // Filtragem
  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((f) => {
      // Filtro de Status
      if (filtroStatus === 'ATIVO' && !f.ativo) return false
      if (filtroStatus === 'INATIVO' && f.ativo) return false

      // Filtro de Cargo
      if (filtroCargo !== 'TODOS' && f.cargo !== filtroCargo) return false

      // Busca textual
      if (termoBusca.trim()) {
        const termo = termoBusca.toLowerCase().trim()
        const matchNome = f.nome?.toLowerCase().includes(termo)
        const matchCpf = f.cpf?.toLowerCase().includes(termo)
        const matchTelefone = f.telefone?.toLowerCase().includes(termo)
        const matchCargo = f.cargoLabel?.toLowerCase().includes(termo)
        const matchEspecialidade = f.especialidade?.toLowerCase().includes(termo)
        const matchEmail = f.email?.toLowerCase().includes(termo)
        if (!matchNome && !matchCpf && !matchTelefone && !matchCargo && !matchEspecialidade && !matchEmail) {
          return false
        }
      }

      return true
    })
  }, [funcionarios, filtroStatus, filtroCargo, termoBusca])

  // Indicadores métricos para cabeçalho
  const metricas = useMemo(() => {
    const total = funcionarios.length
    const ativos = funcionarios.filter((f) => f.ativo).length
    const inativos = total - ativos
    const mecanicos = funcionarios.filter(
      (f) => f.ativo && (f.cargo === 'mecanico' || f.cargo === 'eletricista' || f.cargo === 'auxiliar')
    ).length
    const secretarias = funcionarios.filter(
      (f) => f.ativo && f.cargo === 'secretaria'
    ).length

    const mecanicosComissao = funcionarios.filter(
      (f) => f.ativo && Number(f.comissaoServicos) > 0
    )
    const mediaComissaoServicos =
      mecanicosComissao.length > 0
        ? (
            mecanicosComissao.reduce((acc, f) => acc + Number(f.comissaoServicos || 0), 0) /
            mecanicosComissao.length
          ).toFixed(1)
        : '0.0'

    return {
      total,
      ativos,
      inativos,
      mecanicos,
      secretarias,
      mediaComissaoServicos,
    }
  }, [funcionarios])

  return {
    funcionarios,
    funcionariosFiltrados,
    carregando,
    filtroCargo,
    setFiltroCargo,
    filtroStatus,
    setFiltroStatus,
    termoBusca,
    setTermoBusca,
    metricas,
    salvar,
    alternarStatus,
    excluir,
    recarregar,
  }
}
