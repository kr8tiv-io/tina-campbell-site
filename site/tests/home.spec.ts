import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('../qa/002-home');
fs.mkdirSync(outDir, { recursive: true });

async function scrollTo(page: import('@playwright/test').Page, y: number): Promise<void> {
  await page.evaluate((target) => window.scrollTo(0, target), y);
  await page.waitForTimeout(500);
}

async function loadImages(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(async () => {
    const images = [...document.images];
    for (const img of images) {
      img.scrollIntoView({ block: 'center', inline: 'nearest' });
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
  await page.waitForTimeout(400);
}

test('home matches layout and motion', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'));
  await expect(page.locator('h1')).toHaveText('Tina Campbell');
  await expect(page.locator('#runway-label')).toHaveText('The Runway');
  await expect(page.locator('#statement-heading')).toContainText('Edmonton is my runway.');
  await expect(page.locator('#teaser-heading')).toHaveText('The Red Gown');
  await expect(page.locator('#band-heading')).toContainText("Let's make something bold.");
  await expect(page.getByRole('link', { name: 'See all fashion work' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'View the series' })).toHaveAttribute(
    'href',
    '/series/the-red-gown/',
  );

  const heroImg = page.locator('.hero__zoom img');
  await expect(heroImg).toHaveAttribute('fetchpriority', 'high');
  const loading = await heroImg.getAttribute('loading');
  expect(loading === null || loading === 'eager').toBe(true);

  const json = await page.locator('script[type="application/ld+json"]').textContent();
  expect(json).toContain('ProfessionalService');
  expect(json).toContain('LocalBusiness');
  expect(json).toContain('Person');
  expect(json).toContain('Tina Campbell');

  const copy = await page.locator('main').evaluate((el) => el.textContent || '');
  expect(copy).not.toContain('\u2014');
  expect(copy).toContain('No. 001 / Alberta Legislature, Edmonton');
  expect(copy).toContain('Fashion, portraits, bridal and runway, shot on location around the city.');

  await loadImages(page);
  await page.evaluate(() => document.fonts.ready);

  const name = info.project.name;
  await page.screenshot({ path: path.join(outDir, `${name}-hero.png`) });

  await page.locator('#runway-label').evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, `${name}-runway.png`) });
  await scrollTo(page, 0);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await scrollTo(page, Math.round(height * 0.42));
  await assertInView(page);
  await page.screenshot({ path: path.join(outDir, `${name}-mid.png`) });

  await scrollTo(page, height);
  await assertInView(page);
  await page.screenshot({ path: path.join(outDir, `${name}-bottom.png`) });

  await scrollTo(page, Math.round(height * 0.28));
  await assertInView(page);
  await page.screenshot({ path: path.join(outDir, `${name}-return.png`) });

  await scrollTo(page, 0);
  await page.screenshot({ path: path.join(outDir, `${name}-full.png`), fullPage: true });

  const metrics = await page.evaluate(() => {
    const el = document.scrollingElement;
    const broken = [...document.images]
      .filter((img) => img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src);
    return {
      overflow: !!el && el.scrollWidth <= window.innerWidth + 1,
      scrollWidth: el?.scrollWidth ?? 0,
      innerWidth: window.innerWidth,
      broken,
    };
  });
  expect(metrics.broken).toEqual([]);
  expect(metrics.overflow, JSON.stringify(metrics)).toBe(true);
  expect(errors).toEqual([]);

  if (name === 'mobile' || name === 'small') {
    const bar = page.locator('[data-book-bar]');
    await expect(bar).toBeVisible();
    await page.locator('[data-band]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(bar).toBeHidden();
    const scroller = page.locator('[data-runway-viewport]');
    await scroller.evaluate((node) => {
      node.scrollLeft = 0;
    });
    const before = await scroller.evaluate((node) => node.scrollLeft);
    await scroller.evaluate((node) => {
      node.scrollBy({ left: 220, behavior: 'instant' as ScrollBehavior });
    });
    await page.waitForTimeout(200);
    const after = await scroller.evaluate((node) => node.scrollLeft);
    if (name === 'mobile') expect(after).toBeGreaterThan(before);
  }
});

