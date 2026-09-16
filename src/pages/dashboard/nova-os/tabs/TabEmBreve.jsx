import React from 'react'
import {
  Package,
  Calculator,
  Handshake,
  Receipt,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from '@phosphor-icons/react'

const TAB_CONFIGS = {
  pecas: {
    title: 'Peças & Insumos',
    subtitle: 'Almoxarifado e requisição de peças para a OS',
    description:
      'Nesta etapa você vinculará peças do estoque interno, óleos, filtros e componentes necessários para a execução dos serviços.',
    icon: Package,
    prevTab: 'diagnostico',
    nextTab: 'cotacao',
    prevLabel: 'Diagnóstico',
    nextLabel: 'Cotação',
    tabIndex: '3 de 7',
  },
  cotacao: {
    title: 'Cotação de Autopeças',
    subtitle: 'Pesquisa e preços com distribuidores parceiros',
    description:
      'Sistema automatizado de cotação de autopeças junto a fornecedores externos para peças que não estão disponíveis no estoque local.',
    icon: Calculator,
    prevTab: 'pecas',
    nextTab: 'terceiros',
    prevLabel: 'Peças',
    nextLabel: 'Terceiros',
    tabIndex: '4 de 7',
  },
  terceiros: {
    title: 'Serviços de Terceiros',
    subtitle: 'Gestão de parceiros externos e usinagem',
    description:
      'Registro e controle de custo/prazo para serviços terceirizados, como retífica de cabeçote, tornearia, soldas e reparos eletrônicos de módulo.',
    icon: Handshake,
    prevTab: 'cotacao',
    nextTab: 'orcamento',
    prevLabel: 'Cotação',
    nextLabel: 'Orçamento',
    tabIndex: '5 de 7',
  },
  orcamento: {
    title: 'Composição de Orçamento',
    subtitle: 'Cálculo de margem, mão de obra e aprovação',
    description:
      'Consolidação de peças, serviços, mão de obra e condições de pagamento para envio e autorização direta do cliente via WhatsApp ou e-mail.',
    icon: Receipt,
    prevTab: 'terceiros',
    nextTab: 'finalizar',
    prevLabel: 'Terceiros',
    nextLabel: 'Finalizar',
    tabIndex: '6 de 7',
  },
  finalizar: {
    title: 'Finalização & Fechamento',
    subtitle: 'Checklist de saída e emissão da Ordem de Serviço',
    description:
      'Validação final das informações, impressão da via do cliente, geração de comprovante e integração com o painel de atendimento do pátio.',
    icon: CheckCircle,
    prevTab: 'orcamento',
    nextTab: null,
    prevLabel: 'Orçamento',
    nextLabel: null,
    tabIndex: '7 de 7',
  },
}

export function TabEmBreve({ tabId, onSelectTab }) {
  const config = TAB_CONFIGS[tabId] || {
    title: 'Módulo em Desenvolvimento',
    subtitle: 'Recurso em fase de estruturação',
    description: 'Esta funcionalidade estará disponível em breve.',
    icon: Package,
    tabIndex: 'Em breve',
  }

  const IconComponent = config.icon

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Área Central: Cartão Sóbrio Estilo Uber */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#e4e7ec] shadow-xs p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center mb-3 text-[#101828]">
          <IconComponent size={24} weight="bold" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f4f7] text-[#344054] text-xs font-bold mb-3 border border-[#e4e7ec]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#101828]" />
          Em breve
        </div>

        <h2 className="text-lg font-extrabold text-[#101828] tracking-tight mb-1">
          {config.title}
        </h2>

        <p className="text-xs font-semibold text-[#667085] mb-2">
          {config.subtitle}
        </p>

        <p className="text-xs text-[#475467] max-w-md leading-relaxed mb-4">
          {config.description}
        </p>

        <div className="bg-[#fafafa] border border-[#e4e7ec] rounded-xl px-4 py-2 text-[11px] text-[#667085]">
          Os dados informados nas abas anteriores já estão salvos e vinculados a esta OS.
        </div>
      </div>

      {/* Barra Inferior de Navegação */}
      <div className="h-10 shrink-0 bg-white px-4 rounded-xl border border-[#e4e7ec] shadow-xs flex items-center justify-between">
        {config.prevTab ? (
          <button
            type="button"
            onClick={() => onSelectTab(config.prevTab)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] cursor-pointer"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Voltar para {config.prevLabel}</span>
          </button>
        ) : (
          <span />
        )}

        <span className="text-[11px] font-medium text-[#667085]">
          Aba {config.tabIndex} • <strong className="text-[#101828]">{config.title}</strong>
        </span>

        {config.nextTab ? (
          <button
            type="button"
            onClick={() => onSelectTab(config.nextTab)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101828] hover:text-black hover:underline cursor-pointer"
          >
            <span>Avançar para {config.nextLabel}</span>
            <ArrowRight size={14} weight="bold" />
          </button>
        ) : (
          <span className="text-xs font-bold text-[#027a48]">Última etapa</span>
        )}
      </div>
    </div>
  )
}
