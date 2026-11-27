# 020-mobile-pass

Phones (390x844) and tablets (768x1024) keep every scene readable, the subject in frame, and the page free to scroll. Scene video stays muted and inline, pauses off screen, and picks the 720 source when the viewport is under 1000px. The home hero name sits in the locked black band. Pins do not trap a coarse pointer.

## Scene gate

`--scenes 01A,03B,04B,06B,09B,10A,11B` against `http://127.0.0.1:4821`. Output: `qa/020-mobile-pass/scene-gate`.

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

02A, 05C, 07C and 08B are code scenes. `scene_gate.py` has no SSIM for them. Portrait letterbox rules are `html:not(.is-scene-gate)`, so the 1280x720 gate still records the desktop crop.

## Seams

```
seam_gate: PASS 10/10 (01A-02A through 10A-11B, worst SSIM 1.0000, timing_diffs=0, bad=0, frames=101)
seam_route_check: PASS 3/3 (01A-02A, 02A-03B on /?record=1; 04B-05C on /work/?record=1; diffs=0)
seam_route_visual desktop: PASS 3/3
seam_route_visual --mobile: PASS 3/3
```

Desktop worst steps: 01A-02A dark 0.44 vs gold 0.45, 02A-03B 0.04 vs 0.04, 04B-05C 0.04 vs 0.12. Mobile: 01A-02A 0.49 vs gold 0.50, 02A-03B 0.91 vs 0.79, 04B-05C 0.23 vs 0.19. Reported pin length is 3.2vh against a gold pin of 2.2 on every seam. The 320vh track was not shortened. Under 960px the stage is `100vh` / `100svh` so the pin is not stuck under iOS chrome. Outputs: `qa/020-mobile-pass/seam-gate`, `route-visual`, `route-visual-mobile`.

## Framing

| Scene | Phone and tablet |
|---|---|
| 01A | `--hero-x: 68%`. Y formula stays 0px on a tall phone, so the full source height shows and the locked lower ~29% black band stays on screen. Title and caption sit in that band, above the Book bar (`padding-bottom: calc(72px + safe area)`). Media was not cropped or re-encoded. |
| 02A | Film strip, not a cover crop. `touch-action: pan-x pan-y` so a vertical swipe is not captured by the scroller. |
| 03B | Portrait: 16:9 band, `object-position: 50% 46%`, after the spot is clean. |
| 04B | Tile 3:4, `50% 50%` (centre panel). |
| 05C | Code. Phone falls in two columns, no pin. |
| 06B | 16:9 box under 960px, `50% 50%`. No pin on a coarse pointer. |
| 07C | Print stack. Each card uses `object-position: var(--print-pos)` from the series spread (cover, feature, pair, film). No pin under 960px or on a coarse pointer. A short scrub runs while the cover crosses the viewport (`start: top 80%`, `end: bottom 20%`). Desktop fine pointer still pins. |
| 08B | Ink flood. Not a video crop. Timeline `__SCENE_TL__['08B']` stays paused. Labels: rise 0, hold 0.6, reveal 0.72, end 1.2. |
| 09B | 16:9 under 900px, `50% 50%`. No pin on portrait. |
| 10A | Portrait letterbox 16:9, `38% 50%` (home band top 46%, footer drift top 42%). Desktop stays `50% 50%`. Gate class forces `50% 50%`. |
| 11B | 16:9 under 960px, `50% 50%`. No pin under 960px. |

## Hero data

The home hero is `fb_013_signature` (The Red Gown, Edmonton). The caption is `No. 001 / The Red Gown, Edmonton`. BaseLayout gets that photo's alt and a 1200x630 OG image. `tests/home.spec.ts` and `tests/home-lock.spec.ts` expect the new caption. Those are the only test edits.

## Sources and iOS

`scene-video.ts` still picks 720 when `innerWidth < 1000` or Save-Data, and 1080 otherwise. Gate mode still forces 1080. On a 390px load, in-view videos reported slot `720`: 04B, 06B, 09B, 11B and the runway-page 10A all requested `*-720.mp4`, muted, `playsinline`, `autoplay` false. Below-fold 03B and the lazy footer 10A had an empty source list at scroll 0 (`preload="none"`).

