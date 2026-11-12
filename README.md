# SPPDF web

> Webové stránky Spolku přátel pedagogické fakulty (SPPDF) při Pedagogické fakultě Masarykovy univerzity.

Website of SPPDF (Spolek přátel pedagogické fakulty), an association of students and teachers at the Faculty of Education, Masaryk University.

- Live site: https://sppdfmuni.petrhybl.com
- Admin panel: https://sppdfmuni.petrhybl.com/admin
- Hosting: [Coolify](https://coolify.io)

The project is a fork of the [Payload "website" template](https://github.com/payloadcms/payload/tree/main/templates/website). The public site is a custom set of Czech landing pages (`/`, `/aboutus`, `/calendar`) edited through Payload. Events are pulled automatically from the association's public Google Calendar. Most of the template's blog/pages machinery is still in the codebase but is not part of the real site (see [Project structure](#project-structure)).

## Tech stack

| Area | Technology |
| --- | --- |
| CMS | [Payload](https://payloadcms.com) 3.79.1 (admin panel, REST/GraphQL API, jobs queue) |
| Framework | Next.js 15.4 (App Router), React 19 |
| Database | PostgreSQL via `@payloadcms/db-postgres` |
| Styling | Tailwind CSS 4 |
| Rich text | Lexical (`@payloadcms/richtext-lexical`) |
| Calendar sync | Google Calendar API v3 (`googleapis`) |
| Tests | Vitest (integration), Playwright (e2e) |

## Project structure

```
src/
├── app/
│   ├── (landing)/              # THE PUBLIC SITE
│   │   ├── layout.tsx          # nav + footer, reads the LandingPage global
│   │   ├── page.tsx            # /          hero, ribbon, event carousel, divisions
│   │   ├── aboutus/page.tsx    # /aboutus   team (TeamMembers collection)
│   │   ├── calendar/           # /calendar  month calendar (Events collection)
│   │   ├── _components/        # LandingHero, LandingNav, CalendarSection, ...
│   │   └── landing.css
│   ├── (payload)/              # Payload admin (/admin) and API (/api/*)
│   └── (frontend)/             # template leftovers: /[slug], /posts, /search, sitemaps, preview, seed
├── LandingPage/                # LandingPage global (config + revalidation hook)
├── collections/
│   ├── Events/                 # events shown on / and /calendar
│   ├── TeamMembers/            # people shown on /aboutus
│   ├── Media.ts                # uploads, stored in public/media
│   ├── Users/                  # admin accounts
│   └── Pages/, Posts/, Categories.ts   # template leftovers
├── jobs/
│   └── syncGoogleCalendar.ts   # Google Calendar -> Events task
├── payload.config.ts           # DB adapter, collections/globals, jobs, onInit deploy sync
├── payload-types.ts            # generated (npm run generate:types)
└── Header/, Footer/, blocks/, heros/, search/, plugins/, ...   # template code
```

What is actually used by the live site:

- **`src/app/(landing)`**: all public pages.
- **Globals**: `LandingPage` (`src/LandingPage/config.ts`).
- **Collections**: `Events`, `TeamMembers`, `Media`, `Users`.
- **Jobs**: `syncGoogleCalendar` (`src/jobs/syncGoogleCalendar.ts`, registered in `src/payload.config.ts`).

Still in the codebase from the template, but not part of the SPPDF site:

- the `(frontend)` routes: `/[slug]`, `/posts`, `/search`, `/next/preview`, `/next/seed`, `pages-sitemap.xml`, `posts-sitemap.xml`;
- the `Pages`, `Posts` and `Categories` collections and the `Header` and `Footer` globals;
- the form-builder, search, SEO, redirects and nested-docs plugins (`src/plugins/index.ts`);
- the "Seed your database" button on the admin dashboard (`src/components/BeforeDashboard`). **Do not press it on a real database.** It deletes all pages, posts, media, categories, forms and search records, and it creates a `demo-author@example.com` user whose password is `password`.

`AGENTS.md` contains general Payload coding guidelines for AI assistants. Its "Project Structure" section is generic and does not describe this repo.

## Local development

### Prerequisites

- **Node.js 22.** The production Dockerfile uses `node:22.17.0-alpine`. `package.json` `engines` allows `^18.20.2 || >=20.9.0`.
- **npm.** The committed lockfile is `package-lock.json`, so use `npm ci` / `npm install`. A few `package.json` scripts and the Playwright config still call `pnpm` (see [Scripts](#scripts)). `.npmrc` sets `legacy-peer-deps=true`.
- **PostgreSQL**, local or in Docker. For example:
  ```bash
  docker run -d --name sppdf-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sppdf -p 5432:5432 postgres:16
  ```
  `docker-compose.yml` in the repo is the stale template file (MongoDB, Node 18, yarn). Don't use it.

### First run

```bash
npm ci
cp .env.example .env          # then fill in the values (see below)
npm run payload migrate:create initial   # first time only, see "Database & migrations"
npm run payload migrate       # create the tables
npm run dev                   # http://localhost:3000
```

Open http://localhost:3000/admin and create the first admin user. The landing pages render with built-in fallback content until you fill in the **Landing Page** global and add events and team members.

Schema push is disabled (`push: false`), so `npm run dev` does **not** create tables. If you skip the migrate step, every page fails with `relation "..." does not exist`.

### Environment variables

| Variable | Required | When | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | build + runtime | Postgres connection string. The build needs it as well, because `next build` prerenders the landing pages from the database. |
| `PAYLOAD_SECRET` | yes | build + runtime | Payload's secret for signing auth tokens. Use a long random string. Changing it logs everyone out. |
| `NEXT_PUBLIC_SERVER_URL` | yes (prod) | **build** + runtime | Public base URL with no trailing slash, e.g. `https://sppdfmuni.petrhybl.com`. Used for CORS, absolute URLs (SEO/OG, media) and `robots.txt`/`sitemap.xml`, which `next-sitemap` generates in `postbuild`. `NEXT_PUBLIC_*` values are inlined at build time. Server code falls back to `http://localhost:3000` and the sitemap to `https://example.com`. |
| `GOOGLE_API_KEY` | yes, for calendar sync | runtime | Google API key with the Google Calendar API enabled. Without it every sync run throws. The rest of the site works without it. |
| `CRON_SECRET` | optional | runtime | Lets external callers run the jobs endpoint with `Authorization: Bearer <CRON_SECRET>`. If unset, only logged-in admin users can call `/api/payload-jobs/run`. In-process scheduling does not need it. |
| `PREVIEW_SECRET` | optional | runtime | Shared secret for the template's draft preview route (`/next/preview`), which only the `Pages`/`Posts` collections use. |
| `DEPLOYMENT_ID` | optional | runtime | Overrides the deployment identity used for the [once-per-deployment calendar sync](#once-per-deployment-sync). Change it to force a sync on the next boot. |
| `SOURCE_COMMIT`, `COOLIFY_CONTAINER_NAME`, `HOSTNAME` | set by platform | runtime | Fallback deployment identities, in that order after `DEPLOYMENT_ID`. Don't set these by hand. |
| `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_GIT_COMMIT_SHA`, `RAILWAY_GIT_COMMIT_SHA`, `RENDER_GIT_COMMIT`, `HEROKU_RELEASE_VERSION` | n/a | — | Template and other-platform fallbacks read by the code. Not used on Coolify. |
| `CI` | optional | tests | Playwright: retries, a single worker, and `forbidOnly`. |

## Database & migrations

The Postgres adapter in `src/payload.config.ts` is configured with:

```ts
postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URL },
  push: false,                 // never auto-sync the schema
  migrationDir: './migrations',
})
```

**No migrations are committed yet.** There is no `migrations/` directory. The production schema was created outside of migrations. Until a baseline migration exists, a fresh database (new developer, staging, restore) has no tables, and nothing in the repo records the production schema.

Any change to collections, globals or fields (including adding or removing a field) changes the DB schema. Handle it like this:

1. Change the config in `src/`.
2. `npm run generate:types` to refresh `src/payload-types.ts`.
3. `npm run payload migrate:create <short-name>`. This writes `migrations/<timestamp>_<name>.ts` and a `.json` schema snapshot, and updates `migrations/index.ts`. Review the generated SQL.
4. `npm run payload migrate` to apply it locally. Use `npm run payload migrate:status` to check.
5. Commit the migration files together with the config change.
6. Apply the migration to production **before** the new code serves traffic. The build itself queries the DB, so the safest place is the build step (see [Deployment](#deployment-coolify)).

**Creating the baseline (one-time).** The first `migrate:create` on a repo with no migrations generates the complete schema. Generate it from the code that is currently deployed. Before you run it against production, check `npm run payload migrate:status` with the production `DATABASE_URL`. Production already has these tables, so the baseline must be **recorded as applied** rather than executed there. One way is to insert its name into the `payload_migrations` table (`name`, `batch = 1`). If Payload reports an earlier dev-mode push (a `batch = -1` row), resolve that first.

Useful commands: `migrate`, `migrate:status`, `migrate:create`, `migrate:down`, `migrate:fresh` (drops everything, local only). Run them all via `npm run payload <command>`.

## Editing content

Log in at `/admin`. Every logged-in user has full rights; there are no roles. No email adapter is configured, so emails such as password resets are only written to the server log.

| Part of the site | Where to edit |
| --- | --- |
| Nav links and CTA button (all landing pages) | Globals → **Landing Page** → Navigation |
| Hero (badge, headline, subtitle, two CTAs, image) | Landing Page → Hero Section |
| Scrolling ribbon under the hero | Landing Page → Event Ribbon |
| "Divisions" carousel on `/` | Landing Page → Divisions Section |
| Footer (text, social links, link columns, copyright) | Landing Page → Footer |
| Event carousel on `/` and the `/calendar` page | Collections → **Events** (published only) |
| Team on `/aboutus` | Collections → **Team Members** (sorted by `order`, max. 20) |
| Images | Collections → **Media** (or upload directly from an upload field) |

Notes:

- Events have drafts, autosave and scheduled publishing. Only **published** events are shown.
- Events created by the calendar sync have a read-only `googleCalendarEventId`. The next sync overwrites their title, date, time, location and description and publishes them again. Edit them in Google Calendar instead.
- The `/aboutus` history section and some texts and links are hardcoded in `src/app/(landing)`, not in the CMS.
- Landing pages are static. See [Troubleshooting](#troubleshooting) for when a change shows up.

## Google Calendar sync

`src/jobs/syncGoogleCalendar.ts` registers the Payload task `syncGoogleCalendar`, which works like this:

1. It reads upcoming events (`timeMin = now`, recurring events expanded, up to 250) from the calendar `sppdfmuni@gmail.com`. The calendar ID is hardcoded. Authentication uses `GOOGLE_API_KEY` only, so **the calendar must be public** ("Make available to public → See all event details").
2. It skips events whose description contains `internal` (case-insensitive).
3. It matches existing CMS events by `googleCalendarEventId`, updates them or creates new ones, and always sets them to **published**. It never deletes CMS events: events removed from Google, and events in the past, stay as they are.
4. It stores the start time as `HH:MM` formatted in the server's time zone. A duration string is computed from the end time.

### Schedule

These settings live in `jobs` in `src/payload.config.ts`:

- `schedule: [{ cron: '0 6 * * *', queue: 'default' }]` queues a sync every day at 06:00 in **server time (UTC in the container)**.
- `autoRun: [{ cron: '*/5 * * * *', queue: 'default' }]`: the running Next.js server checks the `default` queue every 5 minutes, queues scheduled jobs and runs them. This needs a long-running Node process, which Coolify provides. No external cron is needed.
- Failed runs retry 2× with exponential backoff (60 s). Completed jobs are deleted (`deleteJobOnComplete`).

### Once-per-deployment sync

`onInit` in `src/payload.config.ts` runs one sync when the app boots with a deployment identity it has not seen before. The identity is the first non-empty value of `DEPLOYMENT_ID`, `SOURCE_COMMIT`, `VERCEL_GIT_COMMIT_SHA`, `RAILWAY_GIT_COMMIT_SHA`, `RENDER_GIT_COMMIT`, `HEROKU_RELEASE_VERSION`, `COOLIFY_CONTAINER_NAME` or `HOSTNAME`. The last identity that was synced is stored in Payload's KV store under `jobs:syncGoogleCalendar:lastDeployment`, and the sync runs immediately on a separate `deploy` queue. If no identity is found, a warning is logged and the sync is skipped.

On Coolify, a new deployment usually means a new `SOURCE_COMMIT` (when Coolify exposes it) or a new container name, so each deploy syncs once. The `HOSTNAME` fallback (the container ID) changes whenever the container is recreated, which can trigger extra syncs.

### Triggering a sync manually

- **On production:** set or change `DEPLOYMENT_ID` (e.g. `manual-2026-11-12`) in Coolify and restart. The boot sync runs once.
- **From a shell with DB access** (locally, or with the production env loaded), create a throwaway script and run it with Payload's runner:
  ```ts
  // sync-calendar.ts (don't commit)
  import { getPayload } from 'payload'
  import config from '@payload-config'

  const payload = await getPayload({ config })
  await payload.jobs.queue({ task: 'syncGoogleCalendar', input: {} })
  console.log(await payload.jobs.run({ limit: 1 }))
  process.exit(0)
  ```
  ```bash
  npm run payload run ./sync-calendar.ts
  ```
- `GET /api/payload-jobs/run?queue=default` with `Authorization: Bearer $CRON_SECRET` (or an admin session) only runs jobs that are **already queued** or scheduled jobs that are due. It does not start a new sync on its own.

After a sync, the public pages still need to be re-rendered. See [Troubleshooting](#troubleshooting).

## Deployment (Coolify)

The app runs as a long-running Node server (`npm run build` → `npm start`, port 3000) next to a Postgres database.

- **Build pack.** The `Dockerfile` in the repo is the stock Next.js example. It copies `.next/standalone`, but `next.config.js` does not set `output: 'standalone'`, and the Dockerfile does not pass any build-time env vars. It does not work as-is. Use Coolify's Nixpacks (Node) build pack, which uses `package-lock.json`, `npm run build` and `npm start`. Pin Node 22 (e.g. `NIXPACKS_NODE_VERSION=22`).
- **Build-time variables.** `DATABASE_URL`, `PAYLOAD_SECRET` and `NEXT_PUBLIC_SERVER_URL` must be available to the **build** (mark them "Build Variable" in Coolify). The build prerenders `/`, `/aboutus` and `/calendar` from the database, and the `postbuild` step generates the sitemap and robots.txt from `NEXT_PUBLIC_SERVER_URL`. The database must therefore be reachable from the build.
- **Runtime variables.** All of the above, plus `GOOGLE_API_KEY`, and optionally `CRON_SECRET`, `PREVIEW_SECRET` and `DEPLOYMENT_ID`.
- **Migrations.** Once migrations exist, run them before the build, e.g. with the custom build command `npm run payload migrate && npm run build`. Alternatively, wire up Payload's `prodMigrations` option in the adapter config.
- **Persistent storage for uploads.** `Media` stores files on the local filesystem in `public/media` (`/app/public/media` under Nixpacks). Mount a **persistent volume** there. Otherwise every redeploy loses all uploaded images, while the DB rows still point to them.
- **Calendar sync on deploy.** See [Once-per-deployment sync](#once-per-deployment-sync). Leave `DEPLOYMENT_ID` unset normally and use it only to force a sync. `onInit` also runs during `next build`, so a sync can be triggered at build time if a deployment identity variable is present there.

## Scripts

Run with `npm run <script>`.

| Script | What it does |
| --- | --- |
| `dev` | Next.js dev server on :3000 |
| `build` | Production build (4 GB heap); `postbuild` runs `next-sitemap` |
| `start` | Serve the production build |
| `lint` / `lint:fix` | ESLint via `next lint` |
| `generate:types` | Regenerate `src/payload-types.ts` after schema changes |
| `generate:importmap` | Regenerate the admin import map after adding or changing admin components |
| `payload <cmd>` | Payload CLI: `migrate*`, `jobs:run`, `run <script>`, ... |
| `test:int` | Vitest integration tests (`tests/int`) |
| `test:e2e` | Playwright tests (`tests/e2e`) |
| `test`, `dev:prod`, `ii`, `reinstall` | Template scripts that call `pnpm`. They fail without pnpm installed and don't match the npm lockfile. |

## Testing

- **Integration (Vitest).** `npm run test:int` runs `tests/int/**/*.int.spec.ts` in jsdom and loads `.env`. It boots Payload against `DATABASE_URL`, which therefore must point to a migrated database. Use a local/dev DB, not production.
- **E2E (Playwright).** `npm run test:e2e`. The config's `webServer` command is `pnpm dev` with `reuseExistingServer: true`, so start `npm run dev` first if you don't have pnpm. Run `npx playwright install chromium` once.
  - `admin.e2e.spec.ts` seeds and removes a `dev@payloadcms.com` test user, so run it against a dev database.
  - `frontend.e2e.spec.ts` is still the template test. It expects the title "Payload Website Template" on `/`, so it currently fails against the SPPDF landing page.

`npm test` runs both suites, but via `pnpm`.

## Troubleshooting

**Calendar or new events don't show up on the site.**
`/`, `/aboutus` and `/calendar` are statically rendered at build time and only refreshed by on-demand revalidation:
- Saving, publishing or deleting an event in the admin revalidates `/` and `/calendar`.
- Saving the Landing Page global revalidates `/` only. `/aboutus` and `/calendar` keep the old nav and footer until the next deploy.
- Team member changes trigger no revalidation, so `/aboutus` updates on the next deploy.
- The calendar sync writes with revalidation **disabled**. Synced events appear after the next deploy, or once any event is saved in the admin.

To check that the sync itself works, look for `Google Calendar sync complete: X created, Y updated` in the Coolify logs, or for `Error running task` and `GOOGLE_API_KEY environment variable is not set`. Then check that the events exist in Admin → Events.

**`relation "..." does not exist`.**
The database has no schema. See [Database & migrations](#database--migrations). `push` is disabled, including in dev.

**Sync fails with a Google API error.**
Check that the key is valid, that the Calendar API is enabled for its project, and that any key restrictions allow the server. Check that `sppdfmuni@gmail.com` is shared publicly with full event details.

**Sync fails partway with a unique-constraint error.**
Events get a slug from their title, and slugs are unique. Two Google events with the same title, such as instances of a recurring event, collide.

**Event times are off by 1–2 hours.**
Times are formatted in the server time zone (UTC in the container), not `Europe/Prague`.

**"Skipping deploy calendar sync: no deployment identity env var found".**
Set `DEPLOYMENT_ID`. The daily schedule still runs regardless.

**Images missing after a redeploy.**
`public/media` is not on a persistent volume. See [Deployment](#deployment-coolify).

**Build fails on Coolify while collecting page data.**
`DATABASE_URL` or `PAYLOAD_SECRET` is not available at build time, the DB is not reachable from the build, or the schema is behind the code (run migrations first).