test('phone film strip fills the viewport', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', '390 phone only');
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'));
  await page.waitForFunction(
    () => {
      const api = (window as unknown as { __SCENE_TL__?: Record<string, { frames?: () => unknown }> }).__SCENE_TL__?.[
        '02A'
      ];
      return Boolean(api && typeof api.frames === 'function' && document.querySelector('.sheet.is-film-gl'));
    },
    null,
    { timeout: 20_000 },
  );

  const read = () =>
    page.evaluate(() => {
      const api = (
        window as unknown as {
          __SCENE_TL__?: Record<string, { frames: () => Array<{ quad: Array<{ x: number; y: number }> }> }>;
        }
      ).__SCENE_TL__?.['02A'];
      const frames = api?.frames() ?? [];
      const width = window.innerWidth;
      const height = window.innerHeight;
      let centre = 0;
      let best = Infinity;
      frames.forEach((frame, index) => {
        const x = frame.quad.reduce((sum, point) => sum + point.x, 0) / 4;
        const dist = Math.abs(x - width / 2);
        if (dist < best) {
          best = dist;
          centre = index;
        }
      });
      const quad = frames[centre]?.quad ?? [];
      const xs = quad.map((point) => point.x);
      const ys = quad.map((point) => point.y);
      const allX = frames.flatMap((frame) => frame.quad.map((point) => point.x));
      const root = document.scrollingElement;
      return {
        centre,
        bleedL: Math.min(...allX),
        bleedR: Math.max(...allX),
        frameW: Math.max(...xs) - Math.min(...xs),
        frameH: Math.max(...ys) - Math.min(...ys),
        width,
        height,
        scrollWidth: root?.scrollWidth ?? 0,
      };
    });

  const jump = async (progress: number) => {
    await page.evaluate((value) => {
      const motion = (
        window as unknown as {
          __tcMotion?: {
            scrollTo: (target: number) => void;
            ScrollTrigger: { getAll: () => Array<{ trigger?: Element; start: number; end: number }> };
          };
        }
      ).__tcMotion;
      const trigger = motion?.ScrollTrigger.getAll().find((item) => item.trigger?.hasAttribute('data-sheet-scrub'));
      if (!trigger || !motion) return;
      const y = trigger.start + value * Math.max(1, trigger.end - trigger.start);
      motion.scrollTo(y);
      window.scrollTo(0, y);
    }, progress);
    await page.waitForTimeout(1200);
  };

  await jump(0.5);
  const mid = await read();
  expect(mid.bleedL, JSON.stringify(mid)).toBeLessThanOrEqual(0);
  expect(mid.bleedR).toBeGreaterThanOrEqual(mid.width);
  expect(mid.frameH).toBeGreaterThanOrEqual(0.3 * mid.height);
  expect(mid.frameW).toBeGreaterThanOrEqual(0.52 * mid.width);
  expect(mid.scrollWidth).toBe(mid.width);

  const down: number[] = [];
  for (const progress of [0.04, 0.1667, 0.3333, 0.5, 0.6667, 0.8333, 0.96]) {
    await jump(progress);
    down.push((await read()).centre);
  }
  const up: number[] = [];
  for (const progress of [0.96, 0.8333, 0.6667, 0.5, 0.3333, 0.1667, 0.04]) {
    await jump(progress);
    up.push((await read()).centre);
  }
  expect(down, `down ${down.join(',')}`).toEqual([0, 1, 2, 3, 4, 5, 6]);
  expect(up, `up ${up.join(',')}`).toEqual([6, 5, 4, 3, 2, 1, 0]);
  const settled = await read();
  expect(settled.scrollWidth).toBe(settled.width);
});

async function assertInView(page: import('@playwright/test').Page): Promise<void> {
  const hidden = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('h1, h2, h3, .runway__frame img, .sheet__label, .teaser__text')];
    return nodes
      .filter((el) => {
        const box = el.getBoundingClientRect();
        const onScreen = box.bottom > 8 && box.top < window.innerHeight - 8 && box.width > 8 && box.height > 8;
        if (!onScreen) return false;
        const style = getComputedStyle(el);
        const opacity = Number.parseFloat(style.opacity);
        return opacity < 0.05 || style.visibility === 'hidden' || style.clipPath.includes('100%');
      })
      .map((el) => (el.textContent || el.tagName).trim().slice(0, 60));
  });
  expect(hidden).toEqual([]);
}
