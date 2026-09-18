import React from 'react'
import {
  Wrench,
  Package,
  Calculator,
  Handshake,
  Receipt,
  CheckCircle,
  FloppyDisk,
  X,
} from '@phosphor-icons/react'

const TAB_CONFIGS = {
  diagnostico: {
    title: 'Diagnóstico Técnico',
    subtitle: 'Avaliação detalhada e apontamento de avarias',
    description:
      'Espaço dedicado para inserção de diagnósticos avançados, testes com scanners automotivos, inspeção de injeção eletrônica e testes de bancada.',
    icon: Wrench,
    nextTab: 'servicos',
    nextLabel: 'Serviços',
    tabIndex: '3 de 9',
  },
  servicos: {
    title: 'Serviços e Mão de Obra',
    subtitle: 'Serviços mecânicos a serem executados na OS',
    description:
      'Registro dos serviços mecânicos, eletrônicos e de manutenção que serão realizados no veículo, incluindo tempo padrão e alocação técnica.',
    icon: Wrench,
    nextTab: 'pecas',
    nextLabel: 'Peças',
    tabIndex: '4 de 9',
  },
  pecas: {
    title: 'Peças e Insumos',
    subtitle: 'Almoxarifado e requisição de peças para a OS',
    description:
      'Nesta etapa você vinculará peças do estoque interno, óleos, filtros e componentes necessários para a execução dos serviços.',
    icon: Package,
    nextTab: 'aprovacao',
    nextLabel: 'Aprovação',
    tabIndex: '5 de 9',
  },
  cotacao: {
    title: 'Cotação e Aprovação',
    subtitle: 'Cotação com fornecedores e autorização do cliente',
    description:
      'Pesquisa e cotação de preços de peças em múltiplos parceiros para obter a melhor margem de lucro e melhor custo-benefício.',
    icon: Calculator,
    nextTab: 'terceiros',
    nextLabel: 'Terceiros',
    tabIndex: '6 de 9',
  },
  aprovacao: {
    title: 'Cotação e Aprovação',
    subtitle: 'Cotação com fornecedores e autorização do cliente',
    description:
      'Envio do orçamento e plano de serviços para aprovação do cliente via WhatsApp ou e-mail com acompanhamento em tempo real.',
    icon: Calculator,
    nextTab: 'terceiros',
    nextLabel: 'Terceiros',
    tabIndex: '6 de 9',
  },
  terceiros: {
    title: 'Serviços de Terceiros',
    subtitle: 'Gestão de parceiros externos e usinagem',
    description:
      'Registro e controle de custo/prazo para serviços terceirizados, como retífica de cabeçote, tornearia, soldas e reparos eletrônicos de módulo.',
    icon: Handshake,
    nextTab: 'orcamento',
    nextLabel: 'Orçamento',
    tabIndex: '7 de 9',
  },
  orcamento: {
    title: 'Composição de Orçamento',
    subtitle: 'Cálculo de margem, mão de obra e condições',
    description:
      'Consolidação de peças, serviços, mão de obra e condições de pagamento para envio e autorização direta do cliente via WhatsApp ou e-mail.',
    icon: Receipt,
    nextTab: 'finalizar',
    nextLabel: 'Finalizar',
    tabIndex: '8 de 9',
  },
  finalizar: {
    title: 'Finalização e Fechamento',
    subtitle: 'Validação final e emissão da Ordem de Serviço',
    description:
      'Validação final das informações, gravação no banco de dados e integração com o painel de atendimento e pátio da oficina.',
    icon: CheckCircle,
    nextTab: null,
    nextLabel: null,
    tabIndex: '9 de 9',
  },
}

export function TabEmBreve({ tabId, onSelectTab, onSaveStep, onCancel }) {
  const config = TAB_CONFIGS[tabId] || {
    title: 'Módulo em Desenvolvimento',
    subtitle: 'Recurso em fase de estruturação',
    description: 'Esta funcionalidade estará disponível em breve.',
    icon: Package,
    tabIndex: 'Etapa',
  }

  const IconComponent = config.icon

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      {/* Área Central: Cartão Sóbrio Estilo Uber */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#d0d5dd] flex items-center justify-center mb-3 text-[#101828]">
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

        <div className="bg-[#f8fafc] border border-[#d0d5dd] rounded-xl px-4 py-2 text-[11px] text-[#667085]">
          Os dados informados nas abas anteriores já estão salvos e vinculados a esta OS.
        </div>
      </div>

      {/* Barra Inferior de Ações da Etapa */}
      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#fef3f2] text-[#475467] hover:text-[#b42318] hover:border-[#fecdca] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <X size={14} weight="bold" />
          <span>Cancelar</span>
        </button>

        <span className="text-xs font-medium text-[#667085]">
          Aba {config.tabIndex} • <strong className="text-[#101828] font-bold">{config.title}</strong>
        </span>

        {config.nextTab ? (
          <button
            type="button"
            onClick={() => onSaveStep?.(config.title, config.nextTab)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <FloppyDisk size={15} weight="bold" />
            <span>Salvar e Continuar</span>
          </button>
        ) : (
          <button
            type="submit"
            form="form-nova-os"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <CheckCircle size={15} weight="bold" />
            <span>Salvar e Finalizar OS</span>
          </button>
        )}
      </div>
    </div>
  )
}
