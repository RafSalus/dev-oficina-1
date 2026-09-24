import React from 'react'
import {
  Car,
  CheckCircle,
  Clock,
  Printer,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react'

/**
 * Cabeçalho e banner de identificação da OS e do veículo (NFR17).
 *
 * @param {Object} props
 * @param {Object} props.dadosOS - Dados cadastrais da ordem de serviço
 * @param {boolean} props.estaAprovado - Se o orçamento já foi formalmente aprovado
 * @param {string|null} props.dataHoraAprovacao - Data e hora da aprovação
 * @param {() => void} props.onAbrirFolhaImpressao - Callback para abrir a folha oficial de impressão
 * @param {() => void} props.onTirarDuvidasWhatsApp - Callback para abrir atendimento WhatsApp
 * @param {() => void} [props.onFecharAba] - Callback para fechar a visualização
 */
export function AprovacaoHeader({
  dadosOS,
  estaAprovado,
  dataHoraAprovacao,
  onAbrirFolhaImpressao,
  onTirarDuvidasWhatsApp,
  onFecharAba,
}) {
  const handleFechar = () => {
    if (onFecharAba) {
      onFecharAba()
      return
    }
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
    <>
      {/* 1. Topo com Identidade e Ações Globais */}
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
                Orçamento e Aprovação Digital • OS #{dadosOS.numeroOS || 'N/D'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onTirarDuvidasWhatsApp && (
              <button
                type="button"
                onClick={onTirarDuvidasWhatsApp}
                className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Tirar dúvidas via WhatsApp"
              >
                <WhatsappLogo size={15} weight="fill" />
                <span className="hidden sm:inline">Dúvidas? Fale Conosco</span>
              </button>
            )}

            {onAbrirFolhaImpressao && (
              <button
                type="button"
                onClick={onAbrirFolhaImpressao}
                className="h-8 px-2.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Visualizar documento oficial para impressão"
              >
                <Printer size={14} weight="bold" />
                <span className="hidden md:inline">Folha Oficial</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleFechar}
              className="h-8 px-3 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Fechar esta aba e voltar para a tela anterior"
            >
              <X size={14} weight="bold" />
              <span>Fechar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Banner do Veículo e Status da Aprovação */}
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
                {dadosOS.ano || 'Ano N/D'} • {dadosOS.cor || 'Cor N/D'} • {dadosOS.km ? `${dadosOS.km} km` : 'KM N/D'}
                {dadosOS.consultorResponsavel && ` • Consultora: ${dadosOS.consultorResponsavel}`}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            {estaAprovado ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0284c7] text-white text-xs font-bold shadow-xs">
                <CheckCircle size={15} weight="fill" />
                <span>Aprovado em {dataHoraAprovacao || 'data recente'}</span>
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
    </>
  )
}
