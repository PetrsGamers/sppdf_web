import type { LandingPage } from '@/payload-types'
import { landingDefaults } from '@/LandingPage/defaults'

import { withCurrentYear } from './highlight'

const D = landingDefaults.footer

export type Brand = {
  name: string
  logoUrl: string
  logoAlt: string
}

type Props = {
  footer: LandingPage['footer']
  brand: Brand
}

type SocialLink = { id?: string | null; icon: string; label?: string | null; url: string }
type LinkColumn = {
  id?: string | null
  heading: string
  links?: { id?: string | null; label: string; url: string }[] | null
}

export function LandingFooter({ footer, brand }: Props) {
  const description = footer?.description ?? D.description
  const socialLinks: SocialLink[] =
    footer?.socialLinks && footer.socialLinks.length > 0
      ? footer.socialLinks
      : D.socialLinks.map((link) => ({ ...link }))
  const linkColumns: LinkColumn[] =
    footer?.linkColumns && footer.linkColumns.length > 0
      ? footer.linkColumns
      : D.linkColumns.map((column) => ({
          heading: column.heading,
          links: column.links.map((link) => ({ ...link })),
        }))
  const copyright = withCurrentYear(footer?.copyright ?? D.copyright)
  const credit = footer?.credit ?? D.credit

  return (
    <footer className="bg-stone-50 border-t border-stone-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8 py-16">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <img alt={brand.logoAlt} className="h-8 w-8 object-contain" src={brand.logoUrl} />
            {brand.name && <span className="text-xl font-bold text-stone-900">{brand.name}</span>}
          </div>
          {description && (
            <p className="text-stone-500 text-sm leading-relaxed max-w-sm">{description}</p>
          )}
          {socialLinks.length > 0 && (
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a
                  key={social.id ?? i}
                  aria-label={social.label || social.icon}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-primary transition-colors"
                  href={social.url}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
        {linkColumns.map((column, i) => (
          <div key={column.id ?? i} className="space-y-6">
            <h4 className="font-bold text-stone-900">{column.heading}</h4>
            <ul className="space-y-4">
              {column.links?.map((link, j) => (
                <li key={link.id ?? j}>
                  <a
                    className="text-stone-500 hover:text-primary transition-colors text-sm"
                    href={link.url}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-8 pb-12 border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {copyright && <p className="text-stone-500 text-sm">{copyright}</p>}
        {credit && (
          <div className="flex gap-6">
            <span className="text-stone-400 text-xs">{credit}</span>
          </div>
        )}
      </div>
    </footer>
  )
}
