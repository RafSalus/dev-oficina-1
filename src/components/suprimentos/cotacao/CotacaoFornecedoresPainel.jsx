import React from 'react'
import Select from 'react-select'
import { Buildings, Plus } from '@phosphor-icons/react'
import { customSelectStyles } from '../customSelectStyles'
import { CotacaoFornecedorCard } from './CotacaoFornecedorCard'

/**
 * Painel "Autopeças e Fornecedores Participantes": inclusão de fornecedor e
 * comparativo das propostas.
 * @param {{
 *   fornecedores: object, itens: Array<object>, idCotacao: string,
 *   onDispararWhatsApp: Function, onCopiarWhatsApp: Function
 * }} props - `fornecedores` é o retorno de `useCotacaoFornecedores`.
 */
export function CotacaoFornecedoresPainel({ fornecedores, itens, idCotacao, onDispararWhatsApp, onCopiarWhatsApp }) {
  const acoesCard = { ...fornecedores, dispararWhatsApp: onDispararWhatsApp, copiarMensagemWhatsApp: onCopiarWhatsApp }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Buildings size={20} className="text-[#0284c7]" weight="bold" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Autopeças e Fornecedores Participantes ({fornecedores.fornecedoresCotados.length})
            </h2>
            <p className="text-xs text-slate-500">
              Envie a lista de peças via WhatsApp para as autopeças ou insira as propostas recebidas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <Select
              value={fornecedores.fornecedorParaAdicionar}
              onChange={fornecedores.setFornecedorParaAdicionar}
              options={fornecedores.opcoesDisponiveis}
              styles={customSelectStyles}
              placeholder="Incluir fornecedor..."
              isSearchable={true}
              noOptionsMessage={() => 'Todos os parceiros já foram adicionados'}
            />
          </div>
          <button
            type="button"
            onClick={fornecedores.adicionar}
            disabled={!fornecedores.fornecedorParaAdicionar}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} weight="bold" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {fornecedores.fornecedoresCotados.map((forn) => (
          <CotacaoFornecedorCard
            key={forn.id}
            fornecedor={forn}
            itens={itens}
            idCotacao={idCotacao}
            isVencedor={fornecedores.fornecedorVencedorId === forn.id}
            isExpandido={fornecedores.fornecedorExpandidoId === forn.id}
            acoes={acoesCard}
          />
        ))}
      </div>
    </div>
  )
}
