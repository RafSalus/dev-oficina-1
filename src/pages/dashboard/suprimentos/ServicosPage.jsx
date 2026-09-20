import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  Wrench,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  CheckCircle,
  XCircle,
  CurrencyDollar,
  Clock,
  Tag,
  Receipt,
  FileText,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useIsMobile } from '../../../hooks/useIsMobile'
import {
  carregarServicosCadastrados,
  salvarServicosCadastrados,
  CATEGORIAS_SERVICOS_OPCOES,
} from '../../../constants/cadastrosSuprimentosData'
import { ServicoModalForm } from '../../../components/suprimentos/ServicoModalForm'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { MobileServicosPage } from './mobile/MobileServicosPage'

export function ServicosPage() {
  const isMobile = useIsMobile()
  const [servicos, setServicos] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  const [modalAberto, setModalAberto] = useState(false)
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null)

  // Carrega do localStorage ao montar
  useEffect(() => {
    const dados = carregarServicosCadastrados()
    setServicos(dados)

    const handleStorageChange = () => {
      setServicos(carregarServicosCadastrados())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Métricas rápidas
  const metricas = useMemo(() => {
    const total = servicos.length
    const ativos = servicos.filter((s) => s.ativo).length
    const somaValores = servicos.reduce((acc, s) => acc + (Number(s.valorMaoDeObra) || 0), 0)
    const mediaValor = total > 0 ? somaValores / total : 0
    const categoriasUnicas = new Set(servicos.map((s) => s.categoria)).size

    return {
      total,
      ativos,
      mediaValor: mediaValor.toFixed(2),
      categorias: categoriasUnicas,
    }
  }, [servicos])

  // Filtragem da listagem
  const servicosFiltrados = useMemo(() => {
    return servicos.filter((servico) => {
      // Filtro de busca textual
      const termo = busca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        servico.nome?.toLowerCase().includes(termo) ||
        servico.codigo?.toLowerCase().includes(termo) ||
        servico.descricao?.toLowerCase().includes(termo) ||
        servico.cnae?.toLowerCase().includes(termo)

      // Filtro por Categoria
      const matchCategoria =
        filtroCategoria === 'TODAS' || servico.categoria === filtroCategoria

      // Filtro por Status
      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && servico.ativo) ||
        (filtroStatus === 'INATIVOS' && !servico.ativo)

      return matchBusca && matchCategoria && matchStatus
    })
  }, [servicos, busca, filtroCategoria, filtroStatus])

  // Abertura do formulário
  const handleAbrirNovo = () => {
    setServicoEmEdicao(null)
    setModalAberto(true)
  }

  const handleAbrirEditar = (servico) => {
    setServicoEmEdicao(servico)
    setModalAberto(true)
  }

  // Salvar serviço (criação ou atualização)
  const handleSalvarServico = (dadosServico) => {
    let novaLista = []
    const existe = servicos.some((s) => s.id === dadosServico.id)

    if (existe) {
      novaLista = servicos.map((s) => (s.id === dadosServico.id ? dadosServico : s))
      toast.success(`Serviço "${dadosServico.nome}" atualizado com sucesso!`)
    } else {
      novaLista = [dadosServico, ...servicos]
      toast.success(`Serviço "${dadosServico.nome}" cadastrado com sucesso!`)
    }

    setServicos(novaLista)
    salvarServicosCadastrados(novaLista)
  }

  // Alternar status do serviço
  const handleAlternarStatus = (id) => {
    const novaLista = servicos.map((s) => {
      if (s.id === id) {
        const novoStatus = !s.ativo
        toast.info(`Status do serviço alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`)
        return { ...s, ativo: novoStatus }
      }
      return s
    })
    setServicos(novaLista)
    salvarServicosCadastrados(novaLista)
  }

  // Excluir serviço
  const handleExcluirServico = (id, nome) => {
    toast(`Excluir o serviço "${nome}"?`, {
      description: 'Esta operação removerá o item do catálogo.',
      action: {
        label: 'Confirmar',
        onClick: () => {
          setServicos((prev) => {
            const novaLista = prev.filter((s) => s.id !== id)
            salvarServicosCadastrados(novaLista)
            return novaLista
          })
          toast.success(`Serviço "${nome}" excluído.`)
        },
      },
    })
  }

  // Opções para os filtros react-select
  const opcoesFiltroCategoria = [
    { value: 'TODAS', label: 'Todas as Categorias' },
    ...CATEGORIAS_SERVICOS_OPCOES,
  ]

  const opcoesFiltroStatus = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'ATIVOS', label: 'Somente Ativos' },
    { value: 'INATIVOS', label: 'Somente Inativos' },
  ]

  if (isMobile) {
    return <MobileServicosPage />
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Wrench size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Serviços e Mão de Obra</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Catálogo de serviços técnicos da oficina com tempo padrão e parâmetros fiscais para NFS-e
              </p>
            </div>
          </div>

          {/* Botão Único de Ação (Regra 12: Sem redundância) */}
          <button
            type="button"
            onClick={handleAbrirNovo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            <span>Novo Serviço</span>
          </button>
        </div>

        {/* Resumo de Indicadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total de Serviços
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Tag size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Mão de Obra Média
              </span>
              <span className="text-base font-bold text-slate-900">R$ {metricas.mediaValor}</span>
            </div>
            <CurrencyDollar size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Serviços Ativos
              </span>
              <span className="text-base font-bold text-sky-700">{metricas.ativos}</span>
            </div>
            <CheckCircle size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Categorias Homologadas
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.categorias}</span>
            </div>
            <Wrench size={20} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center gap-3 shrink-0">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome do serviço, código SKU, CNAE ou descrição..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
          />
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-56">
            <Select
              value={opcoesFiltroCategoria.find((opt) => opt.value === filtroCategoria)}
              onChange={(opt) => setFiltroCategoria(opt ? opt.value : 'TODAS')}
              options={opcoesFiltroCategoria}
              styles={customSelectStyles}
              placeholder="Categoria"
              isSearchable={false}
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={opcoesFiltroStatus.find((opt) => opt.value === filtroStatus)}
              onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
              options={opcoesFiltroStatus}
              styles={customSelectStyles}
              placeholder="Status"
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Serviços com Scroll Oculto (Regra 11) */}
      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {servicosFiltrados.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Wrench size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhum serviço encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {busca || filtroCategoria !== 'TODAS' || filtroStatus !== 'TODOS'
                  ? 'Nenhum resultado corresponde aos filtros aplicados.'
                  : 'Nenhum serviço cadastrado no catálogo ainda.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Código SKU</th>
                  <th className="py-3 px-4">Serviço Técnico</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Mão de Obra</th>
                  <th className="py-3 px-4 text-center">Tempo Est.</th>
                  <th className="py-3 px-4">Parâmetros NFS-e</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {servicosFiltrados.map((servico) => (
                  <tr
                    key={servico.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {servico.codigo}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900">{servico.nome}</div>
                      {servico.descricao && (
                        <div className="text-[11px] text-slate-500 truncate max-w-sm">
                          {servico.descricao}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {servico.categoria}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono">
                      R$ {Number(servico.valorMaoDeObra || 0).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      {servico.tempoEstimado ? `${servico.tempoEstimado}h` : '-'}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <div>CNAE: {servico.cnae || '-'}</div>
                      <div className="text-slate-400">
                        IBPT: {servico.codigoServicoIBPT || '-'} • ISS: {servico.aliquotaISS || 5}%
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleAlternarStatus(servico.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          servico.ativo
                            ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Clique para alternar o status"
                      >
                        {servico.ativo ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                            <span>Ativo</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>Inativo</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleAbrirEditar(servico)}
                          className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Editar Serviço"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExcluirServico(servico.id, servico.nome)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Excluir Serviço"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Cadastro e Edição */}
      <ServicoModalForm
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarServico}
        servicoParaEditar={servicoEmEdicao}
      />
    </div>
  )
}
