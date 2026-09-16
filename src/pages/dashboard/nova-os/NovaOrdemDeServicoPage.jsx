import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotice } from '../../../context/NoticeContext'
import { TabClienteVeiculo } from './tabs/TabClienteVeiculo'
import { TabChecklist } from './tabs/TabChecklist'
import { TabEmBreve } from './tabs/TabEmBreve'

export const OS_TABS = [
  { id: 'cliente-veiculo', label: 'Cliente e Veiculo' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'diagnostico', label: 'Diagnostico' },
  { id: 'pecas', label: 'Peças' },
  { id: 'cotacao', label: 'Cotação' },
  { id: 'terceiros', label: 'Terceiros' },
  { id: 'orcamento', label: 'Orçamento' },
  { id: 'finalizar', label: 'Finalizar' },
]

export function NovaOrdemDeServicoPage() {
  const navigate = useNavigate()
  const { openNotice } = useNotice()

  const [activeTab, setActiveTab] = useState('cliente-veiculo')

  // Estado unificado dos dados da OS
  const [formData, setFormData] = useState({
    // Veículo
    placa: '',
    marcaModelo: '',
    ano: '',
    cor: '',
    km: '',
    nivelCombustivel: '1/2',

    // Cliente
    cliente: '',
    telefone: '',
    documento: '',
    email: '',

    // Relato do Cliente e Atendimento
    tipoAtendimento: 'orcamento',
    prioridade: 'normal',
    relatoCliente: '',

    // Checklist
    checklist: {
      estepe: true,
      macaco: true,
      chaveRoda: true,
      triangulo: true,
      manual: false,
      chaveReserva: false,
      semPertences: true,
      documento: true,
      painelIntacto: true,
      tapetes: true,
      arCondicionado: true,
      vidrosTravas: true,
      semAmassados: true,
      semRiscos: true,
      vidrosIntactos: true,
      faroisIntactos: true,
    },
    checklistObs: '',
  })

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.placa.trim()) {
      setActiveTab('cliente-veiculo')
      openNotice('Por favor, informe a placa do veículo.')
      return
    }

    if (!formData.cliente.trim()) {
      setActiveTab('cliente-veiculo')
      openNotice('Por favor, informe o nome do cliente.')
      return
    }

    openNotice(`Ordem de Serviço #${formData.placa.toUpperCase()} aberta com sucesso!`)
    navigate('/gestao/ordem-de-servico')
  }

  return (
    <form
      id="form-nova-os"
      onSubmit={handleSubmit}
      className="h-full w-full flex flex-col gap-2.5 overflow-hidden select-none"
    >
      {/* Barra Superior de Abas (8 Abas com rótulos limpos e sem &) */}
      <nav
        aria-label="Etapas da Ordem de Serviço"
        className="h-11 shrink-0 bg-white px-2 rounded-2xl border border-[#e4e7ec] shadow-xs flex items-center justify-between gap-1 overflow-x-auto no-scrollbar"
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
                    ? 'bg-black text-white font-bold shadow-xs'
                    : 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7] font-medium'
                }`}
              >
                <span
                  className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#f2f4f7] text-[#667085]'
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
            onNext={() => setActiveTab('checklist')}
          />
        )}

        {activeTab === 'checklist' && (
          <TabChecklist
            formData={formData}
            updateFormData={updateFormData}
            onPrev={() => setActiveTab('cliente-veiculo')}
            onNext={() => setActiveTab('diagnostico')}
          />
        )}

        {activeTab !== 'cliente-veiculo' && activeTab !== 'checklist' && (
          <TabEmBreve tabId={activeTab} onSelectTab={setActiveTab} />
        )}
      </div>
    </form>
  )
}
