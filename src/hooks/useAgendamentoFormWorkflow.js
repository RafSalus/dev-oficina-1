import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { carregarClientesCadastrados } from '../constants/mockClientesVeiculos'
import { HORARIOS_GRADE, DIAS_SEMANA_NOMES, verificarConflitoGrade } from '../constants/agendaData'
import { useMecanicosAgenda } from './useMecanicosAgenda'

export const OPCOES_DURACAO = [
  { value: 1, label: '1 hora' },
  { value: 2, label: '2 horas' },
  { value: 3, label: '3 horas' },
  { value: 4, label: '4 horas (meio período)' },
  { value: 8, label: '8 horas (dia todo)' },
]

export const OPCOES_DIAS = DIAS_SEMANA_NOMES.map((d) => ({
  value: d.chave,
  label: `${d.nome} (${d.abrev})`,
}))

export const OPCOES_HORARIOS = HORARIOS_GRADE.map((h) => ({ value: h, label: `${h}h` }))

/**
 * Valida o formulário de agendamento. Retorna a mensagem de erro ou `null` se válido.
 */
export function validarAgendamento({ clienteNome, veiculoModelo, servicoDescricao, conflito, ignorarConflito }) {
  if (!clienteNome.trim()) return 'Selecione ou informe o nome do cliente'
  if (!veiculoModelo.trim()) return 'Informe o modelo do veículo'
  if (!servicoDescricao.trim()) return 'Informe o serviço solicitado ou motivo do agendamento'
  if (conflito && !ignorarConflito) {
    return `Existe conflito de horário na grade deste mecânico com o cliente ${conflito.clienteNome} às ${conflito.horarioInicio}. Marque "Permitir sobreposição" para forçar.`
  }
  return null
}

/**
 * Estado e regras do formulário de agendamento (novo/edição), compartilhado entre o
 * modal desktop e o modal mobile (ADR-003 / NFR18).
 */
