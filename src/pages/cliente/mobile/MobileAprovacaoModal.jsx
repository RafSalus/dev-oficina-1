import React from 'react'
import { X, Check } from '@phosphor-icons/react'

export function MobileAprovacaoModal({
  isOpen,
  onFechar,
  servico,
  totais,
  formaPagamento,
  setFormaPagamento,
  nomeResponsavel,
  setNomeResponsavel,
  onConfirmar,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header
        className="shrink-0 bg-white border-b border-[#e4e7ec]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="text-sm font-extrabold text-[#101828] truncate">Confirmar Aprovação</span>
            <span className="text-[10px] font-semibold text-[#667085] truncate">OS #{servico.numeroOS}</span>
          </div>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        <div className="p-3.5 bg-[#e0f2fe] border border-[#bae6fd] rounded-2xl mb-3">
          <span className="font-extrabold text-xs text-[#0284c7] block mb-1">
            Resumo dos Itens Selecionados
          </span>
          <p className="text-[11px] text-[#0369a1] leading-snug">
            Os itens opcionais desmarcados foram excluídos da execução e da cobrança.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#101828] text-white flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] text-zinc-400 block">Total a ser faturado</span>
            <span className="text-xl font-black text-[#38bdf8]">R$ {totais.totalAprovado.toFixed(2)}</span>
          </div>
          {totais.economia > 0 && (
            <span className="text-[11px] text-zinc-300 text-right">
              Economia:
              <br />- R$ {totais.economia.toFixed(2)}
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-2">
            Previsão de Pagamento na Retirada
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormaPagamento('pix')}
              className={`p-3 rounded-xl border text-left transition-all ${
                formaPagamento === 'pix'
                  ? 'border-[#0284c7] bg-[#e0f2fe] text-[#0284c7]'
                  : 'border-[#d0d5dd] text-[#475467]'
              }`}
            >
              <span className="block font-bold text-xs">PIX à Vista</span>
              <span className="text-[10px] block mt-0.5 font-semibold">
                5% desc. (R$ {totais.pixDesconto.toFixed(2)})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFormaPagamento('cartao')}
              className={`p-3 rounded-xl border text-left transition-all ${
                formaPagamento === 'cartao'
                  ? 'border-[#0284c7] bg-[#e0f2fe] text-[#0284c7]'
                  : 'border-[#d0d5dd] text-[#475467]'
              }`}
            >
              <span className="block font-bold text-xs">Cartão de Crédito</span>
              <span className="text-[10px] block mt-0.5 font-semibold">
                Até 6x de R$ {totais.parcelaCartao6x}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#344054] mb-2">
            Nome do Titular para Autorização Digital
          </label>
          <input
            type="text"
            value={nomeResponsavel}
            onChange={(e) => setNomeResponsavel(e.target.value)}
            placeholder="Nome completo do proprietário"
            className="w-full bg-[#f8fafc] border border-[#d0d5dd] focus:border-[#101828] rounded-xl px-3.5 h-12 text-sm font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all"
          />
        </div>

        <p className="text-[11px] text-[#667085] leading-relaxed px-1">
          Ao confirmar, a equipe da oficina Mecânica Gabriel iniciará a requisição de peças e os reparos mecânicos.
        </p>
      </main>

      <footer
        className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={onConfirmar}
          className="w-full h-12 rounded-2xl bg-[#0284c7] active:bg-[#0369a1] text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          <Check size={18} weight="bold" />
          <span>Confirmar e Autorizar</span>
        </button>
      </footer>
    </div>
  )
}
