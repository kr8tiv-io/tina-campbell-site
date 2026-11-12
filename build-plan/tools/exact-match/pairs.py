#!/usr/bin/env python3
"""Pairs clip and build frames at identical timestamps. Writes pair-XXX.jpg, CONTACT-clip-vs-build.jpg
(left column clip, right column build) and zone-luma.json (3x3 mean luminance per frame, a grade/composition check)."""
import json, sys, os
from PIL import Image, ImageDraw, ImageStat
out = sys.argv[1]; d = json.load(open(os.path.join(out, 'frames.json')))
W = 640; rows = []; zl = []
for i, (t, c, b) in enumerate(zip(d['times'], d['clip'], d['build'])):
    ci = Image.open(c).convert('RGB').resize((W, 360)); bi = Image.open(b).convert('RGB').resize((W, 360))
    P = Image.new('RGB', (W * 2 + 8, 360 + 26), (12, 12, 15)); dr = ImageDraw.Draw(P)
    dr.text((8, 6), f't={t:.2f}s  LEFT approved clip   RIGHT local build', fill=(240, 243, 244))
    P.paste(ci, (0, 26)); P.paste(bi, (W + 8, 26)); P.save(os.path.join(out, f'pair-{i:03d}.jpg'), quality=85); rows.append(P)
    def zones(im):
        g = im.convert('L'); return [round(ImageStat.Stat(g.crop((x * W // 3, y * 120, (x + 1) * W // 3, (y + 1) * 120))).mean[0], 1) for y in range(3) for x in range(3)]
    zc, zb = zones(ci), zones(bi); zl.append({'t': t, 'clip': zc, 'build': zb, 'mean_abs_diff': round(sum(abs(a - b) for a, b in zip(zc, zb)) / 9, 1)})
cols = 2; th = [r.resize((r.width // 2, r.height // 2)) for r in rows]
S = Image.new('RGB', (th[0].width * cols + 6, (th[0].height + 4) * ((len(th) + cols - 1) // cols)), (40, 40, 40))
for i, r in enumerate(th): S.paste(r, ((i % cols) * (th[0].width + 6), (i // cols) * (th[0].height + 4)))
S.save(os.path.join(out, 'CONTACT-clip-vs-build.jpg'), quality=82)
json.dump(zl, open(os.path.join(out, 'zone-luma.json'), 'w'), indent=0)
print('mean zone luma diff per frame:', [z['mean_abs_diff'] for z in zl])
