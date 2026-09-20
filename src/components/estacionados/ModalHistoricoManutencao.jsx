import React, { useMemo, useState } from 'react'
import {
  ClockCounterClockwise,
  Car,
  User,
  Wrench,
  Package,
  ShieldCheck,
  Printer,
  CalendarBlank,
  Gauge,
  CheckCircle,
  Hash,
  X,
} from '@phosphor-icons/react'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { obterHistoricoCompletoVeiculo } from '../../constants/mockVeiculosEstacionados'

export function ModalHistoricoManutencao({ isOpen, onClose, veiculo }) {
  const [modoImpressao, setModoImpressao] = useState(false)

  const historico = useMemo(() => {
    if (!veiculo) return []
    return obterHistoricoCompletoVeiculo(veiculo.placa, veiculo)
  }, [veiculo])

  const estatisticas = useMemo(() => {
    const totalOS = historico.length
    const totalGasto = historico.reduce((acc, curr) => acc + (Number(curr.valorTotal) || 0), 0)
    const ultimaOS = historico[0] || null
    return { totalOS, totalGasto, ultimaOS }
  }, [historico])

  if (!isOpen || !veiculo) return null

  const handleImprimir = () => {
    window.print()
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_historico_estacionado"
      larguraPadrao={840}
      alturaPadrao={640}
      larguraMinima={520}
      alturaMinima={420}
      titulo="Prontuário e Histórico de Manutenções"
      subtitulo={`Veículo ${veiculo.marcaModelo || ''} - Placa ${veiculo.placa || ''}`}
      badge="Histórico Preservado"
      icone={ClockCounterClockwise}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-sky-600" />
            <span>Histórico técnico integral mantido após a venda</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300 shadow-2xs"
            >
              <Printer size={15} />
              <span>Imprimir Prontuário</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Fechar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Bloco de Informações do Veículo */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-200">
                <Car size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">
                    {veiculo.marcaModelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim()}
                  </h3>
                  <span className="font-mono font-bold text-xs bg-white text-slate-900 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                    {veiculo.placa}
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                    {veiculo.codigoVeiculo || '—'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ano: <span className="font-medium text-slate-700">{veiculo.ano || '—'}</span> • Cor:{' '}
                  <span className="font-medium text-slate-700">{veiculo.cor || '—'}</span> • Combustível:{' '}
                  <span className="font-medium text-slate-700">{veiculo.combustivel || 'FLEX'}</span> • KM Atual:{' '}
                  <span className="font-mono font-medium text-slate-800">{veiculo.kmAtual || '—'} km</span>
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="text-[11px] font-medium text-slate-500">Antigo Proprietário</div>
              <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                {veiculo.antigoClienteNome || 'Cliente não identificado'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                {veiculo.antigoClienteTelefone || 'Sem telefone'}
              </div>
            </div>
          </div>

          {/* Cards de Resumo de Manutenções */}
          <div className="grid grid-cols-3 gap-2.5 mt-3">
            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Ordens de Serviço
              </span>
              <span className="text-base font-bold text-slate-900">{estatisticas.totalOS}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Investido
              </span>
              <span className="text-base font-bold text-sky-700">
                R$ {estatisticas.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-2.5">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Última Passagem
              </span>
              <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                {estatisticas.ultimaOS ? `${estatisticas.ultimaOS.dataEntrada} (${estatisticas.ultimaOS.km} km)` : 'Nenhuma'}
              </span>
            </div>
          </div>
        </div>

        {/* Linha do Tempo / Lista de Manutenções */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <ClockCounterClockwise size={15} className="text-sky-600" />
            <span>Histórico de Serviços e Peças Registradas</span>
          </h4>

          {historico.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <ClockCounterClockwise size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">Nenhum histórico de manutenção registrado</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Novas ordens de serviço abertas para este veículo serão vinculadas automaticamente ao prontuário.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico.map((os, index) => (
                <div
                  key={os.numeroOS || index}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:border-slate-300 transition-colors"
                >
                  {/* Cabeçalho da Ordem de Serviço */}
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                        OS #{os.numeroOS}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <CalendarBlank size={13} className="text-slate-500" />
                        {os.dataEntrada || '—'}
                      </span>
                      <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
                        <Gauge size={13} className="text-slate-500" />
                        {os.km ? `${os.km} km` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500">
                        Responsável: <strong className="text-slate-800">{os.mecanicoNome || 'Mecânica Gabriel'}</strong>
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        R$ {Number(os.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Corpo com Laudo e Listas de Peças e Serviços */}
                  <div className="p-4 space-y-3">
                    {/* Laudo Técnico */}
                    {os.laudoTecnico && (
                      <div className="bg-slate-50/70 border-l-2 border-sky-600 p-2.5 rounded-r-lg text-xs text-slate-700">
                        <strong className="text-slate-900 block text-[11px] uppercase tracking-wider mb-0.5">
                          Diagnóstico e Laudo Técnico:
                        </strong>
                        {os.laudoTecnico}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Serviços Executados */}
                      <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/40">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-2">
                          <Wrench size={13} className="text-sky-600" />
                          Serviços Executados ({os.servicos?.length || 0})
                        </span>
                        {os.servicos && os.servicos.length > 0 ? (
                          <ul className="space-y-1.5">
                            {os.servicos.map((s, sIdx) => (
                              <li key={sIdx} className="text-xs flex items-center justify-between text-slate-700">
                                <span className="truncate pr-2">• {s.nome}</span>
                                <span className="font-mono text-[11px] text-slate-600 font-semibold shrink-0">
                                  R$ {Number(s.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Nenhum serviço discriminado</span>
                        )}
                      </div>

                      {/* Peças Substituídas */}
                      <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/40">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-2">
                          <Package size={13} className="text-sky-600" />
                          Peças e Insumos Substituídos ({os.pecas?.length || 0})
                        </span>
                        {os.pecas && os.pecas.length > 0 ? (
                          <ul className="space-y-1.5">
                            {os.pecas.map((p, pIdx) => (
                              <li key={pIdx} className="text-xs flex items-center justify-between text-slate-700">
                                <span className="truncate pr-2">
                                  • {p.quantidade ? `${p.quantidade}x ` : ''}
                                  {p.nome}
                                </span>
                                <span className="font-mono text-[11px] text-slate-600 font-semibold shrink-0">
                                  R$ {Number(p.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Nenhuma peça discriminada</span>
                        )}
                      </div>
                    </div>

                    {/* Rodapé da OS com Garantia */}
                    {os.garantiaAte && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>Garantia de Serviços e Peças: <strong>{os.garantiaAte}</strong></span>
                        {os.clienteNaEpoca && (
                          <span>Proprietário na época: <strong>{os.clienteNaEpoca}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
