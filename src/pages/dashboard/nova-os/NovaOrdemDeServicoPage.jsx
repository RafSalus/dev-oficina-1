import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotice } from '../../../context/NoticeContext'
import { TabClienteVeiculo } from './tabs/TabClienteVeiculo'
import { TabChecklist } from './tabs/TabChecklist'
import { TabDiagnostico } from './tabs/TabDiagnostico'
import { TabServicos } from './tabs/TabServicos'
import { TabPecas } from './tabs/TabPecas'
import { TabEmBreve } from './tabs/TabEmBreve'
import { toast } from 'sonner'

export const OS_TABS = [
  { id: 'cliente-veiculo', label: 'Cliente e Veiculo' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'diagnostico', label: 'Diagnostico' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'pecas', label: 'Peças' },
  { id: 'aprovacao', label: 'Aprovação' },
  { id: 'terceiros', label: 'Terceiros' },
  { id: 'orcamento', label: 'Orçamento' },
  { id: 'finalizar', label: 'Finalizar' },
]

const DRAFT_KEY = 'dev_oficina_draft_os'

const INITIAL_FORM_DATA = {
  // Cliente
  clienteId: '',
  cliente: '',
  telefone: '',
  documento: '',
  email: '',
  endereco: '',

  // Diagnóstico
  mecanicoId: '',
  mecanicoNome: '',
  pecasDiagnostico: [],
  servicosDiagnostico: [],
  problemasDetectados: [],
  laudoTecnico: '',

  // Serviços da OS
  servicosOS: [],

  // Peças e Cotações da OS
  pecasOS: [],
  cotacoesEnviadas: [],

  // Veículo
  veiculoId: '',
  placa: '',
  marcaModelo: '',
  ano: '',
  cor: '',
  km: '',
  nivelCombustivel: '1/2',

  // Relato do Cliente e Atendimento
  tipoAtendimento: 'orcamento',
  prioridade: 'normal',
  relatoCliente: '',

  // KM de Saída
  kmSaida: '',

  // Checklist Oficial de Entrada e Saída
  checklistEntrada: {
    esguicho: { ok: true, obs: '' },
    vidros: { ok: true, obs: '' },
    pecas: { ok: true, obs: '' },
    bancos: { ok: true, obs: '' },
    painel: { ok: true, obs: '' },
    oleoGeral: { ok: true, obs: '' },
    sensorRe: { ok: true, obs: '' },
    freioMaoManopla: { ok: true, obs: '' },
    cintoSeguranca: { ok: true, obs: '' },
    quebraSolPqp: { ok: true, obs: '' },
    retrovisores: { ok: true, obs: '' },
    lampadasGeral: { ok: true, obs: '' },
    palhetas: { ok: true, obs: '' },
    portas: { ok: true, obs: '' },
    agua: { ok: true, obs: '' },
    vazamentos: { ok: true, obs: '' },
    rodas: { ok: true, obs: '' },
    alinhamento: { ok: true, obs: '' },
    buzina: { ok: true, obs: '' },
    portinholaTanque: { ok: true, obs: '' },
    bateria: { ok: true, obs: '' },
    testeDdp: { ok: true, obs: '' },
  },
  checklistEntradaObs: '',
  checklistSaida: {
    nivelFluidos: { ok: true, obs: '' },
    apertoRodas: { ok: true, obs: '' },
    calibragemPneus: { ok: true, obs: '' },
    testeVeiculo: { ok: true, obs: '' },
    etiquetaOleo: { ok: true, obs: '' },
  },
  checklistSaidaObs: '',
}

export function NovaOrdemDeServicoPage() {
  const navigate = useNavigate()
  const { openNotice } = useNotice()

  const [activeTab, setActiveTab] = useState('cliente-veiculo')

  // Estado unificado dos dados da OS com persistência de rascunho
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...INITIAL_FORM_DATA, ...parsed }
      }
    } catch (e) {
      console.error('Erro ao ler rascunho de OS:', e)
    }
    return INITIAL_FORM_DATA
  })

  const updateFormData = (fields) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields }
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }

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
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {}
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

    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {}

    toast.success(`Ordem de Serviço #${formData.placa.toUpperCase()} aberta com sucesso para ${formData.cliente}!`)
    navigate('/gestao/ordem-de-servico')
  }

  return (
    <form
      id="form-nova-os"
      onSubmit={handleSubmit}
      className="h-full w-full flex flex-col gap-2.5 overflow-hidden select-none"
    >
      {/* Barra Superior de Abas (8 Abas com rótulos limpos e sem e-comercial) */}
      <nav
        aria-label="Etapas da Ordem de Serviço"
        className="h-11 shrink-0 bg-white px-2 rounded-2xl border border-[#d0d5dd] shadow-sm flex items-center justify-between gap-1 overflow-x-auto no-scrollbar"
      >
        <div className="flex items-center gap-1 w-full justify-between">
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
            onSaveStep={() => handleSaveStep('Peças e Componentes', 'aprovacao')}
            onCancel={handleCancel}
          />
        )}

        {activeTab !== 'cliente-veiculo' &&
          activeTab !== 'checklist' &&
          activeTab !== 'diagnostico' &&
          activeTab !== 'servicos' &&
          activeTab !== 'pecas' && (
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
