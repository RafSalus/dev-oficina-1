import React from 'react'
import { CheckCircle, X } from '@phosphor-icons/react'

/**
 * Modal de autorização e aprovação formal do orçamento pelo cliente (NFR17).
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {() => void} props.onClose - Callback para fechar o modal
 * @param {(e: React.FormEvent) => void} props.onConfirm - Callback para submeter a aprovação
 * @param {Object} props.dadosOS - Dados da ordem de serviço
 * @param {number} props.totalGeral - Valor total aprovado
 * @param {string} props.nomeResponsavel - Nome informado pelo responsável
 * @param {(nome: string) => void} props.setNomeResponsavel - Setter do nome
 * @param {string} props.formaPagamento - Forma de pagamento selecionada ('pix' | 'cartao')
 * @param {(forma: string) => void} props.setFormaPagamento - Setter da forma de pagamento
 */
export function AprovacaoModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  dadosOS,
  totalGeral,
  nomeResponsavel,
  setNomeResponsavel,
  formaPagamento,
  setFormaPagamento,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <form
        onSubmit={onConfirm}
        className="bg-white w-full max-w-md rounded-2xl border border-[#d0d5dd] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        <div className="px-5 py-3.5 border-b border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} weight="bold" className="text-[#0284c7]" />
            <h3 className="text-sm font-extrabold text-[#101828]">
              Autorização de Serviços e Peças
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#eaecf0] transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-[#475467] leading-relaxed">
            Ao confirmar, você autoriza a <strong>Mecânica Gabriel</strong> a iniciar os reparos no veículo{' '}
            <strong>{dadosOS.marcaModelo || 'Veículo'}</strong> no valor total de:
          </p>

          <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#d0d5dd] flex items-center justify-between">
            <span className="font-bold text-[#344054]">Valor Autorizado:</span>
            <span className="text-base font-black text-[#0284c7]">
              R$ {totalGeral.toFixed(2)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054] mb-1">
              Nome Completo do Responsável <span className="text-[#0284c7]">*</span>
            </label>
            <input
              type="text"
              required
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
              placeholder={dadosOS.cliente || 'Digite seu nome completo...'}
              className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-white focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054] mb-1">
              Forma de Pagamento Preferida
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormaPagamento('pix')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  formaPagamento === 'pix'
                    ? 'border-[#0284c7] bg-[#e0f2fe]/40 text-[#101828]'
                    : 'border-[#d0d5dd] bg-white text-[#475467]'
                }`}
              >
                <span className="font-bold block">PIX / À Vista</span>
                <span className="text-[10px] text-[#0284c7] font-semibold">5% desconto</span>
              </button>

              <button
                type="button"
                onClick={() => setFormaPagamento('cartao')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  formaPagamento === 'cartao'
                    ? 'border-[#0284c7] bg-[#e0f2fe]/40 text-[#101828]'
                    : 'border-[#d0d5dd] bg-white text-[#475467]'
                }`}
              >
                <span className="font-bold block">Cartão de Crédito</span>
                <span className="text-[10px] text-[#667085]">Até 10x</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-[#d0d5dd] bg-white text-[#475467] text-xs font-semibold hover:bg-[#f2f4f7] cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            <CheckCircle size={15} weight="bold" />
            <span>Confirmar e Autorizar</span>
          </button>
        </div>
      </form>
    </div>
  )
}
