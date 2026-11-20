import os,sys
from PIL import Image,ImageDraw,ImageFont
OUT=os.environ.get('SHEET_OUT','/workspace/tina-seams-2026-11-19/build-plan/gap-audit-2026-11-20')
STG=os.environ.get('STG','/tmp/ga/stg'); REF=os.environ.get('REF','/tmp/ga/ref'); LABEL=os.environ.get('LABEL','live staging b445e46')
names={'01A':'Home hero, living gown','02A':'Home filmstrip, film gate advance','03B':'Home runway, followspot','04B':'Work hover, crimson ink drop','05C':'Work entrance, light table drop','06B':'Editorial split, crimson thread','07C':'Series story, print stack','08B':'Page transition, ink flood','09B':'About parallax, blue hour lights','10A':'Contact footer, blue hour drift','11B':'Portraits chapters, veil wipe'}
moments={'time':'t = 0, 1.2, 2.4, 3.6, 4.8, 6.0 s','range':'scroll progress 0 to 1 (6 steps)'}
try: F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15); FB=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',20)
except: F=FB=ImageFont.load_default()
CW,LW=320,150
def fit(p,w,h):
    c=Image.new('RGB',(w,h),(40,40,40))
    if not os.path.exists(p):
        ImageDraw.Draw(c).text((10,h//2-8),'no frame',fill=(220,80,80),font=F); return c
    im=Image.open(p).convert('RGB'); im.thumbnail((w,h)); c.paste(im,((w-im.width)//2,(h-im.height)//2)); return c
for sid in sys.argv[1:]:
    rows=[('Reference clip',REF+'/%s-%d.jpg',180),('Staging desktop 1440',STG+'/%s/desktop-%d.jpg',180),('Staging phone 390',STG+'/%s/phone-%d.jpg',300)]
    H=40+sum(r[2]+6 for r in rows)
    S=Image.new('RGB',(LW+6*(CW+4),H),(18,18,20)); d=ImageDraw.Draw(S)
    d.text((10,8),f'{sid}  {names[sid]}   reference (top) vs {LABEL} (rows 2-3), 20 Nov 2026',fill=(240,240,240),font=FB)
    y=40
    for lab,pat,h in rows:
        d.text((8,y+h//2-10),lab,fill=(230,230,230),font=F)
        for k in range(6): S.paste(fit(pat%(sid,k),CW,h),(LW+k*(CW+4),y))
        y+=h+6
    S.save(f'{OUT}/sheet-{sid}.jpg',quality=72,optimize=True); print(sid,os.path.getsize(f'{OUT}/sheet-{sid}.jpg'))
