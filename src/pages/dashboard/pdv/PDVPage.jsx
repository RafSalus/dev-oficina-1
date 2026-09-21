import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Select from 'react-select'
import {
  MagnifyingGlass,
  Package,
  Wrench,
  Plus,
  Minus,
  Trash,
  User,
  Car,
  Receipt,
  CreditCard,
  LinkBreak,
  ShoppingCartSimple,
  ArrowsClockwise,
  IdentificationCard,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalConfirmacao } from '../../../components/ModalConfirmacao'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import {
  carregarPecasCadastradas,
  carregarServicosCadastrados,
  registrarMovimentacaoEstoque,
} from '../../../constants/cadastrosSuprimentosData'
import { MOCK_CLIENTES_VEICULOS } from '../../../constants/mockClientesVeiculos'
import {
  obterOrdensAbertas,
  finalizarEArquivarOrdem,
  STATUS_ORCAMENTO,
  STATUS_PERMITE_FATURAMENTO,
} from '../orcamento/mockOrdensAbertas'
import {
  FORMAS_PAGAMENTO_OPCOES,
  calcularTotaisCarrinho,
  formatMoeda,
  gerarChaveAcessoMock,
  gerarNumeroVenda,
  gerarProtocoloMock,
  registrarVendaPDV,
} from './pdvData'
import { ModalFechamentoPagamento } from './ModalFechamentoPagamento'
import { ReciboVendaImpressao } from './ReciboVendaImpressao'

let seqUid = 0
function proximoUid(prefixo) {
  seqUid += 1
  return `${prefixo}-${Date.now()}-${seqUid}`
}

function resumoFormasPagamento(formasPagamento) {
  return formasPagamento
    .map((f) => {
      const opcao = FORMAS_PAGAMENTO_OPCOES.find((o) => o.value === f.metodo)
      const parcela = (f.metodo === 'credito' || f.metodo === 'boleto') && f.parcelas > 1 ? ` ${f.parcelas}x` : ''
      return `${opcao?.label || f.metodo}${parcela}`
    })
    .join(' + ')
}

