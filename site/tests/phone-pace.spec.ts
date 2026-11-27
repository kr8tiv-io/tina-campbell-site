import fs from 'node:fs';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

/**
 * Phone film strip pace. Each category gets the same share of the pinned scroll.
 * Desktop snap positions stay on the 991b24e table.
 */

const NAMES = ['Signature', 'Runway', 'Portraits', 'Bridal', 'Couples', 'Edmonton', 'Landscape'];
const SHOTS = path.resolve('../qa/031-phone-strip-even-pace/shots');
const BEFORE = path.resolve('../qa/031-phone-strip-even-pace/before');

/** Pre-031 reduced-motion scrollHeight at 390x844 on this branch. */
const REDUCED_HEIGHT = 5327;

/**
 * Desktop scrollY where progress hits i/6, measured before this change.
 * The scrub source matches 991b24e (150vh, bottom bottom).
 */
const DESKTOP: Record<string, number[]> = {
  '1440x900': [1980, 2205, 2430, 2655, 2880, 3105, 3330],
  '1536x720': [1584, 1764, 1944, 2124, 2304, 2484, 2664],
  '1920x1080': [2376, 2646, 2916, 3186, 3456, 3726, 3996],
};

type Sample = {
  y: number;
  centre: number;
  progress: number;
  hold: boolean;
  fully: boolean;
  nextFixed: boolean;
};

