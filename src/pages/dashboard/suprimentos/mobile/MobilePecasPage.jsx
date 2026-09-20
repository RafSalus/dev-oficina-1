import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  Package,
  Plus,
  MagnifyingGlass,
  FunnelSimple,
  Barcode,
  ArrowsLeftRight,
  WarningCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  salvarPecasCadastradas,
  CATEGORIAS_PECAS_OPCOES,
} from '../../../../constants/cadastrosSuprimentosData'
import { formatarNCM } from '../../../../utils/fiscalValidators'
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { MobilePecaFormModal } from './MobilePecaFormModal'
import { MobileEstoqueMovimentoModal } from './MobileEstoqueMovimentoModal'

function StatChip({ label, value, dark, warn }) {
  return (
    <div
      className={`shrink-0 min-w-[112px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : warn ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : warn ? 'text-amber-700' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : warn ? 'text-amber-800' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

function PecaCard({ peca, onClick, onMovimentar }) {
  const estoqueAtual = Number(peca.estoqueAtual) || 0
  const estoqueMinimo = Number(peca.estoqueMinimo) || 0
  const precisaReposicao = estoqueAtual <= estoqueMinimo

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono font-black text-xs text-[#101828]">{peca.codigo}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              peca.ativo ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-[#f2f4f7] text-[#667085] border border-[#e4e7ec]'
            }`}
          >
            {peca.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <p className="text-sm font-extrabold text-[#101828] truncate">{peca.nome}</p>

        <div className="flex items-center gap-1.5 flex-wrap mt-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054]">
            {peca.categoria || 'Geral'}
          </span>
          <span className="text-[10px] font-mono text-[#667085]">[{peca.unidade}]</span>
          {peca.gtin && peca.gtin !== 'SEM GTIN' && (
            <span className="text-[10px] font-mono text-[#667085] flex items-center gap-0.5">
              <Barcode size={11} />
              {peca.gtin}
            </span>
          )}
        </div>

        <p className="text-[10.5px] font-mono text-[#98a2b3] mt-1">NCM {formatarNCM(peca.ncm)}</p>

        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
          <div>
            <span className="block text-[9.5px] uppercase font-bold text-[#98a2b3]">Estoque</span>
            <span className={`font-mono font-bold text-xs ${precisaReposicao ? 'text-amber-700' : 'text-[#101828]'}`}>
              {estoqueAtual} {peca.unidade}
              {precisaReposicao && (
                <WarningCircle size={12} weight="fill" className="inline ml-1 -mt-0.5 text-amber-600" />
              )}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[9.5px] uppercase font-bold text-[#98a2b3]">Venda</span>
            <span className="font-black text-[#101828] text-sm">R$ {Number(peca.precoVenda || 0).toFixed(2)}</span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMovimentar(peca)
        }}
        className="w-full h-9 mt-3 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5 active:bg-[#f8fafc]"
      >
        <ArrowsLeftRight size={14} weight="bold" />
        Movimentar Estoque
      </button>
    </div>
  )
}

