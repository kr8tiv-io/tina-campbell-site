import { inflateSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

/**
 * Laptop viewports Matt actually uses. Runs once, inside the desktop project,
 * with its own viewport and device scale. The other projects skip it.
 */

type ViewportCase = {
  name: string;
  width: number;
  height: number;
  dpr: number;
  mobile: boolean;
  handoff: boolean;
};

const VIEWPORTS: ViewportCase[] = [
  { name: '1536x720', width: 1536, height: 720, dpr: 1.25, mobile: false, handoff: true },
  { name: '1536x690', width: 1536, height: 690, dpr: 1.25, mobile: false, handoff: false },
  { name: '1520x634', width: 1520, height: 634, dpr: 1.25, mobile: false, handoff: false },
  { name: '1366x657', width: 1366, height: 657, dpr: 1, mobile: false, handoff: false },
  { name: '1440x760', width: 1440, height: 760, dpr: 1, mobile: false, handoff: false },
  { name: '1920x1080', width: 1920, height: 1080, dpr: 1, mobile: false, handoff: true },
  { name: '390x844', width: 390, height: 844, dpr: 3, mobile: true, handoff: true },
];

type LabelBox = {
  index: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  relX: number;
  relY: number;
  nameBottom: number;
  noTop: number;
};

function overlaps(a: LabelBox, b: LabelBox): boolean {
  return a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
}

function lumaFraction(png: Buffer, threshold = 40): number {
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
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 4;
  const raw = inflateSync(Buffer.concat(idats));
  const stride = width * channels;
  let src = 0;
  let prev = Buffer.alloc(stride);
  let bright = 0;
  const count = width * height;
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
    for (let x = 0; x < width; x += 1) {
      const i = x * channels;
      const luma = 0.2126 * row[i] + 0.7152 * row[i + 1] + 0.0722 * row[i + 2];
      if (luma > threshold) bright += 1;
    }
    prev = row;
  }
  return count ? bright / count : 0;
}

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
    () => (window as unknown as { __SCENE_READY__?: Record<string, boolean> }).__SCENE_READY__?.['02A'] === true,
    null,
    { timeout: 30_000 },
  );
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
  });
}

async function readLabels(page: Page, which: 'live' | 'echo'): Promise<LabelBox[]> {
  return page.evaluate((sheet) => {
    const root = document.querySelector(`[data-sheet="${sheet}"]`);
    if (!root) return [];
    const origin = root.getBoundingClientRect();
    const boxes: LabelBox[] = [];
    root.querySelectorAll<HTMLElement>('.sheet__label').forEach((label) => {
      const style = getComputedStyle(label);
      const rect = label.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || Number.parseFloat(style.opacity) < 0.05) return;
      if (rect.width < 2 || rect.height < 2) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) return;
      const text = [...label.childNodes].find(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0,
      );
      let nameBottom = rect.bottom;
      if (text) {
        const range = document.createRange();
        range.selectNodeContents(text);
        nameBottom = range.getBoundingClientRect().bottom;
      }
      const no = label.querySelector('.sheet__no');
      const noTop = no ? no.getBoundingClientRect().top : rect.bottom;
      const item = label.closest<HTMLElement>('.sheet__item');
      boxes.push({
        index: Number(item?.dataset.index ?? -1),
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        relX: rect.left - origin.left,
        relY: rect.top - origin.top,
        nameBottom,
        noTop,
      });
    });
    return boxes;
  }, which);
}

async function pinRange(page: Page): Promise<{ start: number; end: number; spacerStart: number }> {
  return page.evaluate(() => {
    const seam = document.querySelector('[data-seam-pair="02A-03B"]');
    const motion = (
      window as unknown as {
        __tcMotion?: {
          ScrollTrigger: {
            getAll: () => Array<{ pin?: unknown; trigger?: Element; start: number; end: number }>;
          };
        };
      }
    ).__tcMotion;
    const pin = motion?.ScrollTrigger.getAll().find((item) => item.pin && !!seam && !!item.trigger && seam.contains(item.trigger));
    const spacer = document.querySelector('.sheet-scrub');
    const spacerStart = spacer ? spacer.getBoundingClientRect().top + window.scrollY : 0;
    return { start: pin?.start ?? 0, end: pin?.end ?? 0, spacerStart };
  });
}

