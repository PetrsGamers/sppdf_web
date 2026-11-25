import type { Payload, PayloadRequest, TaskHandler } from 'payload'

import type { Event } from '@/payload-types'

import { formatDuration, TIME_ZONE, toSlug } from './syncGoogleCalendar'

const GRAPH_API = 'https://graph.facebook.com/v27.0'
const FIELDS = 'id,name,description,start_time,end_time,place,ticket_uri,is_canceled,event_times'

type FacebookPlace = {
  name?: string
  location?: { street?: string; city?: string }
}

export type FacebookEvent = {
  id: string
  name: string
  description?: string
  start_time: string
  end_time?: string
  place?: FacebookPlace
  ticket_uri?: string
  is_canceled?: boolean
  event_times?: { id: string; start_time: string; end_time?: string }[]
}

type EventData = {
  title: string
  slug: string
  date: string
  time: string
  duration?: string
  location?: string
  description?: string
  registrationUrl: string
  facebookEventId: string
}

const DATE_PART = /^\d{1,2}\.\s*\d{1,2}\.\s*(\d{2,4})?$/
const ORG_PART = /^sp-?pdf( muni?)?$/i

/**
 * Event names on the Page look like "BRNO EXPRESS // 23.9.2026 // SP-PDF MUNI". The site shows
 * the date anyway and is the association's own, so drop the date and the bare organisation name,
 * but keep other parts ("// 2.KOLO 10.SEZÓNA").
 */
export function cleanTitle(name: string): string {
  const parts = name
    .split('//')
    .map((part) => part.trim())
    .filter((part) => part && !DATE_PART.test(part) && !ORG_PART.test(part))
  return parts.join(' // ') || name.trim()
}

const SOCIAL_HOSTS = /(^|\.)(facebook\.com|fb\.me|instagram\.com)$/

/** The association puts its sign-up link (a Google form or sheet) into the event description. */
export function registrationLinkFrom(description: string | undefined): string | undefined {
  for (const match of description?.matchAll(/https?:\/\/[^\s<>"')\]]+/g) ?? []) {
    const url = match[0].replace(/[.,;:!?]+$/, '')
    try {
      if (!SOCIAL_HOSTS.test(new URL(url).hostname)) return url
    } catch {
      continue
    }
  }
  return undefined
}

/**
 * One website event per date. A Facebook event that repeats on several dates lists them in
 * `event_times`, each with its own id and page on Facebook.
 */
export function toEventData(event: FacebookEvent): EventData[] {
  const occurrences =
    event.event_times && event.event_times.length > 0
      ? event.event_times
      : [{ id: event.id, start_time: event.start_time, end_time: event.end_time }]

  return occurrences.map((occurrence) => {
    const start = new Date(occurrence.start_time)
    const end = occurrence.end_time ? new Date(occurrence.end_time) : undefined
    const title = cleanTitle(event.name)
    return {
      title,
      slug: toSlug(`${title}-fb-${occurrence.id}`),
      date: start.toISOString(),
      time: start.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: TIME_ZONE,
      }),
      duration: end ? formatDuration(start, end, false) : undefined,
      location: formatPlace(event.place),
      description: event.description || undefined,
      registrationUrl:
        event.ticket_uri ||
        registrationLinkFrom(event.description) ||
        `https://www.facebook.com/events/${occurrence.id}`,
      facebookEventId: occurrence.id,
    }
  })
}

