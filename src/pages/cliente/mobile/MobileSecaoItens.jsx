import React from 'react'
import { Check, Lock } from '@phosphor-icons/react'

/**
 * Linha individual de item de serviço/peça no layout mobile.
 */
function ItemRow({ item, isSelected, aprovado, onToggle }) {
  const isEssencial = item.tipo === 'essencial'
  return (
    <div
      className={`p-3 flex items-start gap-2.5 ${
        isSelected ? 'bg-white' : 'bg-[#fafafa] opacity-60'
      }`}
    >
      <button
        type="button"
        disabled={isEssencial || aprovado}
        onClick={onToggle}
        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          isEssencial
            ? 'bg-[#f2f4f7] text-[#667085] border border-[#d0d5dd]'
            : isSelected
            ? 'bg-[#0284c7] text-white'
            : 'border-2 border-[#d0d5dd] bg-white'
        }`}
      >
        {isEssencial ? (
          <Lock size={13} weight="bold" />
        ) : isSelected ? (
          <Check size={14} weight="bold" />
        ) : null}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs font-bold leading-snug ${
              isSelected ? 'text-[#101828]' : 'text-zinc-500 line-through'
            }`}
          >
            {item.nome}
          </span>
          {isEssencial ? (
            <span className="px-1.5 py-0.2 bg-[#e0f2fe] text-[#0284c7] text-[9px] font-bold rounded-full shrink-0">
              Essencial
            </span>
          ) : (
            <span className="px-1.5 py-0.2 bg-[#f2f4f7] text-[#475467] text-[9px] font-bold rounded-full shrink-0">
              Opcional
            </span>
          )}
        </div>
        <p className="text-[10.5px] text-[#667085] mt-0.5 leading-snug">
          {isEssencial ? item.motivoSeguranca : item.motivoOpcional}
        </p>
      </div>

      <span
        className={`text-xs font-extrabold shrink-0 ${
          isSelected ? 'text-[#101828]' : 'text-zinc-400 line-through'
        }`}
      >
        R$ {(item.preco * item.quantidade).toFixed(2)}
      </span>
    </div>
  )
}

/**
 * Seção de itens agrupados para o portal mobile.
 */
export function MobileSecaoItens({
  titulo,
  icone: Icone,
  itens,
  aprovado,
  itensMarcados,
  onToggleItem,
}) {
  if (!itens || itens.length === 0) return null

  return (
    <section className="bg-white border border-[#d0d5dd] rounded-2xl overflow-hidden shadow-2xs">
      <div className="px-3.5 py-2.5 bg-[#f8fafc] border-b border-[#e4e7ec] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icone size={15} weight="bold" className="text-[#0284c7]" />
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#101828]">
            {titulo}
          </h3>
        </div>
        <span className="text-[10.5px] font-bold text-[#667085]">{itens.length} itens</span>
      </div>
      <div className="divide-y divide-[#f2f4f7]">
        {itens.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            isSelected={itensMarcados.has(item.id)}
            aprovado={aprovado}
            onToggle={() => onToggleItem(item.id, item.tipo)}
          />
        ))}
      </div>
    </section>
  )
}
