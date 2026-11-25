import type { Metadata } from 'next'
import React from 'react'

import { SiteShell } from '@/app/(landing)/_components/SiteShell'
import { buildSiteMetadata } from '@/app/(landing)/_lib/metadata'
import { Providers } from '@/providers'

// Template routes (/posts, /search, /[slug]) are not part of the site, but their 404 page is
// what visitors see for unknown single-segment URLs, so this group uses the site's shell too.
export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata()
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      <Providers>{children}</Providers>
    </SiteShell>
  )
}
