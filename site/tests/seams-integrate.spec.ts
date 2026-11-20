import { expect, test } from '@playwright/test';

const routes = ['/', '/work/'];

test('real routes keep one heading, no overflow, and no lab URLs', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'), null, {
      timeout: 8000,
    });
    const html = await page.content();
    expect(html, route).not.toContain('/motion-lab/');
    expect(await page.locator('h1').count(), route).toBe(1);
    const overflow = await page.evaluate(() => {
      const el = document.scrollingElement;
      if (!el) return false;
      return el.scrollWidth <= window.innerWidth + 1;
    });
    expect(overflow, route).toBe(true);
  }
});
