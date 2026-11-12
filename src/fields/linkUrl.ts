import type { TextField, TextFieldSingleValidation } from 'payload'
import { text } from 'payload/shared'

/** Prefixes a link on the website may start with. */
const ALLOWED_PREFIXES = ['/', '#', 'http://', 'https://', 'mailto:', 'tel:']

export const LINK_HELP =
  'Odkaz na stránku tohoto webu začíná lomítkem (např. /calendar nebo /aboutus). ' +
  'Odkaz na jiný web zadejte celý včetně https:// (např. https://www.instagram.com/…). ' +
  'Lze použít i mailto:email@example.cz nebo tel:+420…'

export const validateLinkUrl: TextFieldSingleValidation = (value, options) => {
  const base = text(value, options)
  if (base !== true) return base
  if (!value) return true

  const trimmed = value.trim()
  if (!ALLOWED_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return 'Odkaz musí začínat lomítkem (/stranka), https://, mailto:, tel: nebo # (= nikam).'
  }
  if (/\s/.test(trimmed)) {
    return 'Odkaz nesmí obsahovat mezery.'
  }
  return true
}

type LinkUrlArgs = {
  name: string
  label: string
  defaultValue?: string
  description?: string
  required?: boolean
  /** Admin column width when placed in a `row`, e.g. '50%'. */
  width?: string
}

/**
 * Text field for a link target (internal path or full URL) with Czech help text and validation.
 * Only admin-level options are set here, so swapping an existing `text` field for this one
 * does not change the database schema (as long as `name`/`required`/`defaultValue` stay the same).
 */
export const linkUrlField = ({
  name,
  label,
  defaultValue,
  description,
  required,
  width,
}: LinkUrlArgs): TextField => ({
  name,
  type: 'text',
  label,
  ...(defaultValue !== undefined ? { defaultValue } : {}),
  ...(required ? { required } : {}),
  validate: validateLinkUrl,
  admin: {
    description: description ? `${description} ${LINK_HELP}` : LINK_HELP,
    ...(width ? { width } : {}),
  },
})
