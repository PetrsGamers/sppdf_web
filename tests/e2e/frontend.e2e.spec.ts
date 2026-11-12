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
})
