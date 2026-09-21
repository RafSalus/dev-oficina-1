import React, { useEffect } from 'react'
import { WarningCircle, Trash, CheckCircle, Info } from '@phosphor-icons/react'

/**
 * ModalConfirmacao
 * Componente unificado para diálogos de confirmação de interações críticas
 * (exclusão, cancelamento, descarte de alterações, aprovação rápida e reset).
 * Renderiza rigorosamente na frente da tela/formulário ativo (z-[120]),
 * respeitando as Regras 8 e 16 do SYSTEM_RULES.md.
 */
export function ModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  titulo = 'Confirmar Ação',
  descricao,
  itemDestaque,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'perigo', // 'perigo' | 'aviso' | 'info' | 'primario'
  icone: IconeCustom,
  carregando = false,
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Configuração visual da variante
  const configVariante = {
    perigo: {
      iconeBg: 'bg-rose-50 border-rose-200 text-rose-600',
      iconePadrao: Trash,
      botaoConfirmar: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    },
    aviso: {
      iconeBg: 'bg-amber-50 border-amber-200 text-amber-600',
      iconePadrao: WarningCircle,
      botaoConfirmar: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
    },
    primario: {
      iconeBg: 'bg-sky-50 border-sky-200 text-[#0284c7]',
      iconePadrao: CheckCircle,
      botaoConfirmar: 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xs',
    },
    info: {
      iconeBg: 'bg-slate-100 border-slate-200 text-[#101828]',
      iconePadrao: Info,
      botaoConfirmar: 'bg-[#101828] hover:bg-slate-800 text-white shadow-xs',
    },
  }[variante] || {
    iconeBg: 'bg-rose-50 border-rose-200 text-rose-600',
    iconePadrao: Trash,
    botaoConfirmar: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
  }

  const IconeExibicao = IconeCustom || configVariante.iconePadrao

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 select-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-4 flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${configVariante.iconeBg}`}
          >
            <IconeExibicao size={22} weight="bold" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-base font-extrabold text-[#101828] leading-tight">
              {titulo}
            </h4>

            {descricao && (
              <p className="text-xs text-[#475467] mt-1.5 leading-relaxed">
                {descricao}
              </p>
            )}

            {itemDestaque && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#f8fafc] border border-[#eaecf0] text-xs font-semibold text-[#101828]">
                {itemDestaque}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#f8fafc] border-t border-[#eaecf0] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={carregando}
            className="h-9 px-4 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] text-[#344054] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm?.()
            }}
            disabled={carregando}
            className={`h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50 ${configVariante.botaoConfirmar}`}
          >
            <span>{textoConfirmar}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
