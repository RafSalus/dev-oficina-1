import React from 'react'
import {
  Users,
  PencilSimple,
  Trash,
  WhatsappLogo,
  Car,
  MapPin,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../../../utils/fiscalValidators'

export function TabelaClientes({ workflow }) {
  const {
    clientesFiltrados,
    busca,
    filtrosAtivos,
    abrirEditar,
    abrirFrota,
    alternarStatus,
    iniciarExclusao,
  } = workflow

  return (
    <div className="flex-1 overflow-auto no-scrollbar p-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {clientesFiltrados.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users size={24} />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Nenhum cliente encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {busca || filtrosAtivos
                ? 'Nenhum resultado corresponde aos filtros aplicados.'
                : 'Nenhum cliente cadastrado na base ainda.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Código e Cliente</th>
                <th className="py-3 px-4">Documento (CPF / CNPJ)</th>
                <th className="py-3 px-4">Contato Principal</th>
                <th className="py-3 px-4">Veículos Vinculados</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {clientesFiltrados.map((cli) => {
                const docLimpo = (cli.documento || '').replace(/\D/g, '')
                const isPF =
                  cli.tipoPessoa === 'F' || (!cli.tipoPessoa && docLimpo.length <= 11)
                const foneOriginal = cli.telefone || ''
                const foneNumeros = foneOriginal.replace(/\D/g, '')
                const docFormatado = isPF ? formatarCPF(docLimpo) : formatarCNPJ(docLimpo)
                const veiculosList = cli.veiculos || []

                return (
                  <tr
                    key={cli.value || cli.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        {cli.codigoCliente && (
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {cli.codigoCliente}
                          </span>
                        )}
                        <div className="font-semibold text-slate-900 truncate">
                          {cli.nome}
                        </div>
                      </div>
                      {cli.nomeFantasia && cli.nomeFantasia !== cli.nome && (
                        <div className="text-[11px] text-slate-500 truncate pl-0.5 mt-0.5">
                          Apelido/Fantasia: {cli.nomeFantasia}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isPF
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isPF ? 'PF' : 'PJ'}
                        </span>
                        <span className="font-semibold">{docFormatado || cli.documento}</span>
                      </div>
                      {cli.rgIe && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {isPF ? `RG: ${cli.rgIe}` : `IE: ${cli.rgIe}`}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-700 font-medium">
                          {formatarTelefone(foneOriginal)}
                        </span>
                        {foneNumeros && (
                          <a
                            href={`https://wa.me/55${foneNumeros}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
                            title="Abrir WhatsApp"
                          >
                            <WhatsappLogo size={12} weight="fill" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                      {cli.email && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[170px]">
                          {cli.email}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 min-w-[210px] max-w-[280px]">
                      {veiculosList.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">
                          Nenhum veículo vinculado
                        </span>
                      ) : veiculosList.length === 1 ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                            {veiculosList[0].placa}
                          </span>
                          <div className="min-w-0">
                            <span
                              className="text-xs font-semibold text-slate-800 truncate block max-w-[170px]"
                              title={veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
                            >
                              {veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
                            </span>
                            {veiculosList[0].ano && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                Ano: {veiculosList[0].ano}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : veiculosList.length === 2 ? (
                        <div className="space-y-1.5">
                          {veiculosList.map((v, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[10px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                {v.placa}
                              </span>
                              <span
                                className="text-xs font-medium text-slate-800 truncate max-w-[170px]"
                                title={v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                              >
                                {v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}
                              </span>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => abrirFrota(cli)}
                            className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold underline block cursor-pointer transition-colors"
                          >
                            Ver detalhes da frota (2)
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[10px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                              {veiculosList[0].placa}
                            </span>
                            <span
                              className="text-xs font-semibold text-slate-800 truncate max-w-[170px]"
                              title={veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
                            >
                              {veiculosList[0].marcaModelo || `${veiculosList[0].marca || ''} ${veiculosList[0].modelo || ''}`.trim()}
                            </span>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => abrirFrota(cli)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border border-sky-200 transition-colors cursor-pointer group shadow-2xs"
                              title={`Ver todos os ${veiculosList.length} veículos da frota`}
                            >
                              <Car size={13} weight="bold" className="text-sky-600" />
                              <span>Frota com {veiculosList.length} veículos</span>
                              <ArrowSquareOut
                                size={12}
                                weight="bold"
                                className="text-sky-500 group-hover:text-sky-700 group-hover:translate-x-0.5 transition-transform"
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin size={13} className="text-slate-400" />
                        <span>
                          {cli.cidade || 'Apucarana'} - {cli.uf || 'PR'}
                        </span>
                      </div>
                      {cli.bairro && (
                        <div className="text-slate-400 text-[10px] pl-4 truncate max-w-[160px]">
                          {cli.bairro}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => alternarStatus(cli.value || cli.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          cli.ativo !== false
                            ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Clique para alternar o status"
                      >
                        {cli.ativo !== false ? (
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
                          onClick={() => abrirEditar(cli)}
                          className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                          title="Editar Cliente"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            iniciarExclusao(cli.value || cli.id, cli.nome)
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Excluir Cliente"
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
