import React from 'react'
import { ShieldCheck } from '@phosphor-icons/react'

/**
 * Aba de Laudo Técnico Oficial de Inspeção (NFR17).
 * Exibe a queixa do cliente e o parecer do mecânico responsável.
 *
 * @param {Object} props
 * @param {Object} props.dadosOS - Dados da ordem de serviço
 */
export function AprovacaoLaudoTab({ dadosOS }) {
  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs p-5 space-y-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between border-b border-[#d0d5dd] pb-3">
        <div>
          <h2 className="text-sm font-extrabold text-[#101828]">
            Laudo Técnico de Inspeção
          </h2>
          <span className="text-xs text-[#667085]">
            Parecer técnico emitido pelo mecânico responsável da oficina
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#0284c7] font-bold">
          <ShieldCheck size={18} weight="bold" />
          <span>Garantia de Qualidade</span>
        </div>
      </div>

      {dadosOS.relatoCliente && (
        <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#d0d5dd]">
          <span className="text-[11px] font-bold text-[#667085] uppercase block mb-1">
            Queixa Inicial Relatada pelo Cliente:
          </span>
          <p className="text-xs text-[#344054] italic leading-relaxed">
            "{dadosOS.relatoCliente}"
          </p>
        </div>
      )}

      <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] font-mono text-xs text-[#101828] leading-relaxed whitespace-pre-wrap">
        {dadosOS.laudoTecnico ||
          'Nenhum laudo técnico detalhado registrado para esta Ordem de Serviço.'}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#667085] pt-2">
        <span>
          Mecânico Responsável:{' '}
          <strong className="text-[#101828] font-bold">
            {dadosOS.mecanicoNome || 'Mecânica Gabriel'}
          </strong>
        </span>
        <span>Apucarana - PR</span>
      </div>
    </div>
  )
}
