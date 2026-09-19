import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  ArrowsOutSimple,
  ArrowsInSimple,
  ArrowsClockwise,
  ArrowsOutCardinal,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export function ModalRedimensionavel({
  isOpen,
  onClose,
  chaveStorage,
  storageKey,
  larguraPadrao = 800,
  alturaPadrao = 600,
  larguraMinima = 480,
  alturaMinima = 380,
  titulo,
  subtitulo,
  badge = 'Cadastro Oficial',
  icone: Icone,
  children,
  rodape,
}) {
  const chavePersistencia = chaveStorage || storageKey || 'modal_redimensionavel_default'

  const carregarDimensoes = () => {
    if (typeof window === 'undefined') {
      return { largura: larguraPadrao, altura: alturaPadrao, posicaoX: 0, posicaoY: 0 }
    }
    try {
      const salvo = localStorage.getItem(chavePersistencia)
      if (salvo) {
        const parsed = JSON.parse(salvo)
        return {
          largura: Math.max(larguraMinima, Math.min(window.innerWidth - 40, parsed.largura || larguraPadrao)),
          altura: Math.max(alturaMinima, Math.min(window.innerHeight - 40, parsed.altura || alturaPadrao)),
          posicaoX: parsed.posicaoX || 0,
          posicaoY: parsed.posicaoY || 0,
        }
      }
    } catch {}
    return { largura: larguraPadrao, altura: alturaPadrao, posicaoX: 0, posicaoY: 0 }
  }

  const [tamanho, setTamanho] = useState(carregarDimensoes)
  const [maximizada, setMaximizada] = useState(false)
  const [estaArrastando, setEstaArrastando] = useState(false)
  const [estaRedimensionando, setEstaRedimensionando] = useState(false)

  const dragRef = useRef({ ativo: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 })
  const resizeRef = useRef({ ativo: false, direcao: null, startX: 0, startY: 0, startLargura: 0, startAltura: 0 })

  useEffect(() => {
    if (isOpen) {
      setTamanho(carregarDimensoes())
    }
  }, [isOpen, chavePersistencia])

  const salvarDimensoes = (novasDimensoes) => {
    try {
      localStorage.setItem(chavePersistencia, JSON.stringify(novasDimensoes))
    } catch {}
  }

  // Arrasto pelo cabeçalho
  const handleMouseDownHeader = (e) => {
    if (maximizada) return
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return
    e.preventDefault()

    dragRef.current = {
      ativo: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: tamanho.posicaoX || 0,
      startPosY: tamanho.posicaoY || 0,
    }
    setEstaArrastando(true)

    const handleMouseMove = (moveEvent) => {
      if (!dragRef.current.ativo) return
      const deltaX = moveEvent.clientX - dragRef.current.startX
      const deltaY = moveEvent.clientY - dragRef.current.startY

      const novoX = dragRef.current.startPosX + deltaX
      const novoY = dragRef.current.startPosY + deltaY

      setTamanho((prev) => {
        const atualizado = { ...prev, posicaoX: novoX, posicaoY: novoY }
        return atualizado
      })
    }

    const handleMouseUp = () => {
      dragRef.current.ativo = false
      setEstaArrastando(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      setTamanho((prev) => {
        salvarDimensoes(prev)
        return prev
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Redimensionamento pelas bordas
  const handleMouseDownResize = (e, direcao) => {
    e.preventDefault()
    e.stopPropagation()
    if (maximizada) return

    resizeRef.current = {
      ativo: true,
      direcao,
      startX: e.clientX,
      startY: e.clientY,
      startLargura: tamanho.largura,
      startAltura: tamanho.altura,
    }
    setEstaRedimensionando(true)

    const handleMouseMove = (moveEvent) => {
      if (!resizeRef.current.ativo) return
      const deltaX = moveEvent.clientX - resizeRef.current.startX
      const deltaY = moveEvent.clientY - resizeRef.current.startY

      setTamanho((prev) => {
        let novaLargura = prev.largura
        let novaAltura = prev.altura

        if (direcao.includes('e')) {
          novaLargura = Math.max(larguraMinima, Math.min(window.innerWidth - 30, resizeRef.current.startLargura + deltaX))
        }
        if (direcao.includes('s')) {
          novaAltura = Math.max(alturaMinima, Math.min(window.innerHeight - 30, resizeRef.current.startAltura + deltaY))
        }

        return { ...prev, largura: novaLargura, altura: novaAltura }
      })
    }

    const handleMouseUp = () => {
      resizeRef.current.ativo = false
      setEstaRedimensionando(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      setTamanho((prev) => {
        salvarDimensoes(prev)
        return prev
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Restaurar padrão
  const handleRestaurarPadrao = () => {
    const padrao = { largura: larguraPadrao, altura: alturaPadrao, posicaoX: 0, posicaoY: 0 }
    setTamanho(padrao)
    setMaximizada(false)
    salvarDimensoes(padrao)
    toast.info('Dimensões e posição do formulário restauradas ao padrão.')
  }

  if (!isOpen) return null

  const isAlterado =
    tamanho.largura !== larguraPadrao ||
    tamanho.altura !== alturaPadrao ||
    Boolean(tamanho.posicaoX) ||
    Boolean(tamanho.posicaoY)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none">
      <div
        style={
          maximizada
            ? { width: '99vw', height: '98vh', transform: 'none' }
            : {
                width: `${tamanho.largura}px`,
                maxWidth: '98vw',
                height: `${tamanho.altura}px`,
                maxHeight: '96vh',
                minWidth: `${larguraMinima}px`,
                minHeight: `${alturaMinima}px`,
                transform: `translate(${tamanho.posicaoX || 0}px, ${tamanho.posicaoY || 0}px)`,
              }
        }
        className={`relative bg-white rounded-2xl border border-[#d0d5dd] shadow-2xl flex flex-col overflow-hidden ${
          estaRedimensionando || estaArrastando
            ? 'transition-none select-none'
            : 'transition-[width,height] duration-150 select-auto'
        }`}
      >
        {/* Cabeçalho com suporte a arrastar e duplo clique para maximizar */}
        <div
          onMouseDown={handleMouseDownHeader}
          onDoubleClick={() => setMaximizada(!maximizada)}
          className={`px-5 py-3.5 border-b border-[#f2f4f7] flex items-center justify-between shrink-0 bg-white select-none ${
            maximizada ? 'cursor-default' : estaArrastando ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title={
            maximizada
              ? 'Dê um duplo clique no cabeçalho para restaurar'
              : 'Clique e arraste pelo cabeçalho para mover • Duplo clique para maximizar'
          }
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {Icone && (
              <div className="w-9 h-9 rounded-xl bg-[#101828] text-[#38bdf8] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Icone size={20} weight="bold" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-[#101828] leading-none truncate">
                  {titulo}
                </h3>
                {badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200 shrink-0">
                    {badge}
                  </span>
                )}
                {!maximizada && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-[#667085] bg-[#f8fafc] px-1.5 py-0.5 rounded-md border border-[#eaecf0]">
                    <ArrowsOutCardinal size={10} weight="bold" />
                    Mover
                  </span>
                )}
              </div>
              {subtitulo && (
                <p className="text-[11px] text-[#667085] mt-0.5 truncate">{subtitulo}</p>
              )}
            </div>
          </div>

          {/* Botões do cabeçalho */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isAlterado && !maximizada && (
              <button
                type="button"
                onClick={handleRestaurarPadrao}
                className="h-8.5 px-2.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#344054] flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="Restaurar tamanho e posição padrão do formulário"
              >
                <ArrowsClockwise size={13} weight="bold" />
                <span className="hidden sm:inline">Tamanho Padrão</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMaximizada(!maximizada)}
              className="h-8.5 w-8.5 rounded-xl border border-[#d0d5dd] bg-[#f8fafc] hover:bg-[#f2f4f7] text-[#101828] flex items-center justify-center transition-all cursor-pointer shadow-xs"
              title={maximizada ? 'Restaurar tamanho' : 'Maximizar tela cheia'}
            >
              {maximizada ? <ArrowsInSimple size={16} weight="bold" /> : <ArrowsOutSimple size={16} weight="bold" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-8.5 w-8.5 rounded-xl text-[#667085] hover:text-[#101828] hover:bg-[#f2f4f7] flex items-center justify-center transition-colors cursor-pointer"
              title="Fechar janela"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Corpo rolável do formulário sem barra de rolagem visual */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 sm:p-6 bg-[#f8fafc]">
          {children}
        </div>

        {/* Rodapé se fornecido */}
        {rodape && (
          <div className="px-5 py-3.5 border-t border-[#f2f4f7] bg-white flex items-center justify-between shrink-0">
            {rodape}
          </div>
        )}

        {/* Alças invisíveis e canto visível para redimensionamento */}
        {!maximizada && (
          <>
            {/* Borda direita */}
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'e')}
              className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-[#0284c7]/20 transition-colors z-20"
              title="Arraste para ajustar largura"
            />
            {/* Borda inferior */}
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 's')}
              className="absolute bottom-0 left-0 h-2 w-full cursor-ns-resize hover:bg-[#0284c7]/20 transition-colors z-20"
              title="Arraste para ajustar altura"
            />
            {/* Canto inferior direito */}
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'se')}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-30 flex items-center justify-center text-[#98a2b3] hover:text-[#0284c7]"
              title="Arraste para redimensionar o formulário"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="2" cy="6" r="1" />
                <circle cx="6" cy="6" r="1" />
                <circle cx="6" cy="2" r="1" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
