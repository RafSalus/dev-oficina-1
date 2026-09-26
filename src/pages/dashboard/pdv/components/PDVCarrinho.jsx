import React from 'react'
import Select from 'react-select'
import {
  ShoppingCartSimple,
  User,
  Car,
  Trash,
  Minus,
  Plus,
  Receipt,
} from '@phosphor-icons/react'
import { useClientesCadastrados } from '../../../../hooks/useClientesCadastrados'
import { customSelectStyles } from '../../../../components/suprimentos/customSelectStyles'
import { formatMoeda } from '../pdvData'

export function PDVCarrinho({
  itensCarrinho = [],
  osVinculada,
  clienteSelecionado,
  onClienteSelecionadoChange,
  veiculoSelecionado,
  onVeiculoSelecionadoChange,
  descontoGeral = 0,
  onDescontoGeralChange,
  tipoDescontoGeral = 'valor',
  onTipoDescontoGeralChange,
  totais = { subtotal: 0, descontoGeralValor: 0, totalGeral: 0 },
  onAlterarQuantidade,
  onAlterarDescontoItem,
  onRemoverItem,
  onFinalizarVenda,
}) {
  const { clientes: clientesCadastrados, carregando: carregandoClientes } = useClientesCadastrados({ incluirVeiculos: true })

  return (
    <div className="min-h-0 flex flex-col bg-white border border-[#e4e7ec] rounded-2xl overflow-hidden">
      {/* Cabeçalho do Carrinho / Identificação */}
      <div className="shrink-0 px-4 pt-3.5 pb-3 border-b border-[#f2f4f7] space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
          <ShoppingCartSimple size={15} weight="bold" className="text-[#0284c7]" />
          Cupom Atual
        </span>

        {osVinculada ? (
          <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-xl px-3 py-2 text-xs">
            <p className="font-bold text-[#101828] flex items-center gap-1.5">
              <User size={13} weight="bold" />
              {osVinculada.cliente}
            </p>
            {osVinculada.placa && (
              <p className="text-[#667085] font-semibold flex items-center gap-1.5 mt-0.5">
                <Car size={13} weight="bold" />
                {osVinculada.marcaModelo} • Placa {osVinculada.placa}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Select
              value={clienteSelecionado}
              onChange={(opt) => {
                onClienteSelecionadoChange?.(opt)
                onVeiculoSelecionadoChange?.(null)
              }}
              options={clientesCadastrados}
              isLoading={carregandoClientes}
              styles={customSelectStyles}
              isClearable
              placeholder={carregandoClientes ? 'Carregando clientes...' : 'Cliente (opcional) — Consumidor Final'}
            />
            {clienteSelecionado && (
              <Select
                value={veiculoSelecionado}
                onChange={onVeiculoSelecionadoChange}
                options={clienteSelecionado.veiculos || []}
                styles={customSelectStyles}
                isClearable
                placeholder="Veículo (opcional)"
              />
            )}
          </div>
        )}
      </div>

      {/* Lista de Itens do Carrinho */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2">
        {itensCarrinho.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-[#98a2b3] py-10">
            <ShoppingCartSimple size={32} weight="light" />
            <p className="text-xs font-semibold max-w-[220px]">
              Adicione peças ou serviços do catálogo para iniciar a venda.
            </p>
          </div>
        ) : (
          itensCarrinho.map((item) => (
            <div key={item.uid} className="border border-[#eaecf0] rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11.5px] font-bold text-[#101828] truncate">{item.nome}</p>
                  <p className="text-[10px] text-[#98a2b3] font-semibold uppercase">
                    {item.tipo === 'peca' ? 'Peça' : item.tipo === 'servico' ? 'Serviço' : 'Terceiro'}
                    {item.origemOS ? ' • Da OS' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoverItem?.(item.uid)}
                  className="w-6 h-6 rounded-md text-rose-500 hover:bg-rose-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  title="Remover item"
                >
                  <Trash size={13} weight="bold" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAlterarQuantidade?.(item.uid, -1)}
                    className="w-6 h-6 rounded-md border border-[#d0d5dd] flex items-center justify-center text-[#475467] hover:bg-[#f2f4f7] cursor-pointer"
                  >
                    <Minus size={11} weight="bold" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#101828]">
                    {item.quantidade}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAlterarQuantidade?.(item.uid, 1)}
                    className="w-6 h-6 rounded-md border border-[#d0d5dd] flex items-center justify-center text-[#475467] hover:bg-[#f2f4f7] cursor-pointer"
                  >
                    <Plus size={11} weight="bold" />
                  </button>
                </div>

                <span className="text-[11px] font-semibold text-[#667085]">
                  R$ {formatMoeda(item.precoUnitario)} / {item.unidade}
                </span>

                <span className="text-xs font-bold text-[#101828]">
                  R$ {formatMoeda(Math.max(0, item.quantidade * item.precoUnitario - (item.desconto || 0)))}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#98a2b3] font-semibold">Desconto no item</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-[#98a2b3]">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.desconto || 0}
                    onChange={(e) => onAlterarDescontoItem?.(item.uid, e.target.value)}
                    className="w-16 h-6 px-1.5 rounded-md border border-[#d0d5dd] text-[10.5px] font-bold text-[#101828] bg-white text-right focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totais e Ação de Finalização */}
      <div className="shrink-0 border-t border-[#f2f4f7] px-4 py-3.5 space-y-2.5 bg-[#f8fafc]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#667085] font-semibold">Subtotal</span>
          <span className="font-bold text-[#101828]">R$ {formatMoeda(totais.subtotal)}</span>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-[#667085] font-semibold shrink-0">Desconto Geral</span>
          <div className="flex items-center gap-1">
            <div className="flex rounded-lg border border-[#d0d5dd] overflow-hidden">
              <button
                type="button"
                onClick={() => onTipoDescontoGeralChange?.('valor')}
                className={`px-2 h-7 text-[10px] font-bold cursor-pointer ${
                  tipoDescontoGeral === 'valor' ? 'bg-[#101828] text-white' : 'bg-white text-[#667085]'
                }`}
              >
                R$
              </button>
              <button
                type="button"
                onClick={() => onTipoDescontoGeralChange?.('percentual')}
                className={`px-2 h-7 text-[10px] font-bold cursor-pointer ${
                  tipoDescontoGeral === 'percentual' ? 'bg-[#101828] text-white' : 'bg-white text-[#667085]'
                }`}
              >
                %
              </button>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={descontoGeral}
              onChange={(e) => onDescontoGeralChange?.(e.target.value)}
              className="w-20 h-7 px-2 rounded-lg border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white text-right focus:outline-none focus:border-[#0284c7]"
            />
          </div>
        </div>

        {totais.descontoGeralValor > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#667085] font-semibold">Valor do Desconto</span>
            <span className="font-bold text-rose-600">- R$ {formatMoeda(totais.descontoGeralValor)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 border-t border-[#e4e7ec]">
          <span className="text-sm font-bold text-[#101828]">Total</span>
          <span className="text-xl font-black text-[#0284c7]">R$ {formatMoeda(totais.totalGeral)}</span>
        </div>

        <button
          type="button"
          onClick={onFinalizarVenda}
          disabled={itensCarrinho.length === 0}
          className="w-full h-11 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-[#d0d5dd] disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <Receipt size={17} weight="bold" />
          Finalizar Venda
        </button>
      </div>
    </div>
  )
}
