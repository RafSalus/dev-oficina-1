import React from 'react'
import Select from 'react-select'
import { Receipt, Plus, MagnifyingGlass, ArrowsClockwise, Archive, ListBullets, Kanban } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { STATUS_ORCAMENTO, PRIORIDADE_OPTIONS } from '../../../pages/dashboard/orcamento/mockOrdensAbertas'
import { selectFilterStyles } from './selectFilterStyles'

function AbaPilula({ ativa, onClick, Icone, rotulo, total, corContadorAtivo }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
        ativa ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085] hover:text-[#101828]'
      }`}
    >
      <Icone size={14} weight={ativa ? 'fill' : 'bold'} className={ativa ? 'text-[#0284c7]' : ''} />
      <span>{rotulo}</span>
      <span
        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
          ativa ? corContadorAtivo : 'bg-[#e4e7ec] text-[#475467]'
        }`}
      >
        {total}
      </span>
    </button>
  )
}

function BotaoVisualizacao({ ativo, onClick, Icone, titulo }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
        ativo ? 'bg-white text-[#0284c7] shadow-xs' : 'text-[#667085] hover:text-[#101828]'
      }`}
      title={titulo}
    >
      <Icone size={15} weight={ativo ? 'fill' : 'bold'} />
    </button>
  )
}

/**
 * Barra superior da lista de OS: abas Abertas/Arquivos, alternância lista/Kanban,
 * busca, filtros de status e prioridade, atualizar e Nova OS.
 * @param {{
 *   abaAtiva: string, visualizacao: string, totalAbertas: number, totalFinalizadas: number,
 *   filtros: object, onTrocarAba: Function, onAlternarVisualizacao: Function,
 *   onRecarregar: Function, onNovaOS: Function
 * }} props
 */
export function OSListaToolbar({
  abaAtiva,
  visualizacao,
  totalAbertas,
  totalFinalizadas,
  filtros,
  onTrocarAba,
  onAlternarVisualizacao,
  onRecarregar,
  onNovaOS,
}) {
  const abertas = abaAtiva === 'abertas'

  return (
    <header className="h-13 shrink-0 bg-white px-3.5 rounded-2xl border border-[#d0d5dd] shadow-xs flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#0284c7] shrink-0">
          {abertas ? <Receipt size={18} weight="duotone" /> : <Archive size={18} weight="duotone" />}
        </div>

        <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl border border-[#e4e7ec] shrink-0">
          <AbaPilula
            ativa={abertas}
            onClick={() => onTrocarAba('abertas')}
            Icone={Receipt}
            rotulo="OS Abertas"
            total={totalAbertas}
            corContadorAtivo="bg-[#101828] text-white"
          />
          <AbaPilula
            ativa={!abertas}
            onClick={() => onTrocarAba('arquivos')}
            Icone={Archive}
            rotulo="Arquivos"
            total={totalFinalizadas}
            corContadorAtivo="bg-[#0284c7] text-white"
          />
        </div>

        {/* Alternância Lista / Kanban — só faz sentido para OS Abertas */}
        {abertas && (
          <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl border border-[#e4e7ec] shrink-0">
            <BotaoVisualizacao
              ativo={visualizacao === 'lista'}
              onClick={() => onAlternarVisualizacao('lista')}
              Icone={ListBullets}
              titulo="Visualização em Lista"
            />
            <BotaoVisualizacao
              ativo={visualizacao === 'kanban'}
              onClick={() => onAlternarVisualizacao('kanban')}
              Icone={Kanban}
              titulo="Visualização em Kanban"
            />
          </div>
        )}

        <div className="hidden 2xl:block truncate">
          <span className="text-[11px] text-[#667085] font-medium">
            {abertas
              ? 'Ordens em diagnóstico, orçamento e execução'
              : 'Histórico de ordens de serviço finalizadas e faturadas'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-52 xl:w-60">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none"
          />
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => filtros.setBusca(e.target.value)}
            placeholder={abertas ? 'Buscar placa, cliente, nº OS...' : 'Buscar no arquivo...'}
            className="w-full h-9.5 pl-8.5 pr-3 bg-[#f8fafc] border border-[#d0d5dd] rounded-xl text-xs font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:border-[#0284c7] focus:bg-white transition-all shadow-2xs"
          />
          {filtros.busca && (
            <button
              type="button"
              onClick={() => filtros.setBusca('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#667085] hover:text-[#101828]"
            >
              Limpar
            </button>
          )}
        </div>

        {abertas && (
          <>
            {visualizacao === 'lista' && (
              <div className="w-44 xl:w-48">
                <Select
                  styles={selectFilterStyles}
                  value={filtros.filtroStatus}
                  onChange={(opt) => filtros.setFiltroStatus(opt || STATUS_ORCAMENTO[0])}
                  options={STATUS_ORCAMENTO}
                  isSearchable={false}
                  placeholder="Status"
                />
              </div>
            )}

            <div className="w-40 xl:w-44">
              <Select
                styles={selectFilterStyles}
                value={filtros.filtroPrioridade}
                onChange={(opt) => filtros.setFiltroPrioridade(opt || PRIORIDADE_OPTIONS[0])}
                options={PRIORIDADE_OPTIONS}
                isSearchable={false}
                placeholder="Prioridade"
              />
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            onRecarregar()
            toast.info('Listas atualizadas com sucesso.')
          }}
          className="h-9.5 w-9.5 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f2f4f7] flex items-center justify-center text-[#475467] hover:text-[#101828] transition-all cursor-pointer shrink-0"
          title="Sincronizar e Atualizar"
        >
          <ArrowsClockwise size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={onNovaOS}
          className="h-9.5 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={15} weight="bold" />
          <span>Nova OS</span>
        </button>
      </div>
    </header>
  )
}
