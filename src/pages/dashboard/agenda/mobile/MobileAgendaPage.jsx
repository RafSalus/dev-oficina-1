import React, { useState, useMemo } from 'react'
import {
  CalendarDots,
  Users,
  Plus,
  CaretLeft,
  CaretRight,
  Clock,
  Car,
  CarProfile,
  Wrench,
  MapPin,
  WarningCircle,
  ArrowsClockwise,
  MagnifyingGlass,
  ShieldCheck,
  Trash,
  PaperPlaneTilt,
  CheckCircle,
  ForkKnife,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  HORARIOS_GRADE,
  obterOcupacoesOSMecanico,
  recalcularCascataDeAtrasos,
  PRIORIDADE_FILA,
  MECANICOS_AGENDA,
  ordenarFilaPorPrioridadeEChegada,
} from '../../../../constants/agendaData'
import { MobileAgendaAgendamentoModal } from './MobileAgendaAgendamentoModal'
import { MobileAgendaTratarAtrasoModal } from './MobileAgendaTratarAtrasoModal'
import { MobileAgendaFilaFormModal } from './MobileAgendaFilaFormModal'

const FILTROS_PRIORIDADE = [
  { chave: 'TODOS', rotulo: 'Todos' },
  { chave: 'GARANTIA', rotulo: 'Garantias' },
  { chave: 'RETORNO', rotulo: 'Retornos' },
  { chave: 'URGENTE', rotulo: 'Urgentes' },
  { chave: 'NORMAL', rotulo: 'Chegada' },
]

function StatChip({ label, value, dark }) {
  return (
    <div
      className={`shrink-0 min-w-[100px] rounded-xl border p-2.5 ${
        dark ? 'bg-[#101828] border-[#101828]' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <p className={`text-[9.5px] font-bold uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-[#667085]'}`}>
        {label}
      </p>
      <p className={`text-sm font-extrabold mt-0.5 ${dark ? 'text-white' : 'text-[#101828]'}`}>{value}</p>
    </div>
  )
}

function AgendamentoCard({ agendamento, onClick }) {
  const ag = agendamento
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-3.5 shadow-sm active:bg-[#f8fafc] transition-colors ${
        ag.emAtraso
          ? 'bg-rose-50/80 border-rose-300'
          : ag.foiEmpurradoCascata
          ? 'bg-amber-50/60 border-amber-300'
          : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-bold text-[#0284c7] flex items-center gap-1">
          <Clock size={13} weight="bold" />
          {ag.horarioInicio} • {ag.duracaoHoras}h
        </span>

        {ag.emAtraso ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 flex items-center gap-1 shrink-0">
            <WarningCircle size={11} weight="bold" />
            Atraso (+{ag.tempoAtrasoMinutos || 30}m)
          </span>
        ) : ag.foiEmpurradoCascata ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
            <ArrowsClockwise size={11} weight="bold" />
            Ajustado
          </span>
        ) : null}
      </div>

      <p className="text-sm font-extrabold text-[#101828] truncate">{ag.clienteNome}</p>

      <div className="flex items-center gap-1.5 mt-1">
        <Car size={13} className="text-[#0284c7] shrink-0" />
        <span className="text-xs text-[#475467] truncate">{ag.veiculoModelo}</span>
        {ag.veiculoPlaca && (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054] shrink-0">
            {ag.veiculoPlaca}
          </span>
        )}
      </div>

      <p className="text-[11px] text-[#667085] mt-1.5 line-clamp-2 leading-relaxed">{ag.servicoDescricao}</p>

      <div className="mt-2 pt-2 border-t border-[#f2f4f7] flex items-center justify-between text-[10px]">
        {ag.tipoLogistica === 'OFICINA_BUSCA' ? (
          <span className="font-semibold px-1.5 py-0.5 rounded bg-[#101828] text-white flex items-center gap-1">
            <MapPin size={10} />
            Buscar ({ag.horarioVeiculo || ag.horarioInicio})
          </span>
        ) : (
          <span className="font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
            <CarProfile size={10} />
            Cliente leva ({ag.horarioVeiculo || ag.horarioInicio})
          </span>
        )}
        <span className="text-[#98a2b3] font-semibold">Toque para editar</span>
      </div>
    </button>
  )
}

