import React from 'react'
import { CheckCircle, Plus, ShoppingCart, ShareNetwork, Car } from '@phosphor-icons/react'
import { CampoBusca } from './CampoBusca'

const CHECKBOX = 'w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer'

function DemandaLinha({ demanda, selecionado, onAlternar, onCatalogar, onCotar, onCompraDireta }) {
  return (
    <tr className={`hover:bg-slate-50/70 transition-colors ${selecionado ? 'bg-sky-50/40' : ''}`}>
      <td className="py-3 px-4 text-center">
        <input type="checkbox" checked={selecionado} onChange={() => onAlternar(demanda.id)} className={CHECKBOX} />
      </td>

      <td className="py-3 px-4">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <span>OS #{demanda.numeroOS}</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
            {demanda.veiculoPlaca}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {demanda.veiculoModelo} • {demanda.clienteNome}
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="font-semibold text-slate-900">{demanda.itemNome}</div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
          <span>Código: {demanda.itemCodigo}</span>
          {demanda.itemMarcaSugerida && <span>• Marca sugerida: {demanda.itemMarcaSugerida}</span>}
        </div>
      </td>

      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
        {demanda.quantidadeNecessaria} {demanda.unidade}
      </td>

      <td className="py-3 px-4 text-center font-mono">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
            demanda.estoqueAtual > 0
              ? 'bg-sky-50 text-sky-800 border border-sky-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {demanda.estoqueAtual} {demanda.unidade}
        </span>
      </td>

      <td className="py-3 px-4 text-center">
        {demanda.cadastradoNoCatalogo ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-[#0284c7] border border-sky-200">
            <CheckCircle size={12} weight="bold" />
            <span>Catalogado</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onCatalogar(demanda)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Item não está no catálogo. Clique para cadastrar agora."
          >
            <Plus size={11} weight="bold" />
            <span>Item Avulso (Catalogar)</span>
          </button>
        )}
      </td>

      <td className="py-3 px-4 text-right">
        <div className="inline-flex items-center gap-1.5 justify-end">
          <button
            type="button"
            onClick={() => onCotar(demanda)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
            title="Abrir a tela de cotação com a lista de peças desta OS"
          >
            <ShareNetwork size={13} weight="bold" />
            <span>Cotar Peça</span>
          </button>

          <button
            type="button"
            onClick={() => onCompraDireta(demanda)}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Comprar direto de balcão sem cotação"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

/**
 * Aba "Demandas das Ordens de Serviço": peças pedidas pelos mecânicos, com seleção
 * múltipla para cotação agrupada, catalogação de item avulso e compra direta.
 * @param {{
 *   demandas: Array<object>, busca: string, onBuscar: Function, selecao: object,
 *   onGerarCotacaoAgrupada: Function, onCatalogar: Function, onCotar: Function, onCompraDireta: Function
 * }} props
 */
export function AbaDemandasOS({ demandas, busca, onBuscar, selecao, onGerarCotacaoAgrupada, ...acoesLinha }) {
  const { demandasSelecionadas, alternarSelecaoDemanda, selecionarTodasDemandas } = selecao

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        <CampoBusca
          valor={busca}
          onChange={onBuscar}
          placeholder="Buscar por OS, cliente, placa, modelo do carro ou nome da peça solicitada..."
        />

        {demandasSelecionadas.length > 0 && (
          <button
            type="button"
            onClick={onGerarCotacaoAgrupada}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShareNetwork size={16} weight="bold" />
            <span>Iniciar Cotação com Itens Selecionados ({demandasSelecionadas.length})</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {demandas.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Car size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhuma demanda pendente de OS</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Todas as Ordens de Serviço abertas estão com peças supridas ou não há solicitações pendentes.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={demandas.length > 0 && demandasSelecionadas.length === demandas.length}
                      onChange={selecionarTodasDemandas}
                      className={CHECKBOX}
                    />
                  </th>
                  <th className="py-3 px-4">Ordem de Serviço / Veículo</th>
                  <th className="py-3 px-4">Peça Solicitada pelo Mecânico</th>
                  <th className="py-3 px-4 text-center">Qtd. Necessária</th>
                  <th className="py-3 px-4 text-center">Saldo em Estoque</th>
                  <th className="py-3 px-4 text-center">Status no Catálogo</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {demandas.map((demanda) => (
                  <DemandaLinha
                    key={demanda.id}
                    demanda={demanda}
                    selecionado={demandasSelecionadas.includes(demanda.id)}
                    onAlternar={alternarSelecaoDemanda}
                    {...acoesLinha}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
