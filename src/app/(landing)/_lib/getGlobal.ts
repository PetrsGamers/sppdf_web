import configPromise from '@payload-config'
import { getPayload, type DataFromGlobalSlug, type GlobalSlug } from 'payload'
import { cache } from 'react'

/**
 * Reads a global once per request (React `cache`), so the layout, the page and
 * `generateMetadata` can all use it without querying the database repeatedly.
 */
export const getGlobal = cache(
  async <T extends GlobalSlug>(slug: T): Promise<DataFromGlobalSlug<T>> => {
    const payload = await getPayload({ config: configPromise })
    return (await payload.findGlobal({ slug })) as DataFromGlobalSlug<T>
  },
)