test.beforeEach(({ }, info) => {
  test.skip(info.project.name !== 'desktop', 'laptop cases run once, from the desktop project');
});

for (const vp of VIEWPORTS) {
  test.describe(vp.name, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });

    test('fonts and strip labels stay apart, on device pixels', async ({ page }) => {
      test.setTimeout(90_000);
      await boot(page);
      const fonts = await page.evaluate(() => {
        const nav = document.querySelector('.site-nav a');
        return {
          mono: document.fonts.check('13px "JetBrains Mono"'),
          inter: document.fonts.check('16px "Inter Tight"'),
          serif: document.fonts.check('16px "Instrument Serif"'),
          nav: nav ? getComputedStyle(nav).fontFamily : '',
          wide: window.innerWidth >= 760,
        };
      });
      expect(fonts.mono).toBe(true);
      expect(fonts.inter).toBe(true);
      expect(fonts.serif).toBe(true);
      if (fonts.wide) expect(fonts.nav.replace(/["']/g, '')).toMatch(/^JetBrains Mono/);

      for (const progress of [0, 0.5, 1]) {
        await page.evaluate((value) => {
          const root = document.documentElement;
          root.dataset.filmHold = '1';
          // The live sheet sits below the hero. Fix it over the viewport so the
          // three progress samples are the on-screen labels, then measure.
          root.classList.add('is-sheet-hold');
          document.querySelector('[data-sheet="live"]')?.getBoundingClientRect();
          const api = (
            window as unknown as { __SCENE_TL__?: Record<string, { setProgress: (next: number) => void }> }
          ).__SCENE_TL__?.['02A'];
          api?.setProgress(value);
        }, progress);
        await page.waitForTimeout(250);
        const labels = await readLabels(page, 'live');
        expect(labels.length, `visible live labels at progress ${progress}`).toBeGreaterThan(0);
        const dpr = vp.dpr;
        for (const label of labels) {
          expect(label.nameBottom, `name line overlaps No. at ${progress}`).toBeLessThanOrEqual(label.noTop + 0.5);
          const leftPx = label.left * dpr;
          const topPx = label.top * dpr;
          expect(Math.abs(leftPx - Math.round(leftPx)), `label left ${label.left} at ${progress}`).toBeLessThanOrEqual(0.02);
          expect(Math.abs(topPx - Math.round(topPx)), `label top ${label.top} at ${progress}`).toBeLessThanOrEqual(0.02);
        }
        for (let i = 0; i < labels.length; i += 1) {
          for (let j = i + 1; j < labels.length; j += 1) {
            expect(overlaps(labels[i], labels[j]), `labels ${labels[i].index} and ${labels[j].index} overlap`).toBe(false);
          }
        }
      }
    });

    test('hero head clears the header and stays above the title', async ({ page }) => {
      test.setTimeout(60_000);
      await boot(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      const head = await page.evaluate(() => {
        const img = document.querySelector<HTMLImageElement>('.hero__still img');
        const header = document.querySelector('.site-header');
        const title = document.querySelector('.hero__title');
        if (!img || !header || !title) return null;
        const rect = img.getBoundingClientRect();
        const parts = getComputedStyle(img).objectPosition.trim().split(/\s+/);
        const axis = (part: string): { pct: number | null; px: number | null } => {
          if (part.endsWith('%')) return { pct: Number.parseFloat(part) / 100, px: null };
          if (part.endsWith('px')) return { pct: null, px: Number.parseFloat(part) };
          return { pct: null, px: null };
        };
        const x = axis(parts[0] || '50%');
        const y = axis(parts[1] || '50%');
        const scale = Math.max(rect.width / 1920, rect.height / 1080);
        const dispW = 1920 * scale;
        const dispH = 1080 * scale;
        const offX = x.px != null ? x.px : (rect.width - dispW) * (x.pct ?? 0.5);
        const offY = y.px != null ? y.px : (rect.height - dispH) * (y.pct ?? 0.5);
        return {
          top: rect.top + offY + 120 * scale,
          bottom: rect.top + offY + 300 * scale,
          left: rect.left + offX + 1200 * scale,
          right: rect.left + offX + 1400 * scale,
          headerBottom: header.getBoundingClientRect().bottom,
          titleTop: title.getBoundingClientRect().top,
          pos: getComputedStyle(img).objectPosition,
          yPx: y.px,
          xPct: x.pct,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      });
      expect(head).not.toBeNull();
      if (!head) return;
      expect(head.top, `head top ${head.top} header ${head.headerBottom} pos ${head.pos}`).toBeGreaterThanOrEqual(head.headerBottom + 4);
      expect(head.bottom, `head bottom ${head.bottom} title ${head.titleTop}`).toBeLessThanOrEqual(head.titleTop);
      expect(head.left).toBeGreaterThanOrEqual(-1);
      expect(head.right).toBeLessThanOrEqual(head.width + 1);
      if (vp.width === 1920 && vp.height === 1080) {
        expect(head.yPx, `object-position ${head.pos}`).not.toBeNull();
        expect(Math.abs(head.yPx ?? 99)).toBeLessThan(0.05);
      }
      if (vp.mobile) expect(head.xPct).toBeCloseTo(0.68, 2);
    });

    test('strip stays held until the echo pins, with real input', async ({ page }) => {
      test.setTimeout(240_000);
      await boot(page);
      if (!vp.mobile) await page.mouse.move(vp.width / 2, vp.height / 2);

      const stepInput = async (direction: 1 | -1): Promise<void> => {
        if (vp.mobile) {
          await page.evaluate((delta) => {
            const next = Math.max(0, window.scrollY + delta);
            const motion = (window as unknown as { __tcMotion?: { scrollTo: (target: number) => void } }).__tcMotion;
            if (motion?.scrollTo) motion.scrollTo(next);
            else window.scrollTo(0, next);
          }, direction * 90);
          await page.waitForTimeout(300);
          return;
        }
        await page.mouse.wheel(0, direction * 100);
        await page.waitForTimeout(60);
        await page.mouse.wheel(0, direction * 100);
        await page.waitForTimeout(300);
      };

      let liveAtHold: LabelBox[] = [];
      let sawFixed = false;

      const sampleOnce = async (direction: 1 | -1): Promise<{ arrived: boolean; y: number }> => {
        const state = await page.evaluate(() => {
          const opacityOf = (el: Element | null): number =>
            el ? Number.parseFloat(getComputedStyle(el).opacity) || 0 : 0;
          const echo = document.querySelector('[data-sheet="echo"]');
          const stage = document.querySelector('[data-seam-pair="02A-03B"] [data-stage]');
          const runway = document.querySelector('.runway--stage');
          const echoRect = echo?.getBoundingClientRect();
          const intersects = !!echoRect && echoRect.bottom > 0 && echoRect.top < window.innerHeight;
          return {
            y: window.scrollY,
            hold: document.documentElement.classList.contains('is-sheet-hold'),
            stageFixed: !!stage && getComputedStyle(stage).position === 'fixed',
            echoOpacity: opacityOf(echo),
            runwayOpacity: opacityOf(runway),
            intersects,
          };
        });
        const range = await pinRange(page);
        if (state.y >= range.spacerStart + 2 && state.y < range.start - 2) {
          expect(state.hold, `hold off over the black spacer at y=${Math.round(state.y)}`).toBe(true);
        }
        if (state.hold) liveAtHold = await readLabels(page, 'live');
        if (direction > 0 && state.stageFixed && !sawFixed) {
          sawFixed = true;
          expect(state.hold, 'hold still on when the 02A-03B stage first fixes').toBe(false);
          expect(state.echoOpacity, 'echo opacity at the hand-off').toBeGreaterThanOrEqual(0.98);
          const echoNow = await readLabels(page, 'echo');
          expect(echoNow.length, 'echo labels at the hand-off').toBeGreaterThan(0);
          for (const echoLabel of echoNow) {
            const liveLabel = liveAtHold.find((item) => item.index === echoLabel.index);
            expect(liveLabel, `no live label for echo index ${echoLabel.index}`).toBeTruthy();
            if (!liveLabel) continue;
            expect(Math.abs(echoLabel.left - liveLabel.left), `echo x ${echoLabel.index}`).toBeLessThanOrEqual(3);
            expect(Math.abs(echoLabel.top - liveLabel.top), `echo y ${echoLabel.index}`).toBeLessThanOrEqual(3);
          }
        }
        if (state.intersects && state.echoOpacity > 0.05) {
          const echoLabels = await readLabels(page, 'echo');
          const xs = echoLabels.map((item) => item.left).sort((a, b) => a - b);
          for (let i = 1; i < xs.length; i += 1) {
            expect(xs[i] - xs[i - 1], `echo labels piled, xs=${xs.map((n) => Math.round(n)).join(',')}`).toBeGreaterThan(24);
          }
          if (liveAtHold.length) {
            for (const echoLabel of echoLabels) {
              const liveLabel = liveAtHold.find((item) => item.index === echoLabel.index);
              if (!liveLabel) continue;
              expect(Math.abs(echoLabel.relX - liveLabel.relX), `echo relX ${echoLabel.index}`).toBeLessThanOrEqual(3);
              expect(Math.abs(echoLabel.relY - liveLabel.relY), `echo relY ${echoLabel.index}`).toBeLessThanOrEqual(3);
            }
          }
        }
        const arrived =
          direction > 0
            ? state.runwayOpacity >= 0.999 && !state.stageFixed && state.y > range.start + 50
            : state.y <= 2;
        return { arrived, y: state.y };
      };

      let previous = -1;
      let stuck = 0;
      let forward = false;
      for (let i = 0; i < 420; i += 1) {
        const sample = await sampleOnce(1);
        if (sample.arrived) {
          forward = true;
          break;
        }
        await stepInput(1);
        if (Math.abs(sample.y - previous) < 0.5 && i > 2) stuck += 1;
        else stuck = 0;
        previous = sample.y;
        expect(stuck, `forward scroll stuck at y=${Math.round(sample.y)}`).toBeLessThan(8);
      }
      expect(forward, 'never reached the runway past the pin').toBe(true);

      await page.waitForTimeout(1500);
      const parked = await page.evaluate(() => {
        const node = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
        const runway = node?.closest('.runway');
        const scrub = node?.closest('.sheet-scrub');
        return { inRunway: !!runway, inScrub: !!scrub, tag: node?.tagName || '', className: node?.className || '' };
      });
      expect(parked.inScrub, `parked on the scrub (${parked.className})`).toBe(false);
      expect(parked.inRunway, `centre is ${parked.tag}.${parked.className}`).toBe(true);

      previous = Number.POSITIVE_INFINITY;
      stuck = 0;
      let back = false;
      for (let i = 0; i < 420; i += 1) {
        const sample = await sampleOnce(-1);
        if (sample.arrived) {
          back = true;
          break;
        }
        await stepInput(-1);
        if (Math.abs(sample.y - previous) < 0.5 && i > 2) stuck += 1;
        else stuck = 0;
        previous = sample.y;
        expect(stuck, `reverse scroll stuck at y=${Math.round(sample.y)}`).toBeLessThan(8);
      }
      expect(back, 'never returned to the top').toBe(true);
    });

    test('flood hand-off keeps the frame lit', async ({ page }) => {
      test.skip(!vp.handoff, 'hand-off is measured on 1536x720, 1920x1080 and 390x844');
      test.setTimeout(180_000);
      await boot(page);
      const range = await pinRange(page);
      expect(range.end).toBeGreaterThan(range.start);
      const lows: string[] = [];
      for (let step = 0; step <= 25; step += 1) {
        const progress = step * 0.02;
        const y = range.start + progress * (range.end - range.start);
        await page.evaluate((target) => {
          const motion = (window as unknown as { __tcMotion?: { scrollTo: (next: number) => void } }).__tcMotion;
          if (motion?.scrollTo) motion.scrollTo(target);
          else window.scrollTo(0, target);
        }, y);
        await page.waitForTimeout(900);
        const headerBottom = await page.evaluate(() => {
          const header = document.querySelector('.site-header');
          return header ? header.getBoundingClientRect().bottom : 0;
        });
        const clipHeight = Math.max(1, vp.height - headerBottom);
        const png = await page.screenshot({
          type: 'png',
          clip: { x: 0, y: Math.max(0, headerBottom), width: vp.width, height: clipHeight },
        });
        const fraction = lumaFraction(png);
        if (fraction < 0.3) lows.push(`${progress.toFixed(2)}:${fraction.toFixed(3)}`);
        expect(fraction, `bright fraction ${fraction.toFixed(3)} at pin progress ${progress.toFixed(2)}`).toBeGreaterThanOrEqual(0.3);
      }
      expect(lows).toEqual([]);
    });
  });
}
