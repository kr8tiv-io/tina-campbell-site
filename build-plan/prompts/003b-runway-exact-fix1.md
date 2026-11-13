---
id: 003b-runway-exact-fix1
title: Runway exact-match round 1 (frame width and sprocket holes)
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope is only the failing IDs below. Do not restyle anything that already passed (R2 fill, R3 pin length, R4 motion curve, R5 centre light and edge falloff, R8 title and rail). Leave R7 on `fb_029_runway` and `fb_012_runway` for the opening. Keep the height barrel: centre 0.60 vh, edge-frame height about 0.48 vh, top highest and bottom lowest at the centre, left matching right.

R1. Edge frames are as wide as the centre, so the strip shows about 5 frames instead of about 7.
Measured: on `qa/003b-runway-exact/exact/driver-verify-003b-runway-exact/clip02/build/b-000.jpg` the full-height gutters are x=242, 505 and 773, pitch 263–268 px, constant across the screen (`scaleX` is 1 in `site/src/scripts/webgl/curvedStrip.ts`). About 5 frames are on screen, including the cropped edge frames. Height is already right: centre x=640 top 232 bottom 664 (432 px, 0.600 vh); x=200 and x=1080 about 344 px (0.48 vh).
Target: layout 06 and clip 02 t=0. Centre frames about 250–270 px wide. Edge frames narrow to about 130–170 px (layout low-variance columns at x=119, 253, 983, 1135, 1256). About 7 frames visible. Height stays the measured barrel. Symmetric at every scroll position.
Evidence: `qa/003b-runway-exact/exact/driver-verify-003b-runway-exact/clip02/build/b-000.jpg`, `clip02/clip/c-000.jpg`, `clip02/pair-000.jpg`, `concepts/site-layouts/06-runway-gallery-desktop-v2.jpg`.
Fix: foreshorten width with screen x in the vertex shader, the same way height already scales. Keep centre pitch about 250–280 px at 1280. Bring the frames nearest the screen edges down to about 130–170 px. Do not change the height function `1 - 0.48 x^2 + 0.08 x^3`. After a clip02 replay, `b-000.jpg` should show about 7 frames, matching `c-000.jpg` and layout 06, with the centre frame still near 265 px and the edge frames visibly narrower. Keep R2 (no empty ink at the sides) and R4 (1060 px of leftward travel, peak about 600 px/s, rest on a centred frame).

R6. Sprocket holes are tiny dots, not the clip's perforations.
Measured: band is #151517 (BGR 23,21,21 at x=640, y=245 on `b-000.jpg`). Holes at y=252 sit at x=532, 590, 648, 707, 766 with widths 8, 8, 9, 8, 7 px, pitch 58 px, dark core about 8 px tall (y=248–255, luma 4–6). That comes from `uHole = 0.22` and a hole window of about 12% of the period by about 16% of the 0.09 band.
Target: clip 02 and layout 06. Holes about 15 px wide and about 22 px tall at 1280, pitch about 36 px, near-black, on the #151517 band, with the thin dark gutters kept. Clip y=250 widths are 14–16 px and pitch is 34–38 px; the dark core at x=560 runs about y=242–264. Not bright grey, and not the current 8×8 dots.
Evidence: `qa/003b-runway-exact/exact/driver-verify-003b-runway-exact/clip02/build/b-000.jpg`, `clip02/clip/c-000.jpg`, `concepts/site-layouts/06-runway-gallery-desktop-v2.jpg`.
Fix: in the fragment shader, change the hole period and the smoothstep window so a 1280 frame shows holes about 14–17 px wide, 20–26 px tall, and about 34–40 px apart, still darker than the #151517 band. Keep the gutters thin and dark. Re-measure a row through the top band on the new `b-000.jpg` before calling it done.

Commit: fix(003b-runway-exact): exact-match round 1
