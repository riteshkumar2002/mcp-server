import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './playwright',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-results/results.json' }],
  ],
  outputDir: 'playwright-results/artifacts',
})
