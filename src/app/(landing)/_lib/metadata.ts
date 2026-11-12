import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { siteDefaults } from '@/SiteSettings/defaults'

import { getGlobal } from './getGlobal'

type PageSeo =
  | {
      title?: string | null
      description?: string | null
      image?: (number | null) | Media
    }
  | null
  | undefined

/** Best URL of an uploaded image for social previews (the 1200×630 "og" crop when available). */
export function mediaUrl(media: (number | null) | Media | undefined): string | undefined {
  if (!media || typeof media !== 'object') return undefined
  return media.sizes?.og?.url || media.url || undefined
}

/**
 * Builds Next.js metadata for a (landing) page from its "SEO a sdílení" tab, falling back to
 * the defaults in "Nastavení webu". Relative image URLs resolve against `metadataBase`
 * set in the (landing) layout.
 */
export async function buildPageMetadata(seo: PageSeo, path: string): Promise<Metadata> {
  const settings = await getGlobal('site-settings')

  const siteName = settings.siteName || siteDefaults.siteName
  const title = seo?.title || settings.seo?.defaultTitle || siteDefaults.seo.defaultTitle
  const description =
    seo?.description || settings.seo?.defaultDescription || siteDefaults.seo.defaultDescription
  const image = mediaUrl(seo?.image) || mediaUrl(settings.seo?.ogImage)
  const images = image ? [{ url: image }] : undefined

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'cs_CZ',
      siteName,
      title,
      description,
      url: path,
      images,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
  }
}
