import { expect, test, type Page } from '@playwright/test';

/**
 * Phone film-strip labels must clear a Chrome iOS bottom toolbar.
 * Runs once, from the desktop project, with its own viewport.
 */

type LabelBox = {
  index: number;
  text: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  nameSize: number;
  noSize: number;
};

const PROGRESS = [0, 0.25, 0.5, 0.75, 1];

function hits(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
): boolean {
  return a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
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
    () =>
      (window as unknown as { __SCENE_READY__?: Record<string, boolean> }).__SCENE_READY__?.['02A'] === true &&
      document.querySelector('.sheet.is-film-gl'),
    null,
    { timeout: 30_000 },
  );
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
  });
}

async function setProgress(page: Page, value: number): Promise<void> {
  await page.evaluate((next) => {
    const root = document.documentElement;
    root.dataset.filmHold = '1';
    root.classList.add('is-sheet-hold');
    document.querySelector('[data-sheet="live"]')?.getBoundingClientRect();
    const api = (
      window as unknown as { __SCENE_TL__?: Record<string, { setProgress: (progress: number) => void }> }
    ).__SCENE_TL__?.['02A'];
    api?.setProgress(next);
  }, value);
  await page.waitForTimeout(200);
}

async function readLive(page: Page): Promise<LabelBox[]> {
  return page.evaluate(() => {
    const root = document.querySelector('[data-sheet="live"]');
    if (!root) return [];
    const boxes: LabelBox[] = [];
    root.querySelectorAll<HTMLElement>('.sheet__label').forEach((label) => {
      const style = getComputedStyle(label);
      const rect = label.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || Number.parseFloat(style.opacity) < 0.05) return;
      if (rect.width < 2 || rect.height < 2) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) return;
      const no = label.querySelector('.sheet__no');
      const item = label.closest<HTMLElement>('.sheet__item');
      boxes.push({
        index: Number(item?.dataset.index ?? -1),
        text: (label.childNodes[0]?.textContent || '').trim(),
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        nameSize: Number.parseFloat(style.fontSize),
        noSize: no ? Number.parseFloat(getComputedStyle(no).fontSize) : 0,
      });
    });
    return boxes;
  });
}

async function installToolbar(page: Page, width: number): Promise<void> {
  await page.evaluate((barWidth) => {
    document.getElementById('sim-toolbar')?.remove();
    const bar = document.createElement('div');
    bar.id = 'sim-toolbar';
    bar.style.position = 'fixed';
    bar.style.left = '0';
    bar.style.bottom = '0';
    bar.style.width = `${barWidth}px`;
    bar.style.height = '120px';
    bar.style.background = 'rgba(30,30,30,0.85)';
    bar.style.zIndex = '80';
    bar.style.pointerEvents = 'none';
    document.body.append(bar);
  }, width);
}

test.beforeEach(({ }, info) => {
  test.skip(info.project.name !== 'desktop', 'phone toolbar cases run once, from the desktop project');
});

