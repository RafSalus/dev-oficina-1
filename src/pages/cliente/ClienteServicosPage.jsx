import React, { useState, useMemo } from 'react'
import {
  FileText,
  Printer,
  Copy,
  CheckCircle,
  Receipt,
  CarProfile,
  Wrench,
  Package,
  GearSix,
  Check,
  X,
  Lock,
  Info,
  WhatsappLogo,
  ShieldCheck,
  CreditCard,
  Eye,
  Clock,
  WarningCircle,
  Camera,
  ArrowsClockwise,
  ArrowRight,
  MagnifyingGlassPlus,
  Sparkle,
} from '@phosphor-icons/react'
import { useCliente } from '../../context/ClienteContext'
import { WHATSAPP_ACCESS } from '../../constants/company'
import { gerarLaudoTecnico } from '../../constants/catalogoPecasServicos'
import { toast } from 'sonner'
import { useIsMobile } from '../../hooks/useIsMobile'
import { MobileClienteServicosPage } from './mobile/MobileClienteServicosPage'

// Estrutura base da Ordem de Serviço exibida no portal do cliente
const DADOS_SERVICO_INICIAL = {
  numeroOS: '',
  dataEmissao: '',
  horaEmissao: '',
  consultor: '',
  mecanico: '',
  veiculo: '',
  placa: '',
  ano: '',
  km: '',
  relatoCliente: '',
  pecas: [],
  servicos: [],
  terceiros: [],
}