async function boot(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/', { waitUntil: 'load' });
  await page.waitForFunction(
    () =>
      (window as unknown as { __SCENE_READY__?: Record<string, boolean> }).__SCENE_READY__?.['02A'] === true &&
      document.querySelector('.sheet.is-film-gl, .sheet.is-film-css'),
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(250);
}

async function readSample(page: Page): Promise<Sample> {
  return page.evaluate(() => {
    const api = (
      window as unknown as {
        __SCENE_TL__?: Record<string, { frames?: () => Array<{ quad: Array<{ x: number; y: number }> }> }>;
      }
    ).__SCENE_TL__?.['02A'];
    const frames = api?.frames?.() ?? [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    let centre = -1;
    let best = Infinity;
    frames.forEach((frame, index) => {
      const x = frame.quad.reduce((sum, point) => sum + point.x, 0) / 4;
      const dist = Math.abs(x - width / 2);
      if (dist < best) {
        best = dist;
        centre = index;
      }
    });
    const sheet = document.querySelector<HTMLElement>('[data-sheet="live"]');
    const rect = sheet?.getBoundingClientRect();
    const opacity = sheet ? Number.parseFloat(getComputedStyle(sheet).opacity) || 0 : 0;
    const fully = Boolean(
      rect && opacity >= 0.98 && rect.top <= 2 && rect.bottom >= height - 2 && rect.height >= height * 0.92,
    );
    const nextStage = document.querySelector('[data-seam-pair="02A-03B"] [data-stage]');
    const progress = Number.parseFloat(sheet?.dataset.sceneProgress || '0');
    return {
      y: window.scrollY,
      centre,
      progress: Number.isFinite(progress) ? progress : 0,
      hold: document.documentElement.classList.contains('is-sheet-hold'),
      fully,
      nextFixed: Boolean(nextStage) && getComputedStyle(nextStage as Element).position === 'fixed',
    };
  });
}

async function filmRange(page: Page): Promise<{ start: number; end: number }> {
  return page.evaluate(() => {
    const motion = (
      window as unknown as {
        __tcMotion?: {
          ScrollTrigger: {
            getAll: () => Array<{ trigger?: Element; start: number; end: number; vars?: { snap?: unknown } }>;
          };
        };
      }
    ).__tcMotion;
    const film = motion?.ScrollTrigger.getAll().find(
      (item) => item.trigger?.hasAttribute?.('data-sheet-scrub') && item.vars?.snap,
    );
    return { start: film?.start ?? 0, end: film?.end ?? 0 };
  });
}

/** Trusted wheel input. Short gaps so the snap delay does not steal the scroll. */
async function wheel(page: Page, delta: number): Promise<void> {
  await page.mouse.wheel(0, delta);
}

function changesOf(samples: Sample[]): Sample[] {
  const out: Sample[] = [];
  let prev = -2;
  for (const sample of samples) {
    if (sample.centre < 0 || sample.centre === prev) continue;
    out.push(sample);
    prev = sample.centre;
  }
  return out;
}

test.beforeEach(({ }, info) => {
  test.skip(info.project.name !== 'desktop', 'pace cases run once, from the desktop project');
});

for (const view of [
  { width: 390, height: 844 },
  { width: 393, height: 852 },
]) {
  test.describe(`${view.width}x${view.height}`, () => {
    test.use({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('seven categories share the pinned scroll, forward and back', async ({ page }) => {
      test.setTimeout(180_000);
      await boot(page);
      await page.mouse.move(view.width / 2, view.height / 2);
      const range = await filmRange(page);
      expect(range.end).toBeGreaterThan(range.start);

      await page.evaluate((y) => {
        const motion = (window as unknown as { __tcMotion?: { scrollTo: (target: number) => void } }).__tcMotion;
        if (motion?.scrollTo) motion.scrollTo(y);
        else window.scrollTo(0, y);
      }, Math.max(0, range.start - 160));

      const forward: Sample[] = [];
      for (let i = 0; i < 700; i += 1) {
        const sample = await readSample(page);
        forward.push(sample);
        if (sample.nextFixed && sample.centre === 6 && i > 8) break;
        await wheel(page, 20);
      }

      const height = view.height;
      const forwardCentres = changesOf(forward).map((sample) => sample.centre);
      expect(forwardCentres, `forward centres ${forwardCentres.join(',')}`).toEqual([0, 1, 2, 3, 4, 5, 6]);

      const marks: number[] = [];
      for (let step = 0; step <= 6; step += 1) {
        const target = step / 6;
        const hit = forward.find((sample) => sample.y >= range.start - 8 && sample.progress >= target - 0.004);
        expect(hit, `progress ${target.toFixed(3)}`).toBeTruthy();
        if (hit) marks.push(hit.y);
      }
      const steps = marks.slice(1).map((y, index) => y - marks[index]);
      const mean = steps.reduce((sum, value) => sum + value, 0) / steps.length;
      for (const distance of steps) {
        expect(distance, `step ${distance}px`).toBeGreaterThanOrEqual(0.45 * height);
        expect(Math.abs(distance - mean) / mean, `step ${distance} vs mean ${mean.toFixed(1)}`).toBeLessThanOrEqual(0.15);
      }

      const held = forward.find((sample) => sample.fully && sample.hold);
      const runway = forward.find((sample) => sample.centre === 1);
      expect(held, 'strip fully in view and held').toBeTruthy();
      expect(runway, 'Runway becomes centred').toBeTruthy();
      if (held && runway) {
        const stillLead = runway.y - held.y;
        expect(stillLead, `still lead ${stillLead}px`).toBeLessThanOrEqual(0.35 * height);
        expect(stillLead).toBeGreaterThanOrEqual(0);
      }

      const landscape = forward.find((sample) => sample.centre === 6);
      const pinned = forward.find((sample) => sample.nextFixed);
      expect(landscape && pinned, 'Landscape then the 02A-03B pin').toBeTruthy();
      if (landscape && pinned) {
        const finalHold = pinned.y - landscape.y;
        expect(finalHold, `final hold ${finalHold}px`).toBeLessThanOrEqual(0.6 * height);
        expect(finalHold).toBeGreaterThan(0);
      }

      const back: Sample[] = [];
      for (let i = 0; i < 700; i += 1) {
        const sample = await readSample(page);
        back.push(sample);
        const seen = changesOf(back).map((item) => item.centre);
        if (seen.includes(0) && seen.includes(6) && seen[seen.length - 1] === 0) break;
        await wheel(page, -20);
      }
      const backCentres = changesOf(back).map((sample) => sample.centre);
      expect(backCentres, `reverse centres ${backCentres.join(',')}`).toEqual([6, 5, 4, 3, 2, 1, 0]);

      if (view.width === 390) {
        fs.mkdirSync(SHOTS, { recursive: true });
        for (let step = 0; step <= 6; step += 1) {
          await page.evaluate((value) => {
            const motion = (
              window as unknown as {
                __tcMotion?: {
                  scrollTo: (target: number) => void;
                  ScrollTrigger: { getAll: () => Array<{ trigger?: Element; start: number; end: number; vars?: { snap?: unknown } }> };
                };
              }
            ).__tcMotion;
            const film = motion?.ScrollTrigger.getAll().find(
              (item) => item.trigger?.hasAttribute?.('data-sheet-scrub') && item.vars?.snap,
            );
            if (!film || !motion) return;
            motion.scrollTo(film.start + value * (film.end - film.start));
          }, step / 6);
          await page.waitForTimeout(200);
          await page.screenshot({
            path: path.join(SHOTS, `390-cat-${step}-${NAMES[step].toLowerCase()}.jpg`),
            type: 'jpeg',
            quality: 75,
          });
        }
      }
    });
  });
}

test.describe('reduced motion', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });

  test('no scrub, no pin, page height unchanged', async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem('tc-loader', '1');
      } catch {
        /* ignore */
      }
    });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const state = await page.evaluate(() => {
      const scrub = document.querySelector('.sheet-scrub, [data-sheet-scrub]');
      const style = scrub ? getComputedStyle(scrub) : null;
      const pins = (
        window as unknown as {
          __tcMotion?: { ScrollTrigger: { getAll: () => Array<{ pin?: unknown }> } };
        }
      ).__tcMotion?.ScrollTrigger.getAll().filter((item) => item.pin) ?? [];
      return {
        scrollHeight: document.documentElement.scrollHeight,
        scrubHeight: scrub ? scrub.getBoundingClientRect().height : 0,
        scrubDisplay: style?.display ?? 'absent',
        pinCount: pins.length,
        pinSpacers: document.querySelectorAll('.pin-spacer').length,
      };
    });
    expect(state.scrubHeight, 'sheet-scrub height').toBe(0);
    expect(state.pinCount, 'ScrollTrigger pins').toBe(0);
    expect(state.pinSpacers, 'pin spacers').toBe(0);
    const delta = Math.abs(state.scrollHeight - REDUCED_HEIGHT) / REDUCED_HEIGHT;
    expect(delta, `scrollHeight ${state.scrollHeight}`).toBeLessThanOrEqual(0.02);
    fs.mkdirSync(SHOTS, { recursive: true });
    await page.screenshot({
      path: path.join(SHOTS, '390-reduced.jpg'),
      type: 'jpeg',
      quality: 75,
    });
  });
});

