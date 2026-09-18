import React from 'react'
import { X, Package, Wrench, Handshake, Car, User } from '@phosphor-icons/react'

function formatMoeda(valor) {
  const num = parseFloat(valor) || 0
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function SecaoItens({ icone: Icone, titulo, itens, renderItem, subtotal }) {
  if (!itens.length) return null
  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#f2f4f7]">
        <div className="flex items-center gap-2">
          <Icone size={16} weight="bold" className="text-[#101828]" />
          <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wide">{titulo}</h3>
        </div>
        <span className="text-xs font-bold text-[#101828]">R$ {subtotal}</span>
      </div>
      <div className="space-y-2.5">{itens.map(renderItem)}</div>
    </div>
  )
}

export function MobileOrcamentoCompletoModal({ isOpen, formData, metricas, onFechar }) {
  if (!isOpen) return null

  const {
    numeroOS = '002908',
    cliente = '',
    documento = '',
    placa = '',
    marcaModelo = '',
    ano = '',
    cor = '',
    km = '',
    pecasOS = [],
    servicosOS = [],
    terceirosOS = [],
    descontoGeralOS = '0.00',
    condicaoPagamentoOS = '',
    previsaoEntregaData = '',
    previsaoEntregaHora = '',
    consultorResponsavel = '',
  } = formData

  const dataEntregaFormatada = previsaoEntregaData
    ? new Date(`${previsaoEntregaData}T00:00:00`).toLocaleDateString('pt-BR')
    : 'Não definida'

  return (
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header
        className="shrink-0 bg-white border-b border-[#e4e7ec]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>
          <div className="flex flex-col items-center min-w-0">
            <span className="text-sm font-extrabold text-[#101828] truncate">Orçamento Completo</span>
            <span className="text-[10px] font-semibold text-[#667085]">Ordem de Serviço #{numeroOS}</span>
          </div>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        {/* Cliente e Veículo */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
          <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-[#f2f4f7]">
            <User size={16} weight="bold" className="text-[#101828]" />
            <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wide">Cliente</h3>
          </div>
          <p className="text-sm font-extrabold text-[#101828]">{cliente || 'Não informado'}</p>
          <p className="text-xs text-[#667085] font-mono mt-0.5">{documento || 'Documento não informado'}</p>

          <div className="flex items-center gap-2.5 pt-3 mt-3 pb-2.5 mb-2.5 border-t border-b border-[#f2f4f7]">
            <Car size={16} weight="bold" className="text-[#101828]" />
            <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wide">Veículo</h3>
          </div>
          <p className="text-sm font-extrabold text-[#101828]">{marcaModelo || 'Não informado'}</p>
          <p className="text-xs text-[#667085] mt-0.5">
            Placa {placa || '—'} • Ano {ano || '—'} • {cor || 'Cor não informada'} • {km ? `${km} km` : 'KM não informado'}
          </p>
        </div>

        <SecaoItens
          icone={Package}
          titulo="Peças"
          itens={pecasOS}
          subtotal={metricas.totalPecas}
          renderItem={(p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#101828] truncate">{p.nome}</p>
                <p className="text-[10.5px] text-[#667085]">Qtd {p.quantidade} × R$ {formatMoeda(p.precoUnitario)}</p>
              </div>
              <span className="font-bold text-[#101828] shrink-0">
                R$ {formatMoeda((parseFloat(p.precoUnitario) || 0) * (parseFloat(p.quantidade) || 1) - (parseFloat(p.desconto) || 0))}
              </span>
            </div>
          )}
        />

        <SecaoItens
          icone={Wrench}
          titulo="Serviços"
          itens={servicosOS}
          subtotal={metricas.totalServicos}
          renderItem={(s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#101828] truncate">{s.nome}</p>
                <p className="text-[10.5px] text-[#667085]">{s.mecanicoNome || 'A definir'} • {s.tempoEstimado}h</p>
              </div>
              <span className="font-bold text-[#101828] shrink-0">
                R$ {formatMoeda((parseFloat(s.valorUnitario) || 0) * (parseFloat(s.quantidade) || 1) - (parseFloat(s.desconto) || 0))}
              </span>
            </div>
          )}
        />

        <SecaoItens
          icone={Handshake}
          titulo="Terceiros"
          itens={terceirosOS}
          subtotal={metricas.totalTerceiros}
          renderItem={(t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#101828] truncate">{t.nome}</p>
                <p className="text-[10.5px] text-[#667085]">{t.parceiroNome}</p>
              </div>
              <span className="font-bold text-[#101828] shrink-0">
                R$ {formatMoeda((parseFloat(t.valorVenda) || 0) - (parseFloat(t.desconto) || 0))}
              </span>
            </div>
          )}
        />

        {/* Totais */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4 mb-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#667085]">Subtotal Peças</span>
              <span className="font-bold text-[#101828]">R$ {metricas.totalPecas}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#667085]">Subtotal Serviços</span>
              <span className="font-bold text-[#101828]">R$ {metricas.totalServicos}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#667085]">Subtotal Terceiros</span>
              <span className="font-bold text-[#101828]">R$ {metricas.totalTerceiros}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-[#f2f4f7] pt-2">
              <span className="text-[#667085]">Desconto Geral</span>
              <span className="font-bold text-[#b42318]">- R$ {formatMoeda(descontoGeralOS)}</span>
            </div>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-[#101828] flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">Total Líquido</span>
            <span className="text-lg font-extrabold text-white">R$ {metricas.totalLiquido}</span>
          </div>
        </div>

        {/* Condições */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-4">
          <div className="space-y-2 text-xs">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#98a2b3]">Condição de Pagamento</span>
              <span className="text-[#101828] font-semibold">{condicaoPagamentoOS || 'Não definida'}</span>
            </div>
            <div className="pt-2 border-t border-[#f2f4f7]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#98a2b3]">Previsão de Entrega</span>
              <span className="text-[#101828] font-semibold">{dataEntregaFormatada} às {previsaoEntregaHora || '—'}</span>
            </div>
            <div className="pt-2 border-t border-[#f2f4f7]">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#98a2b3]">Consultor Responsável</span>
              <span className="text-[#101828] font-semibold">{consultorResponsavel || 'Não definido'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
