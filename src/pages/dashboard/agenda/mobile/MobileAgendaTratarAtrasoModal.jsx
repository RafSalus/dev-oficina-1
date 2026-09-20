import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { X, Clock, WarningCircle, Wrench, ArrowsClockwise, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  MECANICOS_AGENDA,
  DIAS_SEMANA_NOMES,
  HORARIOS_GRADE,
  verificarConflitoGrade,
} from '../../../../constants/agendaData'
import { mobileSelectStyles, labelBaseClass } from '../../nova-os/mobile/mobileSelectStyles'

const OPCOES_MOTIVO_ATRASO = [
  { value: 'dificuldade_tecnica', label: 'Dificuldade técnica na execução do serviço' },
  { value: 'servico_extra', label: 'Serviço complementar solicitado pelo cliente' },
  { value: 'atraso_entrega_carro', label: 'Cliente entregou o carro após o horário previsto' },
  { value: 'teste_rodagem', label: 'Necessidade de teste de rodagem estendido' },
  { value: 'outro', label: 'Outro motivo operacional' },
]

const OPCOES_EXTENSAO = [
  { value: 0.5, label: '+30 minutos adicionais' },
  { value: 1, label: '+1 hora adicional' },
  { value: 1.5, label: '+1 hora e 30 minutos adicionais' },
  { value: 2, label: '+2 horas adicionais' },
]

const ACOES = [
  { value: 'estender', label: 'Estender Tempo', descricao: 'Mais horas no dia', icon: Clock },
  { value: 'transferir', label: 'Transferir', descricao: 'Mudar mecânico', icon: Wrench },
  { value: 'reagendar', label: 'Reagendar', descricao: 'Novo dia / hora', icon: ArrowsClockwise },
  { value: 'concluir', label: 'Normalizar', descricao: 'Limpar atraso', icon: CheckCircle },
]

