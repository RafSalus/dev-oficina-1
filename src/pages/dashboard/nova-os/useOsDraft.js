import { useState } from 'react'
import { gerarProximoNumeroOS, obterOrdensAbertas } from '../orcamento/mockOrdensAbertas'

export const OS_TABS = [
  { id: 'cliente-veiculo', label: 'Cliente e Veiculo' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'diagnostico', label: 'Diagnostico' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'pecas', label: 'Peças' },
  { id: 'terceiros', label: 'Terceiros' },
  { id: 'orcamento', label: 'Orçamento' },
  { id: 'finalizar', label: 'Finalizar' },
]

export const DRAFT_KEY = 'dev_oficina_draft_os'

export const INITIAL_FORM_DATA = {
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

  // Serviços de Terceiros e Cotações
  terceirosOS: [],
  cotacoesTerceirosEnviadas: [],

  // Orçamento Oficial e Fechamento
  numeroOS: '',
  descontoGeralOS: '0.00',
  condicaoPagamentoOS: 'À vista com 5% de desconto no PIX ou até 10x no cartão',
  previsaoEntregaData: '',
  previsaoEntregaHora: '18:00',
  consultorResponsavel: 'BIANCA',

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

  // Checklist Oficial de Entrada e Saída — cada item começa sem status (não verificado ainda);
  // o preenchimento (conforme / não conforme / isento) é feito em TabChecklist.jsx.
  checklistEntrada: {
    esguicho: { status: '', obs: '' },
    vidros: { status: '', obs: '' },
    pecas: { status: '', obs: '' },
    bancos: { status: '', obs: '' },
    painel: { status: '', obs: '' },
    oleoGeral: { status: '', obs: '' },
    sensorRe: { status: '', obs: '' },
    freioMaoManopla: { status: '', obs: '' },
    cintoSeguranca: { status: '', obs: '' },
    quebraSolPqp: { status: '', obs: '' },
    retrovisores: { status: '', obs: '' },
    lampadasGeral: { status: '', obs: '' },
    palhetas: { status: '', obs: '' },
    portas: { status: '', obs: '' },
    agua: { status: '', obs: '' },
    vazamentos: { status: '', obs: '' },
    rodas: { status: '', obs: '' },
    alinhamento: { status: '', obs: '' },
    buzina: { status: '', obs: '' },
    portinholaTanque: { status: '', obs: '' },
    bateria: { status: '', obs: '' },
    testeDdp: { status: '', obs: '' },
  },
  checklistEntradaObs: '',
  checklistSaida: {
    nivelFluidos: { status: '', obs: '' },
    apertoRodas: { status: '', obs: '' },
    calibragemPneus: { status: '', obs: '' },
    testeVeiculo: { status: '', obs: '' },
    etiquetaOleo: { status: '', obs: '' },
  },
  checklistSaidaObs: '',
}

export function useOsDraft() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        let numOS = parsed.numeroOS

        // Se o rascunho tem '002908' mas não é de uma OS real sendo editada com esse cliente, gera o próximo
        if (numOS === '002908') {
          const abertas = obterOrdensAbertas()
          const ehEdicao = abertas.some(
            (o) => String(o.numeroOS) === '002908' && o.cliente === parsed.cliente
          )
          if (!ehEdicao) {
            numOS = null
          }
        }

        if (!numOS) {
          numOS = gerarProximoNumeroOS()
        }

        // Se o rascunho salvo continha a simulação de 30 itens, limpa os itens simulados
        if (
          parsed.terceirosOS?.some((t) => t.id === 'terc-sim-1' || t.id === 'terc-sim-2') ||
          (parsed.pecasOS?.length === 30 && parsed.pecasOS[29]?.codigo === '017291')
        ) {
          parsed.pecasOS = []
          parsed.servicosOS = []
          parsed.terceirosOS = []
        }

        const mesclado = { ...INITIAL_FORM_DATA, ...parsed, numeroOS: numOS }
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(mesclado))
        } catch (e) {}
        return mesclado
      }
    } catch (e) {
      console.error('Erro ao ler rascunho de OS:', e)
    }

    const novoNum = gerarProximoNumeroOS()
    const inicial = {
      ...INITIAL_FORM_DATA,
      numeroOS: novoNum,
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(inicial))
    } catch (e) {}
    return inicial
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

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {}
  }

  return { formData, updateFormData, clearDraft }
}
