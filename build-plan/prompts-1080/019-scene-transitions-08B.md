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

## Added 20 Nov 2026 (gap audit): on-page gate
Gate mode alone is not enough (04B passed at 0.95 yet reads tiny on the page). Also run
`build-plan/gap-audit-2026-11-20/tools/capture-pages.mjs` against the preview for your scenes (copy into site/, ONLY=<IDs>)
and `tools/sheet.py <IDs>` with `STG=qa/<prompt-id>/cap SHEET_OUT=qa/<prompt-id> LABEL="<prompt-id> preview"`. The scene must
read at the size and place it has on the page: full-bleed where the clip is full-bleed. Write per column what still differs.
Photos: follow `build-plan/gap-audit-2026-11-20/PHOTO-PLAN.md` (no repeats on a page).
