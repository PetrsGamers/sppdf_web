const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

// The site's own pages. Template routes (/posts, /search, /[slug]) are left out of the sitemap.
const SITE_PATHS = ['/', '/aboutus', '/calendar']

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  transform: async (config, path) =>
    SITE_PATHS.includes(path)
      ? {
          loc: path,
          changefreq: config.changefreq,
          priority: config.priority,
          lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        }
      : null,
  additionalPaths: async (config) =>
    Promise.all(SITE_PATHS.map((path) => config.transform(config, path))),
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
  },
}
