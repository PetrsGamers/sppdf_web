import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Event } from '../../../payload-types'

const EVENT_PATHS = ['/', '/calendar']

/**
 * revalidatePath() throws when called outside a Next.js request (e.g. scheduled publish
 * running from the jobs autoRun cron). The pages also revalidate on a timer, so a
 * failure here must not break the save.
 */
function revalidateEventPaths(payload: Payload, reason: string) {
  payload.logger.info(`Revalidating landing page and calendar: ${reason}`)
  for (const path of EVENT_PATHS) {
    try {
      revalidatePath(path)
    } catch (error) {
      payload.logger.warn(`Could not revalidate ${path} (${reason}): ${String(error)}`)
    }
  }
}

export const revalidateEvent: CollectionAfterChangeHook<Event> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      revalidateEventPaths(payload, `event "${doc.title}" published`)
    } else if (previousDoc?._status === 'published') {
      revalidateEventPaths(payload, `event "${doc.title}" unpublished`)
    }
  }
  return doc
}

export const revalidateEventDelete: CollectionAfterDeleteHook<Event> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    revalidateEventPaths(payload, `event "${doc.title}" deleted`)
  }

  return doc
}
