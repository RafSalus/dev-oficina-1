import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Receipt,
  Car,
  Sparkle,
  Printer,
  WhatsappLogo,
  Copy,
  Check,
  ArrowSquareOut,
  CurrencyDollar,
  Tag,
  Clock,
  PencilSimple,
  FloppyDisk,
  X,
  ShieldCheck,
  Package,
  Wrench,
  Handshake,
  ArrowsClockwise,
  CheckCircle,
  ArrowsOutSimple,
  ArrowsInSimple,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
} from '@phosphor-icons/react'
import { FolhaOrdemServicoImpressao } from '../../../../components/dashboard/FolhaOrdemServicoImpressao'
import { toast } from 'sonner'

export function TabOrcamento({ formData, updateFormData, onCancel }) {
  const {
    numeroOS = '',
    cliente = '',
    documento = '',
    telefone = '',
    endereco = '',
    cidade = '',
    uf = '',
    cep = '',
    placa = '',
    marcaModelo = '',
    ano = '',
    cor = '',
    km = '',
    relatoCliente = '',
    mecanicoNome = '',
    laudoTecnico = '',
    pecasOS = [],
    servicosOS = [],
    terceirosOS = [],
    descontoGeralOS = '0.00',
    condicaoPagamentoOS = 'À vista com 5% de desconto no PIX ou até 10x no cartão',
    previsaoEntregaData = '',
    previsaoEntregaHora = '18:00',
    consultorResponsavel = 'BIANCA',
  } = formData

  // Modais de apoio
  const [modalDadosAberto, setModalDadosAberto] = useState(false)
  const [modalLaudoAberto, setModalLaudoAberto] = useState(false)
  const [modalAjustesAberto, setModalAjustesAberto] = useState(false)
  const [modalNotaExpandida, setModalNotaExpandida] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [paginaSelecionada, setPaginaSelecionada] = useState('todas')
  const [copiadoLink, setCopiadoLink] = useState(false)

  // Remove simulação de 30 itens caso tenha sido carregada no rascunho
  useEffect(() => {
    if (
      terceirosOS?.some((t) => t.id === 'terc-sim-1' || t.id === 'terc-sim-2') ||
      (pecasOS?.length === 30 && pecasOS[29]?.codigo === '017291')
    ) {
      updateFormData({
        pecasOS: [],
        servicosOS: [],
        terceirosOS: [],
      })
    }
  }, [])

  // Fecha a visualização ampliada ao pressionar a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalNotaExpandida) {
        setModalNotaExpandida(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalNotaExpandida])

  // Calculos dos totais consolidados da OS
  const metricas = useMemo(() => {
    let totalPecas = 0
    let descPecas = 0
    pecasOS.forEach((p) => {
      const qtd = parseFloat(p.quantidade) || 1
      const pr = parseFloat(p.precoUnitario) || 0
      const desc = parseFloat(p.desconto) || 0
      totalPecas += pr * qtd
      descPecas += desc
    })
    const subPecas = Math.max(0, totalPecas - descPecas)

    let totalServicos = 0
    let descServicos = 0
    servicosOS.forEach((s) => {
      const qtd = parseFloat(s.quantidade) || 1
      const pr = parseFloat(s.valorUnitario ?? s.precoUnitario) || 0
      const desc = parseFloat(s.desconto) || 0
      totalServicos += pr * qtd
      descServicos += desc
    })
    const subServicos = Math.max(0, totalServicos - descServicos)

    let totalTerceiros = 0
    let descTerceiros = 0
    terceirosOS.forEach((t) => {
      const pr = parseFloat(t.valorVenda) || 0
      const desc = parseFloat(t.desconto) || 0
      totalTerceiros += pr
      descTerceiros += desc
    })
    const subTerceiros = Math.max(0, totalTerceiros - descTerceiros)

    const descGeral = parseFloat(descontoGeralOS) || 0
    const totalLiquido = Math.max(0, subPecas + subServicos + subTerceiros - descGeral)

    return {
      totalPecas: subPecas.toFixed(2),
      totalServicos: subServicos.toFixed(2),
      totalTerceiros: subTerceiros.toFixed(2),
      totalDescontos: (descPecas + descServicos + descTerceiros + descGeral).toFixed(2),
      totalLiquido: totalLiquido.toFixed(2),
    }
  }, [pecasOS, servicosOS, terceirosOS, descontoGeralOS])

  // Salva no localStorage para sincronizar com a pagina publica de aprovacao do cliente
  const salvarNoStorageCompartilhado = () => {
    try {
      const orcamentosRaw = localStorage.getItem('dev_oficina_orcamentos')
      const orcamentos = orcamentosRaw ? JSON.parse(orcamentosRaw) : {}
      orcamentos[numeroOS] = {
        ...formData,
        numeroOS,
        metricas,
      }
      localStorage.setItem('dev_oficina_orcamentos', JSON.stringify(orcamentos))
    } catch (e) {
      console.error('Erro ao sincronizar orcamento no storage:', e)
    }
  }

  // Link publico para envio ao cliente
  const urlAprovacaoCliente = useMemo(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://dev-oficina.com'
    return `${origin}/aprovacao/${numeroOS || '002908'}`
  }, [numeroOS])

  // Copiar link do cliente
  const handleCopiarLink = () => {
    salvarNoStorageCompartilhado()
    navigator.clipboard.writeText(urlAprovacaoCliente)
    setCopiadoLink(true)
    toast.success('Link do portal de aprovação do cliente copiado!')
    setTimeout(() => setCopiadoLink(false), 2500)
  }

  // Abrir tela do cliente em nova aba
  const handleAbrirPortalCliente = () => {
    salvarNoStorageCompartilhado()
    window.open(urlAprovacaoCliente, '_blank')
  }

  // Disparar WhatsApp para o cliente com link de aprovacao
  const handleDispararWhatsAppCliente = () => {
    salvarNoStorageCompartilhado()

    const telDestino = (telefone || '').replace(/\D/g, '')
    const veiculoTexto = placa
      ? `${placa} (${marcaModelo || 'Veículo'})`
      : marcaModelo || 'Veículo'

    const mensagem = `Olá, *${cliente || 'Cliente'}*! 👋%0A%0AAqui é da *Mecânica Gabriel*. O orçamento técnico do seu veículo *${veiculoTexto}* já está concluído com transparência total e fotos das peças avariadas.%0A%0A📄 *Orçamento:* #${numeroOS}%0A💰 *Total:* R$ ${metricas.totalLiquido}%0A%0A📲 *Acesse o link exclusivo abaixo para conferir o laudo, fotos das peças e aprovar online:*%0A🔗 ${urlAprovacaoCliente}`

    const urlZap = telDestino
      ? `https://wa.me/55${telDestino}?text=${mensagem}`
      : `https://wa.me/?text=${mensagem}`

    toast.info('Abrindo WhatsApp para envio ao cliente...')
    window.open(urlZap, '_blank')
  }

  // Imprimir folha oficial
  const handleImprimir = () => {
    window.print()
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* 1. BARRA SUPERIOR DE AÇÕES E INTEGRAÇÕES */}
      <div className="h-12 shrink-0 bg-white px-3 sm:px-4 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-2 print:hidden">
        {/* Lado Esquerdo: Identificação e Botões de Apoio */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Receipt size={16} weight="bold" />
          </div>

          <div className="min-w-0 hidden xl:block">
            <span className="text-xs font-bold text-[#101828] block leading-tight">
              Orçamento #{numeroOS}
            </span>
            <span className="text-[10px] text-[#667085] block">
              Visualização fiel à folha oficial e aprovação do cliente
            </span>
          </div>

          {/* Botão de Dados do Veículo */}
          <button
            type="button"
            onClick={() => setModalDadosAberto(true)}
            className="h-8 px-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar dados do cliente e queixa"
          >
            <Car size={15} weight="bold" className="text-[#344054]" />
            <span className="truncate max-w-[130px]">
              {placa ? `${placa} • ${marcaModelo || 'Veículo'}` : 'Dados do Veículo'}
            </span>
          </button>

          {/* Botão de Ver Laudo Técnico */}
          <button
            type="button"
            onClick={() => setModalLaudoAberto(true)}
            className="h-8 px-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Visualizar laudo técnico emitido no diagnóstico"
          >
            <Sparkle size={15} weight="fill" className={laudoTecnico ? 'text-amber-500' : 'text-[#667085]'} />
            <span className="hidden sm:inline">Ver Laudo</span>
          </button>

        </div>

        {/* Lado Direito: Ações de Impressão, Ajustes e Envio ao Cliente */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Botão: Ajustar Previsão e Desconto */}
          <button
            type="button"
            onClick={() => setModalAjustesAberto(true)}
            className="h-8.5 px-3 rounded-xl bg-white hover:bg-[#f8fafc] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Ajustar desconto geral, previsão de entrega e atendente"
          >
            <PencilSimple size={14} weight="bold" />
            <span className="hidden sm:inline">Ajustar Condições</span>
          </button>

          {/* Botão: Expandir Nota */}
          <button
            type="button"
            onClick={() => setModalNotaExpandida(true)}
            className="h-8.5 px-3 rounded-xl bg-white hover:bg-[#f8fafc] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Expandir nota em tela cheia para ver maior"
          >
            <ArrowsOutSimple size={15} weight="bold" className="text-[#0284c7]" />
            <span className="hidden sm:inline">Expandir Nota</span>
          </button>

          {/* Botão: Imprimir Folha Oficial */}
          <button
            type="button"
            onClick={handleImprimir}
            className="h-8.5 px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f2f4f7] border border-[#d0d5dd] text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Imprimir folha oficial idêntica ao modelo físico da oficina"
          >
            <Printer size={15} weight="bold" />
            <span>Imprimir</span>
          </button>

          {/* Botão: Copiar Link de Aprovação */}
          <button
            type="button"
            onClick={handleCopiarLink}
            className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Copiar link do portal do cliente"
          >
            {copiadoLink ? (
              <>
                <Check size={14} weight="bold" className="text-[#0284c7]" />
                <span className="hidden md:inline">Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={14} weight="bold" />
                <span className="hidden md:inline">Copiar Link</span>
              </>
            )}
          </button>

          {/* Botão: Abrir Portal do Cliente */}
          <button
            type="button"
            onClick={handleAbrirPortalCliente}
            className="h-8.5 px-3 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Abrir página de aprovação interativa do cliente"
          >
            <ArrowSquareOut size={14} weight="bold" className="text-[#38bdf8]" />
            <span>Portal do Cliente</span>
          </button>

          {/* Botão Principal: Disparar WhatsApp para o Cliente */}
          <button
            type="button"
            onClick={handleDispararWhatsAppCliente}
            className="h-8.5 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Enviar link da aprovação com laudo e fotos no WhatsApp do cliente"
          >
            <WhatsappLogo size={16} weight="fill" />
            <span className="hidden sm:inline">Enviar no WhatsApp</span>
          </button>
        </div>
      </div>

      {/* 2. ÁREA CENTRAL: VISUALIZADOR DA FOLHA OFICIAL */}
      <div className="flex-1 min-h-0 bg-[#e4e7ec] rounded-2xl border border-[#d0d5dd] shadow-inner p-3 sm:p-6 overflow-y-auto flex justify-center relative group print:bg-white print:p-0 print:border-none print:shadow-none print:overflow-visible">
        {/* Controles Flutuantes de Paginação, Zoom e Botão de Expandir */}
        <div className="absolute top-3 right-5 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-[#d0d5dd] rounded-xl shadow-md p-1 print:hidden">
          {/* Seletor de Folhas A4 */}
          <div className="flex items-center bg-[#f2f4f7] rounded-lg p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setPaginaSelecionada('todas')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                paginaSelecionada === 'todas'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
              title="Ver todas as folhas da OS empilhadas"
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setPaginaSelecionada('1')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                paginaSelecionada === '1'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
              title="Visualizar apenas Folha 1"
            >
              Folha 1
            </button>
            <button
              type="button"
              onClick={() => setPaginaSelecionada('2')}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                paginaSelecionada === '2'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
              title="Visualizar apenas Folha 2"
            >
              Folha 2
            </button>
          </div>

          <div className="w-[1px] h-4 bg-[#d0d5dd]" />

          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(0.7, Number((prev - 0.1).toFixed(2))))}
            className="w-7 h-7 rounded-lg hover:bg-[#f2f4f7] text-[#475467] hover:text-[#101828] flex items-center justify-center cursor-pointer transition-colors"
            title="Diminuir zoom da folha"
          >
            <MagnifyingGlassMinus size={14} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="px-1.5 h-7 rounded-lg hover:bg-[#f2f4f7] text-[11px] font-mono font-bold text-[#344054] cursor-pointer"
            title="Redefinir zoom para 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(1.8, Number((prev + 0.1).toFixed(2))))}
            className="w-7 h-7 rounded-lg hover:bg-[#f2f4f7] text-[#475467] hover:text-[#101828] flex items-center justify-center cursor-pointer transition-colors"
            title="Aumentar zoom da folha"
          >
            <MagnifyingGlassPlus size={14} weight="bold" />
          </button>
          <div className="w-[1px] h-4 bg-[#d0d5dd] mx-0.5" />
          <button
            type="button"
            onClick={() => setModalNotaExpandida(true)}
            className="h-7 px-2.5 rounded-lg bg-[#101828] hover:bg-black text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            title="Expandir nota em tela cheia para ver maior"
          >
            <ArrowsOutSimple size={13} weight="bold" className="text-[#38bdf8]" />
            <span>Expandir</span>
          </button>
        </div>

        <div
          style={{
            transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.12s ease-out',
          }}
          className="pb-8"
        >
          <FolhaOrdemServicoImpressao
            formData={formData}
            paginaSelecionada={paginaSelecionada}
            className="print:border-none print:shadow-none"
          />
        </div>
      </div>

      {/* 4. BARRA INFERIOR DE AÇÕES (NAVEGAÇÃO OFICIAL DA OS) */}
      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between print:hidden">
        <span className="text-xs font-medium text-[#667085]">
          Aba 7 de 7 • <strong className="text-[#101828] font-bold">Composição de Orçamento</strong>
        </span>

        <button
          type="submit"
          form="form-nova-os"
          onClick={() => salvarNoStorageCompartilhado()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <FloppyDisk size={15} weight="bold" />
          <span>Salvar e Finalizar OS</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: AJUSTES DE CONDIÇÕES, DESCONTOS E ATENDIMENTO */}
      {/* ========================================================================= */}
      {modalAjustesAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#d0d5dd] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PencilSimple size={18} weight="bold" className="text-[#0284c7]" />
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Ajustar Parâmetros do Orçamento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAjustesAberto(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Número do Orçamento / OS
                  </label>
                  <input
                    type="text"
                    value={numeroOS}
                    onChange={(e) => updateFormData({ numeroOS: e.target.value })}
                    className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] font-mono font-bold text-xs text-[#101828] bg-[#f8fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Consultor / Atendente
                  </label>
                  <input
                    type="text"
                    value={consultorResponsavel}
                    onChange={(e) =>
                      updateFormData({ consultorResponsavel: e.target.value })
                    }
                    placeholder="Ex: BIANCA"
                    className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Desconto Geral Adicional (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={descontoGeralOS}
                    onChange={(e) =>
                      updateFormData({ descontoGeralOS: e.target.value })
                    }
                    className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#b42318] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Previsão de Entrega (Data e Hora)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="date"
                      value={previsaoEntregaData}
                      onChange={(e) =>
                        updateFormData({ previsaoEntregaData: e.target.value })
                      }
                      className="w-full h-9.5 px-2 rounded-xl border border-[#d0d5dd] text-[11px] text-[#101828] bg-white"
                    />
                    <input
                      type="time"
                      value={previsaoEntregaHora}
                      onChange={(e) =>
                        updateFormData({ previsaoEntregaHora: e.target.value })
                      }
                      className="w-full h-9.5 px-2 rounded-xl border border-[#d0d5dd] text-[11px] text-[#101828] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Texto de Condições de Pagamento
                </label>
                <input
                  type="text"
                  value={condicaoPagamentoOS}
                  onChange={(e) =>
                    updateFormData({ condicaoPagamentoOS: e.target.value })
                  }
                  placeholder="Ex: À vista com 5% de desconto no PIX ou até 10x no cartão"
                  className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs text-[#101828] bg-white"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  salvarNoStorageCompartilhado()
                  setModalAjustesAberto(false)
                  toast.success('Parâmetros do orçamento atualizados!')
                }}
                className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Concluir Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DADOS DO VEÍCULO E CLIENTE */}
      {/* ========================================================================= */}
      {modalDadosAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#d0d5dd] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Car size={18} weight="bold" className="text-[#0284c7]" />
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Dados do Veículo e Cliente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e4e7ec] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Cliente:</span>
                  <strong className="text-[#101828]">{cliente || 'Não identificado'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">CPF/CNPJ:</span>
                  <span className="text-[#101828] font-mono">{documento || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Telefone:</span>
                  <span className="text-[#101828] font-semibold">{telefone || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Endereço:</span>
                  <span className="text-[#101828]">{endereco || 'Não informado'}</span>
                </div>
              </div>

              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e4e7ec] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Veículo:</span>
                  <strong className="text-[#101828]">{marcaModelo || 'Não informado'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Placa:</span>
                  <strong className="text-[#0284c7] font-mono">{placa || 'Sem placa'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Ano / Cor:</span>
                  <span className="text-[#101828]">{ano || 'Ano N/D'} • {cor || 'Cor N/D'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Quilometragem:</span>
                  <span className="text-[#101828] font-semibold">{km ? `${km} km` : 'Não informada'}</span>
                </div>
              </div>

              {relatoCliente && (
                <div>
                  <span className="text-[11px] font-bold text-[#667085] uppercase block mb-1">
                    Queixa Inicial do Cliente:
                  </span>
                  <div className="p-3 bg-white border border-[#d0d5dd] rounded-xl text-[#344054] italic leading-relaxed">
                    "{relatoCliente}"
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex justify-end">
              <button
                type="button"
                onClick={() => setModalDadosAberto(false)}
                className="px-4 py-1.5 rounded-xl bg-[#101828] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LAUDO TÉCNICO */}
      {/* ========================================================================= */}
      {modalLaudoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white w-full max-w-2xl h-[75vh] rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkle size={18} weight="fill" className="text-amber-500" />
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Laudo Técnico do Diagnóstico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalLaudoAberto(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="flex-1 min-h-0 p-5 overflow-y-auto">
              <textarea
                rows={12}
                value={laudoTecnico}
                onChange={(e) => updateFormData({ laudoTecnico: e.target.value })}
                placeholder="Nenhum laudo gerado..."
                className="w-full h-full p-4 rounded-xl border border-[#d0d5dd] font-mono text-xs text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] resize-none leading-relaxed"
              />
            </div>

            <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex justify-end">
              <button
                type="button"
                onClick={() => setModalLaudoAberto(false)}
                className="px-4 py-1.5 rounded-xl bg-[#101828] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VISUALIZAÇÃO EXPANDIDA EM TELA CHEIA DA NOTA DE ORÇAMENTO */}
      {/* ========================================================================= */}
      {modalNotaExpandida && (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/90 backdrop-blur-sm flex flex-col animate-in fade-in duration-150 select-none">
          {/* Barra Superior da Visualização Ampliada */}
          <div className="h-14 px-4 sm:px-6 bg-[#1e293b] border-b border-[#334155] text-white flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 text-[#38bdf8] flex items-center justify-center font-bold shrink-0">
                <Receipt size={18} weight="bold" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                  Visualização Ampliada da Ordem de Serviço
                  <span className="font-mono px-2 py-0.5 rounded-md bg-black/40 text-[#38bdf8] text-xs font-bold border border-white/10">
                    #{numeroOS}
                  </span>
                </h2>
                <p className="text-[11px] text-[#94a3b8] truncate">
                  {cliente || 'Cliente'} • {placa || 'Sem placa'} {marcaModelo ? `(${marcaModelo})` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Seletor de Folhas A4 na Modal */}
              <div className="flex items-center bg-[#0f172a] border border-[#334155] rounded-xl p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaginaSelecionada('todas')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    paginaSelecionada === 'todas'
                      ? 'bg-[#0284c7] text-white shadow-xs'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Todas as Folhas
                </button>
                <button
                  type="button"
                  onClick={() => setPaginaSelecionada('1')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    paginaSelecionada === '1'
                      ? 'bg-[#0284c7] text-white shadow-xs'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Folha 1
                </button>
                <button
                  type="button"
                  onClick={() => setPaginaSelecionada('2')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    paginaSelecionada === '2'
                      ? 'bg-[#0284c7] text-white shadow-xs'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  Folha 2
                </button>
              </div>

              {/* Controles de Zoom da Modal */}
              <div className="flex items-center bg-[#0f172a] rounded-xl border border-[#334155] p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(0.7, Number((prev - 0.1).toFixed(2))))}
                  className="w-7 h-7 rounded-lg hover:bg-[#334155] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Diminuir zoom"
                >
                  <MagnifyingGlassMinus size={15} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1.15)}
                  className="px-2 h-7 rounded-lg hover:bg-[#334155] text-xs font-mono font-bold text-white transition-colors cursor-pointer"
                  title="Ajustar zoom para 115%"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(2.0, Number((prev + 0.1).toFixed(2))))}
                  className="w-7 h-7 rounded-lg hover:bg-[#334155] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Aumentar zoom"
                >
                  <MagnifyingGlassPlus size={15} weight="bold" />
                </button>
              </div>

              {/* Botão Imprimir */}
              <button
                type="button"
                onClick={handleImprimir}
                className="h-8.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#0f172a] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                title="Imprimir folha oficial"
              >
                <Printer size={15} weight="bold" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>

              {/* Botão Reduzir / Fechar */}
              <button
                type="button"
                onClick={() => setModalNotaExpandida(false)}
                className="h-8.5 px-3.5 rounded-xl bg-[#334155] hover:bg-[#475569] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ml-1"
                title="Fechar visualização ampliada (Esc)"
              >
                <ArrowsInSimple size={15} weight="bold" />
                <span>Reduzir</span>
              </button>
            </div>
          </div>

          {/* Conteúdo com Scroll da Folha em Alta Escala */}
          <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-10 flex justify-center items-start">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.12s ease-out',
              }}
              className="pb-20 pt-2"
            >
              <FolhaOrdemServicoImpressao
                formData={formData}
                paginaSelecionada={paginaSelecionada}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