function decodePng(png: Buffer): { width: number; height: number; data: Buffer } {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  const idats: Buffer[] = [];
  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idats.push(Buffer.from(data));
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }
  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idats));
  const stride = width * channels;
  let src = 0;
  let prev = Buffer.alloc(stride);
  const out = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[src];
    src += 1;
    const row = Buffer.from(raw.subarray(src, src + stride));
    src += stride;
    for (let i = 0; i < stride; i += 1) {
      const left = i >= channels ? row[i - channels] : 0;
      const up = prev[i];
      const ul = i >= channels ? prev[i - channels] : 0;
      let value = row[i];
      if (filter === 1) value = (value + left) & 255;
      else if (filter === 2) value = (value + up) & 255;
      else if (filter === 3) value = (value + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const paeth = left + up - ul;
        const pa = Math.abs(paeth - left);
        const pb = Math.abs(paeth - up);
        const pc = Math.abs(paeth - ul);
        const pred = pa <= pb && pa <= pc ? left : pb <= pc ? up : ul;
        value = (value + pred) & 255;
      }
      row[i] = value;
    }
    row.copy(out, y * stride);
    prev = row;
  }
  return { width, height, data: out };
}

/** Mean absolute luma error, as a fraction of full scale. The strip flickers, so callers keep the closest frame. */
function changedFraction(left: Buffer, right: Buffer): number {
  const a = decodePng(left);
  const b = decodePng(right);
  if (a.width !== b.width || a.height !== b.height) return 1;
  const channels = a.data.length / (a.width * a.height);
  let sum = 0;
  const count = a.width * a.height;
  for (let i = 0; i < count; i += 1) {
    const o = i * channels;
    const lumaA = 0.2126 * a.data[o] + 0.7152 * a.data[o + 1] + 0.0722 * a.data[o + 2];
    const lumaB = 0.2126 * b.data[o] + 0.7152 * b.data[o + 1] + 0.0722 * b.data[o + 2];
    sum += Math.abs(lumaA - lumaB);
  }
  return sum / count / 255;
}

