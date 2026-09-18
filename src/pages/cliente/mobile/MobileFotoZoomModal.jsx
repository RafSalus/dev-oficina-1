import React from 'react'
import { X, Camera } from '@phosphor-icons/react'

export function MobileFotoZoomModal({ fotoZoom, onFechar }) {
  if (!fotoZoom) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div
        className="shrink-0 px-4 py-3 flex items-center justify-between bg-black/80"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Camera size={16} weight="bold" className="text-[#38bdf8] shrink-0" />
          <span className="font-bold text-xs text-white truncate">{fotoZoom.titulo}</span>
        </div>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="p-2 rounded-xl text-white active:bg-white/10 shrink-0"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <img src={fotoZoom.url} alt={fotoZoom.titulo} className="max-h-full max-w-full object-contain rounded-lg" />
      </div>

      <div
        className="shrink-0 p-4 bg-[#0f172a] text-xs text-zinc-300 leading-relaxed space-y-1.5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-extrabold text-white">Evidência do Diagnóstico</span>
          {fotoZoom.estadoPeca && (
            <span className="px-2 py-0.5 rounded-full bg-[#0284c7]/20 border border-[#0284c7]/40 text-[#38bdf8] text-[10px] font-bold shrink-0">
              {fotoZoom.estadoPeca}
            </span>
          )}
        </div>
        <p>{fotoZoom.descricao}</p>
      </div>
    </div>
  )
}
