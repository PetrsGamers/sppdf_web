import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

/**
 * Images are embedded in the statically generated pages (hero, divisions, team photos, logo…),
 * so a changed alt text, focal point or replaced file must regenerate them. Only updates and
 * deletes matter – a newly uploaded file is not used anywhere yet.
 */
export const revalidateMedia: CollectionAfterChangeHook = ({
  doc,
  operation,
  req: { payload, context },
}) => {
  if (operation === 'update' && !context.disableRevalidate) {
    payload.logger.info(`Revalidating all pages after media change: ${doc.filename}`)
    revalidatePath('/', 'layout')
  }
  return doc
}

export const revalidateMediaDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath('/', 'layout')
  }
  return doc
}
