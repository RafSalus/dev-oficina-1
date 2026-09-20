import React, { useState, useMemo } from 'react'
import Select from 'react-select'
import {
  Wrench,
  Plus,
  MagnifyingGlass,
  FunnelSimple,
  Clock,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarServicosCadastrados,
  salvarServicosCadastrados,
  CATEGORIAS_SERVICOS_OPCOES,
} from '../../../../constants/cadastrosSuprimentosData'
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { MobileServicoFormModal } from './MobileServicoFormModal'

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

function ServicoCard({ servico, onClick, onAlternarStatus }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5 active:bg-[#f8fafc] transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="font-mono font-black text-xs text-[#101828]">{servico.codigo}</span>
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation()
            onAlternarStatus(servico.id)
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            servico.ativo
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'bg-[#f2f4f7] text-[#667085] border border-[#e4e7ec]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${servico.ativo ? 'bg-sky-600' : 'bg-[#98a2b3]'}`} />
          {servico.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <p className="text-sm font-extrabold text-[#101828] truncate">{servico.nome}</p>
      {servico.descricao && (
        <p className="text-xs text-[#667085] mt-0.5 truncate">{servico.descricao}</p>
      )}

      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054]">
          {servico.categoria}
        </span>
        {servico.tempoEstimado && (
          <span className="text-[10px] font-semibold text-[#667085] flex items-center gap-1">
            <Clock size={11} />
            {servico.tempoEstimado}h
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
        <span className="text-[10.5px] text-[#667085]">CNAE {servico.cnae || '-'}</span>
        <span className="font-black text-[#101828] text-sm">
          R$ {Number(servico.valorMaoDeObra || 0).toFixed(2)}
        </span>
      </div>
    </button>
  )
}

export function MobileServicosPage() {
  const [servicos, setServicos] = useState(() => carregarServicosCadastrados())
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null)

  const metricas = useMemo(() => {
    const total = servicos.length
    const ativos = servicos.filter((s) => s.ativo).length
    const somaValores = servicos.reduce((acc, s) => acc + (Number(s.valorMaoDeObra) || 0), 0)
    const mediaValor = total > 0 ? somaValores / total : 0
    const categorias = new Set(servicos.map((s) => s.categoria)).size
    return { total, ativos, mediaValor: mediaValor.toFixed(2), categorias }
  }, [servicos])

  const opcoesFiltroCategoria = [{ value: 'TODAS', label: 'Todas as Categorias' }, ...CATEGORIAS_SERVICOS_OPCOES]
  const opcoesFiltroStatus = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'ATIVOS', label: 'Somente Ativos' },
    { value: 'INATIVOS', label: 'Somente Inativos' },
  ]

  const servicosFiltrados = useMemo(() => {
    return servicos.filter((servico) => {
      const termo = busca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        servico.nome?.toLowerCase().includes(termo) ||
        servico.codigo?.toLowerCase().includes(termo) ||
        servico.descricao?.toLowerCase().includes(termo) ||
        servico.cnae?.toLowerCase().includes(termo)
      const matchCategoria = filtroCategoria === 'TODAS' || servico.categoria === filtroCategoria
      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && servico.ativo) ||
        (filtroStatus === 'INATIVOS' && !servico.ativo)
      return matchBusca && matchCategoria && matchStatus
    })
  }, [servicos, busca, filtroCategoria, filtroStatus])

  const filtrosAtivos = filtroCategoria !== 'TODAS' || filtroStatus !== 'TODOS'

  const handleAbrirNovo = () => {
    setServicoEmEdicao(null)
    setModalAberto(true)
  }

  const handleAbrirEditar = (servico) => {
    setServicoEmEdicao(servico)
    setModalAberto(true)
  }

  const handleSalvarServico = (dadosServico) => {
    const existe = servicos.some((s) => s.id === dadosServico.id)
    const novaLista = existe
      ? servicos.map((s) => (s.id === dadosServico.id ? dadosServico : s))
      : [dadosServico, ...servicos]
    setServicos(novaLista)
    salvarServicosCadastrados(novaLista)
    toast.success(existe ? `Serviço "${dadosServico.nome}" atualizado!` : `Serviço "${dadosServico.nome}" cadastrado!`)
    setModalAberto(false)
  }

  const handleAlternarStatus = (id) => {
    const novaLista = servicos.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s))
    setServicos(novaLista)
    salvarServicosCadastrados(novaLista)
  }

  const handleExcluirServico = (id) => {
    const novaLista = servicos.filter((s) => s.id !== id)
    setServicos(novaLista)
    salvarServicosCadastrados(novaLista)
    toast.success('Serviço excluído do catálogo.')
    setModalAberto(false)
  }

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Cabeçalho e Ação Única */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] flex items-center gap-1.5">
            <Wrench size={16} className="text-[#0284c7]" weight="bold" />
            Serviços e Mão de Obra
          </h1>
          <p className="text-[11px] text-[#667085] truncate">Catálogo técnico com parâmetros fiscais de NFS-e</p>
        </div>
        <button
          type="button"
          onClick={handleAbrirNovo}
          aria-label="Novo Serviço"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      {/* Métricas */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Total" value={metricas.total} dark />
        <StatChip label="Ativos" value={metricas.ativos} />
        <StatChip label="Mão de Obra Média" value={`R$ ${metricas.mediaValor}`} />
        <StatChip label="Categorias" value={metricas.categorias} />
      </div>

      {/* Busca */}
      <div className="relative mb-2.5">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar nome, código ou CNAE..."
          className={`${inputBaseClass} pl-10`}
        />
      </div>

      {/* Filtros */}
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
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Categoria"
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

      {/* Lista */}
      {servicosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <Wrench size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Nenhum serviço encontrado</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            {busca || filtrosAtivos
              ? 'Ajuste a busca ou os filtros para encontrar o serviço desejado.'
              : 'Nenhum serviço cadastrado no catálogo ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {servicosFiltrados.map((servico) => (
            <ServicoCard
              key={servico.id}
              servico={servico}
              onClick={() => handleAbrirEditar(servico)}
              onAlternarStatus={handleAlternarStatus}
            />
          ))}
        </div>
      )}

      <MobileServicoFormModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarServico}
        onExcluir={handleExcluirServico}
        servicoParaEditar={servicoEmEdicao}
      />
    </div>
  )
}
