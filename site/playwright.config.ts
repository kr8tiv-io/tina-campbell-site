import fs from 'node:fs';
import { defineConfig } from '@playwright/test';

const chromiumCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  '/home/box/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
  '/home/box/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
].filter((value): value is string => Boolean(value));

const chromium = chromiumCandidates.find((candidate) => fs.existsSync(candidate)) ?? chromiumCandidates[0];

const port = process.env.PLAYWRIGHT_PORT ?? '4321';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: 'line',
  use: {
    baseURL,
    headless: true,
    launchOptions: {
      executablePath: chromium,
    },
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.PLAYWRIGHT_PORT,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
    {
      name: 'small',
      use: { viewport: { width: 360, height: 780 }, hasTouch: true, isMobile: true },
    },
    {
      name: 'reduced',
      use: { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
    },
  ],
});
