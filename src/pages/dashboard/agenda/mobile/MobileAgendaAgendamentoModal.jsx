import React, { useState, useEffect, useMemo } from 'react'
import Select from 'react-select'
import { IMaskInput } from 'react-imask'
import {
  X,
  User,
  Car,
  Wrench,
  Clock,
  MapPin,
  WarningCircle,
  CheckCircle,
  Trash,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { carregarClientesCadastrados } from '../../../../constants/mockClientesVeiculos'
import {
  MECANICOS_AGENDA,
  HORARIOS_GRADE,
  DIAS_SEMANA_NOMES,
  verificarConflitoGrade,
} from '../../../../constants/agendaData'
import {
  mobileSelectStyles,
  inputBaseClass,
  textareaBaseClass,
  labelBaseClass,
} from '../../nova-os/mobile/mobileSelectStyles'

export function MobileAgendaAgendamentoModal({
  isOpen,
  onClose,
  onSalvar,
  onExcluir,
  agendamentoParaEditar = null,
  diaPreSelecionado = 'seg',
  horarioPreSelecionado = '08:00',
  mecanicoPreSelecionado = '',
  agendamentosExistentes = [],
  onTratarAtraso,
}) {
  const [listaClientes, setListaClientes] = useState([])

  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [clienteEndereco, setClienteEndereco] = useState('')

  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState('')
  const [veiculoModelo, setVeiculoModelo] = useState('')
  const [veiculoPlaca, setVeiculoPlaca] = useState('')

  const [mecanicoId, setMecanicoId] = useState('')
  const [diaChave, setDiaChave] = useState('seg')
  const [horarioInicio, setHorarioInicio] = useState('08:00')
  const [duracaoHoras, setDuracaoHoras] = useState(1)

  const [tipoLogistica, setTipoLogistica] = useState('CLIENTE_LEVA')
  const [horarioVeiculo, setHorarioVeiculo] = useState('08:00')
  const [enderecoColeta, setEnderecoColeta] = useState('')

  const [servicoDescricao, setServicoDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [ignorarConflito, setIgnorarConflito] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setListaClientes(carregarClientesCadastrados())
    setConfirmandoExclusao(false)

    if (agendamentoParaEditar) {
      setClienteSelecionadoId(agendamentoParaEditar.clienteId || '')
      setClienteNome(agendamentoParaEditar.clienteNome || '')
      setClienteTelefone(agendamentoParaEditar.clienteTelefone || '')
      setClienteEndereco(agendamentoParaEditar.clienteEndereco || '')
      setVeiculoSelecionadoId(agendamentoParaEditar.veiculoId || '')
      setVeiculoModelo(agendamentoParaEditar.veiculoModelo || '')
      setVeiculoPlaca(agendamentoParaEditar.veiculoPlaca || '')
      setMecanicoId(agendamentoParaEditar.mecanicoId || MECANICOS_AGENDA[0].id)
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
      setClienteSelecionadoId('')
      setClienteNome('')
      setClienteTelefone('')
      setClienteEndereco('')
      setVeiculoSelecionadoId('')
      setVeiculoModelo('')
      setVeiculoPlaca('')
      setMecanicoId(mecanicoPreSelecionado || MECANICOS_AGENDA[0].id)
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
  }, [isOpen, agendamentoParaEditar, diaPreSelecionado, horarioPreSelecionado, mecanicoPreSelecionado])

  const opcoesClientes = useMemo(() => {
    return listaClientes.map((c) => ({
      value: c.value || c.id,
      label: `${c.nome || c.razaoSocial} • ${c.telefone || 'Sem telefone'}`,
      clienteOriginal: c,
    }))
  }, [listaClientes])

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

  const opcoesMecanicos = MECANICOS_AGENDA.map((m) => ({ value: m.id, label: m.nome }))
  const opcoesDias = DIAS_SEMANA_NOMES.map((d) => ({ value: d.chave, label: `${d.nome} (${d.abrev})` }))
  const opcoesHorarios = HORARIOS_GRADE.map((h) => ({ value: h, label: `${h}h` }))
  const opcoesDuracao = [
    { value: 1, label: '1 hora' },
    { value: 2, label: '2 horas' },
    { value: 3, label: '3 horas' },
    { value: 4, label: '4 horas (meio período)' },
    { value: 8, label: '8 horas (dia todo)' },
  ]

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

  if (!isOpen) return null

  const handleSalvar = () => {
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

    const mec = MECANICOS_AGENDA.find((m) => m.id === mecanicoId) || MECANICOS_AGENDA[0]

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
    <div className="fixed inset-0 z-50 bg-[#eaecf0] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e4e7ec]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 px-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2.5 rounded-xl text-[#475467] active:bg-[#f2f4f7] transition-colors shrink-0"
          >
            <X size={20} weight="bold" />
          </button>
          <span className="text-sm font-extrabold text-[#101828] truncate">
            {agendamentoParaEditar ? 'Editar Agendamento' : 'Novo Agendamento'}
          </span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        {agendamentoParaEditar?.emAtraso && onTratarAtraso && (
          <button
            type="button"
            onClick={() => onTratarAtraso(agendamentoParaEditar)}
            className="w-full rounded-2xl border border-rose-300 bg-rose-50 p-3.5 flex items-center gap-3 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
              <WarningCircle size={18} weight="bold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-rose-900">
                Atendimento em atraso (+{agendamentoParaEditar.tempoAtrasoMinutos || 30} min)
              </p>
              <p className="text-[11px] text-rose-700">Toque para tratar o atraso</p>
            </div>
          </button>
        )}

        {conflitoDetectado && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3.5">
            <div className="flex items-start gap-2 text-xs text-rose-800">
              <WarningCircle size={16} weight="bold" className="text-rose-600 shrink-0 mt-0.5" />
              <span>
                Horário já ocupado na grade deste mecânico por <strong>{conflitoDetectado.clienteNome}</strong> ({conflitoDetectado.horarioInicio}
                h a{' '}
                {parseInt(conflitoDetectado.horarioInicio.split(':')[0], 10) + Number(conflitoDetectado.duracaoHoras || 1)}h).
              </span>
            </div>
            <label className="flex items-center gap-2 mt-2.5 text-xs font-bold text-rose-900">
              <input
                type="checkbox"
                checked={ignorarConflito}
                onChange={(e) => setIgnorarConflito(e.target.checked)}
                className="w-4 h-4 rounded border-rose-300 text-[#0284c7] focus:ring-[#0284c7]"
              />
              Permitir sobreposição de horário
            </label>
          </div>
        )}

        {/* 1. Cliente */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <User size={14} weight="bold" className="text-[#0284c7]" />
            Cliente
          </h3>
          <div>
            <label className={labelBaseClass}>Cliente Cadastrado</label>
            <Select
              options={opcoesClientes}
              value={opcoesClientes.find((o) => o.value === clienteSelecionadoId) || null}
              onChange={handleSelecionarCliente}
              styles={mobileSelectStyles}
              placeholder="Buscar por nome ou telefone..."
              isClearable
              noOptionsMessage={() => 'Nenhum cliente cadastrado'}
            />
          </div>
          <div>
            <label className={labelBaseClass}>Nome do Cliente *</label>
            <input
              type="text"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Ex: João da Silva"
              className={inputBaseClass}
            />
          </div>
          <div>
            <label className={labelBaseClass}>Telefone / WhatsApp</label>
            <IMaskInput
              mask="(00) 00000-0000"
              value={clienteTelefone}
              onAccept={(val) => setClienteTelefone(val)}
              placeholder="(00) 00000-0000"
              className={inputBaseClass}
            />
          </div>
        </section>

        {/* 2. Veículo */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Car size={14} weight="bold" className="text-[#0284c7]" />
            Veículo
          </h3>

          {opcoesVeiculosCliente.length > 0 && (
            <div>
              <label className={labelBaseClass}>Veículo do Cliente</label>
              <Select
                options={opcoesVeiculosCliente}
                value={opcoesVeiculosCliente.find((o) => o.value === veiculoSelecionadoId) || null}
                onChange={handleSelecionarVeiculo}
                styles={mobileSelectStyles}
                placeholder="Selecione o veículo..."
                isClearable
              />
            </div>
          )}

          <div>
            <label className={labelBaseClass}>Modelo do Veículo *</label>
            <input
              type="text"
              value={veiculoModelo}
              onChange={(e) => setVeiculoModelo(e.target.value)}
              placeholder="Ex: Chevrolet Onix 1.0 Flex"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label className={labelBaseClass}>Placa</label>
            <IMaskInput
              mask={[{ mask: 'aaa0a00' }, { mask: 'aaa-0000' }]}
              prepareChar={(str) => str.toUpperCase()}
              definitions={{ a: /[A-Za-z]/, 0: /[0-9]/ }}
              value={veiculoPlaca}
              onAccept={(val) => setVeiculoPlaca(val.toUpperCase())}
              placeholder="ABC1D23"
              className={`${inputBaseClass} font-mono uppercase`}
            />
          </div>
        </section>

        {/* 3. Mecânico e Horário */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Wrench size={14} weight="bold" className="text-[#0284c7]" />
            Mecânico e Horário
          </h3>

          <div>
            <label className={labelBaseClass}>Mecânico *</label>
            <Select
              options={opcoesMecanicos}
              value={opcoesMecanicos.find((o) => o.value === mecanicoId)}
              onChange={(opt) => setMecanicoId(opt.value)}
              styles={mobileSelectStyles}
              isSearchable={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelBaseClass}>Dia *</label>
              <Select
                options={opcoesDias}
                value={opcoesDias.find((o) => o.value === diaChave)}
                onChange={(opt) => setDiaChave(opt.value)}
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Horário *</label>
              <Select
                options={opcoesHorarios}
                value={opcoesHorarios.find((o) => o.value === horarioInicio)}
                onChange={(opt) => setHorarioInicio(opt.value)}
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <div>
            <label className={labelBaseClass}>Duração Estimada</label>
            <Select
              options={opcoesDuracao}
              value={opcoesDuracao.find((o) => o.value === duracaoHoras)}
              onChange={(opt) => setDuracaoHoras(opt.value)}
              styles={mobileSelectStyles}
              isSearchable={false}
            />
          </div>
        </section>

        {/* 4. Logística */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
            <Car size={14} weight="bold" className="text-[#0284c7]" />
            Logística: Entrega e Coleta
          </h3>

          <div className="space-y-2">
            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                tipoLogistica === 'CLIENTE_LEVA'
                  ? 'border-[#0284c7] bg-sky-50 ring-1 ring-[#0284c7]'
                  : 'border-[#d0d5dd] bg-white'
              }`}
            >
              <input
                type="radio"
                name="tipoLogisticaMobile"
                checked={tipoLogistica === 'CLIENTE_LEVA'}
                onChange={() => setTipoLogistica('CLIENTE_LEVA')}
                className="mt-0.5"
              />
              <div>
                <span className="text-xs font-bold block text-[#101828]">Cliente vai levar o carro</span>
                <span className="text-[11px] text-[#667085]">Traz o veículo pessoalmente</span>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                tipoLogistica === 'OFICINA_BUSCA'
                  ? 'border-[#0284c7] bg-sky-50 ring-1 ring-[#0284c7]'
                  : 'border-[#d0d5dd] bg-white'
              }`}
            >
              <input
                type="radio"
                name="tipoLogisticaMobile"
                checked={tipoLogistica === 'OFICINA_BUSCA'}
                onChange={() => setTipoLogistica('OFICINA_BUSCA')}
                className="mt-0.5"
              />
              <div>
                <span className="text-xs font-bold block text-[#101828]">Oficina deve buscar (Leva e Traz)</span>
                <span className="text-[11px] text-[#667085]">Retirada no endereço do cliente</span>
              </div>
            </label>
          </div>

          <div>
            <label className={labelBaseClass}>
              {tipoLogistica === 'CLIENTE_LEVA' ? 'Horário previsto de entrega *' : 'Horário para buscar o carro *'}
            </label>
            <div className="relative min-w-0 max-w-full">
              <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
              <input
                type="time"
                value={horarioVeiculo}
                onChange={(e) => setHorarioVeiculo(e.target.value)}
                className={`${inputBaseClass} pl-10 min-w-0 max-w-full block appearance-none`}
                style={{ WebkitAppearance: 'none' }}
              />
            </div>
          </div>

          {tipoLogistica === 'OFICINA_BUSCA' && (
            <div>
              <label className={labelBaseClass}>Endereço de Coleta *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#98a2b3]" />
                <textarea
                  rows={2}
                  value={enderecoColeta}
                  onChange={(e) => setEnderecoColeta(e.target.value)}
                  placeholder="Rua, número, bairro e cidade..."
                  className={`${textareaBaseClass} pl-10`}
                />
              </div>
            </div>
          )}
        </section>

        {/* 5. Serviço */}
        <section className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
          <div>
            <label className={labelBaseClass}>Serviço Solicitado / Motivo *</label>
            <textarea
              rows={3}
              value={servicoDescricao}
              onChange={(e) => setServicoDescricao(e.target.value)}
              placeholder="Ex: Troca de pastilhas de freio dianteiras, revisão dos 40.000km..."
              className={textareaBaseClass}
            />
          </div>
          <div>
            <label className={labelBaseClass}>Observações Internas</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Cliente tem pressa, vai viajar no fim de semana..."
              className={textareaBaseClass}
            />
          </div>
        </section>

        {agendamentoParaEditar && onExcluir && (
          <section className="pt-1">
            {confirmandoExclusao ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-center gap-2">
                <span className="flex-1 text-xs font-bold text-[#101828]">Excluir este agendamento?</span>
                <button
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                  className="h-9 px-3 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExcluirAgendamento}
                  className="h-9 px-3 rounded-lg bg-[#b42318] text-white text-xs font-bold"
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="w-full h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Trash size={15} weight="bold" />
                Excluir Agendamento
              </button>
            )}
          </section>
        )}
      </main>

      <footer
        className="shrink-0 bg-white border-t border-[#e4e7ec] px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={handleSalvar}
          className="w-full h-12 rounded-xl bg-[#0284c7] active:bg-sky-700 text-white text-sm font-bold flex items-center justify-center gap-2"
        >
          <CheckCircle size={18} weight="bold" />
          {agendamentoParaEditar ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
        </button>
      </footer>
    </div>
  )
}
