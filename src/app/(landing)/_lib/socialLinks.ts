import type { LandingPage } from '@/payload-types'
import { landingDefaults } from '@/LandingPage/defaults'

export type SocialLink = { id?: string | null; icon: string; label?: string | null; url: string }

/** Social links from Hlavní stránka → Patička, or the association's accounts when none are set. */
export function resolveSocialLinks(footer: LandingPage['footer']): SocialLink[] {
  return footer?.socialLinks && footer.socialLinks.length > 0
    ? footer.socialLinks
    : landingDefaults.footer.socialLinks.map((link) => ({ ...link }))
}
