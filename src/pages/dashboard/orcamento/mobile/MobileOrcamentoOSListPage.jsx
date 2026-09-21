import React, { useState } from 'react'
import { Receipt, Archive, MagnifyingGlass, Plus, FunnelSimple, WhatsappLogo } from '@phosphor-icons/react'
import Select from 'react-select'
import { STATUS_ORCAMENTO, PRIORIDADE_OPTIONS } from '../mockOrdensAbertas'
import { mobileSelectStyles, inputBaseClass } from '../../nova-os/mobile/mobileSelectStyles'
import { MobileOsDetalhesModal } from './MobileOsDetalhesModal'

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[104px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

function OsCard({ os, isArquivada, onClick, onWhatsapp, formatMoeda }) {
  const statusInfo = STATUS_ORCAMENTO.find((s) => s.value === os.status) || STATUS_ORCAMENTO[1]

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5 active:bg-[#f8fafc] transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono font-black text-xs text-[#101828]">#{os.numeroOS}</span>
        {isArquivada ? (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#101828] text-white">Concluída</span>
        ) : (
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-[150px] ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.border}`}
          >
            {statusInfo.label}
          </span>
        )}
      </div>

      <p className="text-sm font-extrabold text-[#101828] truncate">{os.cliente}</p>

      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-[#101828] text-white tracking-wider shrink-0">
          {os.placa || 'PLACA'}
        </span>
        <span className="text-xs text-[#667085] truncate">{os.marcaModelo}</span>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f2f4f7]">
        <span className="text-[10.5px] text-[#667085]">
          {isArquivada ? os.dataFinalizacao || os.dataEntrada : os.dataEntrada}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onWhatsapp(os)
            }}
            className="p-1 text-[#25D366]"
            aria-label="Enviar via WhatsApp"
          >
            <WhatsappLogo size={16} weight="fill" />
          </button>
          <span className="font-black text-[#101828] text-sm">R$ {formatMoeda(os.valorTotal)}</span>
        </div>
      </div>
    </button>
  )
}

export function MobileOrcamentoOSListPage({
  abaAtiva,
  setAbaAtiva,
  ordensAbertas,
  ordensFinalizadas,
  abertasFiltradas,
  finalizadasFiltradas,
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  filtroPrioridade,
  setFiltroPrioridade,
  metricasAbertas,
  metricasFinalizadas,
  onAtualizarStatus,
  onFinalizarEArquivar,
  onReabrirOrdem,
  onExcluirOrdem,
  onCopiarLink,
  onDispararWhatsApp,
  onAbrirNovaOS,
  onEditarOS,
  formatMoeda,
}) {
  const [ordemSelecionada, setOrdemSelecionada] = useState(null)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  const lista = abaAtiva === 'abertas' ? abertasFiltradas : finalizadasFiltradas
  const filtrosAtivos = filtroStatus.value !== 'todos' || filtroPrioridade.value !== 'todas'

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Segmentado OS Abertas / Arquivos + Nova OS */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center bg-[#f2f4f7] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAbaAtiva('abertas')
              setOrdemSelecionada(null)
            }}
            className={`flex-1 h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
              abaAtiva === 'abertas' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
            }`}
          >
            <Receipt size={14} weight={abaAtiva === 'abertas' ? 'fill' : 'bold'} className={abaAtiva === 'abertas' ? 'text-[#0284c7]' : ''} />
            OS Abertas ({ordensAbertas.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setAbaAtiva('arquivos')
              setOrdemSelecionada(null)
            }}
            className={`flex-1 h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
              abaAtiva === 'arquivos' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
            }`}
          >
            <Archive size={14} weight={abaAtiva === 'arquivos' ? 'fill' : 'bold'} className={abaAtiva === 'arquivos' ? 'text-[#0284c7]' : ''} />
            Arquivos ({ordensFinalizadas.length})
          </button>
        </div>
        <button
          type="button"
          onClick={onAbrirNovaOS}
          aria-label="Nova Ordem de Serviço"
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      {/* Métricas em scroll horizontal */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
        {abaAtiva === 'abertas' ? (
          <>
            <StatChip label="Total Aberto" value={metricasAbertas.totalAbertas} dark />
            <StatChip label="Diagnóstico" value={metricasAbertas.emDiagnostico} />
            <StatChip label="Aguard. Peças" value={metricasAbertas.aguardandoPecas} />
            <StatChip label="Aguard. Aprov." value={metricasAbertas.aguardandoAprovacao} />
            <StatChip label="Em Execução" value={metricasAbertas.aprovadosExecucao} />
            <StatChip label="Pronto" value={metricasAbertas.prontoRetirada} />
          </>
        ) : (
          <>
            <StatChip label="No Arquivo" value={metricasFinalizadas.total} dark />
            <StatChip label="Faturado" value={`R$ ${formatMoeda(metricasFinalizadas.somaValorTotal)}`} />
            <StatChip label="Ticket Médio" value={`R$ ${formatMoeda(metricasFinalizadas.ticketMedio)}`} />
            <StatChip label="Peças" value={`R$ ${formatMoeda(metricasFinalizadas.somaPecas)}`} />
            <StatChip label="Mão de Obra" value={`R$ ${formatMoeda(metricasFinalizadas.somaServicos)}`} />
          </>
        )}
      </div>

      {/* Busca */}
      <div className="relative mb-2.5">
        <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={abaAtiva === 'abertas' ? 'Buscar placa, cliente, nº OS...' : 'Buscar no arquivo...'}
          className={`${inputBaseClass} pl-10`}
        />
      </div>

      {/* Filtros (só OS Abertas) */}
      {abaAtiva === 'abertas' && (
        <>
          <button
            type="button"
            onClick={() => setFiltrosAbertos((v) => !v)}
            className={`w-full h-10 mb-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
              filtrosAtivos ? 'border-[#0284c7] text-[#0284c7] bg-[#e0f2fe]' : 'border-[#d0d5dd] text-[#344054] bg-white'
            }`}
          >
            <FunnelSimple size={15} weight="bold" />
            Filtros {filtrosAtivos ? '(ativos)' : ''}
          </button>

          {filtrosAbertos && (
            <div className="space-y-2 mb-3">
              <Select
                value={filtroStatus}
                onChange={(opt) => setFiltroStatus(opt || STATUS_ORCAMENTO[0])}
                options={STATUS_ORCAMENTO}
                isSearchable={false}
                styles={mobileSelectStyles}
                placeholder="Status"
              />
              <Select
                value={filtroPrioridade}
                onChange={(opt) => setFiltroPrioridade(opt || PRIORIDADE_OPTIONS[0])}
                options={PRIORIDADE_OPTIONS}
                isSearchable={false}
                styles={mobileSelectStyles}
                placeholder="Prioridade"
              />
            </div>
          )}
        </>
      )}

      {/* Lista de OS */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            {abaAtiva === 'abertas' ? <Receipt size={22} weight="duotone" /> : <Archive size={22} weight="duotone" />}
          </div>
          <p className="text-sm font-bold text-[#101828]">
            {abaAtiva === 'abertas' ? 'Nenhuma ordem de serviço encontrada' : 'Nenhuma ordem finalizada no arquivo'}
          </p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">
            {abaAtiva === 'abertas'
              ? 'Ajuste a busca ou os filtros para encontrar a OS desejada.'
              : 'OS finalizadas aparecem aqui para histórico e garantia.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {lista.map((os) => (
            <OsCard
              key={os.numeroOS}
              os={os}
              isArquivada={abaAtiva === 'arquivos'}
              onClick={() => setOrdemSelecionada(os)}
              onWhatsapp={onDispararWhatsApp}
              formatMoeda={formatMoeda}
            />
          ))}
        </div>
      )}

      <MobileOsDetalhesModal
        isOpen={!!ordemSelecionada}
        os={ordemSelecionada}
        isArquivada={abaAtiva === 'arquivos'}
        onFechar={() => setOrdemSelecionada(null)}
        onAtualizarStatus={onAtualizarStatus}
        onFinalizarEArquivar={onFinalizarEArquivar}
        onReabrir={onReabrirOrdem}
        onExcluir={onExcluirOrdem}
        onCopiarLink={onCopiarLink}
        onDispararWhatsApp={onDispararWhatsApp}
        onEditarOS={onEditarOS}
        formatMoeda={formatMoeda}
      />
    </div>
  )
}
