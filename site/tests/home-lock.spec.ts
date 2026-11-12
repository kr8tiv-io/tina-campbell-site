import { expect, test, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('../qa/002b-home-visual-lock');
const motionDir = path.join(outDir, 'motion');
fs.mkdirSync(motionDir, { recursive: true });

async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate((target) => window.scrollTo(0, target), y);
  await page.waitForTimeout(450);
}

async function loadImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const images = [...document.images];
    for (const img of images) {
      img.scrollIntoView({ block: 'center', inline: 'nearest' });
      await new Promise((resolve) => setTimeout(resolve, 12));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
  await page.waitForTimeout(250);
}

async function assertInView(page: Page): Promise<void> {
  const hidden = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('h1, h2, h3, .runway__frame img, .sheet__label, .teaser__text, .band h2')];
    return nodes
      .filter((el) => {
        const box = el.getBoundingClientRect();
        const onScreen = box.bottom > 8 && box.top < window.innerHeight - 8 && box.width > 8 && box.height > 8;
        if (!onScreen) return false;
        const style = getComputedStyle(el);
        const opacity = Number.parseFloat(style.opacity);
        return opacity < 0.05 || style.visibility === 'hidden' || style.clipPath.includes('100%');
      })
      .map((el) => el.textContent?.trim().slice(0, 48) || el.tagName);
  });
  expect(hidden, 'on-screen copy or frames stuck hidden').toEqual([]);
}

async function settle(page: Page): Promise<void> {
  await page.waitForFunction(() => Boolean((window as Window & { __tcMotion?: unknown }).__tcMotion));
  await page.evaluate(() => {
    const motion = (
      window as Window & {
        __tcMotion?: {
          gsap: { killTweensOf: (target: string) => void };
          ScrollTrigger: { getAll: () => { kill: (revert?: boolean) => void }[] };
        };
      }
    ).__tcMotion;
    if (!motion) return;
    motion.ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
    motion.gsap.killTweensOf('*');
    document
      .querySelectorAll<HTMLElement>(
        '[data-reveal], [data-reveal] img, [data-runway-track], [data-hero-zoom], [data-hero-shift], [data-hero-copy], [data-statement], [data-statement-sub], .word, .char',
      )
      .forEach((el) => {
        el.style.clipPath = '';
        el.style.transform = '';
        el.style.opacity = '';
        el.style.visibility = '';
      });
    document.documentElement.classList.remove('is-motion');
  });
  await page.waitForTimeout(80);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
  });
});

test('home layout lock', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'));
  await expect(page.locator('h1')).toHaveText('Tina Campbell');
  await expect(page.locator('#runway-label')).toHaveText('The Runway');
  await expect(page.locator('#statement-heading')).toContainText('Edmonton is my runway.');
  await expect(page.locator('#teaser-heading')).toHaveText('The Red Gown');
  await expect(page.locator('#band-heading')).toContainText("Let's make something bold.");
  await expect(page.getByRole('link', { name: 'See all fashion work' })).toHaveAttribute('href', '/fashion-editorial/');
  await expect(page.getByRole('link', { name: 'View the series' })).toHaveAttribute('href', '/series/the-red-gown/');

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
  expect(copy).toContain('Edmonton is my runway.');
  expect(copy).toContain('Fashion, portraits, bridal and runway, shot on location around the city.');

  await loadImages(page);
  await page.evaluate(() => document.fonts.ready);

  const name = info.project.name;
  const shot = name === 'desktop' ? 'desktop-1440' : name === 'mobile' ? 'mobile-390' : name === 'small' ? 'small-360' : 'reduced-1440';

  await page.screenshot({ path: path.join(outDir, `${shot}-hero.png`) });

  await page.locator('#runway-label').evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, `${shot}-runway.png`) });
  await scrollTo(page, 0);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await scrollTo(page, Math.round(height * 0.45));
  await assertInView(page);
  await page.screenshot({ path: path.join(outDir, `${shot}-mid.png`) });

  await scrollTo(page, height);
  await assertInView(page);
  await page.screenshot({ path: path.join(outDir, `${shot}-bottom.png`) });

  await scrollTo(page, Math.round(height * 0.22));
  await assertInView(page);
  await page.screenshot({ path: path.join(outDir, `${shot}-return.png`) });

  if (name === 'mobile' || name === 'small') {
    const bar = page.locator('[data-book-bar]');
    await scrollTo(page, 400);
    await expect(bar).toBeVisible();
    await page.locator('[data-band]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await expect(bar).toBeHidden();
    const scroller = page.locator('[data-runway-viewport]');
    await scroller.evaluate((node) => {
      node.scrollLeft = 0;
    });
    const before = await scroller.evaluate((node) => node.scrollLeft);
    await scroller.evaluate((node) => {
      node.scrollBy({ left: 240, behavior: 'instant' as ScrollBehavior });
    });
    await page.waitForTimeout(180);
    const after = await scroller.evaluate((node) => node.scrollLeft);
    expect(after).toBeGreaterThan(before);
  }

  await scrollTo(page, 0);
  await settle(page);
  await page.screenshot({ path: path.join(outDir, `${shot}.png`), fullPage: true });

  const metrics = await page.evaluate(() => {
    const el = document.scrollingElement;
    const title = document.querySelector('.hero__title');
    const titleBox = title?.getBoundingClientRect();
    const broken = [...document.images].filter((img) => img.naturalWidth === 0).map((img) => img.currentSrc || img.src);
    return {
      overflow: !!el && el.scrollWidth <= window.innerWidth + 1,
      scrollWidth: el?.scrollWidth ?? 0,
      innerWidth: window.innerWidth,
      titleRight: titleBox?.right ?? 0,
      titleLeft: titleBox?.left ?? 0,
      broken,
    };
  });
  expect(metrics.broken).toEqual([]);
  expect(metrics.overflow, JSON.stringify(metrics)).toBe(true);
  expect(metrics.titleLeft).toBeGreaterThanOrEqual(0);
  expect(metrics.titleRight).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(errors).toEqual([]);
});

