import { describe, expect, it } from 'vitest'

import { mediaSrcSet } from '@/app/(landing)/_lib/mediaSrcSet'
import type { Media } from '@/payload-types'

const media = (overrides: Partial<Media>): Media =>
  ({ id: 1, alt: '', updatedAt: '', createdAt: '', ...overrides }) as Media

describe('mediaSrcSet', () => {
  it('lists the generated variants and the original by width', () => {
    const srcSet = mediaSrcSet(
      media({
        url: '/api/media/file/a.jpg',
        width: 1600,
        sizes: {
          thumbnail: { url: '/api/media/file/a-300.jpg', width: 300 },
          small: { url: '/api/media/file/a-600.jpg', width: 600 },
          large: { url: '/api/media/file/a-1400.jpg', width: 1400 },
          xlarge: { url: null, width: null },
        },
      }),
    )
    expect(srcSet).toBe(
      '/api/media/file/a-300.jpg 300w, /api/media/file/a-600.jpg 600w, /api/media/file/a-1400.jpg 1400w, /api/media/file/a.jpg 1600w',
    )
  })

  it('returns nothing when there is no smaller variant to choose from', () => {
    expect(mediaSrcSet(media({ url: '/api/media/file/a.jpg', width: 200, sizes: {} }))).toBeUndefined()
    expect(mediaSrcSet(null)).toBeUndefined()
  })
})
