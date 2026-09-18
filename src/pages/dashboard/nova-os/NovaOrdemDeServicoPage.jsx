import React, { useState } from 'react'
import { Receipt } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useNotice } from '../../../context/NoticeContext'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { TabClienteVeiculo } from './tabs/TabClienteVeiculo'
import { TabChecklist } from './tabs/TabChecklist'
import { TabDiagnostico } from './tabs/TabDiagnostico'
import { TabServicos } from './tabs/TabServicos'
import { TabPecas } from './tabs/TabPecas'
import { TabTerceiros } from './tabs/TabTerceiros'
import { TabOrcamento } from './tabs/TabOrcamento'
import { TabEmBreve } from './tabs/TabEmBreve'
import { MobileNovaOrdemDeServicoPage } from './mobile/MobileNovaOrdemDeServicoPage'
import { OS_TABS, DRAFT_KEY, useOsDraft } from './useOsDraft'
import { adicionarOuAtualizarOrdem } from '../orcamento/mockOrdensAbertas'
import { toast } from 'sonner'

export { OS_TABS }

export function NovaOrdemDeServicoPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { openNotice } = useNotice()

  const [activeTab, setActiveTab] = useState('cliente-veiculo')
  const { formData, updateFormData, clearDraft } = useOsDraft()

  const handleSaveStep = (stepName, nextTabId) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
    } catch (e) {
      console.error('Erro ao salvar rascunho:', e)
    }
    if (stepName) {
      openNotice(`Etapa "${stepName}" salva com sucesso!`)
    }
    if (nextTabId) {
      setActiveTab(nextTabId)
    }
  }

  const handleCancel = () => {
    clearDraft()
    toast.info('Abertura de Ordem de Serviço cancelada.')
    navigate('/gestao/ordem-de-servico')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.cliente.trim()) {
      setActiveTab('cliente-veiculo')
      toast.warning('Por favor, selecione o cliente.')
      return
    }

    if (!formData.placa.trim()) {
      setActiveTab('cliente-veiculo')
      toast.warning('Por favor, selecione o veículo do cliente.')
      return
    }

    if (!formData.km.trim()) {
      setActiveTab('cliente-veiculo')
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

    toast.success(`Ordem de Serviço #${formData.numeroOS} aberta com sucesso para ${formData.cliente}!`)
    navigate('/gestao/ordem-de-servico')
  }

  if (isMobile) {
    return (
      <MobileNovaOrdemDeServicoPage
        formData={formData}
        updateFormData={updateFormData}
        clearDraft={clearDraft}
      />
    )
  }

  return (
    <form
      id="form-nova-os"
      onSubmit={handleSubmit}
      className="h-full w-full flex flex-col gap-2.5 overflow-hidden select-none"
    >
      {/* Barra Superior de Abas com Identificação do Número da OS */}
      <nav
        aria-label="Etapas da Ordem de Serviço"
        className="h-11 shrink-0 bg-white px-2.5 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-2 overflow-x-auto no-scrollbar"
      >
        {/* Identificador Oficial da OS */}
        <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-[#101828] text-white rounded-xl shrink-0 shadow-xs">
          <div className="w-5.5 h-5.5 rounded-lg bg-[#0284c7] flex items-center justify-center text-white">
            <Receipt size={13} weight="bold" />
          </div>
          <div className="leading-tight">
            <span className="text-[8px] font-bold text-[#98a2b3] uppercase tracking-wider block">Nº DA OS</span>
            <span className="font-mono font-black text-xs text-white">#{formData.numeroOS}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#e4e7ec] shrink-0" />

        <div className="flex items-center gap-1 flex-1 justify-between min-w-0">
          {OS_TABS.map((tab, index) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                  isActive
                    ? 'bg-[#101828] text-white font-bold shadow-xs'
                    : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7] font-medium'
                }`}
              >
                <span
                  className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    isActive ? 'bg-[#0284c7] text-white' : 'bg-[#f2f4f7] text-[#667085]'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Conteúdo da Aba Ativa (100% da altura até o footer, sem scroll) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'cliente-veiculo' && (
          <TabClienteVeiculo
            formData={formData}
            updateFormData={updateFormData}
            onSaveStep={() => handleSaveStep('Cliente e Veículo', 'checklist')}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'checklist' && (
          <TabChecklist
            formData={formData}
            updateFormData={updateFormData}
            onSaveStep={() => handleSaveStep('Checklist', 'diagnostico')}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'diagnostico' && (
          <TabDiagnostico
            formData={formData}
            updateFormData={updateFormData}
            onSaveStep={() => handleSaveStep('Diagnóstico Técnico', 'servicos')}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'servicos' && (
          <TabServicos
            formData={formData}
            updateFormData={updateFormData}
            onSaveStep={() => handleSaveStep('Serviços e Mão de Obra', 'pecas')}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'pecas' && (
          <TabPecas
            formData={formData}
            updateFormData={updateFormData}
            onSaveStep={() => handleSaveStep('Peças e Componentes', 'terceiros')}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'terceiros' && (
          <TabTerceiros
            formData={formData}
            updateFormData={updateFormData}
            onSaveStep={() => handleSaveStep('Serviços de Terceiros', 'orcamento')}
            onCancel={handleCancel}
          />
        )}

        {activeTab === 'orcamento' && (
          <TabOrcamento
            formData={formData}
            updateFormData={updateFormData}
            onSaveStep={() => handleSaveStep('Composição de Orçamento', 'finalizar')}
            onCancel={handleCancel}
          />
        )}

        {activeTab !== 'cliente-veiculo' &&
          activeTab !== 'checklist' &&
          activeTab !== 'diagnostico' &&
          activeTab !== 'servicos' &&
          activeTab !== 'pecas' &&
          activeTab !== 'terceiros' &&
          activeTab !== 'orcamento' && (
            <TabEmBreve
              tabId={activeTab}
              onSelectTab={setActiveTab}
              onSaveStep={handleSaveStep}
              onCancel={handleCancel}
            />
          )}
      </div>
    </form>
  )
}