function formatPlace(place: FacebookPlace | undefined): string | undefined {
  if (!place) return undefined
  const parts = [place.name, place.location?.street, place.location?.city].filter(
    (part): part is string => Boolean(part),
  )
  return [...new Set(parts)].join(', ') || undefined
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

async function fetchUpcomingEvents(pageId: string, token: string): Promise<FacebookEvent[]> {
  const events: FacebookEvent[] = []
  const params = new URLSearchParams({
    fields: FIELDS,
    time_filter: 'upcoming',
    limit: '100',
    access_token: token,
  })
  let url: string | undefined = `${GRAPH_API}/${pageId}/events?${params}`

  while (url) {
    const response = await fetch(url)
    const body = (await response.json()) as {
      data?: FacebookEvent[]
      paging?: { next?: string }
      error?: { message?: string; code?: number }
    }
    if (!response.ok || body.error) {
      // Never log the URL: it carries the access token.
      throw new Error(
        `Facebook Graph API error ${body.error?.code ?? response.status}: ${body.error?.message ?? 'unknown'}`,
      )
    }
    events.push(...(body.data ?? []))
    url = body.paging?.next
  }

  return events
}

/** A published Google Calendar event on the same Prague day with the same title, if any. */
async function findGoogleTwin(
  payload: Payload,
  req: PayloadRequest,
  data: EventData,
): Promise<Event | undefined> {
  const day = pragueDay(data.date)
  const from = new Date(new Date(data.date).getTime() - 36 * 60 * 60 * 1000).toISOString()
  const to = new Date(new Date(data.date).getTime() + 36 * 60 * 60 * 1000).toISOString()
  const candidates = await payload.find({
    collection: 'events',
    where: {
      and: [
        { googleCalendarEventId: { exists: true } },
        { date: { greater_than_equal: from } },
        { date: { less_than_equal: to } },
      ],
    },
    limit: 20,
    req,
  })
  return candidates.docs.find(
    (doc) => pragueDay(doc.date) === day && sameTitle(doc.title, data.title),
  )
}

export const importFacebookEventsHandler: TaskHandler<'importFacebookEvents'> = async ({ req }) => {
  const { payload } = req
  const pageId = process.env.FACEBOOK_PAGE_ID
  const token = process.env.FACEBOOK_PAGE_TOKEN

  if (!pageId || !token) {
    payload.logger.info('Facebook import skipped: FACEBOOK_PAGE_ID or FACEBOOK_PAGE_TOKEN is not set.')
    return { output: { created: 0, updated: 0, linked: 0 } }
  }

  const facebookEvents = await fetchUpcomingEvents(pageId, token)
  const seenIds = new Set<string>()
  let created = 0
  let updated = 0
  let linked = 0
  let failed = 0

  for (const event of facebookEvents) {
    if (event.is_canceled) continue

    for (const data of toEventData(event)) {
      seenIds.add(data.facebookEventId)
      try {
        const existing = await payload.find({
          collection: 'events',
          where: { facebookEventId: { equals: data.facebookEventId } },
          limit: 1,
          req,
        })
        const doc = existing.docs[0]

        // Events that also come from Google Calendar belong to that sync: only add the
        // Facebook id and, if missing, the registration link.
        if (doc?.googleCalendarEventId) continue

        const twin = await findGoogleTwin(payload, req, data)
        if (twin) {
          // A copy created earlier (e.g. before the date was fixed on Facebook) would show the
          // event twice, and it holds the unique Facebook id the twin needs.
          if (doc) {
            await payload.delete({
              collection: 'events',
              id: doc.id,
              context: { disableRevalidate: true },
              req,
            })
          }
          await payload.update({
            collection: 'events',
            id: twin.id,
            data: {
              facebookEventId: data.facebookEventId,
              ...(!twin.registrationUrl && { registrationUrl: data.registrationUrl }),
            },
            context: { disableRevalidate: true },
            req,
          })
          linked++
          continue
        }

        if (doc) {
          const { registrationUrl, ...synced } = data
          await payload.update({
            collection: 'events',
            id: doc.id,
            // Editors may replace the registration link (e.g. with a form), so keep theirs.
            data: {
              ...synced,
              ...(!doc.registrationUrl && { registrationUrl }),
              _status: 'published',
            },
            context: { disableRevalidate: true },
            req,
          })
          updated++
          continue
        }

        await payload.create({
          collection: 'events',
          data: { ...data, _status: 'published' },
          draft: false,
          context: { disableRevalidate: true },
          req,
        })
        created++
      } catch (error) {
        failed++
        payload.logger.error(
          `Facebook import: failed to save event "${data.title}" (${data.facebookEventId}): ${String(error)}`,
        )
      }
    }
  }

  // Unpublish upcoming Facebook-only events that were cancelled or deleted on Facebook.
  let unpublished = 0
  const stale = await payload.find({
    collection: 'events',
    where: {
      and: [
        { facebookEventId: { exists: true } },
        { googleCalendarEventId: { exists: false } },
        { _status: { equals: 'published' } },
        { date: { greater_than_equal: new Date().toISOString() } },
      ],
    },
    pagination: false,
    req,
  })
  for (const doc of stale.docs) {
    if (doc.facebookEventId && !seenIds.has(doc.facebookEventId)) {
      await payload.update({
        collection: 'events',
        id: doc.id,
        data: { _status: 'draft' },
        context: { disableRevalidate: true },
        req,
      })
      unpublished++
    }
  }

  payload.logger.info(
    `Facebook import complete: ${created} created, ${updated} updated, ${linked} linked to Google Calendar events, ${unpublished} unpublished, ${failed} failed`,
  )

  return { output: { created, updated, linked } }
}
