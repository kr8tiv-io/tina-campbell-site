import { expect, test, type Browser, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('../qa/003-runway');
const motionDir = path.join(outDir, 'motion');
fs.mkdirSync(motionDir, { recursive: true });

const curve: Array<[number, number]> = [
  [0, 0],
  [0.25, 6],
  [0.5, 62],
  [0.75, 182],
  [1, 302],
  [1.25, 404],
  [1.5, 488],
  [1.75, 566],
  [2, 642],
  [2.25, 718],
  [2.5, 786],
  [2.75, 836],
  [3, 874],
  [3.25, 896],
  [3.5, 908],
  [3.75, 910],
  [6.05, 910],
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
  });
});

async function ready(page: Page): Promise<void> {
  await page.goto('/runway/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'));
  await page.waitForFunction(() => Boolean((window as Window & { __tcMotion?: unknown }).__tcMotion));
  await page.waitForFunction(() => {
    const mode = document.querySelector('[data-catwalk]')?.getAttribute('data-catwalk-ready');
    return mode === 'webgl' || mode === 'css';
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
}

test('runway page', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await ready(page);
  await expect(page.locator('h1')).toHaveText('Runway');
  await expect(page.locator('.catwalk__sub')).toHaveText('Edmonton fashion shows');
  const copy = await page.locator('main').innerText();
  expect(copy).not.toContain('\u2014');
  expect(copy).toContain('Edmonton fashion shows');

  const name = info.project.name;
  const shot =
    name === 'desktop' ? 'desktop-1440' : name === 'mobile' ? 'mobile-390' : name === 'small' ? 'small-360' : 'reduced-1440';

  if (name === 'desktop') {
    await expect(page.locator('[data-catwalk]')).toHaveAttribute('data-catwalk-ready', 'webgl');
    await expect(page.locator('.catwalk__hint-scroll')).toBeVisible();
    const start = await readMotion(page);
    const pinEnd = Number(await page.locator('[data-catwalk]').getAttribute('data-pin-end'));
    const mid = Math.round(pinEnd * 0.45);
    await page.evaluate((y) => {
      (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(y);
    }, mid);
    await page.waitForTimeout(120);
    const middle = await readMotion(page);
    expect(middle.progress).toBeGreaterThan(start.progress + 0.05);
    expect(middle.transform).not.toBe(start.transform);

    await page.evaluate((y) => {
      (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(y);
    }, pinEnd);
    await page.waitForTimeout(120);
    const end = await readMotion(page);
    expect(end.progress).toBeGreaterThan(middle.progress);

    await page.screenshot({ path: path.join(outDir, `${shot}-end.png`) });

    await page.evaluate((y) => {
      (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(y);
    }, mid);
    await page.waitForTimeout(120);
    const back = await readMotion(page);
    expect(Math.abs(back.progress - middle.progress)).toBeLessThan(0.04);

    await page.evaluate(() => {
      (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(0);
    });
    await page.waitForTimeout(150);
    const home = await readMotion(page);
    expect(home.progress).toBeLessThan(0.04);

    await page.screenshot({ path: path.join(outDir, `${shot}-start.png`) });
    await page.evaluate((y) => {
      (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(y);
    }, Math.round(pinEnd * 0.5));
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(outDir, `${shot}-middle.png`) });
    await page.evaluate(() => {
      (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(0);
    });
    await page.waitForTimeout(150);

    const headerHidden = await page.locator('[data-header]').evaluate((el) => el.classList.contains('is-hidden'));
    expect(headerHidden).toBe(false);

    await page.evaluate(() => {
      const longs: number[] = [];
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) longs.push(entry.duration);
      });
      obs.observe({ entryTypes: ['longtask'] });
      (window as Window & { __long?: number[]; __longObs?: PerformanceObserver }).__long = longs;
      (window as Window & { __longObs?: PerformanceObserver }).__longObs = obs;
    });
    const steps = 8;
    for (let i = 1; i <= steps; i += 1) {
      await page.evaluate(
        ({ y }) => {
          (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(y);
        },
        { y: Math.round((pinEnd / steps) * i) },
      );
      await page.waitForTimeout(40);
    }
    const longs = await page.evaluate(() => (window as Window & { __long?: number[] }).__long ?? []);
    const worst = longs.reduce((max, value) => Math.max(max, value), 0);
    expect(worst, `long tasks ${longs.join(',')}`).toBeLessThan(200);

    await page.evaluate((y) => {
      (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(y);
    }, pinEnd + 400);
    await page.waitForTimeout(200);
    const footerTop = await page.locator('footer').evaluate((el) => el.getBoundingClientRect().top);
    expect(footerTop).toBeLessThan(900);
    await page.evaluate(() => {
      (window as Window & { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion?.scrollTo(0);
    });
    await page.waitForTimeout(150);
  }

  if (name === 'reduced') {
    await expect(page.locator('[data-catwalk]')).toHaveAttribute('data-catwalk-mode', 'css');
    await expect(page.locator('.catwalk__canvas')).toBeHidden();
    const scroller = page.locator('[data-catwalk-scroller]');
    const before = await scroller.evaluate((node) => node.scrollLeft);
    await scroller.evaluate((node) => {
      const item = node.querySelector('[data-index]');
      const step = item ? item.getBoundingClientRect().width + 32 : 520;
      node.scrollBy({ left: step, behavior: 'instant' as ScrollBehavior });
    });
    await page.waitForTimeout(80);
    const after = await scroller.evaluate((node) => node.scrollLeft);
    expect(after).toBeGreaterThan(before);
  }

  if (name === 'mobile' || name === 'small') {
    await expect(page.locator('[data-catwalk]')).toHaveAttribute('data-catwalk-mode', 'css');
    await expect(page.locator('.catwalk__hint-swipe')).toBeVisible();
    const scroller = page.locator('[data-catwalk-scroller]');
    await scroller.evaluate((node) => {
      node.scrollLeft = 0;
    });
    const before = await scroller.evaluate((node) => node.scrollLeft);
    await scroller.evaluate((node) => {
      node.scrollBy({ left: 220, behavior: 'instant' as ScrollBehavior });
    });
    await page.waitForTimeout(80);
    const after = await scroller.evaluate((node) => node.scrollLeft);
    expect(after).toBeGreaterThan(before);
    const progress = await page.locator('[data-catwalk]').getAttribute('data-progress');
    expect(Number(progress)).toBeGreaterThan(0);
  }

  if (name !== 'desktop') {
    await page.locator('[data-catwalk-scroller]').evaluate((node) => {
      const hero = node.querySelector<HTMLElement>('[data-index="3"]');
      if (!hero) return;
      node.scrollLeft = Math.max(0, hero.offsetLeft - (node.clientWidth - hero.clientWidth) / 2);
    });
    await page.waitForTimeout(60);
  }

  await page.screenshot({ path: path.join(outDir, `${shot}.png`) });

  const metrics = await page.evaluate(() => {
    const el = document.scrollingElement;
    const broken = [...document.images].filter((img) => img.naturalWidth === 0).map((img) => img.currentSrc || img.src);
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

  const json = await page.locator('script[type="application/ld+json"]').textContent();
  expect(json).toContain('ImageGallery');
  expect(json).toContain('Runway');
});

async function readMotion(page: Page): Promise<{ progress: number; transform: string }> {
  return page.evaluate(() => {
    const section = document.querySelector('[data-catwalk]');
    const track = document.querySelector('[data-catwalk-track]');
    return {
      progress: Number(section?.getAttribute('data-progress') || 0),
      transform: getComputedStyle(track as Element).transform,
    };
  });
}

test('motion clip 02', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'record the desktop clip once');
  test.setTimeout(120_000);
  const recording = await recordClip(browser);
  const trimmed = path.join(motionDir, '02-runway-pinned.webm');
  const probed = execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', recording.file],
    { encoding: 'utf8' },
  );
  const duration = Number(probed.trim());
  const offset = Number.isFinite(duration) ? Math.max(0, duration - 6.12) : recording.offset;
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
  await ready(page);
  await page.waitForFunction(() => document.querySelector('[data-catwalk]')?.getAttribute('data-catwalk-ready') === 'webgl');
  const frameScroll = Number(await page.locator('[data-catwalk]').getAttribute('data-frame-scroll'));
  const pinStart = Number(await page.locator('[data-catwalk]').getAttribute('data-pin-start'));
  const distance = frameScroll * 2;
  const motionStart = Date.now();
  await page.evaluate(
    ({ start, travel, keys, duration }) => {
      const motion = (window as Window & { __tcMotion?: { scrollTo: (y: number) => void } }).__tcMotion;
      if (!motion) return Promise.resolve();
      const total = keys[keys.length - 1][1] || 1;
      const samples = keys.map(([t, c]) => [t / duration, c / total] as [number, number]);
      const at = (u: number): number => {
        let i = 1;
        while (i < samples.length && (samples[i]?.[0] ?? 1) < u) i += 1;
        const a = samples[Math.max(0, i - 1)] ?? [0, 0];
        const b = samples[Math.min(i, samples.length - 1)] ?? a;
        const span = b[0] - a[0] || 1;
        const f = Math.min(1, Math.max(0, (u - a[0]) / span));
        return a[1] + (b[1] - a[1]) * f;
      };
      return new Promise<void>((resolve) => {
        const t0 = performance.now();
        const tick = (now: number): void => {
          const u = Math.min(1, (now - t0) / (duration * 1000));
          motion.scrollTo(start + travel * at(u));
          if (u < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
    },
    { start: pinStart, travel: distance, keys: curve, duration: 6.05 },
  );
  await page.waitForTimeout(80);
  const video = page.video();
  await context.close();
  const src = await video?.path();
  if (!src) throw new Error('no motion recording');
  const raw = path.join(motionDir, '02-runway-raw.webm');
  fs.copyFileSync(src, raw);
  return { file: raw, offset: Math.max(0, (motionStart - opened) / 1000) };
}
