import React, { useMemo } from 'react'
import { CheckCircle, User, Car, Wrench, Package, Handshake, Receipt, X } from '@phosphor-icons/react'

function formatMoeda(val) {
  return (parseFloat(val) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function TabFinalizar({ formData, onSelectTab, onCancel }) {
  const {
    numeroOS,
    cliente,
    telefone,
    placa,
    marcaModelo,
    mecanicoNome,
    pecasOS = [],
    servicosOS = [],
    terceirosOS = [],
    descontoGeralOS,
    condicaoPagamentoOS,
  } = formData

  const totais = useMemo(() => {
    const totalPecas = pecasOS.reduce(
      (acc, p) => acc + ((parseFloat(p.precoUnitario) || 0) * (parseFloat(p.quantidade) || 1) - (parseFloat(p.desconto) || 0)),
      0
    )
    const totalServicos = servicosOS.reduce(
      (acc, s) =>
        acc + ((parseFloat(s.valorUnitario ?? s.precoUnitario) || 0) * (parseFloat(s.quantidade) || 1) - (parseFloat(s.desconto) || 0)),
      0
    )
    const totalTerceiros = terceirosOS.reduce(
      (acc, t) => acc + ((parseFloat(t.valorVenda) || 0) - (parseFloat(t.desconto) || 0)),
      0
    )
    const desconto = parseFloat(descontoGeralOS) || 0
    const totalGeral = Math.max(0, totalPecas + totalServicos + totalTerceiros - desconto)
    return { totalPecas, totalServicos, totalTerceiros, desconto, totalGeral }
  }, [pecasOS, servicosOS, terceirosOS, descontoGeralOS])

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2.5 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3">
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#101828] text-[#0284c7] flex items-center justify-center shrink-0">
            <CheckCircle size={22} weight="bold" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-[#101828]">Revisão Final da OS #{numeroOS}</h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Confira os dados abaixo. Se algo estiver incorreto, volte na aba correspondente antes de salvar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectTab('cliente-veiculo')}
            className="text-left bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5 hover:border-[#0284c7] transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5 mb-1.5">
              <User size={13} weight="bold" /> Cliente
            </span>
            <p className="text-sm font-bold text-[#101828] truncate">{cliente || 'Não informado'}</p>
            <p className="text-xs text-[#667085]">{telefone || 'Sem telefone'}</p>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('cliente-veiculo')}
            className="text-left bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5 hover:border-[#0284c7] transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5 mb-1.5">
              <Car size={13} weight="bold" /> Veículo
            </span>
            <p className="text-sm font-bold text-[#101828] truncate">{marcaModelo || 'Não informado'}</p>
            <p className="text-xs text-[#667085]">
              Placa {placa || '—'} • Mecânico: {mecanicoNome || 'Não atribuído'}
            </p>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">Resumo do Orçamento</h3>
          <button type="button" onClick={() => onSelectTab('pecas')} className="w-full flex items-center justify-between text-xs cursor-pointer hover:bg-[#f8fafc] rounded-lg px-2 py-1.5 -mx-2">
            <span className="flex items-center gap-1.5 text-[#475467]"><Package size={14} weight="bold" /> Peças ({pecasOS.length})</span>
            <span className="font-bold text-[#101828]">R$ {formatMoeda(totais.totalPecas)}</span>
          </button>
          <button type="button" onClick={() => onSelectTab('servicos')} className="w-full flex items-center justify-between text-xs cursor-pointer hover:bg-[#f8fafc] rounded-lg px-2 py-1.5 -mx-2">
            <span className="flex items-center gap-1.5 text-[#475467]"><Wrench size={14} weight="bold" /> Serviços ({servicosOS.length})</span>
            <span className="font-bold text-[#101828]">R$ {formatMoeda(totais.totalServicos)}</span>
          </button>
          <button type="button" onClick={() => onSelectTab('terceiros')} className="w-full flex items-center justify-between text-xs cursor-pointer hover:bg-[#f8fafc] rounded-lg px-2 py-1.5 -mx-2">
            <span className="flex items-center gap-1.5 text-[#475467]"><Handshake size={14} weight="bold" /> Terceiros ({terceirosOS.length})</span>
            <span className="font-bold text-[#101828]">R$ {formatMoeda(totais.totalTerceiros)}</span>
          </button>
          {totais.desconto > 0 && (
            <div className="flex items-center justify-between text-xs text-rose-600">
              <span>Desconto Geral</span>
              <span className="font-bold">- R$ {formatMoeda(totais.desconto)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2.5 border-t border-[#e4e7ec]">
            <span className="text-sm font-extrabold text-[#101828]">TOTAL DA OS</span>
            <span className="text-xl font-black text-[#0284c7]">R$ {formatMoeda(totais.totalGeral)}</span>
          </div>
          {condicaoPagamentoOS && (
            <p className="text-[11px] text-[#667085] pt-1">Condição sugerida: <span className="font-semibold text-[#344054]">{condicaoPagamentoOS}</span></p>
          )}
        </div>

        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-3.5 text-xs text-[#0369a1]">
          Ao salvar, a OS entra em "Aguardando Aprovação" e pode ser enviada ao cliente para autorização digital.
        </div>
      </div>

      <div className="h-11 shrink-0 bg-white px-5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between">
        <span className="text-xs font-medium text-[#667085]">
          Aba 8 de 8 • <strong className="text-[#101828] font-bold">Finalizar</strong>
        </span>

        <button
          type="submit"
          form="form-nova-os"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Receipt size={15} weight="bold" />
          <span>Salvar e Finalizar OS</span>
        </button>
      </div>
    </div>
  )
}
