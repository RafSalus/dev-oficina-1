import React from 'react'
import Select from 'react-select'
import { Plus, ShareNetwork } from '@phosphor-icons/react'
import { customSelectStyles } from '../customSelectStyles'
import { CampoBusca } from './CampoBusca'
import { CotacaoResumoCard } from './CotacaoResumoCard'

const OPCOES_STATUS_COTACAO = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'EM_COTACAO', label: 'Em Cotação (Aguardando)' },
  { value: 'RESPONDIDA', label: 'Propostas Recebidas' },
  { value: 'APROVADA', label: 'Aprovada e Convertida' },
]

/**
 * Aba "Cotações de Peças": filtros e lista de cotações com fornecedores.
 * @param {{
 *   cotacoes: Array<object>, filtros: object, onNovaCotacao: Function,
 *   onVisualizar: Function, onCopiarWhatsApp: Function, onAbrir: Function,
 *   onAprovar: Function, onExcluir: Function
 * }} props
 */
export function AbaCotacoesPecas({ cotacoes, filtros, onNovaCotacao, ...acoesCard }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        <CampoBusca
          valor={filtros.buscaCotacoes}
          onChange={filtros.setBuscaCotacoes}
          placeholder="Buscar por código de cotação, veículo, placa, cliente, OS ou nome da peça..."
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-56">
            <Select
              value={OPCOES_STATUS_COTACAO.find((opt) => opt.value === filtros.filtroStatusCotacao)}
              onChange={filtros.selecionarStatusCotacao}
              options={OPCOES_STATUS_COTACAO}
              styles={customSelectStyles}
              placeholder="Status da Cotação"
              isSearchable={false}
            />
          </div>

          <button
            type="button"
            onClick={onNovaCotacao}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus size={15} weight="bold" />
            <span>Nova Cotação</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar p-6 space-y-4">
        {cotacoes.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShareNetwork size={24} />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Nenhuma cotação de peças localizada</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filtros.buscaCotacoes || filtros.filtroStatusCotacao !== 'TODOS'
                ? 'Nenhuma cotação corresponde aos critérios de pesquisa selecionados.'
                : 'Inicie uma nova cotação ou envie as peças de uma Ordem de Serviço.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cotacoes.map((cotacao) => (
              <CotacaoResumoCard key={cotacao.id} cotacao={cotacao} {...acoesCard} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
