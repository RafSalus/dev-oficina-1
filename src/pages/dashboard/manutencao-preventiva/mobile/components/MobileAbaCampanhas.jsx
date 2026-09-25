import React from 'react'
import { ITENS_PREVENTIVOS_CATALOGO } from '../../../../../constants/mockManutencaoPreventiva'

export function MobileAbaCampanhas({ veiculosAvaliados }) {
  return (
    <div className="space-y-3">
      {ITENS_PREVENTIVOS_CATALOGO.map((item) => {
        const alvos = veiculosAvaliados.filter((vSaude) => {
          const itemAval = vSaude.itensAvaliados.find((i) => i.id === item.id)
          return itemAval && itemAval.status !== 'em_dia'
        })

        return (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {item.categoria}
              </span>
              <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                R$ {item.valorEstimadoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{item.nome}</h4>
            <p className="text-[11px] text-slate-500">{item.descricao}</p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">
                Veículos que precisam deste serviço:
              </span>
              <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {alvos.length} carros
              </strong>
            </div>
          </div>
        )
      })}
    </div>
  )
}
