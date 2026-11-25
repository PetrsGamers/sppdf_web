'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { LandingPage, Media } from '@/payload-types'
import { landingDefaults } from '@/LandingPage/defaults'
import { mediaSrcSet } from '../_lib/mediaSrcSet'

const D = landingDefaults.divisions

type Props = {
  divisions: LandingPage['divisions']
}

export function DivisionsSection({ divisions }: Props) {
  const heading = divisions?.heading ?? D.heading
  const description = divisions?.description ?? D.description
  const items = divisions?.items ?? []
  const count = items.length

  // Desktop carousel: 2 cards per page
  const desktopPages = Math.ceil(count / 2)
  const [desktopPage, setDesktopPage] = useState(0)
  // Mobile carousel: 1 card per page
  const [mobilePage, setMobilePage] = useState(0)

  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goToDesktop = useCallback(
    (index: number) => setDesktopPage(((index % desktopPages) + desktopPages) % desktopPages),
    [desktopPages],
  )
  const goToMobile = useCallback(
    (index: number) => setMobilePage(((index % count) + count) % count),
    [count],
  )

  const nextDesktop = useCallback(() => goToDesktop(desktopPage + 1), [desktopPage, goToDesktop])
  const prevDesktop = useCallback(() => goToDesktop(desktopPage - 1), [desktopPage, goToDesktop])
  const nextMobile = useCallback(() => goToMobile(mobilePage + 1), [mobilePage, goToMobile])
  const prevMobile = useCallback(() => goToMobile(mobilePage - 1), [mobilePage, goToMobile])

  useEffect(() => {
    if (paused || count <= 1) return
    intervalRef.current = setInterval(() => {
      setDesktopPage((c) => (c + 1) % desktopPages)
      setMobilePage((c) => (c + 1) % count)
    }, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, count, desktopPages])

  if (count === 0) return null

  const renderCard = (slide: (typeof items)[number]) => {
    const slideImage = typeof slide.image === 'object' ? (slide.image as Media | null) : null
    const slideImageUrl = slideImage?.url
    const linkLabel = slide.linkLabel ?? D.linkLabel
    return (
      <div className="bg-white rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-sm border border-stone-100">
        <div className="w-full flex flex-col justify-center">
          <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-6 w-fit">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-primary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {slide.icon}
            </span>
          </div>
          <h3 className="text-3xl font-black font-headline mb-4 tracking-tighter">
            {slide.title}
          </h3>
          {slide.description && (
            <p className="text-on-surface-variant leading-relaxed mb-8">
              {slide.description}
            </p>
          )}
          {linkLabel && (
            <a
              href={slide.linkUrl || D.linkUrl}
              className="text-primary font-bold font-headline flex items-center gap-2 hover:gap-4 transition-all"
            >
              {linkLabel}
              <span aria-hidden="true" className="material-symbols-outlined">
                arrow_right_alt
              </span>
            </a>
          )}
        </div>
        <div className="w-full flex items-center">
          {slideImageUrl ? (
            <img
              alt={slideImage?.alt || slide.title}
              className="w-full h-64 object-cover rounded-3xl"
              src={slideImageUrl}
              srcSet={mediaSrcSet(slideImage)}
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-64 bg-stone-100 rounded-3xl" />
          )}
        </div>
      </div>
    )
  }

  return (
    <section
      className="bg-surface-container-low py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-4">
            {heading}
          </h2>
          {description && (
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">{description}</p>
          )}
        </div>

        {/* Desktop: 2-column carousel */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="overflow-hidden rounded-[2.5rem]">
              <div
                className="carousel-track flex"
                style={{ transform: `translateX(-${desktopPage * 100}%)` }}
              >
                {/* Group items into pages of 2 */}
                {Array.from({ length: desktopPages }).map((_, pageIdx) => (
                  <div key={pageIdx} className="w-full flex-shrink-0 px-1">
                    <div className="grid grid-cols-2 gap-10">
                      {items.slice(pageIdx * 2, pageIdx * 2 + 2).map((slide, i) => (
                        <div key={slide.id ?? pageIdx * 2 + i}>
                          {renderCard(slide)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {desktopPages > 1 && (
              <>
                <button
                  onClick={prevDesktop}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors border border-stone-100"
                  aria-label="Předchozí sekce"
                >
                  <span className="material-symbols-outlined text-on-surface">chevron_left</span>
                </button>
                <button
                  onClick={nextDesktop}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors border border-stone-100"
                  aria-label="Další sekce"
                >
                  <span className="material-symbols-outlined text-on-surface">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {desktopPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: desktopPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToDesktop(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === desktopPage
                      ? 'bg-primary w-8'
                      : 'bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Přejít na stranu ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile: single-card carousel */}
        <div className="md:hidden">
          <div className="relative">
            <div className="overflow-hidden rounded-[2.5rem]">
              <div
                className="carousel-track flex"
                style={{ transform: `translateX(-${mobilePage * 100}%)` }}
              >
                {items.map((slide, i) => (
                  <div key={slide.id ?? i} className="w-full flex-shrink-0 px-1">
                    {renderCard(slide)}
                  </div>
                ))}
              </div>
            </div>

            {count > 1 && (
              <>
                <button
                  onClick={prevMobile}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors border border-stone-100"
                  aria-label="Předchozí sekce"
                >
                  <span className="material-symbols-outlined text-on-surface">chevron_left</span>
                </button>
                <button
                  onClick={nextMobile}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors border border-stone-100"
                  aria-label="Další sekce"
                >
                  <span className="material-symbols-outlined text-on-surface">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {count > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToMobile(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === mobilePage
                      ? 'bg-primary w-8'
                      : 'bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Přejít na sekci ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
