import React, { useState, useEffect, useRef } from 'react'
import { Receipt, LockSimple } from '@phosphor-icons/react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useNotice } from '../../../context/NoticeContext'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { TabClienteVeiculo } from './tabs/TabClienteVeiculo'
import { TabChecklist } from './tabs/TabChecklist'
import { TabDiagnostico } from './tabs/TabDiagnostico'
import { TabServicos } from './tabs/TabServicos'
import { TabPecas } from './tabs/TabPecas'
import { TabTerceiros } from './tabs/TabTerceiros'
import { TabOrcamento } from './tabs/TabOrcamento'
import { MobileNovaOrdemDeServicoPage } from './mobile/MobileNovaOrdemDeServicoPage'
import { OS_TABS, DRAFT_KEY, useOsDraft } from './useOsDraft'
import { adicionarOuAtualizarOrdem, podeIniciarDiagnostico } from '../orcamento/mockOrdensAbertas'
import { ITENS_CHECKLIST_ENTRADA, checklistCompleto } from '../../../constants/checklistItems'
import { carregarClientesCadastrados } from '../../../constants/mockClientesVeiculos'
import { toast } from 'sonner'

export { OS_TABS }

// No desktop, a única aba removida é "Finalizar" (o próprio Orçamento já finaliza). O Checklist
// volta a ser sua própria aba: a secretária pode preencher só até ali e enviar a OS para a Fila
// sem mecânico atribuído — Diagnóstico em diante fica reservado para quando houver um mecânico.
const DESKTOP_TABS = OS_TABS.filter((tab) => tab.id !== 'finalizar')

// Cada etapa só libera a próxima quando os dados mínimos dela estão preenchidos. O Checklist de
// Entrada só libera o Diagnóstico se, além de completo, já houver um mecânico responsável
// atribuído (pode ser deixado sem mecânico até aqui, mas não para avançar ao diagnóstico).
function calcularEtapasValidas(formData) {
  return {
    'cliente-veiculo': Boolean(
      formData.clienteId && formData.cliente?.trim() && formData.veiculoId && formData.placa?.trim() && formData.km?.trim()
    ),
    checklist: checklistCompleto(formData.checklistEntrada, ITENS_CHECKLIST_ENTRADA) && podeIniciarDiagnostico(formData),
    diagnostico: Boolean(formData.laudoTecnico?.trim()),
    servicos: true,
    pecas: true,
    terceiros: true,
    orcamento: true,
  }
}

function abaEstaDesbloqueada(tabId, etapasValidas) {
  const indexAlvo = DESKTOP_TABS.findIndex((t) => t.id === tabId)
  for (let i = 0; i < indexAlvo; i += 1) {
    if (!etapasValidas[DESKTOP_TABS[i].id]) return false
  }
  return true
}

export function NovaOrdemDeServicoPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const { openNotice } = useNotice()

  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'
  const [searchParams] = useSearchParams()

  // Permite abrir o wizard já numa aba específica (ex: vindo do Kanban direto para "Peças")
  const abaInicial = searchParams.get('aba')
  const [activeTab, setActiveTab] = useState(
    DESKTOP_TABS.some((t) => t.id === abaInicial) ? abaInicial : 'cliente-veiculo'
  )
  const { formData, updateFormData, clearDraft } = useOsDraft()
  const etapasValidas = calcularEtapasValidas(formData)

  const lastLoadedKeyRef = useRef(null)

  useEffect(() => {
    if (lastLoadedKeyRef.current === location.key) return
    const state = location.state
    if (
      !state ||
      (!state.veiculoPlaca &&
        !state.placa &&
        !state.clienteId &&
        !state.veiculo &&
        !state.itensPreventivosSugeridos)
    ) {
      return
    }
    lastLoadedKeyRef.current = location.key

    // Carrega a base unificada de clientes e frota
    const listaClientes = carregarClientesCadastrados()
    const veiculoParam = state.veiculo || {}
    const placaAlvo = (state.veiculoPlaca || state.placa || veiculoParam.placa || '')
      .toUpperCase()
      .trim()
    const clienteIdAlvo = state.clienteId || veiculoParam.clienteId
    const clienteNomeAlvo = state.clienteNome || veiculoParam.clienteNome

    // 1. Localiza o cliente proprietário
    let clienteEncontrado = null
    if (clienteIdAlvo) {
      clienteEncontrado = listaClientes.find(
        (c) => c.value === clienteIdAlvo || c.id === clienteIdAlvo
      )
    }
    if (!clienteEncontrado && placaAlvo) {
      clienteEncontrado = listaClientes.find(
        (c) =>
          Array.isArray(c.veiculos) &&
          c.veiculos.some((v) => (v.placa || '').toUpperCase().trim() === placaAlvo)
      )
    }
    if (!clienteEncontrado && clienteNomeAlvo) {
      clienteEncontrado = listaClientes.find(
        (c) => c.nome?.toLowerCase().trim() === clienteNomeAlvo.toLowerCase().trim()
      )
    }

    // 2. Localiza o veículo dentro do cadastro do cliente
    let veiculoEncontrado = null
    if (clienteEncontrado && Array.isArray(clienteEncontrado.veiculos)) {
      if (state.veiculoId) {
        veiculoEncontrado = clienteEncontrado.veiculos.find(
          (v) => v.value === state.veiculoId || v.id === state.veiculoId
        )
      }
      if (!veiculoEncontrado && placaAlvo) {
        veiculoEncontrado = clienteEncontrado.veiculos.find(
          (v) => (v.placa || '').toUpperCase().trim() === placaAlvo
        )
      }
      if (!veiculoEncontrado && clienteEncontrado.veiculos.length > 0) {
        veiculoEncontrado = clienteEncontrado.veiculos[0]
      }
    }

    // 3. Monta o relato do cliente detalhando os pontos de atenção e revisão preventiva
    const itens = state.itensPreventivosSugeridos || []
    let relatoTexto = state.relatoPreventivo || ''

    if (!relatoTexto && Array.isArray(itens) && itens.length > 0) {
      const linhas = itens
        .map((item) => {
          const nome = item.nome || item.itemNome || 'Item Preventivo'
          const motivo = item.motivoAlerta ? ` - ${item.motivoAlerta}` : ''
          const garantiaOrigem = item.servicoOrigem
            ? ` (Origem da Garantia: ${item.servicoOrigem})`
            : ''
          return `• ${nome}${motivo}${garantiaOrigem}`
        })
        .join('\n')

      relatoTexto = [
        'REVISÃO PREVENTIVA E PONTOS DE ATENÇÃO:',
        linhas,
        '',
        'Veículo recepcionado para inspeção preventiva geral e execução dos serviços indicados no prontuário de saúde veicular.',
      ].join('\n')
    }

    const temItemVencido = Array.isArray(itens) && itens.some((i) => i.status === 'vencido')
    const temGarantia =
      Array.isArray(itens) &&
      itens.some((i) => i.id === 'revisao_garantia' || i.garantiaPendente)
    const prioridadeSugerida = temItemVencido ? 'alta' : 'normal'
    const tipoAtendimentoSugerido =
      state.tipoAtendimento ||
      (temGarantia && itens.length === 1
        ? 'garantia'
        : itens.length > 0
        ? 'preventiva'
        : 'orcamento')

    const patch = {
      clienteId: clienteEncontrado
        ? clienteEncontrado.value || clienteEncontrado.id
        : clienteIdAlvo || '',
      cliente: clienteEncontrado ? clienteEncontrado.nome : clienteNomeAlvo || '',
      telefone: clienteEncontrado
        ? clienteEncontrado.telefone || ''
        : veiculoParam.clienteTelefone || '',
      documento: clienteEncontrado
        ? clienteEncontrado.documento || ''
        : veiculoParam.clienteDocumento || '',
      email: clienteEncontrado ? clienteEncontrado.email || '' : '',
      endereco: clienteEncontrado
        ? clienteEncontrado.endereco || ''
        : veiculoParam.clienteCidade
        ? `${veiculoParam.clienteCidade} - ${veiculoParam.clienteUf || 'PR'}`
        : '',

      veiculoId: veiculoEncontrado
        ? veiculoEncontrado.value || veiculoEncontrado.id
        : state.veiculoId || veiculoParam.id || veiculoParam.value || '',
      placa: veiculoEncontrado
        ? veiculoEncontrado.placa
        : placaAlvo || veiculoParam.placa || '',
      marcaModelo: veiculoEncontrado
        ? veiculoEncontrado.marcaModelo ||
          `${veiculoEncontrado.marca || ''} ${veiculoEncontrado.modelo || ''}`.trim()
        : veiculoParam.marcaModelo ||
          `${veiculoParam.marca || ''} ${veiculoParam.modelo || ''}`.trim(),
      ano: veiculoEncontrado ? veiculoEncontrado.ano : veiculoParam.ano || '',
      cor: veiculoEncontrado ? veiculoEncontrado.cor : veiculoParam.cor || '',
      km: veiculoEncontrado
        ? veiculoEncontrado.kmPadrao || veiculoEncontrado.kmAtual || ''
        : veiculoParam.kmPadrao || veiculoParam.kmAtual || '',

      tipoAtendimento: tipoAtendimentoSugerido,
      prioridade: prioridadeSugerida,
      relatoCliente: relatoTexto || formData.relatoCliente,
    }

    updateFormData(patch)
    setActiveTab('cliente-veiculo')

    const nomeExibicao = patch.cliente ? patch.cliente.split(' ')[0] : 'Cliente'
    toast.success(
      `Ordem de Serviço preparada para ${nomeExibicao} (${patch.placa}) com os pontos de revisão preenchidos!`
    )
  }, [location.state, location.key])

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
    toast('Cancelar a abertura desta Ordem de Serviço?', {
      description: 'Todos os dados preenchidos (cliente, checklist, diagnóstico, peças e serviços) serão descartados.',
      action: {
        label: 'Descartar Tudo',
        onClick: () => {
          clearDraft()
          toast.info('Abertura de Ordem de Serviço cancelada.')
          navigate(`${basePath}/ordem-de-servico`)
        },
      },
    })
  }

  // Fluxo curto da secretária: preenche Cliente/Veículo e Checklist, e já envia a OS para a Fila,
  // sem precisar passar por Diagnóstico/Serviços/Peças/Terceiros/Orçamento (isso fica para quando
  // o mecânico for atribuído e assumir a OS).
  const handleSalvarEEnviarParaFila = () => {
    if (!formData.cliente?.trim() || !formData.placa?.trim() || !formData.km?.trim()) {
      setActiveTab('cliente-veiculo')
      toast.warning('Preencha cliente, veículo e KM antes de enviar para a fila.')
      return
    }
    if (!checklistCompleto(formData.checklistEntrada, ITENS_CHECKLIST_ENTRADA)) {
      toast.warning('Preencha todo o Checklist de Entrada antes de enviar a OS para a fila.')
      return
    }

    try {
      adicionarOuAtualizarOrdem({ ...formData, status: 'fila' })
    } catch (err) {
      console.error('Erro ao registrar ordem na fila:', err)
    }

    clearDraft()
    toast.success(`Ordem de Serviço #${formData.numeroOS} enviada para a Fila!`)
    navigate(`${basePath}/ordem-de-servico`)
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
    navigate(`${basePath}/ordem-de-servico`)
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
          {DESKTOP_TABS.map((tab, index) => {
            const isActive = activeTab === tab.id
            const desbloqueada = abaEstaDesbloqueada(tab.id, etapasValidas)
            return (
              <button
                key={tab.id}
                type="button"
                disabled={!desbloqueada}
                onClick={() => desbloqueada && setActiveTab(tab.id)}
                title={desbloqueada ? tab.label : 'Conclua as etapas anteriores para liberar esta aba'}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs transition-all duration-150 flex items-center justify-center gap-1.5 truncate ${
                  isActive
                    ? 'bg-[#101828] text-white font-bold shadow-xs cursor-pointer'
                    : desbloqueada
                    ? 'text-[#475467] hover:text-[#101828] hover:bg-[#f2f4f7] font-medium cursor-pointer'
                    : 'text-[#c0c5cd] cursor-not-allowed font-medium'
                }`}
              >
                <span
                  className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    isActive ? 'bg-[#0284c7] text-white' : desbloqueada ? 'bg-[#f2f4f7] text-[#667085]' : 'bg-[#f2f4f7] text-[#c0c5cd]'
                  }`}
                >
                  {desbloqueada ? index + 1 : <LockSimple size={9} weight="bold" />}
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
            onSaveStep={() => handleSaveStep('Checklist de Entrada', 'diagnostico')}
            onFinalizarRapido={handleSalvarEEnviarParaFila}
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
            onCancel={handleCancel}
          />
        )}
      </div>
    </form>
  )
}
