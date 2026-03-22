'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { LandingPage } from '@/payload-types'

type Props = {
  nav: LandingPage['nav']
}

export function LandingNav({ nav }: Props) {
  const pathname = usePathname()
  const links =
    nav?.links && nav.links.length > 0
      ? nav.links
      : [
          { id: 'home', label: 'Domů', url: '/' },
          { id: 'about', label: 'O nás', url: '/aboutus' },
          { id: 'calendar', label: 'Kalendář', url: '/calendar' },
        ]
  const ctaLabel = nav?.ctaLabel ?? 'Přidat se'
  const ctaLink = nav?.ctaLink ?? '#'

  return (
    <nav className="bg-white/90 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm border-b border-stone-100">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        <div className="flex items-center gap-3">
          <img
            alt="Logo SPPDF"
            className="h-10 w-10 object-contain"
            src="/logo-sppdf.svg"
          />
          <span className="text-2xl font-black text-stone-900 tracking-tighter font-headline">
            SPPDF
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {links.map((link, i) => {
            const isActive = link.url === '/' ? pathname === '/' : pathname.startsWith(link.url)
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
          <button className="material-symbols-outlined text-stone-600 p-2 hover:bg-stone-50 rounded-lg transition-all active:scale-95">
            search
          </button>
          <a
            href={ctaLink}
            className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-full font-headline font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </nav>
  )
}
