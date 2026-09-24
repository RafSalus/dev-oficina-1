import React, { useState } from 'react'
import { Package, Plus, Trash, Tag, ListBullets } from '@phosphor-icons/react'
import { CotacaoNovoItemForm, FORM_NOVO_ITEM_VAZIO } from './CotacaoNovoItemForm'

/**
 * Painel "Lista de Peças que Estão em Cotação": recarga das peças da OS,
 * inclusão rápida de peça e tabela com remoção.
 * @param {{
 *   itens: Array<object>, temOS: boolean, onRecarregarDaOS: Function,
 *   onAdicionar: (form: object) => boolean, onRemover: (itemId: string) => void
 * }} props
 */
export function CotacaoItensPainel({ itens, temOS, onRecarregarDaOS, onAdicionar, onRemover }) {
  const [mostrarNovoItem, setMostrarNovoItem] = useState(false)
  const [formNovoItem, setFormNovoItem] = useState(FORM_NOVO_ITEM_VAZIO)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-[#0284c7]" weight="bold" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Lista de Peças que Estão em Cotação ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
            </h2>
            <p className="text-xs text-slate-500">Peças demandadas pelo diagnóstico para envio às autopeças parceiras</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {temOS && (
            <button
              type="button"
              onClick={onRecarregarDaOS}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-[#0284c7] bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Recarregar todas as peças desta Ordem de Serviço"
            >
              <ListBullets size={15} />
              <span>Recarregar Peças da OS</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMostrarNovoItem(!mostrarNovoItem)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Plus size={15} weight="bold" />
            <span>Adicionar Peça à Cotação</span>
          </button>
        </div>
      </div>

      {mostrarNovoItem && (
        <CotacaoNovoItemForm
          form={formNovoItem}
          setForm={setFormNovoItem}
          onAdicionar={onAdicionar}
          onFechar={() => setMostrarNovoItem(false)}
        />
      )}

      {itens.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <Package size={32} className="text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">Nenhuma peça cadastrada nesta cotação</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Selecione uma Ordem de Serviço acima para puxar os itens automaticamente ou clique em "Adicionar Peça à Cotação".
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Código SKU</th>
                <th className="py-3 px-4">Peça / Descrição</th>
                <th className="py-3 px-4 text-center">Qtd / Unidade</th>
                <th className="py-3 px-4">Marca Sugerida</th>
                <th className="py-3 px-4">Observação Técnica</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {itens.map((it, idx) => (
                <tr key={it.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{it.codigo || 'S/N'}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{it.nome}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#0284c7]">
                    {it.quantidade} {it.unidade}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {it.marcaSugerida ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
                        <Tag size={12} className="text-slate-400" />
                        <span>{it.marcaSugerida}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Original / Primeira Linha</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-sm truncate">{it.observacoes || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onRemover(it.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remover peça desta cotação"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
