import Select from 'react-select'
import { HandGrabbing } from '@phosphor-icons/react'
import { STATUS_ORCAMENTO } from '../../dashboard/orcamento/mockOrdensAbertas'
import { SEQUENCIA_STATUS, podeTransicionarPara, motivoBloqueioTransicao } from '../../dashboard/orcamento/statusTransicao'
import { customSelectStyles } from '../../../components/suprimentos/customSelectStyles'
import { toast } from 'sonner'

export function MecanicoOSFila({
  ordensDisponiveis,
  ordensDoMecanico,
  osSelecionadaId,
  mecanicoNome,
  handlePuxarOrdem,
  handleAtualizarStatus,
  setOsSelecionadaId,
  setActiveTab,
}) {
  return (
    <div className="space-y-4">
      {/* Fila Disponível para Atendimento — OS sem mecânico atribuído que qualquer
          mecânico pode puxar para si (D4: só funciona em OS ainda sem atribuição) */}
      {ordensDisponiveis.length > 0 && (
        <div className="border border-[#bae6fd] rounded-2xl overflow-hidden divide-y divide-[#e0f2fe] bg-[#f0f9ff]">
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0369a1] flex items-center gap-1.5">
                <HandGrabbing size={15} weight="bold" />
                Fila Disponível para Atendimento
              </h3>
              <p className="text-xs text-[#0369a1]/80">
                OS na Fila sem mecânico escalado — puxe uma delas para começar a vistoria e o diagnóstico.
              </p>
            </div>
          </div>
          {ordensDisponiveis.map((os) => (
            <div key={os.numeroOS} className="px-4 py-3 flex items-center justify-between gap-3 bg-white text-xs">
              <div className="min-w-0 flex-1 grid grid-cols-3 gap-3">
                <div className="min-w-0">
                  <span className="font-mono font-black text-sm text-[#101828] block">#{os.numeroOS}</span>
                  <span className="font-mono text-[11px] text-[#0284c7] font-bold">{os.placa}</span>
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#101828] block truncate">{os.marcaModelo}</span>
                  <span className="text-[11px] text-[#667085] block truncate">{os.cliente}</span>
                </div>
                <p className="text-[11px] text-[#475467] truncate" title={os.relatoCliente}>
                  {os.relatoCliente || 'Sem relato'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePuxarOrdem(os.numeroOS)}
                className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <HandGrabbing size={14} weight="bold" />
                Puxar OS
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#101828]">
            Ordens de Serviço Atribuídas a {mecanicoNome}
          </h3>
          <p className="text-xs text-[#667085]">
            Acompanhe o andamento de cada veículo, atualize etapas e abra detalhes da bancada.
          </p>
        </div>
      </div>

      <div className="border border-[#e4e7ec] rounded-2xl overflow-hidden divide-y divide-[#f2f4f7] bg-white">
        <div className="bg-[#f8fafc] px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-bold uppercase tracking-wider text-[#667085]">
          <div className="col-span-1">Nº OS</div>
          <div className="col-span-2">Veículo e Placa</div>
          <div className="col-span-3">Cliente e Contato</div>
          <div className="col-span-2">Diagnóstico / Queixa</div>
          <div className="col-span-2">Status da OS</div>
          <div className="col-span-2 text-right">Ações de Bancada</div>
        </div>

        {ordensDoMecanico.map((os) => {
          const isSelected = os.numeroOS === osSelecionadaId
          return (
            <div
              key={os.numeroOS}
              className={`px-4 py-3 grid grid-cols-12 gap-3 items-center text-xs transition-colors border-l-4 ${
                isSelected
                  ? 'bg-[#f0f9ff] border-l-[#0284c7]'
                  : 'hover:bg-[#f8fafc] border-l-transparent'
              }`}
            >
              <div className="col-span-1 font-mono font-black text-sm text-[#101828]">
                #{os.numeroOS}
              </div>
              <div className="col-span-2 min-w-0">
                <span className="font-bold text-[#101828] block truncate">{os.marcaModelo}</span>
                <span className="font-mono text-[11px] text-[#0284c7] font-bold">{os.placa}</span>
              </div>
              <div className="col-span-3 min-w-0">
                <span className="font-semibold text-[#101828] block truncate">{os.cliente}</span>
                <span className="text-[11px] text-[#667085]">{os.telefone}</span>
              </div>
              <div className="col-span-2 min-w-0">
                <p className="text-[11px] text-[#475467] truncate" title={os.relatoCliente}>
                  {os.relatoCliente || 'Sem relato'}
                </p>
              </div>
              <div className="col-span-2">
                <Select
                  value={STATUS_ORCAMENTO.find((s) => s.value === os.status) || null}
                  onChange={(opt) => {
                    if (!opt || opt.value === os.status) return
                    if (!podeTransicionarPara(os.status, opt.value)) {
                      toast.warning('Só é possível mover a OS para a etapa anterior ou a etapa seguinte, sem pular colunas.')
                      return
                    }
                    const motivo = motivoBloqueioTransicao(os, opt.value)
                    if (motivo) {
                      toast.warning(motivo)
                      return
                    }
                    handleAtualizarStatus(os.numeroOS, opt.value)
                  }}
                  options={SEQUENCIA_STATUS.map((s) => STATUS_ORCAMENTO.find((opt) => opt.value === s)).filter(Boolean)}
                  isOptionDisabled={(opt) => !podeTransicionarPara(os.status, opt.value)}
                  isSearchable={false}
                  styles={customSelectStyles}
                />
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOsSelecionadaId(os.numeroOS)
                    setActiveTab('dashboard')
                  }}
                  className="px-3 py-1.5 bg-[#101828] hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer"
                >
                  Trabalhar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