export function PDVPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])
  const [abaCatalogo, setAbaCatalogo] = useState('pecas')
  const [buscaCatalogo, setBuscaCatalogo] = useState('')

  const [itensCarrinho, setItensCarrinho] = useState([])
  const [osVinculada, setOsVinculada] = useState(null)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null)
  const [buscaOS, setBuscaOS] = useState('')

  const [descontoGeral, setDescontoGeral] = useState(0)
  const [tipoDescontoGeral, setTipoDescontoGeral] = useState('valor')

  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false)
  const [processandoPagamento, setProcessandoPagamento] = useState(false)
  const [reciboAberto, setReciboAberto] = useState(false)
  const [vendaFinalizada, setVendaFinalizada] = useState(null)
  const [confirmandoNovaVenda, setConfirmandoNovaVenda] = useState(false)

  // Carrega catálogo de peças e serviços e mantém sincronizado com o Almoxarifado
  useEffect(() => {
    const sincronizar = () => {
      setPecas(carregarPecasCadastradas())
      setServicos(carregarServicosCadastrados())
    }
    sincronizar()
    window.addEventListener('dev_oficina_estoque_updated', sincronizar)
    return () => window.removeEventListener('dev_oficina_estoque_updated', sincronizar)
  }, [])

  // Carrega OS vinculada via parâmetro de rota (?os=NUMERO), vindo do botão "Faturar no PDV"
  useEffect(() => {
    const numeroOS = searchParams.get('os')
    if (!numeroOS) return
    carregarOSParaFaturamento(numeroOS)
    setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const carregarOSParaFaturamento = (numeroOS) => {
    const ordens = obterOrdensAbertas()
    const os = ordens.find((item) => String(item.numeroOS) === String(numeroOS).trim())
    if (!os) {
      toast.warning(`Ordem de Serviço #${numeroOS} não foi encontrada entre as OS abertas.`)
      return
    }

    if (!STATUS_PERMITE_FATURAMENTO.includes(os.status)) {
      const statusLabel = STATUS_ORCAMENTO.find((s) => s.value === os.status)?.label || os.status
      toast.warning(
        `OS #${os.numeroOS} ainda está em "${statusLabel}". Só é possível faturar depois que o orçamento for aprovado e a execução iniciada.`
      )
      return
    }

    const itensOS = [
      ...(os.pecasOS || []).map((p) => ({
        uid: proximoUid('os-peca'),
        tipo: 'peca',
        origemOS: true,
        codigo: p.codigo,
        nome: p.nome,
        unidade: p.unidade || 'UN',
        quantidade: Number(p.quantidade) || 1,
        precoUnitario: Number(p.precoUnitario) || 0,
        desconto: Number(p.desconto) || 0,
        pecaId: null,
      })),
      ...(os.servicosOS || []).map((s) => ({
        uid: proximoUid('os-servico'),
        tipo: 'servico',
        origemOS: true,
        codigo: s.codigo,
        nome: s.nome,
        unidade: s.unidade || 'MO',
        quantidade: Number(s.quantidade) || 1,
        precoUnitario: Number(s.precoUnitario ?? s.valorUnitario) || 0,
        desconto: Number(s.desconto) || 0,
      })),
      ...(os.terceirosOS || []).map((t) => ({
        uid: proximoUid('os-terceiro'),
        tipo: 'terceiro',
        origemOS: true,
        codigo: t.codigo || '—',
        nome: `${t.nome}${t.parceiroNome ? ` (${t.parceiroNome})` : ''}`,
        unidade: 'SV',
        quantidade: Number(t.quantidade) || 1,
        precoUnitario: Number(t.valorVenda ?? t.precoUnitario) || 0,
        desconto: Number(t.desconto) || 0,
      })),
    ]

    setOsVinculada(os)
    setItensCarrinho(itensOS)
    setDescontoGeral(Number(os.descontoGeralOS) || 0)
    setTipoDescontoGeral('valor')
    setClienteSelecionado(null)
    setVeiculoSelecionado(null)
    setBuscaOS('')
    toast.success(`OS #${os.numeroOS} carregada no PDV para faturamento.`)
  }

  const handleBuscarOS = () => {
    if (!buscaOS.trim()) return
    carregarOSParaFaturamento(buscaOS.trim())
  }

  const handleDesvincularOS = () => {
    setOsVinculada(null)
    toast.info('OS desvinculada. Os itens permanecem no carrinho para conferência.')
  }

  const handleNovaVenda = () => {
    if (itensCarrinho.length === 0) {
      toast.info('O carrinho já está vazio.')
      return
    }
    setConfirmandoNovaVenda(true)
  }

  const confirmarNovaVenda = () => {
    setItensCarrinho([])
    setOsVinculada(null)
    setClienteSelecionado(null)
    setVeiculoSelecionado(null)
    setDescontoGeral(0)
    setTipoDescontoGeral('valor')
    setConfirmandoNovaVenda(false)
    toast.success('Nova venda iniciada com carrinho limpo.')
  }

  // Catálogo filtrado
  const pecasFiltradas = useMemo(() => {
    const termo = buscaCatalogo.trim().toLowerCase()
    return pecas.filter((p) => {
      if (p.ativo === false) return false
      if (!termo) return true
      return (
        p.nome?.toLowerCase().includes(termo) ||
        p.codigo?.toLowerCase().includes(termo) ||
        p.gtin?.toLowerCase().includes(termo) ||
        p.codigoFabricante?.toLowerCase().includes(termo)
      )
    })
  }, [pecas, buscaCatalogo])

  const servicosFiltrados = useMemo(() => {
    const termo = buscaCatalogo.trim().toLowerCase()
    return servicos.filter((s) => {
      if (s.ativo === false) return false
      if (!termo) return true
      return s.nome?.toLowerCase().includes(termo) || s.codigo?.toLowerCase().includes(termo)
    })
  }, [servicos, buscaCatalogo])

  const handleAdicionarPeca = (peca) => {
    const disponivel = Number(peca.estoqueAtual) || 0
    if (disponivel <= 0) {
      toast.warning(`"${peca.nome}" está sem estoque disponível no almoxarifado.`)
      return
    }

    setItensCarrinho((prev) => {
      const existente = prev.find((item) => item.pecaId === peca.id && !item.origemOS)
      if (existente) {
        if (existente.quantidade + 1 > disponivel) {
          toast.warning(`Estoque insuficiente. Disponível: ${disponivel} ${peca.unidade || 'UN'}.`)
          return prev
        }
        return prev.map((item) =>
          item.uid === existente.uid ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [
        ...prev,
        {
          uid: proximoUid('peca'),
          tipo: 'peca',
          origemOS: false,
          codigo: peca.codigo,
          nome: peca.nome,
          unidade: peca.unidade || 'UN',
          quantidade: 1,
          precoUnitario: Number(peca.precoVenda) || 0,
          desconto: 0,
          pecaId: peca.id,
          estoqueDisponivel: disponivel,
        },
      ]
    })
  }

  const handleAdicionarServico = (servico) => {
    setItensCarrinho((prev) => {
      const existente = prev.find((item) => item.tipo === 'servico' && item.codigo === servico.codigo && !item.origemOS)
      if (existente) {
        return prev.map((item) =>
          item.uid === existente.uid ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [
        ...prev,
        {
          uid: proximoUid('servico'),
          tipo: 'servico',
          origemOS: false,
          codigo: servico.codigo,
          nome: servico.nome,
          unidade: 'MO',
          quantidade: 1,
          precoUnitario: Number(servico.valorMaoDeObra) || 0,
          desconto: 0,
        },
      ]
    })
  }

  const handleAlterarQuantidade = (uid, delta) => {
    setItensCarrinho((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item
        const novaQtd = Math.max(1, item.quantidade + delta)
        if (item.tipo === 'peca' && !item.origemOS && novaQtd > (item.estoqueDisponivel || 0)) {
          toast.warning(`Estoque insuficiente. Disponível: ${item.estoqueDisponivel || 0} ${item.unidade}.`)
          return item
        }
        return { ...item, quantidade: novaQtd }
      })
    )
  }

  const handleAlterarDescontoItem = (uid, valor) => {
    setItensCarrinho((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item
        const bruto = item.quantidade * item.precoUnitario
        const desconto = Math.max(0, Math.min(Number(valor) || 0, bruto))
        return { ...item, desconto }
      })
    )
  }

  const handleRemoverItem = (uid) => {
    setItensCarrinho((prev) => prev.filter((item) => item.uid !== uid))
  }

  const totais = useMemo(
    () => calcularTotaisCarrinho(itensCarrinho, descontoGeral, tipoDescontoGeral),
    [itensCarrinho, descontoGeral, tipoDescontoGeral]
  )

  const clienteInfo = osVinculada
    ? {
        nome: osVinculada.cliente,
        documento: osVinculada.documento,
        telefone: osVinculada.telefone,
      }
    : clienteSelecionado
    ? {
        nome: clienteSelecionado.nome,
        documento: clienteSelecionado.documento,
        telefone: clienteSelecionado.telefone,
      }
    : null

  const veiculoInfo = osVinculada
    ? { placa: osVinculada.placa, marcaModelo: osVinculada.marcaModelo }
    : veiculoSelecionado
    ? { placa: veiculoSelecionado.placa, marcaModelo: veiculoSelecionado.marcaModelo }
    : null

  const handleAbrirPagamento = () => {
    if (itensCarrinho.length === 0) {
      toast.warning('Adicione ao menos um item ao carrinho antes de finalizar a venda.')
      return
    }
    setModalPagamentoAberto(true)
  }

  // Baixa estoque das peças vendidas (venda avulsa sempre; itens de OS somente quando existir correspondência por código no cadastro)
  const baixarEstoqueItensVendidos = (itens) => {
    const catalogo = carregarPecasCadastradas()
    itens
      .filter((item) => item.tipo === 'peca')
      .forEach((item) => {
        const pecaCatalogo = item.pecaId
          ? catalogo.find((p) => p.id === item.pecaId)
          : catalogo.find((p) => p.codigo === item.codigo)
        if (!pecaCatalogo) return
        try {
          registrarMovimentacaoEstoque({
            pecaId: pecaCatalogo.id,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            motivo: item.origemOS ? 'Aplicação em Ordem de Serviço' : 'Venda de Balcão (PDV)',
            documento: osVinculada ? `OS #${osVinculada.numeroOS}` : 'Venda Avulsa PDV',
            responsavel: 'Operador do PDV',
          })
        } catch {
          // Peça sem saldo suficiente no cadastro: ignora a baixa automática sem travar a venda
        }
      })
    window.dispatchEvent(new Event('dev_oficina_estoque_updated'))
  }

  const handleConfirmarPagamento = ({ formasPagamento, tipoNota, documentoNota, troco }) => {
    if (processandoPagamento) return
    setProcessandoPagamento(true)

    const numero = gerarNumeroVenda()
    const venda = {
      id: proximoUid('venda'),
      numeroVenda: numero,
      numeroNota: numero,
      serie: '001',
      tipoNota,
      documentoNota,
      dataHora: new Date().toLocaleString('pt-BR'),
      cliente: clienteInfo,
      veiculo: veiculoInfo,
      numeroOSVinculada: osVinculada?.numeroOS || null,
      itens: itensCarrinho,
      subtotal: totais.subtotal,
      descontoGeralValor: totais.descontoGeralValor,
      totalGeral: totais.totalGeral,
      formasPagamento,
      troco,
      chaveAcesso: gerarChaveAcessoMock(),
      protocolo: gerarProtocoloMock(),
    }

    registrarVendaPDV(venda)
    baixarEstoqueItensVendidos(itensCarrinho)

    if (osVinculada) {
      finalizarEArquivarOrdem(osVinculada.numeroOS, {
        formaPagamento: resumoFormasPagamento(formasPagamento),
        notaFiscal: `${tipoNota === 'nfe' ? 'NF-e' : 'NFC-e'} #${numero}`,
        valorTotal: totais.totalGeral,
      })
    }

    toast.success(`Venda #${numero} finalizada e nota fiscal emitida com sucesso!`)

    setModalPagamentoAberto(false)
    setVendaFinalizada(venda)
    setReciboAberto(true)

    setItensCarrinho([])
    setOsVinculada(null)
    setClienteSelecionado(null)
    setVeiculoSelecionado(null)
    setDescontoGeral(0)
    setTipoDescontoGeral('valor')
    setProcessandoPagamento(false)
  }

  return (
    <div className="h-full w-full flex flex-col gap-3 overflow-hidden select-none">
      {/* Barra Superior */}
      <div className="shrink-0 flex items-center justify-between gap-3 bg-white border border-[#e4e7ec] rounded-2xl px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-[#38bdf8] flex items-center justify-center shrink-0">
            <CreditCard size={19} weight="bold" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-[#101828] leading-none">Ponto de Venda (PDV)</h1>
            <p className="text-[11px] text-[#667085] mt-0.5">
              Venda de balcão, fechamento de Ordens de Serviço e emissão de nota fiscal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {osVinculada ? (
            <div className="h-9 px-3 rounded-xl bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] text-xs font-bold flex items-center gap-2">
              <IdentificationCard size={15} weight="bold" />
              <span>Vinculada à OS #{osVinculada.numeroOS}</span>
              <button
                type="button"
                onClick={handleDesvincularOS}
                className="text-[#0369a1] hover:text-[#101828] cursor-pointer"
                title="Desvincular OS"
              >
                <LinkBreak size={14} weight="bold" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={buscaOS}
                onChange={(e) => setBuscaOS(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBuscarOS()}
                placeholder="Vincular OS Nº..."
                className="h-9 w-36 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
              <button
                type="button"
                onClick={handleBuscarOS}
                className="h-9 px-3 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Vincular
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleNovaVenda}
            className="h-9 px-3 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Descartar carrinho atual e iniciar nova venda"
          >
            <ArrowsClockwise size={14} weight="bold" />
            Nova Venda
          </button>
        </div>
      </div>

      {/* Corpo Principal */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-3 overflow-hidden">
        {/* Painel de Catálogo */}
        <div className="min-h-0 flex flex-col bg-white border border-[#e4e7ec] rounded-2xl overflow-hidden">
          <div className="shrink-0 px-4 pt-3.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAbaCatalogo('pecas')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                abaCatalogo === 'pecas' ? 'bg-[#101828] text-white' : 'bg-[#f8fafc] text-[#475467] hover:bg-[#f2f4f7]'
              }`}
            >
              <Package size={15} weight="bold" />
              Peças e Produtos
            </button>
            <button
              type="button"
              onClick={() => setAbaCatalogo('servicos')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                abaCatalogo === 'servicos' ? 'bg-[#101828] text-white' : 'bg-[#f8fafc] text-[#475467] hover:bg-[#f2f4f7]'
              }`}
            >
              <Wrench size={15} weight="bold" />
              Serviços
            </button>
          </div>

          <div className="shrink-0 px-4 pt-3">
            <div className="relative">
              <MagnifyingGlass size={15} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
              <input
                type="text"
                value={buscaCatalogo}
                onChange={(e) => setBuscaCatalogo(e.target.value)}
                placeholder={abaCatalogo === 'pecas' ? 'Buscar por nome, código ou GTIN/EAN...' : 'Buscar por nome ou código...'}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-1.5">
            {abaCatalogo === 'pecas' &&
              (pecasFiltradas.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#98a2b3] font-semibold">Nenhuma peça encontrada.</div>
              ) : (
                pecasFiltradas.map((peca) => {
                  const semEstoque = (Number(peca.estoqueAtual) || 0) <= 0
                  return (
                    <button
                      key={peca.id}
                      type="button"
                      onClick={() => handleAdicionarPeca(peca)}
                      disabled={semEstoque}
                      className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[#eaecf0] hover:border-[#bae6fd] hover:bg-[#f0f9ff] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#101828] truncate">{peca.nome}</p>
                        <p className="text-[10.5px] text-[#667085] font-semibold">
                          Cód. {peca.codigo} • Estoque: {peca.estoqueAtual ?? 0} {peca.unidade || 'UN'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-bold text-[#101828]">R$ {formatMoeda(peca.precoVenda)}</span>
                        <span className="w-7 h-7 rounded-lg bg-[#e0f2fe] text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white flex items-center justify-center transition-all">
                          <Plus size={14} weight="bold" />
                        </span>
                      </div>
                    </button>
                  )
                })
              ))}

            {abaCatalogo === 'servicos' &&
              (servicosFiltrados.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#98a2b3] font-semibold">Nenhum serviço encontrado.</div>
              ) : (
                servicosFiltrados.map((servico) => (
                  <button
                    key={servico.id}
                    type="button"
                    onClick={() => handleAdicionarServico(servico)}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[#eaecf0] hover:border-[#bae6fd] hover:bg-[#f0f9ff] transition-all text-left cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#101828] truncate">{servico.nome}</p>
                      <p className="text-[10.5px] text-[#667085] font-semibold">
                        Cód. {servico.codigo} • {servico.categoria || 'Serviço'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-bold text-[#101828]">R$ {formatMoeda(servico.valorMaoDeObra)}</span>
                      <span className="w-7 h-7 rounded-lg bg-[#e0f2fe] text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white flex items-center justify-center transition-all">
                        <Plus size={14} weight="bold" />
                      </span>
                    </div>
                  </button>
                ))
              ))}
          </div>
        </div>

        {/* Painel do Carrinho */}
        <div className="min-h-0 flex flex-col bg-white border border-[#e4e7ec] rounded-2xl overflow-hidden">
          <div className="shrink-0 px-4 pt-3.5 pb-3 border-b border-[#f2f4f7] space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <ShoppingCartSimple size={15} weight="bold" className="text-[#0284c7]" />
              Cupom Atual
            </span>

            {osVinculada ? (
              <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-xl px-3 py-2 text-xs">
                <p className="font-bold text-[#101828] flex items-center gap-1.5">
                  <User size={13} weight="bold" />
                  {osVinculada.cliente}
                </p>
                {osVinculada.placa && (
                  <p className="text-[#667085] font-semibold flex items-center gap-1.5 mt-0.5">
                    <Car size={13} weight="bold" />
                    {osVinculada.marcaModelo} • Placa {osVinculada.placa}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Select
                  value={clienteSelecionado}
                  onChange={(opt) => {
                    setClienteSelecionado(opt)
                    setVeiculoSelecionado(null)
                  }}
                  options={MOCK_CLIENTES_VEICULOS}
                  styles={customSelectStyles}
                  isClearable
                  placeholder="Cliente (opcional) — Consumidor Final"
                />
                {clienteSelecionado && (
                  <Select
                    value={veiculoSelecionado}
                    onChange={setVeiculoSelecionado}
                    options={clienteSelecionado.veiculos || []}
                    styles={customSelectStyles}
                    isClearable
                    placeholder="Veículo (opcional)"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2">
            {itensCarrinho.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-[#98a2b3] py-10">
                <ShoppingCartSimple size={32} weight="light" />
                <p className="text-xs font-semibold max-w-[220px]">
                  Adicione peças ou serviços do catálogo para iniciar a venda.
                </p>
              </div>
            ) : (
              itensCarrinho.map((item) => (
                <div key={item.uid} className="border border-[#eaecf0] rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-bold text-[#101828] truncate">{item.nome}</p>
                      <p className="text-[10px] text-[#98a2b3] font-semibold uppercase">
                        {item.tipo === 'peca' ? 'Peça' : item.tipo === 'servico' ? 'Serviço' : 'Terceiro'}
                        {item.origemOS ? ' • Da OS' : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoverItem(item.uid)}
                      className="w-6 h-6 rounded-md text-rose-500 hover:bg-rose-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      title="Remover item"
                    >
                      <Trash size={13} weight="bold" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAlterarQuantidade(item.uid, -1)}
                        className="w-6 h-6 rounded-md border border-[#d0d5dd] flex items-center justify-center text-[#475467] hover:bg-[#f2f4f7] cursor-pointer"
                      >
                        <Minus size={11} weight="bold" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#101828]">{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => handleAlterarQuantidade(item.uid, 1)}
                        className="w-6 h-6 rounded-md border border-[#d0d5dd] flex items-center justify-center text-[#475467] hover:bg-[#f2f4f7] cursor-pointer"
                      >
                        <Plus size={11} weight="bold" />
                      </button>
                    </div>

                    <span className="text-[11px] font-semibold text-[#667085]">
                      R$ {formatMoeda(item.precoUnitario)} / {item.unidade}
                    </span>

                    <span className="text-xs font-bold text-[#101828]">
                      R$ {formatMoeda(Math.max(0, item.quantidade * item.precoUnitario - (item.desconto || 0)))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#98a2b3] font-semibold">Desconto no item</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-[#98a2b3]">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.desconto || 0}
                        onChange={(e) => handleAlterarDescontoItem(item.uid, e.target.value)}
                        className="w-16 h-6 px-1.5 rounded-md border border-[#d0d5dd] text-[10.5px] font-bold text-[#101828] bg-white text-right focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 border-t border-[#f2f4f7] px-4 py-3.5 space-y-2.5 bg-[#f8fafc]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#667085] font-semibold">Subtotal</span>
              <span className="font-bold text-[#101828]">R$ {formatMoeda(totais.subtotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[#667085] font-semibold shrink-0">Desconto Geral</span>
              <div className="flex items-center gap-1">
                <div className="flex rounded-lg border border-[#d0d5dd] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTipoDescontoGeral('valor')}
                    className={`px-2 h-7 text-[10px] font-bold cursor-pointer ${
                      tipoDescontoGeral === 'valor' ? 'bg-[#101828] text-white' : 'bg-white text-[#667085]'
                    }`}
                  >
                    R$
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoDescontoGeral('percentual')}
                    className={`px-2 h-7 text-[10px] font-bold cursor-pointer ${
                      tipoDescontoGeral === 'percentual' ? 'bg-[#101828] text-white' : 'bg-white text-[#667085]'
                    }`}
                  >
                    %
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={descontoGeral}
                  onChange={(e) => setDescontoGeral(e.target.value)}
                  className="w-20 h-7 px-2 rounded-lg border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white text-right focus:outline-none focus:border-[#0284c7]"
                />
              </div>
            </div>

            {totais.descontoGeralValor > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#667085] font-semibold">Valor do Desconto</span>
                <span className="font-bold text-rose-600">- R$ {formatMoeda(totais.descontoGeralValor)}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1.5 border-t border-[#e4e7ec]">
              <span className="text-sm font-bold text-[#101828]">Total</span>
              <span className="text-xl font-black text-[#0284c7]">R$ {formatMoeda(totais.totalGeral)}</span>
            </div>

            <button
              type="button"
              onClick={handleAbrirPagamento}
              disabled={itensCarrinho.length === 0}
              className="w-full h-11 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-[#d0d5dd] disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Receipt size={17} weight="bold" />
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      <ModalFechamentoPagamento
        isOpen={modalPagamentoAberto}
        onClose={() => setModalPagamentoAberto(false)}
        totalGeral={totais.totalGeral}
        cliente={clienteInfo}
        numeroOSVinculada={osVinculada?.numeroOS}
        onConfirmar={handleConfirmarPagamento}
        processando={processandoPagamento}
      />

      <ReciboVendaImpressao
        isOpen={reciboAberto}
        onClose={() => setReciboAberto(false)}
        venda={vendaFinalizada}
      />

      {/* Diálogo de Confirmação para Iniciar Nova Venda na Frente da Tela */}
      <ModalConfirmacao
        isOpen={confirmandoNovaVenda}
        onClose={() => setConfirmandoNovaVenda(false)}
        onConfirm={confirmarNovaVenda}
        titulo="Iniciar nova venda e limpar carrinho?"
        descricao="Todos os itens adicionados e dados não concluídos serão descartados do PDV."
        itemDestaque={`Itens no carrinho: ${itensCarrinho.length} item(ns)`}
        textoConfirmar="Sim, Limpar e Iniciar"
        textoCancelar="Cancelar"
        variante="aviso"
      />
    </div>
  )
}
