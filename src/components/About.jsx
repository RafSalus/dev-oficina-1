import React from 'react'
import { ABOUT_SECTION, COMPANY } from '../constants/company'

export function About() {
  return (
    <section id="sobre" className="py-24 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div data-reveal>
            <span aria-hidden="true" className="block w-12 h-1 bg-brand-blue mb-4" />
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {ABOUT_SECTION.title}
            </h2>

            {ABOUT_SECTION.paragraphs.map((p, index) => (
              <p key={index} className="text-gray-600 text-lg mb-6 leading-relaxed">
                {p}
              </p>
            ))}

            <div className="bg-white p-6 border border-gray-200 rounded-sm border-l-4 border-l-brand-blue">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">
                  Razão Social
                </p>
                <p className="font-bold text-gray-900">{COMPANY.legalName}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="bg-gray-100 px-3 py-1 rounded text-sm font-medium text-gray-700">
                    {COMPANY.cnpj}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[300px] lg:h-[500px] w-full" data-reveal="100">
            <img
              src="/images/Frente-Oficina.png"
              alt="Frente da Oficina Mecânica"
              className="absolute inset-0 w-full h-full object-cover rounded-sm shadow-xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
