import React, { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Package, Handshake, ArrowSquareOut } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { KANBAN_COLUNAS_OS } from './kanbanColunas'
import { podeTransicionarPara } from './statusTransicao'

function formatMoeda(val) {
  const n = parseFloat(val) || 0
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Status "em espera de resposta externa" — o card ganha uma cor de destaque enquanto está aqui
// e volta ao branco normal assim que a resposta é aceita e o status muda.
const DESTAQUE_POR_STATUS = {
  aguardando_pecas: 'bg-amber-50 border-amber-200 hover:border-amber-300',
  terceirizado: 'bg-violet-50 border-violet-200 hover:border-violet-300',
  aguardando_aprovacao: 'bg-[#e0f2fe] border-[#bae6fd] hover:border-[#7dd3fc]',
}

// Atalho de edição rápida por status: leva direto para a aba certa do wizard, sem passar
// pelas outras etapas. Peças ficam em "Cotação", terceiros em "Terceirizado".
const ATALHO_POR_STATUS = {
  aguardando_pecas: { aba: 'pecas', label: 'Abrir Peças e Cotação', icone: Package },
  terceirizado: { aba: 'terceiros', label: 'Abrir Terceiros e Cotação', icone: Handshake },
}

function KanbanCard({ os, isSelected, onSelecionar, onAbrirEdicaoRapida, arrastavel = true }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(os.numeroOS),
    data: { os },
    disabled: !arrastavel,
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }
    : undefined

  const corDestaque = DESTAQUE_POR_STATUS[os.status] || 'bg-white border-[#e4e7ec]'
  const atalho = ATALHO_POR_STATUS[os.status]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelecionar(os)}
      className={`border rounded-xl p-3 cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-sm transition-all space-y-1.5 select-none ${corDestaque} ${
        isSelected ? 'ring-1 ring-[#0284c7] border-[#0284c7]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-black text-xs text-[#101828]">#{os.numeroOS}</span>
        {os.prioridade === 'urgente' && (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
            Urgente
          </span>
        )}
        {os.prioridade === 'retorno' && (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
            Retorno
          </span>
        )}
      </div>

      <p className="text-xs font-bold text-[#101828] truncate">{os.cliente}</p>

      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-mono font-black text-[9px] px-1.5 py-0.5 rounded bg-[#101828] text-white tracking-wider shrink-0">
          {os.placa || 'PLACA'}
        </span>
        <span className="text-[10.5px] text-[#667085] truncate">{os.marcaModelo}</span>
      </div>

      <p className="text-[10px] text-[#98a2b3] truncate">Téc: {os.mecanicoNome || 'Não atribuído'}</p>

      <div className="flex items-center justify-between pt-1.5 border-t border-black/5">
        <span className="text-[9px] text-[#98a2b3] font-semibold">
          {os.pecasOS?.length || 0} pç • {os.servicosOS?.length || 0} srv
        </span>
        <span className="text-xs font-black text-[#0284c7]">R$ {formatMoeda(os.valorTotal)}</span>
      </div>

      {atalho && onAbrirEdicaoRapida && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAbrirEdicaoRapida(os, atalho.aba)
          }}
          className="w-full h-7 flex items-center justify-center gap-1.5 rounded-lg bg-white/70 hover:bg-white border border-black/10 text-[10px] font-bold text-[#101828] transition-all cursor-pointer"
        >
          <atalho.icone size={12} weight="bold" />
          <span>{atalho.label}</span>
          <ArrowSquareOut size={11} weight="bold" />
        </button>
      )}
    </div>
  )
}

function KanbanColuna({ coluna, ordens, numeroOsSelecionada, onSelecionar, onAbrirEdicaoRapida, arrasteAtivo, colunaPermitida }) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna.status, disabled: arrasteAtivo && !colunaPermitida })

  return (
    <div
      className={`flex flex-col min-w-[248px] w-[248px] shrink-0 bg-[#f2f4f7] border border-[#e4e7ec] rounded-2xl overflow-hidden transition-opacity ${
        arrasteAtivo && !colunaPermitida ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div className="shrink-0 px-3 py-2.5 border-b border-[#e4e7ec] bg-white flex items-center justify-between">
        <span className="text-xs font-bold text-[#101828]">{coluna.titulo}</span>
        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#f2f4f7] text-[#475467]">
          {ordens.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto no-scrollbar p-2 space-y-2 transition-colors ${
          isOver && colunaPermitida ? 'bg-[#e0f2fe]' : ''
        }`}
      >
        {ordens.length === 0 ? (
          <div className="text-center py-6 text-[10.5px] text-[#98a2b3] font-semibold">Nenhuma OS aqui</div>
        ) : (
          ordens.map((os) => (
            <KanbanCard
              key={os.numeroOS}
              os={os}
              isSelected={Boolean(numeroOsSelecionada) && String(numeroOsSelecionada) === String(os.numeroOS)}
              onSelecionar={onSelecionar}
              onAbrirEdicaoRapida={onAbrirEdicaoRapida}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function KanbanOSBoard({ ordens, numeroOsSelecionada, onSelecionar, onMoverStatus, onAbrirEdicaoRapida }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [osArrastando, setOsArrastando] = useState(null)

  const ordensPorColuna = useMemo(() => {
    const mapa = {}
    KANBAN_COLUNAS_OS.forEach((c) => {
      mapa[c.status] = []
    })
    ordens.forEach((os) => {
      const chave = mapa[os.status] ? os.status : 'fila'
      mapa[chave].push(os)
    })
    return mapa
  }, [ordens])

  const indiceColunaAtiva = osArrastando
    ? KANBAN_COLUNAS_OS.findIndex((c) => c.status === osArrastando.status)
    : -1

  const handleDragStart = (event) => {
    setOsArrastando(event.active.data.current?.os || null)
  }

  const handleDragEnd = (event) => {
    setOsArrastando(null)
    const { active, over } = event
    if (!over) return
    const novoStatus = over.id
    const os = active.data.current?.os
    if (!os || os.status === novoStatus) return

    if (!podeTransicionarPara(os.status, novoStatus)) {
      toast.warning('Só é possível mover uma OS para a etapa anterior ou a etapa seguinte, sem pular colunas.')
      return
    }

    onMoverStatus(os.numeroOS, novoStatus)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setOsArrastando(null)}>
      <div className="flex-1 min-h-0 flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {KANBAN_COLUNAS_OS.map((coluna, index) => (
          <KanbanColuna
            key={coluna.status}
            coluna={coluna}
            ordens={ordensPorColuna[coluna.status] || []}
            numeroOsSelecionada={numeroOsSelecionada}
            onSelecionar={onSelecionar}
            onAbrirEdicaoRapida={onAbrirEdicaoRapida}
            arrasteAtivo={Boolean(osArrastando)}
            colunaPermitida={!osArrastando || Math.abs(index - indiceColunaAtiva) === 1}
          />
        ))}
      </div>

      <DragOverlay>
        {osArrastando ? (
          <div className="w-[232px]">
            <KanbanCard os={osArrastando} isSelected={false} onSelecionar={() => {}} arrastavel={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
