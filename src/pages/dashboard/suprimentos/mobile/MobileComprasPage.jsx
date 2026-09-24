import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Select from 'react-select'
import {
  ShoppingCart,
  Plus,
  MagnifyingGlass,
  FunnelSimple,
  CheckCircle,
  ArrowDownLeft,
  Copy,
  Car,
  PencilSimple,
  Trash,
  ShareNetwork,
  ListBullets,
  Archive,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  carregarPedidosCompra,
  salvarPedidoCompra,
  excluirPedidoCompra,
  receberPedidoCompra,
  obterDemandasDasOSs,
  carregarCotacoes,
  salvarCotacao,
  excluirCotacao,
  obterCotacaoPorOS,
  aprovarCotacaoEGerarPedido,
  gerarProximoNumeroCotacao,
  STATUS_COMPRA_OPCOES,
} from '../../../../constants/comprasData'
import { carregarPecasCadastradas, salvarPecasCadastradas, carregarTerceirosCadastrados } from '../../../../constants/cadastrosSuprimentosData'
import { obterOrdensAbertas } from '../../orcamento/mockOrdensAbertas'
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { MobileCompraFormModal } from './MobileCompraFormModal'
import { MobilePecaFormModal } from './MobilePecaFormModal'
import {
  extrairTelefoneLimpo,
  extrairTelefoneExibicao,
  filtrarFornecedoresAutoPecas,
} from '../../../../utils/compras/cotacaoHelpers'

function StatChip({ label, value, dark, warn }) {
  return (
    <div className={`shrink-0 min-w-[108px] rounded-xl border p-2.5 ${dark ? 'bg-[#101828] border-[#101828]' : warn ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#d0d5dd]'}`}>
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : warn ? 'text-amber-700' : 'text-[#667085]'}`}>{label}</p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : warn ? 'text-amber-800' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

const TABS = [
  { value: 'pedidos', label: 'Pedidos', icon: ListBullets },
  { value: 'cotacoes', label: 'Cotações', icon: ShareNetwork },
  { value: 'demandas_os', label: 'Demandas OS', icon: Car },
  { value: 'reposicao', label: 'Reposição', icon: Archive },
]

function PedidoCard({ pedido, onEditar, onReceber, onWhatsapp }) {
  const dataFormatada = new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')
  const totalItens = pedido.itens ? pedido.itens.length : 0
  const isRecebido = pedido.status === 'RECEBIDO'
  const isAguardando = pedido.status === 'AGUARDANDO_ENTREGA'
  const isCotacao = pedido.status === 'EM_COTACAO'
  const isCancelado = pedido.status === 'CANCELADO'

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <button type="button" onClick={onEditar} className="w-full text-left">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono font-black text-xs text-[#101828]">{pedido.numeroPedido}</span>
          {isRecebido ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">Recebido</span>
          ) : isAguardando ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Aguardando</span>
          ) : isCotacao ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]">Em Cotação</span>
          ) : isCancelado ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelado</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f2f4f7] text-[#667085]">Rascunho</span>
          )}
        </div>
        <p className="text-sm font-extrabold text-[#101828] truncate">{pedido.fornecedorNome}</p>
        <p className="text-[10.5px] text-[#667085] mt-0.5">{dataFormatada} • {pedido.formaPagamento || 'Boleto'}</p>

        {pedido.numeroOS ? (
          <p className="text-[10.5px] text-sky-800 font-semibold mt-1.5 flex items-center gap-1">
            <Car size={12} /> OS #{pedido.numeroOS} • {pedido.veiculoPlaca}
          </p>
        ) : (
          <p className="text-[10.5px] text-[#667085] mt-1.5 flex items-center gap-1">
            <Archive size={12} /> Reposição de Estoque
          </p>
        )}

        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
          <span className="text-[10.5px] text-[#667085]">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
          <span className="font-mono font-black text-sm text-[#101828]">R$ {Number(pedido.valorTotal || 0).toFixed(2)}</span>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {!isRecebido ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); onReceber(pedido) }} className="h-9 rounded-lg bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1.5">
            <ArrowDownLeft size={13} weight="bold" />
            Receber
          </button>
        ) : (
          <div />
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onWhatsapp(pedido) }} className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5">
          <Copy size={13} weight="bold" />
          Copiar
        </button>
      </div>
    </div>
  )
}

function CotacaoCard({ cotacao, onAbrir, onWhatsapp, onAprovar, onExcluir }) {
  const dataFormatada = new Date(cotacao.dataCriacao).toLocaleDateString('pt-BR')
  const totalItens = cotacao.itens ? cotacao.itens.length : 0
  const fornecedoresRespondidos = (cotacao.fornecedoresCotados || []).filter((f) => f.status === 'RESPONDIDA' && f.valorTotal > 0)
  const isAprovada = cotacao.status === 'APROVADA'
  const isRespondida = cotacao.status === 'RESPONDIDA' || fornecedoresRespondidos.length > 0

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-3.5 ${isAprovada ? 'border-[#101828]' : isRespondida ? 'border-sky-300' : 'border-[#d0d5dd]'}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-mono font-black text-xs text-[#101828]">{cotacao.id}</span>
        {isAprovada ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#101828] text-white">Aprovada</span>
        ) : isRespondida ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">{fornecedoresRespondidos.length} Propostas</span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Aguardando</span>
        )}
      </div>

      {cotacao.numeroOS ? (
        <p className="text-sm font-extrabold text-[#101828]">OS #{cotacao.numeroOS}</p>
      ) : (
        <p className="text-sm font-extrabold text-[#101828]">Reposição de Almoxarifado</p>
      )}
      <p className="text-[10.5px] text-[#667085] mt-0.5">{cotacao.veiculoModelo} {cotacao.veiculoPlaca ? `• ${cotacao.veiculoPlaca}` : ''} • {dataFormatada}</p>

      <div className="mt-2 space-y-1">
        {(cotacao.itens || []).slice(0, 3).map((it, idx) => (
          <div key={it.id || idx} className="flex items-center justify-between text-[10.5px] bg-[#f8fafc] rounded-lg px-2.5 py-1.5">
            <span className="text-[#344054] font-semibold truncate">{it.nome}</span>
            <span className="font-mono text-[#0284c7] font-bold shrink-0 ml-2">{it.quantidade} {it.unidade}</span>
          </div>
        ))}
        {totalItens > 3 && <p className="text-[10px] text-[#98a2b3] text-center">+{totalItens - 3} itens</p>}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {(cotacao.fornecedoresCotados || []).map((f) => {
          const temPreco = f.status === 'RESPONDIDA' && f.valorTotal > 0
          return (
            <span key={f.id} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${temPreco ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-[#f2f4f7] text-[#667085] border-[#e4e7ec]'}`}>
              {f.nome}{temPreco && ` (R$ ${Number(f.valorTotal).toFixed(2)})`}
            </span>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button type="button" onClick={() => onAbrir(cotacao)} className="h-9 rounded-lg bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1.5">
          <PencilSimple size={13} weight="bold" />
          Abrir
        </button>
        <button type="button" onClick={() => onWhatsapp(cotacao)} className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5">
          <Copy size={13} weight="bold" />
          WhatsApp
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {!isAprovada && (
          <button type="button" onClick={() => onAprovar(cotacao)} className="h-9 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-1.5">
            <CheckCircle size={13} weight="bold" />
            Aprovar
          </button>
        )}
        <button type="button" onClick={() => onExcluir(cotacao)} className={`h-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 ${isAprovada ? 'col-span-2' : ''}`}>
          <Trash size={13} weight="bold" />
          Excluir
        </button>
      </div>
    </div>
  )
}

