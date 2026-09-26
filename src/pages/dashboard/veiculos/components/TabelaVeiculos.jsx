import React from 'react'
import {
  Car,
  PencilSimple,
  Trash,
  ClipboardText,
  WhatsappLogo,
  Garage,
} from '@phosphor-icons/react'
import { formatarTelefone } from '../../../../utils/fiscalValidators'

export function TabelaVeiculos({ workflow }) {
  const {
    veiculosFiltrados,
    temFiltroAtivo,
    limparFiltros,
    alternarStatus,
    abrirEstacionar,
    iniciarOS,
    abrirEditar,
    iniciarExclusao,
    carregando,
    erro,
    recarregar,
  } = workflow

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {carregando ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-sky-600 mb-3" />
              <p className="text-xs text-slate-500">Carregando veículos...</p>
            </div>
          ) : erro ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <p className="text-sm font-semibold text-rose-600 mb-1">Não foi possível carregar os veículos.</p>
              <p className="text-xs text-slate-500 mb-3">{erro.message || 'Erro ao sincronizar frota.'}</p>
              <button
                type="button"
                onClick={recarregar}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          ) : veiculosFiltrados.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Car size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Nenhum veículo encontrado
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {temFiltroAtivo
                  ? 'Nenhum veículo corresponde aos filtros selecionados. Tente ajustar os termos de pesquisa.'
                  : 'A frota ainda não possui veículos cadastrados. Clique em "Novo Veículo" acima para começar.'}
              </p>
              {temFiltroAtivo && (
                <button
                  type="button"
                  onClick={limparFiltros}
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
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Placa</th>
                  <th className="py-3 px-4">Marca e Modelo</th>
                  <th className="py-3 px-4">Ano e Cor</th>
                  <th className="py-3 px-4">Combustível</th>
                  <th className="py-3 px-4">KM Atual</th>
                  <th className="py-3 px-4">Cliente Proprietário</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {veiculosFiltrados.map((v) => {
                  const isPF = v.clienteTipoPessoa === 'F'
                  const foneLimpo = (v.clienteTelefone || '').replace(/\D/g, '')

                  return (
                    <tr
                      key={v.id || v.value || v.placa}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          {v.codigoVeiculo || '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                          {v.placa}
                        </span>
                        {v.chassi && (
                          <div
                            className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]"
                            title={v.chassi}
                          >
                            Chassi: {v.chassi}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                        </div>
                        {v.marca && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            Montadora: {v.marca}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-mono font-medium">{v.ano || '—'}</div>
                        {v.cor && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                            {v.cor}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          {v.combustivel || 'FLEX'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {v.kmPadrao ? `${v.kmPadrao} km` : '—'}
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isPF
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isPF ? 'PF' : 'PJ'}
                          </span>
                          <span
                            className="font-semibold text-slate-800 truncate"
                            title={v.clienteNome}
                          >
                            {v.clienteNome || 'Cliente não identificado'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          {v.clienteCodigo && <span>Cód: {v.clienteCodigo}</span>}
                          {v.clienteTelefone && (
                            <span className="font-mono">
                              {formatarTelefone(v.clienteTelefone)}
                            </span>
                          )}
                          {foneLimpo && (
                            <a
                              href={`https://wa.me/55${foneLimpo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-1 rounded transition-colors"
                              title="WhatsApp"
                            >
                              <WhatsappLogo size={10} weight="fill" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => alternarStatus(v)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            v.ativo !== false
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Clique para alternar o status do veículo"
                        >
                          {v.ativo !== false ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                              <span>Ativo</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>Inativo</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => abrirEstacionar(v)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                            title="Estacionar veículo (Cliente vendeu o carro)"
                          >
                            <Garage size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => iniciarOS(v)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                            title="Abrir Nova Ordem de Serviço para este veículo"
                          >
                            <ClipboardText size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirEditar(v)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                            title="Editar Veículo"
                          >
                            <PencilSimple size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => iniciarExclusao(v)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Excluir Veículo"
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
    </div>
  )
}
