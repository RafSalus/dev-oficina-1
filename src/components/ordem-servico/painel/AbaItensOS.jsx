import React from 'react'
import { Wrench, Package, Handshake, Camera } from '@phosphor-icons/react'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'
import { valorLiquidoTerceiro } from '../../../utils/ordemServico/osItensRapidos'

function SecaoItens({ Icone, titulo, total, vazio, itens, renderItem }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
          <Icone size={16} weight="bold" className="text-[#0284c7]" />
          {titulo} ({itens?.length || 0})
        </span>
        <span className="text-xs font-black text-[#101828]">R$ {formatMoeda(total)}</span>
      </div>
      <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white shadow-2xs">
        {!itens || itens.length === 0 ? (
          <p className="p-4 text-center text-[#98a2b3] italic text-xs">{vazio}</p>
        ) : (
          itens.map(renderItem)
        )}
      </div>
    </div>
  )
}

function ValorItem({ valor }) {
  return <span className="font-black text-[#101828] shrink-0 text-xs font-mono">R$ {formatMoeda(valor)}</span>
}

/**
 * Aba "Itens": peças (com foto e marcação Para Cotação), mão de obra e serviços de terceiros.
 * @param {{os: object, onVerFoto: (url: string) => void}} props
 */
export function AbaItensOS({ os, onVerFoto }) {
  return (
    <div className="space-y-4">
      <SecaoItens
        Icone={Package}
        titulo="Peças e Insumos"
        total={os.totalPecas}
        vazio="Nenhuma peça adicionada ainda."
        itens={os.pecasOS}
        renderItem={(p, idx) => (
          <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors gap-2.5">
            {p.fotoUrl ? (
              <button
                type="button"
                onClick={() => onVerFoto(p.fotoUrl)}
                className="w-10 h-10 rounded-lg overflow-hidden border border-[#d0d5dd] shrink-0 cursor-pointer"
                title="Ver foto da peça"
              >
                <img src={p.fotoUrl} alt={p.nome} className="w-full h-full object-cover" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-lg border border-dashed border-[#d0d5dd] bg-[#f8fafc] flex items-center justify-center text-[#98a2b3] shrink-0">
                <Camera size={15} weight="regular" />
              </div>
            )}
            <div className="min-w-0 pr-3 flex-1">
              <p className="font-bold text-[#101828] truncate text-xs">{p.nome}</p>
              <span className="text-[#667085] text-[11px] mt-0.5 block">
                Cód: {p.codigo || '—'} • {p.quantidade} {p.unidade || 'UN'} × R$ {formatMoeda(p.precoUnitario)}
              </span>
              {p.statusEstoque === 'para_cotacao' && (
                <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89]">
                  Para Cotação
                </span>
              )}
            </div>
            <ValorItem valor={p.quantidade * p.precoUnitario - (p.desconto || 0)} />
          </div>
        )}
      />

      <SecaoItens
        Icone={Wrench}
        titulo="Mão de Obra (Oficina)"
        total={os.totalServicos}
        vazio="Nenhum serviço de oficina adicionado."
        itens={os.servicosOS}
        renderItem={(s, idx) => (
          <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors">
            <div className="min-w-0 pr-3">
              <p className="font-bold text-[#101828] truncate text-xs">{s.nome}</p>
              <span className="text-[#667085] text-[11px] mt-0.5 block">
                Cód: {s.codigo || '—'} {s.tempoHoras ? `• Tempo: ${s.tempoHoras}h` : ''}
              </span>
            </div>
            <ValorItem valor={(s.quantidade || 1) * (s.precoUnitario ?? s.valorUnitario ?? 0) - (s.desconto || 0)} />
          </div>
        )}
      />

      <SecaoItens
        Icone={Handshake}
        titulo="Serviços de Terceiros"
        total={os.totalTerceiros || 0}
        vazio="Nenhum serviço de terceiros vinculado."
        itens={os.terceirosOS}
        renderItem={(t, idx) => (
          <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors bg-amber-50/20">
            <div className="min-w-0 pr-3">
              <p className="font-bold text-[#101828] truncate text-xs">{t.nome}</p>
              <span className="text-[#667085] text-[11px] mt-0.5 block">
                Cód: {t.codigo || '—'} • Parceiro:{' '}
                <strong className="text-[#101828] font-semibold">{t.parceiroNome || 'Fornecedor Terceirizado'}</strong>
              </span>
            </div>
            <ValorItem valor={valorLiquidoTerceiro(t)} />
          </div>
        )}
      />

      <p className="text-center text-[11px] text-[#98a2b3]">
        Use "Editar OS" no rodapé para revisar dados de cliente, veículo e triagem.
      </p>
    </div>
  )
}
