import React from 'react'
import { Car, Plus, Trash, MagnifyingGlass } from '@phosphor-icons/react'
import { FormNovoVeiculoCliente } from './FormNovoVeiculoCliente'

function TabelaVeiculos({ veiculosDoCliente, veiculos }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-56 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
            <th className="py-2 px-3">Código</th>
            <th className="py-2 px-3">Placa</th>
            <th className="py-2 px-3">Marca e Modelo</th>
            <th className="py-2 px-3">Ano / Mod.</th>
            <th className="py-2 px-3">Cor</th>
            <th className="py-2 px-3">Combustível</th>
            <th className="py-2 px-3">KM Padrão</th>
            <th className="py-2 px-3 text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {veiculos.exibidos.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-4 text-center text-xs text-slate-400 italic">
                Nenhum veículo encontrado com o filtro "{veiculos.filtro}".
              </td>
            </tr>
          ) : (
            veiculos.exibidos.map((v, index) => {
              // A lista pode estar filtrada: remove pelo índice na lista completa do cliente
              const idxOriginal = veiculosDoCliente.findIndex((item) => item === v || (item.placa === v.placa && item.placa))
              const idxRemover = idxOriginal !== -1 ? idxOriginal : index
              return (
                <tr key={v.value || v.placa || index} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-2 px-3">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {v.codigoVeiculo || '—'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {v.placa}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-semibold text-slate-800">{v.marcaModelo || `${v.marca || ''} ${v.modelo || ''}`.trim()}</span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">{v.ano || '—'}</td>
                  <td className="py-2 px-3 text-slate-600">{v.cor || '—'}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      {v.combustivel || 'FLEX'}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600">{v.kmPadrao ? `${v.kmPadrao} km` : '—'}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => veiculos.remover(idxRemover)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Remover veículo"
                    >
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Seção "Veículos Vinculados": inclusão com FIPE, filtro para frotistas (3+ veículos)
 * e tabela com remoção.
 * @param {{cliente: object}} props - Retorno de `useClienteForm()`.
 */
export function SecaoVeiculosCliente({ cliente }) {
  const { veiculos } = cliente
  const lista = cliente.form.veiculos

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Car size={16} className="text-sky-600" />
          <span>Veículos Vinculados ({lista.length})</span>
        </div>
        {!veiculos.adicionando && (
          <button
            type="button"
            onClick={veiculos.abrirInclusao}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} weight="bold" />
            <span>Incluir Veículo</span>
          </button>
        )}
      </div>

      {veiculos.adicionando && <FormNovoVeiculoCliente veiculos={veiculos} />}

      {lista.length === 0 ? (
        <div className="p-4 text-center border border-dashed border-slate-300 rounded-lg bg-white">
          <Car size={24} className="mx-auto text-slate-400 mb-1" />
          <p className="text-xs text-slate-500">Nenhum veículo vinculado a este cliente ainda. Clique em "Incluir Veículo" acima.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Busca rápida para frotistas (3 ou mais veículos) */}
          {lista.length >= 3 && (
            <div className="relative">
              <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={veiculos.filtro}
                onChange={(e) => veiculos.setFiltro(e.target.value)}
                placeholder="Filtrar veículos da frota por placa, marca ou modelo..."
                className="w-full h-7.5 pl-8 pr-3 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-400"
              />
            </div>
          )}
          <TabelaVeiculos veiculosDoCliente={lista} veiculos={veiculos} />
        </div>
      )}
    </div>
  )
}
