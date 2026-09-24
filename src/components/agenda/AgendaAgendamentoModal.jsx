import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import {
  CalendarBlank,
  Clock,
  User,
  Car,
  Wrench,
  WarningCircle,
  MapPin,
  Buildings,
  CheckCircle,
  Trash,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import { carregarClientesCadastrados } from '../../constants/mockClientesVeiculos'
import {
  HORARIOS_GRADE,
  DIAS_SEMANA_NOMES,
  OPCOES_LOGISTICA,
  verificarConflitoGrade,
} from '../../constants/agendaData'
import { useMecanicosAgenda } from '../../hooks/useMecanicosAgenda'

export function AgendaAgendamentoModal({
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

  // Mecânico (apenas nome)
  const [mecanicoId, setMecanicoId] = useState('')

  // Data e Horário
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

  // Carregar clientes cadastrados
  useEffect(() => {
    if (isOpen) {
      const clientes = carregarClientesCadastrados()
      setListaClientes(clientes)

      if (agendamentoParaEditar) {
        setClienteSelecionadoId(agendamentoParaEditar.clienteId || '')
        setClienteNome(agendamentoParaEditar.clienteNome || '')
        setClienteTelefone(agendamentoParaEditar.clienteTelefone || '')
        setClienteEndereco(agendamentoParaEditar.clienteEndereco || '')
        setVeiculoSelecionadoId(agendamentoParaEditar.veiculoId || '')
        setVeiculoModelo(agendamentoParaEditar.veiculoModelo || '')
        setVeiculoPlaca(agendamentoParaEditar.veiculoPlaca || '')
        setMecanicoId(agendamentoParaEditar.mecanicoId || mecanicosAgenda[0]?.id || '')
        setDiaChave(agendamentoParaEditar.diaChave || 'seg')
        setHorarioInicio(agendamentoParaEditar.horarioInicio || '08:00')
        setDuracaoHoras(Number(agendamentoParaEditar.duracaoHoras) || 1)
        setTipoLogistica(agendamentoParaEditar.tipoLogistica || 'CLIENTE_LEVA')
        setHorarioVeiculo(agendamentoParaEditar.horarioVeiculo || agendamentoParaEditar.horarioInicio || '08:00')
        setEnderecoColeta(agendamentoParaEditar.enderecoColeta || '')
        setServicoDescricao(agendamentoParaEditar.servicoDescricao || '')
        setObservacoes(agendamentoParaEditar.observacoes || '')
        setIgnorarConflito(false)
      } else {
        // Novo Agendamento
        setClienteSelecionadoId('')
        setClienteNome('')
        setClienteTelefone('')
        setClienteEndereco('')
        setVeiculoSelecionadoId('')
        setVeiculoModelo('')
        setVeiculoPlaca('')
        setMecanicoId(mecanicoPreSelecionado || mecanicosAgenda[0]?.id || '')
        setDiaChave(diaPreSelecionado || 'seg')
        setHorarioInicio(horarioPreSelecionado || '08:00')
        setDuracaoHoras(1)
        setTipoLogistica('CLIENTE_LEVA')
        setHorarioVeiculo(horarioPreSelecionado || '08:00')
        setEnderecoColeta('')
        setServicoDescricao('')
        setObservacoes('')
        setIgnorarConflito(false)
      }
    }
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

  // Ao selecionar um cliente
  const handleSelecionarCliente = (opt) => {
    if (!opt) {
      setClienteSelecionadoId('')
      setClienteNome('')
      setClienteTelefone('')
      setClienteEndereco('')
      setVeiculoSelecionadoId('')
      setVeiculoModelo('')
      setVeiculoPlaca('')
      return
    }

    const c = opt.clienteOriginal
    setClienteSelecionadoId(c.value || c.id)
    setClienteNome(c.nome || c.razaoSocial)
    setClienteTelefone(c.telefone || '')
    setClienteEndereco(c.endereco || '')
    setEnderecoColeta(c.endereco || '')

    // Se o cliente tem veículos, pré-seleciona o primeiro
    if (c.veiculos && c.veiculos.length > 0) {
      const v = c.veiculos[0]
      setVeiculoSelecionadoId(v.value || v.id || v.placa)
      setVeiculoModelo(v.marcaModelo || v.modelo || 'Veículo')
      setVeiculoPlaca(v.placa || '')
    } else {
      setVeiculoSelecionadoId('')
      setVeiculoModelo('')
      setVeiculoPlaca('')
    }
  }

  // Ao selecionar um veículo
  const handleSelecionarVeiculo = (opt) => {
    if (!opt) {
      setVeiculoSelecionadoId('')
      setVeiculoModelo('')
      setVeiculoPlaca('')
      return
    }
    const v = opt.veiculoOriginal
    setVeiculoSelecionadoId(v.value || v.id || v.placa)
    setVeiculoModelo(v.marcaModelo || v.modelo || 'Veículo')
    setVeiculoPlaca(v.placa || '')
  }

  // Opções de mecânicos (somente os nomes, sem box)
  const opcoesMecanicos = mecanicosAgenda.map((m) => ({
    value: m.id,
    label: m.nome,
  }))

  const opcoesDias = DIAS_SEMANA_NOMES.map((d) => ({
    value: d.chave,
    label: `${d.nome} (${d.abrev})`,
  }))

  const opcoesHorarios = HORARIOS_GRADE.map((h) => ({
    value: h,
    label: `${h}h`,
  }))

  const opcoesDuracao = [
    { value: 1, label: '1 hora' },
    { value: 2, label: '2 horas' },
    { value: 3, label: '3 horas' },
    { value: 4, label: '4 horas (meio período)' },
    { value: 8, label: '8 horas (dia todo)' },
  ]

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

  const handleSalvar = (e) => {
    e.preventDefault()

    if (!clienteNome.trim()) {
      toast.error('Selecione ou informe o nome do cliente')
      return
    }

    if (!veiculoModelo.trim()) {
      toast.error('Informe o modelo do veículo')
      return
    }

    if (!servicoDescricao.trim()) {
      toast.error('Informe o serviço solicitado ou motivo do agendamento')
      return
    }

    if (conflitoDetectado && !ignorarConflito) {
      toast.error(
        `Existe conflito de horário na grade deste mecânico com o cliente ${conflitoDetectado.clienteNome} às ${conflitoDetectado.horarioInicio}. Marque "Permitir sobreposição" para forçar.`
      )
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

  const handleExcluirAgendamento = () => {
    if (!agendamentoParaEditar || !onExcluir) return
    onExcluir(agendamentoParaEditar.id)
    toast.info('Agendamento excluído da grade.')
    onClose()
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo={agendamentoParaEditar ? 'Editar Agendamento de Atendimento' : 'Novo Agendamento de Atendimento'}
      larguraPadrao={840}
      alturaPadrao={680}
      larguraMinima={600}
      alturaMinima={480}
      larguraMaxima={1200}
      alturaMaxima={880}
      storageKey="modal_agenda_agendamento_cliente"
    >
      <div className="flex flex-col h-full bg-white text-slate-800">
        {/* Banner de Aviso de Conflito */}
        {conflitoDetectado && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 shrink-0 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <WarningCircle size={17} weight="bold" className="text-rose-600 shrink-0" />
              <span>
                <strong>Atenção:</strong> Horário já ocupado na grade deste mecânico por{' '}
                <strong>{conflitoDetectado.clienteNome}</strong> ({conflitoDetectado.horarioInicio} às{' '}
                {parseInt(conflitoDetectado.horarioInicio.split(':')[0], 10) + Number(conflitoDetectado.duracaoHoras || 1)}h).
              </span>
            </div>
            <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700 ml-2 shrink-0">
              <input
                type="checkbox"
                checked={ignorarConflito}
                onChange={(e) => setIgnorarConflito(e.target.checked)}
                className="rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7]"
              />
              <span>Permitir sobreposição</span>
            </label>
          </div>
        )}

        {/* Formulário Principal com rolagem oculta */}
        <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
          {/* Seção 1: Cliente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <User size={16} className="text-[#0284c7]" weight="bold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Seleção do Cliente
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Selecionar Cliente Cadastrado
                </label>
                <Select
                  options={opcoesClientes}
                  value={opcoesClientes.find((o) => o.value === clienteSelecionadoId) || null}
                  onChange={handleSelecionarCliente}
                  styles={customSelectStyles}
                  placeholder="Pesquise por nome do cliente ou telefone..."
                  isClearable
                  noOptionsMessage={() => 'Nenhum cliente cadastrado'}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  placeholder="(43) 99999-9999"
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>
            </div>

            {/* Campo nome do cliente se não for selecionado do dropdown */}
            {!clienteSelecionadoId && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ou digite o Nome do Cliente (se não for cadastrado) *
                </label>
                <input
                  type="text"
                  required
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>
            )}
          </div>

          {/* Seção 2: Veículo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Car size={16} className="text-[#0284c7]" weight="bold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Veículo do Cliente
              </h3>
            </div>

            {opcoesVeiculosCliente.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Selecionar Veículo do Cliente
                  </label>
                  <Select
                    options={opcoesVeiculosCliente}
                    value={opcoesVeiculosCliente.find((o) => o.value === veiculoSelecionadoId) || null}
                    onChange={handleSelecionarVeiculo}
                    styles={customSelectStyles}
                    placeholder="Selecione o veículo do cliente..."
                    isClearable
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      required
                      value={veiculoModelo}
                      onChange={(e) => setVeiculoModelo(e.target.value)}
                      placeholder="Ex: Fiat Palio 1.0"
                      className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Placa
                    </label>
                    <input
                      type="text"
                      value={veiculoPlaca}
                      onChange={(e) => setVeiculoPlaca(e.target.value)}
                      placeholder="Ex: ABC1D23"
                      className="w-full text-xs p-2 rounded border border-slate-300 uppercase focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Modelo do Veículo *
                  </label>
                  <input
                    type="text"
                    required
                    value={veiculoModelo}
                    onChange={(e) => setVeiculoModelo(e.target.value)}
                    placeholder="Ex: Chevrolet Onix 1.0 Flex"
                    className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Placa do Veículo
                  </label>
                  <input
                    type="text"
                    value={veiculoPlaca}
                    onChange={(e) => setVeiculoPlaca(e.target.value)}
                    placeholder="Ex: BRA2E19"
                    className="w-full text-xs p-2 rounded border border-slate-300 uppercase focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção 3: Mecânico e Horário na Grade */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Wrench size={16} className="text-[#0284c7]" weight="bold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Mecânico e Horário
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Mecânico: SOMENTE O NOME DO MECÂNICO */}
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mecânico *
                </label>
                <Select
                  options={opcoesMecanicos}
                  value={opcoesMecanicos.find((o) => o.value === mecanicoId)}
                  onChange={(opt) => setMecanicoId(opt.value)}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dia da Semana *
                </label>
                <Select
                  options={opcoesDias}
                  value={opcoesDias.find((o) => o.value === diaChave)}
                  onChange={(opt) => setDiaChave(opt.value)}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Horário de Início *
                </label>
                <Select
                  options={opcoesHorarios}
                  value={opcoesHorarios.find((o) => o.value === horarioInicio)}
                  onChange={(opt) => setHorarioInicio(opt.value)}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Duração Estimada
                </label>
                <Select
                  options={opcoesDuracao}
                  value={opcoesDuracao.find((o) => o.value === duracaoHoras)}
                  onChange={(opt) => setDuracaoHoras(opt.value)}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>
            </div>
          </div>

          {/* Seção 4: Logística do Veículo (Cliente leva ou Oficina busca) */}
          <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Car size={16} className="text-[#0284c7]" />
                4. Logística: Entrega e Coleta do Carro
              </span>
            </div>

            {/* Opções de Logística */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                  tipoLogistica === 'CLIENTE_LEVA'
                    ? 'border-[#0284c7] bg-white text-slate-900 shadow-xs ring-1 ring-[#0284c7]'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="tipoLogistica"
                  value="CLIENTE_LEVA"
                  checked={tipoLogistica === 'CLIENTE_LEVA'}
                  onChange={() => setTipoLogistica('CLIENTE_LEVA')}
                  className="mt-0.5 text-[#0284c7] focus:ring-[#0284c7]"
                />
                <div>
                  <span className="text-xs font-bold block">Cliente vai levar o carro na oficina</span>
                  <span className="text-[11px] text-slate-500">O cliente traz o veículo pessoalmente</span>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                  tipoLogistica === 'OFICINA_BUSCA'
                    ? 'border-[#0284c7] bg-white text-slate-900 shadow-xs ring-1 ring-[#0284c7]'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="tipoLogistica"
                  value="OFICINA_BUSCA"
                  checked={tipoLogistica === 'OFICINA_BUSCA'}
                  onChange={() => setTipoLogistica('OFICINA_BUSCA')}
                  className="mt-0.5 text-[#0284c7] focus:ring-[#0284c7]"
                />
                <div>
                  <span className="text-xs font-bold block">Oficina deve buscar o carro (Leva e Traz)</span>
                  <span className="text-[11px] text-slate-500">A oficina retira o veículo no endereço</span>
                </div>
              </label>
            </div>

            {/* Campos Específicos da Logística */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {tipoLogistica === 'CLIENTE_LEVA'
                    ? 'Horário previsto de entrega pelo cliente *'
                    : 'Horário em que a oficina deve buscar o carro *'}
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="time"
                    required
                    value={horarioVeiculo}
                    onChange={(e) => setHorarioVeiculo(e.target.value)}
                    className="w-full text-xs pl-8 pr-2 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              {tipoLogistica === 'OFICINA_BUSCA' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Endereço onde deve ser pego o carro *
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required={tipoLogistica === 'OFICINA_BUSCA'}
                      value={enderecoColeta}
                      onChange={(e) => setEnderecoColeta(e.target.value)}
                      placeholder="Rua, número, bairro e cidade..."
                      className="w-full text-xs pl-8 pr-2 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seção 5: Descrição do Serviço e Observações */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Serviço Solicitado / Motivo do Atendimento *
              </label>
              <textarea
                rows={2}
                required
                value={servicoDescricao}
                onChange={(e) => setServicoDescricao(e.target.value)}
                placeholder="Ex: Troca de pastilhas de freio dianteiras, revisão dos 40.000km, barulho na direção..."
                className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Observações Internas (Opcional)
              </label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Cliente tem pressa pois vai viajar no final de semana..."
                className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>
          </div>
        </form>

        {/* Rodapé do Modal */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 shrink-0 flex items-center justify-between">
          <div>
            {agendamentoParaEditar && onExcluir ? (
              <button
                type="button"
                onClick={handleExcluirAgendamento}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash size={15} />
                Excluir Agendamento
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {agendamentoParaEditar && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleSalvar}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0284c7] hover:bg-sky-600 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle size={16} weight="bold" />
              {agendamentoParaEditar ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
            </button>
          </div>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
