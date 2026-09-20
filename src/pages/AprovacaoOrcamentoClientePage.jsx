import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle,
  Receipt,
  FileText,
  Camera,
  WhatsappLogo,
  Car,
  Clock,
  ShieldCheck,
  CreditCard,
  CurrencyDollar,
  Eye,
  X,
  Printer,
  Copy,
  Check,
  WarningCircle,
  ArrowSquareOut,
  PhoneCall,
  Buildings,
} from '@phosphor-icons/react'
import { FolhaOrdemServicoImpressao } from '../components/dashboard/FolhaOrdemServicoImpressao'
import { toast } from 'sonner'
import { obterOrdensAbertas, obterOrdensFinalizadas, atualizarStatusOrdem } from './dashboard/orcamento/mockOrdensAbertas'

export function AprovacaoOrcamentoClientePage() {
  const { id } = useParams()
  const numeroOS = id || '002908'

  // Aba ativa na tela do cliente
  const [activeTab, setActiveTab] = useState('orcamento') // 'orcamento', 'laudo', 'fotos'

  // Modais
  const [modalAprovacaoAberto, setModalAprovacaoAberto] = useState(false)
  const [modalFolhaImpressaoAberta, setModalFolhaImpressaoAberta] = useState(false)
  const [fotoZoomUrl, setFotoZoomUrl] = useState(null)

  // Estado do formulario de aprovacao
  const [nomeResponsavelAprovacao, setNomeResponsavelAprovacao] = useState('')
  const [formaPagamentoEscolhida, setFormaPagamentoEscolhida] = useState('pix')
  const [estaAprovado, setEstaAprovado] = useState(false)
  const [dataHoraAprovacao, setDataHoraAprovacao] = useState(null)

  // Carrega dados salvos da OS do localStorage
  const [dadosOS, setDadosOS] = useState(() => {
    try {
      // Prioridade 1: a OS real do sistema da oficina (abertas ou já finalizadas)
      const ordemReal =
        obterOrdensAbertas().find((o) => String(o.numeroOS) === String(numeroOS)) ||
        obterOrdensFinalizadas().find((o) => String(o.numeroOS) === String(numeroOS))
      if (ordemReal) return ordemReal

      // Tenta carregar dados da OS salva ou do rascunho
      const orcamentosRaw = localStorage.getItem('dev_oficina_orcamentos')
      if (orcamentosRaw) {
        const orcamentos = JSON.parse(orcamentosRaw)
        if (orcamentos[numeroOS]) return orcamentos[numeroOS]
      }

      const draftRaw = localStorage.getItem('dev_oficina_draft_os')
      if (draftRaw) {
        const draft = JSON.parse(draftRaw)
        if (draft.cliente || draft.pecasOS?.length || draft.servicosOS?.length) {
          return {
            ...draft,
            numeroOS,
          }
        }
      }
    } catch (e) {
      console.error('Erro ao ler dados da OS para aprovacao:', e)
    }

    // Dados padrao demonstrativos com base na Ordem Servico.jpg de referencia
    return {
      numeroOS: '002908',
      dataEmissao: '19/08/26',
      horaEmissao: '13:05',
      consultorResponsavel: 'Bianca Amaral',
      cliente: 'EDGAR AMARAL DA SILVEIRA',
      codigoCliente: '0000161',
      documento: '033.687.739-09',
      endereco: 'R TUPINAMBA, 566',
      cidade: 'APUCARANA',
      uf: 'PR',
      cep: '86812-405',
      telefone: '(43) 98812-6874',
      email: 'edgar.silveira@email.com',
      placa: 'ASF6I46',
      marca: 'FIAT',
      modelo: 'DOBLO 1.8 CARGO',
      marcaModelo: 'Fiat Doblo 1.8 Cargo',
      ano: '2009/2010',
      cor: 'Branca',
      combustivel: 'FLEX',
      km: '280.812',
      kmAnterior: '279.003',
      relatoCliente: 'Barulho na frente ao passar em desníveis e vazamento de água pelo arrefecimento com aquecimento rápido.',
      mecanicoNome: 'Carlos Eduardo',
      laudoTecnico: `LAUDO TÉCNICO DE DIAGNÓSTICO MECÂNICO
Data da Inspeção: 19/08/2026 às 13:05
Oficina: Mecânica Gabriel - Apucarana / PR
Veículo: Fiat Doblo 1.8 Cargo | Placa: ASF6I46 | KM: 280.812 km

1. DIAGNÓSTICO DO SISTEMA DE ARREFECIMENTO:
Identificada corrosão com rompimento por fadiga térmica no tubo de água do coletor de admissão, ocasionando perda contínua de fluido de arrefecimento e risco iminente de superaquecimento do motor.

2. PEÇAS COM TROCA OBRIGATÓRIA:
- Anel vedador da admissão com perda total de elasticidade.
- Tubo suporte de arrefecimento metálico corroído.
- Abraçadeiras metálicas 14x22 com folga.
- Aditivo de arrefecimento A05 orgânico para proteção contra nova cavitação.

3. PARECER TÉCNICO:
A substituição imediata dos componentes evita queima da junta do cabeçote e travamento do motor.`,
      pecasOS: [
        {
          codigo: '10039B',
          nome: 'ANEL VEDADOR DA ADM',
          unidade: 'UN',
          quantidade: 4,
          precoUnitario: 15.0,
          desconto: 0,
          fotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600',
          observacaoFoto: 'Anel ressecado e quebrado, provocando entrada de ar falso e vazamento.',
        },
        {
          codigo: '0018969',
          nome: 'TUBO SUPORTE ARREFECIMENTO',
          unidade: 'PC',
          quantidade: 1,
          precoUnitario: 200.0,
          desconto: 0,
          fotoUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600',
          observacaoFoto: 'Ponto crítico de ferrugem e trinca no bocal inferior.',
        },
        {
          codigo: '2682',
          nome: 'ABRACADEIRA 14X22',
          unidade: 'UN',
          quantidade: 2,
          precoUnitario: 10.0,
          desconto: 0,
          fotoUrl: null,
          observacaoFoto: '',
        },
        {
          codigo: '010804',
          nome: 'ADITIVO A05 PRONTO USO',
          unidade: 'LT',
          quantidade: 1,
          precoUnitario: 40.0,
          desconto: 0,
          fotoUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600',
          observacaoFoto: 'Fluido antigo completamente degradado e com sedimentos de ferrugem.',
        },
        {
          codigo: 'DIVERSAS',
          nome: 'PEÇAS - PARAFUSO C/ PORCA E ARRUELA',
          unidade: 'PC',
          quantidade: 1,
          precoUnitario: 10.0,
          desconto: 0,
          fotoUrl: null,
          observacaoFoto: '',
        },
      ],
      servicosOS: [
        {
          codigo: '01845',
          nome: 'TROCA TUBO DE AGUA DO COLETOR DE ADM',
          unidade: 'mo',
          quantidade: 1,
          valorUnitario: 300.0,
          desconto: 0,
          tempoEstimado: '2.5',
          categoria: 'Arrefecimento',
          observacoes: 'Desmontagem de coletores, limpeza química da face e torqueamento conforme manual.',
        },
      ],
      terceirosOS: [],
      descontoGeralOS: 0,
    }
  })

  // Sincroniza estado de aprovacao salvo
  useEffect(() => {
    try {
      const aprovacoesRaw = localStorage.getItem('dev_oficina_aprovacoes')
      if (aprovacoesRaw) {
        const aprovacoes = JSON.parse(aprovacoesRaw)
        if (aprovacoes[numeroOS]) {
          setEstaAprovado(true)
          setDataHoraAprovacao(aprovacoes[numeroOS].dataHora)
          setNomeResponsavelAprovacao(aprovacoes[numeroOS].responsavel || '')
          setFormaPagamentoEscolhida(aprovacoes[numeroOS].formaPagamento || 'pix')
        }
      }
    } catch (e) {
      console.error('Erro ao verificar status de aprovacao:', e)
    }
  }, [numeroOS])

  // Calculos financeiros
  const totais = useMemo(() => {
    let totalPecas = 0
    let descPecas = 0
    ;(dadosOS.pecasOS || []).forEach((p) => {
      const qtd = parseFloat(p.quantidade) || 1
      const pr = parseFloat(p.precoUnitario) || 0
      const desc = parseFloat(p.desconto) || 0
      totalPecas += pr * qtd
      descPecas += desc
    })
    const subTotalPecas = Math.max(0, totalPecas - descPecas)

    let totalServicos = 0
    let descServicos = 0
    ;(dadosOS.servicosOS || []).forEach((s) => {
      const qtd = parseFloat(s.quantidade) || 1
      const pr = parseFloat(s.valorUnitario ?? s.precoUnitario) || 0
      const desc = parseFloat(s.desconto) || 0
      totalServicos += pr * qtd
      descServicos += desc
    })
    const subTotalServicos = Math.max(0, totalServicos - descServicos)

    let totalTerceiros = 0
    let descTerceiros = 0
    ;(dadosOS.terceirosOS || []).forEach((t) => {
      const pr = parseFloat(t.valorVenda) || 0
      const desc = parseFloat(t.desconto) || 0
      totalTerceiros += pr
      descTerceiros += desc
    })
    const subTotalTerceiros = Math.max(0, totalTerceiros - descTerceiros)

    const descGeral = parseFloat(dadosOS.descontoGeralOS) || 0
    const totalGeral = Math.max(0, subTotalPecas + subTotalServicos + subTotalTerceiros - descGeral)

    const valorPixComDesconto = totalGeral * 0.95
    const valorParcelado10x = (totalGeral / 10).toFixed(2)

    return {
      subTotalPecas,
      subTotalServicos,
      subTotalTerceiros,
      descGeral,
      totalGeral,
      valorPixComDesconto,
      valorParcelado10x,
    }
  }, [dadosOS])

  // Coleta todas as pecas e itens que possuem fotos anexadas (orçamento e diagnóstico técnico)
  const fotosDasPecas = useMemo(() => {
    const lista = []
    ;(dadosOS.pecasDiagnostico || []).forEach((p) => {
      if (p.fotoUrl) {
        lista.push({
          id: p.id || p.nome,
          nome: p.nome,
          fotoUrl: p.fotoUrl,
          observacao: p.observacao || 'Registro fotográfico feito durante o diagnóstico técnico.',
        })
      }
    })

    ;(dadosOS.pecasOS || []).forEach((p) => {
      if (p.fotoUrl) {
        lista.push({
          id: p.codigo || p.id,
          nome: p.nome,
          fotoUrl: p.fotoUrl,
          observacao: p.observacaoFoto || p.observacoes || 'Registro de avaria e desgaste físico.',
        })
      }
    })

    ;(dadosOS.terceirosOS || []).forEach((t) => {
      if (t.fotoUrl) {
        lista.push({
          id: t.codigo || t.id,
          nome: t.nome,
          fotoUrl: t.fotoUrl,
          observacao: t.observacoes || 'Necessidade de intervenção e reparo externo.',
        })
      }
    })

    return lista
  }, [dadosOS])

  // Confirmar aprovacao do cliente
  const handleConfirmarAprovacao = (e) => {
    e?.preventDefault()

    const nomeFinal = nomeResponsavelAprovacao.trim() || dadosOS.cliente || 'Cliente Titular'
    const agora = new Date()
    const dataHoraStr = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

    const registro = {
      numeroOS,
      responsavel: nomeFinal,
      formaPagamento: formaPagamentoEscolhida,
      dataHora: dataHoraStr,
      totalAprovado: totais.totalGeral,
    }

    try {
      const salvas = localStorage.getItem('dev_oficina_aprovacoes')
      const parsed = salvas ? JSON.parse(salvas) : {}
      parsed[numeroOS] = registro
      localStorage.setItem('dev_oficina_aprovacoes', JSON.stringify(parsed))
    } catch (err) {
      console.error('Erro ao gravar aprovacao:', err)
    }

    // Reflete a aprovação na OS real da oficina, para que ela avance sozinha no Kanban/lista
    // sem depender de um aviso manual do cliente por WhatsApp.
    if (dadosOS.status === 'aguardando_aprovacao') {
      atualizarStatusOrdem(numeroOS, 'aprovado_execucao')
    }

    setEstaAprovado(true)
    setDataHoraAprovacao(dataHoraStr)
    setModalAprovacaoAberto(false)

    toast.success('Orçamento aprovado com sucesso! A oficina já foi notificada.')
  }

  // Notificar aprovacao diretamente no WhatsApp da oficina
  const handleEnviarConfirmacaoWhatsApp = () => {
    const nomeFinal = nomeResponsavelAprovacao || dadosOS.cliente || 'Cliente Titular'
    const veiculo = `${dadosOS.marcaModelo || 'Veículo'} (Placa ${dadosOS.placa || 'Sem placa'})`
    const msg = `Olá, equipe da *Mecânica Gabriel*! 👋%0A%0AConfirmo a *APROVAÇÃO DO ORÇAMENTO*:%0A📄 *Orçamento:* #${numeroOS}%0A🚗 *Veículo:* ${veiculo}%0A👤 *Autorizado por:* ${nomeFinal}%0A💰 *Valor Total:* R$ ${totais.totalGeral.toFixed(2)}%0A💳 *Condição:* ${
      formaPagamentoEscolhida === 'pix' ? 'À vista no PIX (com 5% de desconto)' : 'Cartão de Crédito'
    }%0A%0APodem iniciar os serviços conforme o orçamento aprovado! 👍`

    const zapUrl = `https://wa.me/5543998544106?text=${msg}`
    window.open(zapUrl, '_blank')
  }

  // Abrir WhatsApp para tirar duvidas
  const handleTirarDuvidasWhatsApp = () => {
    const veiculo = `${dadosOS.marcaModelo || 'Veículo'} (Placa ${dadosOS.placa || 'Sem placa'})`
    const msg = `Olá, equipe da *Mecânica Gabriel*! 👋%0A%0AEstou analisando o *Orçamento #${numeroOS}* do meu veículo *${veiculo}* e gostaria de tirar algumas dúvidas antes da aprovação.`
    const zapUrl = `https://wa.me/5543998544106?text=${msg}`
    window.open(zapUrl, '_blank')
  }

  // Fechar aba e retornar ao sistema principal (Regra 15 - Suporte a Fullscreen)
  const handleFecharAba = () => {
    if (window.self !== window.top) {
      try {
        window.parent.postMessage({ tipo: 'FECHAR_MODAL_PREVIEW' }, '*')
      } catch {}
      return
    }

    window.close()
    setTimeout(() => {
      if (!window.closed) {
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = '/gestao/ordem-de-servico'
        }
      }
    }, 150)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#101828] flex flex-col pb-24 select-none">
      {/* 1. TOPO DA APLICAÇÃO (CLIENT PORTAL HEADER) */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#d0d5dd] shadow-xs px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/favicon-96x96.png"
              alt="Mecânica Gabriel"
              className="w-9 h-9 object-contain rounded-xl border border-[#e4e7ec] shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm font-black text-[#101828] leading-tight truncate">
                Mecânica Gabriel
              </h1>
              <span className="text-[10px] font-semibold text-[#667085] block truncate">
                Orçamento e Aprovação Digital • OS #{numeroOS}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Contato Direto com Consultor */}
            <button
              type="button"
              onClick={handleTirarDuvidasWhatsApp}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <WhatsappLogo size={15} weight="fill" />
              <span className="hidden sm:inline">Dúvidas? Fale Conosco</span>
            </button>

            {/* Visualizar Folha Oficial */}
            <button
              type="button"
              onClick={() => setModalFolhaImpressaoAberta(true)}
              className="h-8 px-2.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Visualizar documento oficial para impressão"
            >
              <Printer size={14} weight="bold" />
              <span className="hidden md:inline">Folha Oficial</span>
            </button>

            {/* Botão Fechar Aba e Voltar ao Sistema (Regra 15 - Suporte a Fullscreen) */}
            <button
              type="button"
              onClick={handleFecharAba}
              className="h-8 px-3 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Fechar esta aba e voltar para a tela do sistema"
            >
              <X size={14} weight="bold" />
              <span>Fechar Aba</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BANNER DO VEÍCULO E STATUS DE APROVAÇÃO */}
      <div className="bg-[#101828] text-white px-4 py-3.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#38bdf8] shrink-0">
              <Car size={20} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold bg-[#0284c7] text-white px-2 py-0.5 rounded-md">
                  {dadosOS.placa || 'SEM PLACA'}
                </span>
                <span className="text-sm font-bold truncate">
                  {dadosOS.marcaModelo || 'Veículo em Atendimento'}
                </span>
              </div>
              <div className="text-[11px] text-white/70 mt-0.5">
                {dadosOS.ano || '2009/2010'} • {dadosOS.cor || 'Branca'} • {dadosOS.km ? `${dadosOS.km} km` : 'KM N/D'}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            {estaAprovado ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0284c7] text-white text-xs font-bold shadow-xs">
                <CheckCircle size={15} weight="fill" />
                <span>Aprovado em {dataHoraAprovacao}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold animate-pulse">
                <Clock size={15} weight="bold" />
                <span>Aguardando sua autorização</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. NAVEGAÇÃO POR ABAS (RESPONSIVO E TOUCH-FRIENDLY) */}
      <div className="bg-white border-b border-[#d0d5dd] sticky top-[57px] z-20 shadow-xs px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 overflow-x-auto py-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('orcamento')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'orcamento'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7]'
            }`}
          >
            <Receipt size={16} weight="bold" />
            <span>Orçamento</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('laudo')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'laudo'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7]'
            }`}
          >
            <FileText size={16} weight="bold" />
            <span>Laudo Técnico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fotos')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'fotos'
                ? 'bg-[#101828] text-white shadow-xs'
                : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7]'
            }`}
          >
            <Camera size={16} weight="bold" />
            <span>Peças com Fotos</span>
            {fotosDasPecas.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#0284c7] text-white">
                {fotosDasPecas.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4. CONTEÚDO PRINCIPAL DA ABA SELECIONADA */}
      <main className="max-w-4xl mx-auto w-full p-4 space-y-4 flex-1">
        {/* ========================================================================= */}
        {/* ABA 1: ORÇAMENTO COMPLETO */}
        {/* ========================================================================= */}
        {activeTab === 'orcamento' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Cards de Resumo Financeiro */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs">
                <span className="text-[10px] font-bold text-[#667085] uppercase block">
                  Peças e Materiais
                </span>
                <span className="text-base font-extrabold text-[#101828] mt-0.5 block">
                  R$ {totais.subTotalPecas.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs">
                <span className="text-[10px] font-bold text-[#667085] uppercase block">
                  Mão de Obra
                </span>
                <span className="text-base font-extrabold text-[#101828] mt-0.5 block">
                  R$ {totais.subTotalServicos.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs">
                <span className="text-[10px] font-bold text-[#667085] uppercase block">
                  Serviços de Terceiros
                </span>
                <span className="text-base font-extrabold text-[#101828] mt-0.5 block">
                  R$ {totais.subTotalTerceiros.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-[#101828] text-white rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-white/70 uppercase block">
                  Total da Ordem
                </span>
                <span className="text-base font-black text-[#38bdf8] mt-0.5 block">
                  R$ {totais.totalGeral.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Condições e Facilidades de Pagamento */}
            <div className="p-4 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <CreditCard size={18} weight="bold" className="text-[#0284c7]" />
                <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
                  Condições de Pagamento Disponíveis
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#101828] block">
                      À Vista no PIX ou Dinheiro
                    </span>
                    <span className="text-[11px] text-[#0284c7] font-semibold block">
                      5% de desconto promocional
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-[#101828]">
                    R$ {totais.valorPixComDesconto.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#101828] block">
                      Cartão de Crédito
                    </span>
                    <span className="text-[11px] text-[#667085] block">
                      Em até 10x sem juros
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-[#101828]">
                    10x de R$ {totais.valorParcelado10x}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalhamento das Peças */}
            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#d0d5dd] flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
                  Peças e Componentes de Reposição
                </span>
                <span className="text-[11px] font-bold text-[#667085]">
                  {(dadosOS.pecasOS || []).length} itens
                </span>
              </div>

              <div className="divide-y divide-[#eaecf0]">
                {(dadosOS.pecasOS || []).map((peca, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#fcfcfd]">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#101828] line-clamp-1">
                        {peca.nome}
                      </div>
                      <div className="text-[11px] text-[#667085] flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-semibold">{peca.codigo || `PEC-${idx + 1}`}</span>
                        <span>•</span>
                        <span>Qtd: {peca.quantidade || 1}</span>
                        <span>•</span>
                        <span>Unit: R$ {parseFloat(peca.precoUnitario || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#101828]">
                        R$ {(
                          (parseFloat(peca.precoUnitario) || 0) * (parseFloat(peca.quantidade) || 1) -
                          (parseFloat(peca.desconto) || 0)
                        ).toFixed(2)}
                      </span>
                      {peca.fotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFotoZoomUrl(peca.fotoUrl)}
                          className="text-[10px] text-[#0284c7] font-bold flex items-center gap-1 justify-end mt-0.5 hover:underline cursor-pointer"
                        >
                          <Camera size={11} weight="bold" />
                          <span>Ver Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalhamento dos Serviços de Oficina */}
            <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#d0d5dd] flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
                  Serviços Mecânicos e Mão de Obra
                </span>
                <span className="text-[11px] font-bold text-[#667085]">
                  {(dadosOS.servicosOS || []).length} itens
                </span>
              </div>

              <div className="divide-y divide-[#eaecf0]">
                {(dadosOS.servicosOS || []).map((servico, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#fcfcfd]">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#101828] line-clamp-1">
                        {servico.nome}
                      </div>
                      <div className="text-[11px] text-[#667085] flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-semibold">{servico.codigo || `SRV-${idx + 1}`}</span>
                        {servico.tempoEstimado && (
                          <>
                            <span>•</span>
                            <span>Tempo: {servico.tempoEstimado}h</span>
                          </>
                        )}
                        {servico.observacoes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">{servico.observacoes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-[#101828]">
                        R$ {(
                          (parseFloat(servico.valorUnitario ?? servico.precoUnitario) || 0) * (parseFloat(servico.quantidade) || 1) -
                          (parseFloat(servico.desconto) || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalhamento de Terceiros (se houver) */}
            {(dadosOS.terceirosOS || []).length > 0 && (
              <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden">
                <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#d0d5dd] flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
                    Serviços Especializados de Terceiros
                  </span>
                  <span className="text-[11px] font-bold text-[#667085]">
                    {dadosOS.terceirosOS.length} itens
                  </span>
                </div>

                <div className="divide-y divide-[#eaecf0]">
                  {dadosOS.terceirosOS.map((terceiro, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#fcfcfd]">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#101828] line-clamp-1">
                          {terceiro.nome}
                        </div>
                        <div className="text-[11px] text-[#667085] flex items-center gap-2 mt-0.5">
                          <span>Prestador: {terceiro.parceiroNome || 'Especializado'}</span>
                          <span>•</span>
                          <span>Prazo: {terceiro.prazoEstimado || '1 dia'}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-[#101828]">
                          R$ {(
                            (parseFloat(terceiro.valorVenda) || 0) - (parseFloat(terceiro.desconto) || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: LAUDO TÉCNICO OFICIAL */}
        {/* ========================================================================= */}
        {activeTab === 'laudo' && (
          <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#d0d5dd] pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#101828]">
                  Laudo Técnico de Inspeção
                </h2>
                <span className="text-xs text-[#667085]">
                  Parecer técnico emitido pelo mecânico responsável da oficina
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#0284c7] font-bold">
                <ShieldCheck size={18} weight="bold" />
                <span>Garantia de Qualidade</span>
              </div>
            </div>

            {dadosOS.relatoCliente && (
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd]">
                <span className="text-[11px] font-bold text-[#667085] uppercase block mb-1">
                  Queixa Inicial Relatada pelo Cliente:
                </span>
                <p className="text-xs text-[#344054] italic leading-relaxed">
                  "{dadosOS.relatoCliente}"
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-xs text-[#101828] leading-relaxed whitespace-pre-wrap">
              {dadosOS.laudoTecnico ||
                'Nenhum laudo técnico detalhado registrado para esta Ordem de Serviço.'}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#667085] pt-2">
              <span>Mecânico Responsável: <strong className="text-[#101828] font-bold">{dadosOS.mecanicoNome || 'Mecânica Gabriel'}</strong></span>
              <span>Apucarana - PR</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: PEÇAS DANIFICADAS COM FOTOS */}
        {/* ========================================================================= */}
        {activeTab === 'fotos' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 bg-[#e0f2fe] border border-[#bae6fd] rounded-2xl flex items-center gap-2.5">
              <Camera size={20} weight="bold" className="text-[#0284c7] shrink-0" />
              <p className="text-xs text-[#0369a1] leading-relaxed">
                Fotos reais registradas durante a desmontagem e triagem do veículo para comprovação do desgaste e transparência total.
              </p>
            </div>

            {fotosDasPecas.length === 0 && (
              <div className="p-6 text-center bg-white border border-dashed border-[#d0d5dd] rounded-2xl">
                <Camera size={28} weight="light" className="mx-auto text-[#98a2b3] mb-2" />
                <p className="text-sm font-bold text-[#101828]">Nenhuma foto anexada a este orçamento</p>
                <p className="text-xs text-[#667085] mt-1">
                  Fale com nosso consultor pelo WhatsApp se quiser ver evidências das peças antes de aprovar.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fotosDasPecas.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden flex flex-col group"
                >
                  <div
                    onClick={() => setFotoZoomUrl(item.fotoUrl)}
                    className="relative h-48 bg-black overflow-hidden cursor-zoom-in"
                  >
                    <img
                      src={item.fotoUrl}
                      alt={item.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-3 py-1.5 rounded-xl bg-white/90 text-black text-xs font-bold flex items-center gap-1.5 shadow-md">
                        <Eye size={14} weight="bold" />
                        <span>Ampliar Imagem</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#101828] line-clamp-1">
                        {item.nome}
                      </h4>
                      <p className="text-[11px] text-[#475467] mt-1 leading-relaxed">
                        {item.observacao}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#eaecf0] flex items-center justify-between text-[10px] text-[#667085]">
                      <span className="font-bold text-[#b42318]">Substituição Recomendada</span>
                      <button
                        type="button"
                        onClick={() => setFotoZoomUrl(item.fotoUrl)}
                        className="text-[#0284c7] font-bold hover:underline cursor-pointer"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 5. BARRA FIXA INFERIOR DE APROVAÇÃO (STICKY FOOTER MOBILE E DESKTOP) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#d0d5dd] shadow-lg p-3 sm:py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-[#667085] uppercase block leading-none">
              Total do Orçamento
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-[#101828]">
                R$ {totais.totalGeral.toFixed(2)}
              </span>
              <span className="text-[11px] text-[#0284c7] font-bold hidden sm:inline">
                ou 10x de R$ {totais.valorParcelado10x}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {estaAprovado ? (
              <button
                type="button"
                onClick={handleEnviarConfirmacaoWhatsApp}
                className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#1eb956] text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <WhatsappLogo size={16} weight="fill" />
                <span>Reenviar no WhatsApp</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setModalAprovacaoAberto(true)}
                  className="h-10 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <CheckCircle size={17} weight="bold" />
                  <span>Aprovar Orçamento</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: APROVAÇÃO DIGITAL DO CLIENTE */}
      {/* ========================================================================= */}
      {modalAprovacaoAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleConfirmarAprovacao}
            className="bg-white w-full max-w-md rounded-2xl border border-[#d0d5dd] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} weight="bold" className="text-[#0284c7]" />
                <h3 className="text-sm font-extrabold text-[#101828]">
                  Autorização de Serviços e Peças
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAprovacaoAberto(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] transition-colors cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-[#475467] leading-relaxed">
                Ao confirmar, você autoriza a <strong>Mecânica Gabriel</strong> a iniciar os reparos no veículo <strong>{dadosOS.marcaModelo || 'Veículo'}</strong> no valor total de:
              </p>

              <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#d0d5dd] flex items-center justify-between">
                <span className="font-bold text-[#344054]">Valor Autorizado:</span>
                <span className="text-base font-black text-[#0284c7]">
                  R$ {totais.totalGeral.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Nome Completo do Responsável <span className="text-[#0284c7]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nomeResponsavelAprovacao}
                  onChange={(e) => setNomeResponsavelAprovacao(e.target.value)}
                  placeholder={dadosOS.cliente || 'Digite seu nome completo...'}
                  className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Forma de Pagamento Preferida
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormaPagamentoEscolhida('pix')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formaPagamentoEscolhida === 'pix'
                        ? 'border-[#0284c7] bg-[#e0f2fe]/40 text-[#101828]'
                        : 'border-[#d0d5dd] bg-white text-[#475467]'
                    }`}
                  >
                    <span className="font-bold block">PIX / À Vista</span>
                    <span className="text-[10px] text-[#0284c7] font-semibold">5% desconto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormaPagamentoEscolhida('cartao')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formaPagamentoEscolhida === 'cartao'
                        ? 'border-[#0284c7] bg-[#e0f2fe]/40 text-[#101828]'
                        : 'border-[#d0d5dd] bg-white text-[#475467]'
                    }`}
                  >
                    <span className="font-bold block">Cartão de Crédito</span>
                    <span className="text-[10px] text-[#667085]">Até 10x</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setModalAprovacaoAberto(false)}
                className="px-3.5 py-2 rounded-xl border border-[#d0d5dd] bg-white text-[#475467] text-xs font-semibold hover:bg-[#f2f4f7] cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
              >
                <CheckCircle size={15} weight="bold" />
                <span>Confirmar e Autorizar</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FOLHA OFICIAL DE ORÇAMENTO (PARA IMPRESSÃO / VISUALIZAÇÃO) */}
      {/* ========================================================================= */}
      {modalFolhaImpressaoAberta && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-[#525659] w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-5 py-3 bg-[#323639] text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-bold font-mono">
                Folha Oficial de Impressão • Orçamento #{numeroOS}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={15} weight="bold" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalFolhaImpressaoAberta(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-[#525659]">
              <FolhaOrdemServicoImpressao formData={dadosOS} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ZOOM DE FOTO */}
      {/* ========================================================================= */}
      {fotoZoomUrl && (
        <div
          onClick={() => setFotoZoomUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setFotoZoomUrl(null)}
                className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <img
              src={fotoZoomUrl}
              alt="Ampliação da peça"
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
