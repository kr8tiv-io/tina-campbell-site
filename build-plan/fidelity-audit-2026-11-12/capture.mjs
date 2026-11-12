import { chromium } from '/workspace/tina-campbell/site/node_modules/playwright/index.mjs';
const BASE='http://127.0.0.1:4417', OUT='/workspace/tina-fidelity-audit-2026-11-12/audit';
const routes=['/','/404.html','/work/','/runway/','/fashion-editorial/','/series/the-red-gown/','/portraits-bridal-couples/','/about/','/services/','/journal/','/book/'];
const browser=await chromium.launch({executablePath:'/home/box/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const report=[];
for (const [w,h] of (process.env.SKIP?[]:[[1440,900],[390,844]])) {
  const ctx=await browser.newContext({viewport:{width:w,height:h}, deviceScaleFactor:1, hasTouch:w<800, isMobile:w<800});
  await ctx.addInitScript(()=>{try{sessionStorage.setItem('tc-loader','1')}catch(e){}});
  for (const r of routes) {
    const p=await ctx.newPage(); const errs=[];
    p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push(String(e)));
    const resp=await p.goto(BASE+r,{waitUntil:'networkidle'}).catch(e=>null);
    const status=resp?resp.status():0;
    await p.waitForTimeout(2500);
    const name=(r==='/'?'home':r.replace(/\//g,'_').replace(/^_|_$/g,''))+`-${w}`;
    // viewport (hero) shot
    await p.screenshot({path:`${OUT}/shots/${name}-viewport.png`});
    // scroll through slowly to trigger reveals, then full page
    const H=await p.evaluate(()=>document.scrollingElement.scrollHeight);
    for(let y=0;y<H;y+=Math.round(h*0.5)){await p.mouse.wheel(0,Math.round(h*0.5)).catch(()=>{}); await p.evaluate(yy=>window.scrollTo(0,yy),y); await p.waitForTimeout(250);}
    await p.waitForTimeout(800);
    await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(800);
    await p.screenshot({path:`${OUT}/shots/${name}-full.png`, fullPage:true});
    const overflow=await p.evaluate(()=>document.scrollingElement.scrollWidth>innerWidth);
    const broken=await p.evaluate(()=>[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));
    const sections=await p.evaluate(()=>[...document.querySelectorAll('main > section, main > *')].map(s=>({cls:s.className,top:Math.round(s.getBoundingClientRect().top+scrollY),h:Math.round(s.getBoundingClientRect().height)})));
    report.push({w,route:r,status,H,overflow,broken,errs,sections});
    await p.close();
  }
  await ctx.close();
}
// motion: home scroll through runway pin, frames every ~80px
const ctx=await browser.newContext({viewport:{width:1280,height:720}});
await ctx.addInitScript(()=>{try{sessionStorage.setItem('tc-loader','1')}catch(e){}});
const p=await ctx.newPage(); await p.goto(BASE+'/',{waitUntil:'networkidle'}); await p.waitForTimeout(2000);
await p.mouse.move(640,360);
let i=0;
for(let s=0;s<60;s++){ await p.mouse.wheel(0,120); await p.waitForTimeout(160); if(s%3===0){await p.screenshot({path:`${OUT}/frames/home-fwd-${String(i++).padStart(2,'0')}.png`});} }
for(let s=0;s<30;s++){ await p.mouse.wheel(0,-120); await p.waitForTimeout(160); if(s%3===0){await p.screenshot({path:`${OUT}/frames/home-rev-${String(i++).padStart(2,'0')}.png`});} }
await ctx.close();
// loader first visit
const c2=await browser.newContext({viewport:{width:1280,height:720}});
const p2=await c2.newPage(); await p2.goto(BASE+'/'); for(let k=0;k<8;k++){await p2.waitForTimeout(400); await p2.screenshot({path:`${OUT}/frames/loader-${k}.png`});}
await c2.close();
await browser.close();
import fs from 'fs'; if(!process.env.SKIP)fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,1));
console.log(report.map(r=>`${r.w} ${r.route} ${r.status} H=${r.H} ovf=${r.overflow} broken=${r.broken.length} errs=${r.errs.length}`).join('\n'));
