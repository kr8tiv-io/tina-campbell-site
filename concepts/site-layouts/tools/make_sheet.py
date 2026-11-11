import os, glob
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import json
OVR = json.load(open(os.path.join(D, 'tools', 'picks.json'))) if os.path.exists(os.path.join(D, 'tools', 'picks.json')) else {}
def best(prefix):
    if prefix in OVR: return os.path.join(D, OVR[prefix])
    for suf in ['-v3', '-v2b', '-v2', '']:
        f = os.path.join(D, prefix + suf + '.jpg')
        if os.path.exists(f): return f
PICKS = [(p, l) for p, l in [
 ('01-home-desktop', '01 Home'), ('02-work-index-desktop', '02 Work'), ('03-fashion-editorial-desktop', '03 Fashion & Editorial'),
 ('04-series-story-desktop', '04 Series story'), ('05-portraits-bridal-desktop', '05 Portraits, Bridal, Couples'),
 ('07-about-desktop', '07 About'), ('08-services-desktop', '08 Services'), ('09-journal-desktop', '09 Journal'), ('10-contact-book-desktop', '10 Book a shoot')]]
WIDE = [('06-runway-gallery-desktop', '06 Runway gallery'), ('11-home-mobile', '11 Mobile: Home'), ('12-series-mobile', '12 Mobile: Series'),
 ('13-about-mobile', '13 Mobile: About'), ('14-motion-loader-signature', '14 Motion: signature loader'), ('15-motion-page-transition', '15 Motion: page transition'),
 ('16-motion-hover-distortion', '16 Motion: noir-to-colour hover')]
INK = (12, 12, 15); WHITE = (240, 243, 244); CRIM = (179, 38, 30)
def font(sz, serif=False):
    for p in (['/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'] if serif else []) + ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
pad = 40; tw, th = 360, 640; ww, wh = 720, 405; lab = 44
cols = 9; W = pad + cols * (tw + pad)
wcols = 4; wrows = 2
H = 170 + th + lab + pad + wrows * (wh + lab + pad) + 60
sheet = Image.new('RGB', (W, H), INK); d = ImageDraw.Draw(sheet)
d.text((pad, 50), 'Tina Campbell  ·  TCPhoto  ·  full-site layouts', font=font(56, True), fill=WHITE)
d.text((pad, 120), 'Runway + Editorial Split  ·  Grok Imagine  ·  KR8TIV', font=font(26), fill=(160, 160, 166))
d.rectangle([pad, 160, pad + 120, 164], fill=CRIM)
used = []
y = 190
for i, (p, l) in enumerate(PICKS):
    f = best(p); used.append(f)
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    x = pad + i * (tw + pad); sheet.paste(im, (x, y)); d.text((x, y + th + 10), l, font=font(22), fill=WHITE)
y += th + lab + pad
for i, (p, l) in enumerate(WIDE):
    f = best(p); used.append(f)
    r, c = divmod(i, wcols)
    im = Image.open(f).convert('RGB').resize((ww, wh), Image.LANCZOS)
    x = pad + c * (ww + pad + 60); yy = y + r * (wh + lab + pad)
    sheet.paste(im, (x, yy)); d.text((x, yy + wh + 10), l, font=font(22), fill=WHITE)
out = os.path.join(D, 'sheet-site-layouts.jpg')
sheet.save(out, quality=85, optimize=True)
print(out, sheet.size); print('\n'.join(os.path.basename(u) for u in used))
