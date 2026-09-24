import React from 'react'
import { WhatsappLogo, HourglassMedium, WarningCircle } from '@phosphor-icons/react'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'

function BotaoClassificacao({ ativo, corAtivo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
        ativo ? corAtivo : 'text-[#667085] hover:bg-[#f2f4f7]'
      }`}
    >
      {children}
    </button>
  )
}

function SeloRespostaCliente({ status }) {
  if (status === 'aprovado') {
    return <span className="px-2 py-0.5 rounded-full bg-[#101828] text-white text-[10px] font-bold shrink-0">Aprovado</span>
  }
  if (status === 'recusado') {
    return <span className="px-2 py-0.5 rounded-full bg-[#f2f4f7] text-[#667085] text-[10px] font-bold shrink-0">Recusado</span>
  }
  return (
    <span className="px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[10px] font-bold shrink-0">
      Aguardando Cliente
    </span>
  )
}

/**
 * Aba "Execução": reporta item adicional encontrado durante o serviço (notificando o cliente)
 * e lista os itens já reportados com a resposta do cliente.
 * @param {{os: object, itemAdicional: object}} props - `itemAdicional` de `useLancamentosRapidosOS`.
 */
export function AbaExecucaoOS({ os, itemAdicional }) {
  const seguranca = itemAdicional.classificacao === 'seguranca'
  const itens = os.itensAdicionaisOS || []

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#d0d5dd] rounded-2xl p-3.5 space-y-2 shadow-2xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
          <HourglassMedium size={14} weight="bold" className="text-[#0284c7]" />
          Reportar Item Adicional Encontrado na Execução
        </span>
        <input
          type="text"
          value={itemAdicional.descricao}
          onChange={(e) => itemAdicional.alterar('descricao', e.target.value)}
          placeholder="Ex: Coxim do motor trincado durante a desmontagem"
          className="w-full h-9.5 px-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={itemAdicional.valor}
            onChange={(e) => itemAdicional.alterar('valor', e.target.value)}
            placeholder="Valor estimado R$"
            className="h-9 px-2.5 rounded-xl border border-[#d0d5dd] text-xs font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7]"
          />
          <div className="grid grid-cols-2 gap-0.5 bg-white p-0.5 rounded-xl border border-[#d0d5dd]">
            <BotaoClassificacao
              ativo={seguranca}
              corAtivo="bg-rose-600 text-white"
              onClick={() => itemAdicional.alterar('classificacao', 'seguranca')}
            >
              Segurança
            </BotaoClassificacao>
            <BotaoClassificacao
              ativo={!seguranca}
              corAtivo="bg-[#101828] text-white"
              onClick={() => itemAdicional.alterar('classificacao', 'opcional')}
            >
              Opcional
            </BotaoClassificacao>
          </div>
        </div>
        {seguranca && (
          <p className="text-[10.5px] text-rose-700 flex items-center gap-1">
            <WarningCircle size={12} weight="fill" />
            <span>Itens de segurança bloqueiam o avanço da OS até o cliente responder.</span>
          </p>
        )}
        <button
          type="button"
          onClick={itemAdicional.reportar}
          className="w-full h-9 rounded-xl bg-[#101828] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <WhatsappLogo size={14} weight="fill" />
          Reportar e Notificar Cliente
        </button>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#667085] block mb-2">
          Itens Adicionais Reportados ({itens.length})
        </span>
        {itens.length === 0 ? (
          <div className="bg-[#f8fafc] border border-[#e4e7ec] rounded-2xl p-6 text-center">
            <p className="text-[11px] text-[#667085]">Nenhum item adicional identificado nesta OS até o momento.</p>
          </div>
        ) : (
          <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
            {itens.map((item) => (
              <div key={item.id} className="p-3 text-xs flex items-center justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-[#101828] truncate">{item.descricao}</p>
                    {item.classificacao === 'seguranca' && (
                      <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold">
                        Segurança
                      </span>
                    )}
                  </div>
                  <span className="text-[#667085] text-[11px]">R$ {formatMoeda(item.valorEstimado)}</span>
                </div>
                <SeloRespostaCliente status={item.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
