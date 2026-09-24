import React from 'react'
import {
  Package,
  Plus,
  ArrowsLeftRight,
  Archive,
  WarningCircle,
  CurrencyDollar,
  TrendUp,
  ShoppingCart,
  ClockCounterClockwise,
  ListBullets,
} from '@phosphor-icons/react'

function Indicador({ rotulo, valor, valorClassName, icone }) {
  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
      <div>
        <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">{rotulo}</span>
        <span className={valorClassName}>{valor}</span>
      </div>
      {icone}
    </div>
  )
}

function AbaBotao({ ativa, onClick, icone, rotulo, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
        ativa
          ? 'bg-sky-50 text-[#0284c7] border border-sky-200 shadow-2xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {icone}
      <span>{rotulo}</span>
      {children}
    </button>
  )
}

const plural = (n) => `${n} ${n === 1 ? 'item' : 'itens'}`

/**
 * Cabeçalho do Estoque: título, ações (catálogo, nova peça, movimentar), indicadores
 * (sem verde - Regra 7) e abas Posição / Kardex / Reposição.
 * @param {{estoque: object}} props - Retorno de `useEstoqueWorkflow()`.
 */
export function EstoqueHeader({ estoque }) {
  const { metricas, abaAtiva, setAbaAtiva, acoes } = estoque
  const temAlerta = metricas.itensAbaixoMinimo > 0
  const temZerados = metricas.itensZerados > 0

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center border border-sky-100 shrink-0">
            <Archive size={22} weight="bold" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Estoque e Almoxarifado</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {metricas.totalItens} itens
              </span>
              {metricas.itensReposicaoTotal > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {metricas.itensReposicaoTotal} repor
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Inventário físico, movimentações auditadas de entrada e saída, localização e sugestão de reposição
            </p>
          </div>
        </div>

        {/* Botões de ação únicos e não redundantes (Regra 12) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => acoes.irPara('pecas')}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Acessar catálogo completo de Peças e Produtos"
          >
            <Package size={16} className="text-slate-500" />
            <span className="hidden md:inline">Catálogo de Peças</span>
          </button>

          <button
            type="button"
            onClick={() => acoes.abrirPeca()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Cadastrar nova peça no almoxarifado"
          >
            <Plus size={16} weight="bold" className="text-sky-600" />
            <span>Nova Peça</span>
          </button>

          <button
            type="button"
            onClick={() => acoes.abrirMovimento()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Registrar entrada, saída ou ajuste de inventário"
          >
            <ArrowsLeftRight size={16} weight="bold" />
            <span>Movimentar Estoque</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100">
        <Indicador
          rotulo="Unidades Físicas"
          valor={`${metricas.totalUnidades} un`}
          valorClassName="text-base font-bold text-slate-900 font-mono"
          icone={<Package size={20} className="text-slate-400" />}
        />
        <Indicador
          rotulo="Valor em Estoque (Custo)"
          valor={`R$ ${metricas.valorCustoTotal}`}
          valorClassName="text-base font-bold text-slate-900 font-mono"
          icone={<CurrencyDollar size={20} className="text-slate-400" />}
        />
        <Indicador
          rotulo="Potencial de Venda"
          valor={`R$ ${metricas.valorVendaTotal}`}
          valorClassName="text-base font-bold text-sky-700 font-mono"
          icone={<TrendUp size={20} className="text-sky-600" />}
        />
        <Indicador
          rotulo="Alerta de Reposição"
          valor={plural(metricas.itensAbaixoMinimo)}
          valorClassName={`text-base font-bold ${temAlerta ? 'text-amber-600' : 'text-slate-900'}`}
          icone={<WarningCircle size={20} className={temAlerta ? 'text-amber-500' : 'text-slate-400'} />}
        />
        <Indicador
          rotulo="Itens Zerados"
          valor={plural(metricas.itensZerados)}
          valorClassName={`text-base font-bold ${temZerados ? 'text-rose-600' : 'text-slate-900'}`}
          icone={<WarningCircle size={20} className={temZerados ? 'text-rose-500' : 'text-slate-400'} />}
        />
      </div>

      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100">
        <AbaBotao
          ativa={abaAtiva === 'posicao'}
          onClick={() => setAbaAtiva('posicao')}
          icone={<ListBullets size={15} weight="bold" />}
          rotulo="Posição do Almoxarifado"
        >
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200">
            {estoque.pecasFiltradas.length}
          </span>
        </AbaBotao>

        <AbaBotao
          ativa={abaAtiva === 'kardex'}
          onClick={() => setAbaAtiva('kardex')}
          icone={<ClockCounterClockwise size={15} weight="bold" />}
          rotulo="Histórico de Movimentações (Kardex)"
        >
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200">
            {estoque.movimentacoes.length}
          </span>
        </AbaBotao>

        <AbaBotao
          ativa={abaAtiva === 'reposicao'}
          onClick={() => setAbaAtiva('reposicao')}
          icone={<ShoppingCart size={15} weight="bold" />}
          rotulo="Sugestão de Reposição e Compras"
        >
          {estoque.itensReposicao.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
              {estoque.itensReposicao.length}
            </span>
          )}
        </AbaBotao>
      </div>
    </div>
  )
}
