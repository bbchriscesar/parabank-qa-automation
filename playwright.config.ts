import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const HEADLESS = true;
export default defineConfig({
  testDir: './tests',
  // [INTERVIEW Q]: Why is fullyParallel set to false? Playwright's main selling point is speed through parallelism.
  // [ANSWER]: ParaBank is a shared public test application with an unoptimized database. Running in parallel can cause race conditions or data collisions (e.g., locking accounts while multiple tests try to access them). In a robust enterprise environment, this would be true.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,

  // [INTERVIEW Q]: How do you handle flaky tests in CI?
  // [ANSWER]: Re-running tests automatically (`retries: 2`). If a test passes on the second try, it's flagged as "flaky" in the report. We also capture the trace ONLY on the first retry (`trace: 'on-first-retry'`) to save artifact size but still have debugging data for the flake.
  retries: process.env.CI ? 2 : 0,

  // [INTERVIEW Q]: Why restrict workers to 1 even in CI?
  // [ANSWER]: Same reason as fullyParallel: false. We want sequential execution to avoid hammering the fragile Parabank demo server and causing false negative test failures.
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    // [INTERVIEW Q]: Traces are large. Why not record them for every test?
    // [ANSWER]: Storing traces for all tests consumes massive storage logic and slows down execution. `on-first-retry` is a best-practice compromise: passing tests are fast and traceless, while failing tests get a trace generated automatically on the retry attempt to help debugging.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    headless: HEADLESS,
  },

  timeout: 90000,

  expect: {
    timeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
