# 019-scene-transitions-08B

08B is the route-change layer, not a video scene. A persisted full-viewport overlay in `BaseLayout` carries the ink-plume mask. On an internal navigation the sheet rises `yPercent` 100 to 0 in 0.6 s (`power2.inOut`), holds, then a radial mask thins from the centre to show the next page. Wall time is 1.2 s. The 6.04 s clip is the shape and the order, not the duration. Encoded media, gates, gold frames, and manifests were not edited.

`window.__SCENE_TL__['08B']` is a paused GSAP timeline. Labels: `rise` 0, `hold` 0.6, `reveal` 0.72, `end` 1.2. Children, in order: sheet `yPercent` 100 to 0 (0.6 s, `power2.inOut`); an empty hold (0.12 s); root `--ink-clear` -24% to 160% and `--ink-edge` -12% to 210% (0.48 s, `power2.inOut`). There is no scene-gate SSIM for 08B. `scene_gate.py` only knows the seven video scenes.

## Scene gate

`--scenes 01A,03B,04B,06B,09B,10A,11B` against `http://127.0.0.1:4821`. Output: `qa/019-scene-transitions-08B/scene-gate`.

```
01A PASS worst=0.9774 (frame 95) mean=0.9794 bad=0/145
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145
04B PASS worst=0.9531 (frame 1) mean=0.9597 bad=0/145
06B PASS worst=0.9816 (frame 5) mean=0.9906 bad=0/145
09B PASS worst=0.9319 (frame 1) mean=0.9411 bad=0/145
10A PASS worst=0.9526 (frame 73) mean=0.9727 bad=0/145
11B PASS worst=0.9662 (frame 5) mean=0.9772 bad=0/145
VERDICT: PASS
```

Same worst frame and score as prompt 018 on every scene. The overlay is `data-scene-overlay`, so gate mode hides it. At rest the sheet sits about 2 vh below the fold.

## Seams

```
seam_gate: PASS 10/10 (01A-02A through 10A-11B, worst SSIM 1.0000, timing_diffs=0)
seam_route_check: PASS 3/3 (01A-02A, 02A-03B, 04B-05C, diffs=0)
seam_route_visual desktop: PASS 3/3
seam_route_visual --mobile: PASS 3/3
```

Desktop route visual worst steps: 01A-02A dark 0.44 vs gold 0.45, 02A-03B 0.04 vs 0.04, 04B-05C 0.04 vs 0.12. Mobile: 01A-02A 0.49 vs 0.50, 02A-03B 0.91 vs 0.79, 04B-05C 0.23 vs 0.19. Outputs: `qa/019-scene-transitions-08B/seam-gate`, `route-visual`, `route-visual-mobile`.

## Behaviour

Click, Enter, and back/forward play the flood. The fetch starts with the rise. The timeline pauses at 0.72 s until the next document is ready, then the radial runs. Focus moves to `main h1` (`tabindex="-1"`, `preventScroll`) on `astro:page-load`, after the view transition has released the new heading. Measured: desktop and phone both land on `/work/` with focus `H1`.

`?record=1` and reduced motion do not play the flood. The swap is instant and focus still moves. The timeline stays exported and paused at 0, so a seek does not change production. Lenis is stopped for the flood via `html.ink-flood-hold` and `window.__tcMotion.holdScroll`, without `overflow: hidden`.

Side-by-sides at four points: `shots/sbs-rise.jpg`, `sbs-late-rise.jpg`, `sbs-hold.jpg`, `sbs-reveal.jpg`. Site times 0.25, 0.40, 0.72, 0.90 against clip frames 29, 58, 87, 115.

## On-page columns

Sheet: `qa/019-scene-transitions-08B/sheet-08B.jpg`. Capture: `cap/08B/`. The audit clicks Work from home and shoots at 0, 0.15, 0.3, 0.5, 0.8, 1.4 s. Reference frames are clip frames 0, 29, 58, 87, 115, 144. The transition is full-bleed on the desktop row.

Desktop 1440x810:

| Column | Time | What is on screen | Difference from the clip |
|---|---|---|---|
| 0 | 0 | Home hero, real red-gown truck, title | Clip already has smoke at the bottom. The click has not moved the sheet yet. |
| 1 | 0.15 | Same hero, still uncovered | `power2.inOut` is slow at the start, so the plume is still below the fold. The clip's second frame is already half smoke. |
| 2 | 0.3 | SVG plume across the lower two thirds, header still visible above it | Full-bleed. The edge is the ink-plume path, not the clip's volumetric smoke. Real photo, not the generated plate. |
| 3 | 0.5 | Solid ink, `#0c0c0f` | Hold. The clip still shows a faint figure in the smoke. |
| 4 | 0.8 | Still solid ink | Reveal starts at 0.72 s from negative mask stops, so 0.8 s has not opened a readable iris yet. The clip's fifth frame is the smoky opening onto the black gown. |
| 5 | 1.4 | Work light table, real prints, focus ring on the heading | The radial has finished. The clip's last frame is the generated black-gown cover, not this page. |

Phone 390x844, capture row: all six frames are the open menu. The script clicks `a[href="/work/"]` with `.first()` after opening the menu, and that match is the desktop nav link (`display: none` under 960 px). The header order was not changed. Phone transition shots taken on the visible `.menu__nav a[href="/work/"]` are `shots/mobile-live-rise.jpg`, `mobile-live-hold.jpg`, `mobile-live-reveal.jpg`, `mobile-live-end.jpg`. The reveal is a full-bleed circle on the work page, and focus is the new h1.

## Photos

No new library ids and no scene video. The flood sits on top of whatever page is already there. Home still opens on the real red-gown truck. Work still uses its existing light-table prints.

## Playwright

Production `npm --prefix site run build` (no `TC_MOTION_LAB`): motion-lab page emitted no HTML, `site/dist/motion-lab` is absent, home HTML has `noindex`. 20 pages (19 routes plus 404), plus robots and rss. Client chunk `BaseLayout...LPPc7iB8.js` 93.56 kB, gzip 27.54 kB. Prompt 018's production chunk was gzip 26.79 kB. Added about 0.75 kB gzip, under the 15 kB budget.

`PLAYWRIGHT_PORT=4831 npx playwright test`: 75 passed, 129 skipped, 0 failed (17.6m).

## Shots

`qa/019-scene-transitions-08B/shots/`. Chrome. Desktop 1440x900 and phone 390x844, DPR 3. Scroll 0 on home, work, about, fashion, portraits, book, services, journal, runway, and the red-gown series. Scene rise, hold, and reveal from the paused timeline, plus a live click on desktop and from the phone menu. One reduced-motion shot: `shots/reduced-work.jpg` (instant swap, focus on the Work heading).

## Fixes

The CSS park `translateY(100%)` was stacking on GSAP `yPercent`, so the sheet never entered the viewport. The sheet is armed (`transform: none`) in the same turn GSAP takes over `yPercent`. Before JS, the CSS transform still parks it below the fold.

A `0% / 0%` radial pair antialiased a hole in the centre of the hold. The mask starts at negative stops (`-24% / -12%`) and eases out to `160% / 210%`, so the hold is solid and the iris opens from the centre.

Named view-transition groups (the persisted overlay) were still crossfading above the live mask. Every `::view-transition-*` group now has `animation: none`, so the radial plays on the live layer.

## Suggested commit

feat(scene-08B): ink flood page transition
