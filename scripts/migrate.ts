/**
 * Runs pending database migrations from ./migrations.
 *
 * Used by `npm run migrate` and automatically before `npm run build` (the build prerenders pages
 * and needs the current schema). Unlike `payload migrate`, it never waits for interactive input:
 * if the database was ever changed with `push` (dev mode), Payload would ask for confirmation and
 * hang a non-interactive deploy, so this stops with instructions instead.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

// Don't queue the once-per-deployment calendar sync (payload.config.ts onInit) from this script:
// it runs before migrations and during the build, not in the server.
process.env.SKIP_DEPLOY_CALENDAR_SYNC = 'true'

const payload = await getPayload({ config })

let hasDevPushMarker = false
try {
  const devRows = await payload.find({
    collection: 'payload-migrations',
    where: { batch: { equals: -1 } },
    limit: 1,
  })
  hasDevPushMarker = devRows.docs.length > 0
} catch {
  // Fresh database without the payload_migrations table: nothing to check.
}

if (hasDevPushMarker) {
  payload.logger.error(
    'This database was modified with `push` (dev mode): payload_migrations contains a row with batch = -1. ' +
      'Check the schema, then run: DELETE FROM payload_migrations WHERE batch = -1; and build again. See README "Database & migrations".',
  )
  process.exit(1)
}

await payload.db.migrate()
payload.logger.info('Migrations are up to date.')
process.exit(0)
