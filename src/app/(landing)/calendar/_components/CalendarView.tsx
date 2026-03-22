'use client'

import { useState, useMemo, useEffect } from 'react'
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

const MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]

const DAY_NAMES = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

export function CalendarView({ events }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
    setSelectedDay(null)
  }

  const eventsByDay = useMemo(() => {
    const map: Record<number, Event[]> = {}
    events.forEach((event) => {
      const d = new Date(event.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day]!.push(event)
      }
    })
    return map
  }, [events, year, month])

  // Auto-select first day with events when month changes
  useEffect(() => {
    const firstEventDay = Object.keys(eventsByDay)
      .map(Number)
      .sort((a, b) => a - b)[0]
    if (firstEventDay) {
      setSelectedDay(firstEventDay)
    }
  }, [eventsByDay])

  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarCells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] ?? [] : []

  const academicYear =
    month >= 8
      ? `${year}/${String(year + 1).slice(2)}`
      : `${year - 1}/${String(year).slice(2)}`

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            school
          </span>
          <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">
            Akademický rok {academicYear}
          </span>
        </div>
        <div className="flex items-center gap-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
            {MONTH_NAMES[month]} {year}
          </h1>
          <div className="flex gap-1.5 ml-4">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-surface-container-high hover:border-transparent transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-surface-container-high hover:border-transparent transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Two-column layout: Calendar + Event Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Calendar Grid — left column (3/5) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7">
                {DAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-xs font-bold text-on-surface-variant/60 tracking-wider uppercase"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {calendarCells.map((day, i) => {
                  const dayEvents = day !== null ? eventsByDay[day] : undefined
                  const hasEvents = !!dayEvents
                  const isSelected = day !== null && day === selectedDay
                  const isToday =
                    day !== null &&
                    year === now.getFullYear() &&
                    month === now.getMonth() &&
                    day === now.getDate()

                  return (
                    <button
                      key={i}
                      onClick={() => day !== null && setSelectedDay(day === selectedDay ? null : day)}
                      disabled={day === null}
                      className={`relative aspect-square flex flex-col items-center justify-center transition-all
                        ${day === null ? 'cursor-default' : 'cursor-pointer'}
                        ${!isSelected && day !== null ? 'hover:bg-surface-container-low' : ''}
                      `}
                    >
                      {day !== null && (
                        <>
                          <div
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all
                              ${isSelected ? 'bg-primary text-on-primary shadow-lg shadow-primary/30' : ''}
                              ${isToday && !isSelected ? 'ring-2 ring-primary/30 text-primary' : ''}
                              ${!isSelected && !isToday ? 'text-on-surface' : ''}
                            `}
                          >
                            <span className="text-sm font-headline font-bold">{day}</span>
                          </div>
                          {hasEvents && !isSelected && (
                            <div className="absolute bottom-1.5 flex gap-0.5">
                              {dayEvents!.slice(0, 3).map((ev) => (
                                <div
                                  key={ev.id}
                                  className="w-1 h-1 rounded-full bg-primary"
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Event Detail Panel — right column (2/5) */}
          <div className="lg:col-span-2">
            {selectedDay !== null && selectedEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedEvents.map((event) => {
                  const colorClass =
                    categoryColorMap[event.categoryColor ?? 'orange'] ?? 'bg-stone-100 text-stone-600'
                  const eventDate = new Date(event.date)
                  const formattedDate = `${eventDate.getDate()}. ${MONTH_NAMES[eventDate.getMonth()]}`

                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl p-7 shadow-sm border border-stone-100"
                    >
                      {event.category && (
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${colorClass} text-[10px] font-bold tracking-widest uppercase mb-4`}
                        >
                          {event.category.toUpperCase()}
                        </div>
                      )}
                      <h3 className="text-2xl font-black font-headline tracking-tighter mb-5 leading-tight">
                        {event.title}
                      </h3>

                      <div className="space-y-3 mb-5">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                            calendar_today
                          </span>
                          <span className="text-on-surface-variant">
                            {formattedDate}{event.time ? `, ${event.time}` : ''}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                              location_on
                            </span>
                            <span className="text-on-surface-variant">{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                          {event.description}
                        </p>
                      )}

                      <a
                        href="#"
                        className="hero-gradient text-on-primary w-full py-3.5 rounded-xl font-headline font-extrabold flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-primary/20"
                      >
                        Registrovat se
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </a>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-stone-100 text-center">
                <div className="py-8">
                  <span className="material-symbols-outlined text-5xl text-stone-200 mb-3 block">
                    event
                  </span>
                  <p className="text-on-surface-variant text-sm">
                    {selectedDay
                      ? `Na ${selectedDay}. ${MONTH_NAMES[month]} nejsou plánovány žádné události.`
                      : 'Vyberte den v kalendáři pro zobrazení událostí.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
