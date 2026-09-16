import React, { useState, useEffect } from 'react'
import { ShieldCheck } from '@phosphor-icons/react'

const WORKSHOP_IMAGES = [
  { src: '/images/Interior_Frente.png', alt: 'Interior da oficina — frente' },
  { src: '/images/Interior_Lateral.png', alt: 'Interior da oficina — lateral' },
]

export function LocationMap() {
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % WORKSHOP_IMAGES.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <section className="py-24 lg:py-32 bg-white text-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center" data-reveal="100">
          <div className="relative w-full aspect-[4/3]">
            {WORKSHOP_IMAGES.map((img, idx) => (
              <img
                key={img.alt}
                src={img.src}
                alt={img.alt}
                aria-hidden={idx !== currentIdx}
                className={`absolute inset-0 w-full h-full object-cover rounded-sm shadow-xl transition-opacity duration-700 ${
                  idx === currentIdx ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2" data-reveal>
          <span aria-hidden="true" className="block w-12 h-1 bg-brand-blue mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
            <ShieldCheck size={16} weight="fill" aria-hidden="true" />
            Tradição e Qualidade
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Mais de uma década de excelência automotiva.
          </h2>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Nossa trajetória é marcada pelo compromisso com a satisfação de cada cliente. Combinamos conhecimento técnico avançado com um atendimento humano e transparente.
          </p>

          <div className="grid grid-cols-2 gap-8 mt-10">
            <div>
              <p className="text-4xl font-black text-brand-navy mb-2">+10</p>
              <p className="text-gray-500 font-medium">Anos de mercado</p>
            </div>
            <div>
              <p className="text-4xl font-black text-brand-navy mb-2">100%</p>
              <p className="text-gray-500 font-medium">Transparência</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