for (const view of [
  { name: '1440x900', width: 1440, height: 900, dpr: 1 },
  { name: '1536x720', width: 1536, height: 720, dpr: 1.25 },
  { name: '1920x1080', width: 1920, height: 1080, dpr: 1 },
]) {
  test.describe(view.name, () => {
    test.use({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: view.dpr,
      isMobile: false,
      hasTouch: false,
    });

    test('desktop category scroll matches 991b24e and the frames', async ({ page }) => {
      test.setTimeout(120_000);
      await boot(page);
      const rows = await page.evaluate(() => {
        const names = ['Signature', 'Runway', 'Portraits', 'Bridal', 'Couples', 'Edmonton', 'Landscape'];
        const motion = (
          window as unknown as {
            __tcMotion?: {
              scrollTo: (target: number) => void;
              ScrollTrigger: {
                getAll: () => Array<{
                  trigger?: Element;
                  start: number;
                  end: number;
                  vars?: { snap?: unknown };
                }>;
              };
            };
            __SCENE_TL__?: Record<string, { frames: () => Array<{ quad: Array<{ x: number }> }> }>;
          }
        ).__tcMotion;
        const film = motion?.ScrollTrigger.getAll().find(
          (item) => item.trigger?.hasAttribute?.('data-sheet-scrub') && item.vars?.snap,
        );
        if (!film || !motion) return [];
        const span = film.end - film.start;
        const out: Array<{ index: number; name: string; y: number; centre: number }> = [];
        for (let i = 0; i <= 6; i += 1) {
          const y = film.start + (i / 6) * span;
          motion.scrollTo(y);
          const frames = window.__SCENE_TL__?.['02A']?.frames() ?? [];
          let centre = -1;
          let best = Infinity;
          frames.forEach((frame, index) => {
            const x = frame.quad.reduce((sum, point) => sum + point.x, 0) / 4;
            const dist = Math.abs(x - window.innerWidth / 2);
            if (dist < best) {
              best = dist;
              centre = index;
            }
          });
          out.push({ index: i, name: names[i], y, centre });
        }
        return out;
      });
      const expected = DESKTOP[view.name];
      expect(rows.length).toBe(7);
      rows.forEach((row, index) => {
        expect(Math.abs(row.y - expected[index]), `${row.name} y ${row.y}`).toBeLessThanOrEqual(2);
        expect(row.centre, row.name).toBe(index);
      });

      fs.mkdirSync(SHOTS, { recursive: true });
      for (const progress of [0, 0.5, 1]) {
        await page.evaluate((value) => {
          const motion = (
            window as unknown as {
              __tcMotion?: {
                scrollTo: (target: number) => void;
                ScrollTrigger: { getAll: () => Array<{ trigger?: Element; start: number; end: number; vars?: { snap?: unknown } }> };
              };
            }
          ).__tcMotion;
          const film = motion?.ScrollTrigger.getAll().find(
            (item) => item.trigger?.hasAttribute?.('data-sheet-scrub') && item.vars?.snap,
          );
          if (!film || !motion) return;
          motion.scrollTo(film.start + value * (film.end - film.start));
        }, progress);
        await page.waitForTimeout(150);
        let best = 1;
        const beforePath = path.join(BEFORE, `${view.name}-p${progress}.png`);
        const before = fs.readFileSync(beforePath);
        // The strip breathes on a 6s cycle. One lap finds the frame closest to before/.
        for (let shot = 0; shot < 28; shot += 1) {
          const png = await page.screenshot({ type: 'png' });
          const fraction = changedFraction(before, png);
          if (fraction < best) best = fraction;
          if (best < 0.01) break;
          await page.waitForTimeout(160);
        }
        expect(best, `${view.name} progress ${progress} changed ${(best * 100).toFixed(2)}%`).toBeLessThan(0.01);
        if (view.name === '1920x1080' && progress === 0.5) {
          await page.screenshot({
            path: path.join(SHOTS, '1920-mid.jpg'),
            type: 'jpeg',
            quality: 75,
          });
        }
      }
    });
  });
}
