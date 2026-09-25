import React from 'react'
import Select from 'react-select'
import {
  MagnifyingGlass,
  ClockCounterClockwise,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { OPCOES_TIPO_MOVIMENTO } from '../../../../../utils/estoque/estoqueCalculos'
import { mobileSelectStyles, inputBaseClass } from '../../../nova-os/mobile/mobileSelectStyles'

function KardexCard({ mov }) {
  const dataFormatada = new Date(mov.dataHora).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const isEntrada = mov.tipo === 'ENTRADA'
  const isSaida = mov.tipo === 'SAIDA'
  const Icon = isEntrada ? ArrowDownLeft : isSaida ? ArrowUpRight : ArrowsClockwise

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            isEntrada
              ? 'bg-sky-50 text-[#0284c7] border-sky-200'
              : isSaida
                ? 'bg-[#f2f4f7] text-[#344054] border-[#e4e7ec]'
                : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <Icon size={12} weight="bold" />
          {isEntrada ? 'Entrada' : isSaida ? 'Saída' : 'Ajuste'}
        </span>
        <span className="text-[10.5px] font-mono text-[#667085]">{dataFormatada}</span>
      </div>

      <p className="text-sm font-bold text-[#101828] truncate">{mov.pecaNome}</p>
      <p className="text-[10.5px] font-mono text-[#98a2b3]">{mov.pecaCodigo}</p>

      <div className="flex items-center justify-between mt-2">
        <span
          className={`font-mono font-bold text-sm ${
            isEntrada ? 'text-[#0284c7]' : isSaida ? 'text-[#101828]' : 'text-amber-700'
          }`}
        >
          {isEntrada ? '+' : isSaida ? '-' : '='}{mov.quantidade} {mov.unidade || 'UN'}
        </span>
        <span className="font-mono text-[10.5px] text-[#667085]">
          {mov.saldoAnterior} → <strong className="text-[#101828]">{mov.saldoNovo}</strong>
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-[#f2f4f7] text-[10.5px] text-[#667085]">
        <p className="truncate">{mov.motivo || 'Lançamento manual'}</p>
        <p className="flex items-center justify-between mt-0.5">
          <span>{mov.documento || 'Sem documento'}</span>
          <span className="font-semibold text-[#344054]">{mov.responsavel || 'Operador'}</span>
        </p>
      </div>
    </div>
  )
}

export function MobileAbaKardex({
  movimentacoes = [],
  buscaKardex = '',
  onBuscaKardexChange,
  filtroTipoMovimento = 'TODOS',
  onTipoMovimentoChange,
}) {
  return (
    <>
      <div className="relative mb-2.5">
        <MagnifyingGlass
          size={16}
          weight="bold"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none"
        />
        <input
          type="text"
          value={buscaKardex}
          onChange={(e) => onBuscaKardexChange?.(e.target.value)}
          placeholder="Buscar SKU, item, documento ou responsável..."
          className={`${inputBaseClass} pl-10`}
        />
      </div>
      <div className="mb-3">
        <Select
          value={OPCOES_TIPO_MOVIMENTO.find((o) => o.value === filtroTipoMovimento)}
          onChange={(opt) => onTipoMovimentoChange?.(opt ? opt.value : 'TODOS')}
          options={OPCOES_TIPO_MOVIMENTO}
          isSearchable={false}
          styles={mobileSelectStyles}
          placeholder="Tipo de Movimento"
        />
      </div>

      {movimentacoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <ClockCounterClockwise size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Nenhuma movimentação registrada</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">O histórico do almoxarifado aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {movimentacoes.map((mov) => (
            <KardexCard key={mov.id} mov={mov} />
          ))}
        </div>
      )}
    </>
  )
}