test.describe('iPhone 16 toolbar', () => {
  test.use({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('live labels clear a 120px bottom toolbar', async ({ page }) => {
    test.setTimeout(90_000);
    await boot(page);
    await installToolbar(page, 393);
    for (const progress of PROGRESS) {
      await setProgress(page, progress);
      const labels = await readLive(page);
      expect(labels.length, `visible labels at ${progress}`).toBeGreaterThan(0);
      const box = await page.evaluate(() => {
        const bar = document.getElementById('sim-toolbar');
        const rect = bar?.getBoundingClientRect();
        return {
          height: window.innerHeight,
          width: window.innerWidth,
          bar: rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } : null,
        };
      });
      expect(box.bar, 'simulated toolbar').not.toBeNull();
      const floor = box.height - 140;
      const minTop = box.height * 0.18;
      for (const label of labels) {
        expect(label.bottom, `${label.text} bottom ${label.bottom} at ${progress}`).toBeLessThanOrEqual(floor);
        expect(label.top, `${label.text} top ${label.top} at ${progress}`).toBeGreaterThanOrEqual(minTop);
        expect(label.top, `${label.text} inside`).toBeGreaterThanOrEqual(0);
        expect(label.left, `${label.text} left`).toBeGreaterThanOrEqual(0);
        expect(label.right, `${label.text} right`).toBeLessThanOrEqual(box.width + 0.5);
        expect(hits(label, box.bar!), `${label.text} intersects the toolbar at ${progress}`).toBe(false);
        expect(label.nameSize, `${label.text} name`).toBeGreaterThanOrEqual(13);
        expect(label.noSize, `${label.text} number`).toBeGreaterThanOrEqual(11);
      }
    }
  });
});

test.describe('Chrome iOS visible area', () => {
  test.use({
    viewport: { width: 393, height: 659 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('labels stay fully inside the short viewport', async ({ page }) => {
    test.setTimeout(90_000);
    await boot(page);
    for (const progress of PROGRESS) {
      await setProgress(page, progress);
      const labels = await readLive(page);
      expect(labels.length, `visible labels at ${progress}`).toBeGreaterThan(0);
      const height = await page.evaluate(() => window.innerHeight);
      const width = await page.evaluate(() => window.innerWidth);
      for (const label of labels) {
        expect(label.top, `${label.text} top at ${progress}`).toBeGreaterThanOrEqual(0);
        expect(label.left, `${label.text} left at ${progress}`).toBeGreaterThanOrEqual(-0.5);
        expect(label.right, `${label.text} right at ${progress}`).toBeLessThanOrEqual(width + 0.5);
        expect(label.bottom, `${label.text} bottom ${label.bottom} at ${progress}`).toBeLessThanOrEqual(height - 24);
        expect(label.bottom, `${label.text} band`).toBeLessThanOrEqual(height * 0.7 + 0.5);
        expect(label.top, `${label.text} band top`).toBeGreaterThanOrEqual(height * 0.18 - 0.5);
      }
    }
  });
});

test.describe('390 clear of the bottom', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('live labels sit 140px above the bottom', async ({ page }) => {
    test.setTimeout(90_000);
    await boot(page);
    for (const progress of PROGRESS) {
      await setProgress(page, progress);
      const labels = await readLive(page);
      expect(labels.length, `visible labels at ${progress}`).toBeGreaterThan(0);
      const height = 844;
      for (const label of labels) {
        expect(label.bottom, `${label.text} bottom ${label.bottom} at ${progress}`).toBeLessThanOrEqual(height - 140);
        expect(label.top, `${label.text} top ${label.top} at ${progress}`).toBeGreaterThanOrEqual(height * 0.18);
        expect(label.right, `${label.text} right`).toBeLessThanOrEqual(390.5);
        expect(label.left, `${label.text} left`).toBeGreaterThanOrEqual(-0.5);
      }
    }
  });

  test('echo labels keep distinct x positions', async ({ page }) => {
    test.setTimeout(90_000);
    await boot(page);
    await setProgress(page, 0.5);
    const xs = await page.evaluate(() => {
      const root = document.querySelector('[data-sheet="echo"]');
      if (!root) return [];
      const lefts: number[] = [];
      root.querySelectorAll<HTMLElement>('.sheet__label').forEach((label) => {
        const style = getComputedStyle(label);
        if (style.display === 'none' || label.classList.contains('is-offstage')) return;
        const rect = label.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        lefts.push(rect.left);
      });
      return lefts.sort((a, b) => a - b);
    });
    expect(xs.length, 'echo labels').toBeGreaterThan(1);
    for (let i = 1; i < xs.length; i += 1) {
      expect(xs[i] - xs[i - 1], `echo xs ${xs.map((n) => Math.round(n)).join(',')}`).toBeGreaterThan(24);
    }
    const piled = xs.filter((x) => x < 8).length;
    expect(piled, 'echo labels stacked at the left').toBeLessThan(2);
  });

  test('held sheet is the svh box and labels follow a shorter visual viewport', async ({ page }) => {
    test.setTimeout(90_000);
    await boot(page);
    await setProgress(page, 0.5);
    const before = await readLive(page);
    expect(before.length).toBeGreaterThan(0);
    const heights = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;left:0;top:0;height:100svh;width:1px;pointer-events:none;visibility:hidden';
      document.body.append(probe);
      const sheet = document.querySelector('[data-sheet="live"]');
      const sheetH = sheet ? getComputedStyle(sheet).height : '';
      const probeH = getComputedStyle(probe).height;
      probe.remove();
      return { sheetH, probeH };
    });
    expect(heights.sheetH, 'held sheet matches 100svh').toBe(heights.probeH);

    const after = await page.evaluate(() => {
      const vv = window.visualViewport;
      if (!vv) throw new Error('visualViewport missing');
      const height = window.innerHeight - 190;
      const fake = {
        height,
        width: window.innerWidth,
        offsetTop: 0,
        offsetLeft: 0,
        pageTop: 0,
        pageLeft: 0,
        scale: 1,
        addEventListener: vv.addEventListener.bind(vv),
        removeEventListener: vv.removeEventListener.bind(vv),
        dispatchEvent: vv.dispatchEvent.bind(vv),
      };
      Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake });
      const api = (
        window as unknown as { __SCENE_TL__?: Record<string, { setProgress: (progress: number) => void }> }
      ).__SCENE_TL__?.['02A'];
      api?.setProgress(0.5);
      const root = document.querySelector('[data-sheet="live"]');
      const boxes: Array<{ text: string; top: number; bottom: number }> = [];
      root?.querySelectorAll<HTMLElement>('.sheet__label').forEach((label) => {
        const style = getComputedStyle(label);
        const rect = label.getBoundingClientRect();
        if (style.display === 'none' || style.visibility === 'hidden') return;
        if (rect.width < 2 || rect.height < 2) return;
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        boxes.push({
          text: (label.childNodes[0]?.textContent || '').trim(),
          top: rect.top,
          bottom: rect.bottom,
        });
      });
      return { height, boxes };
    });
    expect(after.boxes.length).toBe(before.length);
    for (const label of after.boxes) {
      const prior = before.find((item) => item.text === label.text);
      expect(prior, label.text).toBeTruthy();
      expect(label.top, `${label.text} did not move up`).toBeLessThan((prior?.top ?? 0) - 40);
      expect(label.bottom, `${label.text} still inside the shorter viewport`).toBeLessThanOrEqual(after.height - 24);
    }
  });
});
