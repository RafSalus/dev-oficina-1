import React from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { ITENS_CHECKLIST_ENTRADA } from '../../../../../constants/checklistItems'

export function MobileSecaoChecklist({
  checklistEntrada = {},
  onMarcarTodosConformes,
  onAtualizarItem,
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between bg-[#f0f9ff] p-2.5 rounded-xl border border-[#bae6fd]">
        <span className="text-xs font-bold text-[#0369a1]">
          Vistoria de Entrada ({ITENS_CHECKLIST_ENTRADA.length} Itens)
        </span>
        <button
          type="button"
          onClick={onMarcarTodosConformes}
          className="h-8 px-2.5 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
        >
          <Sparkle size={12} weight="fill" />
          <span>Todos OK</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {ITENS_CHECKLIST_ENTRADA.map((item) => {
          const itemState = checklistEntrada[item.id] || { status: '' }
          const isConforme = itemState.status === 'conforme'
          const isNao = itemState.status === 'nao_conforme'

          return (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isConforme
                  ? 'bg-[#f0f9ff] border-[#bae6fd]'
                  : isNao
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-white border-[#e4e7ec]'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-[#101828]">{item.label}</p>
                <p className="text-[10px] text-[#667085]">{item.desc}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onAtualizarItem?.(item.id, isConforme ? '' : 'conforme')
                  }
                  className={`h-7 px-2.5 rounded-lg text-xs font-bold cursor-pointer ${
                    isConforme ? 'bg-[#0284c7] text-white' : 'bg-[#f2f4f7] text-[#475467]'
                  }`}
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAtualizarItem?.(item.id, isNao ? '' : 'nao_conforme')
                  }
                  className={`h-7 px-2 rounded-lg text-xs font-bold cursor-pointer ${
                    isNao ? 'bg-rose-600 text-white' : 'bg-[#f2f4f7] text-[#475467]'
                  }`}
                >
                  Nao
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
