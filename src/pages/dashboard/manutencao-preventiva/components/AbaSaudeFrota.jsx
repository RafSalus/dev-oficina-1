import React from 'react'
import {
  ShieldCheck,
  PencilSimple,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { formatarTelefone } from '../../../../utils/fiscalValidators'

export function AbaSaudeFrota({
  veiculosFiltrados,
  onAtualizarKm,
  onAbrirFicha,
  onGerarOrdemServico,
  onEnviarWhatsApp,
}) {
  return (
    <div className="h-full bg-white rounded-2xl border border-[#d0d5dd] shadow-2xs overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f8fafc] sticky top-0 border-b border-slate-200 z-10">
            <tr className="text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <th className="py-3 px-4">Veículo</th>
              <th className="py-3 px-4">Proprietário / Contato</th>
              <th className="py-3 px-4">Hodômetro Atual</th>
              <th className="py-3 px-4 text-center">Score de Saúde</th>
              <th className="py-3 px-4">Pontos de Atenção / Revisão</th>
              <th className="py-3 px-4">Receita Potencial</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {veiculosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                    <ShieldCheck size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Nenhum veículo encontrado</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tente ajustar os filtros ou o termo de busca pesquisado.
                  </p>
                </td>
              </tr>
            ) : (
              veiculosFiltrados.map((vSaude) => {
                const v = vSaude.veiculo
                const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
                const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')

                return (
                  <tr key={vSaude.placa} className="hover:bg-slate-50/80 transition-colors">
                    {/* Coluna 1: Veículo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#101828] text-white">
                          {vSaude.placa}
                        </span>
                        <div>
                          <strong className="text-slate-900 block font-bold leading-tight">
                            {v.marcaModelo || v.modelo}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {v.ano} • {v.cor}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Coluna 2: Cliente */}
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block font-semibold leading-tight">
                        {v.clienteNome}
                      </strong>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formatarTelefone(v.clienteTelefone) || '—'}
                      </span>
                    </td>

                    {/* Coluna 3: Hodômetro */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {v.kmPadrao || v.kmAtual || '0'} km
                        </span>
                        <button
                          type="button"
                          onClick={() => onAtualizarKm(v)}
                          className="text-slate-400 hover:text-sky-600 p-0.5 cursor-pointer"
                          title="Atualizar odômetro do veículo"
                        >
                          <PencilSimple size={12} />
                        </button>
                      </div>
                    </td>

                    {/* Coluna 4: Score de Saúde */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full ${
                            vSaude.healthScore >= 80
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : vSaude.healthScore >= 50
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-[#101828] text-white'
                          }`}
                        >
                          {vSaude.healthScore}%
                        </span>
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase mt-0.5">
                          {vSaude.statusGeral === 'critico'
                            ? 'Crítico'
                            : vSaude.statusGeral === 'atencao'
                            ? 'Atenção'
                            : 'Em Dia'}
                        </span>
                      </div>
                    </td>

                    {/* Coluna 5: Itens em Alerta */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {vencidos.map((item) => (
                          <span
                            key={item.id}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                            title={item.motivoAlerta}
                          >
                            {item.nome}
                          </span>
                        ))}
                        {emAtencao.map((item) => (
                          <span
                            key={item.id}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200"
                            title={item.motivoAlerta}
                          >
                            {item.nome}
                          </span>
                        ))}
                        {vSaude.temGarantiaPendente && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                            Revisão Garantia
                          </span>
                        )}
                        {vencidos.length === 0 && emAtencao.length === 0 && !vSaude.temGarantiaPendente && (
                          <span className="text-[10px] font-medium text-slate-500">
                            Todos os sistemas em dia
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Coluna 6: Oportunidade / Receita Potencial */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-extrabold text-xs text-sky-800 block">
                        {vSaude.receitaPotencialTotal > 0
                          ? `R$ ${vSaude.receitaPotencialTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '—'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {vencidos.length + emAtencao.length > 0
                          ? `${vencidos.length + emAtencao.length} serviços sugeridos`
                          : 'Manutenções em dia'}
                      </span>
                    </td>

                    {/* Coluna 7: Ações Rápidas */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Disparo de WhatsApp */}
                        <button
                          type="button"
                          onClick={() => onEnviarWhatsApp(vSaude)}
                          className="p-1.5 text-white bg-[#25D366] hover:bg-[#20ba59] rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Notificar cliente no WhatsApp com itens preventivos sugeridos"
                        >
                          <WhatsappLogo size={15} weight="fill" />
                        </button>

                        {/* Ficha Completa de Saúde */}
                        <button
                          type="button"
                          onClick={() => onAbrirFicha(vSaude)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                          title="Abrir prontuário completo de saúde do veículo"
                        >
                          Ficha de Saúde
                        </button>

                        {/* Abrir OS Direta */}
                        <button
                          type="button"
                          onClick={() =>
                            onGerarOrdemServico(v, [
                              ...vencidos,
                              ...emAtencao,
                              ...(vSaude.temGarantiaPendente
                                ? [vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')].filter(Boolean)
                                : []),
                            ])
                          }
                          className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Abrir Ordem de Serviço com itens preventivos selecionados"
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
