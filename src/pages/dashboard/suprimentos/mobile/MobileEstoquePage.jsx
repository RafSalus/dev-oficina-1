import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  Archive,
  Package,
  MagnifyingGlass,
  FunnelSimple,
  ArrowsLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsClockwise,
  ClockCounterClockwise,
  ShoppingCart,
  ListBullets,
  MapPin,
  CheckCircle,
  Copy,
  ShareNetwork,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarPecasCadastradas,
  salvarPecasCadastradas,
  carregarMovimentacoesEstoque,
  carregarTerceirosCadastrados,
  CATEGORIAS_PECAS_OPCOES,
} from '../../../../constants/cadastrosSuprimentosData'
import { gerarProximoNumeroCotacao, salvarCotacao } from '../../../../constants/comprasData'
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { MobilePecaFormModal } from './MobilePecaFormModal'
import { MobileEstoqueMovimentoModal } from './MobileEstoqueMovimentoModal'

const extrairTelefoneLimpo = (t) => {
  if (!t) return '43998544106'
  const tel = t.whatsapp || t.contatoTelefone || t.telefone || t.contato?.telefone || ''
  const limpo = String(tel).replace(/\D/g, '')
  return limpo.length >= 8 ? limpo : '43998544106'
}

const extrairTelefoneExibicao = (t) => {
  if (!t) return ''
  return String(t.telefone || t.contatoTelefone || t.contato?.telefone || '')
}

const filtrarFornecedoresAutoPecas = (terceiros) => {
  if (!Array.isArray(terceiros)) return []
  return terceiros.filter((t) => {
    const cat = String(t.categoria || t.categoriaFornecedor || '').toLowerCase()
    const ramo = String(t.ramoAtividade || t.tipoServico || '').toLowerCase()
    return (
      cat.includes('auto') || cat.includes('peça') || cat.includes('peca') || cat.includes('distribuidora') ||
      ramo.includes('auto') || ramo.includes('peça') || ramo.includes('peca') || ramo.includes('distribuidora')
    )
  })
}

function StatChip({ label, value, dark, warn, danger }) {
  return (
    <div
      className={`shrink-0 min-w-[108px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : danger ? 'bg-rose-50 border-rose-200' : warn ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : danger ? 'text-rose-700' : warn ? 'text-amber-700' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : danger ? 'text-rose-800' : warn ? 'text-amber-800' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

const TABS = [
  { value: 'posicao', label: 'Posição', icon: ListBullets },
  { value: 'kardex', label: 'Kardex', icon: ClockCounterClockwise },
  { value: 'reposicao', label: 'Reposição', icon: ShoppingCart },
]

function PosicaoCard({ peca, onEditar, onMovimentar, onKardex }) {
  const estoqueAtual = Number(peca.estoqueAtual) || 0
  const estoqueMinimo = Number(peca.estoqueMinimo) || 0
  const estaZerado = estoqueAtual <= 0
  const estaNoMinimo = estoqueAtual <= estoqueMinimo && !estaZerado
  const proporcao = estoqueMinimo > 0 ? Math.min(100, Math.round((estoqueAtual / (estoqueMinimo * 2)) * 100)) : 100

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <button type="button" onClick={onEditar} className="w-full text-left">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono font-black text-xs text-[#101828]">{peca.codigo}</span>
          {estaZerado ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Zerado</span>
          ) : estaNoMinimo ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Reposição</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-[#0284c7] border border-sky-200">Adequado</span>
          )}
        </div>

        <p className="text-sm font-extrabold text-[#101828] truncate">{peca.nome}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054]">
            {peca.categoria || 'Geral'}
          </span>
          <span className="text-[10.5px] text-[#667085] flex items-center gap-1">
            <MapPin size={11} />
            {peca.localizacao || 'Almoxarifado Central'}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <span className="font-mono font-bold text-sm text-[#101828]">
            {estoqueAtual} <span className="text-[#98a2b3] text-[10.5px] font-medium">/ mín {estoqueMinimo} {peca.unidade || 'UN'}</span>
          </span>
          <span className="font-mono text-xs font-bold text-[#101828]">R$ {(estoqueAtual * (Number(peca.precoCusto) || 0)).toFixed(2)}</span>
        </div>
        <div className="w-full mt-1.5 bg-[#f2f4f7] h-1.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${proporcao}%` }}
            className={`h-full rounded-full ${estaZerado ? 'bg-rose-500' : estaNoMinimo ? 'bg-amber-500' : 'bg-[#0284c7]'}`}
          />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMovimentar(peca) }}
          className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5 active:bg-[#f8fafc]"
        >
          <ArrowsLeftRight size={13} weight="bold" />
          Movimentar
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onKardex(peca.codigo) }}
          className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5 active:bg-[#f8fafc]"
        >
          <ClockCounterClockwise size={13} weight="bold" />
          Kardex
        </button>
      </div>
    </div>
  )
}

