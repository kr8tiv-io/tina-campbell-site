# 029 laptop text, hero, strip

Laptop viewports (1536x720 at DPR 1.25 and the neighbouring sizes): strip labels readable, hero head clear of the header, live strip held until the echo pins, crimson flood wipes the strip into the runway.

## Verdict

Gates PASS. Laptop regression tests PASS after the two follow-up fixes below. Production build is 20 pages (no motion-lab routes). Font preload hrefs match the built CSS.

Playwright confirmation run: 70 passed, 114 skipped, 0 failed (17.9m).

## Changes

- `site/src/scripts/motion/scenes/home-filmstrip.ts`: one `syncHold()` plus a bridge ScrollTrigger from the scrub spacer's bottom to the 02A-03B track's top. The live strip stays on its last frame until the stage pins, then drops in the same frame. `placeLabels()` snaps link and label boxes to device pixels (two passes, device-pixel error threshold 0.01) and mirrors that geometry onto `[data-sheet="echo"]`. Labels stay `visibility: hidden` until a real quad exists.
- `site/src/styles/home.css`: GL labels are 13px / 11px, line-height 1.35, with an ink chip `rgba(12,12,15,0.66)`. Phone row keeps its layout and gets line-height 1.35. Hero cover is anchored with `object-position` so the head clears `--header-h`. `html.is-scene-gate` keeps `50% 50%`. Caption and scroll cue are `max(0.75rem, 12px)`.
- `site/src/layouts/BaseLayout.astro`: preload JetBrains Mono 400, Inter Tight 400, and Instrument Serif 400 latin woff2 from the same `?url` imports the CSS uses.
- `site/src/scripts/motion/seams.ts`: real `[data-seam-pair="02A-03B"]` only. The harness timeline is unchanged. The echo is clipped to the flood's leading edge over 0..0.55 (`power2.in`, drift compensated) and set to `autoAlpha: 0` at 0.55. While the wash thins (0.55..1.05) the flood holds `brightness(1.06)` so a 16:9 frame stays above the luma floor.
- `docs/design-system/MOTION-LOCKED.md`: page hand-off note under 02A-03B.
- `site/tests/laptop.spec.ts`: new. Existing Playwright projects are unchanged. Cases skip unless `project.name === 'desktop'`.

Hold uses scroll position, not a literal `isActive` OR. At the last snapped frame both triggers report inactive, and an `isActive`-only check dropped the strip for one black frame. The hold is on for `scroll >= bridge.start - 1` and `scroll < bridge.end`, so the pin's first active pixel has the hold off and the echo at full opacity. `post-strip.spec.ts` still passes.

## Before (pre-change dist)

Strip and hand-off tests failed. First failure line per viewport, from `/tmp/laptop-before.txt`:

| Viewport | First failure |
|---|---|
| 1536x720 | hold off over the black spacer at y=2707 |
| 1536x720 hand-off | bright fraction 0.275 at pin progress 0.18 |
| 1536x690 | hold off over the black spacer at y=2706 |
| 1520x634 | hold off over the black spacer at y=2386 |
| 1366x657 | hold off over the black spacer at y=2585 |
| 1440x760 | hold off over the black spacer at y=2983 |
| 1920x1080 | hold off over the black spacer at y=4184 |
| 1920x1080 hand-off | bright fraction 0.292 at pin progress 0.16 |
| 390x844 | hold off over the black spacer at y=2814 |
| 390x844 hand-off | bright fraction 0.185 at pin progress 0.18 |

10 failed. Shots: `shots/before-*`. Exit frame 4 is a black field with the echo labels piled at the lower left.

## After

First fixed production dist (`/tmp/laptop-after.txt`): 22 passed, 88 skipped, 2 failed (9.8m).

1. 1920x1080 hand-off: bright fraction 0.294 at pin progress 0.50. Pin progress 0.50 is timeline time 0.60, where the flood's cine fade is already at opacity 0.599 over the dark followspot. Fix, page only: `flood.style.filter = brightness(1.06)` while time is in [0.55, 1.05).
2. 390x844 labels: left 158.65625, device-pixel error 0.03125. `snapLabel` was bailing out at 0.01 CSS px, which is 0.03 device px at DPR 3. Fix: two passes, return only when the device-pixel error is at most 0.01.

Retest of fonts and hand-off on that dist (`/tmp/laptop-fix.txt`): 10 passed, 46 skipped, exit 0 (2.7m). Strip walks had already passed on the previous dist; hold logic did not change after that.

Full suite (production preview on 127.0.0.1:4321, same client hashes as the gated motion-lab build): see Playwright below. `post-strip.spec.ts` passed on every project.

