import React, { useState, useEffect, useRef } from 'react'
import {
  Printer,
  X,
  ArrowsOutSimple,
  ArrowsInSimple,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsClockwise,
  Receipt,
} from '@phosphor-icons/react'
import { FolhaOrdemServicoImpressao } from '../../../components/dashboard/FolhaOrdemServicoImpressao'
import { toast } from 'sonner'

const STORAGE_KEY_IMPRESSAO_DIMS = 'dev_oficina_modal_impressao_dims'
const LARGURA_PADRAO = 1060
const ALTURA_PADRAO = 780

export function ModalImpressaoOS({ isOpen, onClose, osData }) {
  const [isMaximizada, setIsMaximizada] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [paginaSelecionada, setPaginaSelecionada] = useState('todas')

  const [tamanhoModal, setTamanhoModal] = useState(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_IMPRESSAO_DIMS)
      if (salvo) {
        const parsed = JSON.parse(salvo)
        if (parsed.largura && parsed.altura) return parsed
      }
    } catch (e) {}
    return {
      largura: LARGURA_PADRAO,
      altura: ALTURA_PADRAO,
      posicaoX: 0,
      posicaoY: 0,
    }
  })

  const modalRef = useRef(null)
  const dragRef = useRef({ ativo: false, startX: 0, startY: 0, initialPosX: 0, initialPosY: 0 })
  const resizeRef = useRef({ ativo: false, direcao: '', startX: 0, startY: 0, startW: 0, startH: 0 })

  // Salva no storage com debounce
  const salvarDimensoes = (novasDims) => {
    try {
      localStorage.setItem(STORAGE_KEY_IMPRESSAO_DIMS, JSON.stringify(novasDims))
    } catch (e) {}
  }

  // Resetar ao padrão
  const handleRestaurarPadrao = () => {
    const padrao = {
      largura: LARGURA_PADRAO,
      altura: ALTURA_PADRAO,
      posicaoX: 0,
      posicaoY: 0,
    }
    setTamanhoModal(padrao)
    setIsMaximizada(false)
    salvarDimensoes(padrao)
    toast.info('Tamanho e posição do formulário de impressão restaurados para o padrão.')
  }

  // Alternar maximizar
  const handleAlternarMaximizar = () => {
    setIsMaximizada(!isMaximizada)
  }

  // Dragging pelo cabeçalho
  const handleMouseDownHeader = (e) => {
    if (isMaximizada) return
    if (e.target.closest('button') || e.target.closest('select')) return

    dragRef.current = {
      ativo: true,
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: tamanhoModal.posicaoX || 0,
      initialPosY: tamanhoModal.posicaoY || 0,
    }

    const handleMouseMove = (moveEvent) => {
      if (!dragRef.current.ativo) return
      const deltaX = moveEvent.clientX - dragRef.current.startX
      const deltaY = moveEvent.clientY - dragRef.current.startY

      const novoX = dragRef.current.initialPosX + deltaX
      const novoY = dragRef.current.initialPosY + deltaY

      setTamanhoModal((prev) => ({
        ...prev,
        posicaoX: novoX,
        posicaoY: novoY,
      }))
    }

    const handleMouseUp = () => {
      dragRef.current.ativo = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      setTamanhoModal((prev) => {
        salvarDimensoes(prev)
        return prev
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Redimensionamento
  const handleMouseDownResize = (e, direcao) => {
    e.preventDefault()
    e.stopPropagation()
    if (isMaximizada) return

    resizeRef.current = {
      ativo: true,
      direcao,
      startX: e.clientX,
      startY: e.clientY,
      startW: tamanhoModal.largura,
      startH: tamanhoModal.altura,
    }

    const handleMouseMove = (moveEvent) => {
      if (!resizeRef.current.ativo) return
      const deltaX = moveEvent.clientX - resizeRef.current.startX
      const deltaY = moveEvent.clientY - resizeRef.current.startY

      const minW = 600
      const minH = 450
      const maxW = window.innerWidth - 40
      const maxH = window.innerHeight - 40

      let novoW = resizeRef.current.startW
      let novoH = resizeRef.current.startH

      if (direcao.includes('right')) novoW = Math.max(minW, Math.min(maxW, resizeRef.current.startW + deltaX))
      if (direcao.includes('bottom')) novoH = Math.max(minH, Math.min(maxH, resizeRef.current.startH + deltaY))

      setTamanhoModal((prev) => ({
        ...prev,
        largura: novoW,
        altura: novoH,
      }))
    }

    const handleMouseUp = () => {
      resizeRef.current.ativo = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      setTamanhoModal((prev) => {
        salvarDimensoes(prev)
        return prev
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handlePrint = () => {
    toast.info('Abrindo diálogo oficial de impressão do sistema...')
    window.print()
  }

  if (!isOpen || !osData) return null

  const modalStyle = isMaximizada
    ? {
        width: 'calc(100vw - 32px)',
        height: 'calc(100vh - 32px)',
        transform: 'none',
        top: '16px',
        left: '16px',
      }
    : {
        width: `${tamanhoModal.largura}px`,
        height: `${tamanhoModal.altura}px`,
        transform: `translate(${tamanhoModal.posicaoX || 0}px, ${tamanhoModal.posicaoY || 0}px)`,
      }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div
        ref={modalRef}
        style={modalStyle}
        className="relative bg-[#101828] border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-75"
      >
        {/* Cabeçalho arrastável com controles */}
        <header
          onMouseDown={handleMouseDownHeader}
          className="h-14 px-4 bg-[#0f172a] border-b border-zinc-800 flex items-center justify-between cursor-move shrink-0"
        >
          {/* Lado Esquerdo: Identificação */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-[#0284c7]">
              <Receipt size={18} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Folha Oficial de Orçamento e OS #{osData.numeroOS}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {osData.placa || 'PLACA'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">
                {osData.cliente} • {osData.marcaModelo}
              </p>
            </div>
          </div>

          {/* Lado Direito: Ações de Zoom, Impressão e Janela */}
          <div className="flex items-center gap-1.5">
            {/* Controles de Zoom */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-1.5 py-0.5 mr-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title="Diminuir Zoom"
              >
                <MagnifyingGlassMinus size={14} weight="bold" />
              </button>
              <span className="text-[10px] font-mono text-zinc-300 px-1.5 min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title="Aumentar Zoom"
              >
                <MagnifyingGlassPlus size={14} weight="bold" />
              </button>
            </div>

            {/* Botão Imprimir */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer size={15} weight="bold" />
              <span>Imprimir Folha</span>
            </button>

            {/* Separador */}
            <div className="h-4 w-px bg-zinc-800 mx-1" />

            {/* Resetar Posição */}
            <button
              type="button"
              onClick={handleRestaurarPadrao}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
              title="Restaurar tamanho e posição padrão"
            >
              <ArrowsClockwise size={15} weight="bold" />
            </button>

            {/* Maximizar / Restaurar */}
            <button
              type="button"
              onClick={handleAlternarMaximizar}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
              title={isMaximizada ? 'Restaurar Janela' : 'Maximizar Janela'}
            >
              {isMaximizada ? <ArrowsInSimple size={15} weight="bold" /> : <ArrowsOutSimple size={15} weight="bold" />}
            </button>

            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer ml-1"
              title="Fechar (Esc)"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </header>

        {/* Área Central com a Folha de Impressão Renderizada */}
        <div className="flex-1 bg-[#1e293b]/60 overflow-y-auto overflow-x-auto no-scrollbar p-4 flex justify-center items-start min-h-0">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="shrink-0 shadow-2xl rounded-sm my-2 bg-white"
          >
            <FolhaOrdemServicoImpressao
              formData={osData}
              paginaSelecionada={paginaSelecionada}
            />
          </div>
        </div>

        {/* Rodapé informativo */}
        <footer className="h-9 px-4 bg-[#0f172a] border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
            <span>Layout oficial milimétrico idêntico ao modelo físico da oficina (Ordem Serviço.jpg)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Arraste as bordas para redimensionar</span>
            <span>•</span>
            <span className="font-semibold text-zinc-300">Total: R$ {Number(osData.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </footer>

        {/* Alças de Redimensionamento */}
        {!isMaximizada && (
          <>
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'right')}
              className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-[#0284c7]/40"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'bottom')}
              className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-[#0284c7]/40"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'bottom-right')}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-[#0284c7] flex items-center justify-center text-zinc-500"
            >
              <div className="w-2 h-2 border-r-2 border-b-2 border-zinc-400" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
