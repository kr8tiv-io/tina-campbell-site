---
id: 022-scene-filmstrip-02A
title: Home 02A film gate advance as a curved (barrel) 35mm strip, scroll scrubbed
kind: build
effort: xhigh
model: grok-4.7
depends_on: [016b-scene-gate-06B-ready]
---
## Why
Gap audit (`build-plan/gap-audit-2026-11-20/GAP-LIST.md`, rank 1): home section 2 is still the old flat contact-sheet row
(`site/src/components/HomeSheet.astro`, `ul.sheet__row`). No film base, sprockets, tilt, curve, light or motion. Matt: "the
interactive film strip ... is supposed to almost have a fisheye kind of perspective that scrolls along". Look at
`gap-audit-2026-11-20/sheet-02A.jpg`, `02A-reference-12-frames.jpg`, `02A-reference-events.jpg` and the full clip
`concepts/motion-options-2026-11-12/02-home-filmstrip/A-film-gate-advance/clip.mp4` before writing code.

A barrel strip already exists: `site/src/scripts/webgl/curvedStrip.ts` (three.js, used by /runway/ catwalk; see
`gap-audit-2026-11-20/runway-curved-strip-staging.jpg`). REUSE it: add options (tilt, light-table look, gate ghost, frame
count, no dark run) through `mountCurvedStrip(canvas, frames, opts)`; do not copy it into a second file. /runway/ must look
exactly as before (screenshot before and after, pixel diff < 1 percent).

## What the clip shows (match it)
- One 35mm strip of 7 colour frames on a near-black ink-splotched light table (CSS radial gradients plus a small tiled noise,
  no image with text). Strip turned about -7 deg (rising to the right) and seen in perspective: left end nearer and larger.
- Black film base, rectangular sprocket holes top and bottom (shader, as /runway/), thin frame lines between frames.
- Warm amber backlight (#E8A050 to #8A4A10) leaking under the strip and pooling on the table; centre frame brightest
  (brightness 1.1, scale 1.06 to 1.12), neighbours dim to 0.75, ends fall into shadow.
- Gate advance: a quick ghost/double image along x (shader, 2 to 4 samples, capped 3 px equivalent) only while moving,
  then snaps into register (snap to frames, 0.35 s power3.out). A short light flicker as a frame crosses the gate.
- Idle breathing: amber pool pulses slowly; one dim-and-return flicker cycle every ~6 s (the clip's 2.5 to 4 s dip).
Matt's extra: the strip is bent as a barrel / fisheye: frame height and width fall off toward the screen edges
(`barrelScale`, `widthScale`), the top edge bows up and the bottom edge bows down at the centre. Keep the -7 deg tilt on top.

## Interaction and timing
- Section pinned (ScrollTrigger, end `+=150%` desktop, `+=110%` phone), scrub 0.6, progress moves the strip one frame per
  1/6 of the pin (7 frames, centre runs frame 0 to 6), snap 1/6. Velocity from Lenis feeds the ghost.
- Frames are links to `/work/?filter=<category>` as now; keep `.sheet__label` HTML labels (category + No.) positioned over
  the projected frame centres, real text, never drawn into the texture. Keyboard: Tab moves frame to frame (focus scrolls the
  pin to that frame), visible focus ring.
- Seams: keep the `data-seam-pair="01A-02A"` and `"02A-03B"` structure, `data-seam-in/out`, `data-seam-media` and the echo
  sheet so seam_gate stays 10/10 and seam_route_visual 3/3 desktop and mobile. If the seam needs the old row as the hand-off
  image, render the canvas into the seam's media slot, do not delete the seam.
- Phone (< 760 px): same WebGL curve with fewer segments, 5 visible frames, tilt -5 deg, pin `+=110%`, labels below the strip.
- No WebGL or `prefers-reduced-motion`: CSS 3D stand-in (perspective 900px, per-frame scale from `frameLook()`, sprocket CSS
  mask, amber glow gradient), static at the centre frame, no pin, no scrub. No JS: the plain row of linked photos with labels.
- three.js: import the SAME lazy chunk /runway/ uses, start it after the hero is painted (idle callback or when the section
  is within 1.5 viewports). Home LCP must stay the hero poster. Own new JS < 15 KB gzip (three excluded, it is shared).

## Photos (from `build-plan/gap-audit-2026-11-20/PHOTO-PLAN.md`)
Order: fb_046_signature, fb_064_runway, fb_048_portrait, fb_059_bridal, fb_031_couples, fb_001_city, fb_000_landscape.
Before using each, crop the four corners and the bottom band at 3x and confirm no script mark or text; if one fails, use the
next clean photo of the same category from PHOTO-PLAN and write it in the REPORT. Update the `categories` data in
`site/src/pages/index.astro` accordingly (labels: Signature, Runway, Portraits, Bridal, Couples, Edmonton, Landscape).

## Record mode and gate (this is the acceptance, not just timing)
- `?record=1&gate=02A`: Lenis off, no pin animation; expose `window.__SCENE_TL__['02A'] = { setProgress(p), frames() }`
  where `frames()` returns each frame's projected screen quad, brightness and scale; set `__SCENE_READY__['02A']` after
  textures load.
- Write `qa/022-scene-filmstrip-02A/checks.json` and PASS only if ALL hold at desktop 1440x810 and phone 390x844:
  1. curve: at progress 0.5 the strip's top edge at the centre frame is at least 4 percent of the strip height higher than at
     the end frames, and end-frame height is 0.55 to 0.75 of the centre frame height;
  2. tilt: the line through frame centres is -5 to -9 deg desktop, -3 to -7 phone;
  3. sprockets: at least 4 holes per frame visible top and bottom (sample luminance along both bands);
  4. light: centre frame mean luminance >= 1.15x its neighbours; table below the strip has a warm hue (20 to 45 deg) and
     is brighter than the table above;
  5. scrub: the centre frame index goes 0,1,2,...,6 across progress 0..1 and lands on whole frames after snap;
  6. ghost: during a fast scroll (scripted wheel) a capture shows the ghost; at rest none.
- Side-by-side sheet, the real gate: first `bash build-plan/gap-audit-2026-11-20/tools/ref-frames.sh /tmp/ga/ref`, then run `node build-plan/gap-audit-2026-11-20/tools/capture-pages.mjs` against the preview
  (copy into site/ as in the audit, ONLY=02A) and `python3 build-plan/gap-audit-2026-11-20/tools/sheet.py 02A` with
  `STG=qa/022-scene-filmstrip-02A/cap LABEL="022 preview" SHEET_OUT=qa/022-scene-filmstrip-02A`. Also make
  `qa/022-.../side-by-side-02A.jpg`: reference frames 0, 24, 30, 60, 96, 144 next to your record-mode frames at progress
  0, 0.2, 0.35, 0.5, 0.75, 1.0, desktop and phone. Describe, per pair, what still differs. The operator decides PASS on
  this sheet; you must say honestly where it does not match.
- Usual `_CONTEXT.md` gates with `--scenes 01A,03B` (regression), seams 10/10, routes 3/3 plus 3/3, Playwright 42+ pass.
  Update the two home tests that read `.sheet__label` only if the label markup moves; keep the h1 rule.

## Files
site/src/components/HomeSheet.astro, site/src/pages/index.astro (categories), site/src/scripts/webgl/curvedStrip.ts
(options only), site/src/scripts/motion/scenes/home-filmstrip.ts (new, registered from core.ts), home.ts, seams.ts only if
the hand-off needs it, home CSS.

## Commit message
feat(scene-02A): curved film-gate strip on home, scroll scrubbed, sprockets and amber gate light
