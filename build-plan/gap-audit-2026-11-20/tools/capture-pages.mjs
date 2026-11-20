// Gap audit capture: live staging, desktop 1440x810 and phone 390x844, 6 frames per scene as JPEG q60.
// Usage (from site/ so playwright resolves): node capture-staging.mjs <base> <outdir>   ONLY=02A,03B to limit
import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = process.argv[2] || 'https://lightsteelblue-lark-427091.hostingersite.com';
const OUT = process.argv[3] || '/tmp/ga/stg';
const devices = { desktop: { viewport: { width: 1440, height: 810 } }, phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const P = [0, 0.2, 0.4, 0.6, 0.8, 1];
const scenes = [
  { id: '01A', url: '/', kind: 'time', times: [0, 1, 2, 3, 4.5, 6] },
  { id: '02A', url: '/', kind: 'range', sel: '[data-seam-pair="01A-02A"]', p0: 0.75, p1: 1, then: '[data-seam-pair="02A-03B"]', q1: 0.25 },
  { id: '03B', url: '/', kind: 'range', sel: '[data-seam-pair="02A-03B"]', p0: 0.35, p1: 1 },
  { id: '04B', url: '/work/', kind: 'hover', sel: '[data-scene-hit]', times: [0, 0.5, 1.5, 2.5, 4, 6] },
  { id: '05C', url: '/work/', kind: 'load', times: [0.5, 1, 2, 3, 4.5, 6] },
  { id: '06B', url: '/fashion-editorial/', kind: 'range', sel: '[data-fe-split]', p0: 0, p1: 1 },
  { id: '07C', url: '/series/the-red-gown/', kind: 'range', sel: 'main > section, main', p0: 0, p1: 1 },
  { id: '08B', url: '/', kind: 'nav', link: 'a[href="/work/"]', times: [0, 0.15, 0.3, 0.5, 0.8, 1.4] },
  { id: '09B', url: '/about/', kind: 'range', sel: '[data-about-hero]', p0: 0, p1: 1 },
  { id: '10A', url: '/', kind: 'range', sel: '[data-band]', p0: 0, p1: 1 },
  { id: '11B', url: '/portraits-bridal-couples/', kind: 'range', sel: 'main', p0: 0, p1: 0.45 },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function yFor(page, sel, p) {
  return page.evaluate(([sel, p]) => {
    const el = document.querySelector(sel); if (!el) return null;
    const vh = innerHeight, top = el.getBoundingClientRect().top + scrollY, h = el.offsetHeight;
    return h > vh * 1.2 ? top + p * (h - vh) : top - vh * 0.6 * (1 - p);
  }, [sel, p]);
}
const b = await chromium.launch();
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
for (const [dev, opts] of Object.entries(devices)) {
  for (const s of scenes) {
    if (only && !only.includes(s.id)) continue;
    const dir = `${OUT}/${s.id}`; fs.mkdirSync(dir, { recursive: true });
    const ctx = await b.newContext(opts); const page = await ctx.newPage();
    const shot = (k) => page.screenshot({ path: `${dir}/${dev}-${k}.jpg`, type: 'jpeg', quality: 60, timeout: 10000, animations: 'allow' }).catch((e) => log.push('shot ' + k + ' ' + String(e).split('\n')[0]));
    const log = [];
    try {
      const t0 = Date.now();
      await page.goto(BASE + s.url, { waitUntil: s.kind === 'load' ? 'domcontentloaded' : 'load', timeout: 60000 });
      if (s.kind === 'load') { for (let k = 0; k < 6; k++) { const w = s.times[k] * 1000 - (Date.now() - t0); if (w > 0) await sleep(w); await shot(k); } }
      else {
        await sleep(4500);
        if (s.kind === 'time') { const t1 = Date.now(); for (let k = 0; k < 6; k++) { const w = s.times[k] * 1000 - (Date.now() - t1); if (w > 0) await sleep(w); await shot(k); } }
        else if (s.kind === 'range') {
          const parts = s.sel.split(', '); let sel = parts[0]; if (!(await page.$(sel))) sel = parts[1] || parts[0];
          const pts = s.then ? [[sel, s.p0], [sel, (s.p0 + s.p1) / 2], [sel, s.p1], [s.then, 0], [s.then, s.q1 / 2], [s.then, s.q1]] : P.map((p) => [sel, s.p0 + p * (s.p1 - s.p0)]);
          for (let k = 0; k < 6; k++) { const y = await yFor(page, pts[k][0], pts[k][1]); log.push(`${pts[k][0]}@${pts[k][1].toFixed(2)} y=${y && Math.round(y)}`); if (y != null) await page.evaluate((y) => window.scrollTo(0, y), y); await sleep(1300); await shot(k); }
        } else if (s.kind === 'hover') {
          const el = await page.$(s.sel);
          if (el) { await el.scrollIntoViewIfNeeded(); await sleep(800); const bb = await el.boundingBox();
            if (dev === 'desktop') await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); else await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2).catch(() => {});
            const t1 = Date.now(); for (let k = 0; k < 6; k++) { const w = s.times[k] * 1000 - (Date.now() - t1); if (w > 0) await sleep(w); await shot(k); } } else log.push('no hover target');
        } else if (s.kind === 'nav') {
          if (dev === 'phone') { const m = await page.$('button[aria-controls], .menu-toggle, [data-menu-toggle]'); if (m) { await m.click(); await sleep(700); } }
          const a = page.locator(s.link).first(); const t1 = Date.now(); a.click().catch(() => {});
          for (let k = 0; k < 6; k++) { const w = s.times[k] * 1000 - (Date.now() - t1); if (w > 0) await sleep(w); await shot(k).catch(() => {}); }
        }
      }
    } catch (e) { log.push('ERR ' + String(e).split('\n')[0]); }
    fs.writeFileSync(`${dir}/${dev}.log`, log.join('\n') + '\n');
    console.log(s.id, dev, log.slice(-1)[0] || 'ok');
    await ctx.close();
  }
}
await b.close();
