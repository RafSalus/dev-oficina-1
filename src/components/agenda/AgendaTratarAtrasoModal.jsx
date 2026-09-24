import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import {
  Clock,
  WarningCircle,
  Wrench,
  User,
  Car,
  ArrowsClockwise,
  CheckCircle,
  PaperPlaneTilt,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { customSelectStyles } from '../suprimentos/customSelectStyles'
import {
  DIAS_SEMANA_NOMES,
  HORARIOS_GRADE,
  verificarConflitoGrade,
} from '../../constants/agendaData'
import { useMecanicosAgenda } from '../../hooks/useMecanicosAgenda'

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

export function AgendaTratarAtrasoModal({
  isOpen,
  onClose,
  agendamento,
  onSalvarAtraso,
  agendamentosExistentes = [],
}) {
  const mecanicosAgenda = useMecanicosAgenda()
  const [tipoAcao, setTipoAcao] = useState('estender') // 'estender' | 'transferir' | 'reagendar' | 'concluir'
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
    }
  }, [agendamento])

  if (!agendamento) return null

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

  const handleSalvar = (e) => {
    e.preventDefault()

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

      const mec = mecanicosAgenda.find((m) => m.id === novoMecanicoId)
      const conflito = verificarConflitoGrade({
        mecanicoId: novoMecanicoId,
        diaChave: agendamento.diaChave,
        horarioInicio: agendamento.horarioInicio,
        duracaoHoras: agendamento.duracaoHoras || 1,
        idIgnorar: agendamento.id,
        agendamentos: agendamentosExistentes,
      })

      if (conflito) {
        toast.warning(
          `Atenção: O mecânico ${mec?.nome} já possui agendamento com ${conflito.clienteNome} neste mesmo horário!`
        )
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
        toast.warning(
          `Atenção: O horário ${novoHorario} no dia selecionado já possui atendimento para ${conflito.clienteNome}.`
        )
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
      return
    }
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      titulo="Tratamento de Atraso no Atendimento"
      larguraPadrao={680}
      alturaPadrao={540}
      larguraMinima={520}
      alturaMinima={420}
      larguraMaxima={980}
      alturaMaxima={760}
      storageKey="modal_agenda_tratar_atraso"
    >
      <div className="flex flex-col h-full bg-white text-slate-800">
        {/* Banner do Agendamento Afetado */}
        <div className="bg-rose-50 border-b border-rose-200 p-4 shrink-0 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
              <WarningCircle size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-900">
                  {agendamento.clienteNome}
                </span>
                <span className="text-xs text-rose-700">
                  ({agendamento.veiculoModelo} • {agendamento.veiculoPlaca})
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-1">
                Mecânico: <strong>{agendamento.mecanicoNome}</strong> • Horário: {agendamento.horarioInicio} • Duração: {agendamento.duracaoHoras}h
                {agendamento.tempoAtrasoMinutos > 0 && ` • Atraso registrado: +${agendamento.tempoAtrasoMinutos} min`}
              </p>
            </div>
          </div>
        </div>

        {/* Corpo com Opções */}
        <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Selecione a conduta:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTipoAcao('estender')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-20 ${
                  tipoAcao === 'estender'
                    ? 'border-[#0284c7] bg-sky-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Clock size={16} className={tipoAcao === 'estender' ? 'text-[#0284c7]' : 'text-slate-400'} />
                  {tipoAcao === 'estender' && <span className="w-2 h-2 rounded-full bg-[#0284c7]" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Estender Tempo</div>
                  <div className="text-[10px] text-slate-500">Mais horas no dia</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipoAcao('transferir')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-20 ${
                  tipoAcao === 'transferir'
                    ? 'border-[#0284c7] bg-sky-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Wrench size={16} className={tipoAcao === 'transferir' ? 'text-[#0284c7]' : 'text-slate-400'} />
                  {tipoAcao === 'transferir' && <span className="w-2 h-2 rounded-full bg-[#0284c7]" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Transferir</div>
                  <div className="text-[10px] text-slate-500">Mudar mecânico</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipoAcao('reagendar')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-20 ${
                  tipoAcao === 'reagendar'
                    ? 'border-[#0284c7] bg-sky-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ArrowsClockwise size={16} className={tipoAcao === 'reagendar' ? 'text-[#0284c7]' : 'text-slate-400'} />
                  {tipoAcao === 'reagendar' && <span className="w-2 h-2 rounded-full bg-[#0284c7]" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Reagendar</div>
                  <div className="text-[10px] text-slate-500">Novo dia / hora</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipoAcao('concluir')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-20 ${
                  tipoAcao === 'concluir'
                    ? 'border-[#0284c7] bg-sky-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CheckCircle size={16} className={tipoAcao === 'concluir' ? 'text-[#0284c7]' : 'text-slate-400'} />
                  {tipoAcao === 'concluir' && <span className="w-2 h-2 rounded-full bg-[#0284c7]" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Normalizar</div>
                  <div className="text-[10px] text-slate-500">Limpar atraso</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Motivo do Atraso
            </label>
            <Select
              options={OPCOES_MOTIVO_ATRASO}
              value={OPCOES_MOTIVO_ATRASO.find((o) => o.value === motivoAtraso)}
              onChange={(opt) => setMotivoAtraso(opt.value)}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>

          {tipoAcao === 'estender' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Tempo adicional necessário:
              </label>
              <Select
                options={OPCOES_EXTENSAO}
                value={OPCOES_EXTENSAO.find((o) => o.value === tempoAdicional)}
                onChange={(opt) => setTempoAdicional(opt.value)}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>
          )}

          {tipoAcao === 'transferir' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Selecione o Mecânico de Destino:
              </label>
              <Select
                options={opcoesMecanicos}
                value={opcoesMecanicos.find((o) => o.value === novoMecanicoId)}
                onChange={(opt) => setNovoMecanicoId(opt.value)}
                styles={customSelectStyles}
              />
            </div>
          )}

          {tipoAcao === 'reagendar' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Novo Dia
                  </label>
                  <Select
                    options={opcoesDias}
                    value={opcoesDias.find((o) => o.value === novoDia)}
                    onChange={(opt) => setNovoDia(opt.value)}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Novo Horário
                  </label>
                  <Select
                    options={opcoesHorarios}
                    value={opcoesHorarios.find((o) => o.value === novoHorario)}
                    onChange={(opt) => setNovoHorario(opt.value)}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0284c7] hover:bg-sky-600 rounded-lg shadow-xs transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