export function MobileAgendaTratarAtrasoModal({
  isOpen,
  onClose,
  agendamento,
  onSalvarAtraso,
  agendamentosExistentes = [],
}) {
  const [tipoAcao, setTipoAcao] = useState('estender')
  const [motivoAtraso, setMotivoAtraso] = useState(OPCOES_MOTIVO_ATRASO[0].value)
  const [tempoAdicional, setTempoAdicional] = useState(1)
  const [novoMecanicoId, setNovoMecanicoId] = useState('')
  const [novoDia, setNovoDia] = useState('seg')
  const [novoHorario, setNovoHorario] = useState('14:00')

  useEffect(() => {
    if (agendamento) {
      setNovoDia(agendamento.diaChave || 'seg')
      setNovoHorario(agendamento.horarioInicio || '08:00')
      setNovoMecanicoId(agendamento.mecanicoId || '')
      setTipoAcao('estender')
    }
  }, [agendamento])

  if (!isOpen || !agendamento) return null

  const opcoesMecanicos = MECANICOS_AGENDA.map((m) => ({ value: m.id, label: m.nome }))
  const opcoesDias = DIAS_SEMANA_NOMES.map((d) => ({ value: d.chave, label: `${d.nome} (${d.abrev})` }))
  const opcoesHorarios = HORARIOS_GRADE.map((h) => ({ value: h, label: `${h}h` }))

  const handleSalvar = () => {
    if (tipoAcao === 'concluir') {
      const atualizado = {
        ...agendamento,
        emAtraso: false,
        tempoAtrasoMinutos: 0,
        observacoes: `${agendamento.observacoes || ''}\n[Atraso resolvido: ${new Date().toLocaleTimeString('pt-BR')}]`.trim(),
      }
      onSalvarAtraso(atualizado)
      toast.success('Atraso resolvido e agendamento normalizado!')
      onClose()
      return
    }

    if (tipoAcao === 'estender') {
      const novaDuracao = Number(agendamento.duracaoHoras || 1) + Number(tempoAdicional)
      const atualizado = {
        ...agendamento,
        duracaoHoras: novaDuracao,
        emAtraso: true,
        tempoAtrasoMinutos: (agendamento.tempoAtrasoMinutos || 0) + tempoAdicional * 60,
        observacoes: `${agendamento.observacoes || ''}\n[Duração estendida em +${tempoAdicional * 60}m. Motivo: ${motivoAtraso}]`.trim(),
      }
      onSalvarAtraso(atualizado)
      toast.success(`Duração estendida em +${tempoAdicional * 60} minutos com sucesso!`)
      onClose()
      return
    }

    if (tipoAcao === 'transferir') {
      if (!novoMecanicoId) {
        toast.error('Selecione o novo mecânico')
        return
      }
      const mec = MECANICOS_AGENDA.find((m) => m.id === novoMecanicoId)
      const conflito = verificarConflitoGrade({
        mecanicoId: novoMecanicoId,
        diaChave: agendamento.diaChave,
        horarioInicio: agendamento.horarioInicio,
        duracaoHoras: agendamento.duracaoHoras || 1,
        idIgnorar: agendamento.id,
        agendamentos: agendamentosExistentes,
      })
      if (conflito) {
        toast.warning(`Atenção: O mecânico ${mec?.nome} já possui agendamento com ${conflito.clienteNome} neste mesmo horário!`)
      }
      const atualizado = {
        ...agendamento,
        mecanicoId: novoMecanicoId,
        mecanicoNome: mec?.nome || 'Mecânico',
        emAtraso: false,
        tempoAtrasoMinutos: 0,
        observacoes: `${agendamento.observacoes || ''}\n[Transferido para a grade de ${mec?.nome} em ${new Date().toLocaleTimeString('pt-BR')}]`.trim(),
      }
      onSalvarAtraso(atualizado)
      toast.success(`Agendamento transferido para a grade de ${mec?.nome}!`)
      onClose()
      return
    }

    if (tipoAcao === 'reagendar') {
      const conflito = verificarConflitoGrade({
        mecanicoId: agendamento.mecanicoId,
        diaChave: novoDia,
        horarioInicio: novoHorario,
        duracaoHoras: agendamento.duracaoHoras || 1,
        idIgnorar: agendamento.id,
        agendamentos: agendamentosExistentes,
      })
      if (conflito) {
        toast.warning(`Atenção: O horário ${novoHorario} no dia selecionado já possui atendimento para ${conflito.clienteNome}.`)
      }
      const atualizado = {
        ...agendamento,
        diaChave: novoDia,
        horarioInicio: novoHorario,
        emAtraso: false,
        tempoAtrasoMinutos: 0,
        observacoes: `${agendamento.observacoes || ''}\n[Reagendado para ${novoDia} às ${novoHorario}]`.trim(),
      }
      onSalvarAtraso(atualizado)
      toast.success(`Agendamento reagendado com sucesso para ${novoDia} às ${novoHorario}!`)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#eaecf0] flex flex-col">
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
          <span className="text-sm font-extrabold text-[#101828] truncate">Tratar Atraso</span>
          <div className="w-9 shrink-0" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
            <WarningCircle size={18} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-rose-900 truncate">
              {agendamento.clienteNome} • {agendamento.veiculoModelo}
            </p>
            <p className="text-[11px] text-rose-700 mt-0.5">
              {agendamento.mecanicoNome} • {agendamento.horarioInicio} • {agendamento.duracaoHoras}h
              {agendamento.tempoAtrasoMinutos > 0 && ` • Atraso: +${agendamento.tempoAtrasoMinutos} min`}
            </p>
          </div>
        </div>

        <div>
          <label className={labelBaseClass}>Selecione a conduta</label>
          <div className="grid grid-cols-2 gap-2">
            {ACOES.map((acao) => {
              const Icon = acao.icon
              const isAtiva = tipoAcao === acao.value
              return (
                <button
                  key={acao.value}
                  type="button"
                  onClick={() => setTipoAcao(acao.value)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                    isAtiva ? 'border-[#0284c7] bg-sky-50 shadow-xs' : 'border-[#d0d5dd] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={16} className={isAtiva ? 'text-[#0284c7]' : 'text-[#98a2b3]'} />
                    {isAtiva && <span className="w-2 h-2 rounded-full bg-[#0284c7]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">{acao.label}</div>
                    <div className="text-[10px] text-[#667085]">{acao.descricao}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className={labelBaseClass}>Motivo do Atraso</label>
          <Select
            options={OPCOES_MOTIVO_ATRASO}
            value={OPCOES_MOTIVO_ATRASO.find((o) => o.value === motivoAtraso)}
            onChange={(opt) => setMotivoAtraso(opt.value)}
            styles={mobileSelectStyles}
            isSearchable={false}
          />
        </div>

        {tipoAcao === 'estender' && (
          <div className="bg-white rounded-2xl border border-[#d0d5dd] p-4">
            <label className={labelBaseClass}>Tempo adicional necessário</label>
            <Select
              options={OPCOES_EXTENSAO}
              value={OPCOES_EXTENSAO.find((o) => o.value === tempoAdicional)}
              onChange={(opt) => setTempoAdicional(opt.value)}
              styles={mobileSelectStyles}
              isSearchable={false}
            />
          </div>
        )}

        {tipoAcao === 'transferir' && (
          <div className="bg-white rounded-2xl border border-[#d0d5dd] p-4">
            <label className={labelBaseClass}>Mecânico de Destino</label>
            <Select
              options={opcoesMecanicos}
              value={opcoesMecanicos.find((o) => o.value === novoMecanicoId)}
              onChange={(opt) => setNovoMecanicoId(opt.value)}
              styles={mobileSelectStyles}
            />
          </div>
        )}

        {tipoAcao === 'reagendar' && (
          <div className="bg-white rounded-2xl border border-[#d0d5dd] p-4 space-y-3">
            <div>
              <label className={labelBaseClass}>Novo Dia</label>
              <Select
                options={opcoesDias}
                value={opcoesDias.find((o) => o.value === novoDia)}
                onChange={(opt) => setNovoDia(opt.value)}
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelBaseClass}>Novo Horário</label>
              <Select
                options={opcoesHorarios}
                value={opcoesHorarios.find((o) => o.value === novoHorario)}
                onChange={(opt) => setNovoHorario(opt.value)}
                styles={mobileSelectStyles}
                isSearchable={false}
              />
            </div>
          </div>
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
          Salvar Alterações
        </button>
      </footer>
    </div>
  )
}
