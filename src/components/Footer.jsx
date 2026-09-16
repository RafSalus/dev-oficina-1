import React, { useId } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Clock,
  InstagramLogo,
  WhatsappLogo,
  FacebookLogo,
  YoutubeLogo,
  LockKey,
  CaretRight,
} from '@phosphor-icons/react'
import { BrandLogo } from './BrandLogo'
import { LOCATION_SECTION, FOOTER_DATA } from '../constants/company'
import { useNotice } from '../context/NoticeContext'

function ContactAndMap() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-16 sm:mb-20">
      <div className="lg:col-span-5">
        <div className="flex items-center gap-2 mb-8">
          <BrandLogo size="footer" />
        </div>

        <span aria-hidden="true" className="block w-10 h-1 bg-brand-blue rounded-full mb-3" />
        <h3 className="text-2xl font-extrabold tracking-tight mb-4">{LOCATION_SECTION.introTitle}</h3>
        <p className="text-gray-400 mb-8 leading-relaxed max-w-md text-sm sm:text-base">
          {LOCATION_SECTION.introText}
        </p>

        <div className="space-y-6">
          {LOCATION_SECTION.contactItems.map((item) => {
            const Icon = item.iconName === 'MapPin' ? MapPin : Clock
            return (
              <div key={item.title} className="flex items-start gap-4">
                <Icon size={24} className="text-brand-blue shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-white text-sm sm:text-base">{item.title}</p>
                  {item.lines.map((line) => (
                    <p key={line} className="text-gray-400 text-xs sm:text-sm">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="lg:col-span-7 h-[350px] sm:h-[400px] lg:h-full min-h-[350px] bg-gray-900 rounded-2xl relative overflow-hidden border border-gray-800/80 shadow-md">
        <iframe
          title={LOCATION_SECTION.map.title}
          src={LOCATION_SECTION.map.src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0 rounded-2xl"
        />
      </div>
    </div>
  )
}

export function Footer() {
  const socialTitleId = useId()
  const fbDescId = useId()
  const ytDescId = useId()
  const { openNotice } = useNotice()

  const { social, legalLinks, copyright } = FOOTER_DATA

  return (
    <footer
      id="localizacao"
      className="bg-black text-white pt-20 sm:pt-24 pb-[calc(3rem+env(safe-area-inset-bottom))] border-t border-gray-900 relative"
    >
      <span aria-hidden="true" className="absolute top-0 left-0 w-full h-1 bg-brand-blue" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <ContactAndMap />

        <div id="redes-sociais" className="border-t border-gray-800/80 pt-10 pb-10">
          <span aria-hidden="true" className="block w-10 h-1 bg-brand-blue rounded-full mb-3" />
          <h3
            id={socialTitleId}
            className="text-lg font-extrabold text-white mb-6 text-center md:text-left tracking-tight"
          >
            {social.title}
          </h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center md:justify-start md:gap-x-6 md:gap-y-4">
            <li>
              <a
                href={social.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.instagram.accessibleName}
                className="flex items-center justify-between sm:justify-start gap-3 p-3.5 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 hover:border-gray-700 rounded-2xl md:bg-transparent md:p-0 md:border-0 text-sm text-gray-300 hover:text-brand-blue transition-all active:scale-[0.98] min-h-[48px] md:min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                <div className="flex items-center gap-3">
                  <InstagramLogo size={22} className="text-pink-500 shrink-0" aria-hidden="true" />
                  <span className="font-semibold text-white md:font-normal md:text-gray-400">
                    {social.instagram.label}
                  </span>
                </div>
                <CaretRight size={16} className="text-gray-600 md:hidden shrink-0" aria-hidden="true" />
              </a>
            </li>

            <li>
              <a
                href={social.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.whatsapp.accessibleName}
                className="flex items-center justify-between sm:justify-start gap-3 p-3.5 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 hover:border-gray-700 rounded-2xl md:bg-transparent md:p-0 md:border-0 text-sm text-gray-300 hover:text-emerald-400 transition-all active:scale-[0.98] min-h-[48px] md:min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                <div className="flex items-center gap-3">
                  <WhatsappLogo size={22} className="text-[#25D366] shrink-0" aria-hidden="true" />
                  <span className="font-semibold text-white md:font-normal md:text-gray-400">
                    {social.whatsapp.label}
                  </span>
                </div>
                <CaretRight size={16} className="text-gray-600 md:hidden shrink-0" aria-hidden="true" />
              </a>
            </li>

            <li>
              <button
                type="button"
                aria-label={social.facebook.accessibleName}
                aria-describedby={fbDescId}
                onClick={() => openNotice(social.facebook.message)}
                className="flex items-center justify-between sm:justify-start gap-3 p-3.5 bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800/60 hover:border-gray-700 rounded-2xl md:bg-transparent md:p-0 md:border-0 text-sm text-gray-400 hover:text-brand-blue transition-all active:scale-[0.98] min-h-[48px] md:min-h-[44px] w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FacebookLogo size={22} className="text-blue-500 shrink-0" aria-hidden="true" />
                  <span>{social.facebook.label}</span>
                </div>
                <span
                  id={fbDescId}
                  className="rounded-full bg-gray-800/90 border border-gray-700/80 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-gray-400 shrink-0"
                >
                  {social.facebook.status}
                </span>
              </button>
            </li>

            <li>
              <button
                type="button"
                aria-label={social.youtube.accessibleName}
                aria-describedby={ytDescId}
                onClick={() => openNotice(social.youtube.message)}
                className="flex items-center justify-between sm:justify-start gap-3 p-3.5 bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800/60 hover:border-gray-700 rounded-2xl md:bg-transparent md:p-0 md:border-0 text-sm text-gray-400 hover:text-red-400 transition-all active:scale-[0.98] min-h-[48px] md:min-h-[44px] w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <YoutubeLogo size={22} className="text-red-500 shrink-0" aria-hidden="true" />
                  <span>{social.youtube.label}</span>
                </div>
                <span
                  id={ytDescId}
                  className="rounded-full bg-gray-800/90 border border-gray-700/80 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-gray-400 shrink-0"
                >
                  {social.youtube.status}
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-5 text-sm text-gray-500">
          <p className="text-center md:text-left text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
            {copyright}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              to="/gestao/entrar"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-full border border-gray-800 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <LockKey size={14} className="text-brand-blue shrink-0" aria-hidden="true" />
              <span>Acesso ao sistema</span>
            </Link>

            {legalLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => openNotice(link.message)}
                className="inline-flex items-center px-3 py-2 bg-gray-900/50 hover:bg-gray-800/70 text-gray-400 hover:text-white text-xs font-medium rounded-full border border-gray-800/60 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
