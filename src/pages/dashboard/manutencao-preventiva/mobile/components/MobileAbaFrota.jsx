import React from 'react'
import { ShieldCheck } from '@phosphor-icons/react'
import { VeiculoCardMobile } from './VeiculoCardMobile'

export function MobileAbaFrota({
  veiculos,
  onDetalhes,
  onAtualizarKm,
  onCriarOS,
  onWhatsApp,
}) {
  if (veiculos.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <ShieldCheck size={24} />
        </div>
        <p className="text-xs font-bold text-slate-800">Nenhum veículo encontrado</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Tente alterar os termos da busca acima.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {veiculos.map((vSaude) => (
        <VeiculoCardMobile
          key={vSaude.placa}
          vSaude={vSaude}
          onDetalhes={onDetalhes}
          onAtualizarKm={onAtualizarKm}
          onCriarOS={onCriarOS}
          onWhatsApp={onWhatsApp}
        />
      ))}
    </div>
  )
}
