import React, { useEffect } from 'react'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { BrandsMarquee } from '../components/BrandsMarquee'
import { Services } from '../components/Services'
import { CustomerAppTeaser } from '../components/CustomerAppTeaser'
import { About } from '../components/About'
import { LocationMap } from '../components/LocationMap'
import { Footer } from '../components/Footer'

export function LandingPage() {
  useEffect(() => {
    const reveals = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    reveals.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <BrandsMarquee />
        <Services />
        <CustomerAppTeaser />
        <About />
        <LocationMap />
      </main>
      <Footer />
    </>
  )
}