export function useAgendamentoFormWorkflow({
  isOpen,
  onClose,
  onSalvar,
  onExcluir,
  agendamentoParaEditar = null,
  diaPreSelecionado = 'seg',
  horarioPreSelecionado = '08:00',
  mecanicoPreSelecionado = '',
  agendamentosExistentes = [],
}) {
  const mecanicosAgenda = useMecanicosAgenda()
  const [listaClientes, setListaClientes] = useState([])

  // Cliente selecionado
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [clienteEndereco, setClienteEndereco] = useState('')

  // Veículo selecionado
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState('')
  const [veiculoModelo, setVeiculoModelo] = useState('')
  const [veiculoPlaca, setVeiculoPlaca] = useState('')

  // Mecânico, data e horário
  const [mecanicoId, setMecanicoId] = useState('')
  const [diaChave, setDiaChave] = useState('seg')
  const [horarioInicio, setHorarioInicio] = useState('08:00')
  const [duracaoHoras, setDuracaoHoras] = useState(1)

  // Logística (Cliente leva ou Oficina busca)
  const [tipoLogistica, setTipoLogistica] = useState('CLIENTE_LEVA') // 'CLIENTE_LEVA' | 'OFICINA_BUSCA'
  const [horarioVeiculo, setHorarioVeiculo] = useState('08:00')
  const [enderecoColeta, setEnderecoColeta] = useState('')

  // Detalhes do Serviço
  const [servicoDescricao, setServicoDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [ignorarConflito, setIgnorarConflito] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  // Carregar clientes cadastrados e (re)inicializar o formulário ao abrir
  useEffect(() => {
    if (!isOpen) return
    setListaClientes(carregarClientesCadastrados())
    setConfirmandoExclusao(false)

    const ag = agendamentoParaEditar
    setClienteSelecionadoId(ag?.clienteId || '')
    setClienteNome(ag?.clienteNome || '')
    setClienteTelefone(ag?.clienteTelefone || '')
    setClienteEndereco(ag?.clienteEndereco || '')
    setVeiculoSelecionadoId(ag?.veiculoId || '')
    setVeiculoModelo(ag?.veiculoModelo || '')
    setVeiculoPlaca(ag?.veiculoPlaca || '')
    setEnderecoColeta(ag?.enderecoColeta || '')
    setServicoDescricao(ag?.servicoDescricao || '')
    setObservacoes(ag?.observacoes || '')
    setIgnorarConflito(false)

    if (ag) {
      setMecanicoId(ag.mecanicoId || mecanicosAgenda[0]?.id || '')
      setDiaChave(ag.diaChave || 'seg')
      setHorarioInicio(ag.horarioInicio || '08:00')
      setDuracaoHoras(Number(ag.duracaoHoras) || 1)
      setTipoLogistica(ag.tipoLogistica || 'CLIENTE_LEVA')
      setHorarioVeiculo(ag.horarioVeiculo || ag.horarioInicio || '08:00')
    } else {
      setMecanicoId(mecanicoPreSelecionado || mecanicosAgenda[0]?.id || '')
      setDiaChave(diaPreSelecionado || 'seg')
      setHorarioInicio(horarioPreSelecionado || '08:00')
      setDuracaoHoras(1)
      setTipoLogistica('CLIENTE_LEVA')
      setHorarioVeiculo(horarioPreSelecionado || '08:00')
    }
    // Reinicializa apenas na abertura ou troca do alvo; `mecanicosAgenda` fica de fora de
    // propósito para não apagar o que o usuário já digitou quando a lista de mecânicos chega.
  }, [isOpen, agendamentoParaEditar, diaPreSelecionado, horarioPreSelecionado, mecanicoPreSelecionado])

  // Opções para o select de clientes
  const opcoesClientes = useMemo(() => {
    return listaClientes.map((c) => ({
      value: c.value || c.id,
      label: `${c.nome || c.razaoSocial} • ${c.telefone || 'Sem telefone'}`,
      clienteOriginal: c,
    }))
  }, [listaClientes])

  // Veículos do cliente selecionado
  const clienteAtual = useMemo(() => {
    return listaClientes.find((c) => (c.value || c.id) === clienteSelecionadoId) || null
  }, [listaClientes, clienteSelecionadoId])

  const opcoesVeiculosCliente = useMemo(() => {
    if (!clienteAtual || !clienteAtual.veiculos) return []
    return clienteAtual.veiculos.map((v) => ({
      value: v.value || v.id || v.placa,
      label: `${v.marcaModelo || v.modelo} (${v.placa})`,
      veiculoOriginal: v,
    }))
  }, [clienteAtual])

  const aplicarVeiculo = (v) => {
    setVeiculoSelecionadoId(v ? v.value || v.id || v.placa : '')
    setVeiculoModelo(v ? v.marcaModelo || v.modelo || 'Veículo' : '')
    setVeiculoPlaca(v ? v.placa || '' : '')
  }

  // Ao selecionar um cliente
  const selecionarCliente = (opt) => {
    if (!opt) {
      setClienteSelecionadoId('')
      setClienteNome('')
      setClienteTelefone('')
      setClienteEndereco('')
      aplicarVeiculo(null)
      return
    }

    const c = opt.clienteOriginal
    setClienteSelecionadoId(c.value || c.id)
    setClienteNome(c.nome || c.razaoSocial)
    setClienteTelefone(c.telefone || '')
    setClienteEndereco(c.endereco || '')
    setEnderecoColeta(c.endereco || '')

    // Se o cliente tem veículos, pré-seleciona o primeiro
    aplicarVeiculo(c.veiculos && c.veiculos.length > 0 ? c.veiculos[0] : null)
  }

  // Ao selecionar um veículo
  const selecionarVeiculo = (opt) => aplicarVeiculo(opt ? opt.veiculoOriginal : null)

  // Opções de mecânicos (somente os nomes, sem box)
  const opcoesMecanicos = mecanicosAgenda.map((m) => ({ value: m.id, label: m.nome }))

  // Detecção de Conflito em tempo real
  const conflitoDetectado = useMemo(() => {
    if (!mecanicoId || !diaChave || !horarioInicio) return null
    return verificarConflitoGrade({
      mecanicoId,
      diaChave,
      horarioInicio,
      duracaoHoras,
      idIgnorar: agendamentoParaEditar?.id || null,
      agendamentos: agendamentosExistentes,
    })
  }, [mecanicoId, diaChave, horarioInicio, duracaoHoras, agendamentoParaEditar, agendamentosExistentes])

  const salvar = (e) => {
    e?.preventDefault?.()

    const erro = validarAgendamento({
      clienteNome,
      veiculoModelo,
      servicoDescricao,
      conflito: conflitoDetectado,
      ignorarConflito,
    })
    if (erro) {
      toast.error(erro)
      return
    }

    const mec = mecanicosAgenda.find((m) => m.id === mecanicoId) || mecanicosAgenda[0]
    if (!mec) {
      toast.error('Cadastre um mecânico ativo em Funcionários antes de agendar.')
      return
    }

    const agendamentoAtualizado = {
      id: agendamentoParaEditar?.id || `ag-${Date.now()}`,
      mecanicoId: mec.id,
      mecanicoNome: mec.nome,
      clienteId: clienteSelecionadoId || null,
      clienteNome: clienteNome.trim(),
      clienteTelefone: clienteTelefone.trim(),
      clienteEndereco: clienteEndereco.trim(),
      veiculoId: veiculoSelecionadoId || null,
      veiculoModelo: veiculoModelo.trim(),
      veiculoPlaca: (veiculoPlaca || '').toUpperCase().trim(),
      servicoDescricao: servicoDescricao.trim(),
      diaChave,
      horarioInicio,
      duracaoHoras: Number(duracaoHoras) || 1,
      tipoLogistica,
      horarioVeiculo: horarioVeiculo || horarioInicio,
      enderecoColeta: tipoLogistica === 'OFICINA_BUSCA' ? enderecoColeta.trim() : '',
      observacoes: observacoes.trim(),
      emAtraso: agendamentoParaEditar?.emAtraso || false,
      tempoAtrasoMinutos: agendamentoParaEditar?.tempoAtrasoMinutos || 0,
      criadoEm: agendamentoParaEditar?.criadoEm || new Date().toISOString(),
    }

    onSalvar(agendamentoAtualizado)
    toast.success(
      agendamentoParaEditar
        ? `Agendamento de ${clienteNome} atualizado com sucesso!`
        : `Atendimento para ${clienteNome} agendado com sucesso na grade de ${mec.nome}!`
    )
  }

  const excluir = () => {
    if (!agendamentoParaEditar || !onExcluir) return
    onExcluir(agendamentoParaEditar.id)
    toast.info('Agendamento excluído da grade.')
    onClose()
  }

  return {
    emEdicao: Boolean(agendamentoParaEditar),
    podeExcluir: Boolean(agendamentoParaEditar && onExcluir),
    clienteSelecionadoId,
    clienteNome,
    setClienteNome,
    clienteTelefone,
    setClienteTelefone,
    veiculoSelecionadoId,
    veiculoModelo,
    setVeiculoModelo,
    veiculoPlaca,
    setVeiculoPlaca,
    mecanicoId,
    setMecanicoId,
    diaChave,
    setDiaChave,
    horarioInicio,
    setHorarioInicio,
    duracaoHoras,
    setDuracaoHoras,
    tipoLogistica,
    setTipoLogistica,
    horarioVeiculo,
    setHorarioVeiculo,
    enderecoColeta,
    setEnderecoColeta,
    servicoDescricao,
    setServicoDescricao,
    observacoes,
    setObservacoes,
    ignorarConflito,
    setIgnorarConflito,
    confirmandoExclusao,
    setConfirmandoExclusao,
    opcoesClientes,
    opcoesVeiculosCliente,
    opcoesMecanicos,
    conflitoDetectado,
    selecionarCliente,
    selecionarVeiculo,
    salvar,
    excluir,
  }
}
