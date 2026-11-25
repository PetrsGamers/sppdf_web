import type { Access } from 'payload'

/**
 * Logged-in users see everything; anonymous visitors get an empty result rather than a 403.
 * Template pages query these collections with `overrideAccess: false` (also at build time), and a
 * 403 would fail the build, while an empty result just renders as "not found".
 */
export const authenticatedOrNone: Access = ({ req: { user } }) => {
  if (user) return true
  return { id: { exists: false } }
}
