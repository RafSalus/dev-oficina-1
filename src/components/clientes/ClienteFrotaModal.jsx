import React, { useState, useMemo, useEffect } from 'react'
import {
  Car,
  X,
  MagnifyingGlass,
  PencilSimple,
  Copy,
  GasPump,
  Gauge,
  CalendarBlank,
  Palette,
  IdentificationBadge,
  Phone,
  MapPin,
  ClipboardText,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatarCPF, formatarCNPJ, formatarTelefone } from '../../utils/fiscalValidators'

/**
 * Modal para visualização completa e gestão de Frota de Veículos de um Cliente.
 * Especialmente projetado para frotistas, transportadoras e clientes com múltiplos veículos.
 */
export function ClienteFrotaModal({
  isOpen,
  onClose,
  cliente,
  onEditarCliente,
}) {
  const [busca, setBusca] = useState('')

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Limpa o termo de busca ao abrir novo cliente
  useEffect(() => {
    if (isOpen) {
      setBusca('')
    }
  }, [isOpen, cliente?.value, cliente?.id])

  const veiculos = useMemo(() => {
    return Array.isArray(cliente?.veiculos) ? cliente.veiculos : []
  }, [cliente?.veiculos])

  const veiculosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return veiculos

    return veiculos.filter((v) => {
      const placa = (v.placa || '').toLowerCase()
      const marca = (v.marca || '').toLowerCase()
      const modelo = (v.modelo || '').toLowerCase()
      const marcaModelo = (v.marcaModelo || '').toLowerCase()
      const ano = (v.ano || '').toLowerCase()
      const cor = (v.cor || '').toLowerCase()
      const combustivel = (v.combustivel || '').toLowerCase()

      return (
        placa.includes(termo) ||
        marca.includes(termo) ||
        modelo.includes(termo) ||
        marcaModelo.includes(termo) ||
        ano.includes(termo) ||
        cor.includes(termo) ||
        combustivel.includes(termo)
      )
    })
  }, [veiculos, busca])

  if (!isOpen || !cliente) return null

  const docLimpo = (cliente.documento || '').replace(/\D/g, '')
  const isPF = cliente.tipoPessoa === 'F' || (!cliente.tipoPessoa && docLimpo.length <= 11)
  const docFormatado = isPF ? formatarCPF(docLimpo) : formatarCNPJ(docLimpo)

  const handleCopiarPlaca = (placa) => {
    if (!placa) return
    navigator.clipboard.writeText(placa)
    toast.success(`Placa ${placa} copiada para a área de transferência!`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-frota-modal"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold shadow-2xs border border-sky-200">
              <Car size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="titulo-frota-modal"
                  className="text-base font-bold text-slate-900"
                >
                  Frota de Veículos
                </h2>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {veiculos.length} veículo{veiculos.length !== 1 ? 's' : ''} na frota
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Cliente: <span className="font-semibold text-slate-800">{cliente.nome}</span>
                {cliente.codigoCliente && (
                  <span className="ml-2 font-mono text-[11px] text-slate-600 bg-slate-200/70 px-1.5 py-0.2 rounded">
                    Cód: {cliente.codigoCliente}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Ficha Resumida do Cliente */}
        <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <IdentificationBadge size={14} className="text-slate-400" />
            <span className="font-medium text-slate-500">{isPF ? 'CPF:' : 'CNPJ:'}</span>
            <span className="font-mono font-semibold text-slate-800">{docFormatado || cliente.documento || 'Não informado'}</span>
          </div>

          {cliente.telefone && (
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-slate-400" />
              <span className="font-medium text-slate-500">Telefone:</span>
              <span className="font-mono font-semibold text-slate-800">{formatarTelefone(cliente.telefone)}</span>
            </div>
          )}

          {(cliente.cidade || cliente.uf) && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              <span className="font-medium text-slate-500">Localização:</span>
              <span className="font-semibold text-slate-800">
                {cliente.cidade || 'Apucarana'} - {cliente.uf || 'PR'}
              </span>
            </div>
          )}
        </div>

        {/* Barra de Pesquisa e Filtro de Veículos da Frota */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por placa, modelo, marca, cor ou ano..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-900"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Exibindo <span className="font-bold text-slate-800">{veiculosFiltrados.length}</span> de{' '}
            <span className="font-bold text-slate-800">{veiculos.length}</span> veículos
          </div>
        </div>

        {/* Listagem / Tabela da Frota */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {veiculosFiltrados.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
              <Car size={36} className="mx-auto text-slate-400 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Nenhum veículo encontrado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {busca
                  ? `Nenhum veículo da frota corresponde aos termos da pesquisa "${busca}".`
                  : 'Nenhum veículo cadastrado na frota deste cliente.'}
              </p>
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="mt-3 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Placa</th>
                    <th className="py-2.5 px-3">Marca e Modelo</th>
                    <th className="py-2.5 px-3">Ano / Mod.</th>
                    <th className="py-2.5 px-3">Cor</th>
                    <th className="py-2.5 px-3">Combustível</th>
                    <th className="py-2.5 px-3">KM Atual</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                  {veiculosFiltrados.map((v, idx) => {
                    const nomeCompleto =
                      v.marcaModelo ||
                      `${v.marca || ''} ${v.modelo || ''}`.trim() ||
                      'Não especificado'

                    return (
                      <tr
                        key={v.value || v.placa || idx}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Código do Veículo (Separado e Automático) */}
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {v.codigoVeiculo || '—'}
                          </span>
                        </td>

                        {/* Placa com destaque */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                              {v.placa}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopiarPlaca(v.placa)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-sky-600 transition-opacity cursor-pointer"
                              title="Copiar placa"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </td>

                        {/* Marca e Modelo */}
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{nomeCompleto}</div>
                          {v.marca && (
                            <div className="text-[10px] text-slate-500 font-medium">
                              Montadora: {v.marca}
                            </div>
                          )}
                        </td>

                        {/* Ano */}
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {v.ano || '—'}
                        </td>

                        {/* Cor */}
                        <td className="py-2.5 px-3 text-slate-700">
                          {v.cor || '—'}
                        </td>

                        {/* Combustível */}
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            {v.combustivel || 'FLEX'}
                          </span>
                        </td>

                        {/* KM */}
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                          {v.kmPadrao ? `${v.kmPadrao} km` : '—'}
                        </td>

                        {/* Ações */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onClose()
                              if (onEditarCliente) {
                                onEditarCliente(cliente)
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded border border-slate-200 transition-colors cursor-pointer"
                            title="Editar veículo no cadastro do cliente"
                          >
                            <PencilSimple size={13} />
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Total cadastrado: <span className="font-bold text-slate-800">{veiculos.length}</span> veículo{veiculos.length !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-2.5">
            {onEditarCliente && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onEditarCliente(cliente)
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <PencilSimple size={14} weight="bold" />
                <span>Gerenciar Frota no Cadastro</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-md text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
