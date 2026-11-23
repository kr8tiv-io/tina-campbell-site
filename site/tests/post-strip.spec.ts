import { expect, test, type Page } from '@playwright/test';

test.use({ deviceScaleFactor: 2 });

type Sample = {
  y: number;
  hold: boolean;
  stageFixed: boolean;
  echoOpacity: number;
  liveOpacity: number;
  runwayOpacity: number;
  runwayTop: number;
  stripDoc: number;
};

async function readSample(page: Page): Promise<Sample> {
  return page.evaluate(() => {
    const opacityOf = (el: Element | null): number =>
      el ? Number.parseFloat(getComputedStyle(el).opacity) || 0 : 0;
    const echo = document.querySelector('[data-seam-pair="02A-03B"] .sheet--echo');
    const stage = document.querySelector('[data-seam-pair="02A-03B"] [data-stage]');
    const runway = document.querySelector('[data-seam-pair="02A-03B"] .runway--stage');
    const live = document.querySelector('[data-sheet="live"]');
    const strip = document.querySelector('.runway--strip');
    const y = window.scrollY;
    return {
      y,
      hold: document.documentElement.classList.contains('is-sheet-hold'),
      stageFixed: Boolean(stage) && getComputedStyle(stage as Element).position === 'fixed',
      echoOpacity: opacityOf(echo),
      liveOpacity: opacityOf(live),
      runwayOpacity: opacityOf(runway),
      runwayTop: runway ? runway.getBoundingClientRect().top : 0,
      stripDoc: strip ? strip.getBoundingClientRect().top + y : 0,
    };
  });
}

async function stepScroll(page: Page, phone: boolean, delta: number): Promise<void> {
  if (phone) {
    await page.evaluate((dy) => {
      const next = Math.max(0, window.scrollY + dy);
      const motion = (window as Window & { __tcMotion?: { scrollTo: (target: number) => void } }).__tcMotion;
      if (motion?.scrollTo) motion.scrollTo(next);
      else window.scrollTo(0, next);
    }, delta);
  } else {
    await page.mouse.wheel(0, delta);
  }
  await page.waitForTimeout(200);
}

test('film strip spacer does not leave 02A-03B stale', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop' && info.project.name !== 'mobile', '1440 and 390 only');
  test.setTimeout(240_000);
  const phone = info.project.name === 'mobile';
  const step = phone ? 90 : 120;

  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('tc-loader', '1');
    } catch {
      /* ignore */
    }
  });

  await page.goto('/', { waitUntil: 'load' });
  await page.waitForSelector('[data-sheet-scrub]', { timeout: 30_000 });
  await page.waitForTimeout(1200);

  if (!phone) await page.mouse.move(720, 450);

  // The spacer is already in normal flow, so scrollHeight does not move when
  // ScrollTrigger finally measures it. A resize does refresh those cached starts
  // (02A-03B was short by the spacer). Walk first, or desktop would be healed
  // before the overlap and the early-pin assertions could run.
  const walk = async (direction: 1 | -1): Promise<void> => {
    let holdSeen = false;
    let holdReleased = false;
    let sawRunway = false;
    let comparing = false;
    let prevTop: number | null = null;
    let stuck = 0;

    for (let i = 0; i < 320; i += 1) {
      const sample = await readSample(page);
      expect(
        sample.hold && sample.stageFixed,
        `${direction > 0 ? 'forward' : 'reverse'} hold while 02A-03B stage is fixed at y=${Math.round(sample.y)}`,
      ).toBe(false);

      if (sample.hold) holdSeen = true;
      if (direction > 0 && holdSeen && !sample.hold && !holdReleased) {
        holdReleased = true;
        expect(
          sample.echoOpacity,
          `echo opacity ${sample.echoOpacity.toFixed(3)} on hold release at y=${Math.round(sample.y)}`,
        ).toBeGreaterThanOrEqual(0.98);
      }
      if (direction < 0 && sample.hold) {
        expect(
          sample.liveOpacity,
          `live sheet opacity ${sample.liveOpacity.toFixed(3)} while held at y=${Math.round(sample.y)}`,
        ).toBeGreaterThanOrEqual(0.98);
      }

      if (sample.runwayOpacity >= 0.999) {
        if (comparing && prevTop !== null) {
          const jump = Math.abs(sample.runwayTop - prevTop);
          expect(
            jump,
            `runway top jump ${jump.toFixed(1)}px at y=${Math.round(sample.y)} (limit ${step + 40})`,
          ).toBeLessThanOrEqual(step + 40);
        }
        comparing = true;
        sawRunway = true;
        prevTop = sample.runwayTop;
      } else if (direction < 0) {
        comparing = false;
        prevTop = null;
      }

      const arrived =
        direction > 0 ? sample.y >= sample.stripDoc - 2 : sample.y <= 2;
      if (arrived) {
        expect(holdSeen, `${direction > 0 ? 'forward' : 'reverse'} never entered the sheet hold`).toBe(true);
        if (direction > 0) {
          expect(holdReleased, 'hold never released before the runway strip').toBe(true);
        }
        expect(sawRunway, `${direction > 0 ? 'forward' : 'reverse'} runway opacity never reached 1`).toBe(true);
        return;
      }

      const yBefore = sample.y;
      await stepScroll(page, phone, direction * step);
      const yAfter = await page.evaluate(() => window.scrollY);
      if (Math.abs(yAfter - yBefore) < 0.5) {
        stuck += 1;
        expect(stuck, `scroll stuck at y=${Math.round(yBefore)}`).toBeLessThan(8);
      } else {
        stuck = 0;
      }
    }
    expect(false, 'did not reach the runway strip').toBe(true);
  };

  await walk(1);
  await walk(-1);

  const before = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(Math.abs(after - before), `scrollHeight ${before} -> ${after}`).toBeLessThanOrEqual(4);
});
