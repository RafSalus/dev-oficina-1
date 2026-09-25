import React, { useState, useEffect } from 'react'
import {
  X,
  WarningCircle,
  Car,
  SealCheck,
  Star,
  CheckCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export function ModalAcionamentoGarantia({
  garantia,
  todasGarantias = [],
  isOpen,
  onClose,
  onConfirmarAcionamento,
}) {
  const [garantiaId, setGarantiaId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [kmAtual, setKmAtual] = useState('')
  const [itemReclamado, setItemReclamado] = useState('')

  useEffect(() => {
    if (garantia) {
      setGarantiaId(garantia.id)
      setKmAtual(garantia.quilometragemExecucao ? String(garantia.quilometragemExecucao + 500) : '')
    } else if (todasGarantias.length > 0) {
      setGarantiaId(todasGarantias[0].id)
    }
  }, [garantia, todasGarantias])

  if (!isOpen) return null

  const garantiaSelecionada = garantia || todasGarantias.find((g) => g.id === garantiaId)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!garantiaSelecionada) {
      toast.error('Selecione uma garantia válida.')
      return
    }

    if (!motivo.trim()) {
      toast.error('Por favor, descreva o motivo do retorno ou defeito relatado.')
      return
    }

    const novoAcionamento = {
      id: `AC-${Date.now().toString().slice(-4)}`,
      dataAcionamento: new Date().toISOString().split('T')[0],
      motivoReclamacao: motivo,
      kmNoAcionamento: Number(kmAtual) || null,
      itemReclamado: itemReclamado || 'Geral / Diagnóstico Completo',
      statusAcionamento: 'EM_ANALISE',
      prioridadeFila: 'PRIORIDADE_1_GARANTIA',
      parecerTecnico: 'Aguardando vistoria técnica no box de atendimento.',
    }

    onConfirmarAcionamento(garantiaSelecionada.id, novoAcionamento)
    toast.success('Retorno de garantia registrado com Prioridade 1 no topo da fila!')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <WarningCircle size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">Acionar Retorno de Garantia</h3>
              <p className="text-[11px] text-rose-700">Triagem técnica e prioridade máxima na oficina</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Alerta de Prioridade 1 */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
            <Star size={18} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[11px] uppercase tracking-wider font-extrabold text-amber-950">
                Prioridade 1 — Topo da Fila
              </strong>
              <span className="text-[11px] text-amber-800">
                Clientes em garantia recebem atendimento imediato conforme as diretrizes operacionais de pós-venda.
              </span>
            </div>
          </div>

          {/* Seleção ou Exibição da Garantia */}
          {garantia ? (
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Garantia Vinculada
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-zinc-900">{garantia.id} ({garantia.numeroOS})</span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-zinc-200 rounded text-zinc-800">
                  {garantia.placa}
                </span>
              </div>
              <div className="text-zinc-600 text-[11px] mt-0.5">
                {garantia.clienteNome} • {garantia.veiculo}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-zinc-700 font-bold mb-1">
                Selecione a Garantia Ativa
              </label>
              <select
                value={garantiaId}
                onChange={(e) => setGarantiaId(e.target.value)}
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {todasGarantias
                  .filter((g) => g.status !== 'EXPIRADA')
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.id} - {g.placa} - {g.clienteNome} ({g.descricao})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* KM Atual do Veículo */}
          <div>
            <label className="block text-zinc-700 font-bold mb-1">
              Quilometragem Atual no Retorno
            </label>
            <input
              type="number"
              value={kmAtual}
              onChange={(e) => setKmAtual(e.target.value)}
              placeholder="Ex: 72400"
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Peça ou Serviço Específico Reclamado */}
          <div>
            <label className="block text-zinc-700 font-bold mb-1">
              Peça ou Serviço com Suspeita de Defeito
            </label>
            <input
              type="text"
              value={itemReclamado}
              onChange={(e) => setItemReclamado(e.target.value)}
              placeholder="Ex: Amortecedor dianteiro direito com ruído ao passar em lombada"
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Motivo Detalhado do Retorno */}
          <div>
            <label className="block text-zinc-700 font-bold mb-1">
              Relato Detalhado do Cliente <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o que o cliente relatou sobre o comportamento do veículo..."
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
              required
            />
          </div>

          {/* Ações */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle size={16} weight="bold" />
              <span>Confirmar Acionamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
