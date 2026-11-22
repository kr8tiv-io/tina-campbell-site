const { chromium } = require('/workspace/tina-seams-2026-11-19/site/node_modules/playwright');
(async () => {
  const base = process.argv[2]; const out = __dirname;
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  const res = {};
  for (const [n, vp, dpr] of [['desktop-1440', {width:1440,height:900}, 1], ['phone-390', {width:390,height:844}, 3], ['phone-400', {width:400,height:860}, 3]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: dpr });
    await p.goto(base + '/about/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${n}-top.png` });
    res[n] = await p.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      hero: !!document.querySelector('[data-about-hero]'),
      layers: [...document.querySelectorAll('img')].filter(i => /sky|arch|figure/.test(i.currentSrc||i.src)).length,
      heroImg: (document.querySelector('[data-about-hero] img')||{}).alt || null,
      overflowX: document.documentElement.scrollWidth > innerWidth,
      robots: (document.querySelector('meta[name=robots]')||{}).content }));
    await p.close();
  }
  console.log(JSON.stringify(res, null, 1)); await b.close();
})();
