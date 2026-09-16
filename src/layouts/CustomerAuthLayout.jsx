import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { COMPANY } from '../constants/company'

export function CustomerAuthLayout({ children }) {
  return (
    <div className="min-h-dvh flex bg-white text-black">
      {/* Left branding banner (Desktop) */}
      <div
        className="relative hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 overflow-hidden"
        aria-hidden="true"
      >
        <picture>
          <source srcSet="/images/Tela-Cliente.webp" type="image/webp" />
          <img
            src="/images/Tela-Cliente.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
            loading="eager"
            decoding="async"
          />
        </picture>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/"
            tabIndex={-1}
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <img src="/favicon-96x96.png" alt="" aria-hidden="true" className="w-12 h-12 shrink-0 object-contain" />
            <span className="font-bold text-2xl tracking-tight text-white">{COMPANY.shortName}</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mb-8">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Transparência em cada quilômetro.
          </h2>
          <p className="text-gray-300 text-lg">
            Em breve, você poderá acompanhar informações do seu veículo em um único lugar.
          </p>
        </div>
      </div>

      {/* Right form container */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-dvh bg-white">
        <div className="flex items-center justify-between gap-3 px-6 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] lg:justify-end lg:px-8 lg:pt-8">
          <Link
            to="/"
            aria-label={COMPANY.name}
            className="lg:hidden flex items-center gap-2.5 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <img src="/favicon-96x96.png" alt="" aria-hidden="true" className="w-10 h-10 shrink-0 object-contain" />
            <span className="font-bold text-lg tracking-tight whitespace-nowrap shrink-0">{COMPANY.shortName}</span>
          </Link>

          <Link
            to="/"
            aria-label="Voltar ao site"
            title="Voltar ao site"
            className="w-10 h-10 inline-flex items-center justify-center text-gray-700 hover:text-black bg-gray-100/90 hover:bg-gray-200/90 rounded-full border border-gray-200/80 shrink-0 transition-all active:scale-95 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        <div className="lg:hidden px-6 pt-6 pb-2">
          <span aria-hidden="true" className="block w-10 h-1 bg-brand-blue rounded-full mb-3" />
          <p className="text-3xl font-extrabold tracking-tight text-gray-900">Portal do Cliente</p>
          <p className="text-xs text-gray-500 mt-1">Acompanhe a manutenção e histórico do seu veículo.</p>
        </div>

        {children}

        <div className="py-6 px-6 text-center text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
          © 2026 {COMPANY.name}. Todos os direitos reservados.
        </div>
      </div>
    </div>
  )
}
