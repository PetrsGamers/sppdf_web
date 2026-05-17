'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Event } from '@/payload-types'

type Props = {
  events: Event[]
}

const categoryColorMap: Record<string, string> = {
  orange: 'bg-orange-50 text-primary',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString('cs-CZ', { month: 'long' })
  return { day, month: month.charAt(0).toUpperCase() + month.slice(1) }
}

export function CalendarSection({ events }: Props) {
  const pageSize = 3
  const totalPages = Math.ceil(events.length / pageSize)
  const [page, setPage] = useState(0)
  const [activeId, setActiveId] = useState<number | null>(events[0]?.id ?? null)

  const pageEvents = events.slice(page * pageSize, page * pageSize + pageSize)

  const goToPage = (newPage: number) => {
    setPage(newPage)
    setActiveId(events[newPage * pageSize]?.id ?? null)
  }

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight mb-4 text-on-surface">
            Kalendář událostí
          </h2>
          <p className="text-lg text-on-surface-variant">
            Sledujte, co připravujeme na Pedagogické fakultě. Od neformálních setkání po odborné
            přednášky.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => goToPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-3 bg-white border border-stone-200 rounded-full hover:bg-surface-container-high hover:border-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => goToPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-3 bg-white border border-stone-200 rounded-full hover:bg-surface-container-high hover:border-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pageEvents.map((event) => {
          const { day, month } = formatDate(event.date)
          const colorClass = categoryColorMap[event.categoryColor ?? 'orange'] ?? 'bg-stone-100 text-stone-600'
          const isActive = activeId === event.id

          return (
            <div
              key={event.id}
              onMouseEnter={() => setActiveId(event.id)}
              onMouseLeave={() => setActiveId(events[page * pageSize]?.id ?? null)}
              className={`bg-white rounded-[2rem] p-8 flex flex-col justify-between border transition-all duration-300 min-h-[320px] ${
                isActive
                  ? 'shadow-xl border-primary/20 scale-[1.02]'
                  : 'shadow-sm border-stone-100'
              }`}
            >
              <div>
                <span className={`text-6xl font-black font-headline leading-none transition-colors duration-300 ${isActive ? 'text-primary' : 'text-stone-300'}`}>
                  {day}
                </span>
                <span className="block text-sm font-bold text-stone-400 font-headline uppercase tracking-wider mt-1">
                  {month}
                </span>
              </div>
              <div className="mt-8">
                {event.category && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${colorClass} text-[10px] font-bold tracking-widest uppercase mb-4`}>
                    {event.category.toUpperCase()}
                  </div>
                )}
                <h3 className={`text-2xl font-black font-headline mb-4 tracking-tighter transition-colors duration-300 ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-stone-500 font-bold text-sm">
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {event.location}
                    </div>
                  )}
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {event.time}
                    </div>
                  )}
                  {!event.location && !event.time && event.duration && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">event</span>
                      {event.duration}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <div className="bg-stone-900 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between border border-stone-800 hover:bg-stone-950 transition-all">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-2xl md:text-3xl font-black text-white font-headline tracking-tighter">
              Zajímá vás kompletní program?
            </h3>
            <p className="text-stone-400">
              Podívejte se na všechny plánované akce v našem interaktivním kalendáři.
            </p>
          </div>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-3 bg-white text-stone-900 px-8 py-4 rounded-xl font-headline font-extrabold text-lg hover:bg-primary hover:text-white transition-all active:scale-95"
          >
            Prohlédnout celý měsíc
            <span className="material-symbols-outlined">calendar_month</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
