import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'

export const revalidateSiteSettings: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating all pages after site settings change`)
    // Branding and default metadata are used by every page.
    revalidatePath('/', 'layout')
  }

  return doc
}
