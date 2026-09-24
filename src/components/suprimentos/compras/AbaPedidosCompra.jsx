import React, { useMemo } from 'react'
import Select from 'react-select'
import { ShoppingCart } from '@phosphor-icons/react'
import { STATUS_COMPRA_OPCOES } from '../../../constants/comprasData'
import { customSelectStyles } from '../customSelectStyles'
import { CampoBusca } from './CampoBusca'
import { PedidoCompraLinha } from './PedidoCompraLinha'

/**
 * Aba "Pedidos de Compra": filtros (busca, status, fornecedor) e tabela de pedidos.
 * @param {{
 *   pedidos: Array<object>, fornecedores: Array<object>, filtros: object,
 *   onReceber: Function, onCopiar: Function, onEditar: Function, onExcluir: Function
 * }} props
 */
export function AbaPedidosCompra({ pedidos, fornecedores, filtros, onReceber, onCopiar, onEditar, onExcluir }) {
  const opcoesFornecedores = useMemo(
    () => [
      { value: 'TODOS', label: 'Todos os Fornecedores' },
      ...fornecedores.map((f) => ({ value: f.id, label: f.nomeFantasia || f.razaoSocial })),
    ],
    [fornecedores]
  )

  const temFiltroAtivo =
    filtros.buscaPedidos || filtros.filtroStatus !== 'TODOS' || filtros.filtroFornecedor !== 'TODOS'

  return (
    <>
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center gap-3 shrink-0">
        <CampoBusca
          valor={filtros.buscaPedidos}
          onChange={filtros.setBuscaPedidos}
          placeholder="Buscar por número do pedido, fornecedor, cliente, placa ou responsável..."
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={STATUS_COMPRA_OPCOES.find((opt) => opt.value === filtros.filtroStatus)}
              onChange={filtros.selecionarStatusPedido}
              options={STATUS_COMPRA_OPCOES}
              styles={customSelectStyles}
              placeholder="Status"
              isSearchable={false}
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={opcoesFornecedores.find((opt) => opt.value === filtros.filtroFornecedor)}
              onChange={filtros.selecionarFornecedor}
              options={opcoesFornecedores}
              styles={customSelectStyles}
              placeholder="Fornecedor"
              isSearchable={true}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Pedidos com Scroll Invisível (Regra 11) */}
      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {pedidos.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ShoppingCart size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhum pedido de compra localizado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {temFiltroAtivo
                  ? 'Nenhum pedido corresponde aos critérios de pesquisa selecionados.'
                  : 'Clique no botão acima para registrar o primeiro pedido de compra da oficina.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Pedido / Data</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4">Origem / Destino</th>
                  <th className="py-3 px-4 text-center">Itens</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center">Previsão</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pedidos.map((pedido) => (
                  <PedidoCompraLinha
                    key={pedido.id}
                    pedido={pedido}
                    onReceber={onReceber}
                    onCopiar={onCopiar}
                    onEditar={onEditar}
                    onExcluir={onExcluir}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