function KardexCard({ mov }) {
  const dataFormatada = new Date(mov.dataHora).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const isEntrada = mov.tipo === 'ENTRADA'
  const isSaida = mov.tipo === 'SAIDA'
  const Icon = isEntrada ? ArrowDownLeft : isSaida ? ArrowUpRight : ArrowsClockwise

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            isEntrada ? 'bg-sky-50 text-[#0284c7] border-sky-200' : isSaida ? 'bg-[#f2f4f7] text-[#344054] border-[#e4e7ec]' : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <Icon size={12} weight="bold" />
          {isEntrada ? 'Entrada' : isSaida ? 'Saída' : 'Ajuste'}
        </span>
        <span className="text-[10.5px] font-mono text-[#667085]">{dataFormatada}</span>
      </div>

      <p className="text-sm font-bold text-[#101828] truncate">{mov.pecaNome}</p>
      <p className="text-[10.5px] font-mono text-[#98a2b3]">{mov.pecaCodigo}</p>

      <div className="flex items-center justify-between mt-2">
        <span className={`font-mono font-bold text-sm ${isEntrada ? 'text-[#0284c7]' : isSaida ? 'text-[#101828]' : 'text-amber-700'}`}>
          {isEntrada ? '+' : isSaida ? '-' : '='}{mov.quantidade} {mov.unidade || 'UN'}
        </span>
        <span className="font-mono text-[10.5px] text-[#667085]">
          {mov.saldoAnterior} → <strong className="text-[#101828]">{mov.saldoNovo}</strong>
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-[#f2f4f7] text-[10.5px] text-[#667085]">
        <p className="truncate">{mov.motivo || 'Lançamento manual'}</p>
        <p className="flex items-center justify-between mt-0.5">
          <span>{mov.documento || 'Sem documento'}</span>
          <span className="font-semibold text-[#344054]">{mov.responsavel || 'Operador'}</span>
        </p>
      </div>
    </div>
  )
}

