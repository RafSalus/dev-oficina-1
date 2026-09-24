import React from 'react'
import { CreditCard, ShieldWarning } from '@phosphor-icons/react'
import { AprovacaoItensCategoria } from './AprovacaoItensCategoria'

/**
 * Aba principal de Orçamento: Exibe resumo financeiro, facilidades de pagamento,
 * itens adicionais pendentes e listas de peças/serviços com toggle de aprovação (NFR17).
 *
 * @param {Object} props
 * @param {Object} props.totais - Totais calculados (subtotais, totalGeral, pix, 10x)
 * @param {Array} props.itensAprovaveis - Itens normalizados da OS
 * @param {Array} [props.itensAdicionaisOS] - Itens adicionais da fase de execução
 * @param {Object} props.respostasLocais - Mapa de itens aprovados/recusados
 * @param {boolean} props.estaAprovado - Se o orçamento já foi formalmente aprovado
 * @param {(itemId: string, classificacao: string) => void} props.onToggleItem - Alternar item
 * @param {(fotoUrl: string) => void} props.onVerFoto - Abrir zoom de foto
 * @param {(adicionalId: string, resposta: 'aprovado'|'recusado') => void} [props.onResponderItemAdicional] - Responder aditivo
 */
export function AprovacaoOrcamentoTab({
  totais,
  itensAprovaveis,
  itensAdicionaisOS = [],
  respostasLocais,
  estaAprovado,
  onToggleItem,
  onVerFoto,
  onResponderItemAdicional,
}) {
  const pecas = itensAprovaveis.filter((it) => it.categoria === 'peca')
  const servicos = itensAprovaveis.filter((it) => it.categoria === 'servico')
  const terceiros = itensAprovaveis.filter((it) => it.categoria === 'terceiro')

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Cards de Resumo Financeiro */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs">
          <span className="text-[10px] font-bold text-[#667085] uppercase block">
            Peças e Materiais
          </span>
          <span className="text-base font-extrabold text-[#101828] mt-0.5 block">
            R$ {totais.subTotalPecas.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs">
          <span className="text-[10px] font-bold text-[#667085] uppercase block">
            Mão de Obra
          </span>
          <span className="text-base font-extrabold text-[#101828] mt-0.5 block">
            R$ {totais.subTotalServicos.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs">
          <span className="text-[10px] font-bold text-[#667085] uppercase block">
            Serviços de Terceiros
          </span>
          <span className="text-base font-extrabold text-[#101828] mt-0.5 block">
            R$ {totais.subTotalTerceiros.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-[#101828] text-white rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-white/70 uppercase block">
            Total da Ordem
          </span>
          <span className="text-base font-black text-[#38bdf8] mt-0.5 block">
            R$ {totais.totalGeral.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 2. Condições e Facilidades de Pagamento */}
      <div className="p-4 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <CreditCard size={18} weight="bold" className="text-[#0284c7]" />
          <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider">
            Condições de Pagamento Disponíveis
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#101828] block">
                À Vista no PIX ou Dinheiro
              </span>
              <span className="text-[11px] text-[#0284c7] font-semibold block">
                5% de desconto promocional
              </span>
            </div>
            <span className="text-sm font-extrabold text-[#101828]">
              R$ {totais.valorPixComDesconto.toFixed(2)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#d0d5dd] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#101828] block">
                Cartão de Crédito
              </span>
              <span className="text-[11px] text-[#667085] block">
                Em até 10x sem juros
              </span>
            </div>
            <span className="text-sm font-extrabold text-[#101828]">
              10x de R$ {totais.valorParcelado10x}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Itens Identificados Durante a Execução (Fase 5 — aditivos) */}
      {itensAdicionaisOS.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
            <ShieldWarning size={16} weight="bold" className="text-amber-700" />
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Itens Identificados Durante a Execução
            </span>
          </div>
          <div className="divide-y divide-[#eaecf0]">
            {itensAdicionaisOS.map((item) => {
              const isPendente = item.status === 'pendente_cliente'
              return (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#101828] line-clamp-1">
                        {item.descricao}
                      </span>
                      {item.classificacao === 'seguranca' && (
                        <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold">
                          Segurança
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#667085]">
                      R$ {Number(item.valorEstimado || 0).toFixed(2)}
                    </span>
                  </div>
                  {isPendente ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onResponderItemAdicional?.(item.id, 'recusado')}
                        className="h-8 px-2.5 rounded-lg border border-[#d0d5dd] text-[#475467] text-[11px] font-bold cursor-pointer hover:bg-[#f2f4f7]"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        onClick={() => onResponderItemAdicional?.(item.id, 'aprovado')}
                        className="h-8 px-2.5 rounded-lg bg-[#101828] hover:bg-black text-white text-[11px] font-bold cursor-pointer"
                      >
                        Aprovar
                      </button>
                    </div>
                  ) : item.status === 'aprovado' ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#101828] text-white text-[10px] font-bold shrink-0">
                      Aprovado
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#f2f4f7] text-[#667085] text-[10px] font-bold shrink-0">
                      Recusado
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. Categorias de Itens */}
      <AprovacaoItensCategoria
        titulo="Peças e Componentes de Reposição"
        itens={pecas}
        respostasLocais={respostasLocais}
        estaAprovado={estaAprovado}
        onToggleItem={onToggleItem}
        onVerFoto={onVerFoto}
      />

      <AprovacaoItensCategoria
        titulo="Serviços Mecânicos e Mão de Obra"
        itens={servicos}
        respostasLocais={respostasLocais}
        estaAprovado={estaAprovado}
        onToggleItem={onToggleItem}
        onVerFoto={onVerFoto}
      />

      {terceiros.length > 0 && (
        <AprovacaoItensCategoria
          titulo="Serviços Especializados de Terceiros"
          itens={terceiros}
          respostasLocais={respostasLocais}
          estaAprovado={estaAprovado}
          onToggleItem={onToggleItem}
          onVerFoto={onVerFoto}
        />
      )}
    </div>
  )
}
