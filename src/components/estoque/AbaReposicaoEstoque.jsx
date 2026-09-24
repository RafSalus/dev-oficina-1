import React from 'react'
import { ShoppingCart, ShareNetwork, Copy, CheckCircle, ArrowDownLeft } from '@phosphor-icons/react'

function ReposicaoLinha({ item, acoes }) {
  const unidade = item.unidade || 'UN'
  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="py-3 px-4 font-mono font-semibold text-slate-900">{item.codigo}</td>
      <td className="py-3 px-4">
        <div className="font-semibold text-slate-900">{item.nome}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {item.categoria} • Local: {item.localizacao || 'Almoxarifado'}
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
          {item.atual} {unidade}
        </span>
      </td>
      <td className="py-3 px-4 text-center font-mono text-slate-600">
        {item.min} {unidade}
      </td>
      <td className="py-3 px-4 text-center font-mono text-rose-600 font-semibold">
        {item.deficit > 0 ? `-${item.deficit}` : '0'}
      </td>
      <td className="py-3 px-4 text-center font-mono font-extrabold text-[#0284c7]">
        {item.sugestaoCompra} {unidade}
      </td>
      <td className="py-3 px-4 text-right font-mono text-slate-600">R$ {Number(item.precoCusto || 0).toFixed(2)}</td>
      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">R$ {item.custoEstimado.toFixed(2)}</td>
      <td className="py-3 px-4 text-slate-700 text-[11px]">{item.fornecedorPreferencial || '—'}</td>
      <td className="py-3 px-4 text-right">
        <div className="inline-flex items-center gap-1.5 justify-end">
          <button
            type="button"
            onClick={() => acoes.cotarReposicao(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
            title="Abrir tela dedicada para cotar reposição deste item"
          >
            <ShareNetwork size={13} weight="bold" />
            <span>Cotar Reposição</span>
          </button>
          <button
            type="button"
            onClick={() => acoes.abrirMovimento(item)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
            title="Registrar entrada imediata deste item"
          >
            <ArrowDownLeft size={13} weight="bold" />
            <span>Entrada</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

/**
 * Aba "Sugestão de Reposição e Compras": itens no mínimo ou abaixo, investimento estimado,
 * cotação (individual ou de todos), cópia da lista e entrada imediata.
 * @param {{estoque: object}} props - Retorno de `useEstoqueWorkflow()`.
 */
export function AbaReposicaoEstoque({ estoque }) {
  const { itensReposicao, investimentoReposicao, acoes } = estoque

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#0284c7]" />
            <span>Lista Sugerida para Cotação e Reposição de Estoque</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Itens com saldo igual ou abaixo do estoque mínimo estabelecido para operação da oficina
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-semibold text-slate-400">Estimativa de Investimento</span>
            <span className="text-sm font-bold text-slate-900 font-mono">R$ {investimentoReposicao}</span>
          </div>

          {itensReposicao.length > 0 && (
            <button
              type="button"
              onClick={acoes.cotarTodasReposicoes}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Abrir tela dedicada para cotar todas as peças sugeridas para reposição"
            >
              <ShareNetwork size={15} weight="bold" />
              <span>Cotar Todas as Reposições ({itensReposicao.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={acoes.copiarListaReposicao}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Copiar lista de compras para orçamento via WhatsApp"
          >
            <Copy size={15} />
            <span>Copiar Lista de Compras</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {itensReposicao.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} weight="fill" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Almoxarifado com Níveis Adequados</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Nenhum item do catálogo está abaixo ou no nível de estoque mínimo configurado.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Código / SKU</th>
                  <th className="py-3 px-4">Peça ou Produto</th>
                  <th className="py-3 px-4 text-center">Estoque Atual</th>
                  <th className="py-3 px-4 text-center">Estoque Mínimo</th>
                  <th className="py-3 px-4 text-center">Déficit</th>
                  <th className="py-3 px-4 text-center">Sugestão de Compra</th>
                  <th className="py-3 px-4 text-right">Custo Unit.</th>
                  <th className="py-3 px-4 text-right">Investimento Estimado</th>
                  <th className="py-3 px-4">Fornecedor Preferencial</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {itensReposicao.map((item) => (
                  <ReposicaoLinha key={item.id} item={item} acoes={acoes} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
