import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { OS_TABS } from '../useOsDraft'
import { adicionarOuAtualizarOrdem } from '../../orcamento/mockOrdensAbertas'
import { MobileStepClienteVeiculo } from './steps/MobileStepClienteVeiculo'
import { MobileStepChecklist } from './steps/MobileStepChecklist'
import { MobileStepDiagnostico } from './steps/MobileStepDiagnostico'
import { MobileStepServicos } from './steps/MobileStepServicos'
import { MobileStepPecas } from './steps/MobileStepPecas'
import { MobileStepTerceiros } from './steps/MobileStepTerceiros'
import { MobileStepOrcamento } from './steps/MobileStepOrcamento'

const MOBILE_STEPS = OS_TABS.filter((tab) => tab.id !== 'finalizar')

export function MobileNovaOrdemDeServicoPage({ formData, updateFormData, clearDraft }) {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)

  const activeStep = MOBILE_STEPS[stepIndex]
  const isLastStep = stepIndex === MOBILE_STEPS.length - 1

  const goToStep = (index) => setStepIndex(Math.max(0, Math.min(MOBILE_STEPS.length - 1, index)))
  const goNext = () => goToStep(stepIndex + 1)

  const handleCancel = () => {
    clearDraft()
    toast.info('Abertura de Ordem de Serviço cancelada.')
    navigate('/gestao/ordem-de-servico')
  }

  // Salva a OS a partir de qualquer etapa (não exige percorrer o fluxo todo)
  const handleSalvarOS = () => {
    if (!formData.cliente?.trim()) {
      setStepIndex(0)
      toast.warning('Por favor, selecione o cliente.')
      return
    }
    if (!formData.placa?.trim()) {
      setStepIndex(0)
      toast.warning('Por favor, selecione o veículo do cliente.')
      return
    }
    if (!formData.km?.trim()) {
      setStepIndex(0)
      toast.warning('Por favor, informe a quilometragem (KM) do veículo.')
      return
    }

    // Persiste no storage de ordens abertas e orçamentos
    try {
      adicionarOuAtualizarOrdem(formData)
    } catch (err) {
      console.error('Erro ao registrar ordem aberta:', err)
    }

    clearDraft()
    toast.success(
      `Ordem de Serviço #${formData.numeroOS} salva com sucesso para ${formData.cliente}!`
    )
    navigate('/gestao/ordem-de-servico')
  }

  const stepProps = {
    formData,
    updateFormData,
    onContinue: isLastStep ? handleSalvarOS : goNext,
    isLastStep,
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#eaecf0]">
      {/* Cabeçalho dedicado do fluxo de Nova OS */}
      <header
        className="sticky top-0 z-40 bg-white border-b border-[#e4e7ec]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Cancelar abertura de OS"
            className="p-2 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>

          <div className="flex flex-col items-center min-w-0">
            <span className="text-sm font-extrabold text-[#101828] leading-tight truncate">
              Nova Ordem de Serviço
            </span>
            <span className="text-[10px] font-semibold text-[#667085]">
              Etapa {stepIndex + 1} de {MOBILE_STEPS.length} • {activeStep.label}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSalvarOS}
            aria-label="Salvar Ordem de Serviço"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black active:bg-zinc-800 text-white text-xs font-bold shrink-0"
          >
            <FloppyDisk size={15} weight="bold" />
            <span>Salvar</span>
          </button>
        </div>

        {/* Trilha de progresso por etapas (navegável) */}
        <div className="px-3 pb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {MOBILE_STEPS.map((tab, index) => {
            const isActive = index === stepIndex
            const isDone = index < stepIndex
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => goToStep(index)}
                className={`shrink-0 w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#0284c7] text-white'
                    : isDone
                    ? 'bg-[#101828] text-white'
                    : 'bg-[#f2f4f7] text-[#667085]'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </header>

      {/* Conteúdo da etapa ativa */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        {activeStep.id === 'cliente-veiculo' && <MobileStepClienteVeiculo {...stepProps} />}
        {activeStep.id === 'checklist' && <MobileStepChecklist {...stepProps} />}
        {activeStep.id === 'diagnostico' && <MobileStepDiagnostico {...stepProps} />}
        {activeStep.id === 'servicos' && <MobileStepServicos {...stepProps} />}
        {activeStep.id === 'pecas' && <MobileStepPecas {...stepProps} />}
        {activeStep.id === 'terceiros' && <MobileStepTerceiros {...stepProps} />}
        {activeStep.id === 'orcamento' && <MobileStepOrcamento {...stepProps} />}
      </main>
    </div>
  )
}
