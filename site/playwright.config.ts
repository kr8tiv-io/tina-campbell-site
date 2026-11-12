import { defineConfig } from '@playwright/test';

const chromium =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  '/home/box/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    headless: true,
    launchOptions: {
      executablePath: chromium,
    },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
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
