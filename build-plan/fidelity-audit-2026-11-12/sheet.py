from PIL import Image, ImageDraw, ImageFont
L='/workspace/tina-campbell/concepts/site-layouts/'
try: F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22); FS=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',17)
except: F=FS=ImageFont.load_default()
lay=Image.open(L+'01-home-desktop-v2b.jpg').convert('RGB')
mob=Image.open(L+'11-home-mobile.jpg').convert('RGB')
def c(im,box): return im.crop(box)
O=lambda f: Image.open(f).convert('RGB')
rows=[
 ('Header + hero', c(lay,(0,13,720,412)), O('shots/home-1440-viewport.png'), 'DRIFT', 'Daylight grade vs night "fashion show" grade; name ~45% width left vs ~80% centred; header logo/nav smaller, nav not mono'),
 ('The Runway strip', c(lay,(0,432,720,690)), O('frames/home-fwd-02.png'), 'DRIFT', '5th frame clipped (track 1493px > content); 03/04/05 picks differ (no magenta-stage frame in images/)'),
 ('Statement + categories', c(lay,(0,722,720,917)), O('shots/home-1440-sec1.png'), 'DRIFT', 'Statement matches. Category tiles ~half the layout height; labels sans left vs mono centred under tile'),
 ('Red Gown editorial split', c(lay,(0,930,720,1110)), O('shots/home-1440-sec3.png'), 'DRIFT', 'Portrait fb_116 with baked watermark vs wide gown-on-truck landscape bleeding right'),
 ('Bridge + Skyline band', c(lay,(0,1113,720,1280)), O('shots/home-1440-sec4.png'), 'DRIFT', 'Two photos blended into a hazy pink wash + baked TCPHOTO + large logo; layout is one crisp dusk skyline + arch'),
 ('Mobile hero (390)', c(mob,(127,43,440,676)), O('shots/home-390-viewport.png'), 'DRIFT', 'Name stacked centred & larger in layout; logo larger; sticky pill matches'),
 ('Mobile runway (390)', c(mob,(483,43,800,676)), O('shots/home-390-sec0.png'), 'DRIFT', 'Layout: tall full-height 3-panel strip + No. / location caption + crimson progress. Build: short frames, numbers only'),
 ('Mobile categories (390)', c(mob,(847,43,1160,676)), O('shots/home-390-sec1.png'), 'MATCH', 'Close. Minor: small-caps, larger thumbs, count line'),
 ('404', O(L+'19-404-desktop.jpg'), O('shots/404.html-1440-viewport.png'), 'DRIFT', 'Missing H1 "Page not found", blurred film-frame photo, "Back home" pill (build: "Home")'),
 ('Loader (first visit)', O(L+'14-motion-loader-signature.jpg'), O('frames/loader-1.png'), 'MATCH', 'Signature + crimson line + counter match; tip glow missing (minor)'),
]
H=420; pad=12; lw=260
def fit(im): return im.resize((int(im.width*H/im.height),H))
widths=[lw+fit(a).width+fit(b).width+pad*4 for _,a,b,_,_ in rows]
W=max(widths)
sheet=Image.new('RGB',(W,len(rows)*(H+60)+70),'#0c0c0f'); d=ImageDraw.Draw(sheet)
d.text((pad,18),'Tina Campbell fidelity audit 2026-11-12 | LEFT approved Imagine layout | RIGHT local build of commit d466aa0 (main, after 002b)',fill='white',font=F)
y=70
for name,a,b,v,note in rows:
  col={'MATCH':'#4caf50','DRIFT':'#e0a030','MISSING':'#b3261e'}[v]
  d.text((pad,y+10),name,fill='white',font=F); d.text((pad,y+44),v,fill=col,font=F)
  a2,b2=fit(a),fit(b); sheet.paste(a2,(lw,y)); sheet.paste(b2,(lw+a2.width+pad,y))
  d.text((pad,y+H+8),note,fill='#c8c8cc',font=FS); y+=H+60
sheet.save('sheets/CONTACT-SHEET-home-404-loader.jpg',quality=80); print(sheet.size)
