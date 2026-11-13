---
id: 004b-work-exact-fix1
title: Work index exact-match round 1 (mobile noir grade, ripple strength)
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope is only the failing IDs below. Do not restyle anything that already passed (W2 filter row and the 70-frame count, W3 live captions, W4 masonry mix, W6 ripple-then-colour order and timing, W7 leave collapse, W8 64 px View disc). Keep the desktop rest grade as it is.

W1. The 390 work index is full colour. The 1440 rest grade is already noir.
Measured: on `qa/004b-work-exact/exact/driver-verify-004b-work-exact/pages/work-390/fwd-000-y0.jpg`, grid y220–820, blown>230 is 4.77%, luma p95 228.6, max 255, non-red chroma 39%. Truck pixel (180,400) is (102,188,215). Bridge sky (80,700) is (177,188,216). The same colour holds at `fwd-004-y1688.jpg` (blown 6.0%) and `fwd-008-y3376.jpg` (blown 9.4%). Desktop `pages/work-1440/fwd-000-y0.jpg` grid y300–890 is blown 0%, p95 166, max 194, other chroma 0.9%. Sky (200,450) is (160,160,160). Dress (300,500) is (167,14,45). Cause: `useGl` in `site/src/scripts/motion/work.ts` requires `fine && min-width: 801px`, and `site/src/styles/work.css` sets `.work-canvas { display: none }` under `(hover: none), (pointer: coarse)`, so the raw `<img>` shows.
Target: the same noir grade at 390 as at 1440. True blacks, grey skies, no blown highlights, only red stays red. PDF p18 and layout 02. Ripple and the View disc stay fine-pointer only.
Evidence: `qa/004b-work-exact/exact/driver-verify-004b-work-exact/pages/work-390/fwd-000-y0.jpg`, `pages/work-1440/fwd-000-y0.jpg`, `review/side-1440-vs-390-grade.jpg`, `review/w1-tiles-390.jpg`.
Fix: grade the tiles at every width, including 390 and coarse pointers. Keep the current desktop curve (black point, crushed highlights, red mask). On narrow and coarse pointers show that graded still and skip the hover ripple. After the next capture, the 390 truck body and the bridge sky must be equal-RGB grey, the dress must stay red, and blown>230 inside the photo area must be about 0%, in line with the 1440 grid.

W5. Ring radius and spacing match. The refraction does not.
Measured: timescale 4, pointer (640, 510) on tile 1 (`clip03-ts4/tiles.json`). Outer ring 121 px at t=2.0 and 205 px at t=4.0. Radial peak spacing on `b-016.jpg` is 17–19 px. Origin is the pointer. The face stays readable. Side spill at t=4 is about 12 px, which a ~200 px radius gives on a 386 px tile. In `site/src/scripts/webgl/noirGrid.ts` the wiggle is `2.2 * scale` and the lens is `28 * scale` only for reach 0.42–0.92. Chromatic shift is 2.4 px. At t=2 (`build/b-008.jpg`, `review/build-tile-t2.jpg`) the grille slats stay straight and the hood letters only waver. Clip `clip/c-008.jpg` at the same t has bent the background into a liquid vortex. At t=4 the build is thin bands over a readable grille. Layout 16 and `clip/c-016.jpg` turn the surroundings into thick feathered rings with a clear red/cyan edge.
Target: clip 03 and layout 16. Concentric rings centred on the cursor, first ring just after enter, radius about 120 px at 2 s and about 200 px at 4 s at 1280, spacing about 18 px, a visible chromatic edge, subject at the centre still recognisable, spill past the tile edge. Not a bubble that starts at the tile edge and smears the whole photo.
Evidence: `qa/004b-work-exact/exact/driver-verify-004b-work-exact/clip03-ts4/pair-008.jpg`, `clip03-ts4/pair-016.jpg`, `clip03-ts4/build/b-008.jpg`, `clip03-ts4/build/b-016.jpg`, `clip03-ts4/clip/c-008.jpg`, `clip03-ts4/clip/c-016.jpg`, `review/build-tile-t2.jpg`, `review/build-tile-t4.jpg`, `review/clip-center-t2.jpg`, `review/clip-center-t4.jpg`, `review/side-layout16-vs-ts4-t4.jpg`, `concepts/site-layouts/16-motion-hover-distortion-v3.jpg`.
Fix: raise the in-ring displacement so straight edges inside the ripple bend the way the clip's columns and layout 16's background do at the same timestamp. Keep a stable centre around the pointer so the face stays recognisable. Keep spacing at about 18 px, and keep the radius curve that already measures ~120 px at t=2 and ~200 px at t=4 (do not grow the radius to fake a stronger look). Make the red/cyan fringe readable on the ring edges, on the order of the clip, and still slight enough that the photo reads. Origin stays the pointer, not the tile edge. Keep W6: B&W until the ripple has run, then colour from 1.0–1.6 s at normal speed. Re-check with `replay.mjs --clip clip03 --timescale 4` and open `pair-008.jpg` and `pair-016.jpg` before calling it done.

Commit: fix(004b-work-exact): exact-match round 1
