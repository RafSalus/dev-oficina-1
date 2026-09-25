import React from 'react'
import { Package, Wrench, MagnifyingGlass, Plus } from '@phosphor-icons/react'
import { formatMoeda } from '../pdvData'

export function PDVCatalogo({
  abaCatalogo = 'pecas',
  onTrocarAba,
  buscaCatalogo = '',
  onBuscaCatalogoChange,
  pecas = [],
  servicos = [],
  onAdicionarPeca,
  onAdicionarServico,
}) {
  return (
    <div className="min-h-0 flex flex-col bg-white border border-[#e4e7ec] rounded-2xl overflow-hidden">
      <div className="shrink-0 px-4 pt-3.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onTrocarAba?.('pecas')}
          className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            abaCatalogo === 'pecas' ? 'bg-[#101828] text-white' : 'bg-[#f8fafc] text-[#475467] hover:bg-[#f2f4f7]'
          }`}
        >
          <Package size={15} weight="bold" />
          Peças e Produtos
        </button>
        <button
          type="button"
          onClick={() => onTrocarAba?.('servicos')}
          className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            abaCatalogo === 'servicos' ? 'bg-[#101828] text-white' : 'bg-[#f8fafc] text-[#475467] hover:bg-[#f2f4f7]'
          }`}
        >
          <Wrench size={15} weight="bold" />
          Serviços
        </button>
      </div>

      <div className="shrink-0 px-4 pt-3">
        <div className="relative">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
          />
          <input
            type="text"
            value={buscaCatalogo}
            onChange={(e) => onBuscaCatalogoChange?.(e.target.value)}
            placeholder={
              abaCatalogo === 'pecas'
                ? 'Buscar por nome, código ou GTIN/EAN...'
                : 'Buscar por nome ou código...'
            }
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#d0d5dd] text-xs font-semibold text-[#101828] bg-[#f8fafc] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-1.5">
        {abaCatalogo === 'pecas' &&
          (pecas.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#98a2b3] font-semibold">
              Nenhuma peça encontrada.
            </div>
          ) : (
            pecas.map((peca) => {
              const semEstoque = (Number(peca.estoqueAtual) || 0) <= 0
              return (
                <button
                  key={peca.id}
                  type="button"
                  onClick={() => onAdicionarPeca?.(peca)}
                  disabled={semEstoque}
                  className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[#eaecf0] hover:border-[#bae6fd] hover:bg-[#f0f9ff] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#101828] truncate">{peca.nome}</p>
                    <p className="text-[10.5px] text-[#667085] font-semibold">
                      Cód. {peca.codigo} • Estoque: {peca.estoqueAtual ?? 0} {peca.unidade || 'UN'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-bold text-[#101828]">R$ {formatMoeda(peca.precoVenda)}</span>
                    <span className="w-7 h-7 rounded-lg bg-[#e0f2fe] text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white flex items-center justify-center transition-all">
                      <Plus size={14} weight="bold" />
                    </span>
                  </div>
                </button>
              )
            })
          ))}

        {abaCatalogo === 'servicos' &&
          (servicos.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#98a2b3] font-semibold">
              Nenhuma serviço encontrado.
            </div>
          ) : (
            servicos.map((servico) => (
              <button
                key={servico.id}
                type="button"
                onClick={() => onAdicionarServico?.(servico)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-[#eaecf0] hover:border-[#bae6fd] hover:bg-[#f0f9ff] transition-all text-left cursor-pointer group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#101828] truncate">{servico.nome}</p>
                  <p className="text-[10.5px] text-[#667085] font-semibold">
                    Cód. {servico.codigo} • {servico.categoria || 'Serviço'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs font-bold text-[#101828]">
                    R$ {formatMoeda(servico.valorMaoDeObra)}
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-[#e0f2fe] text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white flex items-center justify-center transition-all">
                    <Plus size={14} weight="bold" />
                  </span>
                </div>
              </button>
            ))
          ))}
      </div>
    </div>
  )
}
