import React from 'react'
import { toast } from 'sonner'
import { ITENS_PREVENTIVOS_CATALOGO } from '../../../../constants/mockManutencaoPreventiva'

export function AbaCampanhasOportunidades({
  veiculosAvaliados,
  setFiltroServico,
  setAbaAtiva,
}) {
  return (
    <div className="h-full overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {ITENS_PREVENTIVOS_CATALOGO.map((item) => {
          // Descobre quantos veículos estão vencidos ou em atenção para este serviço específico
          const alvosVencidos = veiculosAvaliados.filter((vSaude) => {
            const itemAval = vSaude.itensAvaliados.find((i) => i.id === item.id)
            return itemAval && itemAval.status === 'vencido'
          })
          const alvosAtencao = veiculosAvaliados.filter((vSaude) => {
            const itemAval = vSaude.itensAvaliados.find((i) => i.id === item.id)
            return itemAval && itemAval.status === 'atencao'
          })

          const totalAlvos = alvosVencidos.length + alvosAtencao.length
          const receitaItem = totalAlvos * item.valorEstimadoMedio

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#d0d5dd] p-4.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.categoria}
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                    R$ {item.valorEstimadoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 mt-2">{item.nome}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.descricao}</p>

                {/* Alvos e Oportunidades */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Vencidos Imediatos:</span>
                    <strong className="text-amber-700 font-extrabold text-sm font-mono">
                      {alvosVencidos.length} veículos
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Vencem em Breve:</span>
                    <strong className="text-sky-700 font-extrabold text-sm font-mono">
                      {alvosAtencao.length} veículos
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Potencial Total:</span>
                  <strong className="text-slate-900 font-black font-mono text-sm">
                    R$ {receitaItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFiltroServico(item.id)
                    setAbaAtiva('frota')
                    toast.info(`Filtrando veículos com oportunidade em ${item.nome}`)
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-300"
                >
                  Ver Alvos ({totalAlvos})
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
