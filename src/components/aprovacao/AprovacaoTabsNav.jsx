import React from 'react'
import { Camera, FileText, Receipt } from '@phosphor-icons/react'

/**
 * Barra de navegação por abas responsiva e touch-friendly (NFR17).
 *
 * @param {Object} props
 * @param {'orcamento'|'laudo'|'fotos'} props.activeTab - Aba ativa
 * @param {(tab: 'orcamento'|'laudo'|'fotos') => void} props.setActiveTab - Setter da aba ativa
 * @param {number} [props.fotosCount=0] - Quantidade de fotos disponíveis
 */
export function AprovacaoTabsNav({ activeTab, setActiveTab, fotosCount = 0 }) {
  return (
    <div className="bg-white border-b border-[#d0d5dd] sticky top-[57px] z-20 shadow-xs px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 overflow-x-auto py-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('orcamento')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'orcamento'
              ? 'bg-[#101828] text-white shadow-xs'
              : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7]'
          }`}
        >
          <Receipt size={16} weight="bold" />
          <span>Orçamento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('laudo')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'laudo'
              ? 'bg-[#101828] text-white shadow-xs'
              : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7]'
          }`}
        >
          <FileText size={16} weight="bold" />
          <span>Laudo Técnico</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fotos')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'fotos'
              ? 'bg-[#101828] text-white shadow-xs'
              : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7]'
          }`}
        >
          <Camera size={16} weight="bold" />
          <span>Peças com Fotos</span>
          {fotosCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#0284c7] text-white">
              {fotosCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
