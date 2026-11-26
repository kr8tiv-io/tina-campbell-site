---
id: 025-work-04B-05C-on-page
title: Work page, make 04B ink drop and 05C light table read like the clips on the real page
kind: build
effort: xhigh
model: grok-4.7
depends_on: [024-photo-library-spread]
---
## Why
Gap audit ranks 3 and 4 (`build-plan/gap-audit-2026-11-20/sheet-04B.jpg`, `sheet-05C.jpg`). 04B passed scene_gate (0.95)
because gate mode floats the video to 1280x720, but on the page it plays inside one small tile in a full-colour grid; the
bloom barely reads, and on phone a tap opens the series page instead. 05C opens with ~2 s of logo splash, then tiles appear
already tilted; there is no fall, no table, no light, no B&W, and the phone gets only a fade.

## 04B
- The feature tile is large: desktop at least 38vw wide in the first screen, centred like the clip's middle print, with two
  B&W neighbours either side (CSS `filter: grayscale(1) contrast(1.05)` on the grid while 04B plays, eased back to colour
  0.4 s after it ends or on leave). The ink video plays over the tile at the tile's own crop.
- Phone: first tap plays the ink (once, at the tile's size) and shows a "View series" button; a second tap or the button
  navigates. Still plays once at 60 percent in view as in 015.
- Keep the `?record=1&gate=04B` hook; fix the 016b regression so the 04B scene_gate is back at >= 0.95 (it read 0.9256).

## 05C
- Skip the logo splash on /work/ when arriving from another page of the site (keep it only for a cold first visit and at
  most 0.8 s).
- The table: warm lamp pool (radial gradient #3A2A1E to #0C0C0F), fine paper grain, prints with white borders and real
  drop shadows that tighten as they land (timing table in 015 stays). Prints are B&W during the fall and warm to colour in
  the last 0.6 s.
- Phone: the same fall in a 2-column layout, fewer prints (8), same timing compressed to 4 s.

## Gate
015's 05C timing check (within 2 frames). `_CONTEXT.md` gates `--scenes 01A,03B,04B` (04B >= 0.95), seams 10/10, routes 3/3
plus 3/3, Playwright 42+ pass. ON-PAGE side by side: run the audit capture tool against the preview (ONLY=04B,05C) and
`tools/sheet.py 04B 05C` into `qa/025-work-04B-05C-on-page/`; the ink must be visible as a large red bloom by the 2.4 s
column, and the 05C columns must show prints in the air at 1.2 s. Say honestly where it still differs.

## Commit message
fix(scene-04B-05C): ink drop at full size on a mono grid, real light-table fall, phone versions

## Operator note (26 Nov, before launch)
Branch is now at 991b24e (030 phone labels). 04B scene_gate already reads 0.9531 on this tree (operator gate 26 Nov), so the
016b regression note above is historical: keep it >= 0.95. The home film strip, hero and 02A-03B hand-off are out of scope;
`laptop.spec.ts` and `phone-toolbar.spec.ts` must keep passing. Run Playwright with `PLAYWRIGHT_PORT=4831` (port 4321 belongs
to another project). Text stays real HTML, Noir and Crimson tokens only.
