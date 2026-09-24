import React from 'react'
import { ShoppingCart, Plus, Package, Archive, ShareNetwork } from '@phosphor-icons/react'

const BOTAO_ATALHO =
  'inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer'

/**
 * Cabeçalho executivo da tela de Compras: título, contadores e ações principais (Regra 12).
 * Indicadores e abas entram como `children`, dentro do mesmo bloco branco.
 * @param {{
 *   totalPedidos: number, metricas: object, onIrPara: (rota: string) => void,
 *   onNovoPedido: Function, onNovaCotacao: Function, children: React.ReactNode
 * }} props
 */
export function ComprasHeader({ totalPedidos, metricas, onIrPara, onNovoPedido, onNovaCotacao, children }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
            <ShoppingCart size={22} weight="bold" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Compras e Cotações</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {totalPedidos} pedidos
              </span>
              {metricas.cotacoesAtivas > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  {metricas.cotacoesAtivas} cotações ativas
                </span>
              )}
              {metricas.demandasPendentes > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {metricas.demandasPendentes} demandas de OS
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Integração completa: Demandas de OS, cotação com autopeças, lista de peças, pedidos de compra e estoque
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onIrPara('estoque')}
            className={BOTAO_ATALHO}
            title="Acessar controle de Estoque e Almoxarifado"
          >
            <Archive size={16} className="text-slate-500" />
            <span className="hidden md:inline">Almoxarifado</span>
          </button>

          <button
            type="button"
            onClick={() => onIrPara('pecas')}
            className={BOTAO_ATALHO}
            title="Acessar catálogo de Peças e Produtos"
          >
            <Package size={16} className="text-slate-500" />
            <span className="hidden md:inline">Catálogo de Peças</span>
          </button>

          <button
            type="button"
            onClick={onNovoPedido}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            title="Registrar um pedido de compra direto de balcão (sem cotação)"
          >
            <Plus size={15} weight="bold" />
            <span>Novo Pedido Direto</span>
          </button>

          <button
            type="button"
            onClick={onNovaCotacao}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Criar nova cotação de peças com fornecedores parceiros"
          >
            <ShareNetwork size={16} weight="bold" />
            <span>Nova Cotação de Peças</span>
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
