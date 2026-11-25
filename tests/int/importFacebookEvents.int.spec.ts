// @vitest-environment node
import { createLocalReq, getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  cleanTitle,
  importFacebookEventsHandler,
  registrationLinkFrom,
  sameTitle,
  toEventData,
  type FacebookEvent,
} from '@/jobs/importFacebookEvents'
import config from '@/payload.config'

describe('toEventData', () => {
  it('maps a Facebook event to a website event in Prague time', () => {
    const [data] = toEventData({
      id: '111',
      name: 'Benefiční pubkvíz',
      description: 'Přijďte!',
      start_time: '2030-12-01T19:00:00+0100',
      end_time: '2030-12-01T22:00:00+0100',
      place: { name: 'Klub Leitnerova', location: { street: 'Leitnerova 1', city: 'Brno' } },
    })
    expect(data).toMatchObject({
      title: 'Benefiční pubkvíz',
      time: '19:00',
      duration: '3 hodiny',
      location: 'Klub Leitnerova, Leitnerova 1, Brno',
      description: 'Přijďte!',
      facebookEventId: '111',
    })
    expect(data.registrationUrl).toBeUndefined()
    expect(data.date).toBe('2030-12-01T18:00:00.000Z')
  })

  it('creates one website event per date of a repeating event', () => {
    const data = toEventData({
      id: '200',
      name: 'Taneční lekce',
      start_time: '2030-12-02T18:00:00+0100',
      ticket_uri: 'https://forms.example/tanec',
      event_times: [
        { id: '201', start_time: '2030-12-02T18:00:00+0100' },
        { id: '202', start_time: '2030-12-09T18:00:00+0100' },
      ],
    })
    expect(data.map((d) => d.facebookEventId)).toEqual(['201', '202'])
    expect(data.every((d) => d.registrationUrl === 'https://forms.example/tanec')).toBe(true)
  })
})

describe('cleanTitle', () => {
  it('drops dates and the bare organisation name but keeps other parts', () => {
    expect(cleanTitle('ULTIMÁTNÍ GAMENIGHT // 24.11.2026')).toBe('ULTIMÁTNÍ GAMENIGHT')
    expect(cleanTitle('BRNO EXPRESS // 23.9.2026 // SP-PDF MUNI')).toBe('BRNO EXPRESS')
    expect(cleanTitle('PIVNÍ STEZKA + AFTERPARTY // 16.9. 2026 // SP-PDF MUNI')).toBe(
      'PIVNÍ STEZKA + AFTERPARTY',
    )
    expect(cleanTitle('SP-PDF BEERPONG LIGA // 2.KOLO 10.SEZÓNA')).toBe(
      'SP-PDF BEERPONG LIGA // 2.KOLO 10.SEZÓNA',
    )
    expect(cleanTitle('KÁMEN NŮŽKY PAPÍR // TURNAJ SP-PDF MUNI')).toBe(
      'KÁMEN NŮŽKY PAPÍR // TURNAJ SP-PDF MUNI',
    )
  })
})

describe('registrationLinkFrom', () => {
  it('takes the first non-social link from the description', () => {
    expect(
      registrationLinkFrom(
        'Více na https://www.facebook.com/sppdfmuni. Zapiš se: https://docs.google.com/forms/d/e/abc/viewform?usp=dialog.',
      ),
    ).toBe('https://docs.google.com/forms/d/e/abc/viewform?usp=dialog')
    expect(registrationLinkFrom('Bez registrace, přijď!')).toBeUndefined()
    expect(registrationLinkFrom(undefined)).toBeUndefined()
  })

  it('becomes the registration link of the imported event', () => {
    const [data] = toEventData({
      id: '300',
      name: 'Gamenight',
      start_time: '2030-12-03T19:00:00+0100',
      description: 'Tabulka: https://docs.google.com/spreadsheets/d/xyz/edit?usp=drivesdk',
    })
    expect(data.registrationUrl).toBe('https://docs.google.com/spreadsheets/d/xyz/edit?usp=drivesdk')
  })
})

describe('sameTitle', () => {
  it('ignores case, accents and punctuation, and accepts one title inside the other', () => {
    expect(sameTitle('PLES PDF 2027', 'Ples PdF')).toBe(true)
    expect(sameTitle('Vše za 25 party!', 'vse za 25 party')).toBe(true)
    expect(sameTitle('Beerpong IV.', 'Pubkvíz')).toBe(false)
    expect(sameTitle('PdF', 'Ples PdF')).toBe(false)
  })
})

