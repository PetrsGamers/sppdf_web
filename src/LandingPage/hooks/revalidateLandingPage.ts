import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

export const revalidateLandingPage: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating landing page`)
    revalidatePath('/landing')
  }

  return doc
}
