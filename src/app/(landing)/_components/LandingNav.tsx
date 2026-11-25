'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { LandingPage } from '@/payload-types'
import { landingDefaults as D } from '@/LandingPage/defaults'

import type { Brand } from './LandingFooter'

type Props = {
  nav: LandingPage['nav']
  brand: Brand
}

export function LandingNav({ nav, brand }: Props) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const links: { id?: string | null; label: string; url: string }[] =
    nav?.links && nav.links.length > 0 ? nav.links : [...D.nav.links]
  const ctaLabel = nav?.ctaLabel ?? D.nav.ctaLabel
  const ctaLink = nav?.ctaLink || D.nav.ctaLink

  return (
    <nav className="bg-white/90 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm border-b border-stone-100">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        <div className="flex items-center gap-3">
          <img alt={brand.logoAlt} className="h-10 w-10 object-contain" src={brand.logoUrl} />
          {brand.name && (
            <span className="text-2xl font-black text-stone-900 tracking-tighter font-headline">
              {brand.name}
            </span>
          )}
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {links.map((link, i) => {
            const isActive = isActiveLink(link.url, pathname)
            return (
              <Link
                key={link.id ?? i}
                className={`${
                  isActive
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-stone-600 hover:text-primary transition-colors'
                } font-headline font-bold tracking-tight`}
                href={link.url}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-4">
          {ctaLabel && (
            <a
              href={ctaLink}
              className="hidden md:inline-block bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-full font-headline font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              {ctaLabel}
            </a>
          )}
          <button
            type="button"
            className="md:hidden flex items-center justify-center h-11 w-11 rounded-full text-stone-900 hover:bg-stone-100 transition-colors"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Zavřít menu' : 'Otevřít menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-stone-100 bg-white px-6 pb-6">
          <ul className="flex flex-col py-2">
            {links.map((link, i) => {
              const isActive = isActiveLink(link.url, pathname)
              return (
                <li key={link.id ?? i}>
                  <Link
                    className={`block py-3 font-headline font-bold text-lg tracking-tight ${
                      isActive ? 'text-primary' : 'text-stone-700 hover:text-primary'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    href={link.url}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          {ctaLabel && (
            <a
              href={ctaLink}
              className="block text-center bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-full font-headline font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
              onClick={() => setMenuOpen(false)}
            >
              {ctaLabel}
            </a>
          )}
        </div>
      )}
    </nav>
  )
}

function isActiveLink(url: string, pathname: string): boolean {
  return url === '/' ? pathname === '/' : pathname.startsWith(url)
}
