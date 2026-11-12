/**
 * Admin settings for collections/globals that come from the Payload website template and are
 * NOT used by the real SPPDF site (src/app/(landing)). They stay registered – removing them
 * would change the database schema and drop their tables – but are hidden from editors.
 *
 * Developers can show them again by setting PAYLOAD_SHOW_TEMPLATE_COLLECTIONS=true.
 */
export const showTemplateCollections = process.env.PAYLOAD_SHOW_TEMPLATE_COLLECTIONS === 'true'

export const TEMPLATE_GROUP = 'Šablona (nepoužívá se)'

export const templateAdmin = {
  group: TEMPLATE_GROUP,
  hidden: !showTemplateCollections,
} as const
