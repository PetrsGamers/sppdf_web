import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/SPPDF/)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('can load calendar and about pages', async ({ page }) => {
    await page.goto('http://localhost:3000/calendar')
    await expect(page).toHaveTitle(/Kalendář akcí/)
    await page.goto('http://localhost:3000/aboutus')
    await expect(page).toHaveTitle(/O nás/)
  })

  test('shows the site-styled 404 page for unknown URLs', async ({ page }) => {
    for (const path of ['/neexistuje', '/a/b/c']) {
      const response = await page.goto(`http://localhost:3000${path}`)
      expect(response?.status(), path).toBe(404)
      await expect(page.locator('main a[href="/"]'), path).toBeVisible()
      await expect(page.locator('img[alt="Payload Logo"]'), path).toHaveCount(0)
    }
  })

  test('mobile menu opens, navigates and closes', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 800 } })
    const page = await context.newPage()
    await page.goto('http://localhost:3000/')

    const menu = page.locator('#mobile-menu')
    await expect(menu).toHaveCount(0)
    await page.getByRole('button', { name: 'Otevřít menu' }).click()
    await menu.locator('a[href="/aboutus"]').click()

    await expect(page).toHaveURL(/\/aboutus$/)
    await expect(menu).toHaveCount(0)
    await context.close()
  })

  test('links Facebook and Instagram in the menu and the footer', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    for (const href of ['https://www.facebook.com/sppdfmuni', 'https://www.instagram.com/sppdf_muni/']) {
      await expect(page.locator(`nav a[href="${href}"]`), href).toBeVisible()
      await expect(page.locator(`footer a[href="${href}"]`), href).toHaveAttribute('target', '_blank')
    }
  })

  test('sends security headers and hides x-powered-by', async ({ request }) => {
    const headers = (await request.get('http://localhost:3000/')).headers()
    expect(headers['strict-transport-security']).toContain('max-age=')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(headers['x-powered-by']).toBeUndefined()
  })

  test('sitemap lists only the site pages', async ({ request }) => {
    const xml = await (await request.get('http://localhost:3000/sitemap.xml')).text()
    expect(xml).toContain('/aboutus</loc>')
    expect(xml).toContain('/calendar</loc>')
    expect(xml).not.toContain('/posts')
    expect(xml).not.toContain('/search')
  })

  test('template collections are closed to anonymous API reads', async ({ request }) => {
    for (const slug of ['pages', 'posts', 'categories', 'forms', 'search', 'redirects']) {
      const response = await request.get(`http://localhost:3000/api/${slug}`)
      expect(response.status(), slug).toBe(200)
      expect((await response.json()).totalDocs, slug).toBe(0)
    }
    for (const slug of ['header', 'footer']) {
      expect((await request.get(`http://localhost:3000/api/globals/${slug}`)).status(), slug).toBe(403)
    }
    expect((await request.get('http://localhost:3000/api/events')).status()).toBe(200)
  })
})
