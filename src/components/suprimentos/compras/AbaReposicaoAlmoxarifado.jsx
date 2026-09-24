import React from 'react'
import { Archive, CheckCircle, ShareNetwork, ShoppingCart } from '@phosphor-icons/react'

/**
 * Aba "Reposição de Almoxarifado": peças no estoque mínimo ou abaixo dele,
 * com cotação individual, cotação de todas e compra direta.
 * @param {{itens: Array<object>, onCotar: Function, onCotarTodas: Function, onCompraDireta: Function}} props
 */
export function AbaReposicaoAlmoxarifado({ itens, onCotar, onCotarTodas, onCompraDireta }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Archive size={18} className="text-[#0284c7]" />
            <span>Reposição de Almoxarifado</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Itens com estoque abaixo ou no nível mínimo necessário para operação da oficina
          </p>
        </div>

        {itens.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCotarTodas}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Abrir tela dedicada para cotar todas as peças com necessidade de reposição"
            >
              <ShareNetwork size={15} weight="bold" />
              <span>Cotar Todas as Reposições ({itens.length})</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {itens.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} weight="fill" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Almoxarifado em Nível Adequado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Nenhuma peça do catálogo atingiu o nível mínimo de reposição.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Código SKU</th>
                  <th className="py-3 px-4">Peça ou Produto</th>
                  <th className="py-3 px-4 text-center">Estoque Atual</th>
                  <th className="py-3 px-4 text-center">Estoque Mínimo</th>
                  <th className="py-3 px-4 text-center">Déficit</th>
                  <th className="py-3 px-4 text-center">Sugestão de Compra</th>
                  <th className="py-3 px-4 text-right">Custo Estimado</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {itens.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{item.codigo}</td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.nome}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.categoria} • Local: {item.localizacao || 'Almoxarifado Central'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          item.atual === 0
                            ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                            : 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                        }`}
                      >
                        {item.atual} {item.unidade || 'UN'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {item.min} {item.unidade || 'UN'}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-rose-600 font-bold">
                      {item.deficit > 0 ? `-${item.deficit}` : '0'}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-extrabold text-[#0284c7]">
                      {item.sugestao} {item.unidade || 'UN'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      R$ {Number(item.custoTotal || 0).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => onCotar(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          title="Cotar peça de reposição com autopeças"
                        >
                          <ShareNetwork size={13} weight="bold" />
                          <span>Cotar Reposição</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onCompraDireta(item)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Comprar reposição direto no balcão sem cotação"
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
