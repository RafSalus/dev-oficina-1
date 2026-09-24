import React from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

/**
 * Campo de busca textual das barras de filtro da tela de Compras.
 * @param {{valor: string, onChange: (valor: string) => void, placeholder: string}} props
 */
export function CampoBusca({ valor, onChange, placeholder }) {
  return (
    <div className="relative flex-1 w-full">
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
      />
      <MagnifyingGlass
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  )
}
