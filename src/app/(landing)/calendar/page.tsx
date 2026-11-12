import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getGlobal } from '../_lib/getGlobal'
import { buildPageMetadata } from '../_lib/metadata'
import { CalendarView } from './_components/CalendarView'

// Re-render at most every 5 minutes so events synced from Google Calendar appear
// without a redeploy (revalidatePath can't be called from the background sync job).
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const calendarPage = await getGlobal('calendar-page')
  return buildPageMetadata(calendarPage.seo, '/calendar')
}

export default async function CalendarPage() {
  const payload = await getPayload({ config: configPromise })

  // The month view lets visitors browse back; keep the last 12 months plus everything upcoming.
  const since = new Date()
  since.setMonth(since.getMonth() - 12)

  const eventsData = await payload.find({
    collection: 'events',
    sort: 'date',
    where: {
      and: [{ _status: { equals: 'published' } }, { date: { greater_than_equal: since.toISOString() } }],
    },
    limit: 0,
    pagination: false,
  })

  const calendarPage = await getGlobal('calendar-page')

  return <CalendarView events={eventsData.docs} texts={calendarPage.texts} />
}
