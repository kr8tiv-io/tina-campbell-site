---
id: 030-phone-strip-labels-toolbar
title: Phone (iPhone 16 / Chrome iOS) - film-strip labels sit clear of the browser bottom toolbar; laptop composition unchanged
kind: fix
effort: xhigh
model: grok-4.7
depends_on: [029-laptop-text-hero-strip]
---
## Why
Matt, on his iPhone 16 in Chrome (23 Nov, after b35fe3f went to staging): the home 02A film-strip labels
("Signature No. 01", "Runway No. 02" ...) sit at the bottom of the screen, almost invisible under Chrome's bottom toolbar.

Operator diagnosis (b35fe3f, local preview, 390x844 and 393x852 DPR 3, isMobile):
1. While the strip is held, `html.is-sheet-hold .sheet[data-sheet='live']` (and `is-gate-02A`) is `position: fixed; inset: 0;
   height: 100vh !important` (site/src/styles/home.css ~line 1400). Seam stages use `height: 100vh` too (seams.css 15, 263).
   On iOS (Safari and Chrome) `100vh` is the LARGE viewport (toolbars hidden), so the bottom of the held sheet is under the
   browser's bottom toolbar while it is showing. Chromium desktop emulation never shows this because vh == innerHeight.
2. The phone layout (`PHONE` in site/src/scripts/motion/scenes/home-filmstrip.ts, labels "below the strip") puts the live labels
   at y = 648..683 of 844 (bottom edge ~19% from the bottom of the layout viewport). Chrome iOS's bottom toolbar plus home
   indicator is translucent and covers roughly the bottom 120 px; with the lvh height above the labels land under or at it.
3. Labels are small (12 px name / 10 px number) with a soft shadow on bright photos, so partial cover makes them unreadable.

## Change (phone, < 760 px wide, only)
- Held strip and any phone 02A layout use the SMALL viewport: `height: 100vh; height: 100svh` (keep vh as fallback) for the
  held live sheet on phones, and the curved strip canvas / label placement measures that box (`canvas.clientHeight` or
  `visualViewport.height`), not `window.innerHeight`, wherever they differ. Desktop/laptop keep exactly today's values.
- Move the phone labels up so they read in the clear: label boxes fully inside the band 0.18..0.70 of the visible height,
  and at least 140 CSS px above the bottom of the visible viewport. Keep them tied to their frames (centred under or over
  each frame as now, same "Name / No. 0X" HTML, same JetBrains Mono / Inter Tight families). Size: name >= 13 px, number >= 11 px,
  snapped to whole device pixels, with a legibility plate or stronger shadow so contrast against the photo is >= 4.5:1.
- Echo strip labels on phone: positioned the same way (distinct x, no stacking at the left), or hidden if the live labels are
  the visible ones at the swap.
- Book bar or any other fixed bottom UI must not cover the labels while the strip is held.
- Add `viewport-fit=cover` ONLY if you also pad with `env(safe-area-inset-bottom)`; otherwise leave the viewport meta alone.
- Do NOT change: panel count, `PHONE.visible`, segments, tilt, curve, scrub start/end/snap, spacer heights, seam timelines,
  the 029 hold-to-echo + flood wipe, the hero, any motion value from MOTION-LOCKED.md, any desktop/laptop geometry.

## Question to answer in the REPORT (do not change anything for it)
Matt asked whether "mobile only scrolls three panels" is intentional. Operator measurement: on phone ~1.8 frames are visible at
once (022b gate: "3 frames fully or mostly in view") and the scrub still advances through all 7 categories (Signature to
Landscape) between scrollY ~1900 and ~2740 at 390x844, after ~1.4 screens of static lead on Signature/Runway. Re-measure after
your change and write the table (scrollY -> centred category) so the operator can answer Matt. Panel count stays as is.

## Verification (PASS or FAIL only; any FAIL blocks)
BEFORE editing, capture baselines from the current build into `qa/030-phone-strip-labels-toolbar/before/`:
desktop 1536x720 DPR 1.25 and 1920x1080 DPR 1 at 02A progress 0, 0.5, 1.0 and at the 02A-03B hand-off (pin 0.3), plus
390x844 DPR 3 at the same points.
1. New `site/tests/phone-toolbar.spec.ts` (fails on b35fe3f, passes after):
   a. iPhone 16 393x852 DPR 3 isMobile hasTouch, with a simulated Chrome iOS toolbar: inject a fixed bottom overlay
      `<div id="sim-toolbar">` 393x120 px, rgba(30,30,30,0.85). At 02A progress 0, 0.25, 0.5, 0.75, 1.0 every visible live label
      box has bottom <= innerHeight - 140 and does not intersect #sim-toolbar; label top >= 0.18 * innerHeight.
   b. 393x659 DPR 3 (Chrome iOS visible area with both bars): same points, labels fully inside, >= 24 px above the bottom.
   c. 390x844 DPR 3: same as (a) without the overlay.
   d. Static check: the phone held-sheet rule resolves to svh (assert computed height of the held sheet == the svh box,
      e.g. compare to a probe element with height:100svh) and no phone label uses window.innerHeight for its y when a
      smaller visual viewport is reported (stub `visualViewport.height = innerHeight - 190` and assert labels move up).
   e. Echo labels at 390: distinct x positions, none stacked.
2. Laptop unchanged: 1536x720 @1.25 and 1920x1080 frames vs `before/` absolute pixel diff < 1 percent per frame (write numbers);
   `laptop.spec.ts`, `post-strip.spec.ts`, `home-lock.spec.ts` pass unchanged.
3. All shared gates from _CONTEXT.md: check, lab build, scene_gate 01A,03B,04B,
   seam_gate 10/10, seam_route_check 3/3, seam_route_visual 3/3 desktop and --mobile, production build + full playwright 0 failed.
4. Screenshots `qa/030-phone-strip-labels-toolbar/shots/` (JPEG q75): iPhone 16 with the simulated toolbar at 02A progress
   0.25 and 0.75, 393x659, 390x844 mid, 1536x720@1.25 mid, 1920x1080 mid, one reduced-motion phone shot.
Report in `qa/030-phone-strip-labels-toolbar/REPORT.md` with the before/after label y table; keep qa light (no frame folders,
no webm).

## Commit message
fix(home): phone film-strip labels clear of the iOS browser toolbar (svh hold, labels lifted, legible plate); laptop unchanged
