import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

interface ValidationCheck {
  type: 'text' | 'label' | 'selector'
  value: string
  description?: string
}

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'playwright-results', 'screenshots')

const checks: ValidationCheck[] = process.env.VALIDATION_CHECKS
  ? JSON.parse(process.env.VALIDATION_CHECKS)
  : []

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
})

test('rendered page contains expected elements', async ({ page }) => {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20_000 })

  // Allow React to finish rendering after data loads
  await page.waitForTimeout(2000)

  if (checks.length === 0) {
    // No checks — just verify the page rendered without errors
    const screenshotPath = path.join(SCREENSHOT_DIR, `render-${Date.now()}.png`)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`No validation checks specified. Screenshot: ${screenshotPath}`)
    return
  }

  for (const check of checks) {
    const label = check.description ?? check.value
    try {
      switch (check.type) {
        case 'text':
          await expect(page.getByText(check.value, { exact: false }))
            .toBeVisible({ timeout: 6_000 })
          break
        case 'label':
          await expect(page.getByLabel(check.value, { exact: false }))
            .toBeVisible({ timeout: 6_000 })
          break
        case 'selector':
          await expect(page.locator(check.value))
            .toBeVisible({ timeout: 6_000 })
          break
      }
      console.log(`  ✓ Found: "${label}"`)
    } catch {
      const screenshotPath = path.join(SCREENSHOT_DIR, `fail-${Date.now()}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true })
      throw new Error(
        `Element not found: "${label}" (type: ${check.type}, value: "${check.value}")\n` +
        `Screenshot saved to: ${screenshotPath}`
      )
    }
  }

  const screenshotPath = path.join(SCREENSHOT_DIR, `pass-${Date.now()}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`All ${checks.length} checks passed. Screenshot: ${screenshotPath}`)
})
