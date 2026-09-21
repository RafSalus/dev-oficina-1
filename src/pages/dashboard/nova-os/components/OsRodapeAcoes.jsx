import React from 'react'
import { Printer, X, Lightning, ArrowsClockwise, User, Car, ShieldCheck, Users } from '@phosphor-icons/react'
import { ITENS_CHECKLIST_ENTRADA } from '../../../../constants/checklistItems'

function formatMoeda(val) {
  const n = parseFloat(val) || 0
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Conteudo do rodape do modal de abertura de OS (renderizado dentro do slot `rodape` do
// ModalRedimensionavel — sem chrome proprio de borda/fundo, isso ja vem do modal).
export function OsRodapeAcoes({ formData, onCancelar, onLimpar, onImprimirEntrada, onSalvar }) {
  const totalServicos = (formData.servicosOS || []).reduce(
    (acc, s) => acc + (parseFloat(s.precoUnitario) || 0) * (parseFloat(s.quantidade) || 1),
    0
  )
  const totalPecas = (formData.pecasOS || []).reduce(
    (acc, p) => acc + (parseFloat(p.precoUnitario) || 0) * (parseFloat(p.quantidade) || 1),
    0
  )
  const totalGeral = totalServicos + totalPecas

  const checklistEntrada = formData.checklistEntrada || {}
  const preenchidosCount = ITENS_CHECKLIST_ENTRADA.filter((item) => Boolean(checklistEntrada[item.id]?.status)).length

  return (
    // Empilha em duas linhas quando o modal esta estreito (variantes @ = largura real do
    // modal, nao da janela do navegador — ver comentario em ModalRedimensionavel.jsx) em vez
    // de deixar os botoes quebrarem linha um por um.
    <div className="w-full flex flex-col @lg:flex-row @lg:items-center @lg:justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
        <div className="flex items-center gap-1 text-xs text-[#101828] font-bold truncate shrink-0 max-w-full">
          <User size={13} weight="bold" className="text-[#0284c7] shrink-0" />
          <span className="truncate max-w-38">{formData.cliente || 'Cliente nao selecionado'}</span>
        </div>

        <span className="text-[#d0d5dd] shrink-0">•</span>

        <div className="flex items-center gap-1 text-xs text-[#475467] font-semibold truncate shrink-0 max-w-full">
          <Car size={13} weight="bold" className="text-[#0284c7] shrink-0" />
          <span className="truncate max-w-44">
            {formData.placa ? `${formData.placa.toUpperCase()} ${formData.marcaModelo ? `(${formData.marcaModelo})` : ''}` : 'Veiculo nao selecionado'}
          </span>
        </div>

        {formData.filaEsperaId && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#101828] text-white text-[10.5px] font-bold shrink-0">
            <Users size={11} weight="bold" />
            <span>Vindo da Fila</span>
          </span>
        )}

        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f8fafc] text-[#475467] text-[10.5px] font-bold border border-[#e4e7ec] shrink-0">
          <ShieldCheck size={12} weight="bold" className="text-[#0284c7]" />
          <span>Vistoria {preenchidosCount}/{ITENS_CHECKLIST_ENTRADA.length}</span>
        </span>

        {totalGeral > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#101828] text-white text-[11px] font-black shrink-0">
            <span>Pre-total: R$ {formatMoeda(totalGeral)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
        <button
          type="button"
          onClick={onCancelar}
          className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] hover:border-rose-400 hover:text-rose-600 bg-white text-[#475467] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <X size={13} weight="bold" />
          <span className="hidden @sm:inline">Descartar</span>
        </button>

        <button
          type="button"
          onClick={onLimpar}
          title="Limpar todos os campos e iniciar novo atendimento"
          className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] hover:border-[#101828] bg-white text-[#475467] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowsClockwise size={13} weight="bold" />
          <span className="hidden @sm:inline">Limpar</span>
        </button>

        <button
          type="button"
          onClick={onImprimirEntrada}
          title="Imprimir folha oficial de entrada para o cliente assinar"
          className="h-8.5 px-3 rounded-xl border border-[#d0d5dd] hover:border-[#101828] bg-white text-[#101828] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Printer size={14} weight="bold" />
          <span className="hidden @md:inline">Imprimir Entrada</span>
        </button>

        <button
          type="button"
          onClick={onSalvar}
          title="Salvar e enviar esta ordem de servico para a Fila do Kanban"
          className="h-8.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Lightning size={14} weight="fill" />
          <span>Salvar e Enviar para a Fila</span>
        </button>
      </div>
    </div>
  )
}
