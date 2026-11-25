import React from 'react'
import type { Metadata } from 'next'

import { SiteShell } from './_components/SiteShell'
import { buildSiteMetadata } from './_lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata()
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
