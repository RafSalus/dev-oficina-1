import React, { useState, useEffect } from 'react'
import { IMaskInput } from 'react-imask'
import {
  CheckCircle,
  Clock,
  Gauge,
  ArrowsLeftRight,
  ShieldCheck,
  FloppyDisk,
  Car,
  User,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../suprimentos/ModalRedimensionavel'
import { finalizarDeslocamento } from '../../constants/mockLevaETraz'

export function ModalFinalizarDeslocamento({
  isOpen,
  onClose,
  deslocamento,
  onFinalizado,
}) {
  const agora = new Date()
  const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const [horarioRetornoReal, setHorarioRetornoReal] = useState(horaAtual)
  const [kmFinal, setKmFinal] = useState('')
  const [kmRealizado, setKmRealizado] = useState('')
  const [tempoRealMinutos, setTempoRealMinutos] = useState('')
  const [observacoesRetorno, setObservacoesRetorno] = useState('')

  useEffect(() => {
    if (isOpen && deslocamento) {
      setHorarioRetornoReal(horaAtual)

      const kmIniNum = parseFloat(String(deslocamento.kmInicial || '0').replace(/\./g, '').replace(',', '.')) || 0
      const kmEstNum = parseFloat(String(deslocamento.kmEstimado || '0').replace(/\./g, '').replace(',', '.')) || 0

      if (kmIniNum > 0 && kmEstNum > 0) {
        const kmSugerido = Math.round(kmIniNum + kmEstNum)
        setKmFinal(String(kmSugerido))
        setKmRealizado(String(kmEstNum))
      } else {
        setKmFinal('')
        setKmRealizado(deslocamento.kmEstimado || '')
      }

      setTempoRealMinutos(String(deslocamento.tempoEstimadoMinutos || 40))
      setObservacoesRetorno('')
    }
  }, [isOpen, deslocamento])

  // Recalcula KM realizado quando o usuário altera o KM final
  const handleKmFinalChange = (valor) => {
    setKmFinal(valor)
    const kmIniNum = parseFloat(String(deslocamento?.kmInicial || '0').replace(/\./g, '').replace(',', '.')) || 0
    const kmFinNum = parseFloat(String(valor || '0').replace(/\./g, '').replace(',', '.')) || 0
    if (kmFinNum > kmIniNum) {
      setKmRealizado(String(Math.round(kmFinNum - kmIniNum)))
    }
  }

  const handleSalvar = () => {
    if (!horarioRetornoReal.trim()) {
      toast.error('Informe o horário de retorno.')
      return
    }

    try {
      finalizarDeslocamento(deslocamento.id, {
        horarioRetornoReal,
        kmFinal,
        kmRealizado: kmRealizado || deslocamento.kmEstimado || '',
        tempoRealMinutos: parseInt(tempoRealMinutos, 10) || deslocamento.tempoEstimadoMinutos || 45,
        observacoesRetorno,
      })

      toast.success(
        `Deslocamento #${deslocamento.codigo} concluído com sucesso! Veículo de apoio liberado.`
      )

      if (onFinalizado) {
        onFinalizado()
      }
      onClose()
    } catch (err) {
      toast.error('Erro ao finalizar deslocamento.')
    }
  }

  if (!isOpen || !deslocamento) return null

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="modal_redimensionavel_finalizar_deslocamento"
      larguraPadrao={720}
      alturaPadrao={560}
      larguraMinima={540}
      alturaMinima={420}
      larguraMaxima={1000}
      alturaMaxima={780}
      titulo="Concluir Missão e Registrar Retorno"
      subtitulo={`Atendimento ${deslocamento.codigo} - ${deslocamento.motoristaPrincipalNome || 'Motorista'}`}
      badge="Retorno de Rota"
      icone={CheckCircle}
      rodape={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-sky-600" />
            <span>O veículo de apoio voltará ao status de disponível para novos atendimentos</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle size={15} weight="bold" />
              <span>Confirmar Conclusão</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Bloco de Resumo da Missão */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded">
                {deslocamento.codigo}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {deslocamento.clienteNome || deslocamento.fornecedorNome || 'Destino de logística'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Saída às: <strong>{deslocamento.horarioSaidaReal || deslocamento.horarioSaidaPrevisto}</strong>
            </span>
          </div>

          <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70 text-[11px]">
            <div>
              Equipe: <strong className="text-slate-900">{deslocamento.motoristaPrincipalNome}</strong>
              {deslocamento.auxiliarNome && <span> e {deslocamento.auxiliarNome}</span>}
            </div>
            <div>
              Veículo de Apoio:{' '}
              <strong className="text-slate-900">{deslocamento.veiculoApoioNome || 'Não especificado'}</strong>
            </div>
            <div className="col-span-2">
              Destino: <span className="text-slate-800">{deslocamento.enderecoDestino || '—'}</span>
            </div>
          </div>
        </div>

        {/* Campos de Registro do Retorno */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Dados de Retorno da Oficina
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Horário de Retorno Real */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Horário Real de Retorno *
              </label>
              <IMaskInput
                mask="00:00"
                value={horarioRetornoReal}
                onAccept={(value) => setHorarioRetornoReal(value)}
                placeholder="15:30"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>

            {/* Tempo Real de Deslocamento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tempo Total de Deslocamento (Minutos)
              </label>
              <input
                type="number"
                min="5"
                max="360"
                value={tempoRealMinutos}
                onChange={(e) => setTempoRealMinutos(e.target.value)}
                placeholder="Ex: 40"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* KM Inicial */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">KM Inicial (Saída)</label>
              <input
                type="text"
                disabled
                value={deslocamento.kmInicial || '—'}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-500 bg-slate-50"
              />
            </div>

            {/* KM Final */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">KM Final (Retorno)</label>
              <input
                type="text"
                value={kmFinal}
                onChange={(e) => handleKmFinalChange(e.target.value)}
                placeholder="Ex: 89.432"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-sky-600"
              />
            </div>

            {/* KM Total Realizado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Distância Percorrida (KM)</label>
              <input
                type="text"
                value={kmRealizado}
                onChange={(e) => setKmRealizado(e.target.value)}
                placeholder="Ex: 12 km"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-sky-700 bg-sky-50 focus:outline-none focus:border-sky-600"
              />
            </div>
          </div>

          {/* Observações e Ocorrências */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observações e Ocorrências da Viagem
            </label>
            <textarea
              rows={2}
              value={observacoesRetorno}
              onChange={(e) => setObservacoesRetorno(e.target.value)}
              placeholder="Ex: Veículo entregue sem pendências, peças entregues ao mecânico na bancada..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-sky-600 resize-none"
            />
          </div>
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
