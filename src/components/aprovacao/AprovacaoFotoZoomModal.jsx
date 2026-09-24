import React from 'react'
import { X } from '@phosphor-icons/react'

/**
 * Modal de zoom/lightbox para imagens de evidência de peças (NFR17).
 *
 * @param {Object} props
 * @param {string|null} props.fotoUrl - URL da imagem a ampliar (ou null se fechado)
 * @param {() => void} props.onClose - Callback para fechar o zoom
 */
export function AprovacaoFotoZoomModal({ fotoUrl, onClose }) {
  if (!fotoUrl) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl max-h-[85vh] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
      >
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <img
          src={fotoUrl}
          alt="Ampliação da peça"
          className="w-full h-full object-contain max-h-[80vh]"
        />
      </div>
    </div>
  )
}
