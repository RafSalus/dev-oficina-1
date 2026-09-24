import React from 'react'
import { FloppyDisk, CheckCircle, Eye } from '@phosphor-icons/react'

/**
 * Barra inferior fixa da tela de Cotação (single-screen, acima do footer).
 * @param {{
 *   totalItens: number, totalFornecedores: number,
 *   onVoltar: Function, onVisualizar: Function, onSalvar: Function, onAprovar: Function
 * }} props
 */
export function CotacaoRodape({ totalItens, totalFornecedores, onVoltar, onVisualizar, onSalvar, onAprovar }) {
  return (
    <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onVoltar}
          className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Voltar
        </button>
        <span className="text-xs text-slate-500">
          {totalItens} {totalItens === 1 ? 'peça na cotação' : 'peças na cotação'} • {totalFornecedores} fornecedores
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onVisualizar}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          title="Visualizar como as autopeças parceiras enxergam a página de cotação"
        >
          <Eye size={16} weight="bold" className="text-[#0284c7]" />
          <span>Visualizar Página</span>
        </button>

        <button
          type="button"
          onClick={onSalvar}
          className="inline-flex items-center gap-2 px-4 py-2 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <FloppyDisk size={16} weight="bold" />
          <span>Salvar Cotação</span>
        </button>

        <button
          type="button"
          onClick={onAprovar}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <CheckCircle size={16} weight="bold" />
          <span>Aprovar Cotação e Gerar Pedido de Compra</span>
        </button>
      </div>
    </div>
  )
}
