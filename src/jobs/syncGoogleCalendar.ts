import type { TaskHandler } from 'payload'
import { google, type calendar_v3 } from 'googleapis'

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const CALENDAR_ID = 'sppdfmuni@gmail.com'
const TIME_ZONE = 'Europe/Prague'

/**
 * Fetches all upcoming events, following pagination so that the
 * "remove events no longer in Google" step below only runs on a complete list.
 */
async function fetchUpcomingEvents(apiKey: string): Promise<calendar_v3.Schema$Event[]> {
  const calendar = google.calendar({ version: 'v3', auth: apiKey })
  const timeMin = new Date().toISOString()
  const items: calendar_v3.Schema$Event[] = []
  let pageToken: string | undefined

  do {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
      pageToken,
    })
    items.push(...(response.data.items || []))
    pageToken = response.data.nextPageToken || undefined
  } while (pageToken)

  return items
}

export const syncGoogleCalendarHandler: TaskHandler<'syncGoogleCalendar'> = async ({ req }) => {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set')
  }

  const { payload } = req
  const events = await fetchUpcomingEvents(apiKey)

  let created = 0
  let updated = 0
  let failed = 0
  const seenGoogleIds = new Set<string>()

  for (const event of events) {
    if (!event.id || !event.summary) continue
    if (event.status === 'cancelled') continue

    // Skip internal events
    if (event.description?.toLowerCase().includes('internal')) continue

    const startDateTime = event.start?.dateTime || event.start?.date
    if (!startDateTime) continue

    seenGoogleIds.add(event.id)

    const startDate = new Date(startDateTime)

    // Extract time string (HH:MM) in Prague time — the server runs in UTC
    let time: string | undefined
    if (event.start?.dateTime) {
      time = startDate.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: TIME_ZONE,
      })
    }

    // Calculate duration
    let duration: string | undefined
    const endDateTime = event.end?.dateTime || event.end?.date
    if (endDateTime) {
      const endDate = new Date(endDateTime)
      const diffMs = endDate.getTime() - startDate.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      if (diffHours > 0 && diffMinutes > 0) {
        duration = `${diffHours} h ${diffMinutes} min`
      } else if (diffHours > 0) {
        duration = diffHours === 1 ? '1 hodina' : diffHours < 5 ? `${diffHours} hodiny` : `${diffHours} hodin`
      } else if (diffMinutes > 0) {
        duration = `${diffMinutes} min`
      }
    }

    const eventData = {
      title: event.summary,
      // Slug must be unique: recurring events share the same title, so suffix the Google id
      slug: toSlug(`${event.summary}-${event.id}`),
      date: startDate.toISOString(),
      time,
      duration,
      location: event.location || undefined,
      description: event.description || undefined,
      googleCalendarEventId: event.id,
      _status: 'published' as const,
    }

    // One bad event must not abort the whole sync
    try {
      const existing = await payload.find({
        collection: 'events',
        where: {
          googleCalendarEventId: { equals: event.id },
        },
        limit: 1,
        req,
      })

      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'events',
          id: existing.docs[0].id,
          data: eventData,
          context: { disableRevalidate: true },
          req,
        })
        updated++
      } else {
        await payload.create({
          collection: 'events',
          data: eventData,
          draft: false,
          context: { disableRevalidate: true },
          req,
        })
        created++
      }
    } catch (error) {
      failed++
      payload.logger.error(
        `Google Calendar sync: failed to save event "${event.summary}" (${event.id}): ${String(error)}`,
      )
    }
  }

  // Unpublish upcoming synced events that were cancelled or deleted in Google Calendar
  let removed = 0
  try {
    const stale = await payload.find({
      collection: 'events',
      where: {
        and: [
          { googleCalendarEventId: { exists: true } },
          { _status: { equals: 'published' } },
          { date: { greater_than_equal: new Date().toISOString() } },
        ],
      },
      limit: 0,
      pagination: false,
      req,
    })

    for (const doc of stale.docs) {
      if (doc.googleCalendarEventId && !seenGoogleIds.has(doc.googleCalendarEventId)) {
        await payload.update({
          collection: 'events',
          id: doc.id,
          data: { _status: 'draft' },
          context: { disableRevalidate: true },
          req,
        })
        removed++
      }
    }
  } catch (error) {
    payload.logger.error(`Google Calendar sync: failed to unpublish removed events: ${String(error)}`)
  }

  // Pages showing events use time-based revalidation (see src/app/(landing)), because
  // revalidatePath() throws when called outside a request (e.g. from the jobs autoRun cron).

  payload.logger.info(
    `Google Calendar sync complete: ${created} created, ${updated} updated, ${removed} unpublished, ${failed} failed`,
  )

  if (failed > 0 && created + updated === 0) {
    throw new Error(`Google Calendar sync failed for all ${failed} events`)
  }

  return {
    output: { synced: created + updated, created, updated },
  }
}
