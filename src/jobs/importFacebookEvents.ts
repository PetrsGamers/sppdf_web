import type { Payload, PayloadRequest, TaskHandler } from 'payload'

import type { Event } from '@/payload-types'

import { findTwin, formatDuration, TIME_ZONE, toSlug } from './eventSources'

const GRAPH_API = 'https://graph.facebook.com/v27.0'
const FIELDS =
  'id,name,description,start_time,end_time,place,ticket_uri,is_canceled,event_times,cover{id,source}'
const FACEBOOK_EVENT_URL = 'https://www.facebook.com/events/'
const COVER_PREFIX = 'fb-cover-'

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
  cover?: { id: string; source: string }
}

type EventData = {
  title: string
  slug: string
  date: string
  time: string
  duration?: string
  location?: string
  description?: string
  registrationUrl?: string
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
      // No fallback to the Facebook event: the site links to it separately, and the
      // registration button should only show for events people actually sign up for.
      registrationUrl: event.ticket_uri || registrationLinkFrom(event.description),
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

/**
 * Registration links the import set itself: the Facebook event page, which earlier versions used
 * as a fallback. The import may replace these, but never a link an editor entered.
 */
function isImportedLink(url: string | null | undefined): boolean {
  return !url || url.startsWith(FACEBOOK_EVENT_URL)
}

function isImportedCover(image: Event['image']): boolean {
  return !image || (typeof image === 'object' && Boolean(image.filename?.startsWith(COVER_PREFIX)))
}

/**
 * The event's cover photo as a Media document, downloaded once per Facebook photo id. Failures
 * only cost the picture, never the event.
 */
async function coverMediaId(
  payload: Payload,
  req: PayloadRequest,
  cover: FacebookEvent['cover'],
  alt: string,
  cache: Map<string, number | undefined>,
): Promise<number | undefined> {
  if (!cover?.id || !cover.source) return undefined
  if (cache.has(cover.id)) return cache.get(cover.id)

  let id: number | undefined
  try {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { like: `${COVER_PREFIX}${cover.id}` } },
      limit: 1,
      depth: 0,
      req,
    })
    if (existing.docs[0]) {
      id = existing.docs[0].id
    } else {
      const response = await fetch(cover.source)
      const mimetype = response.headers.get('content-type')?.split(';')[0] ?? ''
      if (!response.ok || !mimetype.startsWith('image/')) {
        throw new Error(`cover download returned ${response.status} ${mimetype}`)
      }
      const data = Buffer.from(await response.arrayBuffer())
      const extension = mimetype.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
      const media = await payload.create({
        collection: 'media',
        data: { alt },
        file: { data, mimetype, name: `${COVER_PREFIX}${cover.id}.${extension}`, size: data.length },
        context: { disableRevalidate: true },
        req,
      })
      id = media.id
    }
  } catch (error) {
    payload.logger.warn(`Facebook import: no cover image for "${alt}": ${String(error)}`)
  }
  cache.set(cover.id, id)
  return id
}

/** Removes a cover the import downloaded earlier once no event uses it anymore. */
async function dropUnusedCover(payload: Payload, req: PayloadRequest, previous: Event['image']) {
  if (!previous || typeof previous !== 'object' || !isImportedCover(previous)) return
  const users = await payload.count({ collection: 'events', where: { image: { equals: previous.id } }, req })
  if (users.totalDocs === 0) {
    await payload.delete({ collection: 'media', id: previous.id, context: { disableRevalidate: true }, req })
  }
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
  const covers = new Map<string, number | undefined>()
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
        const image = await coverMediaId(payload, req, event.cover, data.title, covers)

        const existing = await payload.find({
          collection: 'events',
          where: { facebookEventId: { equals: data.facebookEventId } },
          limit: 1,
          req,
        })
        const doc = existing.docs[0]

        // Facebook is the primary source: it overwrites everything it knows about the event,
        // except a registration link or picture an editor set. The slug stays as created.
        const fromFacebook = (target: Event) => {
          const { registrationUrl, slug: _slug, ...fields } = data
          return {
            ...fields,
            ...(isImportedLink(target.registrationUrl) && { registrationUrl: registrationUrl ?? null }),
            ...(image && isImportedCover(target.image) && { image }),
            _status: 'published' as const,
          }
        }

        if (doc) {
          // A Facebook-only copy created before Google Calendar had the event (or before a date
          // was fixed) is merged into the Google Calendar event, so the site shows it once.
          const twin = doc.googleCalendarEventId ? undefined : await findTwin(payload, req, data, 'google')
          if (twin) {
            await payload.delete({ collection: 'events', id: doc.id, context: { disableRevalidate: true }, req })
          }
          const target = twin ?? doc
          await payload.update({
            collection: 'events',
            id: target.id,
            data: fromFacebook(target),
            context: { disableRevalidate: true },
            req,
          })
          if (image) await dropUnusedCover(payload, req, target.image)
          if (twin) linked++
          else updated++
          continue
        }

        const twin = await findTwin(payload, req, data, 'google')
        if (twin) {
          await payload.update({
            collection: 'events',
            id: twin.id,
            data: fromFacebook(twin),
            context: { disableRevalidate: true },
            req,
          })
          if (image) await dropUnusedCover(payload, req, twin.image)
          linked++
          continue
        }

        await payload.create({
          collection: 'events',
          data: { ...data, ...(image && { image }), _status: 'published' },
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

  // Unpublish upcoming events that were cancelled or deleted on Facebook. This only runs after a
  // successful read, so a broken token never takes events down; Google Calendar keeps adding them.
  let unpublished = 0
  const stale = await payload.find({
    collection: 'events',
    where: {
      and: [
        { facebookEventId: { exists: true } },
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
