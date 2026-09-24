import Select from 'react-select'
import { Wrench, ClipboardText, Coins, Package, ShoppingCart, CheckCircle } from '@phosphor-icons/react'
import { SEQUENCIA_STATUS, motivoBloqueioTransicao } from '../../dashboard/orcamento/statusTransicao'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { toast } from 'sonner'

export function MecanicoHeaderMetricas({
  metricasMecanico,
  requisicoesPecas,
  osAtiva,
  ordensDoMecanico,
  osSelecionadaId,
  setOsSelecionadaId,
  handleAtualizarStatus,
}) {
  return (
    <>
      {/* 1. Barra de Resumo e Métricas da Bancada do Mecânico */}
      <header className="shrink-0 mb-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* OS sob Responsabilidade */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              Minhas OS no Pátio
            </span>
            <span className="text-xl font-black text-[#101828] mt-0.5 block font-mono">
              {metricasMecanico.totalAtribuidas}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#f2f4f7] flex items-center justify-center text-[#101828]">
            <ClipboardText size={19} weight="bold" />
          </div>
        </div>

        {/* Em Execução Hoje */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#0369a1] uppercase tracking-wider block">
              Em Execução
            </span>
            <span className="text-xl font-black text-[#0284c7] mt-0.5 block font-mono">
              {metricasMecanico.emExecucao}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-[#0284c7]">
            <Wrench size={19} weight="bold" />
          </div>
        </div>

        {/* Aguardando Peças */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Aguardando Peças
            </span>
            <span className="text-xl font-black text-amber-700 mt-0.5 block font-mono">
              {metricasMecanico.aguardandoPecas}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Package size={19} weight="bold" />
          </div>
        </div>

        {/* Pronto / Concluído */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#344054] uppercase tracking-wider block">
              Pronto para Retirada
            </span>
            <span className="text-xl font-black text-[#101828] mt-0.5 block font-mono">
              {metricasMecanico.concluidasHoje}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#101828] flex items-center justify-center text-white">
            <CheckCircle size={19} weight="bold" />
          </div>
        </div>

        {/* Peças Requisitadas */}
        <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              Requisições Balcão
            </span>
            <span className="text-xl font-black text-[#101828] mt-0.5 block font-mono">
              {requisicoesPecas.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#f2f4f7] flex items-center justify-center text-[#475467]">
            <ShoppingCart size={19} weight="bold" />
          </div>
        </div>

        {/* Minha Comissão Acumulada */}
        <div className="bg-white rounded-2xl border border-sky-300 p-3 shadow-2xs flex items-center justify-between bg-sky-50/40">
          <div>
            <span className="text-[10px] font-bold text-[#0369a1] uppercase tracking-wider block">
              Comissão ({metricasMecanico.percComissao}%)
            </span>
            <span className="text-lg font-black text-[#0284c7] mt-0.5 block font-mono">
              R$ {metricasMecanico.comissaoAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-xs">
            <Coins size={19} weight="bold" />
          </div>
        </div>
      </header>

      {/* 2. Seletor Rápido da Ordem de Serviço Ativa na Bancada */}
      <div className="shrink-0 bg-white border border-[#d0d5dd] rounded-2xl p-2.5 mb-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#101828] text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Wrench size={18} weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                VEÍCULO EM ATENDIMENTO NA SUA BANCADA:
              </span>
              <span className="px-2 py-0.2 bg-[#e0f2fe] text-[#0369a1] rounded text-[10px] font-bold font-mono">
                #{osAtiva?.numeroOS || '—'}
              </span>
            </div>
            <p className="font-extrabold text-sm text-[#101828] truncate">
              {osAtiva?.marcaModelo || 'Veículo'} • Placa:{' '}
              <strong className="text-[#0284c7]">{osAtiva?.placa || 'SEM PLACA'}</strong> •{' '}
              <span className="font-semibold text-xs text-[#475467]">{osAtiva?.cliente}</span>
            </p>
          </div>
        </div>

        {/* Seletor de OS Atribuída — só entre as OS já assumidas por este mecânico */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#475467] hidden sm:inline shrink-0">Mudar OS Ativa:</label>
          <div className="w-64">
            <Select
              value={
                ordensDoMecanico.find((o) => o.numeroOS === osSelecionadaId)
                  ? {
                      value: osSelecionadaId,
                      label: `#${osAtiva?.numeroOS} - ${osAtiva?.marcaModelo} (${osAtiva?.placa})`,
                    }
                  : null
              }
              onChange={(opt) => opt && setOsSelecionadaId(opt.value)}
              options={ordensDoMecanico.map((o) => ({
                value: o.numeroOS,
                label: `#${o.numeroOS} - ${o.marcaModelo} (${o.placa}) - ${o.cliente.split(' ')[0]}`,
              }))}
              placeholder="Nenhuma OS atribuída a você"
              isSearchable={false}
              styles={customSelectStyles}
            />
          </div>

          {/* Botão para atualizar status rápido, respeitando a mesma sequência e os mesmos
              gates de bloqueio usados no Kanban de OS (secretaria/gestão) */}
          <button
            type="button"
            onClick={() => {
              if (!osAtiva) return
              const indiceAtual = SEQUENCIA_STATUS.indexOf(osAtiva.status)
              const proximoStatus = SEQUENCIA_STATUS[indiceAtual + 1]
              if (!proximoStatus) {
                toast.info('Esta OS já está na última etapa do fluxo.')
                return
              }
              const motivo = motivoBloqueioTransicao(osAtiva, proximoStatus)
              if (motivo) {
                toast.warning(motivo)
                return
              }
              handleAtualizarStatus(osAtiva.numeroOS, proximoStatus)
            }}
            className="h-8.5 px-3 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
            title="Avançar status da OS para a próxima etapa"
          >
            <CheckCircle size={15} weight="bold" />
            <span>Avançar Etapa</span>
          </button>
        </div>
      </div>
    </>
  )
}
