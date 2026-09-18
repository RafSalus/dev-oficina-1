import React, { useMemo, useState } from 'react'
import { Receipt, WhatsappLogo, Copy, Check, CalendarDots, User, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { MobileStepFooter } from '../MobileStepFooter'
import { MobileOrcamentoCompletoModal } from '../MobileOrcamentoCompletoModal'
import { inputBaseClass, labelBaseClass } from '../mobileSelectStyles'

export function MobileStepOrcamento({ formData, updateFormData, onContinue, isLastStep }) {
  const {
    numeroOS = '002908',
    cliente = '',
    telefone = '',
    placa = '',
    marcaModelo = '',
    pecasOS = [],
    servicosOS = [],
    terceirosOS = [],
    descontoGeralOS = '0.00',
    condicaoPagamentoOS = '',
    previsaoEntregaData = '',
    previsaoEntregaHora = '18:00',
    consultorResponsavel = 'BIANCA',
  } = formData

  const [copiadoLink, setCopiadoLink] = useState(false)
  const [orcamentoCompletoAberto, setOrcamentoCompletoAberto] = useState(false)

  const metricas = useMemo(() => {
    let totalPecas = 0
    let descPecas = 0
    pecasOS.forEach((p) => {
      const qtd = parseFloat(p.quantidade) || 1
      const pr = parseFloat(p.precoUnitario) || 0
      totalPecas += pr * qtd
      descPecas += parseFloat(p.desconto) || 0
    })
    const subPecas = Math.max(0, totalPecas - descPecas)

    let totalServicos = 0
    let descServicos = 0
    servicosOS.forEach((s) => {
      const qtd = parseFloat(s.quantidade) || 1
      const pr = parseFloat(s.valorUnitario) || 0
      totalServicos += pr * qtd
      descServicos += parseFloat(s.desconto) || 0
    })
    const subServicos = Math.max(0, totalServicos - descServicos)

    let totalTerceiros = 0
    let descTerceiros = 0
    terceirosOS.forEach((t) => {
      totalTerceiros += parseFloat(t.valorVenda) || 0
      descTerceiros += parseFloat(t.desconto) || 0
    })
    const subTerceiros = Math.max(0, totalTerceiros - descTerceiros)

    const descGeral = parseFloat(descontoGeralOS) || 0
    const totalLiquido = Math.max(0, subPecas + subServicos + subTerceiros - descGeral)

    return {
      totalPecas: subPecas.toFixed(2),
      totalServicos: subServicos.toFixed(2),
      totalTerceiros: subTerceiros.toFixed(2),
      totalLiquido: totalLiquido.toFixed(2),
    }
  }, [pecasOS, servicosOS, terceirosOS, descontoGeralOS])

  const urlAprovacaoCliente = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dev-oficina.com'
    return `${origin}/aprovacao/${numeroOS || '002908'}`
  }, [numeroOS])

  const salvarNoStorageCompartilhado = () => {
    try {
      const raw = localStorage.getItem('dev_oficina_orcamentos')
      const orcamentos = raw ? JSON.parse(raw) : {}
      orcamentos[numeroOS] = { ...formData, numeroOS, metricas }
      localStorage.setItem('dev_oficina_orcamentos', JSON.stringify(orcamentos))
    } catch (e) {}
  }

  const handleCopiarLink = () => {
    salvarNoStorageCompartilhado()
    navigator.clipboard.writeText(urlAprovacaoCliente)
    setCopiadoLink(true)
    toast.success('Link do portal de aprovação do cliente copiado!')
    setTimeout(() => setCopiadoLink(false), 2500)
  }

  const handleEnviarWhatsapp = () => {
    salvarNoStorageCompartilhado()
    const telDestino = (telefone || '').replace(/\D/g, '')
    const veiculoTexto = placa ? `${placa} (${marcaModelo || 'Veículo'})` : marcaModelo || 'Veículo'
    const mensagem = `Olá, *${cliente || 'Cliente'}*! 👋%0A%0AAqui é da *Mecânica Gabriel*. O orçamento técnico do seu veículo *${veiculoTexto}* já está concluído.%0A%0A📄 *Orçamento:* #${numeroOS}%0A💰 *Total:* R$ ${metricas.totalLiquido}%0A%0A📲 *Acesse o link para conferir e aprovar online:*%0A🔗 ${urlAprovacaoCliente}`
    const urlZap = telDestino ? `https://wa.me/55${telDestino}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`
    toast.info('Abrindo WhatsApp para envio ao cliente...')
    window.open(urlZap, '_blank')
  }

  return (
    <div>
      {/* Resumo Financeiro */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <Receipt size={18} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Orçamento #{numeroOS}</h2>
            <p className="text-xs text-[#667085] mt-0.5">Resumo consolidado da Ordem de Serviço</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOrcamentoCompletoAberto(true)}
          className="w-full h-11 mb-3 rounded-xl border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <FileText size={15} weight="bold" />
          Ver Orçamento Completo
        </button>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#667085]">Peças ({pecasOS.length})</span>
            <span className="font-bold text-[#101828]">R$ {metricas.totalPecas}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-t border-[#f2f4f7]">
            <span className="text-[#667085]">Serviços ({servicosOS.length})</span>
            <span className="font-bold text-[#101828]">R$ {metricas.totalServicos}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-t border-[#f2f4f7]">
            <span className="text-[#667085]">Terceiros ({terceirosOS.length})</span>
            <span className="font-bold text-[#101828]">R$ {metricas.totalTerceiros}</span>
          </div>
        </div>

        <div className="mt-2.5">
          <label className={labelBaseClass}>Desconto Geral (R$)</label>
          <input
            type="text"
            value={descontoGeralOS}
            onChange={(e) => updateFormData({ descontoGeralOS: e.target.value })}
            className={inputBaseClass}
          />
        </div>

        <div className="mt-3 p-3 rounded-xl bg-[#101828] flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase">Total Líquido</span>
          <span className="text-lg font-extrabold text-white">R$ {metricas.totalLiquido}</span>
        </div>
      </div>

      {/* Condições */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3 overflow-hidden">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#f2f4f7]">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center shrink-0">
            <CalendarDots size={18} weight="bold" />
          </div>
          <h2 className="text-sm font-extrabold text-[#101828] leading-tight">Condições e Entrega</h2>
        </div>

        <label className={labelBaseClass}>Condição de Pagamento</label>
        <input
          type="text"
          value={condicaoPagamentoOS}
          onChange={(e) => updateFormData({ condicaoPagamentoOS: e.target.value })}
          className={inputBaseClass}
        />

        <div className="flex flex-col gap-2.5 mt-2.5">
          <div className="min-w-0 max-w-full">
            <label className={labelBaseClass}>Previsão de Entrega</label>
            <input
              type="date"
              value={previsaoEntregaData}
              onChange={(e) => updateFormData({ previsaoEntregaData: e.target.value })}
              className={`${inputBaseClass} min-w-0 max-w-full block appearance-none`}
              style={{ WebkitAppearance: 'none' }}
            />
          </div>
          <div className="min-w-0 max-w-full">
            <label className={labelBaseClass}>Horário</label>
            <input
              type="time"
              value={previsaoEntregaHora}
              onChange={(e) => updateFormData({ previsaoEntregaHora: e.target.value })}
              className={`${inputBaseClass} min-w-0 max-w-full block appearance-none`}
              style={{ WebkitAppearance: 'none' }}
            />
          </div>
        </div>

        <div className="mt-2.5">
          <label className={labelBaseClass}>
            <User size={11} className="inline -mt-0.5 mr-1" />
            Consultor Responsável
          </label>
          <input
            type="text"
            value={consultorResponsavel}
            onChange={(e) => updateFormData({ consultorResponsavel: e.target.value })}
            className={inputBaseClass}
          />
        </div>
      </div>

      {/* Portal do Cliente */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4">
        <h2 className="text-sm font-extrabold text-[#101828] leading-tight mb-3">Enviar ao Cliente</h2>

        <div className="flex items-center gap-2 mb-2.5">
          <button
            type="button"
            onClick={handleCopiarLink}
            className="flex-1 h-11 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#344054] flex items-center justify-center gap-1.5"
          >
            {copiadoLink ? <Check size={14} className="text-[#0284c7]" /> : <Copy size={14} />}
            <span>{copiadoLink ? 'Copiado!' : 'Copiar Link de Aprovação'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleEnviarWhatsapp}
          className="w-full h-12 rounded-xl bg-[#25D366] text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          <WhatsappLogo size={18} weight="fill" />
          <span>Enviar Orçamento no WhatsApp</span>
        </button>
      </div>

      <MobileStepFooter onContinue={onContinue} isLastStep={isLastStep} />

      <MobileOrcamentoCompletoModal
        isOpen={orcamentoCompletoAberto}
        formData={formData}
        metricas={metricas}
        onFechar={() => setOrcamentoCompletoAberto(false)}
      />
    </div>
  )
}
