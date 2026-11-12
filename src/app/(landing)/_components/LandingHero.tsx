import type { LandingPage, Media } from '@/payload-types'
import { landingDefaults as D } from '@/LandingPage/defaults'

import { renderHighlighted } from './highlight'

type Props = {
  hero: LandingPage['hero']
}

export function LandingHero({ hero }: Props) {
  const badge = hero?.badge ?? D.hero.badge
  const headline = hero?.headline ?? D.hero.headline
  const subtitle = hero?.subtitle ?? ''
  const ctaPrimaryLabel = hero?.ctaPrimary?.label ?? D.hero.ctaPrimary.label
  const ctaPrimaryLink = hero?.ctaPrimary?.link || D.hero.ctaPrimary.link
  const ctaSecondaryLabel = hero?.ctaSecondary?.label ?? D.hero.ctaSecondary.label
  const ctaSecondaryLink = hero?.ctaSecondary?.link || D.hero.ctaSecondary.link

  const image = typeof hero?.image === 'object' ? (hero.image as Media | null) : null
  const imageUrl = image?.url || D.hero.fallbackImageUrl
  const imageAlt = image?.alt || D.hero.imageAlt

  return (
    <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-stone-50/50">
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-5 blur-3xl bg-primary rounded-full transform translate-x-1/4 -translate-y-1/4" />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold tracking-wide uppercase">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              {badge}
            </div>
          )}
          <h1 className="text-6xl md:text-8xl font-black font-headline leading-[0.9] tracking-tighter text-on-surface">
            {renderHighlighted(headline)}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            {ctaPrimaryLabel && (
              <a
                href={ctaPrimaryLink}
                className="hero-gradient text-on-primary px-8 py-4 rounded-xl font-headline font-extrabold text-lg flex items-center gap-2 transition-transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary/20"
              >
                {ctaPrimaryLabel}
                <span aria-hidden="true" className="material-symbols-outlined">
                  arrow_forward
                </span>
              </a>
            )}
            {ctaSecondaryLabel && (
              <a
                href={ctaSecondaryLink}
                className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-headline font-extrabold text-lg hover:bg-surface-container transition-colors active:scale-95"
              >
                {ctaSecondaryLabel}
              </a>
            )}
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] transform rotate-3 transition-transform group-hover:rotate-6" />
          <img
            alt={imageAlt}
            className="relative z-10 w-full h-[500px] object-cover rounded-[2rem] shadow-2xl"
            src={imageUrl}
          />
        </div>
      </div>
    </header>
  )
}