function OcupacaoOsCard({ ocupacao }) {
  const os = ocupacao
  const horaFimNum = parseInt(os.horarioInicio.split(':')[0], 10) + Number(os.duracaoHoras || 2)
  const horaFimStr = `${String(horaFimNum).padStart(2, '0')}:00`

  return (
    <div className="w-full rounded-2xl border border-[#d0d5dd] bg-[#f2f4f7] p-3.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#101828] text-white flex items-center gap-1">
          <Wrench size={11} weight="bold" />
          Ocupado • OS em Serviço
        </span>
        <span className="text-[10px] font-bold text-[#475467] font-mono">OS #{os.numeroOS}</span>
      </div>
      <p className="text-sm font-bold text-[#101828] truncate">
        {os.veiculoModelo} ({os.veiculoPlaca})
      </p>
      <p className="text-xs text-[#667085] mt-0.5 truncate">Cliente: {os.clienteNome}</p>
      <p className="text-[11px] text-[#98a2b3] italic mt-1 line-clamp-2">"{os.servicoDescricao}"</p>
      <div className="mt-2 pt-2 border-t border-[#e4e7ec] text-[10px] text-[#667085] font-medium">
        {os.horarioInicio} às {horaFimStr}
      </div>
    </div>
  )
}

function TimelineRow({ horario, isLast, corDot, children }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center w-11 shrink-0 pt-1">
        <span className="text-[10.5px] font-extrabold text-[#344054] tabular-nums">{horario}</span>
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${corDot}`} />
        {!isLast && <span className="w-px flex-1 bg-[#e4e7ec] mt-1" />}
      </div>
      <div className="flex-1 min-w-0 pb-3">{children}</div>
    </div>
  )
}

function SlotLivre({ horario, isAlmoco, primeiroFila, confirmando, onIniciarEnvio, onConfirmarEnvio, onCancelarEnvio, onAgendar }) {
  if (isAlmoco) {
    return (
      <div className="rounded-xl border border-dashed border-[#e4e7ec] bg-[#f8fafc] px-3.5 py-2.5 flex items-center gap-2">
        <ForkKnife size={14} className="text-[#98a2b3]" />
        <span className="text-xs font-semibold text-[#98a2b3]">Horário de almoço</span>
      </div>
    )
  }

  if (confirmando && primeiroFila) {
    return (
      <div className="rounded-xl border border-[#0284c7] bg-sky-50 p-3">
        <p className="text-[11px] text-sky-900 font-semibold leading-relaxed">
          Enviar horário de {horario} para <strong>{primeiroFila.clienteNome}</strong> (1º da fila)?
        </p>
        <div className="flex items-center gap-2 mt-2.5">
          <button
            type="button"
            onClick={onCancelarEnvio}
            className="flex-1 h-9 rounded-lg border border-[#d0d5dd] bg-white text-[#344054] text-xs font-bold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmarEnvio}
            className="flex-1 h-9 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-1"
          >
            <CheckCircle size={14} weight="bold" />
            Confirmar
          </button>
        </div>
      </div>
    )
  }

  if (primeiroFila) {
    return (
      <button
        type="button"
        onClick={onIniciarEnvio}
        className="w-full rounded-xl border border-dashed border-[#bae6fd] bg-sky-50/60 active:bg-sky-50 px-3.5 py-2.5 flex items-center gap-2.5 text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-white border border-sky-200 text-[#0284c7] flex items-center justify-center shrink-0">
          <PaperPlaneTilt size={13} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#0284c7]">Horário livre • Enviar ao 1º da fila</p>
          <p className="text-[10.5px] text-[#0369a1] truncate">
            {primeiroFila.prioridade === 'GARANTIA' && '★ '}
            {primeiroFila.clienteNome}
          </p>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onAgendar}
      className="w-full rounded-xl border border-dashed border-[#d0d5dd] active:bg-[#f8fafc] px-3.5 py-2.5 flex items-center gap-2.5 text-left"
    >
      <div className="w-7 h-7 rounded-lg bg-[#f2f4f7] text-[#98a2b3] flex items-center justify-center shrink-0">
        <Plus size={14} weight="bold" />
      </div>
      <span className="text-xs font-bold text-[#667085]">Horário livre • Toque para agendar</span>
    </button>
  )
}

function FilaCard({ item, posicao, onRemover }) {
  const isGarantia = item.prioridade === 'GARANTIA'
  const pInfo = PRIORIDADE_FILA[item.prioridade] || PRIORIDADE_FILA.NORMAL
  const mecPref = MECANICOS_AGENDA.find((m) => m.id === item.mecanicoPreferencialId)

  return (
    <div
      className={`rounded-2xl border p-3.5 shadow-sm ${
        isGarantia ? 'bg-[#101828] border-[#101828] text-white' : 'bg-white border-[#d0d5dd]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-extrabold shrink-0 ${
              isGarantia ? 'bg-white text-[#101828]' : 'bg-[#f2f4f7] text-[#344054] border border-[#d0d5dd]'
            }`}
          >
            {posicao}º
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded truncate max-w-[150px] ${
              isGarantia ? 'bg-white/15 text-white' : pInfo.corBadge
            }`}
          >
            {isGarantia && <ShieldCheck size={12} weight="bold" />}
            {pInfo.rotulo.replace(/\s*\(Prioridade \d\)/, '')}
          </span>
        </div>
        <span className={`text-[10.5px] font-semibold flex items-center gap-1 shrink-0 ${isGarantia ? 'text-zinc-300' : 'text-[#667085]'}`}>
          <Clock size={12} />
          {item.horaChegada}
        </span>
      </div>

      <p className={`text-sm font-extrabold truncate ${isGarantia ? 'text-white' : 'text-[#101828]'}`}>
        {item.clienteNome}
      </p>
      {item.clienteTelefone && (
        <p className={`text-[11px] ${isGarantia ? 'text-zinc-300' : 'text-[#667085]'}`}>{item.clienteTelefone}</p>
      )}

      <div className="flex items-center gap-1.5 mt-1.5">
        <Car size={13} className={isGarantia ? 'text-zinc-300 shrink-0' : 'text-[#0284c7] shrink-0'} />
        <span className={`text-xs truncate ${isGarantia ? 'text-zinc-200' : 'text-[#475467]'}`}>{item.veiculoModelo}</span>
        {item.veiculoPlaca && (
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
              isGarantia ? 'bg-white/10 text-white' : 'bg-[#f2f4f7] border border-[#e4e7ec] text-[#344054]'
            }`}
          >
            {item.veiculoPlaca}
          </span>
        )}
      </div>

      <p className={`text-[11px] italic mt-1.5 line-clamp-2 leading-relaxed ${isGarantia ? 'text-zinc-300' : 'text-[#667085]'}`}>
        "{item.motivo}"
      </p>

      <p className={`text-[10.5px] mt-1.5 flex items-center gap-1 ${isGarantia ? 'text-zinc-400' : 'text-[#98a2b3]'}`}>
        <Wrench size={11} />
        {mecPref ? mecPref.nome : 'Qualquer mecânico disponível'}
      </p>

      <div className="mt-2.5 pt-2.5 border-t border-dashed" style={{ borderColor: isGarantia ? 'rgba(255,255,255,0.15)' : '#f2f4f7' }}>
        <button
          type="button"
          onClick={() => onRemover(item)}
          className={`w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
            isGarantia ? 'bg-white/10 text-white' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}
        >
          <Trash size={14} weight="bold" />
          Remover da Fila
        </button>
      </div>
    </div>
  )
}

