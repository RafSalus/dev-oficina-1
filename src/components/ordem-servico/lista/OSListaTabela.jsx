import React from 'react'
import { Receipt, Archive } from '@phosphor-icons/react'
import { KanbanOSBoard } from '../../../pages/dashboard/orcamento/KanbanOSBoard'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'
import { somaValorTotal } from '../../../utils/ordemServico/osListaCalculos'
import { OSLinhaAberta, OSLinhaArquivada } from './OSLinhas'

const CABECALHO = 'bg-[#f8fafc] border-b border-[#e4e7ec] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085] shrink-0'

const COLUNAS_ABERTAS = [
  ['col-span-1', 'Nº OS'],
  ['col-span-1', 'Entrada'],
  ['col-span-3', 'Cliente e Contato'],
  ['col-span-2', 'Veículo e Placa'],
  ['col-span-2', 'Mecânico / Queixa'],
  ['col-span-1', 'Status'],
  ['col-span-1 text-right', 'Valor Total'],
  ['col-span-1 text-center', 'Ações'],
]

const COLUNAS_ARQUIVO = [
  ['col-span-1', 'Nº OS'],
  ['col-span-2', 'Finalizada Em'],
  ['col-span-3', 'Cliente e Contato'],
  ['col-span-2', 'Veículo e Placa'],
  ['col-span-1', 'Mecânico'],
  ['col-span-1', 'Garantia / NF'],
  ['col-span-1 text-right', 'Valor Pago'],
  ['col-span-1 text-center', 'Ações'],
]

function Cabecalho({ colunas }) {
  return (
    <div className={CABECALHO}>
      {colunas.map(([classe, rotulo]) => (
        <div key={rotulo} className={classe}>
          {rotulo}
        </div>
      ))}
    </div>
  )
}

function ListaVazia({ Icone, titulo, texto, children }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
        <Icone size={24} weight="duotone" />
      </div>
      <h3 className="text-sm font-bold text-[#101828] mb-1">{titulo}</h3>
      <p className="text-xs text-[#667085] max-w-sm mb-4">{texto}</p>
      {children}
    </div>
  )
}

/**
 * Área central da lista de OS: cabeçalho, linhas (ou Kanban) e rodapé com totais.
 * @param {{lista: object}} props - Retorno de `useOrdensServicoLista()`.
 */
export function OSListaTabela({ lista }) {
  const { abaAtiva, visualizacao, abertasFiltradas, finalizadasFiltradas, selecao, acoes } = lista
  const abertas = abaAtiva === 'abertas'
  const kanban = abertas && visualizacao === 'kanban'
  const filtradas = abertas ? abertasFiltradas : finalizadasFiltradas
  const total = abertas ? lista.ordensAbertas.length : lista.ordensFinalizadas.length
  const selecionada = (os) => String(selecao.ordemSelecionada?.numeroOS) === String(os.numeroOS)
  const Linha = abertas ? OSLinhaAberta : OSLinhaArquivada

  let conteudo
  if (kanban) {
    conteudo = (
      <KanbanOSBoard
        ordens={abertasFiltradas}
        numeroOsSelecionada={selecao.ordemSelecionada?.numeroOS}
        onSelecionar={selecao.alternarSelecao}
        onMoverStatus={acoes.moverStatusKanban}
        onAbrirEdicaoRapida={acoes.abrirEdicaoRapida}
      />
    )
  } else if (filtradas.length === 0) {
    conteudo = abertas ? (
      <ListaVazia
        Icone={Receipt}
        titulo="Nenhuma ordem de serviço aberta encontrada"
        texto="Não foram encontrados orçamentos ou ordens de serviço correspondentes aos filtros selecionados."
      >
        <button
          type="button"
          onClick={lista.filtros.limparFiltros}
          className="px-3 py-1.5 bg-white border border-[#d0d5dd] hover:bg-[#f2f4f7] text-xs font-semibold rounded-xl text-[#344054] cursor-pointer"
        >
          Limpar todos os filtros
        </button>
      </ListaVazia>
    ) : (
      <ListaVazia
        Icone={Archive}
        titulo="Nenhuma ordem finalizada no arquivo"
        texto="Quando você finalizar um atendimento na oficina, a OS será arquivada aqui para histórico permanente de garantia e faturamento."
      />
    )
  } else {
    conteudo = filtradas.map((os) => (
      <Linha
        key={os.numeroOS}
        os={os}
        selecionada={Boolean(selecao.ordemSelecionada) && selecionada(os)}
        onSelecionar={selecao.alternarSelecao}
        acoes={acoes}
      />
    ))
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden w-full">
      {!kanban && <Cabecalho colunas={abertas ? COLUNAS_ABERTAS : COLUNAS_ARQUIVO} />}

      <div
        className={
          kanban
            ? 'flex-1 min-h-0 overflow-hidden flex flex-col p-3'
            : 'flex-1 overflow-y-auto no-scrollbar min-h-0 divide-y divide-[#f2f4f7]'
        }
      >
        {conteudo}
      </div>

      <footer className="h-10 px-4 bg-[#f8fafc] border-t border-[#e4e7ec] flex items-center justify-between text-xs text-[#667085] shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#101828]">{filtradas.length}</span>
          <span>de</span>
          <span className="font-bold text-[#101828]">{total}</span>
          <span>{abertas ? 'ordens de serviço em andamento' : 'ordens finalizadas arquivadas'}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
            {abertas
              ? 'Clique em uma OS para inspecionar os itens ou finalizar o atendimento'
              : 'Clique em uma OS arquivada para consultar o histórico ou reabri-la'}
          </span>
          <span>•</span>
          <span className="font-bold text-[#101828]">Total Filtrado: R$ {formatMoeda(somaValorTotal(filtradas))}</span>
        </div>
      </footer>
    </div>
  )
}
