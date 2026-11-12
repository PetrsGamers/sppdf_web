import type { LandingPage } from '@/payload-types'
import { landingDefaults as D } from '@/LandingPage/defaults'

type Props = {
  ribbon: LandingPage['ribbon']
}

export function EventRibbon({ ribbon }: Props) {
  const items =
    ribbon?.items && ribbon.items.length > 0
      ? ribbon.items.map((item) => item.text)
      : D.ribbon.items

  return (
    <section className="bg-primary py-6 overflow-hidden">
      <div className="flex whitespace-nowrap gap-12 animate-scroll items-center">
        {[...items, ...items].map((text, i) => (
          <div
            key={i}
            className="flex items-center gap-4 text-white font-headline font-extrabold text-xl uppercase tracking-widest"
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            {text}
          </div>
        ))}
      </div>
    </section>
  )
}
