/**
 * Runs once when the Next.js server starts.
 *
 * Payload only starts its jobs `autoRun` cron (calendar sync, scheduled publishing) when it is
 * initialised with `cron: true`, which otherwise happens only on the first /api or /admin request.
 * The public pages don't do that, so without this a server that only serves visitors would never
 * run the Google Calendar sync.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Render dates in the visitors' time zone (containers default to UTC), so server HTML and
  // hydration agree and events near midnight land on the right day. Override with TZ if needed.
  process.env.TZ ||= 'Europe/Prague'
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])

  await getPayload({ config, cron: true })
}
