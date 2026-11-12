import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

export const revalidateLandingPage: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating landing page (incl. shared nav/footer on all pages)`)
    // Nav and footer from this global render in the shared (landing) layout, so every
    // page using that layout (/, /aboutus, /calendar) has to be regenerated.
    revalidatePath('/', 'layout')
  }

  return doc
}
