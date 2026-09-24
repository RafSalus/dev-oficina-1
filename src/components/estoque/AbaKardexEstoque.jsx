import React from 'react'
import Select from 'react-select'
import { ArrowDownLeft, ArrowUpRight, ArrowsClockwise, ClockCounterClockwise } from '@phosphor-icons/react'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import { CampoBusca } from '../suprimentos/compras/CampoBusca'
import { OPCOES_TIPO_MOVIMENTO } from '../../utils/estoque/estoqueCalculos'

const OPERACAO = {
  ENTRADA: {
    rotulo: 'Entrada',
    Icone: ArrowDownLeft,
    selo: 'bg-sky-50 text-[#0284c7] border-sky-200',
    sinal: '+',
    corQtd: 'text-sky-700',
  },
  SAIDA: {
    rotulo: 'Saída',
    Icone: ArrowUpRight,
    selo: 'bg-slate-100 text-slate-800 border-slate-200',
    sinal: '-',
    corQtd: 'text-slate-900',
  },
  AJUSTE: {
    rotulo: 'Ajuste',
    Icone: ArrowsClockwise,
    selo: 'bg-amber-50 text-amber-800 border-amber-200',
    sinal: '=',
    corQtd: 'text-amber-700',
  },
}

function KardexLinha({ mov }) {
  const op = OPERACAO[mov.tipo] || OPERACAO.AJUSTE
  const { Icone } = op
  const dataFormatada = new Date(mov.dataHora).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{dataFormatada}</td>
      <td className="py-3 px-4 text-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${op.selo}`}>
          <Icone size={13} weight="bold" />
          <span>{op.rotulo}</span>
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="font-semibold text-slate-900">{mov.pecaNome}</div>
        <div className="font-mono text-[11px] text-slate-500">{mov.pecaCodigo}</div>
      </td>
      <td className="py-3 px-4 text-center font-mono font-bold">
        <span className={op.corQtd}>
          {op.sinal}
          {mov.quantidade} {mov.unidade || 'UN'}
        </span>
      </td>
      <td className="py-3 px-4 text-center font-mono text-[11px]">
        <span className="text-slate-400">{mov.saldoAnterior}</span>
        <span className="text-slate-300 mx-1">→</span>
        <span className="font-bold text-slate-900">{mov.saldoNovo}</span>
      </td>
      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">{mov.documento || 'Sem documento'}</td>
      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={mov.motivo}>
        {mov.motivo || 'Lançamento manual'}
      </td>
      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{mov.responsavel || 'Operador'}</td>
    </tr>
  )
}

/**
 * Aba "Histórico de Movimentações (Kardex)": busca, filtro por tipo e lançamentos auditados.
 * @param {{estoque: object}} props - Retorno de `useEstoqueWorkflow()`.
 */
export function AbaKardexEstoque({ estoque }) {
  const { filtros, movimentacoesFiltradas } = estoque

  return (
    <>
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <CampoBusca
          valor={filtros.buscaKardex}
          onChange={filtros.setBuscaKardex}
          placeholder="Buscar por código SKU, nome do item, documento, motivo ou responsável..."
        />
        <div className="w-full sm:w-56">
          <Select
            value={OPCOES_TIPO_MOVIMENTO.find((opt) => opt.value === filtros.filtroTipoMovimento)}
            onChange={filtros.selecionarTipoMovimento}
            options={OPCOES_TIPO_MOVIMENTO}
            styles={customSelectStyles}
            placeholder="Tipo de Movimento"
            isSearchable={false}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {movimentacoesFiltradas.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ClockCounterClockwise size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhuma movimentação registrada</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {filtros.buscaKardex || filtros.filtroTipoMovimento !== 'TODOS'
                  ? 'Nenhum lançamento corresponde aos filtros aplicados.'
                  : 'O histórico de movimentações do almoxarifado aparecerá aqui.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Data e Hora</th>
                  <th className="py-3 px-4 text-center">Operação</th>
                  <th className="py-3 px-4">Item / Código SKU</th>
                  <th className="py-3 px-4 text-center">Qtd.</th>
                  <th className="py-3 px-4 text-center">Saldo Resultante</th>
                  <th className="py-3 px-4">Documento / Ref.</th>
                  <th className="py-3 px-4">Motivo / Justificativa</th>
                  <th className="py-3 px-4">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {movimentacoesFiltradas.map((mov) => (
                  <KardexLinha key={mov.id} mov={mov} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
