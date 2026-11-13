// Exact-match replay: drives the built page with the SAME input curve the approved clip shows,
// samples frames at the clip's timestamps, and writes clip-vs-build pairs + a contact sheet.
// Usage: node replay.mjs --clip clip01 --base http://localhost:4321 --out /path/qa/<id>/exact/clip01 [--fps 4] [--timescale 1]
import { chromium } from '/workspace/tina-campbell/site/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const A = Object.fromEntries(process.argv.slice(2).reduce((a,v,i,arr)=>{ if(v.startsWith('--')) a.push([v.slice(2), arr[i+1]]); return a; },[]));
const HERE = path.dirname(new URL(import.meta.url).pathname);
const P = JSON.parse(fs.readFileSync(path.join(HERE,'clip-profiles.json'),'utf8'));
const prof = P[A.clip]; if(!prof) throw new Error('unknown --clip '+A.clip);
const base = A.base || 'http://localhost:4321'; const out = A.out; const fps = +(A.fps||4); const ts = +(A.timescale||1);
fs.mkdirSync(out+'/build',{recursive:true}); fs.mkdirSync(out+'/clip',{recursive:true});
const exe = fs.existsSync('/home/box/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome') ? '/home/box/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome' : undefined;
const browser = await chromium.launch({ executablePath: exe, args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport:{width:1280,height:720}, deviceScaleFactor:1 });
await ctx.addInitScript(()=>{ try{ sessionStorage.setItem('tc-loader','1'); }catch(e){} });
const page = await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e))); page.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
const times = []; for(let t=0; t<=6.0001; t+=1/fps) times.push(+t.toFixed(3));
const shots = [];
// Screenshots can throw "Unable to capture screenshot" while a navigation is only committed (fromLoad
// clips sample from navigation start, before first paint). Retry briefly; if the frame still cannot be
// captured, record it as missing (pairs.py draws a labelled NO CAPTURE tile) instead of crashing the run.
const missing = [];
const snap = async (i) => { const f = `${out}/build/b-${String(i).padStart(3,'0')}.jpg`;
  for (let k=0; k<5; k++) { try { await page.screenshot({path:f, quality:85, type:'jpeg', timeout:4000}); shots.push(f); return; }
    catch(e) { if (k===4) errs.push(`screenshot ${i} failed: ${String(e.message||e).split('\n')[0]}`); await page.waitForTimeout(30); } }
  missing.push(i); shots.push(f); };
const goto = async (u) => { await page.goto(base+u,{waitUntil:'networkidle'}); };
if (prof.fromLoad) {
  // record a load-in: navigate and sample from navigation start
  const nav = page.goto(base+prof.page,{waitUntil:'commit'});
  await nav; const t0 = Date.now();
  for (let i=0;i<times.length;i++){ const w = times[i]*1000*ts-(Date.now()-t0); if(w>0) await page.waitForTimeout(w); await snap(i); }
} else {
  await goto(prof.page); await page.waitForTimeout(2500);
  if (ts !== 1) await page.evaluate(s=>{ try{ window.__tcMotion.gsap.globalTimeline.timeScale(1/s);}catch(e){} }, ts);
  let curve = null; let startY = 0;
  if (prof.scrollY) curve = prof.scrollY;
  if (prof.stripTravelPx) {
    const meta = await page.evaluate(()=>{ const s=document.querySelector('[data-pin-distance]'); return s? {start:+s.dataset.pinStart, dist:+s.dataset.pinDistance, travel:+(s.dataset.travelPx||s.dataset.pinDistance)} : null; });
    const k = meta ? meta.dist/Math.max(1,meta.travel) : 1; startY = meta ? meta.start + meta.dist*0.15 : 0;
    curve = prof.stripTravelPx.map(v=>v*k);
    fs.writeFileSync(out+'/pin-meta.json', JSON.stringify({meta,k,startY}));
  }
  if (prof.scrollLinearPx) curve = Array.from({length:145},(_,i)=>prof.scrollLinearPx*i/144);
  if (curve) {
    await page.evaluate(y=>window.__tcMotion ? window.__tcMotion.scrollTo(y) : window.scrollTo(0,y), startY); await page.waitForTimeout(800);
    await page.evaluate(({curve,startY,fpsC,ts})=>{ const t0=performance.now(); const step=()=>{ const k=(performance.now()-t0)/1000/ts*fpsC; const i=Math.min(curve.length-1,Math.floor(k)); const f=Math.min(1,k-i); const y=startY+curve[i]+((curve[Math.min(curve.length-1,i+1)]-curve[i])*f); window.__tcMotion ? window.__tcMotion.scrollTo(y) : window.scrollTo(0,y); if(k<curve.length) requestAnimationFrame(step); }; requestAnimationFrame(step); }, {curve,startY,fpsC:P.fps,ts});
  }
  const t0 = Date.now(); let acted=false;
  const tiles = await page.$$eval('main a img, main figure img, main [data-tile] img', els=>els.map(e=>{const r=e.getBoundingClientRect(); return [r.x,r.y,r.width,r.height];}).filter(r=>r[2]>150 && r[1]>80 && r[1]<600));
  fs.writeFileSync(out+'/tiles.json', JSON.stringify(tiles));
  if (prof.hoverAt!==undefined || prof.clickAt!==undefined) await page.mouse.move(5,700);
  for (let i=0;i<times.length;i++){
    const at = prof.hoverAt ?? prof.clickAt;
    if (at!==undefined && !acted && times[i]>=at) { const r=tiles[prof.tile]||tiles[0]; if(r){ await page.mouse.move(r[0]+r[2]/2, r[1]+r[3]/2, {steps:6}); if(prof.clickAt!==undefined) await page.mouse.click(r[0]+r[2]/2, r[1]+r[3]/2); } acted=true; }
    const w = times[i]*1000*ts-(Date.now()-t0); if(w>0) await page.waitForTimeout(w); await snap(i);
  }
}
// clip frames at the same timestamps
const clipPath = '/workspace/tina-campbell/concepts/site-layouts/motion/'+prof.clip;
const clipShots = times.map((t,i)=>{ const f=`${out}/clip/c-${String(i).padStart(3,'0')}.jpg`; execFileSync('ffmpeg',['-v','error','-y','-ss',String(Math.min(t,6.0)),'-i',clipPath,'-frames:v','1','-q:v','3',f]); return f; });
fs.writeFileSync(out+'/frames.json', JSON.stringify({times, clip:clipShots, build:shots, missing, errors:errs, timescale:ts}));
execFileSync('python3',[path.join(HERE,'pairs.py'), out]);
await browser.close();
console.log(out+'/CONTACT-clip-vs-build.jpg'); if(errs.length) console.log('console errors:', errs.slice(0,5));