function ReposicaoCard({ item, onCotar, onEntrada }) {
  const isZerado = item.atual === 0
  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-mono font-black text-xs text-[#101828]">{item.codigo}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isZerado ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {item.atual} {item.unidade || 'UN'}
        </span>
      </div>
      <p className="text-sm font-extrabold text-[#101828] truncate">{item.nome}</p>
      <p className="text-[10.5px] text-[#667085] mt-0.5">{item.categoria} • {item.localizacao || 'Almoxarifado'}</p>

      <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
        <div className="bg-[#f8fafc] rounded-lg py-1.5">
          <span className="block text-[9px] uppercase font-bold text-[#98a2b3]">Mínimo</span>
          <span className="font-mono font-bold text-xs text-[#344054]">{item.min}</span>
        </div>
        <div className="bg-[#f8fafc] rounded-lg py-1.5">
          <span className="block text-[9px] uppercase font-bold text-[#98a2b3]">Déficit</span>
          <span className="font-mono font-bold text-xs text-rose-600">{item.deficit > 0 ? `-${item.deficit}` : '0'}</span>
        </div>
        <div className="bg-sky-50 rounded-lg py-1.5">
          <span className="block text-[9px] uppercase font-bold text-[#0369a1]">Sugestão</span>
          <span className="font-mono font-extrabold text-xs text-[#0284c7]">{item.sugestaoCompra}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
        <span className="text-[10.5px] text-[#667085]">Investimento estimado</span>
        <span className="font-mono font-bold text-sm text-[#101828]">R$ {item.custoEstimado.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2.5">
        <button
          type="button"
          onClick={() => onEntrada(item)}
          className="h-9 rounded-lg bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <ArrowDownLeft size={13} weight="bold" />
          Entrada
        </button>
        <button
          type="button"
          onClick={() => onCotar(item)}
          className="h-9 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <ShareNetwork size={13} weight="bold" />
          Cotar
        </button>
      </div>
    </div>
  )
}

export function MobileEstoquePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const [abaAtiva, setAbaAtiva] = useState('posicao')
  const [pecas, setPecas] = useState(() => carregarPecasCadastradas())
  const [movimentacoes, setMovimentacoes] = useState(() => carregarMovimentacoesEstoque())

  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [filtroStatusEstoque, setFiltroStatusEstoque] = useState('TODOS')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  const [buscaKardex, setBuscaKardex] = useState('')
  const [filtroTipoMovimento, setFiltroTipoMovimento] = useState('TODOS')

  const [modalPecaAberto, setModalPecaAberto] = useState(false)
  const [pecaParaEditar, setPecaParaEditar] = useState(null)
  const [modalMovimentoAberto, setModalMovimentoAberto] = useState(false)
  const [pecaParaMovimento, setPecaParaMovimento] = useState(null)

  useEffect(() => {
    const carregarTudo = () => {
      setPecas(carregarPecasCadastradas())
      setMovimentacoes(carregarMovimentacoesEstoque())
    }
    window.addEventListener('storage', carregarTudo)
    window.addEventListener('dev_oficina_pecas_updated', carregarTudo)
    window.addEventListener('dev_oficina_estoque_updated', carregarTudo)
    window.addEventListener('dev_oficina_movimentacoes_updated', carregarTudo)
    return () => {
      window.removeEventListener('storage', carregarTudo)
      window.removeEventListener('dev_oficina_pecas_updated', carregarTudo)
      window.removeEventListener('dev_oficina_estoque_updated', carregarTudo)
      window.removeEventListener('dev_oficina_movimentacoes_updated', carregarTudo)
    }
  }, [])

  const metricas = useMemo(() => {
    const totalItens = pecas.length
    const totalUnidades = pecas.reduce((acc, p) => acc + (Number(p.estoqueAtual) || 0), 0)
    const valorCustoTotal = pecas.reduce((acc, p) => acc + (Number(p.precoCusto) || 0) * (Number(p.estoqueAtual) || 0), 0)
    const itensAbaixoMinimo = pecas.filter((p) => {
      const atual = Number(p.estoqueAtual) || 0
      const min = Number(p.estoqueMinimo) || 0
      return atual <= min && atual > 0
    }).length
    const itensZerados = pecas.filter((p) => (Number(p.estoqueAtual) || 0) <= 0).length
    return {
      totalItens,
      totalUnidades,
      valorCustoTotal: valorCustoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      itensAbaixoMinimo,
      itensZerados,
    }
  }, [pecas])

  const opcoesCategorias = [{ value: 'TODAS', label: 'Todas as Categorias' }, ...CATEGORIAS_PECAS_OPCOES]
  const opcoesStatusEstoque = [
    { value: 'TODOS', label: 'Todos os Níveis' },
    { value: 'ADEQUADO', label: 'Estoque Adequado' },
    { value: 'ALERTA_GERAL', label: 'Alerta de Reposição e Zerados' },
    { value: 'REPOSICAO', label: 'No ou Abaixo do Mínimo' },
    { value: 'ZERADO', label: 'Esgotados / Zerados' },
  ]
  const opcoesTipoMovimento = [
    { value: 'TODOS', label: 'Todos os Tipos' },
    { value: 'ENTRADA', label: 'Entradas (+)' },
    { value: 'SAIDA', label: 'Saídas (-)' },
    { value: 'AJUSTE', label: 'Ajustes de Balanço (=)' },
  ]

  const pecasFiltradas = useMemo(() => {
    return pecas.filter((peca) => {
      const termo = busca.toLowerCase().trim()
      const matchBusca =
        !termo ||
        peca.nome?.toLowerCase().includes(termo) ||
        peca.codigo?.toLowerCase().includes(termo) ||
        peca.codigoFabricante?.toLowerCase().includes(termo) ||
        peca.localizacao?.toLowerCase().includes(termo) ||
        peca.gtin?.toLowerCase().includes(termo)
      const matchCategoria = filtroCategoria === 'TODAS' || peca.categoria === filtroCategoria
      const atual = Number(peca.estoqueAtual) || 0
      const min = Number(peca.estoqueMinimo) || 0
      let matchStatus = true
      if (filtroStatusEstoque === 'ADEQUADO') matchStatus = atual > min
      else if (filtroStatusEstoque === 'REPOSICAO') matchStatus = atual <= min && atual > 0
      else if (filtroStatusEstoque === 'ZERADO') matchStatus = atual <= 0
      else if (filtroStatusEstoque === 'ALERTA_GERAL') matchStatus = atual <= min
      return matchBusca && matchCategoria && matchStatus
    })
  }, [pecas, busca, filtroCategoria, filtroStatusEstoque])

  const itensReposicao = useMemo(() => {
    return pecas
      .filter((p) => (Number(p.estoqueAtual) || 0) <= (Number(p.estoqueMinimo) || 0))
      .map((p) => {
        const atual = Number(p.estoqueAtual) || 0
        const min = Number(p.estoqueMinimo) || 0
        const deficit = Math.max(0, min - atual)
        const sugestaoCompra = deficit > 0 ? deficit + min : min
        return { ...p, atual, min, deficit, sugestaoCompra, custoEstimado: sugestaoCompra * (Number(p.precoCusto) || 0) }
      })
      .sort((a, b) => a.atual - b.atual)
  }, [pecas])

  const totalInvestimentoReposicao = useMemo(() => {
    return itensReposicao.reduce((acc, item) => acc + item.custoEstimado, 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [itensReposicao])

  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((mov) => {
      const termo = buscaKardex.toLowerCase().trim()
      const matchBusca =
        !termo ||
        mov.pecaNome?.toLowerCase().includes(termo) ||
        mov.pecaCodigo?.toLowerCase().includes(termo) ||
        mov.documento?.toLowerCase().includes(termo) ||
        mov.motivo?.toLowerCase().includes(termo) ||
        mov.responsavel?.toLowerCase().includes(termo)
      const matchTipo = filtroTipoMovimento === 'TODOS' || mov.tipo === filtroTipoMovimento
      return matchBusca && matchTipo
    })
  }, [movimentacoes, buscaKardex, filtroTipoMovimento])

  const handleAbrirKardexPeca = (codigoPeca) => {
    setBuscaKardex(codigoPeca)
    setAbaAtiva('kardex')
  }

  const handleSalvarPeca = (dados) => {
    const existe = pecas.some((p) => p.id === dados.id)
    const novaLista = existe ? pecas.map((p) => (p.id === dados.id ? dados : p)) : [dados, ...pecas]
    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
    toast.success(existe ? `Peça "${dados.nome}" atualizada!` : `Peça "${dados.nome}" cadastrada!`)
    setModalPecaAberto(false)
  }

  const handleExcluirPeca = (id) => {
    const novaLista = pecas.filter((p) => p.id !== id)
    setPecas(novaLista)
    salvarPecasCadastradas(novaLista)
    toast.success('Peça excluída do almoxarifado.')
    setModalPecaAberto(false)
  }

  const handleCopiarListaReposicao = () => {
    if (itensReposicao.length === 0) {
      toast.info('Não há itens com necessidade de reposição no momento.')
      return
    }
    let texto = `*PEDIDO DE REPOSIÇÃO DE ESTOQUE - MECÂNICA GABRIEL*\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n`
    itensReposicao.forEach((item, idx) => {
      texto += `${idx + 1}. [${item.codigo}] ${item.nome}\n   - Atual: ${item.atual} | Mín: ${item.min}\n   - Sugestão de Compra: *${item.sugestaoCompra} ${item.unidade || 'UN'}*\n\n`
    })
    texto += `Total de Itens: ${itensReposicao.length}\nEstimativa de Investimento: R$ ${totalInvestimentoReposicao}`
    navigator.clipboard.writeText(texto).then(
      () => toast.success('Lista de reposição copiada com sucesso!'),
      () => toast.error('Erro ao copiar a lista de reposição.')
    )
  }

  const criarCotacaoReposicao = (itens, tituloVeiculo) => {
    const novaId = gerarProximoNumeroCotacao()
    const terceiros = carregarTerceirosCadastrados()
    const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
    const fornecedoresBase = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)
    const fornecedoresIniciais = fornecedoresBase.map((t) => ({
      id: t.id,
      nome: t.nomeFantasia || t.razaoSocial || 'Auto Peças Parceira',
      telefone: extrairTelefoneExibicao(t),
      whatsapp: extrairTelefoneLimpo(t),
      cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
      status: 'AGUARDANDO',
      valorTotal: null,
      tempoEntrega: '1 a 2 horas',
      condicaoPagamento: 'Boleto 30 Dias',
      respostasItens: {},
    }))
    const itensFormatados = itens.map((item, idx) => ({
      id: `it-${Date.now()}-${idx}`,
      codigo: item.codigo || '',
      nome: item.nome || 'Item de Reposição',
      unidade: item.unidade || 'UN',
      quantidade: Number(item.sugestaoCompra || 1),
      marcaSugerida: '',
      observacoes: `Reposição de almoxarifado (Estoque atual: ${item.atual} ${item.unidade || 'UN'})`,
      fotoUrl: '',
    }))
    const novaCotacao = {
      id: novaId,
      numeroOS: '',
      clienteNome: 'Almoxarifado Central',
      clienteTelefone: '',
      veiculoPlaca: 'OFICINA',
      veiculoModelo: tituloVeiculo,
      ano: '',
      km: '',
      mecanicoNome: 'Rafael Almoxarife',
      status: 'EM_COTACAO',
      observacoes: `Cotação de reposição de estoque (${itensFormatados.length} ${itensFormatados.length === 1 ? 'item' : 'itens'})`,
      itens: itensFormatados,
      fornecedoresCotados: fornecedoresIniciais,
      fornecedorVencedorId: null,
      dataCriacao: new Date().toISOString(),
    }
    salvarCotacao(novaCotacao)
    navigate(`${basePath}/compras/cotacao/${novaId}`, { state: { cotacao: novaCotacao } })
  }

  const handleCotarReposicao = (item) => {
    criarCotacaoReposicao([item], 'Reposição de Almoxarifado')
    toast.info(`Abrindo cotação de reposição de ${item.nome}.`)
  }

  const handleCotarTodasReposicoes = () => {
    if (itensReposicao.length === 0) {
      toast.info('Não há itens com necessidade de reposição no momento.')
      return
    }
    criarCotacaoReposicao(itensReposicao, 'Reposição Completa de Almoxarifado')
    toast.info(`Abrindo cotação agrupada com ${itensReposicao.length} peças para reposição.`)
  }

  const filtrosAtivos = filtroCategoria !== 'TODAS' || filtroStatusEstoque !== 'TODOS'

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] flex items-center gap-1.5">
            <Archive size={16} className="text-[#0284c7]" weight="bold" />
            Estoque e Almoxarifado
          </h1>
          <p className="text-[11px] text-[#667085] truncate">Posição, kardex e sugestão de reposição</p>
        </div>
        <button
          type="button"
          onClick={() => { setPecaParaMovimento(null); setModalMovimentoAberto(true) }}
          aria-label="Movimentar Estoque"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <ArrowsLeftRight size={18} weight="bold" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Unidades" value={`${metricas.totalUnidades} un`} dark />
        <StatChip label="Valor em Custo" value={`R$ ${metricas.valorCustoTotal}`} />
        <StatChip label="Reposição" value={metricas.itensAbaixoMinimo} warn={metricas.itensAbaixoMinimo > 0} />
        <StatChip label="Zerados" value={metricas.itensZerados} danger={metricas.itensZerados > 0} />
      </div>

      {/* Abas */}
      <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl mb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isAtiva = abaAtiva === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setAbaAtiva(tab.value)}
              className={`flex-1 h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                isAtiva ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
              }`}
            >
              <Icon size={14} weight={isAtiva ? 'fill' : 'bold'} className={isAtiva ? 'text-[#0284c7]' : ''} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {abaAtiva === 'posicao' && (
        <>
          <div className="relative mb-2.5">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar SKU, nome, GTIN ou local..."
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
                value={opcoesCategorias.find((o) => o.value === filtroCategoria)}
                onChange={(opt) => setFiltroCategoria(opt ? opt.value : 'TODAS')}
                options={opcoesCategorias}
                styles={mobileSelectStyles}
                placeholder="Categoria"
              />
              <Select
                value={opcoesStatusEstoque.find((o) => o.value === filtroStatusEstoque)}
                onChange={(opt) => setFiltroStatusEstoque(opt ? opt.value : 'TODOS')}
                options={opcoesStatusEstoque}
                isSearchable={false}
                styles={mobileSelectStyles}
                placeholder="Nível de Estoque"
              />
            </div>
          )}

          {pecasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
                <Package size={22} weight="duotone" />
              </div>
              <p className="text-sm font-bold text-[#101828]">Nenhum item localizado</p>
              <p className="text-xs text-[#667085] max-w-[260px] mt-1">Ajuste a busca ou os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pecasFiltradas.map((peca) => (
                <PosicaoCard
                  key={peca.id}
                  peca={peca}
                  onEditar={() => { setPecaParaEditar(peca); setModalPecaAberto(true) }}
                  onMovimentar={(p) => { setPecaParaMovimento(p); setModalMovimentoAberto(true) }}
                  onKardex={handleAbrirKardexPeca}
                />
              ))}
            </div>
          )}
        </>
      )}

      {abaAtiva === 'kardex' && (
        <>
          <div className="relative mb-2.5">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
            <input
              type="text"
              value={buscaKardex}
              onChange={(e) => setBuscaKardex(e.target.value)}
              placeholder="Buscar SKU, item, documento ou responsável..."
              className={`${inputBaseClass} pl-10`}
            />
          </div>
          <div className="mb-3">
            <Select
              value={opcoesTipoMovimento.find((o) => o.value === filtroTipoMovimento)}
              onChange={(opt) => setFiltroTipoMovimento(opt ? opt.value : 'TODOS')}
              options={opcoesTipoMovimento}
              isSearchable={false}
              styles={mobileSelectStyles}
              placeholder="Tipo de Movimento"
            />
          </div>

          {movimentacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
                <ClockCounterClockwise size={22} weight="duotone" />
              </div>
              <p className="text-sm font-bold text-[#101828]">Nenhuma movimentação registrada</p>
              <p className="text-xs text-[#667085] max-w-[260px] mt-1">O histórico do almoxarifado aparecerá aqui.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {movimentacoesFiltradas.map((mov) => (
                <KardexCard key={mov.id} mov={mov} />
              ))}
            </div>
          )}
        </>
      )}

      {abaAtiva === 'reposicao' && (
        <>
          <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3.5 mb-3 flex items-center justify-between">
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#98a2b3]">Estimativa de Investimento</span>
              <span className="text-base font-black text-[#101828] font-mono">R$ {totalInvestimentoReposicao}</span>
            </div>
            <button
              type="button"
              onClick={handleCopiarListaReposicao}
              aria-label="Copiar Lista de Compras"
              className="w-10 h-10 rounded-xl border border-[#d0d5dd] text-[#344054] flex items-center justify-center shrink-0"
            >
              <Copy size={16} weight="bold" />
            </button>
          </div>

          {itensReposicao.length > 0 && (
            <button
              type="button"
              onClick={handleCotarTodasReposicoes}
              className="w-full h-11 mb-3 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ShareNetwork size={14} weight="bold" />
              Cotar Todas as Reposições ({itensReposicao.length})
            </button>
          )}

          {itensReposicao.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center mb-3">
                <CheckCircle size={22} weight="fill" />
              </div>
              <p className="text-sm font-bold text-[#101828]">Almoxarifado com Níveis Adequados</p>
              <p className="text-xs text-[#667085] max-w-[260px] mt-1">Nenhum item está abaixo do estoque mínimo configurado.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {itensReposicao.map((item) => (
                <ReposicaoCard
                  key={item.id}
                  item={item}
                  onCotar={handleCotarReposicao}
                  onEntrada={(p) => { setPecaParaMovimento(p); setModalMovimentoAberto(true) }}
                />
              ))}
            </div>
          )}
        </>
      )}

      <MobilePecaFormModal
        isOpen={modalPecaAberto}
        onClose={() => { setModalPecaAberto(false); setPecaParaEditar(null) }}
        onSalvar={handleSalvarPeca}
        onExcluir={handleExcluirPeca}
        pecaParaEditar={pecaParaEditar}
      />

      <MobileEstoqueMovimentoModal
        isOpen={modalMovimentoAberto}
        onClose={() => { setModalMovimentoAberto(false); setPecaParaMovimento(null) }}
        pecaPreSelecionada={pecaParaMovimento}
        onSucesso={() => {
          setPecas(carregarPecasCadastradas())
          setMovimentacoes(carregarMovimentacoesEstoque())
        }}
      />
    </div>
  )
}
