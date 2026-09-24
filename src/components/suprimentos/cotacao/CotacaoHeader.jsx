import React from 'react'
import { ArrowLeft, ShareNetwork, FloppyDisk, Trash, CheckCircle, Eye } from '@phosphor-icons/react'

const ROTULO_STATUS = {
  APROVADA: 'Cotação Aprovada',
  RESPONDIDA: 'Propostas Recebidas',
}

const CLASSE_STATUS = {
  APROVADA: 'bg-[#101828] text-white border-[#101828]',
  RESPONDIDA: 'bg-sky-50 text-sky-800 border-sky-200',
}

/**
 * Cabeçalho da tela dedicada de Cotação: voltar, identificação, status e ações principais.
 * @param {{
 *   idCotacao: string, status: string, dados: object, podeExcluir: boolean,
 *   onVoltar: Function, onExcluir: Function, onVisualizar: Function, onSalvar: Function, onAprovar: Function
 * }} props
 */
export function CotacaoHeader({ idCotacao, status, dados, podeExcluir, onVoltar, onExcluir, onVisualizar, onSalvar, onAprovar }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            title="Retornar para a tela anterior"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Voltar</span>
          </button>

          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
            <ShareNetwork size={22} weight="bold" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Cotação de Peças com Autopeças Parceiras
              </h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                {idCotacao}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  CLASSE_STATUS[status] || 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {ROTULO_STATUS[status] || 'Em Cotação'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {dados.veiculoModelo
                ? `${dados.veiculoModelo} (${dados.veiculoPlaca}) • Cliente: ${dados.clienteNome || 'Balcão'}`
                : 'Gestão da lista de peças, envio via WhatsApp para fornecedores e comparativo de preços'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {podeExcluir && (
            <button
              type="button"
              onClick={onExcluir}
              className="p-2 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Excluir cotação"
            >
              <Trash size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onVisualizar}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Visualizar como as autopeças parceiras enxergam a página de cotação"
          >
            <Eye size={16} weight="bold" className="text-[#0284c7]" />
            <span>Visualizar Página</span>
          </button>

          <button
            type="button"
            onClick={onSalvar}
            className="inline-flex items-center gap-2 px-4 py-2 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Salvar Cotação</span>
          </button>

          <button
            type="button"
            onClick={onAprovar}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Aprovar a melhor proposta e emitir o Pedido de Compra oficial"
          >
            <CheckCircle size={16} weight="bold" />
            <span>Aprovar Cotação e Gerar Pedido</span>
          </button>
        </div>
      </div>
    </div>
  )
}
