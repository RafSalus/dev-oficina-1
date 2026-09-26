import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useFrotaVeiculos } from './useFrotaVeiculos'
import { carregarVeiculosEstacionados } from '../constants/mockVeiculosEstacionados'
import {
  calcularSaudeVeiculo,
  carregarManutencoesPreventivas,
  ITENS_PREVENTIVOS_CATALOGO,
} from '../constants/mockManutencaoPreventiva'

export const FILTROS_STATUS_SAUDE = [
  { value: 'TODOS', label: 'Todos os Veículos' },
  { value: 'CRITICO', label: 'Críticos (Revisões Vencidas)' },
  { value: 'ATENCAO', label: 'Em Atenção (Próximos do Vencimento)' },
  { value: 'GARANTIA', label: 'Revisão de Garantia Pendente' },
  { value: 'EM_DIA', label: 'Em Dia e Saudáveis' },
]

export function usePreventivaWorkflow() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/secretaria') ? '/secretaria' : '/gestao'

  const { veiculos: frotaVeiculos, carregando: carregandoFrota, erro: erroFrota, recarregar: recarregarFrota } = useFrotaVeiculos()
  const [preventivas, setPreventivas] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [filtroServico, setFiltroServico] = useState('TODOS')
  const [abaAtiva, setAbaAtiva] = useState('frota') // 'frota' | 'campanhas' | 'garantias'

  // Modais
  const [modalFichaAberto, setModalFichaAberto] = useState(false)
  const [modalAtualizarKmAberto, setModalAtualizarKmAberto] = useState(false)
  const [saudeSelecionada, setSaudeSelecionada] = useState(null)
  const [veiculoParaAtualizar, setVeiculoParaAtualizar] = useState(null)

  const recarregarDados = useCallback(() => {
    const listaPrev = carregarManutencoesPreventivas()
    setPreventivas(listaPrev)
  }, [])

  useEffect(() => {
    recarregarDados()
    window.addEventListener('storage', recarregarDados)
    return () => window.removeEventListener('storage', recarregarDados)
  }, [recarregarDados])

  const veiculosAtivos = useMemo(() => {
    const estacionados = carregarVeiculosEstacionados()
    const placasEstacionadas = new Set(
      estacionados.map((e) => (e.placa || '').toUpperCase().trim()).filter(Boolean)
    )
    return frotaVeiculos.filter((v) => {
      const placa = (v.placa || '').toUpperCase().trim()
      return v.ativo !== false && !placasEstacionadas.has(placa)
    })
  }, [frotaVeiculos])

  // Avaliação da saúde de cada veículo ativo
  const veiculosAvaliados = useMemo(() => {
    return veiculosAtivos.map((v) => calcularSaudeVeiculo(v, preventivas))
  }, [veiculosAtivos, preventivas])

  // Métricas Consolidadas do Painel
  const metricas = useMemo(() => {
    const totalVeiculos = veiculosAvaliados.length
    const criticos = veiculosAvaliados.filter((v) => v.statusGeral === 'critico').length
    const atencao = veiculosAvaliados.filter((v) => v.statusGeral === 'atencao').length
    const garantias = veiculosAvaliados.filter((v) => v.temGarantiaPendente).length
    const emDia = veiculosAvaliados.filter((v) => v.statusGeral === 'em_dia').length
    const receitaPotencialGeral = veiculosAvaliados.reduce(
      (acc, curr) => acc + curr.receitaPotencialTotal,
      0
    )

    return {
      total: totalVeiculos,
      totalVeiculos,
      criticos,
      atencao,
      garantias,
      emDia,
      receitaPotencial: receitaPotencialGeral,
      receitaPotencialGeral,
    }
  }, [veiculosAvaliados])

  // Opções para filtro de serviços
  const opcoesServicos = useMemo(() => {
    return [
      { value: 'TODOS', label: 'Todos os Serviços e Sistemas' },
      ...ITENS_PREVENTIVOS_CATALOGO.map((item) => ({
        value: item.id,
        label: item.nome,
      })),
    ]
  }, [])

  // Filtragem dos Veículos (Desktop)
  const veiculosFiltrados = useMemo(() => {
    return veiculosAvaliados.filter((vSaude) => {
      const v = vSaude.veiculo
      const termo = busca.trim().toLowerCase()
      const matchBusca =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || v.modelo || '').toLowerCase().includes(termo) ||
        (v.clienteNome || '').toLowerCase().includes(termo) ||
        (v.clienteTelefone || '').includes(termo)

      if (!matchBusca) return false

      if (filtroStatus === 'CRITICO' && vSaude.statusGeral !== 'critico') return false
      if (filtroStatus === 'ATENCAO' && vSaude.statusGeral !== 'atencao') return false
      if (filtroStatus === 'GARANTIA' && !vSaude.temGarantiaPendente) return false
      if (filtroStatus === 'EM_DIA' && vSaude.statusGeral !== 'em_dia') return false

      if (filtroServico !== 'TODOS') {
        const itemEncontrado = vSaude.itensAvaliados.find(
          (i) => i.id === filtroServico && i.status !== 'em_dia'
        )
        if (!itemEncontrado) return false
      }

      return true
    })
  }, [veiculosAvaliados, busca, filtroStatus, filtroServico])

  // Filtragem dos Veículos (Mobile)
  const veiculosFiltradosMobile = useMemo(() => {
    return veiculosAvaliados.filter((vSaude) => {
      const v = vSaude.veiculo
      const termo = busca.trim().toLowerCase()
      const match =
        !termo ||
        (v.placa || '').toLowerCase().includes(termo) ||
        (v.marcaModelo || v.modelo || '').toLowerCase().includes(termo) ||
        (v.clienteNome || '').toLowerCase().includes(termo)

      if (abaAtiva === 'garantias') {
        return match && vSaude.temGarantiaPendente
      }
      return match
    })
  }, [veiculosAvaliados, busca, abaAtiva])

  // Abertura de OS com pré-seleção de cliente e veículo
  const handleGerarOrdemServico = useCallback(
    (veiculo, itensAlerta = []) => {
      let itens = itensAlerta
      if (!itens || itens.length === 0) {
        const vSaude = veiculosAvaliados.find(
          (va) => (va.placa || '').toUpperCase().trim() === (veiculo.placa || '').toUpperCase().trim()
        )
        if (vSaude) {
          const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
          const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')
          itens = [...vencidos, ...emAtencao]
          if (vSaude.temGarantiaPendente) {
            const itemGarantia = vSaude.itensAvaliados.find((i) => i.id === 'revisao_garantia')
            if (itemGarantia && !itens.some((it) => it.id === 'revisao_garantia')) {
              itens.push(itemGarantia)
            }
          }
        }
      }

      navigate(`${basePath}/ordem-de-servico`, {
        state: {
          clienteId: veiculo.clienteId,
          veiculoPlaca: veiculo.placa,
          veiculo: veiculo,
          itensPreventivosSugeridos: itens,
        },
      })
      toast.info(`Iniciando abertura de OS para ${veiculo.placa} com itens preventivos selecionados.`)
    },
    [basePath, navigate, veiculosAvaliados]
  )

  // Notificar cliente direto pelo WhatsApp
  const handleEnviarWhatsAppCliente = useCallback((vSaude) => {
    const foneLimpo = (vSaude.veiculo.clienteTelefone || '').replace(/\D/g, '')
    if (!foneLimpo) {
      toast.error('Cliente não possui telefone válido cadastrado.')
      return
    }

    const vencidos = vSaude.itensAvaliados.filter((i) => i.status === 'vencido')
    const emAtencao = vSaude.itensAvaliados.filter((i) => i.status === 'atencao')
    const garantia = vSaude.itensAvaliados.find(
      (i) => i.id === 'revisao_garantia' && (i.status === 'vencido' || i.status === 'atencao')
    )

    let lista = ''
    if (vencidos.length > 0) {
      lista += `\n*Revisões recomendadas vencidas:*\n`
      vencidos.forEach((v) => {
        lista += `• ${v.nome} (${v.motivoAlerta})\n`
      })
    }
    if (emAtencao.length > 0) {
      lista += `\n*Itens para acompanhamento próximo:*\n`
      emAtencao.forEach((a) => {
        lista += `• ${a.nome} (${a.motivoAlerta})\n`
      })
    }
    if (garantia) {
      lista += `\n*Atenção à Garantia:* Revisão periódica para manter garantia ativa até *${garantia.proximaRecomendadaData}*.\n`
    }

    const mensagem =
      `Olá, *${vSaude.veiculo.clienteNome}*! Tudo bem?\n\n` +
      `Aqui é da *Mecânica Gabriel*. No acompanhamento de saúde preventiva do seu *${
        vSaude.veiculo.marcaModelo || vSaude.veiculo.modelo
      }* (Placa: *${vSaude.veiculo.placa}*), identificamos os seguintes itens para revisão:` +
      `${lista}\n` +
      `Podemos agendar sua revisão esta semana? Temos serviço de leva e traz disponível para seu conforto!`

    const url = `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
    toast.success('Disparo de notificação aberto no WhatsApp!')
  }, [])

  const handleAbrirFicha = useCallback((vSaude) => {
    setSaudeSelecionada(vSaude)
    setModalFichaAberto(true)
  }, [])

  const handleAbrirAtualizarKm = useCallback((veiculo) => {
    setVeiculoParaAtualizar(veiculo)
    setModalAtualizarKmAberto(true)
  }, [])

  return {
    basePath,
    veiculosAtivos,
    preventivas,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    filtroServico,
    setFiltroServico,
    abaAtiva,
    setAbaAtiva,
    modalFichaAberto,
    setModalFichaAberto,
    modalAtualizarKmAberto,
    setModalAtualizarKmAberto,
    saudeSelecionada,
    setSaudeSelecionada,
    veiculoParaAtualizar,
    setVeiculoParaAtualizar,
    recarregarDados,
    veiculosAvaliados,
    metricas,
    opcoesServicos,
    veiculosFiltrados,
    veiculosFiltradosMobile,
    handleGerarOrdemServico,
    handleEnviarWhatsAppCliente,
    handleAbrirFicha,
    handleAbrirAtualizarKm,
    carregando: carregandoFrota,
    erro: erroFrota,
    recarregarFrota,
  }
}