export function ClienteServicosPage() {
  const isMobile = useIsMobile()
  const { clienteAtivo } = useCliente()

  // Controle da Aba Ativa: 'orcamento' ou 'laudo'
  const [abaAtiva, setAbaAtiva] = useState('orcamento')

  // Carrega ou inicializa dados da OS
  const [servico] = useState(DADOS_SERVICO_INICIAL)

  // Armazena itens marcados pelo cliente (por padrão todos iniciam ativos)
  const [itensMarcados, setItensMarcados] = useState(() => {
    const todosIds = new Set([
      ...DADOS_SERVICO_INICIAL.pecas.map((p) => p.id),
      ...DADOS_SERVICO_INICIAL.servicos.map((s) => s.id),
      ...DADOS_SERVICO_INICIAL.terceiros.map((t) => t.id),
    ])
    return todosIds
  })

  // Estado de aprovação
  const [aprovado, setAprovado] = useState(() => {
    try {
      return localStorage.getItem(`dev_oficina_aprovacao_${DADOS_SERVICO_INICIAL.numeroOS}`) === 'true'
    } catch {
      return false
    }
  })

  // Modais e Controles
  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [fotoZoom, setFotoZoom] = useState(null)
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [nomeResponsavel, setNomeResponsavel] = useState(clienteAtivo?.nome || '')

  // Laudo formatado no padrão oficial homologado da Oficina (gerado pela tela de OS)
  const laudoOficialPadraoOS = useMemo(() => {
    return gerarLaudoTecnico({
      cliente: clienteAtivo?.nome || '',
      placa: servico.placa,
      marcaModelo: servico.veiculo,
      km: servico.km,
      relatoCliente: servico.relatoCliente,
      mecanicoNome: servico.mecanico,
      pecas: servico.pecas.map((p) => ({
        nome: `${p.nome} (Marca: ${p.marca} • Cód: ${p.codigo})`,
        quantidade: p.quantidade,
        fotoUrl: p.foto,
        observacao: p.motivoSeguranca || p.motivoOpcional,
      })),
      servicos: servico.servicos.map((s) => ({
        nome: s.nome,
        observacao: `Tempo estimado: ${s.tempoHoras || '1h'} • Cód: ${s.codigo}`,
      })),
    })
  }, [servico, clienteAtivo])

  // Copiar Laudo Oficial no Padrão da OS
  const handleCopiarLaudo = () => {
    try {
      navigator.clipboard.writeText(laudoOficialPadraoOS)
      setCopiado(true)
      toast.success('Texto do laudo técnico copiado para a área de transferência!')
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('Não foi possível copiar o laudo.')
    }
  }

  // Alternar marcação de item opcional
  const handleToggleItem = (itemId, tipo) => {
    if (aprovado) {
      toast.info('Este orçamento já foi aprovado e está em execução.')
      return
    }

    if (tipo === 'essencial') {
      toast.warning('Itens essenciais de segurança não podem ser removidos do orçamento.')
      return
    }

    setItensMarcados((prev) => {
      const proximo = new Set(prev)
      if (proximo.has(itemId)) {
        proximo.delete(itemId)
        toast.info('Item complementar removido do seu orçamento.')
      } else {
        proximo.add(itemId)
        toast.success('Item complementar incluído no seu orçamento.')
      }
      return proximo
    })
  }

  // Cálculos financeiros em tempo real
  const totais = useMemo(() => {
    let pecasOriginal = 0
    let servicosOriginal = 0
    let terceirosOriginal = 0

    let pecasAprovado = 0
    let servicosAprovado = 0
    let terceirosAprovado = 0

    servico.pecas.forEach((item) => {
      const valor = item.preco * item.quantidade
      pecasOriginal += valor
      if (itensMarcados.has(item.id)) pecasAprovado += valor
    })

    servico.servicos.forEach((item) => {
      const valor = item.preco * item.quantidade
      servicosOriginal += valor
      if (itensMarcados.has(item.id)) servicosAprovado += valor
    })

    servico.terceiros.forEach((item) => {
      const valor = item.preco * item.quantidade
      terceirosOriginal += valor
      if (itensMarcados.has(item.id)) terceirosAprovado += valor
    })

    const totalOriginal = pecasOriginal + servicosOriginal + terceirosOriginal
    const totalAprovado = pecasAprovado + servicosAprovado + terceirosAprovado
    const economia = totalOriginal - totalAprovado

    const pixDesconto = totalAprovado * 0.95
    const parcelaCartao6x = (totalAprovado / 6).toFixed(2)

    return {
      pecasAprovado,
      servicosAprovado,
      terceirosAprovado,
      totalOriginal,
      totalAprovado,
      economia,
      pixDesconto,
      parcelaCartao6x,
    }
  }, [servico, itensMarcados])

  // Confirmar Aprovação do Orçamento
  const handleConfirmarAprovacao = () => {
    if (!nomeResponsavel.trim()) {
      toast.warning('Por favor, confirme o nome do titular responsável.')
      return
    }

    try {
      localStorage.setItem(`dev_oficina_aprovacao_${servico.numeroOS}`, 'true')
    } catch {}

    setAprovado(true)
    setModalAprovacaoAberto(false)
    toast.success('Orçamento aprovado com sucesso! A oficina já foi notificada para iniciar os serviços.')
  }

  // Link WhatsApp direto com a Consultora
  const linkWhatsApp = useMemo(() => {
    const texto = encodeURIComponent(
      `Olá! Sou ${clienteAtivo?.nome || 'cliente'}, proprietário do ${servico.veiculo} (${servico.placa}). Estou no Portal do Cliente analisando a OS #${servico.numeroOS} e gostaria de tirar uma dúvida.`
    )
    return `${WHATSAPP_ACCESS.href}?text=${texto}`
  }, [clienteAtivo, servico])

  if (!servico.numeroOS) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#e4e7ec] p-8 text-center max-w-sm">
          <CarProfile size={32} className="mx-auto mb-3 text-[#98a2b3]" />
          <p className="text-sm font-bold text-[#101828]">Nenhuma ordem de serviço em andamento</p>
          <p className="text-xs text-[#667085] mt-1">
            Assim que sua oficina abrir uma OS para o seu veículo, o orçamento e o laudo técnico aparecerão aqui.
          </p>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <MobileClienteServicosPage
        servico={servico}
        clienteAtivo={clienteAtivo}
        itensMarcados={itensMarcados}
        aprovado={aprovado}
        totais={totais}
        laudoOficialPadraoOS={laudoOficialPadraoOS}
        linkWhatsApp={linkWhatsApp}
        modalAprovacaoAberto={modalAprovacaoAberto}
        setModalAprovacaoAberto={setModalAprovacaoAberto}
        formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
        nomeResponsavel={nomeResponsavel}
        setNomeResponsavel={setNomeResponsavel}
        onToggleItem={handleToggleItem}
        onCopiarLaudo={handleCopiarLaudo}
        onConfirmarAprovacao={handleConfirmarAprovacao}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden select-none">
      {/* 1. Barra Superior com Identificação da OS e Status */}
      <header className="shrink-0 bg-white border border-[#d0d5dd] rounded-2xl p-4 mb-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#98a2b3] uppercase tracking-wider mb-1">
            <span>Portal do Cliente</span>
            <span>•</span>
            <span>Serviços e Orçamentos</span>
            <span>•</span>
            <span className="text-[#0284c7] font-bold">OS #{servico.numeroOS}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#101828] tracking-tight">
              Aprovação de Orçamento
            </h1>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                aprovado
                  ? 'bg-sky-50 text-[#0284c7] border border-sky-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
              }`}
            >
              {aprovado ? (
                <>
                  <CheckCircle size={14} weight="fill" className="text-[#0284c7]" />
                  <span>Aprovado e Em Execução</span>
                </>
              ) : (
                <>
                  <Clock size={14} weight="bold" className="text-amber-600" />
                  <span>Aguardando sua Aprovação</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ficha Rápida do Veículo e Consultor */}
        <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e4e7ec] rounded-xl px-3.5 py-2 text-xs text-[#475467]">
          <CarProfile size={24} weight="bold" className="text-[#0284c7] shrink-0" />
          <div>
            <span className="font-extrabold text-[#101828] block leading-tight">
              {servico.veiculo} ({servico.placa})
            </span>
            <span className="text-[11px] text-[#667085] block mt-0.5">
              KM: {servico.km} • Consultora: {servico.consultor}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Barra de Navegação de Abas Executiva (3 Abas: Orçamento, Laudo Técnico e Galeria de Fotos) */}
      <div className="shrink-0 bg-white border border-[#d0d5dd] rounded-2xl p-1.5 mb-3 shadow-2xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAbaAtiva('orcamento')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'orcamento'
              ? 'bg-[#101828] text-white shadow-xs'
              : 'text-[#475467] hover:bg-[#f8fafc] hover:text-[#101828]'
          }`}
        >
          <Receipt size={16} weight={abaAtiva === 'orcamento' ? 'bold' : 'regular'} />
          <span>1. Orçamento e Aprovação</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
              abaAtiva === 'orcamento'
                ? 'bg-white/20 text-white'
                : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
            }`}
          >
            {itensMarcados.size} itens
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('laudo')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'laudo'
              ? 'bg-[#101828] text-white shadow-xs'
              : 'text-[#475467] hover:bg-[#f8fafc] hover:text-[#101828]'
          }`}
        >
          <Sparkle size={16} weight="fill" className={abaAtiva === 'laudo' ? 'text-[#38bdf8]' : 'text-zinc-400'} />
          <span>2. Laudo Técnico</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
              abaAtiva === 'laudo'
                ? 'bg-white/20 text-white'
                : 'bg-sky-50 text-[#0284c7] border border-sky-200'
            }`}
          >
            Oficial
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('fotos')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            abaAtiva === 'fotos'
              ? 'bg-[#101828] text-white shadow-xs'
              : 'text-[#475467] hover:bg-[#f8fafc] hover:text-[#101828]'
          }`}
        >
          <Camera size={16} weight={abaAtiva === 'fotos' ? 'bold' : 'regular'} className={abaAtiva === 'fotos' ? 'text-[#38bdf8]' : 'text-zinc-400'} />
          <span>3. Galeria de Fotos</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
              abaAtiva === 'fotos'
                ? 'bg-white/20 text-white'
                : 'bg-sky-50 text-[#0284c7] border border-sky-200'
            }`}
          >
            {servico.pecas.length} fotos
          </span>
        </button>
      </div>

      {/* 3. Área Principal com Duas Colunas (Conteúdo da Aba + Resumo Fixo à Direita) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0 overflow-hidden">
        {/* ========================================================================= */}
        {/* COLUNA DA ESQUERDA: Alterna entre a Aba Orçamento e a Aba Laudo e Fotos  */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1 min-h-0">
          {/* ========================================================= */}
          {/* CASO ABA ATIVA == 'orcamento'                             */}
          {/* ========================================================= */}
          {abaAtiva === 'orcamento' && (
            <>
              {/* BLOCO 1: Peças e Componentes */}
              <section className="bg-white border border-[#d0d5dd] rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e4e7ec] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={18} weight="bold" className="text-[#0284c7]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#101828]">
                      1. Peças e Componentes de Reposição
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-[#667085]">
                    {servico.pecas.length} itens listados
                  </span>
                </div>

                <div className="divide-y divide-[#f2f4f7]">
                  {servico.pecas.map((peca) => {
                    const isSelected = itensMarcados.has(peca.id)
                    const isEssencial = peca.tipo === 'essencial'

                    return (
                      <div
                        key={peca.id}
                        className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isSelected ? 'bg-white' : 'bg-zinc-50/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Caixa de Seleção */}
                          <button
                            type="button"
                            disabled={isEssencial || aprovado}
                            onClick={() => handleToggleItem(peca.id, peca.tipo)}
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isEssencial
                                ? 'bg-zinc-100 text-zinc-600 border border-zinc-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#0284c7] text-white shadow-2xs cursor-pointer'
                                : 'border-2 border-[#d0d5dd] bg-white hover:border-[#0284c7] cursor-pointer'
                            }`}
                            title={
                              isEssencial
                                ? 'Item de segurança obrigatório (não removível)'
                                : isSelected
                                ? 'Clique para remover este item'
                                : 'Clique para incluir este item'
                            }
                          >
                            {isEssencial ? (
                              <Lock size={12} weight="bold" />
                            ) : isSelected ? (
                              <Check size={13} weight="bold" />
                            ) : null}
                          </button>

                          {/* Miniatura da Foto da Peça com Atalho de Zoom */}
                          <button
                            type="button"
                            onClick={() =>
                              setFotoZoom({
                                url: peca.foto,
                                titulo: peca.nome,
                                descricao: peca.fotoLegenda,
                                estadoPeca: peca.estadoPeca,
                                pecaNome: peca.nome,
                              })
                            }
                            className="w-12 h-12 rounded-xl border border-[#d0d5dd] overflow-hidden shrink-0 relative group cursor-pointer bg-[#f8fafc]"
                            title="Clique para ver foto da peça com zoom"
                          >
                            <img
                              src={peca.foto}
                              alt={peca.nome}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <MagnifyingGlassPlus size={16} weight="bold" className="text-white" />
                            </div>
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-bold leading-snug ${
                                  isSelected ? 'text-[#101828]' : 'text-zinc-500 line-through'
                                }`}
                              >
                                {peca.nome}
                              </span>
                              {isEssencial ? (
                                <span className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-[#0284c7] text-[10px] font-bold rounded-full">
                                  Segurança / Essencial
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold rounded-full">
                                  Opcional Recomendado
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#667085] mt-0.5">
                              {isEssencial ? peca.motivoSeguranca : peca.motivoOpcional}
                            </p>

                            <div className="text-[11px] text-[#98a2b3] flex items-center gap-2 mt-1">
                              <span className="font-mono">Cód. {peca.codigo}</span>
                              <span>•</span>
                              <span>Marca: {peca.marca}</span>
                              <span>•</span>
                              <span>Qtd: {peca.quantidade}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-extrabold block ${
                              isSelected ? 'text-[#101828]' : 'text-zinc-400 line-through'
                            }`}
                          >
                            R$ {(peca.preco * peca.quantidade).toFixed(2)}
                          </span>
                          {peca.quantidade > 1 && (
                            <span className="text-[10px] text-[#667085] block mt-0.5">
                              R$ {peca.preco.toFixed(2)} un
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* BLOCO 2: Mão de Obra Técnica */}
              <section className="bg-white border border-[#d0d5dd] rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e4e7ec] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench size={18} weight="bold" className="text-[#0284c7]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#101828]">
                      2. Mão de Obra e Serviços Técnicos
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-[#667085]">
                    {servico.servicos.length} serviços
                  </span>
                </div>

                <div className="divide-y divide-[#f2f4f7]">
                  {servico.servicos.map((serv) => {
                    const isSelected = itensMarcados.has(serv.id)
                    const isEssencial = serv.tipo === 'essencial'

                    return (
                      <div
                        key={serv.id}
                        className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isSelected ? 'bg-white' : 'bg-zinc-50/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            type="button"
                            disabled={isEssencial || aprovado}
                            onClick={() => handleToggleItem(serv.id, serv.tipo)}
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isEssencial
                                ? 'bg-zinc-100 text-zinc-600 border border-zinc-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#0284c7] text-white shadow-2xs cursor-pointer'
                                : 'border-2 border-[#d0d5dd] bg-white hover:border-[#0284c7] cursor-pointer'
                            }`}
                            title={
                              isEssencial
                                ? 'Serviço de segurança obrigatório'
                                : isSelected
                                ? 'Clique para remover este serviço'
                                : 'Clique para incluir este serviço'
                            }
                          >
                            {isEssencial ? (
                              <Lock size={12} weight="bold" />
                            ) : isSelected ? (
                              <Check size={13} weight="bold" />
                            ) : null}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-bold leading-snug ${
                                  isSelected ? 'text-[#101828]' : 'text-zinc-500 line-through'
                                }`}
                              >
                                {serv.nome}
                              </span>
                              {isEssencial ? (
                                <span className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-[#0284c7] text-[10px] font-bold rounded-full">
                                  Segurança / Essencial
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold rounded-full">
                                  Opcional
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#667085] mt-0.5">
                              {isEssencial ? serv.motivoSeguranca : serv.motivoOpcional}
                            </p>

                            <div className="text-[11px] text-[#98a2b3] flex items-center gap-2 mt-1">
                              <span className="font-mono">{serv.codigo}</span>
                              {serv.tempoHoras && (
                                <>
                                  <span>•</span>
                                  <span>Tempo estimado: {serv.tempoHoras}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-extrabold block ${
                              isSelected ? 'text-[#101828]' : 'text-zinc-400 line-through'
                            }`}
                          >
                            R$ {serv.preco.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* BLOCO 3: Serviços Terceirizados */}
              <section className="bg-white border border-[#d0d5dd] rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e4e7ec] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GearSix size={18} weight="bold" className="text-[#0284c7]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#101828]">
                      3. Serviços Terceirizados Especializados
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-[#667085]">
                    {servico.terceiros.length} itens
                  </span>
                </div>

                <div className="divide-y divide-[#f2f4f7]">
                  {servico.terceiros.map((terc) => {
                    const isSelected = itensMarcados.has(terc.id)
                    const isEssencial = terc.tipo === 'essencial'

                    return (
                      <div
                        key={terc.id}
                        className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isSelected ? 'bg-white' : 'bg-zinc-50/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            type="button"
                            disabled={isEssencial || aprovado}
                            onClick={() => handleToggleItem(terc.id, terc.tipo)}
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isEssencial
                                ? 'bg-zinc-100 text-zinc-600 border border-zinc-300 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#0284c7] text-white shadow-2xs cursor-pointer'
                                : 'border-2 border-[#d0d5dd] bg-white hover:border-[#0284c7] cursor-pointer'
                            }`}
                            title={
                              isEssencial
                                ? 'Serviço técnico obrigatório'
                                : isSelected
                                ? 'Clique para remover este serviço'
                                : 'Clique para incluir este serviço'
                            }
                          >
                            {isEssencial ? (
                              <Lock size={12} weight="bold" />
                            ) : isSelected ? (
                              <Check size={13} weight="bold" />
                            ) : null}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-bold leading-snug ${
                                  isSelected ? 'text-[#101828]' : 'text-zinc-500 line-through'
                                }`}
                              >
                                {terc.nome}
                              </span>
                              {isEssencial ? (
                                <span className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-[#0284c7] text-[10px] font-bold rounded-full">
                                  Segurança / Essencial
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold rounded-full">
                                  Opcional
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#667085] mt-0.5">
                              {isEssencial ? terc.motivoSeguranca : terc.motivoOpcional}
                            </p>

                            <div className="text-[11px] text-[#98a2b3] flex items-center gap-2 mt-1">
                              <span className="font-mono">{terc.codigo}</span>
                              <span>•</span>
                              <span>Parceiro Homologado: {terc.parceiro}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-extrabold block ${
                              isSelected ? 'text-[#101828]' : 'text-zinc-400 line-through'
                            }`}
                          >
                            R$ {terc.preco.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </>
          )}

          {/* ========================================================= */}
          {/* CASO ABA ATIVA == 'laudo'                                  */}
          {/* ========================================================= */}
          {abaAtiva === 'laudo' && (
            <>
              {/* 1. LAUDO TÉCNICO OFICIAL NO PADRÃO EXATO DA TELA DE ORDEM DE SERVIÇO */}
              <div className="bg-white border border-[#d0d5dd] rounded-2xl shadow-2xs overflow-hidden">
                {/* Header do Laudo Técnico (Padrão Oficial TabDiagnostico da OS) */}
                <div className="px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <Sparkle size={18} weight="fill" className="text-[#38bdf8]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-extrabold text-[#101828] leading-none">
                          Laudo Técnico de Diagnóstico
                        </h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200 shrink-0">
                          Documento Oficial
                        </span>
                      </div>
                      <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                        Compilação técnica das peças apontadas, evidências fotográficas e serviços a executar
                      </p>
                    </div>
                  </div>

                  {/* Botões de Ação do Topo (Copiar Texto e Imprimir) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopiarLaudo}
                      className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Copiar texto completo do laudo para a área de transferência"
                    >
                      {copiado ? (
                        <>
                          <Check size={14} weight="bold" className="text-[#0284c7]" />
                          <span className="text-[#0284c7]">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} weight="bold" />
                          <span className="hidden sm:inline">Copiar Texto</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-xs font-bold text-[#101828] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Imprimir laudo técnico oficial"
                    >
                      <Printer size={14} weight="bold" />
                      <span className="hidden sm:inline">Imprimir</span>
                    </button>
                  </div>
                </div>

                {/* Corpo do Laudo: Painel Lateral com Contexto da OS e Painel com Texto Oficial */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-4 sm:p-5 bg-[#f8fafc]">
                  {/* Painel Lateral (5 de 12 colunas): Contexto Técnico da OS */}
                  <div className="lg:col-span-5 flex flex-col gap-3">
                    {/* Card 1: Dados da Ordem de Serviço */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs flex flex-col gap-2">
                      <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                          Dados da Ordem de Serviço
                        </span>
                        {servico.placa ? (
                          <div className="flex flex-col items-center bg-white border border-[#101828] rounded-md px-2 py-0.5 shadow-2xs">
                            <span className="text-[6.5px] font-black uppercase tracking-widest text-[#101828] leading-none">
                              BRASIL
                            </span>
                            <span className="font-mono font-black text-[11px] text-[#101828] tracking-wider leading-none mt-0.5">
                              {servico.placa}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-bold">Sem placa</span>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                            Veículo:
                          </span>
                          <span className="font-bold text-[#101828]">
                            {servico.veiculo}
                          </span>
                          <span className="text-[11px] text-[#475467] block">
                            Ano {servico.ano} • KM: {servico.km} km
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-[#f2f4f7]">
                          <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                            Cliente / Titular:
                          </span>
                          <span className="font-bold text-[#101828]">
                            {clienteAtivo?.nome || '—'}
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-[#f2f4f7]">
                          <span className="text-[9.5px] font-bold uppercase text-[#667085] block">
                            Mecânico Responsável:
                          </span>
                          <span className="font-bold text-[#101828]">
                            {servico.mecanico}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Queixa Inicial Relatada pelo Cliente */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667085] block">
                        Queixa Inicial Registrada pelo Cliente:
                      </span>
                      <p className="text-xs text-[#344054] italic leading-relaxed bg-[#f8fafc] p-2.5 rounded-xl border border-[#e4e7ec]">
                        "{servico.relatoCliente}"
                      </p>
                    </div>

                    {/* Card 3: Serviços a Executar */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#d0d5dd] shadow-xs flex flex-col gap-2">
                      <div className="flex items-center justify-between pb-2 border-b border-[#f2f4f7]">
                        <div className="flex items-center gap-1.5">
                          <Wrench size={15} weight="bold" className="text-[#101828]" />
                          <span className="text-xs font-bold text-[#101828]">
                            Serviços Solicitados
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8fafc] text-[#344054] border border-[#d0d5dd]">
                          {servico.servicos.length} itens
                        </span>
                      </div>

                      <ul className="space-y-1.5 text-xs">
                        {servico.servicos.map((s, idx) => (
                          <li
                            key={s.id}
                            className="flex items-start gap-2 p-1.5 rounded-lg bg-[#f8fafc] border border-[#e4e7ec]"
                          >
                            <span className="w-5 h-5 rounded-md bg-white border border-[#d0d5dd] text-[#101828] font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-[#101828] block leading-tight">
                                {s.nome}
                              </span>
                              <span className="text-[10.5px] text-[#667085] block mt-0.5">
                                Tempo: {s.tempoHoras} • Cód. {s.codigo}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Painel Principal (7 de 12 colunas): Texto Oficial do Laudo Técnico */}
                  <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-[#d0d5dd] shadow-xs p-4 sm:p-5 overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f4f7] shrink-0 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText size={18} weight="bold" className="text-[#101828]" />
                        <div>
                          <span className="text-xs sm:text-sm font-extrabold text-[#101828] block leading-none">
                            Texto Oficial do Laudo Técnico
                          </span>
                          <span className="text-[11px] text-[#667085] hidden sm:block mt-0.5">
                            Formato homologado de inspeção e conformidade da oficina
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-[#667085] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#e4e7ec]">
                        {laudoOficialPadraoOS.length} caracteres
                      </span>
                    </div>

                    {/* Exibição Oficial do Texto do Laudo */}
                    <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-xs sm:text-[12.5px] text-[#101828] whitespace-pre-wrap leading-relaxed overflow-y-auto no-scrollbar max-h-[460px]">
                      {laudoOficialPadraoOS}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* CASO ABA ATIVA == 'fotos'                                  */}
          {/* ========================================================= */}
          {abaAtiva === 'fotos' && (
            <>
              {/* Galeria de Peças com Evidências Fotográficas Reais */}
              <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e4e7ec]">
                  <div className="flex items-center gap-2">
                    <Camera size={18} weight="bold" className="text-[#0284c7]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#101828]">
                      Galeria Fotográfica das Peças Diagnosticadas ({servico.pecas.length} Peças)
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#667085] font-semibold">
                    Clique na foto para ampliar
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {servico.pecas.map((peca) => {
                    const isSelected = itensMarcados.has(peca.id)
                    const isEssencial = peca.tipo === 'essencial'

                    return (
                      <div
                        key={peca.id}
                        className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#d0d5dd] bg-white shadow-2xs'
                            : 'border-dashed border-zinc-300 bg-zinc-50/70 opacity-70'
                        }`}
                      >
                        {/* Imagem em Destaque da Peça */}
                        <div
                          onClick={() =>
                            setFotoZoom({
                              url: peca.foto,
                              titulo: peca.nome,
                              descricao: peca.fotoLegenda,
                              estadoPeca: peca.estadoPeca,
                              pecaNome: peca.nome,
                            })
                          }
                          className="w-full h-40 bg-[#f8fafc] border-b border-[#e4e7ec] relative group cursor-pointer overflow-hidden"
                        >
                          <img
                            src={peca.foto}
                            alt={peca.nome}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                            <MagnifyingGlassPlus size={24} weight="bold" />
                            <span className="text-xs font-bold mt-1">Clique para Ampliar Foto</span>
                          </div>
                          <div className="absolute top-2.5 left-2.5">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full backdrop-blur-xs ${
                                isEssencial
                                  ? 'bg-[#101828]/90 text-white'
                                  : 'bg-white/90 text-[#101828] border border-[#d0d5dd]'
                              }`}
                            >
                              {peca.estadoPeca}
                            </span>
                          </div>
                          <div className="absolute bottom-2.5 right-2.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-black/75 text-white">
                              Cód. {peca.codigo}
                            </span>
                          </div>
                        </div>

                        {/* Informações Periciais da Peça */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 text-xs">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-[#101828] text-sm leading-tight">
                                {peca.nome}
                              </h4>
                              <span className="font-extrabold text-[#101828] shrink-0">
                                R$ {(peca.preco * peca.quantidade).toFixed(2)}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#667085] block mt-0.5">
                              Fabricante: {peca.marca} • Quantidade: {peca.quantidade} un
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] text-[11px] text-[#475467] leading-relaxed">
                            <span className="font-bold text-[#101828] block mb-0.5">
                              Constatação no Diagnóstico:
                            </span>
                            <span>{peca.fotoLegenda}</span>
                          </div>

                          {/* Ação e Status do Item no Orçamento */}
                          <div className="pt-2 border-t border-[#f2f4f7] flex items-center justify-between gap-2">
                            {isEssencial ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0284c7]">
                                <Lock size={12} weight="bold" />
                                <span>Item Obrigatório de Segurança</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={aprovado}
                                onClick={() => handleToggleItem(peca.id, peca.tipo)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                                    : 'bg-sky-50 border-sky-200 text-[#0284c7] hover:bg-sky-100'
                                }`}
                              >
                                {isSelected ? 'Dispensar este item' : 'Incluir no orçamento'}
                              </button>
                            )}

                            <span
                              className={`text-[11px] font-extrabold ${
                                isSelected ? 'text-[#101828]' : 'text-zinc-400 line-through'
                              }`}
                            >
                              {isSelected ? 'Incluído' : 'Dispensado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* COLUNA DA DIREITA: Resumo Financeiro Dinâmico, Pagamento e Ação          */}
        {/* Permanece visível e interativo em todas as 3 abas (Orçamento, Laudo e Fotos) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-88 xl:w-96 shrink-0 flex flex-col space-y-3">
          {/* Card Principal de Valores e Totais Recalculados */}
          <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4e7ec]">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#101828]">
                Resumo do Orçamento
              </span>
              <span className="text-[11px] font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                {itensMarcados.size} itens ativos
              </span>
            </div>

            {/* Linhas de Valores por Grupo */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#475467]">
                <span>Peças e Componentes:</span>
                <span className="font-bold text-[#101828]">
                  R$ {totais.pecasAprovado.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#475467]">
                <span>Mão de Obra Especializada:</span>
                <span className="font-bold text-[#101828]">
                  R$ {totais.servicosAprovado.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#475467]">
                <span>Serviços Terceirizados:</span>
                <span className="font-bold text-[#101828]">
                  R$ {totais.terceirosAprovado.toFixed(2)}
                </span>
              </div>

              {/* Economia gerada caso tenha desmarcado opcionais */}
              {totais.economia > 0 && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50 border border-sky-200 text-[#0284c7] text-[11px] font-bold">
                  <span>Itens dispensados (Economia):</span>
                  <span>- R$ {totais.economia.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total Geral com Destaque */}
            <div className="p-4 bg-[#101828] text-white rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>TOTAL APROVADO</span>
                {totais.economia > 0 && (
                  <span className="line-through text-zinc-500">
                    R$ {totais.totalOriginal.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-[#38bdf8] mt-1 tracking-tight">
                R$ {totais.totalAprovado.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-300 block mt-0.5">
                Peças originais com nota e garantia técnica
              </span>
            </div>

            {/* Facilidades de Pagamento */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                Condições de Pagamento:
              </span>

              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#101828] block">À Vista no PIX</span>
                  <span className="text-[10px] text-[#0284c7] font-bold">5% de desconto imediato</span>
                </div>
                <span className="font-extrabold text-[#101828]">
                  R$ {totais.pixDesconto.toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e4e7ec] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#101828] block">Cartão de Crédito</span>
                  <span className="text-[10px] text-[#667085] font-semibold">Até 6x sem juros</span>
                </div>
                <span className="font-extrabold text-[#101828]">
                  6x de R$ {totais.parcelaCartao6x}
                </span>
              </div>
            </div>

            {/* Botão de Ação: Aprovar ou Indicador de Sucesso */}
            {aprovado ? (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284c7]">
                  <CheckCircle size={16} weight="fill" />
                  <span>Orçamento Aprovado pelo Cliente</span>
                </div>
                <p className="text-[11px] text-sky-900">
                  A equipe da oficina já está providenciando as peças e a execução do serviço.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setModalAprovacaoAberto(true)}
                className="w-full h-12 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <Check size={18} weight="bold" />
                <span>Aprovar Orçamento Agora</span>
              </button>
            )}
          </div>

          {/* Dúvidas com a Consultora via WhatsApp */}
          <div className="bg-white border border-[#d0d5dd] rounded-2xl p-4 shadow-2xs text-center space-y-2.5">
            <span className="text-xs font-bold text-[#101828] block">
              Dúvidas sobre o diagnóstico ou itens?
            </span>
            <p className="text-[11px] text-[#667085] leading-snug">
              Fale agora com a consultora <strong className="text-[#101828]">{servico.consultor}</strong> para esclarecer qualquer detalhe da ordem de serviço.
            </p>
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 bg-white hover:bg-emerald-50/50 border border-emerald-300 text-emerald-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <WhatsappLogo size={18} weight="bold" className="text-emerald-600" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE APROVAÇÃO DO ORÇAMENTO                            */}
      {/* ========================================================================= */}
      {modalAprovacaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#d0d5dd] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabeçalho do Modal */}
            <div className="px-5 py-4 bg-[#f8fafc] border-b border-[#e4e7ec] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7]">
                  <CheckCircle size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#101828]">
                    Confirmar e Autorizar Execução
                  </h3>
                  <span className="text-[11px] text-[#667085]">
                    Ordem de Serviço #{servico.numeroOS} • {servico.veiculo}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAprovacaoAberto(false)}
                className="p-1.5 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#e4e7ec] cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-5 overflow-y-auto no-scrollbar space-y-4 text-xs">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                <span className="font-extrabold text-xs text-[#0284c7] block">
                  Resumo dos Itens Selecionados pelo Cliente:
                </span>
                <p className="text-[11px] text-sky-900 leading-snug">
                  Você está aprovando <strong>{itensMarcados.size} itens</strong>. Os itens opcionais desmarcados foram excluídos da execução e da cobrança.
                </p>
              </div>

              {/* Total Final do Modal */}
              <div className="p-3 rounded-xl bg-[#101828] text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 block">Total a ser faturado:</span>
                  <span className="text-xl font-black text-[#38bdf8]">
                    R$ {totais.totalAprovado.toFixed(2)}
                  </span>
                </div>
                {totais.economia > 0 && (
                  <span className="text-right text-[11px] text-zinc-300">
                    Economia: - R$ {totais.economia.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Opção de Pagamento Prevista */}
              <div>
                <label className="text-[11px] font-bold text-[#344054] block mb-1.5">
                  Previsão de Pagamento na Retirada do Veículo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormaPagamento('pix')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formaPagamento === 'pix'
                        ? 'border-[#0284c7] bg-sky-50 text-[#0284c7] font-bold'
                        : 'border-[#d0d5dd] hover:bg-[#f8fafc] text-[#475467]'
                    }`}
                  >
                    <span className="block font-bold">PIX à Vista</span>
                    <span className="text-[10px] block mt-0.5 text-[#0284c7] font-semibold">
                      5% desc. (R$ {totais.pixDesconto.toFixed(2)})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormaPagamento('cartao')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formaPagamento === 'cartao'
                        ? 'border-[#0284c7] bg-sky-50 text-[#0284c7] font-bold'
                        : 'border-[#d0d5dd] hover:bg-[#f8fafc] text-[#475467]'
                    }`}
                  >
                    <span className="block font-bold">Cartão de Crédito</span>
                    <span className="text-[10px] block mt-0.5 text-[#667085] font-semibold">
                      Até 6x de R$ {totais.parcelaCartao6x}
                    </span>
                  </button>
                </div>
              </div>

              {/* Titular Responsável */}
              <div>
                <label className="text-[11px] font-bold text-[#344054] block mb-1">
                  Nome do Titular para Autorização Digital:
                </label>
                <input
                  type="text"
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#d0d5dd] bg-white text-xs font-semibold text-[#101828] focus:outline-hidden focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20"
                  placeholder="Nome completo do proprietário"
                />
              </div>

              <p className="text-[11px] text-[#667085] leading-relaxed">
                Ao clicar em autorizar, a equipe da oficina Mecânica Gabriel iniciará a requisição de peças e os reparos mecânicos.
              </p>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-5 py-3.5 bg-[#f8fafc] border-t border-[#e4e7ec] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setModalAprovacaoAberto(false)}
                className="px-4 py-2 bg-white border border-[#d0d5dd] text-[#344054] font-bold rounded-xl hover:bg-[#f2f4f7] cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmarAprovacao}
                className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check size={16} weight="bold" />
                <span>Confirmar e Autorizar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE ZOOM DE FOTO DA PEÇA / DIAGNÓSTICO                               */}
      {/* ========================================================================= */}
      {fotoZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-3 bg-[#f8fafc] border-b border-[#e4e7ec] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={16} weight="bold" className="text-[#0284c7]" />
                <span className="font-extrabold text-xs text-[#101828]">{fotoZoom.titulo}</span>
              </div>
              <button
                type="button"
                onClick={() => setFotoZoom(null)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#e4e7ec] cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <div className="p-3 flex justify-center bg-black/95">
              <img
                src={fotoZoom.url}
                alt={fotoZoom.titulo}
                className="max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-4 bg-white text-xs text-[#475467] leading-relaxed space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#101828]">Evidência Fotográfica do Diagnóstico:</span>
                {fotoZoom.estadoPeca && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[#0284c7] text-[10px] font-bold">
                    {fotoZoom.estadoPeca}
                  </span>
                )}
              </div>
              <p className="text-[#475467]">{fotoZoom.descricao}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
