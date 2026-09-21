import React, { useState, useMemo } from 'react'
import {
  Clock,
  Car,
  User,
  Plus,
  WarningCircle,
  MapPin,
  CarProfile,
  Wrench,
  PaperPlaneTilt,
  ShieldCheck,
  CheckCircle,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  HORARIOS_GRADE,
  obterOcupacoesOSMecanico,
  recalcularCascataDeAtrasos,
} from '../../constants/agendaData'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'

export function AgendaGradeSemanal({
  mecanicoAtivo, // Mecânico selecionado
  semanaDias = [],
  agendamentos = [],
  fila = [],
  onNovoAgendamento,
  onEditarAgendamento,
  onTratarAtraso,
  onPreencherHorarioAutomatico, // Função para alocar direto o 1º da fila sem preencher nada
}) {
  // Modal de confirmação rápida para enviar horário ao 1º da fila
  const [modalConfirmacaoAlocacao, setModalConfirmacaoAlocacao] = useState(null)

  // Recálculo Dinâmico em Cascata: quando houver atraso, os agendamentos subsequentes
  // vão se empurrando dinamicamente ao longo das horas e até passando para o dia seguinte
  const agendamentosMecanico = useMemo(() => {
    if (!mecanicoAtivo) return []
    return recalcularCascataDeAtrasos(agendamentos, mecanicoAtivo.id).filter(
      (a) => a.mecanicoId === mecanicoAtivo.id
    )
  }, [agendamentos, mecanicoAtivo])

  // Ocupações de Ordens de Serviço (OS em andamento na oficina) deste mecânico
  const ocupacoesOS = useMemo(() => {
    return obterOcupacoesOSMecanico(mecanicoAtivo?.id)
  }, [mecanicoAtivo])

  const primeiroFila = fila && fila.length > 0 ? fila[0] : null

  // Processa a coluna de cada dia gerando os blocos com row-span exato (sem duplicação)
  const processarBlocosDia = (diaChave) => {
    const horasOcupadas = new Set()
    const blocos = []

    HORARIOS_GRADE.forEach((horario, index) => {
      const horaIndex = index // 0 a 9 (08:00 a 17:00)

      if (horasOcupadas.has(horaIndex)) {
        return // Já coberto pelo span de um card anterior
      }

      // 1. Verifica se há AGENDAMENTO começando nesta hora (já ajustado pela cascata se houve atraso)
      const ag = agendamentosMecanico.find(
        (a) => a.diaChave === diaChave && a.horarioInicio === horario
      )

      if (ag) {
        const duracao = Math.min(Number(ag.duracaoHoras || 1), 10 - horaIndex)
        for (let h = horaIndex; h < horaIndex + duracao; h++) {
          horasOcupadas.add(h)
        }
        blocos.push({
          tipo: 'agendamento',
          chave: `ag-${ag.id}-${diaChave}-${horario}`,
          dado: ag,
          startRow: horaIndex + 1,
          span: duracao,
          horario,
        })
        return
      }

      // 2. Verifica se há OCUPAÇÃO EM OS começando nesta hora
      const osOcupada = ocupacoesOS.find(
        (o) => o.diaChave === diaChave && o.horarioInicio === horario
      )

      if (osOcupada) {
        const duracao = Math.min(Number(osOcupada.duracaoHoras || 2), 10 - horaIndex)
        for (let h = horaIndex; h < horaIndex + duracao; h++) {
          horasOcupadas.add(h)
        }
        blocos.push({
          tipo: 'ocupado_os',
          chave: `os-${osOcupada.id}-${diaChave}-${horario}`,
          dado: osOcupada,
          startRow: horaIndex + 1,
          span: duracao,
          horario,
        })
        return
      }

      // 3. Slot Livre (1 hora de duração)
      horasOcupadas.add(horaIndex)
      blocos.push({
        tipo: 'livre',
        chave: `livre-${diaChave}-${horario}`,
        horario,
        diaChave,
        startRow: horaIndex + 1,
        span: 1,
        isAlmoco: horario === '12:00',
      })
    })

    return blocos
  }

  // Ação ao clicar no botão discreto de enviar horário ao 1º cliente da fila
  const handleSolicitarEnvioAoPrimeiroFila = (diaObj, horario) => {
    if (!primeiroFila) {
      toast.info('Não há clientes na fila de atendimento no momento.')
      return
    }

    setModalConfirmacaoAlocacao({
      diaObj,
      horario,
      cliente: primeiroFila,
    })
  }

  // Confirmação com 1 clique (sem precisar preencher nada!)
  const handleConfirmarAlocacaoAutomatica = () => {
    if (!modalConfirmacaoAlocacao) return
    const { diaObj, horario, cliente } = modalConfirmacaoAlocacao

    if (onPreencherHorarioAutomatico) {
      onPreencherHorarioAutomatico(diaObj.chave, horario, cliente)
    }

    setModalConfirmacaoAlocacao(null)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* 1. Cabeçalho das Colunas: Dias da Semana */}
      <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-100 border-b border-slate-200 shrink-0 text-slate-700">
        <div className="p-3 text-center border-r border-slate-200 flex flex-col justify-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Horário</span>
          <span className="text-[10px] text-slate-400">08h - 18h</span>
        </div>

        {semanaDias.map((dia) => {
          const totalAgDia = agendamentosMecanico.filter((ag) => ag.diaChave === dia.chave).length
          const totalOSDia = ocupacoesOS.filter((os) => os.diaChave === dia.chave).length

          return (
            <div
              key={dia.chave}
              className={`p-2.5 text-center border-r border-slate-200 last:border-r-0 transition-colors ${
                dia.isHoje ? 'bg-sky-50/80' : ''
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {dia.nome}
                </span>
                {dia.isHoje && (
                  <span className="bg-[#0284c7] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                    Hoje
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-0.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{dia.dataBr}</span>
                <span>•</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                  {totalAgDia + totalOSDia} no dia
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2. Área da Grade Semanal com CSS Grid de Linhas Ampliadas (115px) para Eliminar Truncamento */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-[80px_repeat(5,1fr)]">
          {/* Coluna Esquerda de Horários Fixos */}
          <div
            className="border-r border-slate-200 bg-slate-50/50 p-1"
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(10, 115px)',
              gap: '6px',
            }}
          >
            {HORARIOS_GRADE.map((horario) => {
              const isAlmoco = horario === '12:00'
              return (
                <div
                  key={horario}
                  className={`p-2 rounded-lg border border-transparent flex flex-col items-center justify-start pt-2 shrink-0 ${
                    isAlmoco ? 'bg-slate-100/70 border-slate-200' : ''
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1">
                    <Clock size={13} className="text-[#0284c7]" />
                    {horario}
                  </span>
                  {isAlmoco && (
                    <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase text-center leading-tight">
                      Almoço
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Colunas dos 5 Dias (Seg a Sex) */}
          {semanaDias.map((dia) => {
            const blocos = processarBlocosDia(dia.chave)

            return (
              <div
                key={dia.chave}
                className={`border-r border-slate-200 last:border-r-0 relative p-1 ${
                  dia.isHoje ? 'bg-sky-50/10' : ''
                }`}
                style={{
                  display: 'grid',
                  gridTemplateRows: 'repeat(10, 115px)',
                  gap: '6px',
                }}
              >
                {blocos.map((bloco) => {
                  // A. BLOCO DE AGENDAMENTO (Card avança no horário com row-span exato, sem duplicar)
                  if (bloco.tipo === 'agendamento') {
                    const ag = bloco.dado

                    return (
                      <div
                        key={bloco.chave}
                        onClick={() => onEditarAgendamento(ag)}
                        style={{
                          gridRow: `${bloco.startRow} / span ${bloco.span}`,
                        }}
                        className={`rounded-lg p-2.5 border transition-all cursor-pointer flex flex-col justify-between shadow-xs overflow-hidden h-full ${
                          ag.emAtraso
                            ? 'bg-rose-50/90 border-rose-300 hover:border-rose-400'
                            : ag.foiEmpurradoCascata
                            ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                            : 'bg-white border-slate-200 hover:border-[#0284c7] hover:shadow-sm'
                        }`}
                      >
                        <div className="overflow-hidden">
                          {/* Cabeçalho do Card */}
                          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100 gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-bold text-[#0284c7] flex items-center gap-1">
                                <Clock size={12} weight="bold" />
                                {ag.horarioInicio} • {ag.duracaoHoras}h
                                {bloco.span > 1 && ` (até ${parseInt(ag.horarioInicio.split(':')[0], 10) + bloco.span}:00)`}
                              </span>

                              {/* Indicador de Empurrado por Cascata Dinâmica */}
                              {ag.empurradoDeDia && (
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-0.5"
                                  title={`Transferido de ${ag.empurradoDeDia.toUpperCase()} devido a atrasos anteriores`}
                                >
                                  <ArrowsClockwise size={10} weight="bold" />
                                  <span>De {ag.empurradoDeDia.toUpperCase()}</span>
                                </span>
                              )}

                              {!ag.empurradoDeDia && ag.foiEmpurradoCascata && (
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5"
                                  title={`Horário empurrado dinamicamente (+${ag.empurradoMinutos || 60}m) devido a atraso anterior`}
                                >
                                  <ArrowsClockwise size={10} weight="bold" />
                                  <span>Ajustado (+{ag.empurradoMinutos || 60}m)</span>
                                </span>
                              )}
                            </div>

                            {ag.emAtraso && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onTratarAtraso && onTratarAtraso(ag)
                                }}
                                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 flex items-center gap-1 animate-pulse shrink-0"
                                title="Tratar atraso"
                              >
                                <WarningCircle size={10} weight="bold" />
                                Atraso (+{ag.tempoAtrasoMinutos || 30}m)
                              </button>
                            )}
                          </div>

                          {/* Nome do Cliente */}
                          <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                            {ag.clienteNome}
                          </h4>

                          {/* Veículo e Placa */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 mt-1">
                            <Car size={13} className="text-[#0284c7] shrink-0" />
                            <span className="truncate font-medium">{ag.veiculoModelo}</span>
                            {ag.veiculoPlaca && (
                              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                                {ag.veiculoPlaca}
                              </span>
                            )}
                          </div>

                          {/* Serviço Solicitado */}
                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {ag.servicoDescricao}
                          </p>
                        </div>

                        {/* Rodapé do Card */}
                        <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          {ag.tipoLogistica === 'OFICINA_BUSCA' ? (
                            <span
                              className="font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-white flex items-center gap-1 truncate"
                              title={`Buscar carro às ${ag.horarioVeiculo || ag.horarioInicio}`}
                            >
                              <MapPin size={10} />
                              Buscar ({ag.horarioVeiculo || ag.horarioInicio})
                            </span>
                          ) : (
                            <span
                              className="font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1 truncate"
                              title={`Cliente leva às ${ag.horarioVeiculo || ag.horarioInicio}`}
                            >
                              <CarProfile size={10} />
                              Cliente leva ({ag.horarioVeiculo || ag.horarioInicio})
                            </span>
                          )}

                          <span className="text-slate-400 group-hover:text-[#0284c7] font-medium">
                            Editar
                          </span>
                        </div>
                      </div>
                    )
                  }

                  // B. BLOCO DE OS EM ANDAMENTO (Mecânico ocupado em serviço na oficina)
                  if (bloco.tipo === 'ocupado_os') {
                    const os = bloco.dado
                    const horaFimNum = parseInt(os.horarioInicio.split(':')[0], 10) + bloco.span
                    const horaFimStr = `${String(horaFimNum).padStart(2, '0')}:00`

                    return (
                      <div
                        key={bloco.chave}
                        style={{
                          gridRow: `${bloco.startRow} / span ${bloco.span}`,
                        }}
                        className="rounded-lg p-2.5 bg-slate-100 border border-slate-300 flex flex-col justify-between shadow-2xs select-none overflow-hidden h-full"
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200">
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-white flex items-center gap-1">
                              <Wrench size={11} weight="bold" />
                              Ocupado • OS em Serviço
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 font-mono">
                              OS #{os.numeroOS}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-tight mt-1 truncate">
                            {os.veiculoModelo} ({os.veiculoPlaca})
                          </h4>

                          <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                            Cliente: {os.clienteNome}
                          </p>

                          <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-2 leading-relaxed">
                            "{os.servicoDescricao}"
                          </p>
                        </div>

                        <div className="mt-1 pt-1 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>{os.horarioInicio} às {horaFimStr} ({bloco.span}h)</span>
                          <span className="bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold">
                            Oficina
                          </span>
                        </div>
                      </div>
                    )
                  }

                  // C. BLOCO LIVRE: Se houver cliente na fila, mostra SOMENTE o Enviar ao 1º da fila
                  // Se a fila estiver vazia, mostra o Agendar
                  const diaObj = semanaDias.find((d) => d.chave === bloco.diaChave)

                  return (
                    <div
                      key={bloco.chave}
                      style={{
                        gridRow: `${bloco.startRow} / span 1`,
                      }}
                      className="rounded-lg border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between p-2 group/slot h-full overflow-hidden"
                    >
                      {/* Topo com o horário */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-400">
                          {bloco.horario}
                        </span>
                        {bloco.isAlmoco && (
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            Almoço
                          </span>
                        )}
                      </div>

                      {/* Conteúdo Central: SOMENTE o Enviar ao 1º da fila se houver fila; ou Agendar se não houver fila */}
                      {primeiroFila ? (
                        <div
                          onClick={() => handleSolicitarEnvioAoPrimeiroFila(diaObj, bloco.horario)}
                          className="my-auto py-1 px-1.5 rounded-lg border border-dashed border-slate-300 hover:border-[#0284c7] hover:bg-sky-50/50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group/fila"
                          title={`Enviar este horário para ${primeiroFila.clienteNome} (${primeiroFila.prioridade})`}
                        >
                          <div className="w-5 h-5 rounded-full bg-slate-100 group-hover/fila:bg-[#0284c7] text-slate-500 group-hover/fila:text-white flex items-center justify-center transition-colors">
                            <PaperPlaneTilt size={11} weight="bold" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 group-hover/fila:text-[#0284c7] transition-colors text-center leading-tight">
                            Enviar ao 1º da fila
                          </span>
                          <span className="text-[10px] text-slate-500 group-hover/fila:text-slate-700 truncate max-w-[130px] font-medium">
                            {primeiroFila.prioridade === 'GARANTIA' && '★ '}
                            {primeiroFila.clienteNome}
                          </span>
                        </div>
                      ) : (
                        <div
                          onClick={() => onNovoAgendamento(bloco.diaChave, bloco.horario)}
                          className="my-auto flex flex-col items-center justify-center gap-1 cursor-pointer py-1 group/agendar"
                        >
                          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover/agendar:bg-sky-100 text-slate-400 group-hover/agendar:text-[#0284c7] flex items-center justify-center transition-colors">
                            <Plus size={13} weight="bold" />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 group-hover/agendar:text-[#0284c7] transition-colors">
                            Agendar
                          </span>
                        </div>
                      )}

                      {/* Base discreta */}
                      <div className="h-1" />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Modal de Confirmação Rápida: Alocação Automática do 1º da Fila (Sem preencher nada!) */}
      {modalConfirmacaoAlocacao && (
        <ModalRedimensionavel
          isOpen={!!modalConfirmacaoAlocacao}
          onClose={() => setModalConfirmacaoAlocacao(null)}
          titulo="Confirmar Envio e Preenchimento Automático"
          larguraPadrao={540}
          alturaPadrao={420}
          larguraMinima={460}
          alturaMinima={360}
          larguraMaxima={800}
          alturaMaxima={600}
          storageKey="modal_confirmar_alocacao_fila"
        >
          <div className="flex flex-col h-full bg-white text-slate-800 p-5 justify-between">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-sky-50 border border-sky-200 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                  <PaperPlaneTilt size={20} weight="bold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-sky-950 uppercase">
                    Alocar 1º Cliente da Fila Automaticamente
                  </h4>
                  <p className="text-xs text-sky-800 mt-0.5">
                    O slot da grade será preenchido automaticamente com os dados do cliente, sem necessidade de digitação.
                  </p>
                </div>
              </div>

              {/* Detalhes do Cliente e Horário */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cliente (1º da Fila):</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {modalConfirmacaoAlocacao.cliente.prioridade === 'GARANTIA' && (
                      <ShieldCheck size={14} weight="bold" className="text-slate-900" />
                    )}
                    {modalConfirmacaoAlocacao.cliente.clienteNome}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Veículo / Placa:</span>
                  <span className="font-semibold text-slate-800">
                    {modalConfirmacaoAlocacao.cliente.veiculoModelo} ({modalConfirmacaoAlocacao.cliente.veiculoPlaca || 'Sem placa'})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mecânico:</span>
                  <span className="font-bold text-[#0284c7]">{mecanicoAtivo?.nome}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dia e Horário:</span>
                  <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {modalConfirmacaoAlocacao.diaObj?.nome}, às {modalConfirmacaoAlocacao.horario}h
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-200 text-slate-600 italic">
                  Motivo: "{modalConfirmacaoAlocacao.cliente.motivo}"
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setModalConfirmacaoAlocacao(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmarAlocacaoAutomatica}
                className="px-4 py-2 bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle size={16} weight="bold" />
                <span>Confirmar e Preencher Slot</span>
              </button>
            </div>
          </div>
        </ModalRedimensionavel>
      )}
    </div>
  )
}
