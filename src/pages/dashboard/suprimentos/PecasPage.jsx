import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  Package,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  CheckCircle,
  CurrencyDollar,
  TrendUp,
  WarningCircle,
  Barcode,
  Archive,
  ArrowsLeftRight,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  salvarPecasCadastradas,
  CATEGORIAS_PECAS_OPCOES,
} from '../../../constants/cadastrosSuprimentosData'
import { formatarNCM } from '../../../utils/fiscalValidators'
import { PecaModalForm } from '../../../components/suprimentos/PecaModalForm'
import { EstoqueMovimentoModal } from '../../../components/suprimentos/EstoqueMovimentoModal'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'

export function PecasPage() {
  const [pecas, setPecas] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [filtroEstoque, setFiltroEstoque] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  const [modalAberto, setModalAberto] = useState(false)
  const [pecaEmEdicao, setPecaEmEdicao] = useState(null)

  const [modalMovimentoAberto, setModalMovimentoAberto] = useState(false)
  const [pecaParaMovimento, setPecaParaMovimento] = useState(null)

  // Carrega do localStorage ao montar e sincroniza em tempo real
  useEffect(() => {
    const sincronizarDados = () => {
      setPecas(carregarPecasCadastradas())
    }
    sincronizarDados()

    window.addEventListener('storage', sincronizarDados)
    window.addEventListener('dev_oficina_pecas_updated', sincronizarDados)
    window.addEventListener('dev_oficina_estoque_updated', sincronizarDados)
    return () => {
      window.removeEventListener('storage', sincronizarDados)
      window.removeEventListener('dev_oficina_pecas_updated', sincronizarDados)
      window.removeEventListener('dev_oficina_estoque_updated', sincronizarDados)
    }
  }, [])

  // Métricas rápidas
  const metricas = useMemo(() => {
    const total = pecas.length
    const ativos = pecas.filter((p) => p.ativo).length
    const valorCustoTotal = pecas.reduce(
      (acc, p) => acc + (Number(p.precoCusto) || 0) * (Number(p.estoqueAtual) || 0),
      0
    )
    const valorVendaTotal = pecas.reduce(
      (acc, p) => acc + (Number(p.precoVenda) || 0) * (Number(p.estoqueAtual) || 0),
      0
    )
    const abaixoMinimo = pecas.filter(
      (p) => Number(p.estoqueAtual) <= Number(p.estoqueMinimo)
    ).length

    return {
      total,
      ativos,
      valorCustoTotal: valorCustoTotal.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      valorVendaTotal: valorVendaTotal.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      abaixoMinimo,
    }
  }, [pecas])

  // Filtragem da listagem
  const pecasFiltradas = useMemo(() => {
    return pecas.filter((peca) => {
      // Filtro de busca textual
      const termo = busca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        peca.nome?.toLowerCase().includes(termo) ||
        peca.codigo?.toLowerCase().includes(termo) ||
        peca.categoria?.toLowerCase().includes(termo) ||
        peca.codigoFabricante?.toLowerCase().includes(termo) ||
        peca.gtin?.toLowerCase().includes(termo) ||
        peca.ncm?.toLowerCase().includes(termo) ||
        peca.localizacao?.toLowerCase().includes(termo)

      // Filtro por Categoria
      const matchCategoria =
        filtroCategoria === 'TODAS' || peca.categoria === filtroCategoria

      // Filtro por Nível de Estoque
      const estoqueAtual = Number(peca.estoqueAtual) || 0
      const estoqueMinimo = Number(peca.estoqueMinimo) || 0
      const matchEstoque =
        filtroEstoque === 'TODOS' ||
        (filtroEstoque === 'BAIXO' && estoqueAtual <= estoqueMinimo) ||
        (filtroEstoque === 'NORMAL' && estoqueAtual > estoqueMinimo)

      // Filtro por Status
      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && peca.ativo) ||
        (filtroStatus === 'INATIVOS' && !peca.ativo)

      return matchBusca && matchCategoria && matchEstoque && matchStatus
    })
  }, [pecas, busca, filtroCategoria, filtroEstoque, filtroStatus])

  // Abertura do formulário
  const handleAbrirNovo = () => {
    setPecaEmEdicao(null)
    setModalAberto(true)
  }

  const handleAbrirEditar = (peca) => {
    setPecaEmEdicao(peca)
    setModalAberto(true)
  }

  // Salvar peça
  const handleSalvarPeca = (dadosPeca) => {
    let novaLista = []
    const existe = pecas.some((p) => p.id === dadosPeca.id)

    if (existe) {
      novaLista = pecas.map((p) => (p.id === dadosPeca.id ? dadosPeca : p))
      toast.success(`Peça "${dadosPeca.nome}" atualizada com sucesso!`)
    } else {
      novaLista = [dadosPeca, ...pecas]
      toast.success(`Peça "${dadosPeca.nome}" cadastrada com sucesso!`)
    }

    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
  }

  // Alternar status
  const handleAlternarStatus = (id) => {
    const novaLista = pecas.map((p) => {
      if (p.id === id) {
        const novoStatus = !p.ativo
        toast.info(`Status da peça alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`)
        return { ...p, ativo: novoStatus }
      }
      return p
    })
    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
  }

  // Excluir peça
  const handleExcluirPeca = (id, nome) => {
    toast(`Excluir a peça "${nome}"?`, {
      description: 'Esta operação removerá o item do almoxarifado.',
      action: {
        label: 'Confirmar',
        onClick: () => {
          setPecas((prev) => {
            const novaLista = prev.filter((p) => p.id !== id)
            salvarPecasCadastradas(novaLista)
            return novaLista
          })
          toast.success(`Peça "${nome}" excluída.`)
        },
      },
    })
  }

  const opcoesFiltroCategoria = [
    { value: 'TODAS', label: 'Todas as Categorias' },
    ...CATEGORIAS_PECAS_OPCOES,
  ]

  const opcoesFiltroEstoque = [
    { value: 'TODOS', label: 'Todos os Estoques' },
    { value: 'BAIXO', label: 'Abaixo ou no Mínimo' },
    { value: 'NORMAL', label: 'Estoque Adequado' },
  ]

  const opcoesFiltroStatus = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'ATIVOS', label: 'Somente Ativos' },
    { value: 'INATIVOS', label: 'Somente Inativos' },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
              <Package size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Peças e Produtos</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {metricas.total}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Almoxarifado, catálogo com GTIN/EAN, NCM, CFOP, CST e controle de estoque mínimo
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
            <span>Nova Peça</span>
          </button>
        </div>

        {/* Resumo de Indicadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total de Itens
              </span>
              <span className="text-base font-bold text-slate-900">{metricas.total}</span>
            </div>
            <Archive size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Valor em Estoque (Custo)
              </span>
              <span className="text-base font-bold text-slate-900">R$ {metricas.valorCustoTotal}</span>
            </div>
            <CurrencyDollar size={20} className="text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Potencial Venda Total
              </span>
              <span className="text-base font-bold text-sky-700">R$ {metricas.valorVendaTotal}</span>
            </div>
            <TrendUp size={20} className="text-sky-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Alerta de Reposição
              </span>
              <span className={`text-base font-bold ${metricas.abaixoMinimo > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {metricas.abaixoMinimo} {metricas.abaixoMinimo === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <WarningCircle size={20} className={metricas.abaixoMinimo > 0 ? 'text-amber-500' : 'text-slate-400'} />
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
            placeholder="Buscar por código SKU, nome, GTIN/EAN, NCM ou localização física..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
          />
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={opcoesFiltroCategoria.find((opt) => opt.value === filtroCategoria)}
              onChange={(opt) => setFiltroCategoria(opt ? opt.value : 'TODAS')}
              options={opcoesFiltroCategoria}
              styles={customSelectStyles}
              placeholder="Categoria"
              isSearchable={true}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={opcoesFiltroEstoque.find((opt) => opt.value === filtroEstoque)}
              onChange={(opt) => setFiltroEstoque(opt ? opt.value : 'TODOS')}
              options={opcoesFiltroEstoque}
              styles={customSelectStyles}
              placeholder="Estoque"
              isSearchable={false}
            />
          </div>

          <div className="w-full sm:w-40">
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

      {/* Tabela de Peças com Scroll Oculto (Regra 11) */}
      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {pecasFiltradas.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Package size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhuma peça encontrada</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {busca || filtroEstoque !== 'TODOS' || filtroStatus !== 'TODOS'
                  ? 'Nenhum resultado corresponde aos filtros aplicados.'
                  : 'Nenhuma peça cadastrada no almoxarifado ainda.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Código SKU / Fab.</th>
                  <th className="py-3 px-4">Produto e Local</th>
                  <th className="py-3 px-4">GTIN / EAN</th>
                  <th className="py-3 px-4">Fiscal (NCM / CFOP / CST)</th>
                  <th className="py-3 px-4 text-right">Custo</th>
                  <th className="py-3 px-4 text-right">Venda</th>
                  <th className="py-3 px-4 text-center">Margem</th>
                  <th className="py-3 px-4 text-center">Estoque</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pecasFiltradas.map((peca) => {
                  const estoqueAtual = Number(peca.estoqueAtual) || 0
                  const estoqueMinimo = Number(peca.estoqueMinimo) || 0
                  const precisaReposicao = estoqueAtual <= estoqueMinimo

                  return (
                    <tr
                      key={peca.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-900">{peca.codigo}</div>
                        {peca.codigoFabricante && (
                          <div className="text-[11px] text-slate-400">
                            Fab: {peca.codigoFabricante}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900">{peca.nome}</div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                            {peca.categoria || 'Geral'}
                          </span>
                          <span className="font-mono font-medium text-slate-600">[{peca.unidade}]</span>
                          {peca.localizacao && (
                            <span>• {peca.localizacao}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        {peca.gtin === 'SEM GTIN' ? (
                          <span className="text-slate-400 italic">SEM GTIN</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Barcode size={14} className="text-slate-400" />
                            <span>{peca.gtin}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <div>NCM: {formatarNCM(peca.ncm)}</div>
                        <div className="text-slate-400">
                          CFOP: {peca.cfop} • CST: {peca.cstCsosn}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        R$ {Number(peca.precoCusto || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        R$ {Number(peca.precoVenda || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                          {peca.margemLucro ? `${peca.margemLucro}%` : '0%'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="font-mono font-bold text-slate-900">
                          {estoqueAtual} {peca.unidade}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Mín: {estoqueMinimo}
                        </div>
                        {precisaReposicao && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded">
                            Reposição
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleAlternarStatus(peca.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            peca.ativo
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Clique para alternar o status"
                        >
                          {peca.ativo ? (
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
                            onClick={() => {
                              setPecaParaMovimento(peca)
                              setModalMovimentoAberto(true)
                            }}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                            title="Movimentar Estoque no Almoxarifado"
                          >
                            <ArrowsLeftRight size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAbrirEditar(peca)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                            title="Editar Peça"
                          >
                            <PencilSimple size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExcluirPeca(peca.id, peca.nome)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Excluir Peça"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Cadastro e Edição */}
      <PecaModalForm
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarPeca}
        pecaParaEditar={pecaEmEdicao}
      />

      {/* Modal de Movimentação Rápida de Estoque */}
      <EstoqueMovimentoModal
        isOpen={modalMovimentoAberto}
        onClose={() => {
          setModalMovimentoAberto(false)
          setPecaParaMovimento(null)
        }}
        pecaPreSelecionada={pecaParaMovimento}
        onSucesso={() => {
          setPecas(carregarPecasCadastradas())
        }}
      />
    </div>
  )
}
