# 003b runway exact-match round 1

Scope: R1 (frame width) and R6 (sprocket holes). Height barrel left as `1 - 0.48 x^2 + 0.08 x^3`. R2, R3, R4, R5, R8 were not restyled. R7 stays on `fb_029_runway` and `fb_012_runway`.

Measurements are on `after-clip02/build/b-000.jpg` (1280x720, clip 02 t=0) unless noted. Shader compile: `frames.json` errors `[]`, desktop section class `catwalk is-webgl`.

| ID | Target | Measured build | Result | What changed |
|---|---|---|---|---|
| R1 | About 7 frames. Centre pitch 250–280 px (near 265). Frames nearest the edges about 130–170 px. Height stays the barrel: centre ~0.60 vh, x=200 and x=1080 about 0.48 vh, top highest and bottom lowest at the centre, left matching right. | Gutters at x=125.5, 292.5, ~510, 772, 982.5, 1151, 1270. Pitches 167, ~218, ~262, ~211, ~169, 119 px, plus a cropped left sliver (~126 px) and a right hairline. About 7 frames. Centre pitch ~262 px. Nearest full edge frames 167 and 169 px; outermost slivers 119 and 126 px, in line with layout 06 columns at 121 and 134. Height at x=642: 432 px, top 232, bottom 664. x=202: 346 px. x=1082: 344 px. | PASS | `curvedStrip.ts` vertex shader: `foreshortenX` maps frame units with `dx/d(frame) = centrePitch / (1 + 1.42 nx^2)`. Centre derivative stays the centre pitch. Height polynomial unchanged. |
| R6 | Holes about 14–17 px wide, 20–26 px tall, 34–40 px apart, darker than the #151517 band. Gutters stay thin and dark. | Top band y=252, centre run x=535–762: widths 15, 15, 15, 15, 15, 15 px; pitches 35, 36, 36, 36, 35, 35 px. Dark core at x=649 is y=241–262 (22 px), luma 4–6. Band at x=640 y=245 is BGR 19,19,19. Holes are darker than the band. Gutter uniform was not changed. | PASS | Fragment shader hole window is now `smoothstep(0.24, 0.30)` by `smoothstep(0.76, 0.70)` across, and `smoothstep(0.16, 0.22)` by `smoothstep(0.84, 0.78)` through the 0.09 band. `uHole = 36 / pitchPx` so the centre pitch is 36 px. |

## Left as they were

- R2 fill: all 25 replay frames still have film at both screen edges. No flat ink run wider than 20 px in the photo band.
- R3 pin: `pin-meta.json` is start 0, dist 5310, travel 5310, k=1.
- R4 motion: `runway.ts` was not edited. The strip travels left from t=0.25 through t=3.75 and is at rest by t=4.00 (frame-to-frame mean difference 0.29 at b-016, then settled). Rest lands on a centred frame. Centre scroll speed is still one centre pitch per frame unit, so the 1060 px gesture is the same.
- R5 light: dim and blur still follow screen x. Not retuned.
- R7 photos: opening is still the dark `fb_029` / `fb_012` run. No magenta-catwalk plate was added.
- R8 title: h1 "Runway" is 32 px serif. Crimson rail is present. No horizontal overflow at 1440 or 390. Console errors `[]`.

Pairs `pair-000.jpg` through `pair-024.jpg` were opened. Side-by-sides: `side-runway-strip-1280.jpg`, `side-runway-strip-1440.jpg`.
