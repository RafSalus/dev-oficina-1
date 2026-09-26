import React from 'react'

export const inputClass =
  'w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]'

export const inputPlacaClass =
  'w-full text-xs p-2 rounded border border-slate-300 uppercase focus:outline-none focus:ring-1 focus:ring-[#0284c7]'

export const labelClass = 'block text-xs font-medium text-slate-700 mb-1'

export function TituloSecao({ icone: Icone, children }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
      <Icone size={16} className="text-[#0284c7]" weight="bold" />
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{children}</h3>
    </div>
  )
}
