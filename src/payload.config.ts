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

const getDeploymentId = (): string | null =>
  process.env.DEPLOYMENT_ID ||
  process.env.SOURCE_COMMIT ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.RAILWAY_GIT_COMMIT_SHA ||
  process.env.RENDER_GIT_COMMIT ||
  process.env.HEROKU_RELEASE_VERSION ||
  null

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
    const deploymentId = getDeploymentId()
    if (!deploymentId) return

    const key = 'jobs:syncGoogleCalendar:lastDeployment'

    try {
      const lastDeploymentId = await payload.kv.get<string>(key)
      if (lastDeploymentId === deploymentId) return

      await payload.jobs.queue({
        task: 'syncGoogleCalendar',
        input: {},
        queue: 'deploy',
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
