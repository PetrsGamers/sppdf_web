import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { CalendarView } from './_components/CalendarView'

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

  return <CalendarView events={eventsData.docs} />
}
