import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getGlobal } from '../_lib/getGlobal'
import { buildPageMetadata } from '../_lib/metadata'
import { CalendarView } from './_components/CalendarView'

export async function generateMetadata(): Promise<Metadata> {
  const calendarPage = await getGlobal('calendar-page')
  return buildPageMetadata(calendarPage.seo, '/calendar')
}

export default async function CalendarPage() {
  const payload = await getPayload({ config: configPromise })

  const eventsData = await payload.find({
    collection: 'events',
    sort: 'date',
    where: {
      _status: { equals: 'published' },
    },
    limit: 100,
  })

  const calendarPage = await getGlobal('calendar-page')

  return <CalendarView events={eventsData.docs} texts={calendarPage.texts} />
}
