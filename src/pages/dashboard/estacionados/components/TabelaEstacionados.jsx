import React from 'react'
import {
  Garage,
  Plus,
  ClockCounterClockwise,
  UserPlus,
  WhatsappLogo,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react'
import { obterHistoricoCompletoVeiculo } from '../../../../repositories/veiculosEstacionadosRepository'
import { formatarTelefone } from '../../../../utils/fiscalValidators'

export function TabelaEstacionados({
  estacionados,
  temFiltroAtivo,
  onLimparFiltros,
  onAbrirEstacionar,
  onAbrirHistorico,
  onAbrirVincular,
  onAbrirEditar,
  onExcluir,
}) {
  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {estacionados.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Garage size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Nenhum veículo estacionado encontrado
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {temFiltroAtivo
                  ? 'Nenhum veículo corresponde aos filtros selecionados. Tente ajustar os termos de pesquisa.'
                  : 'Quando clientes venderem seus veículos para novos proprietários que ainda não são clientes da oficina, estacione-os aqui para preservar o histórico.'}
              </p>
              {temFiltroAtivo ? (
                <button
                  type="button"
                  onClick={onLimparFiltros}
                  className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                >
                  Limpar todos os filtros
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onAbrirEstacionar}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus size={14} weight="bold" />
                  <span>Estacionar Primeiro Veículo</span>
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                  <th className="py-3 px-4">Código e Placa</th>
                  <th className="py-3 px-4">Veículo</th>
                  <th className="py-3 px-4">Antigo Proprietário</th>
                  <th className="py-3 px-4">Novo Dono Provisório</th>
                  <th className="py-3 px-4">Histórico Acumulado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {estacionados.map((v) => {
                  const foneAntigoLimpo = (v.antigoClienteTelefone || '').replace(/\D/g, '')
                  const foneNovoLimpo = (v.novoDonoTelefone || '').replace(/\D/g, '')
                  const historico = obterHistoricoCompletoVeiculo(v.placa, v)

                  return (
                    <tr
                      key={v.id || v.placa}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Código e Placa */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                            {v.placa}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {v.codigoVeiculo || '—'}
                          </span>
                        </div>
                        {v.chassi && (
                          <div className="text-[10px] text-slate-400 font-mono mt-1 truncate max-w-[140px]" title={v.chassi}>
                            Chassi: {v.chassi}
                          </div>
                        )}
                      </td>

                      {/* Veículo (Marca, Modelo, Ano, Cor, Combustível, KM) */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                          <span>Ano: {v.ano || '—'}</span>
                          {v.cor && <span>• {v.cor}</span>}
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            {v.combustivel || 'FLEX'}
                          </span>
                          {v.kmAtual && (
                            <span className="font-mono text-slate-700 font-medium">
                              • {v.kmAtual} km
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Antigo Proprietário */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate" title={v.antigoClienteNome}>
                          {v.antigoClienteNome || 'Cliente não identificado'}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          {v.antigoClienteTelefone && (
                            <span className="font-mono">{formatarTelefone(v.antigoClienteTelefone)}</span>
                          )}
                          {foneAntigoLimpo && (
                            <a
                              href={`https://wa.me/55${foneAntigoLimpo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-1 rounded transition-colors"
                              title="WhatsApp Antigo Proprietário"
                            >
                              <WhatsappLogo size={10} weight="fill" />
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Estacionado em: {v.dataEstacionamento || '—'}
                        </div>
                      </td>

                      {/* Novo Dono Provisório */}
                      <td className="py-3 px-4 max-w-xs">
                        {v.novoDonoNome ? (
                          <div>
                            <div className="font-semibold text-sky-800 truncate" title={v.novoDonoNome}>
                              {v.novoDonoNome}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                              {v.novoDonoTelefone && (
                                <span className="font-mono">{formatarTelefone(v.novoDonoTelefone)}</span>
                              )}
                              {foneNovoLimpo && (
                                <a
                                  href={`https://wa.me/55${foneNovoLimpo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-1 rounded transition-colors"
                                  title="WhatsApp Novo Dono"
                                >
                                  <WhatsappLogo size={10} weight="fill" />
                                </a>
                              )}
                            </div>
                            {v.observacoes && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[180px]" title={v.observacoes}>
                                {v.observacoes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            <span>Aguardando identificação</span>
                          </span>
                        )}
                      </td>

                      {/* Histórico Acumulado */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onAbrirHistorico(v)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
                          title="Visualizar histórico completo de manutenções"
                        >
                          <ClockCounterClockwise size={14} weight="bold" />
                          <span>{historico.length} manutenções</span>
                        </button>
                        {historico[0] && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Última OS: #{historico[0].numeroOS} ({historico[0].dataEntrada})
                          </div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => onAbrirVincular(v)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
                            title="Vincular a cliente existente ou cadastrar novo"
                          >
                            <UserPlus size={14} weight="bold" />
                            <span>Vincular</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onAbrirHistorico(v)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                            title="Ver Prontuário de Manutenções"
                          >
                            <ClockCounterClockwise size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onAbrirEditar(v)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                            title="Editar Informações do Estacionado"
                          >
                            <PencilSimple size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onExcluir(v)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Excluir Registro"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
