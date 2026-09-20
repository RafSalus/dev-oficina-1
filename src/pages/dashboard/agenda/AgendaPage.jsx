import React, { useState, useEffect, useMemo } from 'react'
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Plus,
  Users,
  Clock,
  Wrench,
  Car,
  MagnifyingGlass,
  CheckCircle,
  ShieldCheck,
  CalendarDots,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useIsMobile } from '../../../hooks/useIsMobile'
import {
  MECANICOS_AGENDA,
  obterDatasDaSemana,
  carregarAgendamentos,
  salvarAgendamentos,
  carregarFilaEspera,
  salvarFilaEspera,
  recalcularCascataDeAtrasos,
} from '../../../constants/agendaData'
import { AgendaGradeSemanal } from '../../../components/agenda/AgendaGradeSemanal'
import { AgendaAgendamentoModal } from '../../../components/agenda/AgendaAgendamentoModal'
import { AgendaTratarAtrasoModal } from '../../../components/agenda/AgendaTratarAtrasoModal'
import { AgendaFilaDedicada } from '../../../components/agenda/AgendaFilaDedicada'
import { MobileAgendaPage } from './mobile/MobileAgendaPage'

export default function AgendaPage() {
  const isMobile = useIsMobile()

  // Aba Ativa Principal: 'grade' (Agenda Semanal) | 'fila' (Fila de Atendimento Dedicada)
  const [abaAtivaPrincipal, setAbaAtivaPrincipal] = useState('grade')

  // Estado da Semana Ativa
  const [dataReferencia, setDataReferencia] = useState(new Date())
  const semanaDias = useMemo(() => obterDatasDaSemana(dataReferencia), [dataReferencia])

  // Mecânico Selecionado: Mostra SOMENTE a agenda deste mecânico
  const [mecanicoSelecionadoId, setMecanicoSelecionadoId] = useState(MECANICOS_AGENDA[0].id)

  // Dados Centrais
  const [agendamentos, setAgendamentos] = useState([])
  const [filaEspera, setFilaEspera] = useState([])
  const [termoBusca, setTermoBusca] = useState('')

  // Modais
  const [isModalAgendamentoAberto, setIsModalAgendamentoAberto] = useState(false)
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null)
  const [slotPreSelecionado, setSlotPreSelecionado] = useState({ dia: 'seg', horario: '08:00' })

  const [isModalAtrasoAberto, setIsModalAtrasoAberto] = useState(false)
  const [agendamentoAtrasadoAlvo, setAgendamentoAtrasadoAlvo] = useState(null)

  // Carregar dados e sincronizar com storage/eventos
  const recarregarDados = () => {
    setAgendamentos(carregarAgendamentos())
    setFilaEspera(carregarFilaEspera())
  }

  useEffect(() => {
    recarregarDados()

    const handleAgendaUpdate = () => recarregarDados()
    const handleFilaUpdate = () => setFilaEspera(carregarFilaEspera())

    window.addEventListener('dev_oficina_agenda_updated', handleAgendaUpdate)
    window.addEventListener('dev_oficina_fila_updated', handleFilaUpdate)
    window.addEventListener('storage', handleAgendaUpdate)

    return () => {
      window.removeEventListener('dev_oficina_agenda_updated', handleAgendaUpdate)
      window.removeEventListener('dev_oficina_fila_updated', handleFilaUpdate)
      window.removeEventListener('storage', handleAgendaUpdate)
    }
  }, [])

  // Mecânico Ativo Atual
  const mecanicoAtivo = useMemo(() => {
    return MECANICOS_AGENDA.find((m) => m.id === mecanicoSelecionadoId) || MECANICOS_AGENDA[0]
  }, [mecanicoSelecionadoId])

  // Navegação da Semana
  const irParaSemanaAnterior = () => {
    const nova = new Date(dataReferencia)
    nova.setDate(nova.getDate() - 7)
    setDataReferencia(nova)
  }

  const irParaProximaSemana = () => {
    const nova = new Date(dataReferencia)
    nova.setDate(nova.getDate() + 7)
    setDataReferencia(nova)
  }

  const irParaSemanaAtual = () => {
    setDataReferencia(new Date())
  }

  // Agendamentos filtrados por mecânico ativo e busca
  const agendamentosMecanico = useMemo(() => {
    let lista = agendamentos.filter((a) => a.mecanicoId === mecanicoAtivo.id)
    if (termoBusca.trim()) {
      const t = termoBusca.toLowerCase().trim()
      lista = lista.filter(
        (ag) =>
          ag.clienteNome?.toLowerCase().includes(t) ||
          ag.veiculoPlaca?.toLowerCase().includes(t) ||
          ag.veiculoModelo?.toLowerCase().includes(t) ||
          ag.servicoDescricao?.toLowerCase().includes(t)
      )
    }
    return lista
  }, [agendamentos, mecanicoAtivo.id, termoBusca])

  // Contadores
  const totalFila = filaEspera.length
  const totalGarantiasFila = filaEspera.filter((f) => f.prioridade === 'GARANTIA').length

  // Abertura de Modal de Agendamento Manual
  const handleAbrirNovoAgendamento = (diaChave = 'seg', horario = '08:00') => {
    setSlotPreSelecionado({ dia: diaChave, horario })
    setAgendamentoEmEdicao(null)
    setIsModalAgendamentoAberto(true)
  }

  const handleEditarAgendamento = (agendamento) => {
    setAgendamentoEmEdicao(agendamento)
    setSlotPreSelecionado({
      dia: agendamento.diaChave,
      horario: agendamento.horarioInicio,
    })
    setIsModalAgendamentoAberto(true)
  }

  const handleFecharModalAgendamento = () => {
    setIsModalAgendamentoAberto(false)
  }

  const handleSalvarAgendamento = (agendamentoSalvo) => {
    let novaLista = []
    const existe = agendamentos.some((a) => a.id === agendamentoSalvo.id)
    if (existe) {
      novaLista = agendamentos.map((a) => (a.id === agendamentoSalvo.id ? agendamentoSalvo : a))
    } else {
      novaLista = [agendamentoSalvo, ...agendamentos]
    }
    salvarAgendamentos(novaLista)
    setAgendamentos(novaLista)
    setIsModalAgendamentoAberto(false)
  }

  const handleExcluirAgendamento = (id) => {
    const novaLista = agendamentos.filter((a) => a.id !== id)
    salvarAgendamentos(novaLista)
    setAgendamentos(novaLista)
    setIsModalAgendamentoAberto(false)
  }

  const handleTratarAtraso = (agendamento) => {
    setAgendamentoAtrasadoAlvo(agendamento)
    setIsModalAtrasoAberto(true)
  }

  const handleSalvarAtrasoTratado = (agendamentoAtualizado) => {
    const novaLista = agendamentos.map((a) =>
      a.id === agendamentoAtualizado.id ? agendamentoAtualizado : a
    )
    // Aplica o empurrão dinâmico em cascata para os agendamentos subsequentes
    const listaCascata = recalcularCascataDeAtrasos(novaLista, agendamentoAtualizado.mecanicoId)
    salvarAgendamentos(listaCascata)
    setAgendamentos(listaCascata)
    setIsModalAtrasoAberto(false)
  }

  // Preenchimento Automático do Horário a partir do 1º Cliente da Fila (Sem preencher nada!)
  const handlePreencherHorarioAutomatico = (diaChave, horario, clienteFila) => {
    if (!clienteFila) return

    const novoAgendamento = {
      id: `ag-fila-${Date.now()}`,
      mecanicoId: mecanicoAtivo.id,
      mecanicoNome: mecanicoAtivo.nome,
      clienteNome: clienteFila.clienteNome,
      clienteTelefone: clienteFila.clienteTelefone,
      veiculoModelo: clienteFila.veiculoModelo,
      veiculoPlaca: clienteFila.veiculoPlaca,
      servicoDescricao: clienteFila.motivo || 'Atendimento agendado a partir da fila',
      diaChave,
      horarioInicio: horario,
      duracaoHoras: 1,
      tipoLogistica: 'CLIENTE_LEVA',
      horarioVeiculo: horario,
      enderecoColeta: '',
      observacoes: `[Alocado automaticamente do 1º da fila de atendimento (${clienteFila.prioridade})]`,
      emAtraso: false,
      tempoAtrasoMinutos: 0,
      criadoEm: new Date().toISOString(),
    }

    // 1. Adiciona na grade de agendamentos
    const novaListaAg = [novoAgendamento, ...agendamentos]
    salvarAgendamentos(novaListaAg)
    setAgendamentos(novaListaAg)

    // 2. Remove o cliente da fila de espera
    const novaFila = filaEspera.filter((f) => f.id !== clienteFila.id)
    salvarFilaEspera(novaFila)
    setFilaEspera(novaFila)

    toast.success(
      `Slot preenchido automaticamente! ${clienteFila.clienteNome} foi agendado(a) com ${mecanicoAtivo.nome} às ${horario}.`
    )
  }

  if (isMobile) {
    return (
      <MobileAgendaPage
        abaAtivaPrincipal={abaAtivaPrincipal}
        setAbaAtivaPrincipal={setAbaAtivaPrincipal}
        mecanicoAtivo={mecanicoAtivo}
        mecanicoSelecionadoId={mecanicoSelecionadoId}
        setMecanicoSelecionadoId={setMecanicoSelecionadoId}
        semanaDias={semanaDias}
        irParaSemanaAnterior={irParaSemanaAnterior}
        irParaProximaSemana={irParaProximaSemana}
        irParaSemanaAtual={irParaSemanaAtual}
        agendamentos={agendamentos}
        filaEspera={filaEspera}
        termoBusca={termoBusca}
        setTermoBusca={setTermoBusca}
        totalFila={totalFila}
        totalGarantiasFila={totalGarantiasFila}
        onNovoAgendamento={handleAbrirNovoAgendamento}
        onEditarAgendamento={handleEditarAgendamento}
        onPreencherHorarioAutomatico={handlePreencherHorarioAutomatico}
        onAtualizarFila={(novaFila) => {
          salvarFilaEspera(novaFila)
          setFilaEspera(novaFila)
        }}
        isModalAgendamentoAberto={isModalAgendamentoAberto}
        onFecharModalAgendamento={handleFecharModalAgendamento}
        onSalvarAgendamento={handleSalvarAgendamento}
        onExcluirAgendamento={handleExcluirAgendamento}
        agendamentoEmEdicao={agendamentoEmEdicao}
        slotPreSelecionado={slotPreSelecionado}
        isModalAtrasoAberto={isModalAtrasoAberto}
        onAbrirTratarAtraso={handleTratarAtraso}
        onFecharModalAtraso={() => {
          setIsModalAtrasoAberto(false)
          setAgendamentoAtrasadoAlvo(null)
        }}
        agendamentoAtrasadoAlvo={agendamentoAtrasadoAlvo}
        onSalvarAtrasoTratado={handleSalvarAtrasoTratado}
      />
    )
  }

  return (
    <div className="h-full flex flex-col gap-2.5 overflow-hidden text-slate-800 select-none">
      {/* 1. Barra Executiva Superior Compacta (Padrão do Sistema sem banner gigante) */}
      <header className="h-13 shrink-0 bg-white px-4 rounded-2xl border border-[#d0d5dd] shadow-xs flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Identificação e Alternância de Abas (Agenda vs Fila) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#0284c7] shrink-0">
            <CalendarBlank size={18} weight="duotone" />
          </div>

          <div className="flex items-center bg-[#f2f4f7] p-1 rounded-xl border border-[#e4e7ec] shrink-0">
            <button
              type="button"
              onClick={() => setAbaAtivaPrincipal('grade')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                abaAtivaPrincipal === 'grade'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <CalendarDots size={14} weight="bold" />
              <span>Agenda Semanal</span>
            </button>

            <button
              type="button"
              onClick={() => setAbaAtivaPrincipal('fila')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                abaAtivaPrincipal === 'fila'
                  ? 'bg-white text-[#101828] shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Users size={14} weight="bold" />
              <span>Fila de Atendimento</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  totalGarantiasFila > 0
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {totalFila}
                {totalGarantiasFila > 0 && ' (★)'}
              </span>
            </button>
          </div>
        </div>

        {/* Lado Direito: Botão Novo Agendamento no Padrão do Sistema */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAbrirNovoAgendamento('seg', '08:00')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={15} weight="bold" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </header>

      {/* 2. Conteúdo da Aba Selecionada */}
      {abaAtivaPrincipal === 'grade' ? (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden">
          {/* Seletor de Mecânicos: Mostra SOMENTE o mecânico selecionado */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 pt-2.5 shrink-0 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            {/* Abas com Nomes dos Mecânicos */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
                Mecânico:
              </span>
              {MECANICOS_AGENDA.map((mec) => {
                const isAtivo = mecanicoSelecionadoId === mec.id
                const totalMec = agendamentos.filter((a) => a.mecanicoId === mec.id).length
                const temAtraso = agendamentos.some((a) => a.mecanicoId === mec.id && a.emAtraso)

                return (
                  <button
                    key={mec.id}
                    type="button"
                    onClick={() => setMecanicoSelecionadoId(mec.id)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x cursor-pointer ${
                      isAtivo
                        ? 'bg-white border-slate-200 text-[#0284c7] border-b-transparent shadow-xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Wrench size={13} className={isAtivo ? 'text-[#0284c7]' : 'text-slate-400'} />
                    <span>{mec.nome}</span>
                    {temAtraso && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" title="Atraso na grade" />
                    )}
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isAtivo ? 'bg-sky-100 text-sky-900' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {totalMec}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Navegador Semanal e Campo de Busca */}
            <div className="flex items-center gap-2.5 pb-2">
              <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={irParaSemanaAnterior}
                  className="p-1 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                  title="Semana Anterior"
                >
                  <CaretLeft size={15} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={irParaSemanaAtual}
                  className="px-2 py-0.5 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  {semanaDias[0]?.dataBr} a {semanaDias[4]?.dataBr}
                </button>
                <button
                  type="button"
                  onClick={irParaProximaSemana}
                  className="p-1 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                  title="Próxima Semana"
                >
                  <CaretRight size={15} weight="bold" />
                </button>
              </div>

              <div className="relative w-40 sm:w-52">
                <MagnifyingGlass size={14} className="absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Filtrar cliente ou placa..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>
            </div>
          </div>

          {/* Grade Semanal do Mecânico Ativo */}
          <main className="flex-1 p-3 overflow-hidden flex flex-col min-h-0 bg-slate-50">
            <AgendaGradeSemanal
              mecanicoAtivo={mecanicoAtivo}
              semanaDias={semanaDias}
              agendamentos={agendamentosMecanico}
              fila={filaEspera}
              onNovoAgendamento={handleAbrirNovoAgendamento}
              onEditarAgendamento={handleEditarAgendamento}
              onTratarAtraso={handleTratarAtraso}
              onPreencherHorarioAutomatico={handlePreencherHorarioAutomatico}
            />
          </main>
        </div>
      ) : (
        /* Tela Dedicada da Fila de Atendimento */
        <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#d0d5dd] shadow-xs overflow-hidden flex flex-col">
          <AgendaFilaDedicada
            fila={filaEspera}
            onAtualizarFila={(novaFila) => {
              salvarFilaEspera(novaFila)
              setFilaEspera(novaFila)
            }}
          />
        </div>
      )}

      {/* 3. Modais Operacionais */}
      {isModalAgendamentoAberto && (
        <AgendaAgendamentoModal
          isOpen={isModalAgendamentoAberto}
          onClose={() => setIsModalAgendamentoAberto(false)}
          onSalvar={handleSalvarAgendamento}
          onExcluir={handleExcluirAgendamento}
          agendamentoParaEditar={agendamentoEmEdicao}
          diaPreSelecionado={slotPreSelecionado.dia}
          horarioPreSelecionado={slotPreSelecionado.horario}
          mecanicoPreSelecionado={mecanicoAtivo.id}
          agendamentosExistentes={agendamentos}
        />
      )}

      {isModalAtrasoAberto && agendamentoAtrasadoAlvo && (
        <AgendaTratarAtrasoModal
          isOpen={isModalAtrasoAberto}
          onClose={() => {
            setIsModalAtrasoAberto(false)
            setAgendamentoAtrasadoAlvo(null)
          }}
          agendamento={agendamentoAtrasadoAlvo}
          onSalvarAtraso={handleSalvarAtrasoTratado}
          agendamentosExistentes={agendamentos}
        />
      )}
    </div>
  )
}
