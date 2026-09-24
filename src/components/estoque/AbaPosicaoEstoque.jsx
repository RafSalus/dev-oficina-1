import React from 'react'
import Select from 'react-select'
import { Package, ArrowsLeftRight, PencilSimple, ClockCounterClockwise, MapPin } from '@phosphor-icons/react'
import { CATEGORIAS_PECAS_OPCOES } from '../../constants/cadastrosSuprimentosData'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import { CampoBusca } from '../suprimentos/compras/CampoBusca'
import { OPCOES_STATUS_ESTOQUE, OPCOES_ORDENACAO_ESTOQUE, situacaoEstoque } from '../../utils/estoque/estoqueCalculos'

const OPCOES_CATEGORIAS = [{ value: 'TODAS', label: 'Todas as Categorias' }, ...CATEGORIAS_PECAS_OPCOES]

const SELO_SITUACAO = {
  ZERADO: ['Zerado', 'font-bold bg-rose-50 text-rose-700 border-rose-200', 'bg-rose-500'],
  REPOSICAO: ['Reposição', 'font-bold bg-amber-50 text-amber-700 border-amber-200', 'bg-amber-500'],
  ADEQUADO: ['Adequado', 'font-semibold bg-sky-50 text-[#0284c7] border-sky-200', 'bg-[#0284c7]'],
}

const BOTAO_ICONE = 'p-1.5 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors cursor-pointer'

function PosicaoLinha({ peca, acoes }) {
  const estoqueAtual = Number(peca.estoqueAtual) || 0
  const estoqueMinimo = Number(peca.estoqueMinimo) || 0
  const [rotulo, classeSelo, classeBarra] = SELO_SITUACAO[situacaoEstoque(peca)]
  // Proporção para a barra visual: 100% equivale ao dobro do mínimo
  const proporcao = estoqueMinimo > 0 ? Math.min(100, Math.round((estoqueAtual / (estoqueMinimo * 2)) * 100)) : 100

  return (
    <tr className="hover:bg-slate-50/70 transition-colors group">
      <td className="py-3 px-4 font-mono">
        <div className="font-semibold text-slate-900">{peca.codigo}</div>
        {peca.codigoFabricante && <div className="text-[11px] text-slate-400">Fab: {peca.codigoFabricante}</div>}
      </td>

      <td className="py-3 px-4 max-w-xs">
        <div className="font-semibold text-slate-900">{peca.nome}</div>
        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
            {peca.categoria || 'Geral'}
          </span>
          <span className="font-mono font-medium text-slate-600">[{peca.unidade || 'UN'}]</span>
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <MapPin size={14} className="text-slate-400 shrink-0" />
          <span>{peca.localizacao || 'Almoxarifado Central'}</span>
        </div>
      </td>

      <td className="py-3 px-4 text-center min-w-[140px]">
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono font-bold text-slate-900 text-sm">{estoqueAtual}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            / mín {estoqueMinimo} {peca.unidade || 'UN'}
          </span>
        </div>
        <div className="w-24 mx-auto mt-1.5 bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div style={{ width: `${proporcao}%` }} className={`h-full rounded-full transition-all ${classeBarra}`} />
        </div>
      </td>

      <td className="py-3 px-4 text-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${classeSelo}`}>{rotulo}</span>
      </td>

      <td className="py-3 px-4 text-right font-mono text-slate-600">R$ {Number(peca.precoCusto || 0).toFixed(2)}</td>
      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
        R$ {(estoqueAtual * (Number(peca.precoCusto) || 0)).toFixed(2)}
      </td>
      <td className="py-3 px-4 text-right font-mono text-slate-700">R$ {Number(peca.precoVenda || 0).toFixed(2)}</td>

      <td className="py-3 px-4 text-right">
        <div className="inline-flex items-center gap-1 justify-end">
          <button
            type="button"
            onClick={() => acoes.abrirMovimento(peca)}
            className={`${BOTAO_ICONE} text-slate-700`}
            title="Movimentar estoque (Entrada, Saída ou Ajuste)"
          >
            <ArrowsLeftRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => acoes.abrirKardexDaPeca(peca.codigo)}
            className={`${BOTAO_ICONE} text-slate-500`}
            title="Ver histórico de movimentações (Kardex)"
          >
            <ClockCounterClockwise size={16} />
          </button>
          <button
            type="button"
            onClick={() => acoes.abrirPeca(peca)}
            className={`${BOTAO_ICONE} text-slate-500`}
            title="Editar dados cadastrais no catálogo"
          >
            <PencilSimple size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

/**
 * Aba "Posição do Almoxarifado": busca, filtros de categoria/nível/ordenação e tabela de saldos.
 * @param {{estoque: object}} props - Retorno de `useEstoqueWorkflow()`.
 */
export function AbaPosicaoEstoque({ estoque }) {
  const { filtros, pecasFiltradas, acoes } = estoque
  const temFiltro = filtros.busca || filtros.filtroCategoria !== 'TODAS' || filtros.filtroStatusEstoque !== 'TODOS'

  return (
    <>
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col lg:flex-row items-center gap-3 shrink-0">
        <CampoBusca
          valor={filtros.busca}
          onChange={filtros.setBusca}
          placeholder="Buscar por código SKU, nome, GTIN/EAN, código de fabricante ou localização física..."
        />

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-44">
            <Select
              value={OPCOES_CATEGORIAS.find((opt) => opt.value === filtros.filtroCategoria)}
              onChange={filtros.selecionarCategoria}
              options={OPCOES_CATEGORIAS}
              styles={customSelectStyles}
              placeholder="Categoria"
              isSearchable={true}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={OPCOES_STATUS_ESTOQUE.find((opt) => opt.value === filtros.filtroStatusEstoque)}
              onChange={filtros.selecionarStatus}
              options={OPCOES_STATUS_ESTOQUE}
              styles={customSelectStyles}
              placeholder="Nível de Estoque"
              isSearchable={false}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={OPCOES_ORDENACAO_ESTOQUE.find((opt) => opt.value === filtros.filtroOrdenacao)}
              onChange={filtros.selecionarOrdenacao}
              options={OPCOES_ORDENACAO_ESTOQUE}
              styles={customSelectStyles}
              placeholder="Ordenar por"
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Estoque com Scroll Invisível (Regra 11) */}
      <div className="flex-1 overflow-auto no-scrollbar p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {pecasFiltradas.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Package size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Nenhum item localizado no estoque</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {temFiltro
                  ? 'Nenhum item corresponde aos critérios de pesquisa e filtros selecionados.'
                  : 'Nenhuma peça cadastrada no almoxarifado até o momento.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Código SKU / Fab.</th>
                  <th className="py-3 px-4">Peça e Categoria</th>
                  <th className="py-3 px-4">Local no Almoxarifado</th>
                  <th className="py-3 px-4 text-center">Nível de Estoque</th>
                  <th className="py-3 px-4 text-center">Situação</th>
                  <th className="py-3 px-4 text-right">Custo Unit.</th>
                  <th className="py-3 px-4 text-right">Total em Estoque</th>
                  <th className="py-3 px-4 text-right">Venda Unit.</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pecasFiltradas.map((peca) => (
                  <PosicaoLinha key={peca.id} peca={peca} acoes={acoes} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
