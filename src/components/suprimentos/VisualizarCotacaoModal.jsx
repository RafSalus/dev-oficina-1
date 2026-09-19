import React, { useState, useEffect } from 'react'
import {
  Eye,
  X,
  DeviceMobile,
  Desktop,
  ArrowSquareOut,
  ArrowsClockwise,
  Car,
  Package,
} from '@phosphor-icons/react'

export function VisualizarCotacaoModal({
  isOpen,
  onClose,
  cotacaoId,
  cotacao,
}) {
  const [dispositivo, setDispositivo] = useState('mobile') // 'mobile' | 'desktop'
  const [chaveRecarregar, setChaveRecarregar] = useState(Date.now())

  useEffect(() => {
    const handleMensagem = (e) => {
      if (e.data?.tipo === 'FECHAR_MODAL_PREVIEW') {
        onClose?.()
      }
    }
    window.addEventListener('message', handleMensagem)
    return () => window.removeEventListener('message', handleMensagem)
  }, [onClose])

  if (!isOpen || !cotacaoId) return null

  const urlCotacao = `/cotacao/${cotacaoId}`
  const urlCompleta = `${window.location.origin}/cotacao/${cotacaoId}`

  const handleRecarregar = () => {
    setChaveRecarregar(Date.now())
  }

  const handleAbrirNovaAba = () => {
    window.open(urlCotacao, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Top Header do Modal de Visualização */}
        <div className="bg-[#1e293b] border-b border-slate-700 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Título e Identificação */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-[#38bdf8] flex items-center justify-center border border-sky-500/30 shrink-0">
              <Eye size={22} weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-[#0284c7] text-white tracking-wide uppercase">
                  Página da Cotação #{cotacaoId}
                </span>
                <span className="text-[11px] text-slate-300 hidden md:inline">
                  Visão oficial das autopeças
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate flex items-center gap-2 mt-0.5">
                {cotacao?.veiculoModelo ? (
                  <>
                    <Car size={15} className="text-[#38bdf8] shrink-0" />
                    <span>{cotacao.veiculoModelo}</span>
                    {cotacao.veiculoPlaca && (
                      <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {cotacao.veiculoPlaca}
                      </span>
                    )}
                  </>
                ) : (
                  <span>Pré-visualização da Cotação de Peças</span>
                )}
              </h2>
            </div>
          </div>

          {/* Controles: Alternador Celular / Computador e Ações */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Seletor Mobile / Desktop */}
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDispositivo('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dispositivo === 'mobile'
                    ? 'bg-[#0284c7] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Visualizar no formato de celular (WhatsApp)"
              >
                <DeviceMobile size={16} weight="bold" />
                <span>Celular</span>
              </button>

              <button
                type="button"
                onClick={() => setDispositivo('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dispositivo === 'desktop'
                    ? 'bg-[#0284c7] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Visualizar no formato de computador"
              >
                <Desktop size={16} weight="bold" />
                <span>Computador</span>
              </button>
            </div>

            {/* Recarregar */}
            <button
              type="button"
              onClick={handleRecarregar}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Recarregar visualização"
            >
              <ArrowsClockwise size={16} />
            </button>

            {/* Abrir em Nova Aba */}
            <button
              type="button"
              onClick={handleAbrirNovaAba}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-[#38bdf8] rounded-lg border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Abrir em uma aba do navegador separada"
            >
              <ArrowSquareOut size={15} weight="bold" />
              <span className="hidden md:inline">Nova Aba</span>
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Fechar visualização"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Área Central de Visualização Responsiva */}
        <div className="flex-1 bg-slate-950 p-3 sm:p-6 overflow-hidden flex items-center justify-center min-h-[480px]">
          {dispositivo === 'mobile' ? (
            /* Mockup Celular Smartphone (iPhone / Android) */
            <div className="w-[390px] max-w-full h-[700px] max-h-[76vh] bg-slate-900 rounded-[38px] p-2.5 shadow-2xl border-4 border-slate-700 flex flex-col relative shrink-0">
              {/* Entalhe Superior / Alto-Falante */}
              <div className="w-28 h-4 bg-slate-950 rounded-full mx-auto mb-1.5 shrink-0 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
              </div>

              {/* Iframe da Tela Pública */}
              <div className="w-full flex-1 rounded-[28px] overflow-hidden bg-white relative">
                <iframe
                  key={`frame-mobile-${chaveRecarregar}`}
                  src={`${urlCotacao}?t=${chaveRecarregar}`}
                  title="Página de Cotação Celular"
                  className="w-full h-full border-0"
                />
              </div>

              {/* Indicador de Barra Inferior do Celular */}
              <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2 shrink-0" />
            </div>
          ) : (
            /* Mockup Desktop Navegador */
            <div className="w-full h-[700px] max-h-[76vh] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
              {/* Barra do Navegador Simulado */}
              <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>

                <div className="flex-1 bg-slate-950 rounded-lg px-3 py-1 text-xs text-slate-300 font-mono flex items-center justify-between border border-slate-700/80 truncate">
                  <span className="truncate">{urlCompleta}</span>
                  <span className="text-[10px] text-slate-500 font-sans uppercase font-bold shrink-0 ml-2">
                    SSL Seguro
                  </span>
                </div>
              </div>

              {/* Iframe Desktop */}
              <div className="w-full flex-1 bg-white relative">
                <iframe
                  key={`frame-desk-${chaveRecarregar}`}
                  src={`${urlCotacao}?t=${chaveRecarregar}`}
                  title="Página de Cotação Desktop"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="bg-[#1e293b] border-t border-slate-700 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Package size={16} className="text-[#38bdf8] shrink-0" />
            <span>
              Esta é a página real que os vendedores das autopeças acessam através do link do WhatsApp.
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              Fechar Visualização
            </button>

            <button
              type="button"
              onClick={handleAbrirNovaAba}
              className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowSquareOut size={14} weight="bold" />
              <span>Abrir em Tela Cheia</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
