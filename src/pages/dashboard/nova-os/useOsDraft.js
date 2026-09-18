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
