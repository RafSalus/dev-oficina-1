import React from 'react'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import { DeslocamentoCardMobile } from './DeslocamentoCardMobile'

export function MobileListaDeslocamentos({
  deslocamentos,
  abaAtiva,
  onIniciar,
  onFinalizar,
  onDetalhes,
  onExcluir,
}) {
  if (deslocamentos.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <ArrowsLeftRight size={24} />
        </div>
        <p className="text-xs font-bold text-slate-800">
          {abaAtiva === 'roteiro'
            ? 'Nenhum deslocamento na fila de hoje'
            : 'Nenhum histórico arquivado'}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {abaAtiva === 'roteiro'
            ? 'Toque em "+ Novo" no topo para agendar uma missão.'
            : 'As missões finalizadas aparecerão aqui.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {deslocamentos.map((d) => (
        <DeslocamentoCardMobile
          key={d.id}
          deslocamento={d}
          onIniciar={onIniciar}
          onFinalizar={onFinalizar}
          onDetalhes={onDetalhes}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  )
}
