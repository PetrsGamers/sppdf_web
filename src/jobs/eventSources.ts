import type { Payload, PayloadRequest, Where } from 'payload'

import type { Event } from '@/payload-types'

/**
 * Helpers shared by the two event sources. Facebook (importFacebookEvents) is the primary source;
 * Google Calendar (syncGoogleCalendar) fills in events that are not on Facebook and keeps the
 * calendar current when the Facebook token stops working.
 */

export const TIME_ZONE = 'Europe/Prague'

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Human-readable length of an event in Czech. All-day Google Calendar events come with plain
 * dates and an exclusive end date, so a one-day event spans exactly 24 hours.
 */
export function formatDuration(start: Date, end: Date, allDay: boolean): string | undefined {
  const diffMs = end.getTime() - start.getTime()
  if (diffMs <= 0) return undefined

  if (allDay) {
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (days <= 1) return 'Celý den'
    return days < 5 ? `${days} dny` : `${days} dnů`
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffHours > 0 && diffMinutes > 0) return `${diffHours} h ${diffMinutes} min`
  if (diffHours > 0) {
    return diffHours === 1 ? '1 hodina' : diffHours < 5 ? `${diffHours} hodiny` : `${diffHours} hodin`
  }
  if (diffMinutes > 0) return `${diffMinutes} min`
  return undefined
}

/** Calendar day in Prague, e.g. "2026-12-01". */
export function pragueDay(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', { timeZone: TIME_ZONE })
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * True when two titles name the same event: equal after dropping case, accents and punctuation,
 * or one contains the other ("Ples PdF" vs "PLES PDF 2027").
 */
export function sameTitle(a: string, b: string): boolean {
  const x = normalizeTitle(a)
  const y = normalizeTitle(b)
  if (!x || !y) return false
  if (x === y) return true
  const [shorter, longer] = x.length <= y.length ? [x, y] : [y, x]
  return shorter.length >= 4 && longer.includes(shorter)
}

type Candidate = { date: string; title: string; time?: string | null }

/** Same Prague day, and either a similar title or the same start time. */
export function sameEvent(a: Candidate, b: Candidate): boolean {
  if (pragueDay(a.date) !== pragueDay(b.date)) return false
  return sameTitle(a.title, b.title) || Boolean(a.time && b.time && a.time === b.time)
}

/**
 * The event the other source already put on the site for the same occasion, if any:
 * `google` finds events from Google Calendar, `facebook` finds Facebook-only events.
 */
export async function findTwin(
  payload: Payload,
  req: PayloadRequest,
  candidate: Candidate,
  source: 'google' | 'facebook',
): Promise<Event | undefined> {
  const start = new Date(candidate.date).getTime()
  const sourceFilter: Where[] =
    source === 'google'
      ? [{ googleCalendarEventId: { exists: true } }]
      : [{ facebookEventId: { exists: true } }, { googleCalendarEventId: { exists: false } }]
  const nearby = await payload.find({
    collection: 'events',
    where: {
      and: [
        ...sourceFilter,
        { date: { greater_than_equal: new Date(start - 36 * 60 * 60 * 1000).toISOString() } },
        { date: { less_than_equal: new Date(start + 36 * 60 * 60 * 1000).toISOString() } },
      ],
    },
    limit: 20,
    req,
  })
  return nearby.docs.find((doc) => sameEvent(doc, candidate))
}
