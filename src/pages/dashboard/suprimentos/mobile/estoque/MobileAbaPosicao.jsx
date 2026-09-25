import React, { useState } from 'react'
import Select from 'react-select'
import {
  MagnifyingGlass,
  FunnelSimple,
  Package,
  MapPin,
  ArrowsLeftRight,
  ClockCounterClockwise,
} from '@phosphor-icons/react'
import { CATEGORIAS_PECAS_OPCOES } from '../../../../../constants/cadastrosSuprimentosData'
import { OPCOES_STATUS_ESTOQUE } from '../../../../../utils/estoque/estoqueCalculos'
import { mobileSelectStyles, inputBaseClass } from '../../../nova-os/mobile/mobileSelectStyles'

function PosicaoCard({ peca, onEditar, onMovimentar, onKardex }) {
  const estoqueAtual = Number(peca.estoqueAtual) || 0
  const estoqueMinimo = Number(peca.estoqueMinimo) || 0
  const estaZerado = estoqueAtual <= 0
  const estaNoMinimo = estoqueAtual <= estoqueMinimo && !estaZerado
  const proporcao = estoqueMinimo > 0 ? Math.min(100, Math.round((estoqueAtual / (estoqueMinimo * 2)) * 100)) : 100

  return (
    <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm p-3.5">
      <button type="button" onClick={onEditar} className="w-full text-left cursor-pointer">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono font-black text-xs text-[#101828]">{peca.codigo}</span>
          {estaZerado ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Zerado
            </span>
          ) : estaNoMinimo ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Reposição
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-[#0284c7] border border-sky-200">
              Adequado
            </span>
          )}
        </div>

        <p className="text-sm font-extrabold text-[#101828] truncate">{peca.nome}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054]">
            {peca.categoria || 'Geral'}
          </span>
          <span className="text-[10.5px] text-[#667085] flex items-center gap-1">
            <MapPin size={11} />
            {peca.localizacao || 'Almoxarifado Central'}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <span className="font-mono font-bold text-sm text-[#101828]">
            {estoqueAtual}{' '}
            <span className="text-[#98a2b3] text-[10.5px] font-medium">
              / mín {estoqueMinimo} {peca.unidade || 'UN'}
            </span>
          </span>
          <span className="font-mono text-xs font-bold text-[#101828]">
            R$ {(estoqueAtual * (Number(peca.precoCusto) || 0)).toFixed(2)}
          </span>
        </div>
        <div className="w-full mt-1.5 bg-[#f2f4f7] h-1.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${proporcao}%` }}
            className={`h-full rounded-full ${
              estaZerado ? 'bg-rose-500' : estaNoMinimo ? 'bg-amber-500' : 'bg-[#0284c7]'
            }`}
          />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onMovimentar(peca)
          }}
          className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5 active:bg-[#f8fafc] cursor-pointer"
        >
          <ArrowsLeftRight size={13} weight="bold" />
          Movimentar
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onKardex(peca.codigo)
          }}
          className="h-9 rounded-lg border border-[#d0d5dd] text-[#344054] text-xs font-bold flex items-center justify-center gap-1.5 active:bg-[#f8fafc] cursor-pointer"
        >
          <ClockCounterClockwise size={13} weight="bold" />
          Kardex
        </button>
      </div>
    </div>
  )
}

const opcoesCategorias = [{ value: 'TODAS', label: 'Todas as Categorias' }, ...CATEGORIAS_PECAS_OPCOES]

export function MobileAbaPosicao({
  pecas = [],
  busca = '',
  onBuscaChange,
  filtroCategoria = 'TODAS',
  onCategoriaChange,
  filtroStatus = 'TODOS',
  onStatusChange,
  onEditarPeca,
  onMovimentarPeca,
  onKardexPeca,
}) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const filtrosAtivos = filtroCategoria !== 'TODAS' || filtroStatus !== 'TODOS'

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
          value={busca}
          onChange={(e) => onBuscaChange?.(e.target.value)}
          placeholder="Buscar SKU, nome, GTIN ou local..."
          className={`${inputBaseClass} pl-10`}
        />
      </div>

      <button
        type="button"
        onClick={() => setFiltrosAbertos((v) => !v)}
        className={`w-full h-10 mb-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
          filtrosAtivos ? 'border-[#0284c7] text-[#0284c7] bg-[#e0f2fe]' : 'border-[#d0d5dd] text-[#344054] bg-white'
        }`}
      >
        <FunnelSimple size={15} weight="bold" />
        Filtros {filtrosAtivos ? '(ativos)' : ''}
      </button>

      {filtrosAbertos && (
        <div className="space-y-2 mb-3">
          <Select
            value={opcoesCategorias.find((o) => o.value === filtroCategoria)}
            onChange={(opt) => onCategoriaChange?.(opt ? opt.value : 'TODAS')}
            options={opcoesCategorias}
            styles={mobileSelectStyles}
            placeholder="Categoria"
          />
          <Select
            value={OPCOES_STATUS_ESTOQUE.find((o) => o.value === filtroStatus)}
            onChange={(opt) => onStatusChange?.(opt ? opt.value : 'TODOS')}
            options={OPCOES_STATUS_ESTOQUE}
            isSearchable={false}
            styles={mobileSelectStyles}
            placeholder="Nível de Estoque"
          />
        </div>
      )}

      {pecas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
            <Package size={22} weight="duotone" />
          </div>
          <p className="text-sm font-bold text-[#101828]">Nenhum item localizado</p>
          <p className="text-xs text-[#667085] max-w-[260px] mt-1">Ajuste a busca ou os filtros aplicados.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pecas.map((peca) => (
            <PosicaoCard
              key={peca.id}
              peca={peca}
              onEditar={() => onEditarPeca?.(peca)}
              onMovimentar={onMovimentarPeca}
              onKardex={onKardexPeca}
            />
          ))}
        </div>
      )}
    </>
  )
}
