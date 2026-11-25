import { Plus_Jakarta_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import React from 'react'

import type { Media } from '@/payload-types'
import { siteDefaults } from '@/SiteSettings/defaults'

import { getGlobal } from '../_lib/getGlobal'
import { LandingFooter, type Brand } from './LandingFooter'
import { LandingNav } from './LandingNav'

import '../landing.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

// Self-hosted instead of fonts.googleapis.com (GDPR). Full glyph set: editors pick icons by name.
const materialSymbols = localFont({
  src: '../../../fonts/material-symbols-outlined.woff2',
  variable: '--font-material-symbols',
  weight: '100 700',
  display: 'block',
})

/**
 * The site's <html> with fonts, styles, navigation and footer. The app has several root
 * layouts ((landing), the template's (frontend)) plus global-not-found, and all of them use it.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [landingPage, settings] = await Promise.all([
    getGlobal('landing-page'),
    getGlobal('site-settings'),
  ])
  const logo = typeof settings.logo === 'object' ? (settings.logo as Media | null) : null
  const brand: Brand = {
    name: settings.siteName ?? siteDefaults.siteName,
    logoUrl: logo?.url || siteDefaults.logoUrl,
    logoAlt: logo?.alt || `Logo ${settings.siteName || siteDefaults.siteName}`,
  }

  return (
    <html lang="cs" className={`${plusJakarta.variable} ${materialSymbols.variable}`}>
      <body className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
        <LandingNav nav={landingPage.nav} brand={brand} />
        {children}
        <LandingFooter footer={landingPage.footer} brand={brand} />
      </body>
    </html>
  )
}
