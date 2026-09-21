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
  larguraPadrao: larguraPadraoProp,
  defaultWidth,
  alturaPadrao: alturaPadraoProp,
  defaultHeight,
  larguraMinima: larguraMinimaProp,
  minWidth,
  alturaMinima: alturaMinimaProp,
  minHeight,
  larguraMaxima: larguraMaximaProp,
  maxWidth,
  alturaMaxima: alturaMaximaProp,
  maxHeight,
  titulo: tituloProp,
  title,
  subtitulo: subtituloProp,
  subtitle,
  badge = 'Cadastro Oficial',
  icone: Icone,
  children,
  rodape,
}) {
  const larguraPadrao = larguraPadraoProp || defaultWidth || 800
  const alturaPadrao = alturaPadraoProp || defaultHeight || 600
  const larguraMinima = larguraMinimaProp || minWidth || 540
  const alturaMinima = alturaMinimaProp || minHeight || 440
  const larguraMaxima = larguraMaximaProp || maxWidth
  const alturaMaxima = alturaMaximaProp || maxHeight
  const titulo = tituloProp || title
  const subtitulo = subtituloProp || subtitle
  const chavePersistencia = chaveStorage || storageKey || 'modal_redimensionavel_default'

  const getMaxLargura = () => {
    if (larguraMaxima) return larguraMaxima
    if (typeof window !== 'undefined') {
      return Math.min(1440, window.innerWidth - 24)
    }
    return 1440
  }

  const getMaxAltura = () => {
    if (alturaMaxima) return alturaMaxima
    if (typeof window !== 'undefined') {
      return Math.min(960, window.innerHeight - 24)
    }
    return 960
  }

  const carregarDimensoes = () => {
    if (typeof window === 'undefined') {
      return { largura: larguraPadrao, altura: alturaPadrao, posicaoX: 0, posicaoY: 0 }
    }
    const maxW = getMaxLargura()
    const maxH = getMaxAltura()
    const minW = Math.min(larguraMinima, maxW)
    const minH = Math.min(alturaMinima, maxH)

    try {
      const salvo = localStorage.getItem(chavePersistencia)
      if (salvo) {
        const parsed = JSON.parse(salvo)
        const largura = Math.max(minW, Math.min(maxW, parsed.largura || larguraPadrao))
        const altura = Math.max(minH, Math.min(maxH, parsed.altura || alturaPadrao))

        const viewportH = window.innerHeight
        const viewportW = window.innerWidth
        const rawPosY = parsed.posicaoY || 0
        const rawPosX = parsed.posicaoX || 0

        // Clamp para garantir que o cabeçalho nunca abra fora da tela
        const minY = 16 - (viewportH - altura) / 2
        const maxY = (viewportH - 60) - (viewportH - altura) / 2
        const clampedY = Math.max(minY, Math.min(maxY, rawPosY))

        const minX = 80 - largura - (viewportW - largura) / 2
        const maxX = (viewportW - 80) - (viewportW - largura) / 2
        const clampedX = Math.max(minX, Math.min(maxX, rawPosX))

        return {
          largura,
          altura,
          posicaoX: Math.round(clampedX),
          posicaoY: Math.round(clampedY),
        }
      }
    } catch {}
    return {
      largura: Math.max(minW, Math.min(maxW, larguraPadrao)),
      altura: Math.max(minH, Math.min(maxH, alturaPadrao)),
      posicaoX: 0,
      posicaoY: 0,
    }
  }

  const [tamanho, setTamanho] = useState(carregarDimensoes)
  const [maximizada, setMaximizada] = useState(false)
  const [estaArrastando, setEstaArrastando] = useState(false)
  const [estaRedimensionando, setEstaRedimensionando] = useState(false)

  const dragRef = useRef({ ativo: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0, largura: 0, altura: 0 })
  const resizeRef = useRef({ ativo: false, direcao: null, startX: 0, startY: 0, startLargura: 0, startAltura: 0, startPosX: 0, startPosY: 0 })

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

  // Arrasto pelo cabeçalho (com trava para o cabeçalho nunca sumir da tela)
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
      largura: tamanho.largura,
      altura: tamanho.altura,
    }
    setEstaArrastando(true)

    const handleMouseMove = (moveEvent) => {
      if (!dragRef.current.ativo) return
      const deltaX = moveEvent.clientX - dragRef.current.startX
      const deltaY = moveEvent.clientY - dragRef.current.startY

      const rawX = dragRef.current.startPosX + deltaX
      const rawY = dragRef.current.startPosY + deltaY

      const viewportW = window.innerWidth
      const viewportH = window.innerHeight
      const modalW = dragRef.current.largura
      const modalH = dragRef.current.altura

      // Trava de teto: top >= 16px (o cabeçalho nunca sobe além do topo)
      const minY = 16 - (viewportH - modalH) / 2
      // Trava de piso: mantém o cabeçalho sempre visível
      const maxY = (viewportH - 60) - (viewportH - modalH) / 2
      const clampedY = Math.max(minY, Math.min(maxY, rawY))

      // Trava horizontal: cabeçalho permanece acessível
      const minX = 80 - modalW - (viewportW - modalW) / 2
      const maxX = (viewportW - 80) - (viewportW - modalW) / 2
      const clampedX = Math.max(minX, Math.min(maxX, rawX))

      setTamanho((prev) => ({
        ...prev,
        posicaoX: Math.round(clampedX),
        posicaoY: Math.round(clampedY),
      }))
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

  // Redimensionamento pelas bordas com ANCORAGEM FIXA de topo e esquerda
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
      startPosX: tamanho.posicaoX || 0,
      startPosY: tamanho.posicaoY || 0,
    }
    setEstaRedimensionando(true)

    const handleMouseMove = (moveEvent) => {
      if (!resizeRef.current.ativo) return
      const deltaX = moveEvent.clientX - resizeRef.current.startX
      const deltaY = moveEvent.clientY - resizeRef.current.startY

      const viewportW = window.innerWidth
      const viewportH = window.innerHeight
      const maxW = getMaxLargura()
      const maxH = getMaxAltura()

      const { startLargura, startAltura, startPosX, startPosY } = resizeRef.current

      // Coordenadas visuais absolutas do topo e da esquerda no momento em que o redimensionamento começou
      const startTop = (viewportH - startAltura) / 2 + startPosY
      const startLeft = (viewportW - startLargura) / 2 + startPosX

      let novaLargura = startLargura
      let novaAltura = startAltura
      let novaPosX = startPosX
      let novaPosY = startPosY

      // Redimensionamento vertical (borda inferior 's' ou canto 'se')
      if (direcao.includes('s')) {
        // Limita a altura para nunca ultrapassar a borda inferior da tela (margem de 16px)
        const maxAlturaDisponivel = Math.min(maxH, Math.max(alturaMinima, viewportH - 16 - startTop))
        const propostaAltura = startAltura + deltaY
        novaAltura = Math.max(alturaMinima, Math.min(maxAlturaDisponivel, propostaAltura))

        // Compensação de ancoragem:
        // Como o flexbox divide a expansão nos dois sentidos (subindo delta/2 e descendo delta/2),
        // ao somar (novaAltura - startAltura)/2 a posicaoY, anulamos o deslocamento do topo.
        // O topo permanece EXATAMENTE no pixel startTop, e o cabeçalho não se move!
        const deltaH = novaAltura - startAltura
        novaPosY = startPosY + deltaH / 2
      }

      // Redimensionamento horizontal (borda direita 'e' ou canto 'se')
      if (direcao.includes('e')) {
        // Limita a largura para nunca ultrapassar a borda direita da tela (margem de 16px)
        const maxLarguraDisponivel = Math.min(maxW, Math.max(larguraMinima, viewportW - 16 - startLeft))
        const propostaLargura = startLargura + deltaX
        novaLargura = Math.max(larguraMinima, Math.min(maxLarguraDisponivel, propostaLargura))

        // Compensação de ancoragem horizontal: mantém a borda esquerda 100% ancorada
        const deltaW = novaLargura - startLargura
        novaPosX = startPosX + deltaW / 2
      }

      setTamanho((prev) => ({
        ...prev,
        largura: Math.round(novaLargura),
        altura: Math.round(novaAltura),
        posicaoX: Math.round(novaPosX),
        posicaoY: Math.round(novaPosY),
      }))
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
                maxWidth: larguraMaxima ? `${larguraMaxima}px` : '98vw',
                height: `${tamanho.altura}px`,
                maxHeight: alturaMaxima ? `${alturaMaxima}px` : '96vh',
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

        {/* Corpo rolável do formulário sem barra de rolagem visual.
            `@container` habilita variantes @sm/@md/@lg nos formulários filhos, respondendo
            à largura real da janela redimensionável (arrastada pelo usuário) em vez da
            largura da viewport do navegador — que é o que as variantes sm:/md:/lg: do
            Tailwind usariam, e por isso ficavam erradas ao encolher o modal. */}
        <div className="@container flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 bg-[#f8fafc] flex flex-col">
          {children}
        </div>

        {/* Rodapé se fornecido — tambem precisa de @container, pois e um irmao do corpo
            rolavel, nao um descendente dele */}
        {rodape && (
          <div className="@container px-5 py-3.5 border-t border-[#f2f4f7] bg-white flex items-center justify-between shrink-0">
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
