import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const outDir = path.resolve('../qa/004-work');
const motionDir = path.join(outDir, 'motion');
fs.mkdirSync(motionDir, { recursive: true });

async function quiet(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  return errors;
}

async function openWork(page: Page, url = '/work/'): Promise<void> {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('loader-skip'));
  await page.waitForFunction(() => document.documentElement.dataset.workReady, null, { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !document.documentElement.classList.contains('work-intro'));
}

async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate((yy) => {
    const motion = (window as unknown as { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion;
    if (motion) motion.scrollTo(yy);
    else window.scrollTo(0, yy);
  }, y);
  await page.waitForTimeout(80);
}

async function waitVisibleGl(page: Page): Promise<void> {
  await page
    .waitForFunction(() => {
      const tiles = [...document.querySelectorAll<HTMLElement>('.tile:not(.is-filtered)')];
      const view = tiles.filter((tile) => {
        const rect = tile.getBoundingClientRect();
        return rect.bottom > 12 && rect.top < window.innerHeight - 12 && rect.height > 24;
      });
      if (view.length === 0) return false;
      return view.every((tile) => {
        const img = tile.querySelector('img');
        return tile.classList.contains('is-gl') && !!img && img.complete && img.naturalWidth > 0;
      });
    }, null, { timeout: 12_000 })
    .catch(() => undefined);
  await page.waitForTimeout(160);
}

async function loadImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const motion = (window as unknown as { __tcMotion?: { scrollTo: (y: number) => void } }).__tcMotion;
    const images = [...document.images];
    for (const img of images) {
      const top = img.getBoundingClientRect().top + window.scrollY - 80;
      if (motion) motion.scrollTo(Math.max(0, top));
      else window.scrollTo(0, Math.max(0, top));
      if (img.loading === 'lazy') img.loading = 'eager';
      if (!img.complete) await new Promise((resolve) => setTimeout(resolve, 30));
    }
    if (motion) motion.scrollTo(0);
    else window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    () => [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    null,
    { timeout: 60_000 },
  );
}

