import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { List, X, SignIn } from '@phosphor-icons/react'
import { BrandLogo } from './BrandLogo'
import { NAV_LINKS, COMPANY } from '../constants/company'

function MobileMenu({ open, onClose }) {
  const closeBtnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      closeBtnRef.current?.focus()
      return () => {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      id="mobile-menu"
      ref={menuRef}
      aria-hidden={!open}
      className={`lg:hidden fixed inset-0 bg-white z-40 flex flex-col pt-[calc(6rem+env(safe-area-inset-top))] px-6 overflow-y-auto transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label="Fechar menu"
        className="absolute top-6 right-6 text-2xl"
      >
        <X size={28} aria-hidden="true" />
      </button>

      <nav className="flex flex-col gap-6 text-2xl font-bold tracking-tight">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="hover:text-brand-navy transition-colors py-1"
          >
            {link.label}
          </a>
        ))}

        <Link
          to="/cliente/entrar"
          onClick={onClose}
          className="mt-8 flex items-center justify-center gap-2 bg-black text-white px-6 py-4 text-lg hover:bg-gray-800 transition-colors rounded-sm"
        >
          <SignIn size={24} aria-hidden="true" />
          Acesso Cliente
        </Link>
      </nav>
    </div>,
    document.body
  )
}

function useScrolled(threshold = 50) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}

export function Header() {
  const isScrolled = useScrolled(50)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      className={`fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 pt-[env(safe-area-inset-top)] ${
        isScrolled
          ? 'shadow-md h-[calc(4rem+env(safe-area-inset-top))]'
          : 'h-[calc(5rem+env(safe-area-inset-top))]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <a
          href="#topo"
          className="flex items-center gap-2 group min-w-0 relative pb-1"
          aria-label="Mecânica Gabriel — página inicial"
        >
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-0.5 w-10 bg-brand-blue"
          />
          <BrandLogo nameClassName="text-sm sm:text-xl whitespace-normal leading-tight" />
        </a>

        <nav className="hidden lg:flex items-center gap-8 font-medium text-sm" aria-label="Menu principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-brand-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            to="/cliente/entrar"
            className="hidden sm:flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors rounded-sm"
          >
            <SignIn size={18} aria-hidden="true" />
            Acesso Cliente
          </Link>

          <button
            type="button"
            className="lg:hidden text-2xl p-1"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <List size={28} aria-hidden="true" />
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
