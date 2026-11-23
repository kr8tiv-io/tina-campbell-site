---
id: 027-home-post-strip-refresh
title: Home, stop the 02A-03B seam firing early after the film-strip scrub spacer mounts
kind: fix
effort: xhigh
model: grok-4.7
depends_on: [strip-fix-39309c1, blur-01A-eec709e]
---
## Why
Matt: "after the film strip on tinas site on main, it flashes and then disappears." Operator diagnosis (probe frames and
JSON in `/workspace/tina-review-2026-11-22/post-strip-flash/before/`):
- `home-filmstrip.ts` `mountGl()` inserts `.sheet-scrub` (150vh desktop, 110vh phone) after `[data-seam-pair="01A-02A"]`
  lazily (requestIdleCallback / setTimeout / scroll), usually AFTER the `load` refresh in `home.ts`, and only calls
  `ScrollTrigger.create()` for itself. Nothing refreshes the triggers below it.
- So the 02A-03B seam pin (`seams.ts` `pinTl`, start 'top top') and everything under it keep positions measured without
  the spacer: stale by exactly the spacer height (1350 px at 1440x900, ~928 px at 390x844; scrollHeight 7697 vs 9047 after a
  refresh).
- Result: the 02A-03B stage pins and its timeline starts fading the echo sheet while the live strip is still held fixed
  on top (`is-sheet-hold`). When the hold releases, the echo strip appears at ~25% opacity mid-fade and vanishes (the
  flash). Later the seam's `maybeOpen()` refresh makes the runway jump ~1200 px down and scroll back up (second pop).
- Proven: firing one `resize` (ScrollTrigger refresh) after the spacer mounts removes both, and the sequence matches the
  approved seam: hold releases, echo strip scrolls in at full opacity, then flood and runway, no jump.
- Pre-existing since c0fcb25 (spacer introduced), timing dependent; not caused by 39309c1.

## Change (small, one place)
- In `site/src/scripts/motion/scenes/home-filmstrip.ts`, right after the scrub `ScrollTrigger.create(...)` (and only when
  the spacer was actually inserted), recompute every trigger: `ScrollTrigger.sort(); ScrollTrigger.refresh();` (sort first
  so the spacer trigger is ordered by its page position before the downstream pins). If the user is already scrolled when
  it mounts, keep their place (refresh is fine; do not scrollTo).
- Also give the scrub trigger a `refreshPriority` higher than the downstream seam pins if needed so a later refresh
  always measures it first. Do not change start/end/scrub/snap values, the 150vh/110vh heights, the hold CSS, the seam
  timelines, any motion values or composition. No other files except the new test and qa output.
- Do not touch `seams.ts` unless the test proves it is required; if so, keep it to the minimum and say why.

## New regression test
Add `site/tests/post-strip.spec.ts` (production build preview, Chromium, project defaults). For 1440x900 and 390x844
(isMobile, hasTouch, DPR 2):
1. Load `/`, wait for `load`, then wait until `[data-sheet-scrub]` exists plus 1200 ms (the real lazy mount timing; do not
   force a refresh or resize in the test).
2. Stale-layout check: read `document.documentElement.scrollHeight`, dispatch `resize`, wait 600 ms, read again: equal
   within 4 px.
3. Forward: scroll from 0 to the top of `.runway--strip` in steps (desktop `mouse.wheel` 120 px, phone
   `window.__tcMotion?.scrollTo(y)` fallback `scrollTo`, 90 px), 200 ms settle per step. At each sample assert:
   (a) never `html.is-sheet-hold` while `[data-seam-pair="02A-03B"] [data-stage]` is `position: fixed`;
   (b) on the first sample after `is-sheet-hold` turns off, `.sheet--echo` computed opacity >= 0.98;
   (c) once `.runway--stage` opacity reaches 1, its rect top never jumps by more than the step + 40 px between samples
       (no seam-open jump).
4. Reverse: from there scroll back to 0 with the same steps; assert (a) and (c) mirrored, and that the live sheet is
   visible (opacity >= 0.98) whenever `is-sheet-hold` is on.
The test must FAIL on the current code (run it once before the fix and paste the failure line into the report) and PASS
after.

## Gate
`_CONTEXT.md` gates with `--scenes 01A,03B,04B` (keep the previous worst SSIM: 01A >= 0.97, 03B >= 0.96, 04B >= 0.95),
seams 10/10, routes 3/3 plus visual 3/3 desktop and mobile, Playwright 44+ passed 0 failed including the new spec. Report
in `qa/027-home-post-strip-refresh/REPORT.md`. Keep qa light: scores.json and tables only, no frame folders.

## Commit message
fix(home): refresh scroll triggers after the 02A scrub spacer mounts so 02A-03B no longer fires early