async function recordClip(browser: Browser, fileName: string, run: (page: Page) => Promise<void>): Promise<string> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'no-preference',
    recordVideo: { dir: motionDir, size: { width: 1280, height: 720 } },
    baseURL: `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4321'}`,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
    // Headless Chromium can report pointer: none, which skips Lenis and the
    // runway pin. Clip 01 and clip 02 are the fine-pointer desktop reference.
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      const real = orig(query);
      if (query.includes('pointer: fine') || query.includes('hover: hover')) {
        return new Proxy(real, {
          get(target, prop) {
            if (prop === 'matches') return true;
            const value = Reflect.get(target, prop, target);
            return typeof value === 'function' ? value.bind(target) : value;
          },
        });
      }
      return real;
    };
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'));
  await page.waitForFunction(() => Boolean((window as Window & { __tcMotion?: unknown }).__tcMotion));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await run(page);
  const video = page.video();
  await context.close();
  const src = await video?.path();
  if (!src) throw new Error(`no video for ${fileName}`);
  const dest = path.join(motionDir, fileName);
  fs.copyFileSync(src, dest);
  return dest;
}

test('motion recordings', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'record the desktop clip once');
  test.setTimeout(120_000);

  await recordClip(browser, '01-home-scroll.webm', async (page) => {
    await page.waitForFunction(() => document.documentElement.classList.contains('is-motion'));
    // Let the name SplitText finish, then hold the hero the way clip 01 opens.
    await page.waitForTimeout(2100);
    const delta = await page.evaluate(() => {
      const pin = document.querySelector('[data-runway-pin]');
      if (!pin) return 640;
      const rect = pin.getBoundingClientRect();
      const toCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      // A little into the pin so the hero has left and the row sits in the centre.
      return Math.round(toCenter + window.innerHeight * 0.2);
    });
    const steps = 11;
    const step = Math.max(24, Math.round(delta / steps));
    for (let i = 0; i < steps; i += 1) {
      await page.mouse.wheel(0, step);
      await page.waitForTimeout(150);
    }
    // Lenis eases out with The Runway settled in the centre.
    await page.waitForTimeout(1500);
  });

  await recordClip(browser, '02-home-runway.webm', async (page) => {
    await page.waitForFunction(() => document.documentElement.classList.contains('is-motion'));
    const delta = await page.evaluate(() => {
      const pin = document.querySelector('[data-runway-pin]');
      if (!pin) return 700;
      const rect = pin.getBoundingClientRect();
      return Math.max(0, Math.round(rect.top + rect.height / 2 - window.innerHeight / 2));
    });
    // Reach the pin quickly, then scrub sideways for the rest of the take.
    const approach = 5;
    const approachStep = Math.max(40, Math.round(delta / approach));
    for (let i = 0; i < approach; i += 1) {
      await page.mouse.wheel(0, approachStep);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(450);
    for (let i = 0; i < 14; i += 1) {
      await page.mouse.wheel(0, 34);
      await page.waitForTimeout(170);
    }
    await page.waitForTimeout(500);
  });
});
