import React from 'react'
import PropTypes from 'prop-types'
import {
  Car,
  Archive,
  ArrowDownLeft,
  Copy,
  Receipt,
} from '@phosphor-icons/react'

function PedidoCard({ pedido, onEditar, onReceber, onWhatsapp }) {
  const dataFormatada = new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')
  const totalItens = pedido.itens ? pedido.itens.length : 0
  const isRecebido = pedido.status === 'RECEBIDO'
  const isAguardando = pedido.status === 'AGUARDANDO_ENTREGA'
  const isCotacao = pedido.status === 'EM_COTACAO'
  const isCancelado = pedido.status === 'CANCELADO'

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <button type="button" onClick={() => onEditar(pedido)} className="w-full text-left">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono font-black text-xs text-[#101828]">{pedido.numeroPedido}</span>
          {isRecebido ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
              Recebido
            </span>
          ) : isAguardando ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Aguardando
            </span>
          ) : isCotacao ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f2f4f7] text-[#344054] border border-[#e4e7ec]">
              Em Cotação
            </span>
          ) : isCancelado ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Cancelado
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f2f4f7] text-[#667085]">
              Rascunho
            </span>
          )}
        </div>
        <p className="text-sm font-extrabold text-[#101828] truncate">{pedido.fornecedorNome}</p>
        <p className="text-[10.5px] text-[#667085] mt-0.5">
          {dataFormatada} • {pedido.formaPagamento || 'Boleto'}
        </p>

        {pedido.numeroOS ? (
          <p className="text-[10.5px] text-sky-800 font-semibold mt-1.5 flex items-center gap-1">
            <Car size={12} /> OS #{pedido.numeroOS} • {pedido.veiculoPlaca}
          </p>
        ) : (
          <p className="text-[10.5px] text-[#667085] mt-1.5 flex items-center gap-1">
            <Archive size={12} /> Reposição de Estoque
          </p>
        )}

        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
          <span className="text-[10.5px] text-[#667085]">
            {totalItens} {totalItens === 1 ? 'item' : 'itens'}
          </span>
          <span className="font-mono font-black text-sm text-[#101828]">
            R$ {Number(pedido.valorTotal || 0).toFixed(2)}
          </span>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {!isRecebido ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onReceber(pedido)
            }}
            className="h-9 rounded-lg bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <ArrowDownLeft size={13} weight="bold" />
            Receber
          </button>
        ) : (
          <div />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onWhatsapp(pedido)
          }}
          className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Copy size={13} weight="bold" />
          Copiar
        </button>
      </div>
    </div>
  )
}

PedidoCard.propTypes = {
  pedido: PropTypes.object.isRequired,
  onEditar: PropTypes.func.isRequired,
  onReceber: PropTypes.func.isRequired,
  onWhatsapp: PropTypes.func.isRequired,
}

/**
 * Aba de listagem de pedidos de compra no mobile.
 */
export function MobileAbaPedidos({ pedidos, onEditar, onReceber, onWhatsapp }) {
  if (pedidos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#d0d5dd] p-8 text-center space-y-2">
        <Receipt size={36} className="mx-auto text-[#98a2b3]" />
        <p className="text-sm font-extrabold text-[#101828]">Nenhum pedido encontrado</p>
        <p className="text-xs text-[#667085]">
          Não há pedidos de compra correspondentes aos filtros aplicados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pedidos.map((pedido) => (
        <PedidoCard
          key={pedido.id || pedido.numeroPedido}
          pedido={pedido}
          onEditar={onEditar}
          onReceber={onReceber}
          onWhatsapp={onWhatsapp}
        />
      ))}
    </div>
  )
}

MobileAbaPedidos.propTypes = {
  pedidos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEditar: PropTypes.func.isRequired,
  onReceber: PropTypes.func.isRequired,
  onWhatsapp: PropTypes.func.isRequired,
}