## Hero framing pixel diff

JPEG q=80, a pixel counts as changed when any channel moves by more than 8. Best alignment is a SAD search on the photo region.

| Viewport | Full frame changed | Below header | Best shift | Reading |
|---|---|---|---|---|
| 1920x1080 | 10.674% | 12.046% | 0, 0 | Crop unchanged. The leftover is two different frames of the playing hero film. Object-position Y resolves to about 0. |
| 390x844 | 3.455% | 3.786% | 0, 0 | Crop unchanged. X stays 68%. Leftover is film motion. |
| 1536x720 | 41.396% | 47.041% | about 60 device px down | Expected. The head was under the header before and sits clear of it after. |

Shots: `before-1920x1080-hero.jpg`, `after-1920x1080-hero.jpg`, `before-390x844-hero.jpg`, `after-390x844-hero.jpg`, `before-1536x720-hero.jpg`, `after-1536x720-hero.jpg`. Reduced motion still: `after-1536x720-reduced.jpg` (end frame, head clear, no video).

## Fonts

Built `dist/index.html` preloads, equal to the `url(...)` in `dist/_astro/*.css`. No second copy of those files.

- `/_astro/jetbrains-mono-latin-400-normal.V6pRDFza.woff2`
- `/_astro/inter-tight-latin-400-normal.iW8qmuJY.woff2`
- `/_astro/instrument-serif-latin-400-normal.DnYpCC2O.woff2`

## JS budget

Client chunks are unchanged in hash from the motion-lab gate build: `seams.C_ejqJBy.js` 185.02 kB (gzip 69.45 kB), `BaseLayout...EEAn2oKn.js` gzip 24.43 kB, `curvedStrip.vkU-y3eJ.js` gzip 5.51 kB. The page-only flood lift and the label snap live in the existing seams and filmstrip chunks, on the order of tens of bytes gzip, under the 15 kB budget.

## Gates

`npm run check` clean. `TC_MOTION_LAB=1` build, preview on 127.0.0.1:4821.

Scene gate (`scene-gate/REPORT.md`):

| Scene | Verdict | Mean SSIM | Worst SSIM | Worst frame | Bad /145 |
|---|---|---|---|---|---|
| 01A | PASS | 0.9794 | 0.9774 | 95 | 0 |
| 03B | PASS | 0.9693 | 0.9613 | 83 | 0 |
| 04B | PASS | 0.9597 | 0.9531 | 1 | 0 |

Seam gate 10/10, every seam worst SSIM 1.0000, timing diffs 0, bad frames 0 (`seam-gate/REPORT.md`).

Route check 3/3, tween diffs 0: 01A-02A on `/?record=1`, 02A-03B on `/?record=1`, 04B-05C on `/work/?record=1`.

Route visual desktop (`route-visual/REPORT.md`): 01A-02A dark 0.27 vs gold 0.27, 02A-03B 0.04 vs 0.04, 04B-05C 0.04 vs 0.12. PASS.

Route visual mobile (`route-visual-mobile/REPORT.md`): 01A-02A 0.48 vs 0.50, 02A-03B 0.75 vs 0.79, 04B-05C 0.23 vs 0.19. PASS.

Frame folders under `scene-gate/` and `seam-gate/` were removed after the scores and tables were saved. Contact sheets remain next to the route reports.

## Shots

`qa/029-laptop-text-hero-strip/shots/`

- Before and after, 1536x720 DPR 1.25: hero, strip mid, exit 01-08, hand-off 00-11, reduced (after).
- Before and after, 1920x1080: hero and hand-off 00-11.
- Before and after, 390x844: hero.

After exit frames keep the live strip on screen across the old black gap. After hand-off frames show the flood covering the strip from the bottom, then the crimson field, with no bare ink frame in between. Before hand-off frame 4 shows the piled echo labels and a thin red band.

## Playwright

First full `npx playwright test` against the production preview: 69 passed, 114 skipped, 1 failed (20.2m). Failed test: `[mobile] editorial.spec.ts portraits bridal couples`, expected substring "Staircases, glass and great light." The chapter copy starts hidden (`gsap.from` autoAlpha) until its ScrollTrigger plays. Desktop, small, and reduced passed in that same run. Retry of that test alone: 1 passed (2.9s). Laptop cases and `post-strip.spec.ts` passed on every project.

Confirmation run, same command, no source change: 70 passed, 114 skipped, 0 failed (17.9m). `EXIT:0`.

## Commit message (not committed)

```
fix(home): laptop 1536x720 @1.25 - legible strip labels, hero head clear of the header, strip held until the echo pins, flood wipes the strip into the runway
```
