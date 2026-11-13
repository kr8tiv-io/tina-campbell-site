# 004b work index exact-match round 1

Scope: W1 and W5 only. W2, W3, W4, W6, W7, and W8 were left as they were. Desktop rest grade was not retuned.

Clip 03, viewport 1280x720. Hover tile is the second in-view tile: box x 447.1, y 273.0, 385.9 x 473.5. Pointer (640, 510), which is the tile centre (193, 237) in tile pixels. Console errors on the timescale-4 replay and the normal replay: none. `metrics.json`: work-1440 overflow false, sw 1440, errors []; work-390 overflow false, sw 390, errors [].

| ID | Target | Measured build value | Result | What changed |
|---|---|---|---|---|
| W1 | Same noir grade at 390 as at 1440. True blacks, grey skies, no blown highlights, only red stays red. Ripple and the View disc stay fine-pointer only. | 390 `fwd-000-y0.jpg` grid y220-820: blown>230 0.00%, luma p95 163.0, max 193. Truck (180,400) is (141,141,141). Bridge sky (80,700) is (152,152,152). Non-red channel span p95 is 2.0. Red pixels in the frame: 5642, bbox x 22-315, y 181-395, samples (172,10,31), (95,20,43), (163,61,83). `fwd-004-y1688.jpg` blown 0.00%, p95 167, max 193. `fwd-008-y3376.jpg` blown 0.00%, p95 168, max 204. 1440 `fwd-000-y0.jpg` grid y300-890: blown 0.00%, p95 166.0, max 202. Sky (200,450) is (160,160,160). Dress (300,500) is (167,14,45). Mean abs diff versus the before-pages 1440 y0 frame is 0.000. Filter row still reads "70 frames". No View disc on the 390 capture. | PASS | `useGl` is now `!reduced && canWebGL()`. The coarse-pointer rule that set `.work-canvas { display: none }` is gone. Narrow and coarse pointers show the graded still and do not bind hover. The grade curve (black point, crushed highlights, red mask) is the same function the desktop rest path already used. |
| W5 | Concentric rings centred on the cursor. First ring just after enter. Radius about 120 px at t=2 s and about 200 px at t=4 s at 1280. Spacing about 18 px. Visible red/cyan fringe. Subject at the centre stays recognisable. Spill past the tile edge. Radius formula not grown. | Timescale 4, frame diff against `b-000`, pointer (640, 510). Outer radius (last 2 px bin with r>30 and fraction of pixels abs>8 above 0.15): t=1.0 is 68 px, t=2.0 is 126 px, t=3.0 is 168 px, t=4.0 is 204 px. Spacing on `b-016` is an autocorrelation lag of 18 px (correlation 0.76) on the radial profile from r=40 to r=190. Side spill at t=4: strong change (frac>0.5) reaches 7 px past both tile edges, faint change to 8 px. Half the tile is 193 px, so a 204 px radius crosses the gutter; `pair-016.jpg` shows the rings on the neighbouring bride tile. `pair-008.jpg`: grille slats and hood lettering bow, face and dress still read, neighbours stay grey. `pair-016.jpg`: thick rings, red/cyan fringe on the chrome, truck and dress still readable, centre under the View disc calmer than the outer bands. Origin is the pointer. | PASS | In-ring displacement is an 11 px sine locked to the wavefront, plus an 8 px lip on the leading edge, so straight slats bend. Chromatic shift is 4.6 px, applied after `gradeNoir`, with a 3.4 px feather. Radius stays `210 * scale * pow(ripple, 0.72)` and spacing stays `18 * scale`. `uTime` scrolling was removed so the outer crest cannot hide one spacing inside the formula radius. |

## W6 re-check (not retimed)

Hover-tile sky at (tile.x+28, tile.y+18) on the timescale-4 replay: t=0 through t=4 is (118,118,118). t=4.5 is (114,121,131). t=5 is (108,133,174). t=6 is (100,141,207). Neighbours stay grey. Normal-speed replay: t=0 is (118,118,118), t=1.0 is (114,123,140), t=2.0 is (99,142,210). Ripple still runs 0-1.0 s and colour still runs 1.0-1.6 s at site speed. The GSAP timeline was not edited.

## Evidence

- Timescale 4 contact: `qa/004b-work-exact-fix1/exact/after-clip03-ts4/CONTACT-clip-vs-build.jpg`
- Normal contact: `qa/004b-work-exact-fix1/exact/after-clip03/CONTACT-clip-vs-build.jpg`
- Pair sheets: `qa/004b-work-exact-fix1/exact/sheets/after-clip03-ts4-pairs.jpg`, `sheets/after-clip03-pairs.jpg`
- Page sheets: `sheets/after-work-390-fwd.jpg`, `sheets/after-work-1440-fwd-top.jpg`
- Sides: `sides/side-layout02-vs-work-1440.jpg`, `sides/side-pdf18-vs-work-390.jpg`, `sides/side-1440-vs-390-grade.jpg`, `sides/side-layout16-vs-ts4-t2.jpg`, `sides/side-layout16-vs-ts4-t4.jpg`, `sides/side-clip-vs-build-t2.jpg`, `sides/side-clip-vs-build-t4.jpg`
- Opened frame by frame: timescale-4 pairs 000, 004, 008, 012, 016, 018, 020, 024, plus the full pair contact sheet. Normal pair 004 and the normal pair contact sheet. 390 `fwd-000-y0.jpg` and `fwd-008-y3376.jpg`.