export function MobilePecasPage() {
  const [pecas, setPecas] = useState(() => carregarPecasCadastradas())
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [filtroEstoque, setFiltroEstoque] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [pecaEmEdicao, setPecaEmEdicao] = useState(null)
  const [modalMovimentoAberto, setModalMovimentoAberto] = useState(false)
  const [pecaParaMovimento, setPecaParaMovimento] = useState(null)

  useEffect(() => {
    const sincronizar = () => setPecas(carregarPecasCadastradas())
    window.addEventListener('storage', sincronizar)
    window.addEventListener('dev_oficina_pecas_updated', sincronizar)
    window.addEventListener('dev_oficina_estoque_updated', sincronizar)
    return () => {
      window.removeEventListener('storage', sincronizar)
      window.removeEventListener('dev_oficina_pecas_updated', sincronizar)
      window.removeEventListener('dev_oficina_estoque_updated', sincronizar)
    }
  }, [])

  const metricas = useMemo(() => {
    const total = pecas.length
    const valorCustoTotal = pecas.reduce((acc, p) => acc + (Number(p.precoCusto) || 0) * (Number(p.estoqueAtual) || 0), 0)
    const valorVendaTotal = pecas.reduce((acc, p) => acc + (Number(p.precoVenda) || 0) * (Number(p.estoqueAtual) || 0), 0)
    const abaixoMinimo = pecas.filter((p) => Number(p.estoqueAtual) <= Number(p.estoqueMinimo)).length
    return {
      total,
      valorCustoTotal: valorCustoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      valorVendaTotal: valorVendaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      abaixoMinimo,
    }
  }, [pecas])

  const opcoesFiltroCategoria = [{ value: 'TODAS', label: 'Todas as Categorias' }, ...CATEGORIAS_PECAS_OPCOES]
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

  const pecasFiltradas = useMemo(() => {
    return pecas.filter((peca) => {
      const termo = busca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        peca.nome?.toLowerCase().includes(termo) ||
        peca.codigo?.toLowerCase().includes(termo) ||
        peca.codigoFabricante?.toLowerCase().includes(termo) ||
        peca.gtin?.toLowerCase().includes(termo) ||
        peca.ncm?.toLowerCase().includes(termo) ||
        peca.localizacao?.toLowerCase().includes(termo)
      const matchCategoria = filtroCategoria === 'TODAS' || peca.categoria === filtroCategoria
      const estoqueAtual = Number(peca.estoqueAtual) || 0
      const estoqueMinimo = Number(peca.estoqueMinimo) || 0
      const matchEstoque =
        filtroEstoque === 'TODOS' ||
        (filtroEstoque === 'BAIXO' && estoqueAtual <= estoqueMinimo) ||
        (filtroEstoque === 'NORMAL' && estoqueAtual > estoqueMinimo)
      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && peca.ativo) ||
        (filtroStatus === 'INATIVOS' && !peca.ativo)
      return matchBusca && matchCategoria && matchEstoque && matchStatus
    })
  }, [pecas, busca, filtroCategoria, filtroEstoque, filtroStatus])

  const filtrosAtivos = filtroCategoria !== 'TODAS' || filtroEstoque !== 'TODOS' || filtroStatus !== 'TODOS'

  const handleAbrirNovo = () => {
    setPecaEmEdicao(null)
    setModalAberto(true)
  }

  const handleSalvarPeca = (dados) => {
    const existe = pecas.some((p) => p.id === dados.id)
    const novaLista = existe ? pecas.map((p) => (p.id === dados.id ? dados : p)) : [dados, ...pecas]
    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
    toast.success(existe ? `Peça "${dados.nome}" atualizada!` : `Peça "${dados.nome}" cadastrada!`)
    setModalAberto(false)
  }

  const handleExcluirPeca = (id) => {
    const novaLista = pecas.filter((p) => p.id !== id)
    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
    toast.success('Peça excluída do almoxarifado.')
    setModalAberto(false)
  }

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] flex items-center gap-1.5">
            <Package size={16} className="text-[#0284c7]" weight="bold" />
            Peças e Produtos
          </h1>
          <p className="text-[11px] text-[#667085] truncate">Almoxarifado com GTIN, NCM, CFOP e estoque mínimo</p>
        </div>
        <button
          type="button"
          onClick={handleAbrirNovo}
          aria-label="Nova Peça"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Total de Itens" value={metricas.total} dark />
        <StatChip label="Valor em Custo" value={`R$ ${metricas.valorCustoTotal}`} />
        <StatChip label="Potencial Venda" value={`R$ ${metricas.valorVendaTotal}`} />
        <StatChip label="Reposição" value={metricas.abaixoMinimo} warn={metricas.abaixoMinimo > 0} />
      </div>

      <div className="relative mb-2.5">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar SKU, nome, GTIN, NCM ou local..."
          className={`${inputBaseClass} pl-10`}
        />
      </div>

      <button
        type="button"
        onClick={() => setFiltrosAbertos((v) => !v)}
        className={`w-full h-10 mb-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
          filtrosAtivos ? 'border-[#0284c7] text-[#0284c7] bg-[#e0f2fe]' : 'border-[#d0d5dd] text-[#344054] bg-white'
        }`}
      >
        <FunnelSimple size={15} weight="bold" />
        Filtros {filtrosAtivos ? '(ativos)' : ''}
      </button>

      {filtrosAbertos && (
        <div className="space-y-2 mb-3">
          <Select
            value={opcoesFiltroCategoria.find((o) => o.value === filtroCategoria)}
            onChange={(opt) => setFiltroCategoria(opt ? opt.value : 'TODAS')}
            options={opcoesFiltroCategoria}
            styles={mobileSelectStyles}
            placeholder="Categoria"
          />
          <Select
            value={opcoesFiltroEstoque.find((o) => o.value === filtroEstoque)}
            onChange={(opt) => setFiltroEstoque(opt ? opt.value : 'TODOS')}
            options={opcoesFiltroEstoque}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Estoque"
          />
          <Select
            value={opcoesFiltroStatus.find((o) => o.value === filtroStatus)}
            onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
            options={opcoesFiltroStatus}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Status"
          />
        </div>
      )}

      {pecasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <Package size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Nenhuma peça encontrada</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            {busca || filtrosAtivos ? 'Ajuste a busca ou os filtros aplicados.' : 'Nenhuma peça cadastrada no almoxarifado ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pecasFiltradas.map((peca) => (
            <PecaCard
              key={peca.id}
              peca={peca}
              onClick={() => {
                setPecaEmEdicao(peca)
                setModalAberto(true)
              }}
              onMovimentar={(p) => {
                setPecaParaMovimento(p)
                setModalMovimentoAberto(true)
              }}
            />
          ))}
        </div>
      )}

      <MobilePecaFormModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarPeca}
        onExcluir={handleExcluirPeca}
        pecaParaEditar={pecaEmEdicao}
      />

      <MobileEstoqueMovimentoModal
        isOpen={modalMovimentoAberto}
        onClose={() => {
          setModalMovimentoAberto(false)
          setPecaParaMovimento(null)
        }}
        pecaPreSelecionada={pecaParaMovimento}
        onSucesso={() => setPecas(carregarPecasCadastradas())}
      />
    </div>
  )
}
