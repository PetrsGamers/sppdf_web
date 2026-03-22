import { Plus_Jakarta_Sans } from 'next/font/google'
import React from 'react'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { LandingNav } from './_components/LandingNav'
import { LandingFooter } from './_components/LandingFooter'

import './landing.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SPPDF | Spolek přátel pedagogické fakulty',
  description:
    'Jsme komunita, která propojuje studenty a pedagogy. Tvoříme prostředí pro sdílení zkušeností a radosti z učitelského povolání.',
}

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })
  const landingPage = await payload.findGlobal({ slug: 'landing-page' })

  return (
    <html lang="cs" className={plusJakarta.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
        <LandingNav nav={landingPage.nav} />
        {children}
        <LandingFooter footer={landingPage.footer} />
      </body>
    </html>
  )
}