export function MobileAgendaPage({
  abaAtivaPrincipal,
  setAbaAtivaPrincipal,
  mecanicoAtivo,
  mecanicoSelecionadoId,
  setMecanicoSelecionadoId,
  semanaDias,
  irParaSemanaAnterior,
  irParaProximaSemana,
  irParaSemanaAtual,
  agendamentos,
  filaEspera,
  termoBusca,
  setTermoBusca,
  totalFila,
  totalGarantiasFila,
  onNovoAgendamento,
  onEditarAgendamento,
  onPreencherHorarioAutomatico,
  onAtualizarFila,
  isModalAgendamentoAberto,
  onFecharModalAgendamento,
  onSalvarAgendamento,
  onExcluirAgendamento,
  agendamentoEmEdicao,
  slotPreSelecionado,
  isModalAtrasoAberto,
  onAbrirTratarAtraso,
  onFecharModalAtraso,
  agendamentoAtrasadoAlvo,
  onSalvarAtrasoTratado,
}) {
  const [diaSelecionadoChave, setDiaSelecionadoChave] = useState(() => {
    const hoje = semanaDias.find((d) => d.isHoje)
    return hoje ? hoje.chave : semanaDias[0]?.chave || 'seg'
  })
  const [buscaFila, setBuscaFila] = useState('')
  const [filtroPrioridadeFila, setFiltroPrioridadeFila] = useState('TODOS')
  const [isModalFilaAberto, setIsModalFilaAberto] = useState(false)
  const [slotEnvioConfirmando, setSlotEnvioConfirmando] = useState(null)

  const ocupacoesOS = useMemo(() => obterOcupacoesOSMecanico(mecanicoAtivo?.id), [mecanicoAtivo])

  // Agenda completa do mecânico ativo (ignora o filtro de busca) para que os horários
  // livres exibidos na linha do tempo reflitam a real disponibilidade do dia
  const agendamentosMecanicoCompleto = useMemo(() => {
    if (!mecanicoAtivo) return []
    return agendamentos.filter((a) => a.mecanicoId === mecanicoAtivo.id)
  }, [agendamentos, mecanicoAtivo])

  const agendamentosComCascata = useMemo(() => {
    if (!mecanicoAtivo) return []
    return recalcularCascataDeAtrasos(agendamentosMecanicoCompleto, mecanicoAtivo.id).filter(
      (a) => a.mecanicoId === mecanicoAtivo.id
    )
  }, [agendamentosMecanicoCompleto, mecanicoAtivo])

  const termoBuscaAtivo = termoBusca.trim().toLowerCase()
  const correspondeABusca = (ag) => {
    if (!termoBuscaAtivo) return true
    return (
      ag.clienteNome?.toLowerCase().includes(termoBuscaAtivo) ||
      ag.veiculoPlaca?.toLowerCase().includes(termoBuscaAtivo) ||
      ag.veiculoModelo?.toLowerCase().includes(termoBuscaAtivo) ||
      ag.servicoDescricao?.toLowerCase().includes(termoBuscaAtivo)
    )
  }

  const diaAtualObj = semanaDias.find((d) => d.chave === diaSelecionadoChave) || semanaDias[0]

  // Linha do tempo completa do dia: agendamentos, OS em andamento e horários livres disponíveis
  const blocosDoDia = useMemo(() => {
    const horasOcupadas = new Set()
    const blocos = []

    HORARIOS_GRADE.forEach((horario, index) => {
      if (horasOcupadas.has(index)) return

      const ag = agendamentosComCascata.find((a) => a.diaChave === diaSelecionadoChave && a.horarioInicio === horario)
      if (ag) {
        const duracao = Math.min(Number(ag.duracaoHoras || 1), HORARIOS_GRADE.length - index)
        for (let h = index; h < index + duracao; h++) horasOcupadas.add(h)
        blocos.push({ tipo: 'agendamento', dado: ag, horario })
        return
      }

      const os = ocupacoesOS.find((o) => o.diaChave === diaSelecionadoChave && o.horarioInicio === horario)
      if (os) {
        const duracao = Math.min(Number(os.duracaoHoras || 2), HORARIOS_GRADE.length - index)
        for (let h = index; h < index + duracao; h++) horasOcupadas.add(h)
        blocos.push({ tipo: 'ocupado_os', dado: os, horario })
        return
      }

      horasOcupadas.add(index)
      blocos.push({ tipo: 'livre', horario, isAlmoco: horario === '12:00' })
    })

    return blocos
  }, [agendamentosComCascata, ocupacoesOS, diaSelecionadoChave])

  const filaOrdenada = useMemo(() => ordenarFilaPorPrioridadeEChegada(filaEspera), [filaEspera])
  const primeiroFila = filaOrdenada.length > 0 ? filaOrdenada[0] : null

  const filaFiltrada = useMemo(() => {
    return filaOrdenada.filter((item) => {
      if (filtroPrioridadeFila !== 'TODOS' && item.prioridade !== filtroPrioridadeFila) return false
      if (!buscaFila.trim()) return true
      const termo = buscaFila.toLowerCase().trim()
      return (
        item.clienteNome?.toLowerCase().includes(termo) ||
        item.veiculoPlaca?.toLowerCase().includes(termo) ||
        item.veiculoModelo?.toLowerCase().includes(termo) ||
        item.motivo?.toLowerCase().includes(termo)
      )
    })
  }, [filaOrdenada, buscaFila, filtroPrioridadeFila])

  const metricasFila = useMemo(() => {
    const total = filaEspera.length
    const garantias = filaEspera.filter((f) => f.prioridade === 'GARANTIA').length
    const retornos = filaEspera.filter((f) => f.prioridade === 'RETORNO').length
    const urgentes = filaEspera.filter((f) => f.prioridade === 'URGENTE').length
    const normais = filaEspera.filter((f) => f.prioridade === 'NORMAL').length
    return { total, garantias, retornos, urgentes, normais }
  }, [filaEspera])

  const handleRemoverDaFila = (item) => {
    const novaFila = filaEspera.filter((f) => f.id !== item.id)
    onAtualizarFila(novaFila)
    toast.info(`${item.clienteNome} removido(a) da fila de atendimento.`)
  }

  const handleConfirmarEnvioSlot = (horario) => {
    if (!primeiroFila || !onPreencherHorarioAutomatico) return
    onPreencherHorarioAutomatico(diaSelecionadoChave, horario, primeiroFila)
    setSlotEnvioConfirmando(null)
  }

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Segmentado Agenda / Fila + Ação Rápida */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center bg-[#f2f4f7] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setAbaAtivaPrincipal('grade')}
            className={`flex-1 h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
              abaAtivaPrincipal === 'grade' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
            }`}
          >
            <CalendarDots size={14} weight={abaAtivaPrincipal === 'grade' ? 'fill' : 'bold'} className={abaAtivaPrincipal === 'grade' ? 'text-[#0284c7]' : ''} />
            Agenda
          </button>
          <button
            type="button"
            onClick={() => setAbaAtivaPrincipal('fila')}
            className={`flex-1 h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
              abaAtivaPrincipal === 'fila' ? 'bg-white text-[#101828] shadow-xs' : 'text-[#667085]'
            }`}
          >
            <Users size={14} weight={abaAtivaPrincipal === 'fila' ? 'fill' : 'bold'} className={abaAtivaPrincipal === 'fila' ? 'text-[#0284c7]' : ''} />
            Fila
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                totalGarantiasFila > 0 ? 'bg-[#0f172a] text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalFila}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={() =>
            abaAtivaPrincipal === 'grade'
              ? onNovoAgendamento(diaSelecionadoChave, '08:00')
              : setIsModalFilaAberto(true)
          }
          aria-label={abaAtivaPrincipal === 'grade' ? 'Novo Agendamento' : 'Inserir na Fila'}
          className="w-11 h-11 rounded-xl bg-black active:bg-zinc-800 text-white flex items-center justify-center shrink-0"
        >
          <Plus size={18} weight="bold" />
        </button>
      </div>

      {abaAtivaPrincipal === 'grade' ? (
        <>
          {/* Seletor de Mecânicos */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
            {MECANICOS_AGENDA.map((mec) => {
              const isAtivo = mecanicoSelecionadoId === mec.id
              const totalMec = agendamentos.filter((a) => a.mecanicoId === mec.id).length
              const temAtraso = agendamentos.some((a) => a.mecanicoId === mec.id && a.emAtraso)
              return (
                <button
                  key={mec.id}
                  type="button"
                  onClick={() => setMecanicoSelecionadoId(mec.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                    isAtivo
                      ? 'bg-[#101828] border-[#101828] text-white'
                      : 'bg-white border-[#d0d5dd] text-[#344054]'
                  }`}
                >
                  <Wrench size={13} className={isAtivo ? 'text-[#0284c7]' : 'text-[#98a2b3]'} />
                  <span>{mec.nome.split(' ')[0]}</span>
                  {temAtraso && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isAtivo ? 'bg-white/15 text-white' : 'bg-[#f2f4f7] text-[#667085]'
                    }`}
                  >
                    {totalMec}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Navegador de Semana */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#d0d5dd] shadow-2xs mb-2.5">
            <button
              type="button"
              onClick={irParaSemanaAnterior}
              className="p-2 text-[#475467] active:bg-[#f2f4f7] rounded-lg"
              aria-label="Semana anterior"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={irParaSemanaAtual}
              className="flex-1 py-1.5 text-xs font-bold text-[#101828] active:bg-[#f2f4f7] rounded-lg"
            >
              {semanaDias[0]?.dataBr} a {semanaDias[4]?.dataBr}
            </button>
            <button
              type="button"
              onClick={irParaProximaSemana}
              className="p-2 text-[#475467] active:bg-[#f2f4f7] rounded-lg"
              aria-label="Próxima semana"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>

          {/* Seletor de Dia da Semana */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-2.5 -mx-4 px-4">
            {semanaDias.map((dia) => {
              const isAtivo = diaSelecionadoChave === dia.chave
              const totalDia =
                agendamentosComCascata.filter((a) => a.diaChave === dia.chave).length +
                ocupacoesOS.filter((o) => o.diaChave === dia.chave).length
              return (
                <button
                  key={dia.chave}
                  type="button"
                  onClick={() => setDiaSelecionadoChave(dia.chave)}
                  className={`shrink-0 min-w-[64px] px-2 py-2 rounded-xl border flex flex-col items-center gap-0.5 transition-colors ${
                    isAtivo ? 'bg-[#0284c7] border-[#0284c7] text-white' : 'bg-white border-[#d0d5dd] text-[#344054]'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{dia.abrev}</span>
                  <span className="text-xs font-extrabold">{dia.dataBr.slice(0, 5)}</span>
                  {dia.isHoje && (
                    <span
                      className={`text-[8px] font-extrabold uppercase px-1 rounded ${
                        isAtivo ? 'bg-white/20 text-white' : 'bg-[#e0f2fe] text-[#0284c7]'
                      }`}
                    >
                      Hoje
                    </span>
                  )}
                  {totalDia > 0 && (
                    <span
                      className={`text-[9px] font-bold px-1 rounded-full ${
                        isAtivo ? 'bg-white/20 text-white' : 'bg-[#f2f4f7] text-[#667085]'
                      }`}
                    >
                      {totalDia}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Busca */}
          <div className="relative mb-3">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Filtrar cliente ou placa no dia..."
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#d0d5dd] bg-white text-sm font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:border-[#0284c7]"
            />
          </div>

          {/* Linha do Tempo do Dia: mostra ocupados, OS em andamento e horários livres */}
          <div className="bg-white rounded-2xl border border-[#d0d5dd] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#98a2b3] mb-2.5">
              {diaAtualObj?.nome} • Agenda de {mecanicoAtivo?.nome} • 08h às 18h
            </p>
            {blocosDoDia.map((bloco) => {
              if (bloco.tipo === 'agendamento') {
                const corDot = bloco.dado.emAtraso ? 'bg-rose-500' : 'bg-[#0284c7]'
                if (!correspondeABusca(bloco.dado)) {
                  return (
                    <TimelineRow key={bloco.dado.id} horario={bloco.horario} corDot="bg-[#d0d5dd]">
                      <div className="rounded-xl border border-dashed border-[#e4e7ec] bg-[#f8fafc] px-3.5 py-2.5">
                        <span className="text-xs font-semibold text-[#98a2b3]">
                          Ocupado • não corresponde à busca
                        </span>
                      </div>
                    </TimelineRow>
                  )
                }
                return (
                  <TimelineRow key={bloco.dado.id} horario={bloco.horario} corDot={corDot}>
                    <AgendamentoCard agendamento={bloco.dado} onClick={() => onEditarAgendamento(bloco.dado)} />
                  </TimelineRow>
                )
              }

              if (bloco.tipo === 'ocupado_os') {
                return (
                  <TimelineRow key={bloco.dado.id} horario={bloco.horario} corDot="bg-[#667085]">
                    <OcupacaoOsCard ocupacao={bloco.dado} />
                  </TimelineRow>
                )
              }

              return (
                <TimelineRow key={`livre-${bloco.horario}`} horario={bloco.horario} corDot="bg-[#d0d5dd]">
                  <SlotLivre
                    horario={bloco.horario}
                    isAlmoco={bloco.isAlmoco}
                    primeiroFila={primeiroFila}
                    confirmando={slotEnvioConfirmando === bloco.horario}
                    onIniciarEnvio={() => setSlotEnvioConfirmando(bloco.horario)}
                    onConfirmarEnvio={() => handleConfirmarEnvioSlot(bloco.horario)}
                    onCancelarEnvio={() => setSlotEnvioConfirmando(null)}
                    onAgendar={() => onNovoAgendamento(diaSelecionadoChave, bloco.horario)}
                  />
                </TimelineRow>
              )
            })}

            {/* Marco de Fim de Expediente às 18h */}
            <TimelineRow horario="18:00" isLast corDot="bg-[#d0d5dd]">
              <div className="px-1 py-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#98a2b3]">
                  Fim do expediente
                </span>
              </div>
            </TimelineRow>
          </div>
        </>
      ) : (
        <>
          {/* Métricas da Fila */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
            <StatChip label="Aguardando" value={metricasFila.total} dark />
            <StatChip label="Garantias" value={metricasFila.garantias} />
            <StatChip label="Retornos" value={metricasFila.retornos} />
            <StatChip label="Urgentes" value={metricasFila.urgentes} />
            <StatChip label="Chegada" value={metricasFila.normais} />
          </div>

          {/* Busca */}
          <div className="relative mb-2.5">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3] pointer-events-none" />
            <input
              type="text"
              value={buscaFila}
              onChange={(e) => setBuscaFila(e.target.value)}
              placeholder="Buscar cliente, placa ou motivo..."
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#d0d5dd] bg-white text-sm font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:border-[#0284c7]"
            />
          </div>

          {/* Filtros de Prioridade */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 -mx-4 px-4">
            {FILTROS_PRIORIDADE.map((f) => (
              <button
                key={f.chave}
                type="button"
                onClick={() => setFiltroPrioridadeFila(f.chave)}
                className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filtroPrioridadeFila === f.chave
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-white text-[#344054] border border-[#d0d5dd]'
                }`}
              >
                {f.rotulo}
              </button>
            ))}
          </div>

          {/* Lista da Fila */}
          {filaFiltrada.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-[#f2f4f7] border border-[#e4e7ec] flex items-center justify-center text-[#98a2b3] mb-3">
                <Users size={22} weight="duotone" />
              </div>
              <p className="text-sm font-bold text-[#101828]">Fila de atendimento vazia</p>
              <p className="text-xs text-[#667085] max-w-[260px] mt-1">
                Toque no botão "+" para inserir um cliente na fila de atendimento.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filaFiltrada.map((item, index) => (
                <FilaCard
                  key={item.id}
                  item={item}
                  posicao={index + 1}
                  onRemover={handleRemoverDaFila}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Novo/Editar Agendamento */}
      {isModalAgendamentoAberto && (
        <MobileAgendaAgendamentoModal
          isOpen={isModalAgendamentoAberto}
          onClose={onFecharModalAgendamento}
          onSalvar={onSalvarAgendamento}
          onExcluir={onExcluirAgendamento}
          agendamentoParaEditar={agendamentoEmEdicao}
          diaPreSelecionado={slotPreSelecionado.dia}
          horarioPreSelecionado={slotPreSelecionado.horario}
          mecanicoPreSelecionado={mecanicoAtivo?.id}
          agendamentosExistentes={agendamentos}
          onTratarAtraso={(ag) => {
            onFecharModalAgendamento()
            onAbrirTratarAtraso(ag)
          }}
        />
      )}

      {/* Modal de Tratamento de Atraso */}
      {isModalAtrasoAberto && agendamentoAtrasadoAlvo && (
        <MobileAgendaTratarAtrasoModal
          isOpen={isModalAtrasoAberto}
          onClose={onFecharModalAtraso}
          agendamento={agendamentoAtrasadoAlvo}
          onSalvarAtraso={onSalvarAtrasoTratado}
          agendamentosExistentes={agendamentos}
        />
      )}

      {/* Modal de Inserir Cliente na Fila */}
      {isModalFilaAberto && (
        <MobileAgendaFilaFormModal
          isOpen={isModalFilaAberto}
          onClose={() => setIsModalFilaAberto(false)}
          fila={filaEspera}
          onAtualizarFila={onAtualizarFila}
        />
      )}
    </div>
  )
}
