import React from 'react'
import { Copy, ShareNetwork, CheckCircle, ArrowDownLeft } from '@phosphor-icons/react'

function ReposicaoCard({ item, onCotar, onEntrada }) {
  const isZerado = item.atual === 0
  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-mono font-black text-xs text-[#101828]">{item.codigo}</span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isZerado ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {item.atual} {item.unidade || 'UN'}
        </span>
      </div>
      <p className="text-sm font-extrabold text-[#101828] truncate">{item.nome}</p>
      <p className="text-[10.5px] text-[#667085] mt-0.5">
        {item.categoria} • {item.localizacao || 'Almoxarifado'}
      </p>

      <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
        <div className="bg-[#f8fafc] rounded-lg py-1.5">
          <span className="block text-[9px] uppercase font-bold text-[#98a2b3]">Mínimo</span>
          <span className="font-mono font-bold text-xs text-[#344054]">{item.min}</span>
        </div>
        <div className="bg-[#f8fafc] rounded-lg py-1.5">
          <span className="block text-[9px] uppercase font-bold text-[#98a2b3]">Déficit</span>
          <span className="font-mono font-bold text-xs text-rose-600">
            {item.deficit > 0 ? `-${item.deficit}` : '0'}
          </span>
        </div>
        <div className="bg-sky-50 rounded-lg py-1.5">
          <span className="block text-[9px] uppercase font-bold text-[#0369a1]">Sugestão</span>
          <span className="font-mono font-extrabold text-xs text-[#0284c7]">{item.sugestaoCompra}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
        <span className="text-[10.5px] text-[#667085]">Investimento estimado</span>
        <span className="font-mono font-bold text-sm text-[#101828]">R$ {item.custoEstimado?.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2.5">
        <button
          type="button"
          onClick={() => onEntrada?.(item)}
          className="h-9 rounded-lg bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowDownLeft size={13} weight="bold" />
          Entrada
        </button>
        <button
          type="button"
          onClick={() => onCotar?.(item)}
          className="h-9 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShareNetwork size={13} weight="bold" />
          Cotar
        </button>
      </div>
    </div>
  )
}

export function MobileAbaEstoqueReposicao({
  itensReposicao = [],
  totalInvestimento = '0,00',
  onCopiarLista,
  onCotarTodas,
  onCotarItem,
  onEntradaItem,
}) {
  return (
    <>
      <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3.5 mb-3 flex items-center justify-between">
        <div>
          <span className="block text-[10px] uppercase font-bold text-[#98a2b3]">Estimativa de Investimento</span>
          <span className="text-base font-black text-[#101828] font-mono">R$ {totalInvestimento}</span>
        </div>
        <button
          type="button"
          onClick={onCopiarLista}
          aria-label="Copiar Lista de Compras"
          className="w-10 h-10 rounded-xl border border-[#d0d5dd] text-[#344054] flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Copy size={16} weight="bold" />
        </button>
      </div>

      {itensReposicao.length > 0 && (
        <button
          type="button"
          onClick={onCotarTodas}
          className="w-full h-11 mb-3 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShareNetwork size={14} weight="bold" />
          Cotar Todas as Reposições ({itensReposicao.length})
        </button>
      )}

      {itensReposicao.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center mb-3">
            <CheckCircle size={22} weight="fill" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Almoxarifado com Níveis Adequados</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            Nenhum item está abaixo do estoque mínimo configurado.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {itensReposicao.map((item) => (
            <ReposicaoCard
              key={item.id}
              item={item}
              onCotar={onCotarItem}
              onEntrada={onEntradaItem}
            />
          ))}
        </div>
      )}
    </>
  )
}
