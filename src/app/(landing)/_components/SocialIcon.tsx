import { Facebook, Instagram } from 'lucide-react'

import type { SocialLink } from '../_lib/socialLinks'

/** Brand logo for Facebook and Instagram links (Material Symbols has none), otherwise the chosen symbol. */
export function SocialIcon({ link, size }: { link: SocialLink; size: number }) {
  const host = hostOf(link.url)
  if (host.endsWith('facebook.com')) return <Facebook aria-hidden="true" size={size} />
  if (host.endsWith('instagram.com')) return <Instagram aria-hidden="true" size={size} />
  return (
    <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: size }}>
      {link.icon}
    </span>
  )
}

export function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url)
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}
