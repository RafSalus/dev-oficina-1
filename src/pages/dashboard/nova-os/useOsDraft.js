import { useState } from 'react'
import { gerarProximoNumeroOS, obterOrdensAbertas } from '../orcamento/mockOrdensAbertas'

export const DRAFT_KEY = 'dev_oficina_draft_os'

export const ITENS_CHECKLIST_PADRAO = {
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
}

export const INITIAL_FORM_DATA = {
  // Identificação e Fluxo
  numeroOS: '',
  status: 'fila', // 'fila' | 'em_diagnostico' | 'aguardando_pecas' | 'aguardando_aprovacao'
  prioridade: 'normal', // 'normal' | 'alta' | 'urgente' | 'retorno'
  tipoAtendimento: 'orcamento', // 'orcamento' | 'preventiva' | 'corretiva' | 'garantia' | 'sinistro'
  canalEntrada: 'presencial', // 'presencial' | 'whatsapp' | 'telefone' | 'leva_traz' | 'agendamento'
  dataEntrada: '',
  horaEntrada: '',
  previsaoEntregaData: '',
  previsaoEntregaHora: '18:00',
  consultorResponsavel: 'BIANCA',

  // Referência ao item de origem na Fila de Espera da Agenda (constants/agendaData.js).
  // Quando preenchido, a OS foi aberta "atendendo" alguém que aguardava na recepção — o item
  // correspondente é removido da fila assim que a OS é salva (ver handleRemoverDaFilaDeEspera).
  filaEsperaId: '',

  // Cliente
  clienteId: '',
  cliente: '',
  telefone: '',
  documento: '',
  email: '',
  endereco: '',
  cidade: '',
  uf: '',

  // Veículo
  veiculoId: '',
  placa: '',
  marca: '',
  modelo: '',
  marcaModelo: '',
  ano: '',
  cor: '',
  combustivel: 'FLEX',
  km: '',
  kmAnterior: '',
  nivelCombustivel: '1/2', // 'reserva' | '1/4' | '1/2' | '3/4' | 'cheio'

  // Relato do Cliente e Vistoria
  relatoCliente: '',
  objetosVeiculo: '',
  avariasVisual: '',

  // Atribuição Técnica
  mecanicoId: '',
  mecanicoNome: '',
  laudoTecnico: '',

  // Itens da OS (Serviços e Peças)
  servicosOS: [],
  pecasOS: [],
  terceirosOS: [],
  descontoGeralOS: '0.00',
  condicaoPagamentoOS: 'À vista com 5% de desconto no PIX ou até 10x no cartão',

  // Checklist Oficial de Entrada (22 itens)
  checklistEntrada: { ...ITENS_CHECKLIST_PADRAO },
  checklistEntradaObs: '',

  // Fotos do Veiculo na Entrada (dataURL por angulo — frente, traseira, laterais, painel,
  // motor, porta-malas). Fazem parte da Vistoria de Entrada e ficam visiveis ao cliente na
  // pagina publica de assinatura do checklist.
  fotosVeiculoEntrada: {},

  // Checklist de Saída (Realizado na Entrega / PDV)
  checklistSaida: {
    nivelFluidos: { status: '', obs: '' },
    apertoRodas: { status: '', obs: '' },
    calibragemPneus: { status: '', obs: '' },
    testeVeiculo: { status: '', obs: '' },
    etiquetaOleo: { status: '', obs: '' },
  },
  checklistSaidaObs: '',
  kmSaida: '',
}

function getDataAtualFormatada() {
  const agora = new Date()
  const d = String(agora.getDate()).padStart(2, '0')
  const m = String(agora.getMonth() + 1).padStart(2, '0')
  const y = agora.getFullYear()
  return `${d}/${m}/${y}`
}

function getHoraAtualFormatada() {
  const agora = new Date()
  const h = String(agora.getHours()).padStart(2, '0')
  const min = String(agora.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

function getDataAmanhaFormatada(dias = 1) {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  const d = String(data.getDate()).padStart(2, '0')
  const m = String(data.getMonth() + 1).padStart(2, '0')
  const y = data.getFullYear()
  return `${d}/${m}/${y}`
}

export function useOsDraft() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        let numOS = parsed.numeroOS

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

        const mesclado = {
          ...INITIAL_FORM_DATA,
          dataEntrada: parsed.dataEntrada || getDataAtualFormatada(),
          horaEntrada: parsed.horaEntrada || getHoraAtualFormatada(),
          previsaoEntregaData: parsed.previsaoEntregaData || getDataAmanhaFormatada(1),
          ...parsed,
          numeroOS: numOS,
          checklistEntrada: {
            ...ITENS_CHECKLIST_PADRAO,
            ...(parsed.checklistEntrada || {}),
          },
        }

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
      dataEntrada: getDataAtualFormatada(),
      horaEntrada: getHoraAtualFormatada(),
      previsaoEntregaData: getDataAmanhaFormatada(1),
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

  // Reinicia o formulario em branco sem recarregar a pagina (o modal permanece aberto) —
  // usado pelo botao "Limpar" dentro do modal de abertura de OS.
  const resetDraft = () => {
    const novoNum = gerarProximoNumeroOS()
    const inicial = {
      ...INITIAL_FORM_DATA,
      numeroOS: novoNum,
      dataEntrada: getDataAtualFormatada(),
      horaEntrada: getHoraAtualFormatada(),
      previsaoEntregaData: getDataAmanhaFormatada(1),
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(inicial))
    } catch (e) {}
    setFormData(inicial)
  }

  return { formData, updateFormData, clearDraft, resetDraft }
}
