import { chromium } from '@playwright/test';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root='/tmp/tdist'; const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.woff2':'font/woff2','.xml':'application/xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]); if(p.endsWith('/'))p+='index.html'; let f=path.join(root,p); if(!fs.existsSync(f)){f=path.join(root,'404.html');} r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r);}).listen(4599);
const b=await chromium.launch(); const out=process.argv[2]; fs.mkdirSync(out,{recursive:true});
for (const [w,h] of [[1440,900],[390,844]]) { const p=await b.newPage({viewport:{width:w,height:h}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://localhost:4599/'); await p.waitForTimeout(3500); await p.screenshot({path:`${out}/home-${w}.png`, fullPage:true}); const ov=await p.evaluate(()=>document.scrollingElement.scrollWidth>innerWidth); console.log(w,'overflow',ov,'errors',errs); await p.close(); }
await b.close(); srv.close();
