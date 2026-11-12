# SPPDF web

> Webové stránky Spolku přátel pedagogické fakulty (SPPDF) při Pedagogické fakultě Masarykovy univerzity.

Website of SPPDF (Spolek přátel pedagogické fakulty), an association of students and teachers at the Faculty of Education, Masaryk University.

- Live site: https://sppdfmuni.petrhybl.com
- Admin panel: https://sppdfmuni.petrhybl.com/admin
- Hosting: [Coolify](https://coolify.io)

The project is a fork of the [Payload "website" template](https://github.com/payloadcms/payload/tree/main/templates/website). The public site is a custom set of Czech landing pages (`/`, `/aboutus`, `/calendar`) edited through Payload. Events are pulled automatically from the association's public Google Calendar. Most of the template's blog/pages machinery is still in the codebase but is not part of the real site (see [Project structure](#project-structure)).

## Tech stack

| Area          | Technology                                                                           |
| ------------- | ------------------------------------------------------------------------------------ |
| CMS           | [Payload](https://payloadcms.com) 3.79.1 (admin panel, REST/GraphQL API, jobs queue) |
| Framework     | Next.js 15.4 (App Router), React 19                                                  |
| Database      | PostgreSQL via `@payloadcms/db-postgres`                                             |
| Styling       | Tailwind CSS 4                                                                       |
| Rich text     | Lexical (`@payloadcms/richtext-lexical`)                                             |
| Calendar sync | Google Calendar API v3 (`googleapis`)                                                |
| Tests         | Vitest (integration), Playwright (e2e)                                               |

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
│   └── (frontend)/             # template leftovers: /[slug], /posts, /search, sitemaps, preview
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

- the `(frontend)` routes: `/[slug]`, `/posts`, `/search`, `/next/preview`, `pages-sitemap.xml`, `posts-sitemap.xml`;
- the `Pages`, `Posts` and `Categories` collections and the `Header` and `Footer` globals;
- the form-builder, search, SEO, redirects and nested-docs plugins (`src/plugins/index.ts`);
- the "Seed your database" button on the admin dashboard (`src/components/BeforeDashboard`). **Do not press it on a real database.** It deletes all pages, posts, media, categories, forms and search records, and it creates a `demo-author@example.com` user whose password is `password`.

`AGENTS.md` contains general Payload coding guidelines for AI assistants. Its "Project Structure" section is generic and does not describe this repo.

## Local development

### Prerequisites

- **Node.js 22.23.4+ (or 24.22.1+).** Payload 3.93 requires it; `package.json` `engines` is `^22.23.4 || >=24.22.1`.
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
npm run migrate               # create the tables (also runs automatically before `npm run build`)
npm run dev                   # http://localhost:3000
```

Open http://localhost:3000/admin and create the first admin user. The landing pages render with built-in fallback content until you fill in the **Landing Page** global and add events and team members.

Schema push is disabled (`push: false`), so `npm run dev` does **not** create tables. If you skip the migrate step, every page fails with `relation "..." does not exist`.

### Environment variables

| Variable                                                                                                                          | Required               | When                | Purpose                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                                                                    | yes                    | build + runtime     | Postgres connection string. The build needs it as well, because `next build` prerenders the landing pages from the database.                                                                                                                                                                                                                             |
| `PAYLOAD_SECRET`                                                                                                                  | yes                    | build + runtime     | Payload's secret for signing auth tokens. Use a long random string. Changing it logs everyone out.                                                                                                                                                                                                                                                       |
| `NEXT_PUBLIC_SERVER_URL`                                                                                                          | yes (prod)             | **build** + runtime | Public base URL with no trailing slash, e.g. `https://sppdfmuni.petrhybl.com`. Used for CORS, absolute URLs (SEO/OG, media) and `robots.txt`/`sitemap.xml`, which `next-sitemap` generates in `postbuild`. `NEXT_PUBLIC_*` values are inlined at build time. Server code falls back to `http://localhost:3000` and the sitemap to `https://example.com`. |
| `GOOGLE_API_KEY`                                                                                                                  | yes, for calendar sync | runtime             | Google API key with the Google Calendar API enabled. Without it every sync run throws. The rest of the site works without it.                                                                                                                                                                                                                            |
| `CRON_SECRET`                                                                                                                     | optional               | runtime             | Lets external callers run the jobs endpoint with `Authorization: Bearer <CRON_SECRET>`. If unset, only logged-in admin users can call `/api/payload-jobs/run`. In-process scheduling does not need it.                                                                                                                                                   |
| `PREVIEW_SECRET`                                                                                                                  | optional               | runtime             | Shared secret for the template's draft preview route (`/next/preview`), which only the `Pages`/`Posts` collections use.                                                                                                                                                                                                                                  |
| `DEPLOYMENT_ID`                                                                                                                   | optional               | runtime             | Overrides the deployment identity used for the [once-per-deployment calendar sync](#once-per-deployment-sync). Change it to force a sync on the next boot.                                                                                                                                                                                               |
| `SOURCE_COMMIT`, `COOLIFY_CONTAINER_NAME`, `HOSTNAME`                                                                             | set by platform        | runtime             | Fallback deployment identities, in that order after `DEPLOYMENT_ID`. Don't set these by hand.                                                                                                                                                                                                                                                            |
| `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_GIT_COMMIT_SHA`, `RAILWAY_GIT_COMMIT_SHA`, `RENDER_GIT_COMMIT`, `HEROKU_RELEASE_VERSION` | n/a                    | —                   | Template and other-platform fallbacks read by the code. Not used on Coolify.                                                                                                                                                                                                                                                                             |
| `CI`                                                                                                                              | optional               | tests               | Playwright: retries, a single worker, and `forbidOnly`.                                                                                                                                                                                                                                                                                                  |

## Database & migrations

The Postgres adapter in `src/payload.config.ts` is configured with:

```ts
postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URL },
  push: false, // never auto-sync the schema
  migrationDir: './migrations',
})
```

Migrations live in `migrations/`:

- `20261112_202435_baseline` is the schema as of commit `9bd4d75` (Payload 3.79.1), before the repo had migrations. It **skips itself** if the `users` table already exists (databases created earlier with `push`, such as production) and is only recorded as run. A fresh database gets the full schema from it.
- `20261112_204942_release_content_and_payload_3_93` adds the editable-content globals and fields and the `users.reset_password_requested_at` column that Payload 3.90+ needs. All changes are additive.

**Migrations run automatically before every build.** `npm run build` triggers the `prebuild` script, which runs `npm run migrate` (`scripts/migrate.ts`). The build prerenders pages from the database, so the schema must be current first. The script never waits for input. If the database contains a dev-mode push marker (a `payload_migrations` row with `batch = -1`), plain `payload migrate` would wait for a yes/no answer and hang the deploy, so the script stops with an error instead. Check the schema, run `DELETE FROM payload_migrations WHERE batch = -1;`, and build again.

Any change to collections, globals or fields (including adding or removing a field) changes the DB schema. Handle it like this:

1. Change the config in `src/`.
2. `npm run generate:types` to refresh `src/payload-types.ts`.
3. `npm run migrate:create <short-name>`. This writes `migrations/<timestamp>_<name>.ts` and a `.json` schema snapshot, and updates `migrations/index.ts`. Review the generated SQL.
4. `npm run migrate` to apply it locally. Use `npm run migrate:status` to check.
5. Commit the migration files together with the config change. The next deploy applies them before building.

Other commands: `migrate:down`, `migrate:fresh` (drops everything, local only), via `npm run payload <command>`.

## Editing content

Log in at `/admin`. Every logged-in user has full rights; there are no roles. No email adapter is configured, so emails such as password resets are only written to the server log.

The admin is in Czech (each user can switch to English in their account settings). The sidebar is grouped like this; a short editing guide is also shown on the admin dashboard.

| Part of the site                                                 | Where to edit                                                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Hero, ribbon, event-carousel texts, "divisions" cards on `/`     | Obsah webu → **Hlavní stránka** (tabs Úvodní blok, Běžící pás, Kalendář akcí, Sekce spolku)        |
| Menu and footer on all pages                                     | Hlavní stránka → tabs **Menu** and **Patička** (`{rok}` in the copyright becomes the current year) |
| `/aboutus` texts (intro, what we do, history, team heading, CTA) | Obsah webu → **Stránka O nás**                                                                     |
| Team on `/aboutus`                                               | Obsah webu → **Členové týmu**                                                                      |
| `/calendar` texts and default registration link                  | Obsah webu → **Stránka Kalendář**                                                                  |
| Events (carousel on `/`, `/calendar`)                            | Kalendář → **Akce** (published only; optional registration link per event)                         |
| Images                                                           | Obsah webu → **Obrázky a soubory**                                                                 |
| Site name, logo, favicon, default SEO/share image, 404 texts     | Nastavení → **Nastavení webu**                                                                     |
| Page title, description and share image per page                 | tab **SEO a sdílení** in each page global                                                          |
| Users                                                            | Nastavení → **Uživatelé**                                                                          |

The template collections the site doesn't use (Pages, Posts, Categories, Redirects, Forms, Form submissions, Search, Header, Footer) are hidden from the admin but keep their data. Set `PAYLOAD_SHOW_TEMPLATE_COLLECTIONS=true` to show them.

Notes:

- Events have drafts, autosave and scheduled publishing. Only **published** events are shown.
- Events created by the calendar sync have a read-only `googleCalendarEventId`. The next sync overwrites their title, date, time, location and description and publishes them again. Edit them in Google Calendar instead.
- Saving any page global, team member or image refreshes the affected pages immediately. `/` and `/calendar` also re-render at most every 5 minutes. See [Troubleshooting](#troubleshooting).

## Google Calendar sync

`src/jobs/syncGoogleCalendar.ts` registers the Payload task `syncGoogleCalendar`, which works like this:

1. It reads all upcoming events (`timeMin = now`, recurring events expanded, all result pages) from the calendar `sppdfmuni@gmail.com`. The calendar ID is hardcoded. Authentication uses `GOOGLE_API_KEY` only, so **the calendar must be public** ("Make available to public → See all event details").
2. It skips events whose description contains `internal` (case-insensitive).
3. It matches existing CMS events by `googleCalendarEventId`, updates them or creates new ones, and always sets them to **published**. The slug is the title plus the Google event ID, so recurring events with the same title don't collide. A failure on one event is logged and the sync continues.
4. Upcoming synced events that no longer appear in Google (deleted or cancelled) are **unpublished**, not deleted. Past events are left as they are.
5. It stores the start time as `HH:MM` in `Europe/Prague`. A duration string is computed from the end time.
6. It writes with revalidation disabled, because `revalidatePath()` throws outside a request (the job runs from the `autoRun` cron). `/` and `/calendar` instead use time-based revalidation (`export const revalidate = 300`), so synced events appear within about 5 minutes.

### Schedule

These settings live in `jobs` in `src/payload.config.ts`:

- `schedule: [{ cron: '0 * * * *', queue: 'default' }]` queues a sync every hour.
- `autoRun: [{ cron: '*/5 * * * *', queue: 'default' }]`: the running Next.js server checks the `default` queue every 5 minutes, queues scheduled jobs and runs them. This needs a long-running Node process, which Coolify provides. No external cron is needed.
- Payload only starts this cron when it is initialised with `cron: true`. `src/instrumentation.ts` does that when the server boots; otherwise it would only start on the first `/api` or `/admin` request, and a site that only gets public visitors would never sync.
- `src/instrumentation.ts` also sets `TZ=Europe/Prague` unless `TZ` is already set, so server-rendered dates match visitors' browsers.
- Failed runs retry 2× with exponential backoff (60 s). Completed jobs are deleted (`deleteJobOnComplete`).

### Once-per-deployment sync

`onInit` in `src/payload.config.ts` runs one sync when the app boots with a deployment identity it has not seen before. The identity is the first non-empty value of `DEPLOYMENT_ID`, `SOURCE_COMMIT`, `VERCEL_GIT_COMMIT_SHA`, `RAILWAY_GIT_COMMIT_SHA`, `RENDER_GIT_COMMIT`, `HEROKU_RELEASE_VERSION`, `COOLIFY_CONTAINER_NAME` or `HOSTNAME`. `HOSTNAME` is ignored when it is `0.0.0.0` or `localhost`. The identity is stored in Payload's KV store under `jobs:syncGoogleCalendar:lastDeployment`, and a sync is queued on the `default` queue. The autoRun cron runs it within 5 minutes, with the task's normal retries, so startup isn't blocked. It is skipped during `next build` and in `scripts/migrate.ts`. If no identity is found, a warning is logged and the sync is skipped.

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

- **Build pack.** The `Dockerfile` in the repo is the stock Next.js example. It copies `.next/standalone`, but `next.config.js` does not set `output: 'standalone'`, and the Dockerfile does not pass any build-time env vars. It does not work as-is. Use Coolify's Nixpacks (Node) build pack, which uses `package-lock.json`, `npm run build` and `npm start`. Nixpacks reads the Node version from `engines`; you can also pin it with `NIXPACKS_NODE_VERSION=22`.
- **Build-time variables.** `DATABASE_URL`, `PAYLOAD_SECRET` and `NEXT_PUBLIC_SERVER_URL` must be available to the **build** (mark them "Build Variable" in Coolify). The build prerenders `/`, `/aboutus` and `/calendar` from the database, and the `postbuild` step generates the sitemap and robots.txt from `NEXT_PUBLIC_SERVER_URL`. The database must therefore be reachable from the build.
- **Runtime variables.** All of the above, plus `GOOGLE_API_KEY`, and optionally `CRON_SECRET`, `PREVIEW_SECRET` and `DEPLOYMENT_ID`.
- **Migrations.** `npm run build` runs pending migrations first (`prebuild`), so the build needs `DATABASE_URL` and network access to the database. Changes are applied before the new container serves traffic; keep migrations additive so the old container keeps working during the switch.
- **Persistent storage for uploads.** `Media` stores files on the local filesystem in `public/media` (`/app/public/media` under Nixpacks). Mount a **persistent volume** there. Otherwise every redeploy loses all uploaded images, while the DB rows still point to them.
- **Calendar sync on deploy.** See [Once-per-deployment sync](#once-per-deployment-sync). Leave `DEPLOYMENT_ID` unset normally and use it only to force a sync. `onInit` also runs during `next build`, so a sync can be triggered at build time if a deployment identity variable is present there.

## Scripts

Run with `npm run <script>`.

| Script                                | What it does                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `dev`                                 | Next.js dev server on :3000                                                                           |
| `build`                               | Production build (4 GB heap); `postbuild` runs `next-sitemap`                                         |
| `start`                               | Serve the production build                                                                            |
| `lint` / `lint:fix`                   | ESLint via `next lint`                                                                                |
| `generate:types`                      | Regenerate `src/payload-types.ts` after schema changes                                                |
| `generate:importmap`                  | Regenerate the admin import map after adding or changing admin components                             |
| `payload <cmd>`                       | Payload CLI: `migrate*`, `jobs:run`, `run <script>`, ...                                              |
| `test:int`                            | Vitest integration tests (`tests/int`)                                                                |
| `test:e2e`                            | Playwright tests (`tests/e2e`)                                                                        |
| `test`, `dev:prod`, `ii`, `reinstall` | Template scripts that call `pnpm`. They fail without pnpm installed and don't match the npm lockfile. |

## Testing

- **Integration (Vitest).** `npm run test:int` runs `tests/int/**/*.int.spec.ts` in jsdom and loads `.env`. It boots Payload against `DATABASE_URL`, which therefore must point to a migrated database. Use a local/dev DB, not production.
- **E2E (Playwright).** `npm run test:e2e`. The config's `webServer` command is `npm run dev` with `reuseExistingServer: true`, so an already running server on port 3000 is reused. Run `npx playwright install chromium` once.
  - `admin.e2e.spec.ts` seeds and removes a `dev@payloadcms.com` test user, so run it against a dev database.
  - `frontend.e2e.spec.ts` is still the template test. It expects the title "Payload Website Template" on `/`, so it currently fails against the SPPDF landing page.

`npm test` runs both suites, but via `pnpm`.

## Troubleshooting

**Calendar or new events don't show up on the site.**
`/` and `/calendar` are rendered at build time and then re-rendered at most every 5 minutes (ISR):

- Saving, publishing or deleting an event in the admin revalidates `/` and `/calendar` immediately.
- Events written by the calendar sync appear within about 5 minutes of the sync finishing. The sync runs hourly.
- The homepage carousel shows the 3 most recent past events and the next 9 upcoming ones. `/calendar` shows the last 12 months and everything upcoming.
- Saving Hlavní stránka or Nastavení webu refreshes every page (menu and footer are shared); Stránka O nás and Členové týmu refresh `/aboutus`; Stránka Kalendář refreshes `/calendar`.

To check that the sync itself works, look for `Google Calendar sync complete: X created, Y updated, Z unpublished, N failed` in the Coolify logs, or for `Error running task` and `GOOGLE_API_KEY environment variable is not set`. Then check that the events exist in Admin → Events.

**`relation "..." does not exist`.**
The database has no schema. See [Database & migrations](#database--migrations). `push` is disabled, including in dev.

**Sync fails with a Google API error.**
Check that the key is valid, that the Calendar API is enabled for its project, and that any key restrictions allow the server. Check that `sppdfmuni@gmail.com` is shared publicly with full event details.

**Some events are missing after a sync.**
Look for `Google Calendar sync: failed to save event` in the logs. Each failing event is logged with its title and Google ID.

**"Skipping deploy calendar sync: no deployment identity env var found".**
Set `DEPLOYMENT_ID`. The hourly schedule still runs regardless.

**Images missing after a redeploy.**
`public/media` is not on a persistent volume. See [Deployment](#deployment-coolify).

**Build fails on Coolify while collecting page data.**
`DATABASE_URL` or `PAYLOAD_SECRET` is not available at build time, the DB is not reachable from the build, or the schema is behind the code (run migrations first).
