import React from 'react'
import PropTypes from 'prop-types'
import {
  Car,
  Plus,
} from '@phosphor-icons/react'

/**
 * Aba de demandas de peças geradas por Ordens de Serviço abertas.
 */
export function MobileAbaDemandas({
  demandas,
  demandasSelecionadas,
  onAlternarDemanda,
  onCotarDemanda,
  onCotarAgrupada,
}) {
  if (demandas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#d0d5dd] p-8 text-center space-y-2">
        <Car size={36} className="mx-auto text-[#98a2b3]" />
        <p className="text-sm font-extrabold text-[#101828]">Sem demandas pendentes</p>
        <p className="text-xs text-[#667085]">
          Todas as peças de ordens de serviço ativas já foram cotadas ou atendidas pelo estoque.
        </p>
      </div>
    )
  }

  const selecionouItens = demandasSelecionadas.length > 0

  return (
    <div className="space-y-3">
      {selecionouItens && (
        <div className="sticky top-2 z-10 bg-[#101828] text-white rounded-2xl p-3 shadow-lg flex items-center justify-between">
          <span className="text-xs font-bold">
            {demandasSelecionadas.length} {demandasSelecionadas.length === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
          <button
            type="button"
            onClick={onCotarAgrupada}
            className="h-8 px-3 rounded-lg bg-[#0284c7] hover:bg-[#0284c7]/90 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus size={13} weight="bold" />
            Cotar Agrupado
          </button>
        </div>
      )}

      {demandas.map((d) => {
        const isMarcada = demandasSelecionadas.includes(d.id)
        return (
          <div
            key={d.id}
            className={`bg-white rounded-2xl border p-3.5 shadow-sm transition-all ${
              isMarcada ? 'border-[#0284c7] bg-sky-50/20' : 'border-[#d0d5dd]'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isMarcada}
                onChange={() => onAlternarDemanda(d.id)}
                className="mt-1 w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7] border-gray-300"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-mono text-[10.5px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    OS #{d.numeroOS}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#101828]">
                    Qtd: {d.quantidadeNecessaria || 1} {d.unidade || 'UN'}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-[#101828] truncate">{d.itemNome}</p>
                <p className="text-[10.5px] text-[#667085] mt-0.5">
                  {d.veiculoModelo} • {d.veiculoPlaca}
                </p>
                {d.itemMarcaSugerida && (
                  <p className="text-[10px] text-[#98a2b3] mt-0.5">
                    Marca sugerida: {d.itemMarcaSugerida}
                  </p>
                )}

                <div className="mt-3 pt-2.5 border-t border-[#f2f4f7] flex justify-end">
                  <button
                    type="button"
                    onClick={() => onCotarDemanda(d)}
                    className="h-8 px-3 rounded-lg bg-[#f2f4f7] hover:bg-[#e4e7ec] text-[#101828] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Plus size={13} weight="bold" />
                    Cotar Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

MobileAbaDemandas.propTypes = {
  demandas: PropTypes.arrayOf(PropTypes.object).isRequired,
  demandasSelecionadas: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAlternarDemanda: PropTypes.func.isRequired,
  onCotarDemanda: PropTypes.func.isRequired,
  onCotarAgrupada: PropTypes.func.isRequired,
}
