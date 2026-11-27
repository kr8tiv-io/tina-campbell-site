# 031 phone film strip even pace

Phone only (under 760 px). The pinned 02A scrub is longer, and the six steps from Signature to Landscape share it. Desktop and laptop scrub length, snap, and geometry are unchanged.

## Change

- `site/src/styles/home.css`, inside `@media (max-width: 759px)`: `.sheet-scrub` is `250vh` then `250svh`. Desktop stays `150vh`. Reduced motion still sets `.sheet-scrub { display: none }`.
- `site/src/scripts/motion/scenes/home-filmstrip.ts`, phone only: the scrub trigger runs from the spacer's top at the bottom of the viewport until the 02A-03B `[data-track]` is `top 20%`. With the 250svh spacer that span is 330svh, about 0.55 screens per step. The bridge that holds the sheet until the echo pins is the same trigger as before.
- Phone snap stays `duration: 0.35` and `power3.out`, and adds `directional: false` plus `delay: 0.7`. The longer scrub leaves the echo on screen before the last frame, and the default 0.1s delay was easing the labels while the hold check read them. A continuous wheel still restarts the delay, so a drag is not pulled back. Desktop keeps the default delay.
- Not changed: `PHONE.visible`, segments, tilt, curve, frame count, the 029 hold, the flood wipe, the 030 svh hold and label placement, the hero, and every viewport at 760 px or wider.

## Before (pre-edit, `before.json`, commit 7b0b09c, spacer 110vh)

Scroll samples every 40 px. Steps below are the scroll between centred categories once the strip is in the scrub, not the approach from the top of the page.

| Viewport | Steps (px) | Mean | Still lead | Final hold | Film | 02A-03B pin |
| --- | --- | --- | --- | --- | --- | --- |
| 390x844 (H 844) | 160, 160, 120, 160, 160 | 152 | 80 px (0.09 H) | 920 px (1.09 H) | 1857-2785 | 3629 |
| 393x852 (H 852) | 160, 160, 160, 160, 160 | 160 | 40 px (0.05 H) | 920 px (1.08 H) | 1874-2812 | 3664 |

The still lead was already inside 0.35 H. The six steps were about 0.18 H, under the 0.45 H floor, and Landscape sat for more than one screen before the pin. Reduced motion at 390x844: scrollHeight 5327, no `.sheet-scrub`, pin count 0.

991b24e reduced-motion height was about 4903. A later change set `.band` to `100svh` (about +424 px). This prompt does not revert that. The reduced-motion spec compares to 5327, the height on this branch before the spacer edit.

## After

Progress steps are the scroll between film progress `i/6` (the quantity `phone-pace.spec.ts` asserts). The centred frame changes halfway between those marks, so Signature to Runway looks like half a step.

| Viewport | Progress steps (px) | Mean | Min / H | Still lead | Final hold | Film | Pin |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 390x844 | 464, 468, 464, 464, 464, 464 | 465 | 0.55 | 180 px (0.21 H) | 400 px (0.47 H) | 1857-4642 | 4811 |
| 393x852 | 472, 468, 468, 468, 468, 468 | 469 | 0.55 | 176 px (0.21 H) | 404 px (0.47 H) | 1874-4686 | 4856 |

Each step is within 1 percent of the mean. Still lead is under 0.35 H. Final hold is under 0.60 H and above 0. Limits: 0.45 H is 380 px at 844 and 383 px at 852. 0.35 H is 295 and 298. 0.60 H is 506 and 511.

Desktop category scrollY matches 991b24e exactly (difference 0 px):

| Viewport | Signature | Runway | Portraits | Bridal | Couples | Edmonton | Landscape |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1440x900 | 1980 | 2205 | 2430 | 2655 | 2880 | 3105 | 3330 |
| 1536x720 at 1.25 | 1584 | 1764 | 1944 | 2124 | 2304 | 2484 | 2664 |
| 1920x1080 | 2376 | 2646 | 2916 | 3186 | 3456 | 3726 | 3996 |

