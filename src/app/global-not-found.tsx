import type { Metadata } from 'next'

import { NotFoundContent } from './(landing)/_components/NotFoundContent'
import { SiteShell } from './(landing)/_components/SiteShell'
import { buildSiteMetadata } from './(landing)/_lib/metadata'

// URLs that match no route at all (e.g. /a/b/c) skip every layout and render this instead.
export async function generateMetadata(): Promise<Metadata> {
  return buildSiteMetadata()
}

export default function GlobalNotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  )
}
