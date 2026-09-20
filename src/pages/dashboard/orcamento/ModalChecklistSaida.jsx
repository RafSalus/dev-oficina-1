import React, { useEffect, useState } from 'react'
import { ShieldCheck, Speedometer, CreditCard } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ModalRedimensionavel } from '../../../components/suprimentos/ModalRedimensionavel'
import { ITENS_CHECKLIST_SAIDA, checklistCompleto } from '../../../constants/checklistItems'

export function ModalChecklistSaida({ isOpen, onClose, os, onConfirmar }) {
  const [checklistSaida, setChecklistSaida] = useState({})
  const [checklistSaidaObs, setChecklistSaidaObs] = useState('')
  const [kmSaida, setKmSaida] = useState('')

  useEffect(() => {
    if (isOpen && os) {
      setChecklistSaida(os.checklistSaida || {})
      setChecklistSaidaObs(os.checklistSaidaObs || '')
      setKmSaida(os.kmSaida || '')
    }
  }, [isOpen, os])

  if (!isOpen || !os) return null

  const handleStatusItem = (itemId, status) => {
    setChecklistSaida((prev) => {
      const atual = prev[itemId] || { status: '', obs: '' }
      return { ...prev, [itemId]: { ...atual, status: atual.status === status ? '' : status } }
    })
  }

  const completo = checklistCompleto(checklistSaida, ITENS_CHECKLIST_SAIDA)
  const podeConfirmar = completo && kmSaida.trim().length > 0

  const handleConfirmar = () => {
    if (!podeConfirmar) {
      toast.warning('Marque todos os itens do checklist de saída e informe o KM de saída para continuar.')
      return
    }
    onConfirmar({ checklistSaida, checklistSaidaObs, kmSaida })
  }

  return (
    <ModalRedimensionavel
      isOpen={isOpen}
      onClose={onClose}
      chaveStorage="dev_oficina_modal_checklist_saida"
      larguraPadrao={560}
      alturaPadrao={620}
      larguraMinima={440}
      alturaMinima={480}
      titulo="Checklist de Saída Obrigatório"
      subtitulo={`OS #${os.numeroOS} • Confira antes de entregar o veículo`}
      badge="Liberação"
      icone={ShieldCheck}
      rodape={
        <div className="flex items-center justify-between w-full gap-3">
          <span className="text-[11px] font-semibold text-[#667085]">
            {ITENS_CHECKLIST_SAIDA.filter((i) => checklistSaida[i.id]?.status).length}/{ITENS_CHECKLIST_SAIDA.length} itens marcados
          </span>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!podeConfirmar}
            className="h-10 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-[#d0d5dd] disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <CreditCard size={16} weight="bold" />
            Confirmar e Ir para o PDV
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {ITENS_CHECKLIST_SAIDA.map((item) => {
          const state = checklistSaida[item.id] || { status: '', obs: '' }
          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3 transition-colors ${
                state.status === 'conforme'
                  ? 'bg-[#f0f9ff] border-[#bae6fd]'
                  : state.status === 'nao_conforme'
                  ? 'bg-[#fef3f2] border-[#fecdca]'
                  : state.status === 'isento'
                  ? 'bg-[#f8fafc] border-[#d0d5dd]'
                  : 'bg-white border-[#d0d5dd]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#101828] uppercase block">{item.label}</span>
                  {item.desc && <span className="text-[10px] text-[#667085]">{item.desc}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[
                    { valor: 'conforme', label: 'Conforme' },
                    { valor: 'nao_conforme', label: 'Não Conforme' },
                    { valor: 'isento', label: 'Isento' },
                  ].map((opt) => (
                    <button
                      key={opt.valor}
                      type="button"
                      onClick={() => handleStatusItem(item.id, opt.valor)}
                      className={`px-2 py-1 rounded-lg text-[9.5px] font-bold uppercase transition-all cursor-pointer border ${
                        state.status === opt.valor
                          ? opt.valor === 'nao_conforme'
                            ? 'bg-[#b42318] text-white border-[#b42318]'
                            : opt.valor === 'isento'
                            ? 'bg-[#344054] text-white border-[#344054]'
                            : 'bg-[#0284c7] text-white border-[#0284c7]'
                          : 'bg-white text-[#475467] border-[#d0d5dd] hover:bg-[#f8fafc]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        <div className="bg-white border border-[#d0d5dd] rounded-xl p-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1.5">
            Quilometragem de Saída (KM) <span className="text-[#b42318]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={kmSaida}
              onChange={(e) => setKmSaida(e.target.value)}
              placeholder="Ex: 64.280 km"
              className="w-full h-10 px-3 pr-9 rounded-xl border border-[#d0d5dd] focus:border-[#0284c7] text-sm font-bold text-[#101828] bg-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
            />
            <Speedometer size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
          </div>
          {os.km && <p className="text-[10px] text-[#667085] mt-1">KM de entrada: <span className="font-bold text-[#344054]">{os.km}</span></p>}
        </div>

        <div className="bg-white border border-[#d0d5dd] rounded-xl p-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#344054] mb-1.5">
            Observações da Liberação
          </label>
          <textarea
            value={checklistSaidaObs}
            onChange={(e) => setChecklistSaidaObs(e.target.value)}
            placeholder="Teste de rodagem, recomendações de retorno, peças velhas devolvidas ao cliente..."
            className="w-full h-20 p-2.5 rounded-xl border border-[#d0d5dd] focus:border-[#0284c7] text-xs text-[#101828] bg-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#0284c7] resize-none"
          />
        </div>
      </div>
    </ModalRedimensionavel>
  )
}
