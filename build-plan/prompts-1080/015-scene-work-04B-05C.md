---
id: 015-scene-work-04B-05C
title: Work page, 04B crimson ink hover video and 05C light-table entrance (code)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [014-scene-runway-03B]
---
## Goal
`/work/`: (a) 04B crimson-ink-drop: on hover or keyboard focus of the feature tile the 04B video plays from 0 over the still
(ink lands, blooms into the gown over ~4 s, photo warms); leave reverses to 0 over 0.4 s; touch plays once at 60% in view.
(b) 05C light-table-drop (CODE): prints fall onto a dark glowing table and settle into the grid, then a crimson loupe ring.

## Timing tables
04B: 0-0.6 s still; 0.6-1.2 drop lands centre tile; 1.2-5.0 bloom spreads to the gown shape; 5.0-6.04 hold.
05C: 0-0.5 s empty table glow; 0.5-2.0 prints fall fastest (y -120vh, rotate +-18, scale 1.1, shadow 0 60px 80px);
2.0-5.5 settle flat into slots, shadows tighten (ease cine, stagger 0.08); 5.2-5.8 loupe ring (crimson, stroke 6) scales in.

## Must haves
- 04B via `scene-video.ts` mode play, `data-scene-video="04B"`; the gate captures it in gate mode with the tile at its
  rendered size (object-fit cover crop).
- 05C in GSAP on Tina's real Work thumbnails, on the same core; expose its timeline as `window.__SCENE_TL__['05C']` in record
  mode. Gate: timing table above within 2 frames (write the check into `qa/015.../REPORT.md` from the exported timeline)
  plus side-by-side frames at 0.5, 1.0, 2.0, 3.5, 5.5, 6.0 s against the clip (visual, saved as JPG).
- Seam 04B-05C still PASS.
## Files
site/src/pages/work/index.astro, site/src/scripts/motion/work.ts, scenes/work-ink.ts, scenes/work-lighttable.ts, work css.
## Verification
`_CONTEXT.md` gates `--scenes 01A,03B,04B`; seam gate 10/10; screenshots incl. keyboard focus state.
## Commit message
feat(scene-04B-05C): work hover ink video and light-table entrance
