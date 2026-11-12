import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Media } from '@/payload-types'
import { aboutDefaults as D } from '@/AboutPage/defaults'

import { renderHighlighted } from '../_components/highlight'
import { getGlobal } from '../_lib/getGlobal'

/** Internal links use next/link, anything else (external, #, mailto:) a plain <a>. */
function SmartLink({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise })

  const [about, teamData] = await Promise.all([
    getGlobal('about-page'),
    payload.find({
      collection: 'team-members',
      sort: 'order',
      limit: 100,
      pagination: false,
    }),
  ])

  const teamMembers = teamData.docs

  const intro = about.intro
  const badge = intro?.badge ?? D.intro.badge
  const headline = intro?.headline || D.intro.headline
  const introText = intro?.text ?? D.intro.text
  const storyLinkLabel = intro?.storyLinkLabel ?? D.intro.storyLinkLabel

  const features = about.features?.items ?? []
  const historyHeading = about.history?.heading || D.history.heading
  const milestones = about.history?.items ?? []
  const teamHeading = about.team?.heading || D.team.heading
  const teamDescription = about.team?.description ?? D.team.description

  const cta = about.cta
  const ctaHeading = cta?.heading ?? D.cta.heading
  const ctaText = cta?.text ?? D.cta.text
  const ctaPrimaryLabel = cta?.primaryLabel ?? D.cta.primaryLabel
  const ctaPrimaryLink = cta?.primaryLink || D.cta.primaryLink
  const ctaSecondaryLabel = cta?.secondaryLabel ?? D.cta.secondaryLabel
  const ctaSecondaryLink = cta?.secondaryLink || D.cta.secondaryLink
  const showCta = Boolean(ctaHeading || ctaText || ctaPrimaryLabel || ctaSecondaryLabel)

  return (
    <>
      {/* Hero */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-28 overflow-hidden bg-stone-50/50">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-5 blur-3xl bg-primary rounded-full transform translate-x-1/4 -translate-y-1/4" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold tracking-wide uppercase mb-8">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                groups
              </span>
              {badge}
            </div>
          )}
          <h1 className="text-6xl md:text-8xl font-black font-headline leading-[0.9] tracking-tighter text-on-surface mb-6">
            {renderHighlighted(headline)}
          </h1>
          {introText && (
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              {introText}
            </p>
          )}
          {storyLinkLabel && milestones.length > 0 && (
            <div className="mt-8">
              <a
                href="#historie"
                className="inline-flex items-center gap-2 text-primary font-bold font-headline hover:gap-4 transition-all"
              >
                {storyLinkLabel}
                <span aria-hidden="true" className="material-symbols-outlined">
                  arrow_downward
                </span>
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Three-column features */}
      {features.length > 0 && (
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={feature.id ?? i}
                  className="bg-white rounded-[2rem] p-10 shadow-sm border border-stone-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                >
                  <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-6">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-primary text-4xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black font-headline tracking-tighter mb-4">
                    {feature.title}
                  </h3>
                  {feature.description && (
                    <p className="text-on-surface-variant leading-relaxed">{feature.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline "Naše historie" */}
      {milestones.length > 0 && (
        <section id="historie" className="py-24 scroll-mt-24">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-16 text-center text-on-surface">
              {renderHighlighted(historyHeading)}
            </h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-stone-200 -translate-x-1/2" />

              {milestones.map((milestone, i) => (
                <div
                  key={milestone.id ?? i}
                  className={`relative flex items-start mb-16 last:mb-0 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-primary rounded-full -translate-x-1/2 mt-2 ring-4 ring-white z-10" />

                  {/* Content */}
                  <div
                    className={`ml-14 md:ml-0 md:w-1/2 ${
                      i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'
                    }`}
                  >
                    <span className="text-sm font-black text-primary font-headline tracking-widest uppercase">
                      {milestone.year}
                    </span>
                    <h3 className="text-2xl font-black font-headline tracking-tighter mt-1 mb-2">
                      {milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="text-on-surface-variant leading-relaxed">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team "Náš tým" – hidden until at least one member exists in "Členové týmu" */}
      {teamMembers.length > 0 && (
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-4 text-on-surface">
                {renderHighlighted(teamHeading)}
              </h2>
              {teamDescription && (
                <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
                  {teamDescription}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {teamMembers.map((member) => {
                const photo = typeof member.photo === 'object' ? (member.photo as Media | null) : null
                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 text-center hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
                  >
                    {photo?.url ? (
                      <img
                        alt={photo.alt || member.name}
                        className="w-28 h-28 rounded-full object-cover mx-auto mb-6 ring-4 ring-stone-100 group-hover:ring-primary/20 transition-all"
                        src={photo.url}
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-surface-container-high mx-auto mb-6 flex items-center justify-center ring-4 ring-stone-100 group-hover:ring-primary/20 transition-all">
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined text-4xl text-on-surface-variant"
                        >
                          person
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-black font-headline tracking-tight">
                      {member.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">{member.role}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {showCta && (
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-stone-900 rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
              <div className="relative z-10">
                {ctaHeading && (
                  <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-white mb-4">
                    {ctaHeading}
                  </h2>
                )}
                {ctaText && (
                  <p className="text-stone-400 text-lg mb-10 max-w-xl mx-auto">{ctaText}</p>
                )}
                <div className="flex flex-wrap gap-4 justify-center">
                  {ctaPrimaryLabel && (
                    <SmartLink
                      href={ctaPrimaryLink}
                      className="hero-gradient text-on-primary px-8 py-4 rounded-xl font-headline font-extrabold text-lg flex items-center gap-2 transition-transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary/20"
                    >
                      {ctaPrimaryLabel}
                      <span aria-hidden="true" className="material-symbols-outlined">
                        arrow_forward
                      </span>
                    </SmartLink>
                  )}
                  {ctaSecondaryLabel && (
                    <SmartLink
                      href={ctaSecondaryLink}
                      className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-headline font-extrabold text-lg hover:bg-white/20 transition-all active:scale-95"
                    >
                      {ctaSecondaryLabel}
                    </SmartLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
