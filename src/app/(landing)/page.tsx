import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { LandingHero } from './_components/LandingHero'
import { EventRibbon } from './_components/EventRibbon'
import { CalendarSection } from './_components/CalendarSection'
import { DivisionsSection } from './_components/DivisionsSection'

export default async function LandingPage() {
  const payload = await getPayload({ config: configPromise })

  const [landingPage, eventsData] = await Promise.all([
    payload.findGlobal({ slug: 'landing-page' }),
    payload.find({
      collection: 'events',
      sort: 'date',
      where: {
        _status: { equals: 'published' },
      },
      limit: 10,
    }),
  ])

  return (
    <>
      <LandingHero hero={landingPage.hero} />
      <EventRibbon ribbon={landingPage.ribbon} />
      <CalendarSection events={eventsData.docs} />
      <DivisionsSection divisions={landingPage.divisions} />
    </>
  )
}
