import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * ParaBank QA Automation — Playwright Configuration
 *
 * @see https://playwright.dev/docs/test-configuration
 */

/* ── Toggle headless mode ── */
/* Set to `false` to see the browser UI, `true` to run headless */
const HEADLESS = false;
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Tests have sequential dependencies
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],

  use: {
    /* Base URL for page navigations */
    baseURL: process.env.BASE_URL,

    /* Capture trace on first retry for debugging */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Timeout per action */
    actionTimeout: 15000,

    /* Navigation timeout */
    navigationTimeout: 30000,

    /* Headless mode toggle */
    headless: HEADLESS,
  },

  /* Global test timeout */
  timeout: 90000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
  },

  projects: [
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
