import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Browser, type Page } from '@playwright/test';

const outDir = path.resolve('../qa/005-editorial');
const motionDir = path.join(outDir, 'motion');
fs.mkdirSync(motionDir, { recursive: true });

const series = [
  'the-red-gown',
  'legislature-in-black',
  'red-in-snow',
  'runway-nights',
  'blue-hour',
];

const label: Record<string, string> = {
  desktop: 'desktop-1440',
  mobile: 'mobile-390',
  small: 'small-360',
  reduced: 'reduced-1440',
};

async function settle(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
  });
}

async function loadImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const images = [...document.images];
    for (const img of images) {
      img.scrollIntoView({ block: 'center', inline: 'nearest' });
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
}

async function waitPhase(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const phase = document.documentElement.dataset.fePhase;
    return phase === 'done' || phase === 'static';
  });
  await page.evaluate(() => document.fonts.ready);
}

async function assertClean(page: Page, errors: string[]): Promise<void> {
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
  expect(metrics.broken, JSON.stringify(metrics)).toEqual([]);
  expect(metrics.overflow, JSON.stringify(metrics)).toBe(true);
  expect(errors).toEqual([]);
}

test.describe('editorial pages', () => {
  test.beforeEach(async ({ page }) => {
    await settle(page);
  });

  test('fashion editorial layout, pin, and copy', async ({ page }, info) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const name = label[info.project.name] ?? info.project.name;
    await page.goto('/fashion-editorial/', { waitUntil: 'domcontentloaded' });
    await waitPhase(page);

    await expect(page.locator('h1')).toContainText('Fashion');
    await expect(page.locator('h1')).toContainText('Editorial');
    await expect(page.locator('.fe-lead')).toContainText('Gowns, grit and good light');
    await expect(page.locator('.fe-lead')).toContainText('shot all over Edmonton.');
    await expect(page.locator('[data-fe-quote]')).toContainText('Confidence');
    await expect(page.locator('[data-fe-quote]')).toContainText('looks good');
    await expect(page.locator('[data-fe-quote]')).toContainText('on everyone.');
    await expect(page.locator('#fe-collab')).toHaveText("Designers, models, agencies: let's make something.");
    await expect(page.locator('.fe-collab__note')).toContainText('mood board');
    await expect(page.getByRole('link', { name: 'Collaborate' })).toHaveAttribute('href', '/book/?type=fashion');
    await expect(page.locator('[data-series-link="the-red-gown"]')).toHaveAttribute('href', '/series/the-red-gown/');
    await expect(page.locator('nav[aria-label="Primary"] a[href="/fashion-editorial/"]')).toHaveAttribute(
      'aria-current',
      'page',
    );

    const copy = await page.locator('main').innerText();
    expect(copy).not.toContain('\u2014');
    expect(copy).not.toContain('\u2013');

    const json = await page.locator('script[type="application/ld+json"]').textContent();
    expect(json).toContain('ImageGallery');

    await page.screenshot({ path: path.join(outDir, `${name}-fashion-split.png`) });
    const pull = page.locator('[data-fe-pull]');
    await pull.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, `${name}-fashion-quote.png`) });
    await page.locator('.fe-collab').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `${name}-fashion-collab.png`) });

    if (info.project.name === 'desktop') {
      await page.evaluate(() => {
        const motion = (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion;
        motion?.scrollTo(0);
      });
      await page.waitForTimeout(300);
      const distance = Number(await page.locator('[data-fe-split]').getAttribute('data-pin-distance'));
      expect(distance).toBeGreaterThan(80);
      const before = await page.evaluate(() => {
        const track = document.querySelector('[data-fe-track]');
        const left = document.querySelector('.fe-left');
        return {
          transform: track ? getComputedStyle(track).transform : '',
          top: left?.getBoundingClientRect().top ?? 0,
        };
      });
      await page.evaluate((y) => {
        const motion = (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion;
        motion?.scrollTo(y);
      }, Math.round(distance * 0.62));
      await page.waitForTimeout(500);
      const mid = await page.evaluate(() => {
        const track = document.querySelector('[data-fe-track]');
        const left = document.querySelector('.fe-left');
        const section = document.querySelector('[data-fe-split]');
        return {
          transform: track ? getComputedStyle(track).transform : '',
          top: left?.getBoundingClientRect().top ?? 0,
          progress: Number(section?.getAttribute('data-pin-progress') || 0),
          active: section?.getAttribute('data-active-series') || '',
        };
      });
      expect(mid.transform).not.toBe(before.transform);
      expect(mid.progress).toBeGreaterThan(0.4);
      expect(Math.abs(mid.top - before.top)).toBeLessThan(12);
      await page.screenshot({ path: path.join(outDir, `${name}-fashion-pin.png`) });

      await page.evaluate(() => {
        const motion = (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion;
        motion?.scrollTo(0);
      });
      await page.waitForTimeout(400);
      const back = await page.evaluate(() => {
        const section = document.querySelector('[data-fe-split]');
        return Number(section?.getAttribute('data-pin-progress') || 0);
      });
      expect(back).toBeLessThan(0.08);
    }

    await loadImages(page);
    await page.evaluate(() => {
      const motion = (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion;
      motion?.scrollTo(0);
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
    await assertClean(page, errors);
  });

  test('series stories', async ({ page }, info) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    const name = label[info.project.name] ?? info.project.name;

    for (const slug of series) {
      await page.goto(`/series/${slug}/`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      await loadImages(page);
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      const title = (await h1.innerText()).replace(/\s+/g, ' ');
      expect(title.length).toBeGreaterThan(3);
      await expect(page.locator('.cover__meta')).toContainText('Series');
      await expect(page.locator('.cover__meta')).toContainText('Edmonton');
      await expect(page.locator('.credit').first()).toContainText('Credit to come');
      await expect(page.locator('.credit').last()).not.toContainText('Credit to come');
      const next = page.locator('a.next');
      await expect(next).toBeVisible();
      await expect(next.locator('[data-flip-id]')).toHaveCount(1);
      await expect(page.locator('.cover [data-flip-id]')).toHaveCount(1);
      const json = await page.locator('script[type="application/ld+json"]').textContent();
      expect(json).toContain('BreadcrumbList');
      expect(json).toContain('ImageGallery');
      expect(json).toContain('Fashion & Editorial');
      const copy = await page.locator('main').innerText();
      expect(copy).not.toContain('\u2014');
      await assertClean(page, errors);
      if (slug === 'legislature-in-black') {
        await expect(h1).toContainText('Legislature');
        await expect(h1).toContainText('Black');
        await page.screenshot({ path: path.join(outDir, `${name}-series.png`), fullPage: true });
        await page.screenshot({ path: path.join(outDir, `${name}-series-cover.png`) });
        await page.locator('.spread').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1400);
        await page.screenshot({ path: path.join(outDir, `${name}-series-spread.png`) });
        await page.locator('a.next').scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(outDir, `${name}-series-next.png`) });
      }
    }
  });

  test('portraits bridal couples', async ({ page }, info) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    const name = label[info.project.name] ?? info.project.name;
    await page.goto('/portraits-bridal-couples/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await loadImages(page);
    await expect(page.locator('h1')).toHaveText('Portraits, Bridal and Couples');
    await expect(page.locator('#ch-01')).toHaveText('Portraits');
    await expect(page.locator('#ch-02')).toHaveText('Bridal');
    await expect(page.locator('#ch-03')).toHaveText('Couples');
    await expect(page.locator('a[href="/work/?filter=portraits"]')).toHaveText('See the gallery');
    await expect(page.locator('a[href="/work/?filter=bridal"]')).toHaveText('See the gallery');
    await expect(page.locator('a[href="/work/?filter=couples"]')).toHaveText('See the gallery');
    const copy = await page.locator('main').innerText();
    expect(copy).toContain("I'll guide every pose");
    expect(copy).toContain('Staircases, glass and great light.');
    expect(copy).not.toContain('\u2014');
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    expect(json).toContain('ImageGallery');
    await page.screenshot({ path: path.join(outDir, `${name}-portraits.png`), fullPage: true });
    await page.screenshot({ path: path.join(outDir, `${name}-portraits-top.png`) });
    await page.locator('#ch-02').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, `${name}-portraits-bridal.png`) });
    await page.locator('#ch-03').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `${name}-portraits-couples.png`) });
    await assertClean(page, errors);

    if (info.project.name === 'reduced') {
      const hidden = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('h1, h2, p, .chapter__link')];
        return nodes
          .filter((el) => {
            const style = getComputedStyle(el);
            return Number.parseFloat(style.opacity) < 0.05 || style.visibility === 'hidden';
          })
          .map((el) => (el.textContent || '').trim().slice(0, 40));
      });
      expect(hidden).toEqual([]);
    }
  });
});

