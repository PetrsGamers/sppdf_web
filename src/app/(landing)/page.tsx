import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { LandingHero } from './_components/LandingHero'
import { EventRibbon } from './_components/EventRibbon'
import { CalendarSection } from './_components/CalendarSection'
import { DivisionsSection } from './_components/DivisionsSection'
import { getGlobal } from './_lib/getGlobal'
import { buildPageMetadata } from './_lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const landingPage = await getGlobal('landing-page')
  return buildPageMetadata(landingPage.seo, '/')
}

// Re-render at most every 5 minutes so events synced from Google Calendar appear
// without a redeploy (revalidatePath can't be called from the background sync job).
export const revalidate = 300

const PAST_EVENTS = 3
const UPCOMING_EVENTS = 9

export default async function LandingPage() {
  const payload = await getPayload({ config: configPromise })

  // A day of slack so today's events stay listed regardless of server timezone;
  // the carousel itself decides which page to open on.
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [landingPage, pastEvents, upcomingEvents] = await Promise.all([
    payload.findGlobal({ slug: 'landing-page' }),
    payload.find({
      collection: 'events',
      sort: '-date',
      where: {
        and: [{ _status: { equals: 'published' } }, { date: { less_than: cutoff } }],
      },
      limit: PAST_EVENTS,
    }),
    payload.find({
      collection: 'events',
      sort: 'date',
      where: {
        and: [{ _status: { equals: 'published' } }, { date: { greater_than_equal: cutoff } }],
      },
      limit: UPCOMING_EVENTS,
    }),
  ])

  const events = [...pastEvents.docs.reverse(), ...upcomingEvents.docs]

  return (
    <>
      <LandingHero hero={landingPage.hero} />
      <EventRibbon ribbon={landingPage.ribbon} />
      <CalendarSection events={events} texts={landingPage.calendarSection} />
      <DivisionsSection divisions={landingPage.divisions} />
    </>
  )
}
