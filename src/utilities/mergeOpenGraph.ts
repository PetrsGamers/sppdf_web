import type { Metadata } from 'next'
import { siteDefaults } from '@/SiteSettings/defaults'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'cs_CZ',
  description: siteDefaults.seo.defaultDescription,
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: siteDefaults.siteName,
  title: siteDefaults.seo.defaultTitle,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
