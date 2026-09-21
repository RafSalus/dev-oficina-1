import React from 'react'
import { Car } from '@phosphor-icons/react'
import { BRANDS } from '../constants/company'

function BrandList({ hidden = false }) {
  return (
    <div className="marquee-content" aria-hidden={hidden}>
      {BRANDS.map((brand, i) => (
        <span
          key={`${brand}-${i}`}
          className="inline-flex items-center gap-2 text-xl md:text-2xl font-bold tracking-tight text-gray-400 hover:text-black transition-colors whitespace-nowrap"
        >
          <Car size={20} aria-hidden="true" />
          {brand}
        </span>
      ))}
    </div>
  )
}

export function BrandsMarquee() {
  return (
    <section className="py-12 border-y border-gray-100 bg-white overflow-hidden" aria-label="Marcas atendidas">
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <p className="text-sm font-semibold tracking-widest uppercase text-gray-500 text-center">
          Especialistas nas melhores marcas
        </p>
      </div>

      <div className="marquee-container">
        <BrandList />
        <BrandList hidden />
      </div>
    </section>
  )
}
