// @vitest-environment node
import { createLocalReq, getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import config from '@/payload.config'

const googleItems = vi.hoisted(() => ({ items: [] as object[] }))

vi.mock('googleapis', () => ({
  google: {
    calendar: () => ({
      events: { list: async () => ({ data: { items: googleItems.items } }) },
    }),
  },
}))

const { syncGoogleCalendarHandler } = await import('@/jobs/syncGoogleCalendar')

describe('syncGoogleCalendarHandler with Facebook as the primary source', () => {
  let payload: Payload
  let facebookOnlyId: number
  let linkedId: number

  const run = async () => {
    const req = await createLocalReq({}, payload)
    await syncGoogleCalendarHandler({ req } as Parameters<typeof syncGoogleCalendarHandler>[0])
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    vi.stubEnv('GOOGLE_API_KEY', 'test-key')
    const facebookOnly = await payload.create({
      collection: 'events',
      data: {
        title: 'FB GAMENIGHT',
        slug: 'test-sync-fb-only',
        date: '2030-11-24T18:00:00.000Z',
        time: '19:00',
        facebookEventId: 'test-sync-fb-1',
        _status: 'published',
      },
      draft: false,
      context: { disableRevalidate: true },
    })
    facebookOnlyId = facebookOnly.id
    const linked = await payload.create({
      collection: 'events',
      data: {
        title: 'Title from Facebook',
        slug: 'test-sync-linked',
        date: '2030-11-25T18:00:00.000Z',
        facebookEventId: 'test-sync-fb-2',
        googleCalendarEventId: 'test-sync-g-2',
        _status: 'published',
      },
      draft: false,
      context: { disableRevalidate: true },
    })
    linkedId = linked.id
  })

  afterAll(async () => {
    vi.unstubAllEnvs()
    await payload.delete({
      collection: 'events',
      where: {
        or: [
          { facebookEventId: { in: ['test-sync-fb-1', 'test-sync-fb-2'] } },
          { googleCalendarEventId: { in: ['test-sync-g-1', 'test-sync-g-2', 'test-sync-g-3'] } },
        ],
      },
      context: { disableRevalidate: true },
    })
  })

  it('links instead of duplicating, leaves Facebook data alone and still adds Google-only events', async () => {
    googleItems.items = [
      // Same day and start time as the Facebook-only event, different title.
      { id: 'test-sync-g-1', summary: 'Herní večer', start: { dateTime: '2030-11-24T19:00:00+01:00' } },
      { id: 'test-sync-g-2', summary: 'Title from Google', start: { dateTime: '2030-11-25T19:00:00+01:00' } },
      { id: 'test-sync-g-3', summary: 'Jen v Google Kalendáři', start: { dateTime: '2030-11-26T19:00:00+01:00' } },
    ]
    await run()

    const facebookOnly = await payload.findByID({ collection: 'events', id: facebookOnlyId })
    expect(facebookOnly).toMatchObject({ title: 'FB GAMENIGHT', googleCalendarEventId: 'test-sync-g-1' })
    const copies = await payload.count({
      collection: 'events',
      where: { title: { equals: 'Herní večer' } },
    })
    expect(copies.totalDocs).toBe(0)

    const linked = await payload.findByID({ collection: 'events', id: linkedId })
    expect(linked.title).toBe('Title from Facebook')

    const googleOnly = await payload.find({
      collection: 'events',
      where: { googleCalendarEventId: { equals: 'test-sync-g-3' } },
    })
    expect(googleOnly.docs[0]).toMatchObject({ title: 'Jen v Google Kalendáři', _status: 'published' })
  })

  it('does not unpublish Facebook events that are missing from Google Calendar', async () => {
    googleItems.items = []
    await run()
    const linked = await payload.findByID({ collection: 'events', id: linkedId })
    expect(linked._status).toBe('published')
  })
})