Recorded frames at 02A progress 0, 0.5 and 1 differ by under 1 percent mean absolute luma from `before/` (the phone-pace frame check, 28 samples across the flicker cycle). Reduced motion after the edit: scrollHeight 5327, scrub height 0, pin count 0.

## Tests

`site/tests/phone-pace.spec.ts` (desktop project, then its own viewports):

- 390x844 and 393x852, DPR 3, isMobile: seven categories centred in order forward and back; each progress step at least 0.45 innerHeight and within 15 percent of the mean; still lead at most 0.35 innerHeight; final hold at most 0.60 innerHeight.
- Reduced motion 390x844: no scrub height, no pin, scrollHeight within 2 percent of 5327.
- Desktop 1440x900, 1536x720 at 1.25, 1920x1080: scrollY of each category within 2 px of the table above, frames under 1 percent.

Passed 6/6 on its own, and again inside the production suite (tests 40-45) with no failure.

`phone-toolbar.spec.ts`, `laptop.spec.ts` (including 390x844 hold, forward and the flood after it), `post-strip.spec.ts`, `home-lock.spec.ts`, and `home.spec.ts` had no failures in the production suite.

## Shared gates

- `npm run check`: PASS
- `TC_MOTION_LAB=1 npm run build`: PASS (30 pages). Preview on 127.0.0.1:4821, stopped after the gates.
- scene_gate 01A, 03B, 04B: PASS. 01A worst SSIM 0.9774 frame 95. 03B worst 0.9613 frame 83. 04B worst 0.9531 frame 1.
- seam_gate: 10/10 PASS, worst SSIM 1.0000, timing diffs 0.
- seam_route_check: 3/3 PASS, diffs 0 (01A-02A and 02A-03B on `/?record=1`, 04B-05C on `/work/?record=1`).
- seam_route_visual desktop: 3/3 PASS (01A-02A dark 0.27 vs 0.27, 02A-03B 0.04 vs 0.04, 04B-05C 0.04 vs 0.12).
- seam_route_visual mobile: 3/3 PASS (01A-02A 0.49 vs 0.50, 02A-03B 0.91 vs 0.79, 04B-05C 0.23 vs 0.19).
- Production `npm --prefix site run build`: 20 pages, no motion-lab routes. Layout script `BaseLayout...BpmONzyi.js` is 94.40 kB, gzip 27.79 kB. The phone end trigger and snap delay are the only script added.

Frame folders under `scene-gate/` and `seam-gate/` were removed after scores and reports were saved. No webm under this qa directory.

## Shots

`qa/031-phone-strip-even-pace/shots/`, JPEG quality 75, from the production suite's phone-pace run:

- `390-cat-0-signature.jpg` through `390-cat-6-landscape.jpg`
- `1920-mid.jpg`
- `390-reduced.jpg`

## Playwright

Production suite, `PLAYWRIGHT_PORT=4831`, 228 tests: 79 passed, 147 skipped, 2 failed (26.6m). The two failures are the same flakes recorded on prompts 026 and 029. Neither page uses the phone film-strip spacer.

1. `[desktop] editorial.spec.ts` portraits bridal couples. `main.innerText` missed "Staircases, glass and great light." The sentence is in the HTML. Chapter copy starts at `autoAlpha: 0` until its ScrollTrigger plays.
2. `[desktop] work.spec.ts` record hover ripple. The 120s timeout fired on `loader-skip` during `openWork`, before the hover. The work grid test immediately before it passed.

Retry of those two tests on port 4833: 2 passed (21.5s).

Confirmation suite, `PLAYWRIGHT_PORT=4834`, same production build, no source change: 81 passed, 147 skipped, 0 failed (22.2m). Exit 0. The six phone-pace cases are in that 81. Mobile, small, and reduced skip them, which is why the skip count is 147.

## Commit message (not committed)

```
fix(home): phone film strip paced evenly across all seven categories (longer pinned scroll, no still lead); desktop unchanged
```

GATE 031-phone-strip-even-pace: PASS

