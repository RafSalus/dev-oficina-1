import React from 'react'
import {
  Engine,
  CheckCircle,
  CarProfile,
  Wrench,
  Thermometer,
  BatteryHigh,
  ArrowRight,
} from '@phosphor-icons/react'
import { SERVICES_SECTION } from '../constants/company'

const ICONS_MAP = {
  Engine,
  CheckCircle,
  CarProfile,
  Wrench,
  Thermometer,
  BatteryHigh,
}

function ServiceCard({ title, description, iconName, delay }) {
  const IconComponent = ICONS_MAP[iconName] || Wrench

  return (
    <div
      data-reveal={delay}
      className="service-card group bg-gray-50 p-8 rounded-sm hover:shadow-xl hover:bg-black transition-all duration-300 border-t-2 border-t-brand-blue"
    >
      <div className="w-14 h-14 bg-white rounded-sm flex items-center justify-center mb-6 text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-100">
        <IconComponent size={28} className="text-brand-navy" aria-hidden="true" />
      </div>

      <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-gray-500 group-hover:text-gray-300 transition-colors">{description}</p>
    </div>
  )
}

export function Services() {
  return (
    <section id="servicos" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:flex md:justify-between md:items-end" data-reveal>
          <div className="max-w-2xl">
            <span aria-hidden="true" className="block w-12 h-1 bg-brand-blue mb-4" />
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              {SERVICES_SECTION.headingIntro} <br /> {SERVICES_SECTION.headingOutro}
            </h2>
            <p className="text-gray-500 text-lg">{SERVICES_SECTION.description}</p>
          </div>

          <a
            href={SERVICES_SECTION.viewAllHref}
            className="hidden md:inline-flex items-center gap-2 font-semibold text-brand-navy hover:underline mt-4 md:mt-0"
          >
            {SERVICES_SECTION.viewAllLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_SECTION.items.map((item, idx) => (
            <ServiceCard
              key={item.title}
              title={item.title}
              description={item.description}
              iconName={item.iconName}
              delay={[undefined, '100', '200'][idx % 3]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
