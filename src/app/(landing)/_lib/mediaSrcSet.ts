import type { Media } from '@/payload-types'

const WIDTH_VARIANTS = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

/**
 * `srcSet` built from the resized variants Payload generates on upload (`imageSizes` in
 * Media.ts), so browsers fetch a size that fits instead of the original. Payload skips variants
 * wider than the original, and the original itself stays in the set as the largest candidate.
 */
export function mediaSrcSet(media: Media | null | undefined): string | undefined {
  if (!media) return undefined

  const candidates = WIDTH_VARIANTS.flatMap((name) => {
    const variant = media.sizes?.[name]
    return variant?.url && variant.width ? [`${variant.url} ${variant.width}w`] : []
  })
  if (media.url && media.width) candidates.push(`${media.url} ${media.width}w`)

  return candidates.length > 1 ? candidates.join(', ') : undefined
}
