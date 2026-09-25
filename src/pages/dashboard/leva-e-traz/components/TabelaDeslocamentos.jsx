import React from 'react'
import {
  ArrowsLeftRight,
  Car,
  User,
  Package,
  Wrench,
  Play,
  CheckCircle,
  WhatsappLogo,
  Eye,
  Trash,
} from '@phosphor-icons/react'
import { GoogleMapsIcon } from '../../../../components/icons/GoogleMapsIcon'
import { gerarLinkGoogleMapsTrajeto } from '../../../../utils/googleMapsRouting'

export function TabelaDeslocamentos({
  deslocamentos,
  abaAtiva,
  temFiltroAtivo,
  onLimparFiltros,
  onIniciarViagem,
  onAbrirFinalizar,
  onAbrirDetalhes,
  onExcluir,
}) {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {deslocamentos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ArrowsLeftRight size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Nenhum atendimento de logística encontrado
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {temFiltroAtivo
                ? 'Nenhum deslocamento corresponde aos filtros selecionados. Tente ajustar os termos de pesquisa.'
                : abaAtiva === 'roteiro'
                ? 'Não há deslocamentos ativos ou agendados na fila no momento. Clique em "Novo Deslocamento" para agendar.'
                : 'Nenhum histórico de viagem arquivado.'}
            </p>
            {temFiltroAtivo && (
              <button
                type="button"
                onClick={onLimparFiltros}
                className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                <th className="py-3 px-4">Código e Status</th>
                <th className="py-3 px-4">Tipo de Missão</th>
                <th className="py-3 px-4">Cliente ou Fornecedor</th>
                <th className="py-3 px-4">Equipe e Veículo de Apoio</th>
                <th className="py-3 px-4">Destino e Prazos</th>
                <th className="py-3 px-4">Quilometragem</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {deslocamentos.map((d) => {
                const foneLimpo = (d.clienteTelefone || d.fornecedorTelefone || '').replace(/\D/g, '')

                return (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Código e Status */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded">
                          {d.codigo}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'concluido'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : d.status === 'em_deslocamento'
                              ? 'bg-[#101828] text-white'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {d.status === 'concluido' ? (
                            'Concluído'
                          ) : d.status === 'em_deslocamento' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                              <span>Em Rota</span>
                            </>
                          ) : (
                            'Agendado'
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Tipo de Missão */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {d.tipoServico === 'busca_veiculo' && <Car size={14} className="text-sky-600" />}
                        {d.tipoServico === 'entrega_veiculo' && <Car size={14} className="text-sky-600" />}
                        {d.tipoServico === 'translado_cliente' && <User size={14} className="text-sky-600" />}
                        {d.tipoServico === 'busca_pecas' && <Package size={14} className="text-sky-600" />}
                        {d.tipoServico === 'socorro_externo' && <Wrench size={14} className="text-sky-600" />}
                        <span>
                          {d.tipoServico === 'busca_veiculo'
                            ? 'Busca de Carro'
                            : d.tipoServico === 'entrega_veiculo'
                            ? 'Entrega de Carro'
                            : d.tipoServico === 'translado_cliente'
                            ? 'Leva e Traz de Cliente'
                            : d.tipoServico === 'busca_pecas'
                            ? 'Busca de Peças'
                            : 'Socorro Mecânico'}
                        </span>
                      </div>
                      {d.levarClienteEmbora && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                          Translado / Carona Ativa
                        </span>
                      )}
                    </td>

                    {/* Cliente ou Fornecedor */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {d.clienteNome || d.fornecedorNome || 'Destino operacional'}
                      </div>
                      {d.veiculoPlaca && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-mono font-bold text-slate-700">{d.veiculoPlaca}</span>
                          <span className="truncate max-w-[120px]">{d.veiculoModelo}</span>
                        </div>
                      )}
                      {d.pecasDescricao && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[160px]" title={d.pecasDescricao}>
                          {d.pecasDescricao}
                        </div>
                      )}
                    </td>

                    {/* Equipe e Veículo de Apoio */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {d.quantidadeFuncionarios === 2 ? '2 Funcionários' : '1 Funcionário'}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {d.motoristaPrincipalNome}
                        </span>
                      </div>
                      {d.auxiliarNome && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Auxiliar: <strong className="text-slate-700">{d.auxiliarNome}</strong>
                        </div>
                      )}
                      {d.veiculoApoioNome && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                          Apoio: {d.veiculoApoioNome}
                        </div>
                      )}
                    </td>

                    {/* Destino e Prazos */}
                    <td className="py-3 px-4 max-w-xs">
                      {d.enderecoDestino ? (
                        <a
                          href={gerarLinkGoogleMapsTrajeto({
                            origem: d.enderecoOrigem,
                            destino: d.enderecoDestino,
                            idaEVolta: d.idaEVolta !== false,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-sky-600 transition-colors group"
                          title="Clique para abrir trajeto no Google Maps"
                        >
                          <GoogleMapsIcon className="w-3.5 h-4 shrink-0 transition-transform group-hover:scale-110" />
                          <span className="truncate max-w-[170px]">{d.enderecoDestino}</span>
                        </a>
                      ) : (
                        <div className="font-medium text-slate-800">Oficina Gabriel</div>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        <span>Saída: <strong>{d.horarioSaidaReal || d.horarioSaidaPrevisto}</strong></span>
                        <span>•</span>
                        <span>Duração: <strong>{d.tempoRealMinutos ? `${d.tempoRealMinutos} min` : `${d.tempoEstimadoMinutos || 45} min`}</strong></span>
                      </div>
                    </td>

                    {/* Quilometragem */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {d.kmRealizado ? `${d.kmRealizado} km` : `${d.kmEstimado || '—'} km`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {d.tipoCobranca === 'cortesia' ? 'Cortesia' : `Taxa: R$ ${d.valorTaxa}`}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {d.status === 'agendado' && (
                          <button
                            type="button"
                            onClick={() => onIniciarViagem(d)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#101828] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            title="Iniciar Deslocamento / Sair da Oficina"
                          >
                            <Play size={12} weight="fill" />
                            <span>Iniciar</span>
                          </button>
                        )}

                        {d.status === 'em_deslocamento' && (
                          <button
                            type="button"
                            onClick={() => onAbrirFinalizar(d)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            title="Registrar Retorno e Finalizar Missão"
                          >
                            <CheckCircle size={13} weight="bold" />
                            <span>Concluir</span>
                          </button>
                        )}

                        {d.enderecoDestino && (
                          <a
                            href={gerarLinkGoogleMapsTrajeto({
                              origem: d.enderecoOrigem,
                              destino: d.enderecoDestino,
                              idaEVolta: d.idaEVolta !== false,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-700 hover:bg-sky-50 rounded transition-colors group"
                            title="Abrir no Google Maps e Iniciar Navegação GPS"
                          >
                            <GoogleMapsIcon className="w-3.5 h-4.5 transition-transform group-hover:scale-110" />
                          </a>
                        )}

                        {foneLimpo && (
                          <a
                            href={`https://wa.me/55${foneLimpo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                            title="WhatsApp"
                          >
                            <WhatsappLogo size={14} weight="fill" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => onAbrirDetalhes(d)}
                          className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                          title="Ver Detalhes do Deslocamento"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onExcluir(d)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Excluir Deslocamento"
                        >
                          <Trash size={15} />
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
  )
}
