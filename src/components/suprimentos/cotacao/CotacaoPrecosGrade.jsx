import React from 'react'

const INPUT_GRADE =
  'w-full h-8 px-2 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none'
const INPUT_CONDICAO =
  'w-full h-8.5 px-3 rounded border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none'

/**
 * Grade de preenchimento dos preços unitários, marcas, prazo e condição de
 * pagamento propostos por um fornecedor.
 * @param {{
 *   fornecedor: object, itens: Array<object>,
 *   onAtualizarPreco: (fornecedorId: string, itemId: string, campo: 'preco'|'marca', valor: string) => void,
 *   onAtualizarDados: (fornecedorId: string, campo: string, valor: string) => void
 * }} props
 */
export function CotacaoPrecosGrade({ fornecedor, itens, onAtualizarPreco, onAtualizarDados }) {
  return (
    <div className="mt-4 pt-3 border-t border-slate-200 space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          Preços unitários e marcas informadas por {fornecedor.nome}:
        </span>
        <span className="text-[11px] text-slate-400">
          Preencha os valores passados por telefone ou consulte as respostas do link
        </span>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
              <th className="py-2.5 px-3">Peça em Cotação</th>
              <th className="py-2.5 px-3 text-center">Qtd</th>
              <th className="py-2.5 px-3">Marca Ofertada</th>
              <th className="py-2.5 px-3 w-36 text-right">Preço Unitário (R$)</th>
              <th className="py-2.5 px-3 w-36 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {itens.map((it) => {
              const resp = fornecedor.respostasItens?.[it.id] || {}
              const precoUnit = resp.preco || ''
              const subtotal =
                precoUnit && !isNaN(Number(precoUnit)) ? Number(precoUnit) * Number(it.quantidade || 1) : 0

              return (
                <tr key={it.id}>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {it.nome}
                    {it.codigo && <span className="text-[10px] text-slate-400 block font-mono">{it.codigo}</span>}
                  </td>

                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                    {it.quantidade} {it.unidade}
                  </td>

                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={resp.marca || ''}
                      onChange={(e) => onAtualizarPreco(fornecedor.id, it.id, 'marca', e.target.value)}
                      placeholder={it.marcaSugerida || 'Ex: Nakata / Viemar'}
                      className={INPUT_GRADE}
                    />
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={precoUnit}
                      onChange={(e) => onAtualizarPreco(fornecedor.id, it.id, 'preco', e.target.value)}
                      placeholder="0,00"
                      className="w-full h-8 px-2 rounded border border-slate-200 text-xs font-mono font-bold text-right text-slate-900 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
                    />
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">R$ {subtotal.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Prazo de Entrega</label>
          <input
            type="text"
            value={fornecedor.tempoEntrega || ''}
            onChange={(e) => onAtualizarDados(fornecedor.id, 'tempoEntrega', e.target.value)}
            placeholder="Ex: 45 minutos (Motoboy)"
            className={INPUT_CONDICAO}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Condição de Pagamento</label>
          <input
            type="text"
            value={fornecedor.condicaoPagamento || ''}
            onChange={(e) => onAtualizarDados(fornecedor.id, 'condicaoPagamento', e.target.value)}
            placeholder="Ex: Boleto 28 Dias ou PIX com 5% desconto"
            className={INPUT_CONDICAO}
          />
        </div>
      </div>
    </div>
  )
}
