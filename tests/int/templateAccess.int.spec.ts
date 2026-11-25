import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Category, User } from '@/payload-types'

let payload: Payload
let category: Category
let user: User

describe('template collections', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    category = await payload.create({ collection: 'categories', data: { title: 'Access test', slug: 'access-test' } })
    user = await payload.create({
      collection: 'users',
      data: { email: 'template-access-test@example.com', password: 'template-access-test' },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'categories', id: category.id })
    await payload.delete({ collection: 'users', id: user.id })
  })

  it('returns nothing to anonymous visitors', async () => {
    const result = await payload.find({ collection: 'categories', overrideAccess: false })
    expect(result.totalDocs).toBe(0)
  })

  it('returns the documents to logged-in users', async () => {
    const result = await payload.find({ collection: 'categories', overrideAccess: false, user })
    expect(result.docs.map((doc) => doc.id)).toContain(category.id)
  })
})
