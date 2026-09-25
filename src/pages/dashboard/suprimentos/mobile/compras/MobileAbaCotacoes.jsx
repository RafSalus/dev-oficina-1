import React from 'react'
import PropTypes from 'prop-types'
import {
  ShareNetwork,
  Trash,
  CheckCircle,
} from '@phosphor-icons/react'

function CotacaoCard({ cotacao, onAbrir, onWhatsapp, onAprovar, onExcluir }) {
  const dataFormatada = new Date(cotacao.dataCriacao).toLocaleDateString('pt-BR')
  const totalItens = cotacao.itens ? cotacao.itens.length : 0
  const fornecedoresRespondidos = (cotacao.fornecedoresCotados || []).filter(
    (f) => f.status === 'RESPONDIDA' && f.valorTotal > 0
  )
  const isAprovada = cotacao.status === 'APROVADA'
  const isRespondida = cotacao.status === 'RESPONDIDA' || fornecedoresRespondidos.length > 0

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-3.5 ${
        isAprovada
          ? 'border-[#101828]'
          : isRespondida
            ? 'border-sky-300'
            : 'border-[#d0d5dd]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-mono font-black text-xs text-[#101828]">{cotacao.id}</span>
        {isAprovada ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#101828] text-white">
            Aprovada
          </span>
        ) : isRespondida ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            {fornecedoresRespondidos.length} Propostas
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Aguardando
          </span>
        )}
      </div>

      {cotacao.numeroOS ? (
        <p className="text-sm font-extrabold text-[#101828]">OS #{cotacao.numeroOS}</p>
      ) : (
        <p className="text-sm font-extrabold text-[#101828]">Reposição de Almoxarifado</p>
      )}
      <p className="text-[10.5px] text-[#667085] mt-0.5">
        {cotacao.veiculoModelo} {cotacao.veiculoPlaca ? `• ${cotacao.veiculoPlaca}` : ''} •{' '}
        {dataFormatada}
      </p>

      <div className="mt-2 space-y-1">
        {(cotacao.itens || []).slice(0, 3).map((it, idx) => (
          <div
            key={it.id || idx}
            className="flex items-center justify-between text-[10.5px] bg-[#f8fafc] rounded-lg px-2.5 py-1.5"
          >
            <span className="text-[#344054] font-semibold truncate">{it.nome}</span>
            <span className="font-mono text-[#0284c7] font-bold shrink-0 ml-2">
              {it.quantidade} {it.unidade}
            </span>
          </div>
        ))}
        {totalItens > 3 && (
          <p className="text-[10px] text-[#98a2b3] text-center">+{totalItens - 3} itens</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {(cotacao.fornecedoresCotados || []).map((f, idx) => (
          <span
            key={idx}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
              f.valorTotal > 0
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-[#f2f4f7] text-[#667085]'
            }`}
          >
            {f.nome}
            {f.valorTotal > 0 && (
              <span className="font-mono font-bold">R$ {Number(f.valorTotal).toFixed(0)}</span>
            )}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#f2f4f7]">
        <button
          type="button"
          onClick={() => onAbrir(cotacao)}
          className="h-9 rounded-lg bg-[#101828] text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          Ver / Cotar
        </button>
        <button
          type="button"
          onClick={() => onWhatsapp(cotacao)}
          className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <ShareNetwork size={14} />
          WhatsApp
        </button>
      </div>

      {!isAprovada && (
        <div className="flex items-center justify-between gap-2 mt-2">
          {fornecedoresRespondidos.length > 0 && (
            <button
              type="button"
              onClick={() => onAprovar(cotacao)}
              className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <CheckCircle size={13} weight="bold" />
              Aprovar Melhor
            </button>
          )}
          <button
            type="button"
            onClick={() => onExcluir(cotacao)}
            className="p-1.5 text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 ml-auto"
          >
            <Trash size={14} />
            Excluir
          </button>
        </div>
      )}
    </div>
  )
}

CotacaoCard.propTypes = {
  cotacao: PropTypes.object.isRequired,
  onAbrir: PropTypes.func.isRequired,
  onWhatsapp: PropTypes.func.isRequired,
  onAprovar: PropTypes.func.isRequired,
  onExcluir: PropTypes.func.isRequired,
}

/**
 * Aba de listagem de cotações de peças no mobile.
 */
export function MobileAbaCotacoes({ cotacoes, onAbrir, onWhatsapp, onAprovar, onExcluir }) {
  if (cotacoes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#d0d5dd] p-8 text-center space-y-2">
        <ShareNetwork size={36} className="mx-auto text-[#98a2b3]" />
        <p className="text-sm font-extrabold text-[#101828]">Nenhuma cotação encontrada</p>
        <p className="text-xs text-[#667085]">
          Não há cotações cadastradas correspondentes aos critérios de busca.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cotacoes.map((cotacao) => (
        <CotacaoCard
          key={cotacao.id}
          cotacao={cotacao}
          onAbrir={onAbrir}
          onWhatsapp={onWhatsapp}
          onAprovar={onAprovar}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  )
}

MobileAbaCotacoes.propTypes = {
  cotacoes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAbrir: PropTypes.func.isRequired,
  onWhatsapp: PropTypes.func.isRequired,
  onAprovar: PropTypes.func.isRequired,
  onExcluir: PropTypes.func.isRequired,
}
