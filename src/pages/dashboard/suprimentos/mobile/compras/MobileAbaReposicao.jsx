import React from 'react'
import PropTypes from 'prop-types'
import {
  Archive,
  Warning,
  Copy,
  Plus,
} from '@phosphor-icons/react'

/**
 * Aba de sugestões de reposição preventiva de estoque no mobile.
 */
export function MobileAbaReposicao({
  itensReposicao,
  onCotarReposicao,
  onCopiarWhatsApp,
}) {
  if (itensReposicao.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#d0d5dd] p-8 text-center space-y-2">
        <Archive size={36} className="mx-auto text-emerald-500" />
        <p className="text-sm font-extrabold text-[#101828]">Estoque Regularizado</p>
        <p className="text-xs text-[#667085]">
          Nenhuma peça do catálogo está operando abaixo do estoque mínimo.
        </p>
      </div>
    )
  }

  const investimentoEstimado = itensReposicao.reduce(
    (acc, it) => acc + (Number(it.quantidadeSugerida || 1) * Number(it.precoCusto || 0)),
    0
  )

  return (
    <div className="space-y-3">
      {/* Banner Resumo de Reposição */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            Investimento Estimado
          </span>
          <p className="text-base font-extrabold text-amber-900 mt-0.5">
            R$ {investimentoEstimado.toFixed(2)}
          </p>
          <p className="text-[10px] text-amber-700">
            {itensReposicao.length} {itensReposicao.length === 1 ? 'item crítico' : 'itens críticos'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onCotarReposicao}
            className="h-8 px-3 rounded-lg bg-[#101828] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus size={13} weight="bold" />
            Cotar Todos
          </button>
          <button
            type="button"
            onClick={onCopiarWhatsApp}
            className="h-7 px-2 rounded-lg border border-amber-300 text-amber-900 text-[10.5px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <Copy size={12} />
            Copiar Lista
          </button>
        </div>
      </div>

      {/* Lista de Peças para Reposição */}
      {itensReposicao.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl border border-[#d0d5dd] p-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-mono text-xs font-bold text-[#101828]">{item.codigo || item.id}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <Warning size={11} weight="bold" />
              Estoque: {item.estoqueAtual || 0} (Mín: {item.estoqueMinimo || 1})
            </span>
          </div>
          <p className="text-sm font-extrabold text-[#101828] truncate">{item.nome}</p>
          <p className="text-[10.5px] text-[#667085] mt-0.5">
            Local: {item.localizacao || 'Almoxarifado'} • Fornecedor habitual: {item.fornecedorPadraoNome || 'Geral'}
          </p>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
            <span className="text-[10.5px] text-[#667085]">
              Sugerido: <strong className="text-[#101828] font-bold">{item.quantidadeSugerida || 1} {item.unidade || 'UN'}</strong>
            </span>
            <span className="font-mono text-xs font-bold text-[#101828]">
              Custo est.: R$ {(Number(item.precoCusto || 0) * Number(item.quantidadeSugerida || 1)).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

MobileAbaReposicao.propTypes = {
  itensReposicao: PropTypes.arrayOf(PropTypes.object).isRequired,
  onCotarReposicao: PropTypes.func.isRequired,
  onCopiarWhatsApp: PropTypes.func.isRequired,
}
