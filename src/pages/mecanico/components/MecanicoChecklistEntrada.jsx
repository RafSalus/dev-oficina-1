import { useState, useEffect } from 'react'
import { FloppyDisk } from '@phosphor-icons/react'
import { salvarOrdemAberta } from '../../dashboard/orcamento/mockOrdensAbertas'
import { ITENS_CHECKLIST_ENTRADA, checklistCompleto } from '../../../constants/checklistItems'
import { toast } from 'sonner'

export function MecanicoChecklistEntrada({ osAtiva, recarregarOrdens }) {
  // Mesmo shape usado em toda a vistoria de entrada do sistema (OsFormularioAbertura,
  // checklistCompleto, VistoriaEntradaClientePage): { status: 'conforme'|'nao_conforme'|'isento', obs }
  // — sem isso, o checklist preenchido aqui pelo mecânico nunca é reconhecido como completo
  // pelo gate de Diagnóstico (motivoImpedimentoDiagnostico).
  const [checklistLocal, setChecklistLocal] = useState(() => osAtiva?.checklistEntrada || {})

  useEffect(() => {
    setChecklistLocal(osAtiva?.checklistEntrada || {})
  }, [osAtiva?.numeroOS])

  const handleStatusItemChecklist = (itemId, status) => {
    setChecklistLocal((prev) => {
      const atual = prev[itemId] || { status: '', obs: '' }
      const novoStatus = atual.status === status ? '' : status
      return { ...prev, [itemId]: { ...atual, status: novoStatus } }
    })
  }

  const handleObsItemChecklist = (itemId, obs) => {
    setChecklistLocal((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || { status: '' }), obs } }))
  }

  const handleSalvarChecklist = () => {
    if (!osAtiva) return
    salvarOrdemAberta({
      ...osAtiva,
      checklistEntrada: checklistLocal,
    })
    recarregarOrdens()
    toast.success('Checklist veicular atualizado na Ordem de Serviço!')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-[#101828] flex items-center gap-2">
            Checklist de Entrada e Inspeção Visual - OS #{osAtiva?.numeroOS}
            {checklistCompleto(checklistLocal, ITENS_CHECKLIST_ENTRADA) ? (
              <span className="px-2 py-0.5 rounded-full bg-[#101828] text-white text-[9.5px] font-bold">Concluído</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89] text-[9.5px] font-bold">Pendente</span>
            )}
          </h3>
          <p className="text-xs text-[#667085]">
            Pode ser preenchido pela secretaria na abertura da OS ou por você aqui, a qualquer momento antes do Diagnóstico.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSalvarChecklist}
          className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <FloppyDisk size={16} weight="bold" />
          <span>Salvar Checklist na OS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {ITENS_CHECKLIST_ENTRADA.map((item) => {
          const itemState = checklistLocal[item.id] || { status: '', obs: '' }
          const isConforme = itemState.status === 'conforme'
          const isNaoConforme = itemState.status === 'nao_conforme'
          const isIsento = itemState.status === 'isento'
          return (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border transition-all ${
                isConforme
                  ? 'bg-[#f0f9ff]/60 border-[#bae6fd]'
                  : isNaoConforme
                  ? 'bg-rose-50/60 border-rose-200'
                  : isIsento
                  ? 'bg-[#f8fafc] border-[#e4e7ec]'
                  : 'bg-white border-[#e4e7ec] hover:border-[#d0d5dd]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="text-[11px] font-bold text-[#101828] truncate" title={item.desc}>
                  {item.label}
                </p>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStatusItemChecklist(item.id, 'conforme')}
                    className={`h-6 px-1.5 rounded text-[9.5px] font-bold cursor-pointer ${
                      isConforme ? 'bg-[#0284c7] text-white' : 'bg-white text-[#475467] border border-[#d0d5dd] hover:bg-[#f0f9ff]'
                    }`}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusItemChecklist(item.id, 'nao_conforme')}
                    className={`h-6 px-1.5 rounded text-[9.5px] font-bold cursor-pointer ${
                      isNaoConforme ? 'bg-rose-600 text-white' : 'bg-white text-[#475467] border border-[#d0d5dd] hover:bg-rose-50'
                    }`}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusItemChecklist(item.id, 'isento')}
                    className={`h-6 px-1 rounded text-[9.5px] font-bold cursor-pointer ${
                      isIsento ? 'bg-[#101828] text-white' : 'bg-white text-[#667085] border border-[#d0d5dd] hover:bg-[#f2f4f7]'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={itemState.obs || ''}
                onChange={(e) => handleObsItemChecklist(item.id, e.target.value)}
                placeholder="Observação (opcional)..."
                className="mt-1 w-full h-6 px-1.5 text-[10px] rounded border border-[#e4e7ec] bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7] font-medium text-[#344054]"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