test('motion clip 04 editorial split', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'record the desktop clip once');
  test.setTimeout(120_000);
  const recording = await recordClip(browser);
  const trimmed = path.join(motionDir, '04-editorial-split.webm');
  const probed = execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', recording.file],
    { encoding: 'utf8' },
  );
  const duration = Number(probed.trim());
  const offset = Number.isFinite(duration) ? Math.min(recording.offset, Math.max(0, duration - 6.08)) : recording.offset;
  execFileSync('ffmpeg', [
    '-y',
    '-ss',
    offset.toFixed(3),
    '-i',
    recording.file,
    '-t',
    '6.04',
    '-an',
    '-c:v',
    'libvpx-vp9',
    '-crf',
    '32',
    '-b:v',
    '0',
    trimmed,
  ]);
  expect(fs.existsSync(trimmed)).toBe(true);
});

async function recordClip(browser: Browser): Promise<{ file: string; offset: number }> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'no-preference',
    recordVideo: { dir: motionDir, size: { width: 1280, height: 720 } },
    baseURL: `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4321'}`,
  });
  const opened = Date.now();
  const page = await context.newPage();
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      const real = orig(query);
      if (query.includes('prefers-reduced-motion')) {
        return new Proxy(real, {
          get(target, prop) {
            if (prop === 'matches') return false;
            const value = Reflect.get(target, prop, target);
            return typeof value === 'function' ? value.bind(target) : value;
          },
        });
      }
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
  await page.goto('/fashion-editorial/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.fePhase === 'play');
  const motionStart = Date.now();
  await page.waitForFunction(() => document.documentElement.dataset.fePhase === 'done', undefined, { timeout: 12_000 });
  // Hold past the clip length so a short encoder flush still keeps the full reveal.
  await page.waitForTimeout(2800);
  const video = page.video();
  await context.close();
  const src = await video?.path();
  if (!src) throw new Error('no motion recording');
  const raw = path.join(motionDir, '04-editorial-raw.webm');
  fs.copyFileSync(src, raw);
  return { file: raw, offset: Math.max(0, (motionStart - opened) / 1000) };
}