function DemandaCard({ demanda, selecionado, onSelecionar, onCatalogar, onCotar, onCompraDireta }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-3.5 ${selecionado ? 'border-[#0284c7] ring-1 ring-sky-100' : 'border-[#d0d5dd]'}`}>
      <div className="flex items-start gap-2.5">
        <input type="checkbox" checked={selecionado} onChange={() => onSelecionar(demanda.id)} className="w-4 h-4 mt-0.5 rounded border-[#d0d5dd] text-[#0284c7] shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#101828]">OS #{demanda.numeroOS}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f2f4f7] text-[#344054]">{demanda.veiculoPlaca}</span>
          </div>
          <p className="text-[10.5px] text-[#667085]">{demanda.veiculoModelo} • {demanda.clienteNome}</p>

          <p className="text-sm font-extrabold text-[#101828] mt-1.5">{demanda.itemNome}</p>
          <p className="text-[10.5px] font-mono text-[#98a2b3]">Cód: {demanda.itemCodigo}</p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10.5px] font-mono font-bold text-[#101828]">{demanda.quantidadeNecessaria} {demanda.unidade}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${demanda.estoqueAtual > 0 ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              Estoque: {demanda.estoqueAtual} {demanda.unidade}
            </span>
          </div>

          {demanda.cadastradoNoCatalogo ? (
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200">
              <CheckCircle size={11} weight="bold" /> Catalogado
            </span>
          ) : (
            <button type="button" onClick={() => onCatalogar(demanda)} className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <Plus size={11} weight="bold" /> Catalogar Item Avulso
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button type="button" onClick={() => onCotar(demanda)} className="h-9 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-1.5">
          <ShareNetwork size={13} weight="bold" />
          Cotar Peça
        </button>
        <button type="button" onClick={() => onCompraDireta(demanda)} className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5">
          <ShoppingCart size={13} weight="bold" />
          Compra Direta
        </button>
      </div>
    </div>
  )
}

function ReposicaoCard({ item, onCotar, onCompraDireta }) {
  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-mono font-black text-xs text-[#101828]">{item.codigo}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.atual === 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
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
          <span className="font-mono font-extrabold text-xs text-[#0284c7]">{item.sugestao}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
        <span className="text-[10.5px] text-[#667085]">Custo estimado</span>
        <span className="font-mono font-bold text-sm text-[#101828]">R$ {Number(item.custoTotal || 0).toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2.5">
        <button type="button" onClick={() => onCompraDireta(item)} className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5">
          <ShoppingCart size={13} weight="bold" />
          Direta
        </button>
        <button type="button" onClick={() => onCotar(item)} className="h-9 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-1.5">
          <ShareNetwork size={13} weight="bold" />
          Cotar
        </button>
      </div>
    </div>
  )
}

export function MobileComprasPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const [abaAtiva, setAbaAtiva] = useState('pedidos')
  const [pedidos, setPedidos] = useState(() => carregarPedidosCompra())
  const [cotacoes, setCotacoes] = useState(() => carregarCotacoes())
  const [demandasOS, setDemandasOS] = useState(() => obterDemandasDasOSs())
  const [pecasCatalogo, setPecasCatalogo] = useState(() => carregarPecasCadastradas())
  const [fornecedores, setFornecedores] = useState(() => carregarTerceirosCadastrados())

  const [buscaPedidos, setBuscaPedidos] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [buscaDemandas, setBuscaDemandas] = useState('')
  const [demandasSelecionadas, setDemandasSelecionadas] = useState([])
  const [buscaCotacoes, setBuscaCotacoes] = useState('')

  const [modalCompraAberto, setModalCompraAberto] = useState(false)
  const [pedidoParaEditar, setPedidoParaEditar] = useState(null)
  const [demandaParaComprar, setDemandaParaComprar] = useState(null)

  const [modalCatalogarAberto, setModalCatalogarAberto] = useState(false)
  const [dadosCatalogar, setDadosCatalogar] = useState(null)

  useEffect(() => {
    const sincronizar = () => {
      setPedidos(carregarPedidosCompra())
      setCotacoes(carregarCotacoes())
      setDemandasOS(obterDemandasDasOSs())
      setPecasCatalogo(carregarPecasCadastradas())
      setFornecedores(carregarTerceirosCadastrados())
    }
    window.addEventListener('storage', sincronizar)
    window.addEventListener('dev_oficina_compras_updated', sincronizar)
    window.addEventListener('dev_oficina_cotacoes_updated', sincronizar)
    window.addEventListener('dev_oficina_estoque_updated', sincronizar)
    window.addEventListener('dev_oficina_pecas_updated', sincronizar)
    window.addEventListener('dev_oficina_ordens_updated', sincronizar)
    return () => {
      window.removeEventListener('storage', sincronizar)
      window.removeEventListener('dev_oficina_compras_updated', sincronizar)
      window.removeEventListener('dev_oficina_cotacoes_updated', sincronizar)
      window.removeEventListener('dev_oficina_estoque_updated', sincronizar)
      window.removeEventListener('dev_oficina_pecas_updated', sincronizar)
      window.removeEventListener('dev_oficina_ordens_updated', sincronizar)
    }
  }, [])

  const metricas = useMemo(() => {
    const pedidosEmAberto = pedidos.filter((p) => p.status === 'AGUARDANDO_ENTREGA' || p.status === 'EM_COTACAO').length
    const cotacoesAtivas = cotacoes.filter((c) => c.status === 'EM_COTACAO' || c.status === 'RESPONDIDA').length
    const demandasPendentes = demandasOS.filter((d) => d.precisaComprar).length
    const valorEmAberto = pedidos.filter((p) => p.status === 'AGUARDANDO_ENTREGA' || p.status === 'EM_COTACAO').reduce((acc, p) => acc + (Number(p.valorTotal) || 0), 0)
    return {
      pedidosEmAberto,
      cotacoesAtivas,
      demandasPendentes,
      valorEmAberto: valorEmAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    }
  }, [pedidos, cotacoes, demandasOS])

  const opcoesFornecedoresFiltro = useMemo(
    () => [{ value: 'TODOS', label: 'Todos os Fornecedores' }, ...fornecedores.map((f) => ({ value: f.id, label: f.nomeFantasia || f.razaoSocial }))],
    [fornecedores]
  )

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const termo = buscaPedidos.toLowerCase().trim()
      const matchBusca =
        !termo ||
        pedido.numeroPedido?.toLowerCase().includes(termo) ||
        pedido.fornecedorNome?.toLowerCase().includes(termo) ||
        pedido.numeroOS?.toLowerCase().includes(termo) ||
        pedido.veiculoPlaca?.toLowerCase().includes(termo)
      const matchStatus = filtroStatus === 'TODOS' || pedido.status === filtroStatus
      return matchBusca && matchStatus
    })
  }, [pedidos, buscaPedidos, filtroStatus])

  const demandasFiltradas = useMemo(() => {
    return demandasOS.filter((demanda) => {
      const termo = buscaDemandas.toLowerCase().trim()
      return (
        !termo ||
        demanda.numeroOS?.toLowerCase().includes(termo) ||
        demanda.clienteNome?.toLowerCase().includes(termo) ||
        demanda.veiculoPlaca?.toLowerCase().includes(termo) ||
        demanda.itemNome?.toLowerCase().includes(termo)
      )
    })
  }, [demandasOS, buscaDemandas])

  const cotacoesFiltradas = useMemo(() => {
    return cotacoes.filter((cotacao) => {
      const termo = buscaCotacoes.toLowerCase().trim()
      return (
        !termo ||
        cotacao.id?.toLowerCase().includes(termo) ||
        cotacao.numeroOS?.toLowerCase().includes(termo) ||
        cotacao.veiculoPlaca?.toLowerCase().includes(termo) ||
        (cotacao.itens || []).some((it) => it.nome?.toLowerCase().includes(termo))
      )
    })
  }, [cotacoes, buscaCotacoes])

  const itensReposicaoAlmoxarifado = useMemo(() => {
    return pecasCatalogo
      .filter((p) => (Number(p.estoqueAtual) || 0) <= (Number(p.estoqueMinimo) || 0))
      .map((p) => {
        const atual = Number(p.estoqueAtual) || 0
        const min = Number(p.estoqueMinimo) || 0
        const deficit = Math.max(0, min - atual)
        const sugestao = deficit > 0 ? deficit + min : min
        return { ...p, atual, min, deficit, sugestao, custoTotal: sugestao * (Number(p.precoCusto) || 0) }
      })
      .sort((a, b) => a.atual - b.atual)
  }, [pecasCatalogo])

  const criarCotacaoBase = (itens, extra = {}) => {
    const novaId = gerarProximoNumeroCotacao()
    const terceiros = carregarTerceirosCadastrados()
    const autoPecas = filtrarFornecedoresAutoPecas(terceiros)
    const fornecedoresBase = autoPecas.length > 0 ? autoPecas.slice(0, 3) : terceiros.slice(0, 3)
    const fornecedoresIniciais = fornecedoresBase.map((t) => ({
      id: t.id,
      nome: t.nomeFantasia || t.razaoSocial || 'Fornecedor',
      telefone: extrairTelefoneExibicao(t),
      whatsapp: extrairTelefoneLimpo(t),
      cidade: t.cidade || t.endereco?.cidade || 'Apucarana - PR',
      status: 'AGUARDANDO',
      valorTotal: null,
      tempoEntrega: '1 a 2 horas',
      condicaoPagamento: 'Boleto 30 Dias',
      respostasItens: {},
    }))
    const novaCotacao = {
      id: novaId,
      numeroOS: '',
      clienteNome: 'Almoxarifado Central',
      clienteTelefone: '',
      veiculoPlaca: 'OFICINA',
      veiculoModelo: 'Reposição de Almoxarifado',
      ano: '',
      km: '',
      mecanicoNome: 'Rafael Almoxarife',
      status: 'EM_COTACAO',
      observacoes: '',
      itens,
      fornecedoresCotados: fornecedoresIniciais,
      fornecedorVencedorId: null,
      dataCriacao: new Date().toISOString(),
      ...extra,
    }
    salvarCotacao(novaCotacao)
    return novaCotacao
  }

  const handleAbrirCotacaoDemanda = (demanda) => {
    let cotacaoExistente = demanda.numeroOS ? obterCotacaoPorOS(demanda.numeroOS) : null
    if (cotacaoExistente) {
      const jaPossuiItem = (cotacaoExistente.itens || []).some(
        (it) => it.nome?.toLowerCase() === demanda.itemNome?.toLowerCase() || (it.codigo && demanda.itemCodigo && it.codigo === demanda.itemCodigo)
      )
      if (!jaPossuiItem) {
        cotacaoExistente = {
          ...cotacaoExistente,
          itens: [...(cotacaoExistente.itens || []), {
            id: `it-${Date.now()}`,
            codigo: demanda.itemCodigo !== 'SEM CODIGO' ? demanda.itemCodigo : '',
            nome: demanda.itemNome,
            unidade: demanda.unidade || 'UN',
            quantidade: Number(demanda.quantidadeNecessaria || 1),
            marcaSugerida: demanda.itemMarcaSugerida || '',
            observacoes: `Solicitado na OS #${demanda.numeroOS}`,
            fotoUrl: '',
          }],
        }
        salvarCotacao(cotacaoExistente)
      }
      toast.info(`Abrindo cotação #${cotacaoExistente.id} da OS #${demanda.numeroOS}.`)
      navigate(`${basePath}/compras/cotacao/${cotacaoExistente.id}`, { state: { cotacao: cotacaoExistente } })
      return
    }

    const ordens = obterOrdensAbertas()
    const osEncontrada = ordens.find((o) => String(o.numeroOS) === String(demanda.numeroOS))
    let itensCotacao = []
    if (osEncontrada?.pecasOS?.length > 0) {
      itensCotacao = osEncontrada.pecasOS.map((p, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        codigo: p.codigo || '',
        nome: p.nome,
        unidade: p.unidade || 'UN',
        quantidade: Number(p.quantidade || 1),
        marcaSugerida: p.marca || '',
        observacoes: '',
        fotoUrl: '',
      }))
    } else {
      itensCotacao = [{
        id: `it-${Date.now()}-1`,
        codigo: demanda.itemCodigo !== 'SEM CODIGO' ? demanda.itemCodigo : '',
        nome: demanda.itemNome,
        unidade: demanda.unidade || 'UN',
        quantidade: Number(demanda.quantidadeNecessaria || 1),
        marcaSugerida: demanda.itemMarcaSugerida || '',
        observacoes: `Solicitado na OS #${demanda.numeroOS}`,
        fotoUrl: '',
      }]
    }

    const novaCotacao = criarCotacaoBase(itensCotacao, {
      numeroOS: demanda.numeroOS || '',
      clienteNome: demanda.clienteNome || osEncontrada?.cliente || '',
      clienteTelefone: demanda.clienteTelefone || osEncontrada?.telefone || '',
      veiculoPlaca: demanda.veiculoPlaca || osEncontrada?.placa || '',
      veiculoModelo: demanda.veiculoModelo || osEncontrada?.marcaModelo || '',
      mecanicoNome: osEncontrada?.mecanicoNome || '',
      observacoes: `Cotação de peças para a Ordem de Serviço #${demanda.numeroOS}`,
    })
    toast.info(`Abrindo tela de cotação das peças da OS #${demanda.numeroOS}.`)
    navigate(`${basePath}/compras/cotacao/${novaCotacao.id}`, { state: { cotacao: novaCotacao } })
  }

  const handleGerarCotacaoAgrupada = () => {
    if (demandasSelecionadas.length === 0) return toast.warning('Selecione ao menos um item de OS para cotar.')
    const selecionadas = demandasOS.filter((d) => demandasSelecionadas.includes(d.id))
    const itensParaCotacao = selecionadas.map((d, idx) => ({
      id: `it-${Date.now()}-${idx}`,
      codigo: d.itemCodigo !== 'SEM CODIGO' ? d.itemCodigo : '',
      nome: d.itemNome,
      unidade: d.unidade || 'UN',
      quantidade: Number(d.quantidadeNecessaria || 1),
      marcaSugerida: d.itemMarcaSugerida || '',
      observacoes: `Solicitado na OS #${d.numeroOS}`,
      fotoUrl: '',
    }))
    const todasMesmaOS = selecionadas.every((s) => s.numeroOS === selecionadas[0].numeroOS)
    const novaCotacao = criarCotacaoBase(itensParaCotacao, {
      numeroOS: todasMesmaOS ? selecionadas[0].numeroOS : '',
      clienteNome: todasMesmaOS ? selecionadas[0].clienteNome : '',
      veiculoPlaca: todasMesmaOS ? selecionadas[0].veiculoPlaca : '',
      veiculoModelo: todasMesmaOS ? selecionadas[0].veiculoModelo : '',
      mecanicoNome: '',
      observacoes: `Cotação agrupada com ${selecionadas.length} itens de OSs`,
    })
    toast.info(`Abrindo cotação com ${selecionadas.length} itens selecionados.`)
    navigate(`${basePath}/compras/cotacao/${novaCotacao.id}`, { state: { cotacao: novaCotacao } })
  }

  const handleAprovarCotacaoDireto = (cotacao) => {
    const fornecedoresComValor = (cotacao.fornecedoresCotados || []).filter((f) => f.valorTotal && Number(f.valorTotal) > 0)
    let vencedor = fornecedoresComValor[0] || cotacao.fornecedoresCotados?.[0]
    if (fornecedoresComValor.length > 1) {
      fornecedoresComValor.sort((a, b) => Number(a.valorTotal) - Number(b.valorTotal))
      vencedor = fornecedoresComValor[0]
    }
    if (!vencedor) {
      navigate(`${basePath}/compras/cotacao/${cotacao.id}`, { state: { cotacao } })
      toast.info('Abra a cotação para preencher os valores cotados pelo fornecedor.')
      return
    }
    try {
      const res = aprovarCotacaoEGerarPedido(cotacao.id, vencedor.id)
      setCotacoes(carregarCotacoes())
      setPedidos(carregarPedidosCompra())
      toast.success(`Cotação #${cotacao.id} aprovada! Pedido ${res.pedido.numeroPedido} gerado para ${vencedor.nome}.`)
    } catch (err) {
      toast.error(err.message || 'Erro ao aprovar cotação.')
    }
  }

  const handleExcluirCotacaoItem = (cotacao) => {
    excluirCotacao(cotacao.id)
    setCotacoes(carregarCotacoes())
    toast.success(`Cotação ${cotacao.id} excluída.`)
  }

  const handleSalvarPedido = (dadosPedido) => {
    salvarPedidoCompra(dadosPedido)
    setPedidos(carregarPedidosCompra())
    toast.success(`Pedido ${dadosPedido.numeroPedido} salvo com sucesso!`)
    setModalCompraAberto(false)
  }

  const handleExcluirPedido = (pedido) => {
    excluirPedidoCompra(pedido.id)
    setPedidos(carregarPedidosCompra())
    toast.success(`Pedido ${pedido.numeroPedido} excluído.`)
    setModalCompraAberto(false)
  }

  const handleReceberPedido = (pedido) => {
    try {
      receberPedidoCompra(pedido.id, { documento: pedido.numeroPedido, responsavel: 'Rafael Almoxarife' })
      setPedidos(carregarPedidosCompra())
      setPecasCatalogo(carregarPecasCadastradas())
      setDemandasOS(obterDemandasDasOSs())
      toast.success(`Pedido ${pedido.numeroPedido} recebido! Entrada concluída no estoque.`)
    } catch (err) {
      toast.error(err.message || 'Erro ao dar entrada no pedido.')
    }
  }

  const handleCopiarPedidoWhatsApp = (pedido) => {
    let texto = `*PEDIDO DE COMPRA DE AUTOPEÇAS - MECÂNICA GABRIEL*\nPedido: *${pedido.numeroPedido}*\nFornecedor: ${pedido.fornecedorNome}\n`
    if (pedido.numeroOS) texto += `Aplicação: OS #${pedido.numeroOS} (${pedido.veiculoModelo || pedido.veiculoPlaca})\n`
    texto += `Data: ${new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')}\n\n*ITENS:*\n`
    pedido.itens.forEach((it, idx) => {
      texto += `${idx + 1}. [${it.codigo || 'SKU'}] ${it.nome} - Qtd: *${it.quantidade} ${it.unidade || 'UN'}*\n`
    })
    texto += `\nValor Total: R$ ${Number(pedido.valorTotal || 0).toFixed(2)}\nPagamento: ${pedido.formaPagamento || 'Boleto'}`
    navigator.clipboard.writeText(texto).then(() => toast.success('Pedido copiado para o WhatsApp!'), () => toast.error('Erro ao copiar o pedido.'))
  }

  const handleCopiarLinkCotacaoWhatsApp = (cotacao) => {
    const url = `${window.location.origin}/cotacao/${cotacao.id}`
    let texto = `*COTAÇÃO DE AUTOPEÇAS - MECÂNICA GABRIEL*\nCotação: *#${cotacao.id}*\n`
    if (cotacao.numeroOS) texto += `Aplicação: OS #${cotacao.numeroOS}\n`
    texto += `\n*Peças Solicitadas:*\n`
    ;(cotacao.itens || []).forEach((it, idx) => {
      texto += `${idx + 1}. [${it.codigo || 'SKU'}] ${it.nome} - Qtd: ${it.quantidade} ${it.unidade}\n`
    })
    texto += `\n🔗 Acesse e preencha seus preços:\n${url}`
    navigator.clipboard.writeText(texto).then(() => toast.success('Link de cotação copiado!'), () => toast.error('Erro ao copiar.'))
  }

  const handleAlternarSelecaoDemanda = (id) => setDemandasSelecionadas((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))

  const handleCompraDiretaDemanda = (demanda) => {
    setPedidoParaEditar(null)
    setDemandaParaComprar({
      numeroOS: demanda.numeroOS,
      clienteNome: demanda.clienteNome,
      veiculoPlaca: demanda.veiculoPlaca,
      veiculoModelo: demanda.veiculoModelo,
      itemCodigo: demanda.itemCodigo,
      itemNome: demanda.itemNome,
      unidade: demanda.unidade,
      quantidadeNecessaria: demanda.quantidadeNecessaria,
      precoEstimado: demanda.precoEstimado,
      pecaId: demanda.pecaId,
    })
    setModalCompraAberto(true)
  }

  const handleAbrirCatalogarPeca = (demanda) => {
    setDadosCatalogar({
      codigo: demanda.itemCodigo !== 'SEM CODIGO' ? demanda.itemCodigo : `PEC-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: demanda.itemNome,
      unidade: demanda.unidade || 'UN',
      precoVenda: Number(demanda.precoEstimado || 0) * 1.8,
      precoCusto: Number(demanda.precoEstimado || 0),
      estoqueMinimo: 2,
      estoqueAtual: 0,
    })
    setModalCatalogarAberto(true)
  }

  const handleSalvarCatalogacaoPeca = (novaPeca) => {
    const novaLista = [novaPeca, ...carregarPecasCadastradas()]
    salvarPecasCadastradas(novaLista)
    setPecasCatalogo(novaLista)
    setDemandasOS(obterDemandasDasOSs())
    setModalCatalogarAberto(false)
    setDadosCatalogar(null)
    toast.success(`Item "${novaPeca.nome}" cadastrado no catálogo com sucesso!`)
  }

  const handleCotarReposicao = (item) => {
    const novaCotacao = criarCotacaoBase(
      [{
        id: `it-${Date.now()}`,
        codigo: item.codigo || '',
        nome: item.nome || 'Item de Reposição',
        unidade: item.unidade || 'UN',
        quantidade: Number(item.sugestao || 1),
        marcaSugerida: '',
        observacoes: `Reposição de almoxarifado (Estoque atual: ${item.atual} ${item.unidade || 'UN'})`,
        fotoUrl: '',
      }],
      { observacoes: `Cotação de reposição de estoque mínimo (${item.nome})` }
    )
    toast.info(`Abrindo cotação de reposição de ${item.nome}.`)
    navigate(`${basePath}/compras/cotacao/${novaCotacao.id}`, { state: { cotacao: novaCotacao } })
  }

  const handleCompraDiretaReposicao = (item) => {
    setPedidoParaEditar(null)
    setDemandaParaComprar({
      numeroOS: '',
      itemCodigo: item.codigo,
      itemNome: item.nome,
      unidade: item.unidade,
      sugestaoCompra: item.sugestao,
      precoCusto: item.precoCusto,
      pecaId: item.id,
      observacoes: `Pedido de reposição de estoque mínimo (${item.nome})`,
    })
    setModalCompraAberto(true)
  }

  const filtrosAtivos = filtroStatus !== 'TODOS'

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-extrabold text-[#101828] flex items-center gap-1.5">
            <ShoppingCart size={16} className="text-[#0284c7]" weight="bold" />
            Compras e Cotações
          </h1>
          <p className="text-[11px] text-[#667085] truncate">Demandas, cotações, pedidos e reposição</p>
        </div>
        <button
          type="button"
          onClick={() => { setPedidoParaEditar(null); setDemandaParaComprar(null); setModalCompraAberto(true) }}
          aria-label="Novo Pedido Direto"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        <StatChip label="Pedidos Abertos" value={metricas.pedidosEmAberto} dark />
        <StatChip label="Cotações Ativas" value={metricas.cotacoesAtivas} />
        <StatChip label="Demandas OS" value={metricas.demandasPendentes} warn={metricas.demandasPendentes > 0} />
        <StatChip label="Total em Aberto" value={`R$ ${metricas.valorEmAberto}`} />
      </div>

      <div className="grid grid-cols-2 gap-1.5 bg-[#f2f4f7] p-1 rounded-xl mb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isAtiva = abaAtiva === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setAbaAtiva(tab.value)}
              className={`h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 ${isAtiva ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'}`}
            >
              <Icon size={13} weight={isAtiva ? 'fill' : 'bold'} className={isAtiva ? 'text-[#0284c7]' : ''} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {abaAtiva === 'pedidos' && (
        <>
          <div className="relative mb-2.5">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
            <input type="text" value={buscaPedidos} onChange={(e) => setBuscaPedidos(e.target.value)} placeholder="Buscar pedido, fornecedor, OS ou placa..." className={`${inputBaseClass} pl-10`} />
          </div>
          <button
            type="button"
            onClick={() => setFiltrosAbertos((v) => !v)}
            className={`w-full h-10 mb-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${filtrosAtivos ? 'border-[#0284c7] text-[#0284c7] bg-[#e0f2fe]' : 'border-[#d0d5dd] text-[#344054] bg-white'}`}
          >
            <FunnelSimple size={15} weight="bold" />
            Filtros {filtrosAtivos ? '(ativos)' : ''}
          </button>
          {filtrosAbertos && (
            <div className="mb-3">
              <Select
                value={STATUS_COMPRA_OPCOES.find((o) => o.value === filtroStatus)}
                onChange={(opt) => setFiltroStatus(opt ? opt.value : 'TODOS')}
                options={STATUS_COMPRA_OPCOES}
                isSearchable={false}
                styles={mobileSelectStyles}
                placeholder="Status"
              />
            </div>
          )}

          {pedidosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
                <ShoppingCart size={22} weight="duotone" />
              </div>
              <p className="text-sm font-bold text-[#101828]">Nenhum pedido de compra encontrado</p>
              <p className="text-xs text-[#667085] max-w-[260px] mt-1">Toque no botão "+" para registrar um pedido.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pedidosFiltrados.map((pedido) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  onEditar={() => { setPedidoParaEditar(pedido); setDemandaParaComprar(null); setModalCompraAberto(true) }}
                  onReceber={handleReceberPedido}
                  onWhatsapp={handleCopiarPedidoWhatsApp}
                />
              ))}
            </div>
          )}
        </>
      )}

      {abaAtiva === 'cotacoes' && (
        <>
          <div className="relative mb-3">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
            <input type="text" value={buscaCotacoes} onChange={(e) => setBuscaCotacoes(e.target.value)} placeholder="Buscar cotação, OS, placa ou peça..." className={`${inputBaseClass} pl-10`} />
          </div>

          <button
            type="button"
            onClick={() => navigate(`${basePath}/compras/cotacao/nova`)}
            className="w-full h-11 mb-3 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <ShareNetwork size={14} weight="bold" />
            Nova Cotação de Peças
          </button>

          {cotacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
                <ShareNetwork size={22} weight="duotone" />
              </div>
              <p className="text-sm font-bold text-[#101828]">Nenhuma cotação encontrada</p>
              <p className="text-xs text-[#667085] max-w-[260px] mt-1">Inicie uma nova cotação ou envie peças de uma OS.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cotacoesFiltradas.map((cotacao) => (
                <CotacaoCard
                  key={cotacao.id}
                  cotacao={cotacao}
                  onAbrir={(c) => navigate(`${basePath}/compras/cotacao/${c.id}`, { state: { cotacao: c } })}
                  onWhatsapp={handleCopiarLinkCotacaoWhatsApp}
                  onAprovar={handleAprovarCotacaoDireto}
                  onExcluir={handleExcluirCotacaoItem}
                />
              ))}
            </div>
          )}
        </>
      )}

      {abaAtiva === 'demandas_os' && (
        <>
          <div className="relative mb-2.5">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
            <input type="text" value={buscaDemandas} onChange={(e) => setBuscaDemandas(e.target.value)} placeholder="Buscar OS, cliente, placa ou peça..." className={`${inputBaseClass} pl-10`} />
          </div>

          {demandasSelecionadas.length > 0 && (
            <button
              type="button"
              onClick={handleGerarCotacaoAgrupada}
              className="w-full h-11 mb-3 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ShareNetwork size={14} weight="bold" />
              Cotar {demandasSelecionadas.length} Itens Selecionados
            </button>
          )}

          {demandasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
                <Car size={22} weight="duotone" />
              </div>
              <p className="text-sm font-bold text-[#101828]">Nenhuma demanda pendente de OS</p>
              <p className="text-xs text-[#667085] max-w-[260px] mt-1">Todas as OS abertas estão com peças supridas.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {demandasFiltradas.map((demanda) => (
                <DemandaCard
                  key={demanda.id}
                  demanda={demanda}
                  selecionado={demandasSelecionadas.includes(demanda.id)}
                  onSelecionar={handleAlternarSelecaoDemanda}
                  onCatalogar={handleAbrirCatalogarPeca}
                  onCotar={handleAbrirCotacaoDemanda}
                  onCompraDireta={handleCompraDiretaDemanda}
                />
              ))}
            </div>
          )}
        </>
      )}

      {abaAtiva === 'reposicao' && (
        <>
          {itensReposicaoAlmoxarifado.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const novaCotacao = criarCotacaoBase(
                  itensReposicaoAlmoxarifado.map((item, idx) => ({
                    id: `it-${Date.now()}-${idx}`,
                    codigo: item.codigo || '',
                    nome: item.nome || 'Item de Reposição',
                    unidade: item.unidade || 'UN',
                    quantidade: Number(item.sugestao || 1),
                    marcaSugerida: '',
                    observacoes: `Reposição de almoxarifado (Estoque atual: ${item.atual} ${item.unidade || 'UN'})`,
                    fotoUrl: '',
                  })),
                  { veiculoModelo: 'Reposição Completa de Almoxarifado', observacoes: `Cotação de reposição do almoxarifado (${itensReposicaoAlmoxarifado.length} itens)` }
                )
                toast.info(`Abrindo cotação com ${itensReposicaoAlmoxarifado.length} peças para reposição.`)
                navigate(`${basePath}/compras/cotacao/${novaCotacao.id}`, { state: { cotacao: novaCotacao } })
              }}
              className="w-full h-11 mb-3 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ShareNetwork size={14} weight="bold" />
              Cotar Todas as Reposições ({itensReposicaoAlmoxarifado.length})
            </button>
          )}

          {itensReposicaoAlmoxarifado.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center mb-3">
                <CheckCircle size={22} weight="fill" />
              </div>
              <p className="text-sm font-bold text-[#101828]">Almoxarifado em Nível Adequado</p>
              <p className="text-xs text-[#667085] max-w-[260px] mt-1">Nenhuma peça atingiu o nível mínimo de reposição.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {itensReposicaoAlmoxarifado.map((item) => (
                <ReposicaoCard key={item.id} item={item} onCotar={handleCotarReposicao} onCompraDireta={handleCompraDiretaReposicao} />
              ))}
            </div>
          )}
        </>
      )}

      <MobileCompraFormModal
        isOpen={modalCompraAberto}
        onClose={() => { setModalCompraAberto(false); setPedidoParaEditar(null); setDemandaParaComprar(null) }}
        onSalvar={handleSalvarPedido}
        onExcluir={handleExcluirPedido}
        pedidoParaEditar={pedidoParaEditar}
        demandaInicial={demandaParaComprar}
      />

      <MobilePecaFormModal
        isOpen={modalCatalogarAberto}
        onClose={() => { setModalCatalogarAberto(false); setDadosCatalogar(null) }}
        onSalvar={handleSalvarCatalogacaoPeca}
        pecaParaEditar={dadosCatalogar}
      />
    </div>
  )
}
