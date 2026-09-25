import React from 'react'
import { SealCheck, CalendarBlank, WhatsappLogo } from '@phosphor-icons/react'
import { formatarTelefone } from '../../../../utils/fiscalValidators'

export function AbaRetornosGarantia({
  veiculosAvaliados,
  onEnviarWhatsApp,
  onAbrirFicha,
  onGerarOrdemServico,
}) {
  const veiculosGarantia = veiculosAvaliados.filter((v) => v.temGarantiaPendente)

  return (
    <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs overflow-hidden flex flex-col">
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SealCheck size={18} className="text-sky-700" />
          <span className="text-xs font-bold text-slate-800">
            Revisões de Garantia e Inspeções Periódicas de Pós-Venda
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Veículos com serviços recentes que exigem reaperto ou revisão para manter a garantia ativa
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f8fafc] sticky top-0 border-b border-slate-200 z-10">
            <tr className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <th className="py-2.5 px-4">Veículo</th>
              <th className="py-2.5 px-4">Cliente / Contato</th>
              <th className="py-2.5 px-4">Serviço de Origem</th>
              <th className="py-2.5 px-4">Prazo Limite da Garantia</th>
              <th className="py-2.5 px-4">Status da Garantia</th>
              <th className="py-2.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {veiculosGarantia.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                    <SealCheck size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Nenhum retorno de garantia pendente</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Todos os veículos com garantia estão revisados ou em dia.
                  </p>
                </td>
              </tr>
            ) : (
              veiculosGarantia.map((vSaude) => {
                const itemGarantia = vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')
                return (
                  <tr key={vSaude.placa} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#101828] text-white">
                          {vSaude.placa}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {vSaude.veiculo.marcaModelo || vSaude.veiculo.modelo}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {vSaude.veiculo.kmPadrao || vSaude.veiculo.kmAtual} km
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block">{vSaude.veiculo.clienteNome}</strong>
                      <span className="text-[11px] text-slate-500">
                        {formatarTelefone(vSaude.veiculo.clienteTelefone) || '—'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">
                        {itemGarantia?.servicoOrigem || 'Revisão Geral e Garantia de Peças'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <CalendarBlank size={14} className="text-sky-600" />
                        <strong className="text-slate-900 font-mono">
                          {itemGarantia?.proximaRecomendadaData || 'A definir'}
                        </strong>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {itemGarantia?.diasRestantes > 0
                          ? `Restam ${itemGarantia.diasRestantes} dias`
                          : 'Prazo de retorno expirado'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          itemGarantia?.status === 'vencido'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {itemGarantia?.status === 'vencido'
                          ? 'Garantia em Risco'
                          : 'Aguardando Retorno'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEnviarWhatsApp(vSaude)}
                          className="p-1.5 text-white bg-[#25D366] hover:bg-[#20ba59] rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Notificar cliente sobre a revisão de garantia"
                        >
                          <WhatsappLogo size={15} weight="fill" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAbrirFicha(vSaude)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                        >
                          Ficha de Saúde
                        </button>
                        <button
                          type="button"
                          onClick={() => onGerarOrdemServico(vSaude.veiculo, [itemGarantia].filter(Boolean))}
                          className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Abrir Ordem de Serviço para revisão de garantia"
                        >
                          Criar OS
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
