import React from 'react'
import {
  CheckCircle,
  Clock,
  ArrowDownLeft,
  Copy,
  Car,
  PencilSimple,
  Trash,
  Buildings,
  Archive,
} from '@phosphor-icons/react'

/**
 * Selo do status do pedido de compra.
 * @param {{status: string}} props
 */
export function PedidoStatusBadge({ status }) {
  if (status === 'RECEBIDO') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
        <CheckCircle size={12} weight="bold" />
        <span>Recebido</span>
      </span>
    )
  }
  if (status === 'AGUARDANDO_ENTREGA') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock size={12} weight="bold" />
        <span>Aguardando</span>
      </span>
    )
  }
  if (status === 'EM_COTACAO') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        Em Cotação
      </span>
    )
  }
  if (status === 'CANCELADO') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        Cancelado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
      Rascunho
    </span>
  )
}

const BOTAO_ICONE = 'p-1.5 text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 rounded transition-colors cursor-pointer'

/**
 * Linha da tabela de pedidos de compra com as ações de receber, copiar, editar e excluir.
 * @param {{pedido: object, onReceber: Function, onCopiar: Function, onEditar: Function, onExcluir: Function}} props
 */
export function PedidoCompraLinha({ pedido, onReceber, onCopiar, onEditar, onExcluir }) {
  const dataFormatada = new Date(pedido.dataEmissao).toLocaleDateString('pt-BR')
  const totalItens = pedido.itens ? pedido.itens.length : 0
  const isRecebido = pedido.status === 'RECEBIDO'

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="py-3 px-4 font-mono">
        <div className="font-bold text-slate-900">{pedido.numeroPedido}</div>
        <div className="text-[11px] text-slate-500">{dataFormatada}</div>
      </td>

      <td className="py-3 px-4">
        <div className="font-semibold text-slate-900">{pedido.fornecedorNome}</div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
          <Buildings size={13} className="text-slate-400" />
          <span>{pedido.formaPagamento || 'Boleto'}</span>
        </div>
      </td>

      <td className="py-3 px-4">
        {pedido.numeroOS ? (
          <div>
            <span className="inline-flex items-center gap-1 font-semibold text-sky-900">
              <Car size={13} className="text-sky-600" />
              <span>OS #{pedido.numeroOS}</span>
            </span>
            <div className="text-[11px] text-slate-500 truncate max-w-xs">
              {pedido.veiculoPlaca} • {pedido.clienteNome}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-600">
            <Archive size={13} className="text-slate-400" />
            <span>Reposição de Estoque</span>
          </div>
        )}
      </td>

      <td className="py-3 px-4 text-center">
        <span className="font-mono font-bold text-slate-900">
          {totalItens} {totalItens === 1 ? 'item' : 'itens'}
        </span>
      </td>

      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
        R$ {Number(pedido.valorTotal || 0).toFixed(2)}
      </td>

      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600">
        {pedido.previsaoEntrega
          ? new Date(pedido.previsaoEntrega + 'T00:00:00').toLocaleDateString('pt-BR')
          : 'Não definida'}
      </td>

      <td className="py-3 px-4 text-center">
        <PedidoStatusBadge status={pedido.status} />
      </td>

      <td className="py-3 px-4 text-right">
        <div className="inline-flex items-center gap-1 justify-end">
          {!isRecebido && (
            <button
              type="button"
              onClick={() => onReceber(pedido)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 rounded-md text-[11px] font-bold transition-colors cursor-pointer mr-1"
              title="Dar entrada imediata das peças no estoque da oficina"
            >
              <ArrowDownLeft size={13} weight="bold" />
              <span>Receber</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onCopiar(pedido)}
            className={BOTAO_ICONE}
            title="Copiar pedido formatado para o WhatsApp do fornecedor"
          >
            <Copy size={15} />
          </button>

          <button type="button" onClick={() => onEditar(pedido)} className={BOTAO_ICONE} title="Editar dados do pedido">
            <PencilSimple size={15} />
          </button>

          <button
            type="button"
            onClick={() => onExcluir(pedido)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Excluir pedido"
          >
            <Trash size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}
