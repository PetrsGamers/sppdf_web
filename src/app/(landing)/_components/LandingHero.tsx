import type { LandingPage, Media } from '@/payload-types'

type Props = {
  hero: LandingPage['hero']
}

function renderHeadline(text: string) {
  const parts = text.split(/(\{\{.*?\}\})/)
  return parts.map((part, i) => {
    const match = part.match(/^\{\{(.*)\}\}$/)
    if (match) {
      return (
        <span key={i} className="text-primary">
          {match[1]}
        </span>
      )
    }
    return part
  })
}

export function LandingHero({ hero }: Props) {
  const badge = hero?.badge ?? 'Spolek přátel pedagogické fakulty'
  const headline = hero?.headline ?? 'Inspirujeme {{budoucí}} učitele.'
  const subtitle = hero?.subtitle ?? ''
  const ctaPrimaryLabel = hero?.ctaPrimary?.label ?? 'Zapojte se do spolku'
  const ctaPrimaryLink = hero?.ctaPrimary?.link ?? '#'
  const ctaSecondaryLabel = hero?.ctaSecondary?.label ?? 'Naše vize'
  const ctaSecondaryLink = hero?.ctaSecondary?.link ?? '#'

  const image = hero?.image as Media | undefined
  const imageUrl = image?.url

  return (
    <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-stone-50/50">
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-5 blur-3xl bg-primary rounded-full transform translate-x-1/4 -translate-y-1/4" />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold tracking-wide uppercase">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            {badge}
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-headline leading-[0.9] tracking-tighter text-on-surface">
            {renderHeadline(headline)}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <a
              href={ctaPrimaryLink}
              className="hero-gradient text-on-primary px-8 py-4 rounded-xl font-headline font-extrabold text-lg flex items-center gap-2 transition-transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary/20"
            >
              {ctaPrimaryLabel}
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
            <a
              href={ctaSecondaryLink}
              className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-headline font-extrabold text-lg hover:bg-surface-container transition-colors active:scale-95"
            >
              {ctaSecondaryLabel}
            </a>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] transform rotate-3 transition-transform group-hover:rotate-6" />
          {imageUrl ? (
            <img
              alt="Hero Image SPPDF"
              className="relative z-10 w-full h-[500px] object-cover rounded-[2rem] shadow-2xl"
              src={imageUrl}
            />
          ) : (
            <img
              alt="Hero Image SPPDF"
              className="relative z-10 w-full h-[500px] object-cover rounded-[2rem] shadow-2xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNnfMFHT1LBJeSErjbGdWY56q0TOGL-n_PEyDpmnnoqcAG07pU8Pk8-bXC4NKF7iC4BKiyitAOhuZRESKWfdXUjOGdkH6w6ydTb_OcROggbHzr8C2KoLMwvbM87Tmy5vM0ZnQ8PfDqv9N_47mTJN1VklDliNVYx7DW2zpJiFAz7yDYT7fDido59YVkITGNU1cMG0bxLc5bDsU-WwJmawtzuZDsaky3FLQdKXvx_1jS84FVGcTlsTqmh0YECGMUq6m1vaMIdZ3FfvIy"
            />
          )}
        </div>
      </div>
    </header>
  )
}
