import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { defaultLexical } from '@/fields/defaultLexical'
import { Categories } from './collections/Categories'
import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { TeamMembers } from './collections/TeamMembers'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { syncGoogleCalendarHandler } from './jobs/syncGoogleCalendar'
import { LandingPage } from './LandingPage/config'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const getDeploymentIdentity = (): { source: string; value: string } | null => {
  const candidates: Array<{ source: string; value: string | undefined }> = [
    { source: 'DEPLOYMENT_ID', value: process.env.DEPLOYMENT_ID },
    { source: 'SOURCE_COMMIT', value: process.env.SOURCE_COMMIT },
    { source: 'VERCEL_GIT_COMMIT_SHA', value: process.env.VERCEL_GIT_COMMIT_SHA },
    { source: 'RAILWAY_GIT_COMMIT_SHA', value: process.env.RAILWAY_GIT_COMMIT_SHA },
    { source: 'RENDER_GIT_COMMIT', value: process.env.RENDER_GIT_COMMIT },
    { source: 'HEROKU_RELEASE_VERSION', value: process.env.HEROKU_RELEASE_VERSION },
    // Coolify fallback: can change across deploys even if commit hash is missing.
    { source: 'COOLIFY_CONTAINER_NAME', value: process.env.COOLIFY_CONTAINER_NAME },
    { source: 'HOSTNAME', value: process.env.HOSTNAME },
  ]

  for (const candidate of candidates) {
    if (candidate.value) {
      return { source: candidate.source, value: candidate.value }
    }
  }

  return null
}

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false, // Don't auto-push schema changes
    migrationDir: './migrations',
  }),
  collections: [Pages, Posts, Events, Media, Categories, Users, TeamMembers],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, LandingPage],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [
      {
        slug: 'syncGoogleCalendar',
        handler: syncGoogleCalendarHandler,
        inputSchema: [],
        outputSchema: [
          { name: 'synced', type: 'number' },
          { name: 'created', type: 'number' },
          { name: 'updated', type: 'number' },
        ],
        retries: {
          attempts: 2,
          backoff: { type: 'exponential', delay: 60000 },
        },
        schedule: [{ cron: '0 6 * * *', queue: 'default' }],
      },
    ],
    deleteJobOnComplete: true,
    autoRun: [{ cron: '*/5 * * * *', queue: 'default' }],
  },
  onInit: async (payload) => {
    const deploymentIdentity = getDeploymentIdentity()
    if (!deploymentIdentity) {
      payload.logger.warn(
        'Skipping deploy calendar sync: no deployment identity env var found. Set DEPLOYMENT_ID if needed.',
      )
      return
    }

    const deploymentId = `${deploymentIdentity.source}:${deploymentIdentity.value}`

    const key = 'jobs:syncGoogleCalendar:lastDeployment'

    try {
      const lastDeploymentId = await payload.kv.get<string>(key)
      if (lastDeploymentId === deploymentId) return

      await payload.jobs.queue({
        task: 'syncGoogleCalendar',
        input: {},
        queue: 'deploy',
        overrideAccess: true,
      })

      await payload.jobs.run({
        queue: 'deploy',
        limit: 1,
        sequential: true,
        overrideAccess: true,
      })

      await payload.kv.set(key, deploymentId)
      payload.logger.info(`Queued deploy calendar sync for deployment ${deploymentId}`)
    } catch (error) {
      payload.logger.error(`Failed deploy calendar sync trigger: ${String(error)}`)
    }
  },
})
