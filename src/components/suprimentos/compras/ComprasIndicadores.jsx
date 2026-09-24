import React from 'react'
import { Clock, ShareNetwork, Car, CurrencyDollar, CheckCircle } from '@phosphor-icons/react'

function Indicador({ rotulo, valor, valorClassName, icone }) {
  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
      <div>
        <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
          {rotulo}
        </span>
        <span className={valorClassName}>{valor}</span>
      </div>
      {icone}
    </div>
  )
}

/**
 * Resumo de indicadores executivos da tela de Compras (sem verde - Regra 7).
 * @param {{metricas: object}} props - Resultado de `calcularMetricasCompras()`.
 */
export function ComprasIndicadores({ metricas }) {
  const temDemandas = metricas.demandasPendentes > 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100">
      <Indicador
        rotulo="Pedidos em Aberto"
        valor={metricas.pedidosEmAberto}
        valorClassName="text-base font-bold text-slate-900 font-mono"
        icone={<Clock size={20} className="text-slate-400" />}
      />
      <Indicador
        rotulo="Cotações Ativas"
        valor={`${metricas.cotacoesAtivas} em cotação`}
        valorClassName="text-base font-bold text-[#0284c7] font-mono"
        icone={<ShareNetwork size={20} className="text-[#0284c7]" />}
      />
      <Indicador
        rotulo="Demandas de OS"
        valor={`${metricas.demandasPendentes} itens`}
        valorClassName={`text-base font-bold ${temDemandas ? 'text-amber-600' : 'text-slate-900'}`}
        icone={<Car size={20} className={temDemandas ? 'text-amber-500' : 'text-slate-400'} />}
      />
      <Indicador
        rotulo="Total em Aberto"
        valor={`R$ ${metricas.valorEmAberto}`}
        valorClassName="text-base font-bold text-sky-700 font-mono"
        icone={<CurrencyDollar size={20} className="text-sky-600" />}
      />
      <Indicador
        rotulo="Total Recebido"
        valor={`R$ ${metricas.valorRecebidoTotal}`}
        valorClassName="text-base font-bold text-slate-900 font-mono"
        icone={<CheckCircle size={20} className="text-slate-400" />}
      />
    </div>
  )
}
