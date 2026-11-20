---
id: 019-scene-transitions-08B
title: Page transitions 08B ink flood (code)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [018-scene-portraits-11B]
---
## Goal
Route-change layer in `site/src/scripts/motion/pages.ts`: black ink plume mask (`motion-reference/12-seam-transitions/_shared/masks/ink-plume.svg`, copied
into site/public) rises yPercent 100 to 0 in 0.6 s power2.inOut, holds, then a radial thin reveals the next page cover;
about 1.2 s wall time (the clip is a 6 s preview: match shape and order, not duration). Back/forward, keyboard and
reduced motion (instant swap) must work; no layout shift; focus moves to the new h1.
## Verification
Timeline exported as `window.__SCENE_TL__['08B']`; order check (rise, hold, radial reveal) + side-by-sides at 4 points vs
the clip; all seven scene gates and seams 10/10 still PASS.
## Commit message
feat(scene-08B): ink flood page transition
