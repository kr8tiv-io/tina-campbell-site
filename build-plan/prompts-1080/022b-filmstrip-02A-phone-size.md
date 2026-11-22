---
id: 022b-filmstrip-02A-phone-size
title: 02A curved strip fills the phone viewport (desktop unchanged)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [022-scene-filmstrip-02A]
---
## Why
Prompt 022 built the curved 35mm film-gate strip on home section 2 and passed its automated checks. Its work is in the
working tree, NOT committed (HomeSheet.astro, env.d.ts, pages/index.astro, scripts/motion/core.ts,
scripts/webgl/curvedStrip.ts, styles/home.css, styles/seams.css, new scripts/motion/scenes/home-filmstrip.ts). Keep all of it
and build on top. Read `qa/022-scene-filmstrip-02A/REPORT.md` first.

Operator review (Matt) FAILED the phone view: on a phone the strip renders small in the middle of the screen with lots of
empty dark space above and below it. See `qa/022-scene-filmstrip-02A/shots/mobile-390x844-02A-mid.png` and the phone row of
`qa/022-scene-filmstrip-02A/side-by-side-02A.jpg`: the strip is a thin band, top ~45 percent of the screen is empty, the
amber pool fills the bottom third. Desktop looks close to the reference and must NOT change.

## Goal
On phones (< 760 px wide, test 390x844 and 400x860, DPR 2 and 3) the strip reads big, like the reference reads on desktop:
it bleeds off both screen edges, the centre frame is a large readable photo, and the section has no big dead bands.

## Must haves (measured in record mode `?record=1&gate=02A` AND in normal scroll mode at the pin's mid point)
Phone 390x844 and 400x860:
1. Strip bleed: the projected strip quad spans at least the full viewport width (left end x <= 0, right end x >= innerWidth).
2. Centre frame size: projected centre frame height >= 0.30 x innerHeight and width >= 0.52 x innerWidth.
3. Visible frames: 3 frames fully or mostly in view (centre plus neighbours), ends cropped by the screen edge (change the
   phone visible-frame count / camera distance / FOV / canvas size as needed; 022 used 5, that is the cause of "small").
4. Dead space: within the pinned viewport, the empty band above the strip top edge and the empty band below the labels
   are each <= 22 percent of innerHeight. Strip plus labels sit roughly centred (centre of strip between 38 and 58 percent
   of innerHeight). The amber pool stays under the strip, it must not be a separate glowing blob in empty space.
5. Labels: real HTML `.sheet__label` text stays readable (>= 12 px), below or on the strip, not overlapping each other,
   none clipped mid-word for the 3 visible frames.
6. All six 022 checks still pass on phone (curve, tilt -3 to -7, sprockets >= 4 per frame top and bottom, light >= 1.15x,
   scrub 0..6 with snap, ghost on fast scroll only). Add the new phone checks 1 to 5 to `checks.json` under
   `phone` and `phone400` with numbers and pass flags; `pass` at the top only if every check passes.
Desktop 1440x810 and 1440x900:
7. Unchanged. BEFORE editing anything, capture record-mode desktop frames at progress 0, 0.2, 0.35, 0.5, 0.75, 1.0 into
   `qa/022b-filmstrip-02A-phone-size/desktop-before/`; after your change capture the same into `desktop-after/`; mean
   absolute pixel diff per frame < 1 percent (write the numbers). Desktop checks.json values within 2 percent of 022's.
   Breakpoint changes must be scoped by a media query / width branch below 760 px only. /runway/ unchanged (pixel diff < 1%).
8. Scroll scrub forward AND reverse on phone (scripted touch/wheel down then up through the pin: centre index 0..6 then
   6..0), snap lands on whole frames, no horizontal page overflow (scrollWidth == innerWidth) at 390 and 400.
9. Reduced motion and no-WebGL on phone: the CSS stand-in also fills the width (3 frames visible, centre frame >= 0.52 x
   innerWidth), static, no pin; no horizontal overflow. No JS: plain linked row still works.
10. Pin length on phone stays `+=110%` unless a shorter dead band needs less; JS budget: own added JS < 3 KB gzip.

## Gate (paste results into `qa/022b-filmstrip-02A-phone-size/REPORT.md`)
- `_CONTEXT.md` gates with `--scenes 01A,03B` (regression), seams 10/10, route tables 3/3, route visual 3/3 desktop and 3/3
  mobile, production Playwright 42+ passed 0 failed (extend the home spec with one phone test asserting checks 1, 2 and 8 at
  390x844 if it fits the suite style).
- `checks.json` (rewrite `qa/022b-filmstrip-02A-phone-size/checks.json`, all pass).
- On-page side-by-side sheet: `bash build-plan/gap-audit-2026-11-20/tools/ref-frames.sh /tmp/ga/ref`, then
  `node build-plan/gap-audit-2026-11-20/tools/capture-pages.mjs` against the preview (copy into site/ as in the audit,
  ONLY=02A) to `qa/022b-filmstrip-02A-phone-size/cap`, then `STG=qa/022b-filmstrip-02A-phone-size/cap LABEL="022b preview"
  SHEET_OUT=qa/022b-filmstrip-02A-phone-size python3 build-plan/gap-audit-2026-11-20/tools/sheet.py 02A`. Also make
  `side-by-side-02A.jpg` (reference frames 0, 24, 30, 60, 96, 144 next to record progress 0, 0.2, 0.35, 0.5, 0.75, 1.0) with
  THREE rows: desktop 1440, phone 390, phone 400. Describe honestly per row what still differs.
- Screenshots `shots/`: phone 390x844 and 400x860 (DPR 3) at pin start / mid / end, one reduced-motion phone shot, desktop
  1440x900 mid. Keep screenshots as JPEG q70 where possible; do NOT keep .webm videos or raw frame folders in qa (delete the
  ones you generate once numbers are written; disk is tight).

## Non-goals
No change to photos, labels' wording, desktop look, 01A, 03B, seams, /runway/. No new dependencies.

## Files
site/src/scripts/webgl/curvedStrip.ts (phone options only), site/src/scripts/motion/scenes/home-filmstrip.ts,
site/src/components/HomeSheet.astro, site/src/styles/home.css, site/tests (one phone test).

## Commit message
feat(scene-02A): curved film strip fills the phone viewport; desktop unchanged
