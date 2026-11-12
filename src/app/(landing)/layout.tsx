import { Plus_Jakarta_Sans } from 'next/font/google'
import React from 'react'
import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { siteDefaults } from '@/SiteSettings/defaults'
import { getServerSideURL } from '@/utilities/getURL'

import { LandingNav } from './_components/LandingNav'
import { LandingFooter, type Brand } from './_components/LandingFooter'
import { getGlobal } from './_lib/getGlobal'
import { mediaUrl } from './_lib/metadata'

import './landing.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobal('site-settings')
  const title = settings.seo?.defaultTitle || siteDefaults.seo.defaultTitle
  const description = settings.seo?.defaultDescription || siteDefaults.seo.defaultDescription
  const favicon = mediaUrl(settings.favicon) || siteDefaults.faviconUrl
  const ogImage = mediaUrl(settings.seo?.ogImage)

  return {
    metadataBase: new URL(getServerSideURL()),
    title,
    description,
    icons: { icon: favicon },
    openGraph: {
      type: 'website',
      locale: 'cs_CZ',
      siteName: settings.siteName || siteDefaults.siteName,
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
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
    <html lang="cs" className={plusJakarta.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
        <LandingNav nav={landingPage.nav} brand={brand} />
        {children}
        <LandingFooter footer={landingPage.footer} brand={brand} />
      </body>
    </html>
  )
}
