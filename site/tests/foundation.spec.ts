import { expect, test } from '@playwright/test';
import path from 'node:path';

const outDir = path.resolve('../qa/001-foundation');

test('shell renders without overflow', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('header.site-header')).toBeVisible();
  await expect(page.locator('footer.site-footer')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
  await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'), null, {
    timeout: 6000,
  });
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );

  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement;
    if (!el) return false;
    return el.scrollWidth <= window.innerWidth;
  });
  expect(overflow).toBe(true);

  const broken = await page.evaluate(() =>
    [...document.images].filter((img) => img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
  );
  expect(broken).toEqual([]);
  expect(errors).toEqual([]);

  await page.screenshot({
    path: path.join(outDir, `${info.project.name}.png`),
    fullPage: true,
  });

  if (info.project.name === 'mobile' || info.project.name === 'small') {
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    const menuOverflow = await page.evaluate(() => {
      const el = document.scrollingElement;
      if (!el) return false;
      return el.scrollWidth <= window.innerWidth;
    });
    expect(menuOverflow).toBe(true);
    await page.screenshot({
      path: path.join(outDir, `${info.project.name}-menu.png`),
      fullPage: false,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
  }
});

test('loader runs once per session', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop session only');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/loader-play/);
  await expect(page.locator('#loader')).toBeVisible();
  await page.waitForFunction(() => {
    const count = document.querySelector('[data-loader-count]');
    if (!count || !count.textContent) return false;
    return Number(count.textContent) >= 55;
  });
  await page.screenshot({ path: path.join(outDir, 'loader.png') });
  await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'), null, {
    timeout: 6000,
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/loader-skip/);
  await expect(page.locator('html')).not.toHaveClass(/loader-play/);
  await expect(page.locator('#loader')).toHaveCount(0);
});

test('reduced motion shows content immediately', async ({ page }, info) => {
  test.skip(info.project.name !== 'reduced', 'reduced motion project');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/loader-skip/);
  await expect(page.locator('html')).not.toHaveClass(/loader-play/);
  const opacity = await page.locator('.site-reveal').evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe('1');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Tina Campbell');
});
