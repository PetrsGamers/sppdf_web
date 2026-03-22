import type { TaskHandler } from 'payload'
import { google } from 'googleapis'

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const CALENDAR_ID = 'sppdfmuni@gmail.com'

export const syncGoogleCalendarHandler: TaskHandler<'syncGoogleCalendar'> = async ({ req }) => {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set')
  }

  const calendar = google.calendar({ version: 'v3', auth: apiKey })

  const now = new Date().toISOString()
  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: now,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  })

  const events = response.data.items || []

  let created = 0
  let updated = 0

  for (const event of events) {
    if (!event.id || !event.summary) continue

    // Skip internal events
    if (event.description?.toLowerCase().includes('internal')) continue

    const startDateTime = event.start?.dateTime || event.start?.date
    if (!startDateTime) continue

    const startDate = new Date(startDateTime)

    // Extract time string (HH:MM) from dateTime
    let time: string | undefined
    if (event.start?.dateTime) {
      time = startDate.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
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
      slug: toSlug(event.summary),
      date: startDate.toISOString(),
      time,
      duration,
      location: event.location || undefined,
      description: event.description || undefined,
      googleCalendarEventId: event.id,
      _status: 'published' as const,
    }

    // Find existing event by googleCalendarEventId
    const existing = await req.payload.find({
      collection: 'events',
      where: {
        googleCalendarEventId: { equals: event.id },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await req.payload.update({
        collection: 'events',
        id: existing.docs[0].id,
        data: eventData,
        context: { disableRevalidate: true },
      })
      updated++
    } else {
      await req.payload.create({
        collection: 'events',
        data: eventData,
        draft: false,
        context: { disableRevalidate: true },
      })
      created++
    }
  }

  req.payload.logger.info(`Google Calendar sync complete: ${created} created, ${updated} updated`)

  return {
    output: { synced: created + updated, created, updated },
  }
}