async function stitch(page: Page, dest: string, gl: boolean): Promise<void> {
  const dir = path.join('/tmp', `tc-stitch-${path.basename(dest, '.png')}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(() => {
    const cursor = document.querySelector<HTMLElement>('.cursor');
    if (cursor) cursor.style.opacity = '0';
  });
  await scrollTo(page, 0);
  if (gl) await waitVisibleGl(page);
  const meta = await page.evaluate(() => {
    const header = document.querySelector('header');
    return {
      height: document.scrollingElement?.scrollHeight ?? 0,
      vh: window.innerHeight,
      headerH: Math.round(header?.getBoundingClientRect().height ?? 96),
    };
  });
  const step = Math.max(120, meta.vh - meta.headerH);
  const positions = [0];
  while (positions[positions.length - 1] + meta.vh < meta.height - 2) {
    const next = Math.min(positions[positions.length - 1] + step, Math.max(0, meta.height - meta.vh));
    if (next <= positions[positions.length - 1]) break;
    positions.push(next);
  }
  const files: string[] = [];
  for (let i = 0; i < positions.length; i += 1) {
    await scrollTo(page, positions[i]);
    if (gl) await waitVisibleGl(page);
    else await page.waitForTimeout(60);
    const file = path.join(dir, `s${String(i).padStart(2, '0')}.png`);
    await page.screenshot({ path: file });
    files.push(file);
  }
  const script = `
from PIL import Image
import sys
dest, header_s, pos_s, *files = sys.argv[1:]
header = int(header_s)
positions = [int(v) for v in pos_s.split(',')]
ims = [Image.open(f).convert('RGB') for f in files]
w, vh = ims[0].size
parts = [ims[0]]
for i in range(1, len(ims)):
    row = (positions[i - 1] + vh) - positions[i]
    row = max(0, min(vh - 1, row))
    parts.append(ims[i].crop((0, row, w, vh)))
total = sum(p.height for p in parts)
canvas = Image.new('RGB', (w, total), (12, 12, 15))
y = 0
for part in parts:
    canvas.paste(part, (0, y))
    y += part.height
canvas.save(dest)
print(dest, canvas.size)
`;
  execFileSync('python3', ['-c', script, dest, String(meta.headerH), positions.join(','), ...files], {
    stdio: 'inherit',
  });
  fs.rmSync(dir, { recursive: true, force: true });
  await scrollTo(page, 0);
}

test('work index noir grid, filters and hover', async ({ page }, info) => {
  test.setTimeout(240_000);
  const errors = await quiet(page);
  const project = info.project.name;
  const gl = project === 'desktop';
  await openWork(page);

  await expect(page.locator('h1')).toHaveText('Work');
  await expect(page.locator('.work-count')).toContainText('frames');
  await expect(page.locator('.work-empty')).toBeHidden();
  const total = await page.locator('.tile').count();
  expect(total).toBeGreaterThan(60);
  await expect(page.locator('[data-count]')).toHaveText(String(total));

  for (const filter of ['fashion', 'runway', 'portraits', 'bridal', 'couples', 'edmonton']) {
    expect(await page.locator(`.tile[data-filter="${filter}"]`).count()).toBeGreaterThan(0);
  }

  await expect(page.locator('[data-id="fb_013_signature"] a')).toHaveAttribute('href', '/series/the-red-gown/');
  await expect(page.locator('[data-id="fb_013_signature"] a')).toHaveAttribute('data-astro-prefetch', 'false');
  await expect(page.locator('[data-id="fb_013_signature"] img')).toHaveAttribute('data-flip-id', 'fb_013_signature');

  const copy = await page.locator('main').evaluate((el) => el.textContent || '');
  expect(copy).not.toContain('\u2014');
  expect(copy).toContain('Nothing here yet. Try another filter.');

  const columns = await page.locator('.work-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  if (project === 'desktop' || project === 'reduced') expect(columns).toBe(12);
  else expect(columns).toBe(2);

  if (gl) {
    await page.waitForSelector('html.work-gl .tile.is-gl', { timeout: 15_000 });
    await waitVisibleGl(page);
    const hero = page.locator('[data-id="fb_013_signature"]');
    const small = page.locator('.tile--small').first();
    const heroBox = await hero.boundingBox();
    const smallBox = await small.boundingBox();
    expect(heroBox && smallBox && heroBox.width > smallBox.width * 1.15).toBeTruthy();

    await page.screenshot({ path: path.join(outDir, 'desktop-1440-viewport.png') });
    await page.screenshot({ path: path.join(outDir, 'desktop-1440-top.png') });
    if (heroBox) {
      await page.screenshot({
        path: path.join(outDir, 'red-before.png'),
        clip: { x: heroBox.x, y: heroBox.y, width: heroBox.width, height: heroBox.height },
      });
      await page.mouse.move(heroBox.x + heroBox.width * 0.5, heroBox.y + heroBox.height * 0.48);
      await expect(hero).toHaveClass(/is-hot/);
      await page.waitForFunction(() => {
        const tile = document.querySelector('[data-id="fb_013_signature"]');
        return Number(tile?.getAttribute('data-ripple') || 0) > 0.22;
      });
      expect(await page.locator('.tile.is-hot').count()).toBe(1);
      const during = await hero.boundingBox();
      if (during) {
        await page.screenshot({
          path: path.join(outDir, 'red-during.png'),
          clip: { x: during.x, y: during.y, width: during.width, height: during.height },
        });
      }
      await page.mouse.move(4, heroBox.y + heroBox.height * 0.48);
      await page.waitForFunction(() => {
        const tile = document.querySelector('[data-id="fb_013_signature"]');
        return Number(tile?.getAttribute('data-ripple') || 1) < 0.2;
      });
      await expect(hero).not.toHaveClass(/is-hot/);
    }
  } else {
    await expect(page.locator('html')).not.toHaveClass(/work-gl/);
    await expect(page.locator('.tile--hero img').first()).toBeVisible();
  }

  const portraits = await page.locator('.tile[data-filter="portraits"]').count();
  await page.locator('.work-filters a[data-filter-link="portraits"]').click();
  await expect(page).toHaveURL(/\/work\/\?filter=portraits/);
  await expect(page.locator('[data-count]')).toHaveText(String(portraits));
  await expect(page.locator('.tile[data-filter="fashion"].is-filtered').first()).toBeHidden();
  await expect(page.locator('.work-filters a[aria-current="true"]')).toHaveText('Portraits');
  await page.waitForTimeout(1000);
  if (gl) {
    await waitVisibleGl(page);
    await page.screenshot({ path: path.join(outDir, 'desktop-filter-portraits.png') });
  }

  await page.locator('.work-filters a[data-filter-link="all"]').click();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(page.locator('[data-count]')).toHaveText(String(total));
  await page.waitForTimeout(900);

  await openWork(page, '/work/?filter=bridal');
  const bridal = await page.locator('.tile[data-filter="bridal"]').count();
  await expect(page.locator('[data-count]')).toHaveText(String(bridal));
  await expect(page.locator('.work-filters a[aria-current="true"]')).toHaveText('Bridal');

  await openWork(page, '/work/');
  if (gl) await page.waitForSelector('.tile.is-gl', { timeout: 15_000 });
  await loadImages(page);
  const metrics = await page.evaluate(() => {
    const root = document.scrollingElement;
    const broken = [...document.images].filter((img) => !(img.complete && img.naturalWidth > 0)).length;
    return {
      scrollWidth: root ? root.scrollWidth : 0,
      innerWidth: window.innerWidth,
      broken,
    };
  });
  expect(metrics.broken).toBe(0);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);

  await scrollTo(page, 0);
  if (gl) await waitVisibleGl(page);
  else {
    await page.waitForFunction(() => {
      const tiles = [...document.querySelectorAll<HTMLElement>('.tile')].slice(0, 6);
      return tiles.length > 0 && tiles.every((tile) => Number(getComputedStyle(tile).opacity) > 0.98);
    });
    const shot = project === 'mobile' ? 'mobile-390-viewport.png' : project === 'small' ? 'small-360-viewport.png' : 'reduced-viewport.png';
    await page.screenshot({ path: path.join(outDir, shot) });
  }

  const height = await page.evaluate(() => document.scrollingElement?.scrollHeight ?? 0);
  if (gl) {
    await page.screenshot({ path: path.join(outDir, 'desktop-1440-top.png') });
    await scrollTo(page, Math.round(height * 0.28));
    await waitVisibleGl(page);
    await page.screenshot({ path: path.join(outDir, 'desktop-1440-mid.png') });
    await scrollTo(page, Math.round(height * 0.62));
    await waitVisibleGl(page);
    await page.screenshot({ path: path.join(outDir, 'desktop-1440-lower.png') });
    await stitch(page, path.join(outDir, 'desktop-full.png'), true);
    fs.copyFileSync(path.join(outDir, 'desktop-full.png'), path.join(outDir, 'desktop-1440.png'));
  } else if (project === 'mobile') {
    await scrollTo(page, Math.round(height * 0.35));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outDir, 'mobile-390-mid.png') });
    await scrollTo(page, 0);
    await page.screenshot({ path: path.join(outDir, 'mobile-390-full.png'), fullPage: true });
    await page.screenshot({ path: path.join(outDir, 'mobile-390.png'), fullPage: true });
  } else if (project === 'small') {
    await page.screenshot({ path: path.join(outDir, 'small-360-full.png'), fullPage: true });
    await page.screenshot({ path: path.join(outDir, 'small-360.png'), fullPage: true });
  } else {
    await page.screenshot({ path: path.join(outDir, 'reduced-full.png'), fullPage: true });
    await page.screenshot({ path: path.join(outDir, 'reduced-1440.png'), fullPage: true });
  }

  expect(errors, errors.join('\n')).toEqual([]);
});

test('record hover ripple for motion gate', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop recording only');
  test.setTimeout(120_000);
  for (const entry of fs.readdirSync(motionDir)) {
    if (entry.endsWith('.webm') || entry.endsWith('.mp4')) fs.rmSync(path.join(motionDir, entry));
  }
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: motionDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const errors = await quiet(page);
  await openWork(page);
  await page.waitForSelector('html.work-gl .tile.is-gl', { timeout: 15_000 });

  const tile = page.locator('.tile--hero').nth(1);
  const id = await tile.getAttribute('data-id');
  if (!id) throw new Error('missing hover tile');
  await page.evaluate((tileId) => {
    const node = document.querySelector<HTMLElement>(`[data-id="${tileId}"]`);
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const y = window.scrollY + rect.top - (window.innerHeight - rect.height) / 2;
    const motion = (window as unknown as { __tcMotion?: { scrollTo: (value: number) => void } }).__tcMotion;
    if (motion) motion.scrollTo(Math.max(0, y));
    else window.scrollTo(0, Math.max(0, y));
  }, id);
  await waitVisibleGl(page);
  await page.waitForTimeout(200);

  const box = await tile.boundingBox();
  if (!box) throw new Error('missing hover tile box');
  const cx = box.x + box.width * 0.5;
  const cy = Math.min(box.y + box.height * 0.46, 700);

  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('.tile').forEach((node) => {
      node.style.pointerEvents = 'none';
    });
  });
  await page.mouse.move(8, cy);
  await page.waitForTimeout(120);

  const started = Date.now();
  const travel = 1000;
  const steps = 20;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const eased = t * t * (3 - 2 * t);
    await page.mouse.move(8 + (cx - 8) * eased, cy);
    const elapsed = Date.now() - started;
    const target = (travel * i) / steps;
    if (target > elapsed) await page.waitForTimeout(target - elapsed);
  }

  await page.evaluate((tileId) => {
    const node = document.querySelector<HTMLElement>(`[data-id="${tileId}"]`);
    if (node) node.style.pointerEvents = 'auto';
  }, id);
  await page.mouse.move(cx + 2, cy);
  await page.mouse.move(cx, cy);
  await page.waitForFunction(
    (tileId) => {
      const node = document.querySelector(`[data-id="${tileId}"]`);
      return node?.classList.contains('is-hot');
    },
    id,
  );
  await page.waitForTimeout(5100);
  expect(errors, errors.join('\n')).toEqual([]);
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(path.join(motionDir, 'hover-raw.webm'));
});
