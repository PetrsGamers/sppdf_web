import type { LandingPage } from '@/payload-types'

type Props = {
  ribbon: LandingPage['ribbon']
}

const defaultItems = [
  'Připojte se k SPPDF rodině!',
  'Učitelský večírek 2024',
  'Konference Pedagogika 2.0',
  'Workshop: Moderní metody',
  'Připojte se k SPPDF rodině!',
]

export function EventRibbon({ ribbon }: Props) {
  const items =
    ribbon?.items && ribbon.items.length > 0
      ? ribbon.items.map((item) => item.text)
      : defaultItems

  return (
    <section className="bg-primary py-6 overflow-hidden">
      <div className="flex whitespace-nowrap gap-12 animate-scroll items-center">
        {[...items, ...items].map((text, i) => (
          <div
            key={i}
            className="flex items-center gap-4 text-white font-headline font-extrabold text-xl uppercase tracking-widest"
          >
            <span
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
