import React, { useEffect, useState } from 'react'
import { X, FloppyDisk, Copy, Check, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function MobileLaudoTecnicoModal({ isOpen, texto, onSalvar, onFechar, onRegenerar }) {
  const [rascunho, setRascunho] = useState(texto || '')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (isOpen) setRascunho(texto || '')
  }, [isOpen, texto])

  if (!isOpen) return null

  const handleSalvar = () => {
    onSalvar(rascunho)
    toast.success('Laudo técnico salvo!')
  }

  const handleRegenerar = () => {
    setRascunho(onRegenerar())
    toast.success('Laudo técnico regenerado!')
  }

  const handleCopiar = () => {
    if (!rascunho) return
    navigator.clipboard.writeText(rascunho)
    setCopiado(true)
    toast.success('Laudo técnico copiado!')
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header
        className="shrink-0 border-b border-[#e4e7ec]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>

          <span className="text-sm font-extrabold text-[#101828] truncate">Laudo Técnico</span>

          <button
            type="button"
            onClick={handleSalvar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black active:bg-zinc-800 text-white text-xs font-bold transition-colors shrink-0"
          >
            <FloppyDisk size={14} weight="bold" />
            <span>Salvar</span>
          </button>
        </div>

        <div className="px-3 pb-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerar}
            className="flex-1 h-9 rounded-lg bg-[#e0f2fe] text-[#0369a1] text-[11px] font-bold flex items-center justify-center gap-1.5"
          >
            <ArrowsClockwise size={13} weight="bold" />
            <span>Regenerar</span>
          </button>
          <button
            type="button"
            onClick={handleCopiar}
            className="h-9 px-3.5 rounded-lg border border-[#d0d5dd] text-[11px] font-bold text-[#344054] flex items-center gap-1.5"
          >
            {copiado ? <Check size={13} className="text-[#0284c7]" /> : <Copy size={13} />}
            <span>Copiar</span>
          </button>
        </div>
      </header>

      <textarea
        value={rascunho}
        onChange={(e) => setRascunho(e.target.value)}
        placeholder="Escreva o laudo técnico..."
        autoFocus
        className="flex-1 w-full px-4 py-4 text-[15px] leading-[1.7] text-[#101828] placeholder-[#98a2b3] focus:outline-none resize-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      />
    </div>
  )
}
