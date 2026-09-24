import React from 'react'
import {
  CheckCircle,
  Clock,
  Copy,
  WhatsappLogo,
  ArrowSquareOut,
  PencilSimple,
  CaretDown,
  CaretUp,
  Trash,
} from '@phosphor-icons/react'
import { CotacaoPrecosGrade } from './CotacaoPrecosGrade'

function FornecedorStatusBadges({ isVencedor, isRespondida }) {
  return (
    <>
      {isVencedor && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0284c7] text-white">
          <CheckCircle size={13} weight="fill" />
          <span>Proposta Vencedora</span>
        </span>
      )}
      {isRespondida && !isVencedor && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
          <CheckCircle size={13} weight="bold" />
          <span>Proposta Recebida</span>
        </span>
      )}
      {!isRespondida && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock size={13} weight="bold" />
          <span>Aguardando Resposta</span>
        </span>
      )}
    </>
  )
}

/**
 * Card de uma autopeça participante: status da proposta, valor total, envio por
 * WhatsApp, link público, grade de preços expansível, escolha do vencedor e remoção.
 * @param {{
 *   fornecedor: object, itens: Array<object>, idCotacao: string,
 *   isVencedor: boolean, isExpandido: boolean, acoes: object
 * }} props - `acoes` de `useCotacaoFornecedores` somadas a `dispararWhatsApp`/`copiarMensagemWhatsApp`.
 */
export function CotacaoFornecedorCard({ fornecedor: forn, itens, idCotacao, isVencedor, isExpandido, acoes }) {
  const isRespondida = forn.status === 'RESPONDIDA' && forn.valorTotal > 0

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        isVencedor
          ? 'border-[#0284c7] bg-sky-50/30 shadow-xs ring-1 ring-[#0284c7]'
          : isRespondida
          ? 'border-slate-300 bg-white'
          : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">{forn.nome}</span>
            <FornecedorStatusBadges isVencedor={isVencedor} isRespondida={isRespondida} />
          </div>

          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
            <span>{forn.telefone}</span>
            <span>•</span>
            <span>Prazo: <strong className="text-slate-800">{forn.tempoEntrega || '1 a 2 horas'}</strong></span>
            <span>•</span>
            <span>Condição: <strong className="text-slate-800">{forn.condicaoPagamento || 'Boleto 30 Dias'}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-right mr-3">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Valor Total Cotado</span>
            <span className="text-base font-bold font-mono text-slate-900">
              {forn.valorTotal ? `R$ ${Number(forn.valorTotal).toFixed(2)}` : 'Aguardando...'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => acoes.dispararWhatsApp(forn)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-lg text-xs font-bold transition-colors cursor-pointer border border-[#25D366]/30"
            title="Enviar lista de peças pelo WhatsApp da autopeça"
          >
            <WhatsappLogo size={16} weight="fill" className="text-[#25D366]" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => acoes.copiarMensagemWhatsApp(forn)}
            className="p-2 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Copiar mensagem e link para WhatsApp"
          >
            <Copy size={16} />
          </button>

          <a
            href={`/cotacao/${idCotacao}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Abrir tela pública que a autopeça preenche"
          >
            <ArrowSquareOut size={16} />
          </a>

          <button
            type="button"
            onClick={() => acoes.alternarExpandido(forn.id)}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              isExpandido
                ? 'bg-sky-50 border-sky-300 text-[#0284c7]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PencilSimple size={14} />
            <span>Preços</span>
            {isExpandido ? <CaretUp size={13} /> : <CaretDown size={13} />}
          </button>

          <button
            type="button"
            onClick={() => acoes.alternarVencedor(forn.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isVencedor
                ? 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Selecionar este fornecedor para gerar a compra oficial"
          >
            <CheckCircle size={15} weight={isVencedor ? 'fill' : 'bold'} />
            <span>{isVencedor ? 'Vencedor' : 'Escolher'}</span>
          </button>

          <button
            type="button"
            onClick={() => acoes.remover(forn.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Remover fornecedor da cotação"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {isExpandido && (
        <CotacaoPrecosGrade
          fornecedor={forn}
          itens={itens}
          onAtualizarPreco={acoes.atualizarPreco}
          onAtualizarDados={acoes.atualizarDados}
        />
      )}
    </div>
  )
}
