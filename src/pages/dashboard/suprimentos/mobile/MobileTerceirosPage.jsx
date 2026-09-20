import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  Buildings,
  Plus,
  MagnifyingGlass,
  FunnelSimple,
  User,
  MapPin,
  WhatsappLogo,
  Package,
  ShieldCheck,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarTerceirosCadastrados,
  salvarTerceirosCadastrados,
  CATEGORIAS_FORNECEDOR_OPCOES,
  RAMOS_FORNECEDOR_OPCOES,
} from '../../../../constants/cadastrosSuprimentosData'
import { formatarCNPJ, formatarTelefone } from '../../../../utils/fiscalValidators'
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { MobileTerceiroFormModal } from './MobileTerceiroFormModal'

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[112px] rounded-xl border p-2.5 ${
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

function FornecedorCard({ forn, onClick }) {
  const foneOriginal = forn.contatoTelefone || forn.contato?.telefone || ''
  const foneNumeros = foneOriginal.replace(/\D/g, '')
  const nomeContato = forn.contatoNome || forn.contato?.nome || '-'
  const cidadeContato = forn.cidade || forn.endereco?.cidade || 'Apucarana'
  const ufContato = forn.uf || forn.endereco?.uf || 'PR'
  const categoriaForn = forn.categoriaFornecedor || 'Serviços Externos'
  const isAutoPeca =
    categoriaForn === 'Autopeças' || categoriaForn === 'Distribuidora' || forn.tipoServico?.toLowerCase().includes('peça')

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5 active:bg-[#f8fafc] transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${
            isAutoPeca ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-[#f2f4f7] text-[#344054] border-[#e4e7ec]'
          }`}
        >
          {isAutoPeca ? <Package size={11} /> : <ShieldCheck size={11} />}
          {categoriaForn}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            forn.ativo ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-[#f2f4f7] text-[#667085] border border-[#e4e7ec]'
          }`}
        >
          {forn.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <p className="text-sm font-extrabold text-[#101828] truncate">{forn.nomeFantasia || forn.razaoSocial}</p>
      {forn.nomeFantasia && forn.nomeFantasia !== forn.razaoSocial && (
        <p className="text-[11px] text-[#667085] truncate">{forn.razaoSocial}</p>
      )}
      <p className="text-[10.5px] text-[#98a2b3] mt-0.5">{forn.tipoServico || 'Geral'}</p>

      <div className="flex items-center gap-1.5 mt-2 font-mono text-[10.5px] text-[#344054]">
        <span>CNPJ {formatarCNPJ(forn.cnpj)}</span>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-[#344054] font-semibold">
            <User size={12} className="text-[#0284c7] shrink-0" />
            <span className="truncate">{nomeContato}</span>
          </div>
          <div className="flex items-center gap-1 text-[10.5px] text-[#667085] mt-0.5">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">
              {cidadeContato} - {ufContato}
            </span>
          </div>
        </div>
        {foneNumeros && (
          <a
            href={`https://wa.me/55${foneNumeros}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#25D366] text-white text-[10.5px] font-bold shrink-0"
          >
            <WhatsappLogo size={13} weight="fill" />
            WhatsApp
          </a>
        )}
      </div>
    </button>
  )
}

export function MobileTerceirosPage() {
  const [fornecedores, setFornecedores] = useState(() => carregarTerceirosCadastrados())
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS')
  const [filtroRamo, setFiltroRamo] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [fornecedorEmEdicao, setFornecedorEmEdicao] = useState(null)

  useEffect(() => {
    const sincronizar = () => setFornecedores(carregarTerceirosCadastrados())
    window.addEventListener('storage', sincronizar)
    return () => window.removeEventListener('storage', sincronizar)
  }, [])

  const metricas = useMemo(() => {
    const total = fornecedores.length
    const ativos = fornecedores.filter((t) => t.ativo).length
    const totalAutoPecas = fornecedores.filter(
      (t) =>
        t.categoriaFornecedor === 'Autopeças' ||
        t.categoriaFornecedor === 'Distribuidora' ||
        t.categoriaFornecedor === 'Ambos' ||
        t.tipoServico?.toLowerCase().includes('peça') ||
        t.tipoServico?.toLowerCase().includes('distribuidora')
    ).length
    const totalServicos = total - totalAutoPecas
    return { total, ativos, totalAutoPecas, totalServicos }
  }, [fornecedores])

  const opcoesFiltroCategoria = [{ value: 'TODOS', label: 'Todas as Categorias' }, ...CATEGORIAS_FORNECEDOR_OPCOES]
  const opcoesFiltroRamo = [{ value: 'TODOS', label: 'Todos os Ramos' }, ...RAMOS_FORNECEDOR_OPCOES]
  const opcoesFiltroStatus = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'ATIVOS', label: 'Somente Ativos' },
    { value: 'INATIVOS', label: 'Somente Inativos' },
  ]

  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter((forn) => {
      const termo = busca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        forn.razaoSocial?.toLowerCase().includes(termo) ||
        forn.nomeFantasia?.toLowerCase().includes(termo) ||
        forn.cnpj?.toLowerCase().includes(termo) ||
        forn.contatoNome?.toLowerCase().includes(termo) ||
        forn.cidade?.toLowerCase().includes(termo)
      const cat = forn.categoriaFornecedor || 'Serviços Externos'
      const matchCategoria = filtroCategoria === 'TODOS' || cat === filtroCategoria
      const matchRamo = filtroRamo === 'TODOS' || forn.tipoServico === filtroRamo
      const matchStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && forn.ativo) ||
        (filtroStatus === 'INATIVOS' && !forn.ativo)
      return matchBusca && matchCategoria && matchRamo && matchStatus
    })
  }, [fornecedores, busca, filtroCategoria, filtroRamo, filtroStatus])

  const filtrosAtivos = filtroCategoria !== 'TODOS' || filtroRamo !== 'TODOS' || filtroStatus !== 'TODOS'

  const handleAbrirNovo = () => {
    setFornecedorEmEdicao(null)
    setModalAberto(true)
  }

  const handleSalvarFornecedor = (dados) => {
    const existe = fornecedores.some((t) => t.id === dados.id)
    const novaLista = existe ? fornecedores.map((t) => (t.id === dados.id ? dados : t)) : [dados, ...fornecedores]
    setFornecedores(novaLista)
    salvarTerceirosCadastrados(novaLista)
    toast.success(
      existe
        ? `Fornecedor "${dados.nomeFantasia || dados.razaoSocial}" atualizado!`
        : `Fornecedor "${dados.nomeFantasia || dados.razaoSocial}" cadastrado!`
    )
    setModalAberto(false)
  }

  const handleExcluirFornecedor = (id) => {
    const novaLista = fornecedores.filter((t) => t.id !== id)
    setFornecedores(novaLista)
    salvarTerceirosCadastrados(novaLista)
    toast.success('Fornecedor excluído do cadastro.')
    setModalAberto(false)
  }

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] flex items-center gap-1.5">
            <Buildings size={16} className="text-[#0284c7]" weight="bold" />
            Fornecedores
          </h1>
          <p className="text-[11px] text-[#667085] truncate">Autopeças, distribuidores e parceiros terceirizados</p>
        </div>
        <button
          type="button"
          onClick={handleAbrirNovo}
          aria-label="Novo Fornecedor"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Total" value={metricas.total} dark />
        <StatChip label="Ativos" value={metricas.ativos} />
        <StatChip label="Autopeças" value={metricas.totalAutoPecas} />
        <StatChip label="Serviços Terceiros" value={metricas.totalServicos} />
      </div>

      <div className="relative mb-2.5">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar razão social, CNPJ, contato ou cidade..."
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
            onChange={(opt) => setFiltroCategoria(opt ? opt.value : 'TODOS')}
            options={opcoesFiltroCategoria}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Categoria"
          />
          <Select
            value={opcoesFiltroRamo.find((o) => o.value === filtroRamo)}
            onChange={(opt) => setFiltroRamo(opt ? opt.value : 'TODOS')}
            options={opcoesFiltroRamo}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Ramo"
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

      {fornecedoresFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <Buildings size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Nenhum fornecedor encontrado</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            {busca || filtrosAtivos ? 'Ajuste a busca ou os filtros aplicados.' : 'Nenhum fornecedor cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {fornecedoresFiltrados.map((forn) => (
            <FornecedorCard
              key={forn.id}
              forn={forn}
              onClick={() => {
                setFornecedorEmEdicao(forn)
                setModalAberto(true)
              }}
            />
          ))}
        </div>
      )}

      <MobileTerceiroFormModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSalvar={handleSalvarFornecedor}
        onExcluir={handleExcluirFornecedor}
        terceiroParaEditar={fornecedorEmEdicao}
      />
    </div>
  )
}
