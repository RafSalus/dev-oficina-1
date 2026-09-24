import React from 'react'
import { Printer, X } from '@phosphor-icons/react'
import { FolhaOrdemServicoImpressao } from '../dashboard/FolhaOrdemServicoImpressao'

/**
 * Modal para visualização e impressão da folha oficial de ordem de serviço (NFR17).
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {() => void} props.onClose - Callback para fechar o modal
 * @param {Object} props.dadosOS - Dados completos da ordem de serviço
 */
export function AprovacaoModalImpressao({ isOpen, onClose, dadosOS }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#525659] w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-3 bg-[#323639] text-white flex items-center justify-between shrink-0">
          <span className="text-xs font-bold font-mono">
            Folha Oficial de Impressão • Orçamento #{dadosOS?.numeroOS || 'N/D'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer size={15} weight="bold" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-[#525659]">
          <FolhaOrdemServicoImpressao formData={dadosOS} />
        </div>
      </div>
    </div>
  )
}