01A is the manifest exception, left as shipped. `h264_720` points at `/media/scenes/01A/01A-1080.mp4`. Phones set `data-scene-src="720"` and the file that plays is that 1080 master. The manifest and the encoded media were not edited.

`prime()` sets `muted`, `defaultMuted`, `volume = 0`, `playsInline`, `playsinline`, `webkit-playsinline`, and removes `autoplay`. A coarse pointer pauses the video when it leaves the viewport and plays once it is at least 60% in view. `ScrollTrigger.config({ ignoreMobileResize: true })` keeps an iOS address-bar resize from refreshing a pin mid-gesture.

## Hero LCP

On phones the poster paints under the opaque loader (`html.loader-play .site-reveal { opacity: 1 }` at max-width 960px, in both the stylesheet and the BaseLayout head style). `hero-poster-inset` is always on, so the poster is `height: calc(100% - 1px)` and stays eligible as LCP. Desktop loader fade is unchanged (`opacity: 0` during the loader).

Lighthouse CLI on the local preview: **FAIL**. `qa/020-mobile-pass/lighthouse-mobile.json` is a NO_FCP run (`LH_EXIT 1`). DevTools throttling at 4x CPU plus Lighthouse's trace gatherer never delivered `Page.lifecycleEvent` `firstContentfulPaint` (PROTOCOL_TIMEOUT on Scripts and TraceElements). The same page paints in Playwright.

Lab measurement, same budget, saved as `qa/020-mobile-pass/lab-mobile.json`: Chrome `Emulation.setCPUThrottlingRate` 4, no network throttle, 390x844, device pixel ratio 3, cold load. FCP 256 ms. One LCP entry at 256 ms, size 328770, tag IMG, URL `/media/scenes/01A/01A-poster.webp`, alt "Model in a red gown on a teal truck, one leg extended, clear blue sky." CLS 0. LCP is under 2.5 s and CLS is under 0.05.

## Playwright

Production `npm --prefix site run build` (no `TC_MOTION_LAB`): 20 pages, `site/dist/motion-lab` absent, home HTML has `noindex`. Client chunk `BaseLayout.astro_astro_type_script_index_0_lang.CLFHRB6r.js` 94.35 kB, gzip 27.76 kB. Prompt 019's production chunk was gzip 27.54 kB. Added about 0.22 kB gzip, under the 15 kB budget.

The first production run failed one test. `photo-spread.spec.ts` counted each series photo twice, because the print cards were a second `<img>` in the built HTML. 74 passed, 129 skipped, 1 failed.

The cards are now cloned at runtime from the spread frames. `PLAYWRIGHT_PORT=4831 npx playwright test` on that build: 75 passed, 129 skipped, 0 failed (18.4m).

## Shots

`qa/020-mobile-pass/shots/`. Chrome. Desktop 1440x900, phone 390x844 at DPR 3, tablet 768x1024 at DPR 2. Scroll 0 on every route, plus each scene at start, middle and end. One reduced-motion shot: `shots/reduced-m390-home-scroll0.jpg`.

Phone and tablet `scrollWidth` matched `innerWidth` on the grid. Desktop light-table end frames `d1440-04B-end` (1529 vs 1440) and `d1440-05C-end` (1459 vs 1440) still translate tiles off canvas. That overflow is the desktop fall, not the phone or tablet pass.

Series covers mount three or more prints, titles wrap and stay readable, and a phone or tablet does not pin. The cards are cloned at runtime from the spread frames (`data-print-frame`), so the built HTML lists each library photo once. No JS leaves the cover photograph visible. The full-bleed zoom hides only once `.print` cards exist.

## Fixes

Home hero copy moves to the bottom of the phone hero, into the black band, with a size cap of `min(16.6vw, 9.2vh)`. `--hero-x` stays 68%.

Portrait 10A letterboxes a 16:9 band at 38% 50%. 03B, 04B, 06B, 09B and 11B keep the crops in the table above. The portraits heading wraps (`white-space: normal`, `text-wrap: balance`) so it does not overflow 390 or 768.

Catwalk and home runway scrollers use `touch-action: pan-x pan-y`.

A first print-stack markup pass put a second `<img>` of each spread photo in the series HTML. `photo-spread.spec.ts` then failed (each id appeared twice). The cards are now cloned from those frames when motion starts, and the photo audit reports 0 violations. Scene, seam and route gates were already green and do not render the series stack.
