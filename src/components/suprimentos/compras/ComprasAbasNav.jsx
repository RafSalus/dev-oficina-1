import React from 'react'
import { ListBullets, ShareNetwork, Car, Archive } from '@phosphor-icons/react'

const CONTADOR_NEUTRO = 'text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200'
const CONTADOR_ALERTA = 'text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold'

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

/**
 * Navegação entre as abas da tela de Compras (pedidos, cotações, demandas de OS, reposição).
 * @param {{
 *   abaAtiva: string, onSelecionar: (aba: string) => void, metricas: object,
 *   totalPedidos: number, totalCotacoes: number, totalReposicao: number
 * }} props
 */
export function ComprasAbasNav({ abaAtiva, onSelecionar, metricas, totalPedidos, totalCotacoes, totalReposicao }) {
  return (
    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100">
      <AbaBotao
        ativa={abaAtiva === 'pedidos'}
        onClick={() => onSelecionar('pedidos')}
        icone={<ListBullets size={15} weight="bold" />}
        rotulo="Pedidos de Compra"
      >
        <span className={CONTADOR_NEUTRO}>{totalPedidos}</span>
      </AbaBotao>

      <AbaBotao
        ativa={abaAtiva === 'cotacoes'}
        onClick={() => onSelecionar('cotacoes')}
        icone={<ShareNetwork size={15} weight="bold" />}
        rotulo="Cotações de Peças"
      >
        <span className={CONTADOR_NEUTRO}>{totalCotacoes}</span>
        {metricas.cotacoesAtivas > 0 && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-[#0284c7] font-bold">
            {metricas.cotacoesAtivas} ativas
          </span>
        )}
      </AbaBotao>

      <AbaBotao
        ativa={abaAtiva === 'demandas_os'}
        onClick={() => onSelecionar('demandas_os')}
        icone={<Car size={15} weight="bold" />}
        rotulo="Demandas das Ordens de Serviço"
      >
        {metricas.demandasPendentes > 0 && <span className={CONTADOR_ALERTA}>{metricas.demandasPendentes}</span>}
      </AbaBotao>

      <AbaBotao
        ativa={abaAtiva === 'reposicao'}
        onClick={() => onSelecionar('reposicao')}
        icone={<Archive size={15} weight="bold" />}
        rotulo="Reposição de Almoxarifado"
      >
        {totalReposicao > 0 && <span className={CONTADOR_ALERTA}>{totalReposicao}</span>}
      </AbaBotao>
    </div>
  )
}
