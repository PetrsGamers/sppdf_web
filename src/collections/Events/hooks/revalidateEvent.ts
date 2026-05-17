import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Event } from '../../../payload-types'

export const revalidateEvent: CollectionAfterChangeHook<Event> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating landing page and calendar for event: ${doc.title}`)
      revalidatePath('/')
      revalidatePath('/calendar')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating landing page and calendar for unpublished event: ${doc.title}`)
      revalidatePath('/')
      revalidatePath('/calendar')
    }
  }
  return doc
}

export const revalidateEventDelete: CollectionAfterDeleteHook<Event> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath('/')
    revalidatePath('/calendar')
  }

  return doc
}
