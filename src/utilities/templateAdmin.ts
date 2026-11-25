/**
 * Admin settings for collections/globals that come from the Payload website template and are
 * NOT used by the real SPPDF site (src/app/(landing)). They stay registered – removing them
 * would change the database schema and drop their tables – but are hidden from editors.
 *
 * Developers can show them again by setting PAYLOAD_SHOW_TEMPLATE_COLLECTIONS=true.
 */
import { authenticated } from '@/access/authenticated'
import { authenticatedOrNone } from '@/access/authenticatedOrNone'

export const showTemplateCollections = process.env.PAYLOAD_SHOW_TEMPLATE_COLLECTIONS === 'true'

export const TEMPLATE_GROUP = 'Šablona (nepoužívá se)'

export const templateAdmin = {
  group: TEMPLATE_GROUP,
  hidden: !showTemplateCollections,
} as const

/** Template collections are not part of the public site, so their API is closed to anonymous visitors. */
export const templateAccess = {
  create: authenticated,
  read: authenticatedOrNone,
  update: authenticated,
  delete: authenticated,
}
