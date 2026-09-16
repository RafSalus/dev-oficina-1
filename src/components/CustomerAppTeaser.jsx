import React from 'react'
import { Link } from 'react-router-dom'
import {
  ListChecks,
  FileText,
  Clock,
  ClockCounterClockwise,
  ShieldCheck,
  ArrowRight,
  User,
} from '@phosphor-icons/react'
import { APP_TEASER } from '../constants/company'

const ICONS_MAP = {
  ListChecks,
  FileText,
  Clock,
  ClockCounterClockwise,
  ShieldCheck,
}

function PhoneMockup() {
  const { mockup } = APP_TEASER

  return (
    <div className="relative z-10 bg-[#111] p-2 rounded-[2.5rem] shadow-2xl border border-gray-800 w-[300px] max-w-full h-[600px] flex flex-col">
      <div className="h-6 w-32 bg-black mx-auto rounded-b-xl absolute left-1/2 -translate-x-1/2" />

      <div className="flex-1 bg-white rounded-[2rem] overflow-hidden flex flex-col pt-10 px-4 pb-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-black font-bold text-lg">{mockup.appName}</span>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <User size={20} weight="fill" className="text-gray-500" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">{mockup.vehicleLabel}</p>
          <p className="text-black font-bold text-sm">{mockup.vehicle}</p>
          <p className="text-xs text-gray-400">{mockup.plate}</p>
        </div>

        <div className="space-y-3 flex-1">
          {mockup.items.map((item) => {
            const Icon = ICONS_MAP[item.iconName] || FileText
            return (
              <div
                key={item.title}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  item.highlighted
                    ? 'bg-brand-blue-soft border border-brand-blue-border'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div
                  className={`p-2 rounded-md text-white ${
                    item.highlighted ? 'bg-brand-blue' : 'bg-black'
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-black font-semibold">{item.title}</p>
                  <p className="text-[10px] text-gray-500">{item.subtitle}</p>
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold mt-4"
        >
          {mockup.actionLabel}
        </button>
      </div>
    </div>
  )
}

export function CustomerAppTeaser() {
  return (
    <section id="app" className="py-24 lg:py-32 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center min-w-0" data-reveal>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-transparent blur-3xl opacity-30 z-0" />
          <PhoneMockup />
        </div>

        <div className="order-1 lg:order-2 min-w-0" data-reveal="100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" aria-hidden="true" />
            {APP_TEASER.badge}
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            {APP_TEASER.title}
          </h2>

          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            {APP_TEASER.description}
          </p>

          <ul className="space-y-6">
            {APP_TEASER.benefits.map((benefit) => {
              const Icon = ICONS_MAP[benefit.iconName] || ListChecks
              return (
                <li key={benefit.title} className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-900 p-2 rounded-sm text-brand-blue">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{benefit.title}</h4>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-10">
            <Link
              to="/cliente/entrar"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-center font-medium hover:bg-gray-200 transition-colors rounded-sm"
            >
              <ArrowRight size={20} aria-hidden="true" />
              {APP_TEASER.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
