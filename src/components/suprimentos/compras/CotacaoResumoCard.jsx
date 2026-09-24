import React from 'react'
import { CheckCircle, Clock, Package, Copy, Car, PencilSimple, Trash, ShareNetwork, Eye } from '@phosphor-icons/react'
import { fornecedoresComProposta } from '../../../utils/compras/cotacaoHelpers'

function CotacaoStatusBadge({ isAprovada, isRespondida, totalPropostas }) {
  if (isAprovada) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#101828] text-white">
        <CheckCircle size={11} weight="fill" />
        <span>Cotação Aprovada</span>
      </span>
    )
  }
  if (isRespondida) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
        <Clock size={11} weight="bold" />
        <span>Propostas Recebidas ({totalPropostas})</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
      <Clock size={11} weight="bold" />
      <span>Aguardando Fornecedores</span>
    </span>
  )
}

/**
 * Card de uma cotação na aba "Cotações de Peças": veículo, lista de peças,
 * propostas das autopeças e ações (visualizar, WhatsApp, abrir, aprovar, excluir).
 * @param {{
 *   cotacao: object, onVisualizar: Function, onCopiarWhatsApp: Function,
 *   onAbrir: Function, onAprovar: Function, onExcluir: Function
 * }} props
 */
export function CotacaoResumoCard({ cotacao, onVisualizar, onCopiarWhatsApp, onAbrir, onAprovar, onExcluir }) {
  const dataFormatada = new Date(cotacao.dataCriacao).toLocaleDateString('pt-BR')
  const totalItens = cotacao.itens ? cotacao.itens.length : 0
  const respondidos = fornecedoresComProposta(cotacao.fornecedoresCotados)
  const isAprovada = cotacao.status === 'APROVADA'
  const isRespondida = cotacao.status === 'RESPONDIDA' || respondidos.length > 0

  return (
    <div
      className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
        isAprovada ? 'border-slate-300' : isRespondida ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'
      }`}
    >
      {/* Topo do Card da Cotação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center font-bold text-xs border border-sky-100 shrink-0">
            <ShareNetwork size={20} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-sm">{cotacao.id}</span>
              <CotacaoStatusBadge
                isAprovada={isAprovada}
                isRespondida={isRespondida}
                totalPropostas={respondidos.length}
              />
            </div>

            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              {cotacao.numeroOS ? (
                <span className="font-semibold text-slate-800">Ordem de Serviço #{cotacao.numeroOS}</span>
              ) : (
                <span>Reposição de Almoxarifado</span>
              )}
              <span>•</span>
              <span>{dataFormatada}</span>
              {cotacao.mecanicoNome && (
                <>
                  <span>•</span>
                  <span>Mecânico: {cotacao.mecanicoNome}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          <div className="font-bold text-slate-900 text-xs flex items-center sm:justify-end gap-1.5">
            <Car size={15} className="text-slate-500" />
            <span>{cotacao.veiculoModelo || 'Veículo em Manutenção'}</span>
            {cotacao.veiculoPlaca && (
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-800">
                {cotacao.veiculoPlaca}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cliente: {cotacao.clienteNome || 'Oficina / Balcão'}</div>
        </div>
      </div>

      {/* Lista de peças que estão em cotação */}
      <div className="my-3.5 p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Package size={15} className="text-[#0284c7]" weight="bold" />
            <span>Peças nesta cotação ({totalItens} {totalItens === 1 ? 'item' : 'itens'}):</span>
          </span>
          <span className="text-[11px] text-slate-400">Especificações técnicas e marcas enviadas às autopeças</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
          {(cotacao.itens || []).map((it, idx) => (
            <div
              key={it.id || idx}
              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs flex items-start justify-between gap-2 shadow-2xs"
            >
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate">{it.nome}</span>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                  <span>Cód: {it.codigo || 'S/N'}</span>
                  {it.marcaSugerida && (
                    <span className="text-slate-700 font-semibold truncate">• {it.marcaSugerida}</span>
                  )}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] font-bold text-[11px] font-mono shrink-0">
                {it.quantidade} {it.unidade}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé do Card com Fornecedores e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Autopeças:</span>
          {(cotacao.fornecedoresCotados || []).map((f) => {
            const temPreco = f.status === 'RESPONDIDA' && f.valorTotal > 0
            return (
              <span
                key={f.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  temPreco ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span>{f.nome}</span>
                {temPreco && (
                  <strong className="font-mono text-slate-900">(R$ {Number(f.valorTotal).toFixed(2)})</strong>
                )}
              </span>
            )
          })}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onVisualizar(cotacao)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Visualizar como a autopeça parceira enxerga esta página de cotação"
          >
            <Eye size={14} weight="bold" className="text-[#0284c7]" />
            <span className="hidden lg:inline">Visualizar Página</span>
          </button>

          <button
            type="button"
            onClick={() => onCopiarWhatsApp(cotacao)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Copiar link da cotação para o WhatsApp dos fornecedores"
          >
            <Copy size={14} />
            <span className="hidden md:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => onAbrir(cotacao)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sky-200 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Abrir cotação completa para visualizar itens e preencher preços"
          >
            <PencilSimple size={14} weight="bold" />
            <span>Abrir Cotação</span>
          </button>

          {!isAprovada && (
            <button
              type="button"
              onClick={() => onAprovar(cotacao)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Aprovar a proposta e gerar o Pedido de Compra oficial"
            >
              <CheckCircle size={14} weight="bold" />
              <span>Aprovar e Comprar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onExcluir(cotacao)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Excluir cotação"
          >
            <Trash size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
