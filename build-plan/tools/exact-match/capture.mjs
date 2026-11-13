import { chromium } from '/workspace/tina-campbell/site/node_modules/playwright/index.mjs';
import fs from 'fs';
const base = process.argv[2] || 'http://localhost:4877';
const outRoot = process.argv[3] || 'caps';
const pages = (process.argv[4] || '/,/runway/,/work/,/fashion-editorial/,/series/the-red-gown/,/portraits-bridal-couples/').split(',');
const sizes = [[1440,900,'1440'],[390,844,'390']];
const browser = await chromium.launch({executablePath: process.env.CHROME || '/home/box/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const failures = [];
// A screenshot can time out or fail while the compositor is busy; retry, then log and move on so one
// stuck frame never kills the whole capture (metrics.json is always written).
const shot = async (page, opts) => { for (let k=0;k<3;k++) { try { await page.screenshot({...opts, timeout:15000}); return true; } catch(e) { if (k===2) { failures.push(`${opts.path}: ${String(e.message||e).split('\n')[0]}`); return false; } await page.waitForTimeout(500); } } };
const metrics = {};
for (const [w,h,tag] of sizes) {
  const ctx = await browser.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1, hasTouch: w<500, isMobile: w<500 });
  await ctx.addInitScript(()=>{ try{sessionStorage.setItem('tc-loader','1')}catch(e){} });
  for (const p of pages) {
    const page = await ctx.newPage(); try {
    const errs=[]; page.on('pageerror',e=>errs.push(String(e))); page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    const slug = (p.replace(/\//g,'_')||'_').replace(/^_|_$/g,'')||'home';
    const dir = `${outRoot}/${slug}-${tag}`; fs.mkdirSync(dir,{recursive:true});
    await page.goto(base+p,{waitUntil:'networkidle'}); await page.waitForTimeout(1800);
    const H = await page.evaluate(()=>document.documentElement.scrollHeight);
    const m = await page.evaluate(()=>{
      const r=s=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); const cs=getComputedStyle(e); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height),fs:cs.fontSize,ff:cs.fontFamily.slice(0,40),ta:cs.textAlign}};
      const h1=document.querySelector('h1'); let glyph=null;
      if(h1){const rg=document.createRange(); rg.selectNodeContents(h1); const b=rg.getBoundingClientRect(); glyph={x:Math.round(b.x),w:Math.round(b.width),y:Math.round(b.y),h:Math.round(b.height)}}
      return {h1:r('h1'),h1glyph:glyph,h1text:h1?.innerText, logo:r('header svg, header img, .site-header svg'), nav:r('header nav a'), overflowX: document.documentElement.scrollWidth>innerWidth, sw:document.documentElement.scrollWidth,
        sections:[...document.querySelectorAll('main > section, main > div > section')].map(s=>({cls:s.className.slice(0,60),id:s.id,h:Math.round(s.getBoundingClientRect().height)}))};
    });
    m.scrollHeight=H; m.errors=errs;
    metrics[`${slug}-${tag}`]=m;
    const steps=[]; for(let y=0;y<H-h+1;y+=Math.round(h*0.5)) steps.push(y); steps.push(Math.max(0,H-h));
    let i=0;
    const shoot=async (y,dir2)=>{ await page.mouse.wheel(0,0); await page.evaluate(y=>{ if(window.lenis&&window.lenis.scrollTo) window.lenis.scrollTo(y,{immediate:true}); else window.scrollTo(0,y)},y); await page.waitForTimeout(700); await shot(page,{path:`${dir}/${dir2}-${String(i++).padStart(3,'0')}-y${y}.jpg`,quality:70}); };
    for(const y of steps) await shoot(y,'fwd');
    i=0; for(const y of [...steps].reverse()) await shoot(y,'rev');
    } catch(e) { failures.push(`${p} @${tag}: ${String(e.message||e).split('\n')[0]}`); }
    await page.close().catch(()=>{});
  }
  await ctx.close();
}
metrics._failures = failures;
fs.writeFileSync(`${outRoot}/metrics.json`, JSON.stringify(metrics,null,1));
if (failures.length) console.log('capture failures:', failures);
await browser.close();
