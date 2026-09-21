import React from 'react'
import { Wrench, ShieldCheck } from '@phosphor-icons/react'
import { HERO_DATA } from '../constants/company'

export function Hero() {
  return (
    <section
      id="topo"
      className="relative pt-[calc(8rem+env(safe-area-inset-top))] pb-20 lg:pt-48 lg:pb-32 flex items-center min-h-[560px] sm:min-h-[600px] lg:min-h-[85vh] bg-black text-white"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/images/Hero_Fundo_2.png"
          alt="Fundo hero"
          className="w-full h-full object-cover object-[center_30%] lg:object-center grayscale-[15%] opacity-80"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent lg:bg-gradient-to-r lg:from-black/90 lg:via-black/70 lg:to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[1fr_auto] gap-12 items-center">
        <div data-reveal className="max-w-2xl">
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold tracking-tighter leading-[1.1] mb-6 drop-shadow-lg">
            {HERO_DATA.title}
          </h1>

          <p className="text-lg lg:text-xl text-gray-200 mb-8 max-w-md font-medium leading-relaxed drop-shadow-md">
            {HERO_DATA.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={HERO_DATA.primaryCta.href}
              className="bg-white text-black px-8 py-4 text-center font-bold hover:bg-gray-200 transition-colors rounded-sm flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {HERO_DATA.primaryCta.label}
              <Wrench size={20} aria-hidden="true" />
            </a>

            <a
              href={HERO_DATA.secondaryCta.href}
              className="bg-black/30 backdrop-blur-md text-white border border-white/20 px-8 py-4 text-center font-bold hover:bg-white/10 transition-colors rounded-sm w-full sm:w-auto"
            >
              {HERO_DATA.secondaryCta.label}
            </a>
          </div>

          <div className="mt-10 lg:hidden inline-flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-sm border border-white/20">
            <div className="bg-[#0284c7]/25 text-[#38bdf8] p-2 rounded-full">
              <ShieldCheck size={24} weight="fill" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight text-white">{HERO_DATA.badge.value}</p>
              <p className="text-xs text-gray-300 font-medium">{HERO_DATA.badge.label}</p>
            </div>
          </div>
        </div>

        <div data-reveal="100" className="hidden lg:block relative justify-self-end">
          <div className="bg-white text-black p-6 shadow-2xl rounded-sm max-w-[280px]">
            <div className="flex items-center gap-4">
              <div className="bg-[#e0f2fe] text-[#0284c7] p-3 rounded-full flex-shrink-0">
                <ShieldCheck size={28} weight="fill" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-xl leading-tight">{HERO_DATA.badge.value}</p>
                <p className="text-sm text-gray-600 font-medium">{HERO_DATA.badge.label}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