describe('importFacebookEventsHandler', () => {
  let payload: Payload
  let googleTwinId: number
  const ids = {
    fresh: 'test-fb-fresh',
    twin: 'test-fb-twin',
    cancelled: 'test-fb-cancelled',
    moved: 'test-fb-moved',
  }

  let coverJpeg: Buffer
  const COVER_URL = 'https://scontent.example/cover.jpg'
  const graphResponse = (events: FacebookEvent[]) =>
    vi.fn(async (url: string | URL) =>
      String(url).startsWith(COVER_URL)
        ? new Response(new Uint8Array(coverJpeg), { status: 200, headers: { 'content-type': 'image/jpeg' } })
        : new Response(JSON.stringify({ data: events }), { status: 200 }),
    )

  const run = async () => {
    const req = await createLocalReq({}, payload)
    await importFacebookEventsHandler({ req } as Parameters<typeof importFacebookEventsHandler>[0])
  }

  const fresh: FacebookEvent = {
    id: ids.fresh,
    name: 'Test FB akce',
    start_time: '2030-11-20T18:00:00+0100',
    end_time: '2030-11-20T20:00:00+0100',
    cover: { id: 'test-cover-fresh', source: COVER_URL },
  }
  const twin: FacebookEvent = {
    id: ids.twin,
    name: 'TEST PLES PDF 2030',
    start_time: '2030-11-21T20:00:00+0100',
    description: 'Přihlášky: https://docs.google.com/forms/d/e/test-ples/viewform',
    cover: { id: 'test-cover-twin', source: COVER_URL },
  }
  const cancelled: FacebookEvent = {
    id: ids.cancelled,
    name: 'Test zrušená akce',
    start_time: '2030-11-22T18:00:00+0100',
    is_canceled: true,
  }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    coverJpeg = await sharp({
      create: { width: 400, height: 210, channels: 3, background: '#1877f2' },
    })
      .jpeg()
      .toBuffer()
    vi.stubEnv('FACEBOOK_PAGE_ID', 'test-page')
    vi.stubEnv('FACEBOOK_PAGE_TOKEN', 'test-token')
    const google = await payload.create({
      collection: 'events',
      data: {
        title: 'Test Ples PdF',
        slug: 'test-ples-pdf-google',
        date: '2030-11-21T18:00:00.000Z',
        googleCalendarEventId: 'test-google-twin',
        registrationUrl: 'https://www.facebook.com/events/old-fallback',
        _status: 'published',
      },
      draft: false,
      context: { disableRevalidate: true },
    })
    googleTwinId = google.id
  })

  afterAll(async () => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    await payload.delete({
      collection: 'events',
      where: {
        or: [
          { facebookEventId: { in: Object.values(ids) } },
          { googleCalendarEventId: { in: ['test-google-twin', 'test-google-moved'] } },
        ],
      },
      context: { disableRevalidate: true },
    })
    await payload.delete({
      collection: 'media',
      where: { filename: { like: 'fb-cover-test-cover' } },
    })
  })

  it('creates new events, links Google Calendar twins and skips cancelled events', async () => {
    vi.stubGlobal('fetch', graphResponse([fresh, twin, cancelled]))
    await run()

    const created = await payload.find({
      collection: 'events',
      where: { facebookEventId: { equals: ids.fresh } },
    })
    expect(created.docs).toHaveLength(1)
    expect(created.docs[0]).toMatchObject({ _status: 'published', time: '18:00', duration: '2 hodiny' })
    expect(created.docs[0].registrationUrl ?? null).toBeNull()
    const createdImage = created.docs[0].image
    expect(typeof createdImage === 'object' && createdImage?.filename).toMatch(/^fb-cover-test-cover-fresh/)

    const linked = await payload.findByID({ collection: 'events', id: googleTwinId })
    expect(linked.facebookEventId).toBe(ids.twin)
    // The old Facebook-page fallback is replaced by the real sign-up link from the description.
    expect(linked.registrationUrl).toBe('https://docs.google.com/forms/d/e/test-ples/viewform')
    expect(typeof linked.image === 'object' && linked.image?.filename).toMatch(/^fb-cover-test-cover-twin/)
    expect(linked.title).toBe('Test Ples PdF')

    const duplicates = await payload.find({
      collection: 'events',
      where: { title: { equals: twin.name } },
    })
    expect(duplicates.totalDocs).toBe(0)

    const skipped = await payload.find({
      collection: 'events',
      where: { facebookEventId: { equals: ids.cancelled } },
    })
    expect(skipped.totalDocs).toBe(0)
  })

  it('unpublishes Facebook-only events that disappear, but leaves linked Google events alone', async () => {
    vi.stubGlobal('fetch', graphResponse([]))
    await run()

    const removed = await payload.find({
      collection: 'events',
      where: { facebookEventId: { equals: ids.fresh } },
      draft: true,
    })
    expect(removed.docs[0]._status).toBe('draft')

    const linked = await payload.findByID({ collection: 'events', id: googleTwinId })
    expect(linked._status).toBe('published')
  })

  it('replaces its own copy with a link once the Facebook date matches a Google event', async () => {
    const moved: FacebookEvent = {
      id: ids.moved,
      name: 'TEST PYŽAMOVÁ PÁRTY // 2.12.2030',
      start_time: '2030-12-12T21:00:00+0100',
    }
    const google = await payload.create({
      collection: 'events',
      data: {
        title: 'test pyzamova party',
        slug: 'test-pyzamova-party-google',
        date: '2030-12-02T20:00:00.000Z',
        googleCalendarEventId: 'test-google-moved',
        _status: 'published',
      },
      draft: false,
      context: { disableRevalidate: true },
    })

    vi.stubGlobal('fetch', graphResponse([moved]))
    await run()
    const copy = await payload.find({
      collection: 'events',
      where: { facebookEventId: { equals: ids.moved } },
    })
    expect(copy.docs[0].id).not.toBe(google.id)

    vi.stubGlobal('fetch', graphResponse([{ ...moved, start_time: '2030-12-02T21:00:00+0100' }]))
    await run()
    const after = await payload.find({
      collection: 'events',
      where: { facebookEventId: { equals: ids.moved } },
    })
    expect(after.docs.map((doc) => doc.id)).toEqual([google.id])
    expect(after.docs[0].title).toBe('test pyzamova party')
  })
})
