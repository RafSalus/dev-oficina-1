import React from 'react'
import { Receipt, Clock, Wrench, Package, Handshake, ShieldCheck, Car } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { STATUS_ORCAMENTO } from '../../../pages/dashboard/orcamento/mockOrdensAbertas'
import { formatMoeda } from '../../../utils/ordemServico/osMensagens'

const SELECIONADO_PADRAO = 'bg-[#101828] text-white border-[#101828]'

/**
 * Cards de etapa do fluxo. Cada card filtra a lista pelo seu status; as cores
 * seguem o SYSTEM_RULES (sem verde).
 */
const CARDS_STATUS = [
  {
    status: 'fila', rotulo: 'Na Fila', metrica: 'naFila', Icone: Clock,
    aviso: 'Filtrando ordens Na Fila de Espera.', titulo: 'Clique para filtrar ordens na Fila de Espera',
    hover: 'hover:border-[#0284c7]', rotuloCor: ['text-[#98a2b3]', 'text-[#475467]'],
    iconeCor: ['bg-[#0284c7] text-white', 'bg-zinc-100 text-[#101828]'],
  },
  {
    status: 'em_diagnostico', rotulo: 'Em Diagnóstico', metrica: 'emDiagnostico', Icone: Wrench,
    aviso: 'Filtrando ordens Em Diagnóstico.', titulo: 'Clique para filtrar ordens em Diagnóstico',
    hover: 'hover:border-[#0284c7]', rotuloCor: ['text-[#98a2b3]', 'text-[#667085]'],
    iconeCor: ['bg-[#0284c7] text-white', 'bg-[#f2f4f7] text-[#344054]'],
  },
  {
    status: 'aguardando_pecas', rotulo: 'Cotação Peças', metrica: 'aguardandoPecas', Icone: Package,
    aviso: 'Filtrando ordens Aguardando Peças.', titulo: 'Clique para filtrar ordens Aguardando Peças',
    hover: 'hover:border-amber-400', rotuloCor: ['text-amber-300', 'text-amber-700'],
    valorCor: ['text-white', 'text-amber-900'], iconeCor: ['bg-amber-50 text-amber-700'],
  },
  {
    status: 'terceirizado', rotulo: 'Terceirizado', metrica: 'terceirizados', Icone: Handshake,
    aviso: 'Filtrando ordens Terceirizadas.', titulo: 'Clique para filtrar ordens Terceirizadas',
    hover: 'hover:border-violet-400', rotuloCor: ['text-violet-300', 'text-violet-700'],
    valorCor: ['text-white', 'text-violet-900'], iconeCor: ['bg-violet-50 text-violet-700'],
  },
  {
    status: 'aguardando_aprovacao', rotulo: 'Aprovação', metrica: 'aguardandoAprovacao', Icone: Clock,
    aviso: 'Filtrando ordens Aguardando Aprovação.', titulo: 'Clique para filtrar ordens Aguardando Aprovação',
    hover: 'hover:border-[#0284c7]', rotuloCor: ['text-sky-300', 'text-[#0369a1]'],
    valorCor: ['text-white', 'text-[#0284c7]'], iconeCor: ['bg-[#e0f2fe] text-[#0284c7]'],
  },
  {
    status: 'aprovado_execucao', rotulo: 'Em Execução', metrica: 'aprovadosExecucao', Icone: ShieldCheck,
    aviso: 'Filtrando ordens em Execução.', titulo: 'Clique para filtrar ordens em Execução',
    hover: 'hover:border-[#101828]', rotuloCor: ['text-[#98a2b3]', 'text-[#101828]'],
    iconeCor: ['bg-[#101828] text-[#0284c7]'],
  },
  {
    status: 'pronto_retirada', rotulo: 'Pronto Retirada', metrica: 'prontoRetirada', Icone: Car,
    aviso: 'Filtrando ordens Prontas para Retirada.', titulo: 'Clique para filtrar ordens Prontas para Retirada',
    selecionado: 'bg-[#0284c7] text-white border-[#0284c7]',
    hover: 'hover:border-[#0284c7]', rotuloCor: ['text-white', 'text-[#0369a1]'],
    iconeCor: ['bg-[#e0f2fe] text-[#0284c7]'],
  },
]

/** Escolhe a classe do estado ativo/inativo; listas com um item valem para os dois. */
const cor = (par = [''], ativo) => (ativo ? par[0] : par[par.length - 1])

function CardStatus({ card, valor, ativo, onFiltrar }) {
  const { Icone } = card
  return (
    <div
      onClick={() => {
        onFiltrar(STATUS_ORCAMENTO.find((s) => s.value === card.status) || STATUS_ORCAMENTO[0])
        toast.info(card.aviso)
      }}
      title={card.titulo}
      className={`rounded-xl border p-2.5 shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
        ativo ? card.selecionado || SELECIONADO_PADRAO : `bg-white text-[#101828] border-[#d0d5dd] ${card.hover}`
      }`}
    >
      <div>
        <span className={`text-[10px] font-bold uppercase tracking-wider block ${cor(card.rotuloCor, ativo)}`}>
          {card.rotulo}
        </span>
        <span className={`text-base font-black mt-0.5 block ${cor(card.valorCor, ativo)}`}>{valor}</span>
      </div>
      <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 ${cor(card.iconeCor, ativo)}`}>
        <Icone size={16} weight="bold" />
      </div>
    </div>
  )
}

/**
 * Barra de indicadores das OS abertas: total em aberto e um card por etapa do fluxo,
 * cada um filtrando a lista pelo respectivo status.
 * @param {{metricas: object, filtroStatus: object, onFiltrar: (opcao: object) => void}} props
 */
export function OSMetricasAbertas({ metricas, filtroStatus, onFiltrar }) {
  return (
    <section className="shrink-0 grid grid-cols-8 gap-2">
      <div
        onClick={() => onFiltrar(STATUS_ORCAMENTO[0])}
        title="Clique para ver todas as ordens abertas"
        className="bg-white rounded-xl border border-[#d0d5dd] p-2.5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-[#101828] transition-all"
      >
        <div>
          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">Total em Aberto</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-black text-[#101828]">{metricas.totalAbertas}</span>
            <span className="text-[9.5px] font-bold text-[#667085] truncate">
              (R$ {formatMoeda(metricas.somaValorTotal)})
            </span>
          </div>
        </div>
        <div className="w-7.5 h-7.5 rounded-lg bg-[#f2f4f7] flex items-center justify-center text-[#101828] shrink-0">
          <Receipt size={16} weight="bold" />
        </div>
      </div>

      {CARDS_STATUS.map((card) => (
        <CardStatus
          key={card.status}
          card={card}
          valor={metricas[card.metrica]}
          ativo={filtroStatus.value === card.status}
          onFiltrar={onFiltrar}
        />
      ))}
    </section>
  )
}
