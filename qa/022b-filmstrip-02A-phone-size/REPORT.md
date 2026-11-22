# 022b-filmstrip-02A-phone-size

VERDICT: PASS

On phones under 760 px the home 02A strip fills the viewport: it bleeds off both edges, the centre frame is a large photo, and three frames stay in view. Desktop record frames match the pre-change capture at 0 percent. `/runway/` matches at 0 percent. Pin length on the phone stays `110vh`.

## What changed

Width branch only (`window.innerWidth < 760` and `@media (max-width: 759px)`). Desktop options are the 022 object (visible 7, tilt -7, centreScale 1.08). Phone WebGL uses visible 1.82, segments 12, centreScale 1.06, persp 0.012, edgeLift 0.22, tilt -5, midFrac 0.018, holes 8. Phone scroll snap is nearest-frame (`directional: false`). Desktop snap stays directional. The CSS stand-in shows three frames, centre 56vw. The right-hand stand-in label is pulled in 18 px so "Couples" and "No. 05" stay whole.

`home-filmstrip.ts` gzip -9 is 5083 bytes. Prompt 022 measured 3923. Added about 1.2 KB, under the 3 KB cap. `curvedStrip.ts` gzip -9 is 7898 bytes. The built chunk is still `curvedStrip.Cp47Pw-i.js`, 12.96 kB, gzip 5.46 kB. The shader string is unchanged.

## Phone checks (record mode and scroll mid)

`checks.json` pass true. Numbers at progress 0.5.

| Check | 390x844 | 400x860 |
|---|---|---|
| Bleed | left -203.6, right 593 | left -208.8, right 608.2 |
| Centre frame | width 0.766, height 0.557, cy 0.482 | width 0.766, height 0.562, cy 0.482 |
| Visible frames | 3 (indices 2, 3, 4) | 3 (indices 2, 3, 4) |
| Dead bands | above 0.217, below 0.197 | above 0.215, below 0.196 |
| Labels | font 12, no overlap, none clipped | font 12, no overlap, none clipped |
| Curve | ratios 0.694 / 0.664, rises 0.212 / 0.093 | ratios 0.694 / 0.664, rises 0.212 / 0.094 |
| Tilt | -5 deg | -5 deg |
| Sprockets | top 5, bottom 4, contrast 16.07 / 16.07 | top 5, bottom 4, contrast 16.07 / 16.07 |
| Light | 1.422 (centre 117.29, neighbours 81.27 and 83.73) | 1.599 (centre 125.61, neighbours 75.59 and 81.55) |
| Table | above 21.14, below 49.1, hue 28.3 | above 21.14, below 47.22, hue 28.38 |
| Scrub / snap | sweep 0..6, snap 1 | sweep 0..6, snap 1 |
| Ghost | rest 0, motion 5.915, after 0 | rest 0, motion 5.812, after 0 |
| Scroll | down 0..6, up 6..0, no overflow | down 0..6, up 6..0, no overflow |

Sprocket counts are a horizontal row inside the centre sprocket band (max luma at most 30). A chord between the quad corners cuts the bowed photo and under-counts. The amber sample is the warm pool under the labels. A sample 28 px under the film hits the black gap and reads hue 240.

CSS stand-in, reduced motion at 390: 3 frames, centre width 0.633, no pin, scrollWidth 390. Labels Portraits, Bridal, and Couples are inside the viewport at 12 px. "Couples" and "No. 05" are whole. No WebGL at 400: 3 frames, centre width 0.594, no pin, scrollWidth 400, font 13. No JS at 390: seven stacked links, Signature through Landscape, real `/work/?filter=` hrefs, scrollWidth 390.

## Desktop unchanged

Mean absolute pixel difference versus `desktop-before/`, percent of 255. Each value is progress 0, 0.2, 0.35, 0.5, 0.75, 1.0.

| Frame | Diff |
|---|---|
| 1440x810, all six | 0, 0, 0, 0, 0, 0 |
| 1440x900, all six | 0, 0, 0, 0, 0, 0 |
| runway 1440x900 JPEG | 0 |

A second 1440x810 capture at progress 0.5 after the phone snap change is also 0 percent against `desktop-before`.

checks.json desktop versus 022: curve ratios 0.628 and 0.590 (delta 0), rises 0.312 and 0.054 (delta 0), tilt -7 (delta 0), sprockets 6/6 contrast 16.07, light 1.203 (centre 110.67, neighbours 95.42 and 88.62, delta 0). Table below 29.14 versus 28.8 (1.2 percent), hue 26.48 exact. Table above at the probe is 14.84 versus 14.29 (3.85 percent). The same picture at y 103 is 14.29. Full-frame diff is 0 percent, so that gap is probe placement on an identical frame. Ghost motion 5.937 versus 022's 6.401 is shutter timing. Rest frames match.

## Where the sheet still differs

`side-by-side-02A.jpg` has three rows (desktop 1440, phone 390, phone 400). Each row pairs reference frames 0, 24, 30, 60, 96, 144 with record progress 0, 0.2, 0.35, 0.5, 0.75, 1.0.

Desktop row: the reference is a near-flat strip of the concept stills on a photographed ink table. This build is the 7-frame barrel of category photos (Signature through Landscape), same picture as the 022 build. Pixel diff against the pre-change capture is 0 percent.

Phone 390 and phone 400: the reference has no phone frames, so those cells sit beside the same landscape reference. The strip now reads large. It bleeds off both screen edges, the centre photo fills more than half the width, the neighbours are cropped by the screen, and the amber pool sits under the labels. It is still the category barrel, not the concept stills, and the curve is stronger than the reference's mild tilt.

`sheet-02A.jpg` is the gap-audit scroll capture (`capture-pages.mjs`, ONLY=02A). Columns 4 to 6 leave the strip and show the runway, because that script walks into 02A-03B. Judge the strip on `side-by-side-02A.jpg`.

## Gates

Motion-lab preview `http://127.0.0.1:4821` before the production rebuild. The later CSS stand-in tweak is inside the 759 px query and does not touch WebGL, desktop CSS, seams, 01A, or 03B. The production build then replaced `site/dist` (20 pages).

```
cd site && npm run check && TC_MOTION_LAB=1 npm run build && (npx astro preview --port 4821 --host 127.0.0.1 > /tmp/preview-4821.log 2>&1 &) ; cd ..
python3 build-plan-locked-2026-11-19/tools/scene_gate.py --base http://127.0.0.1:4821 --scenes 01A,03B --out qa/022b-filmstrip-02A-phone-size/scene-gate
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/022b-filmstrip-02A-phone-size/seam-gate
python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/022b-filmstrip-02A-phone-size/route-visual
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/022b-filmstrip-02A-phone-size/route-visual-mobile --mobile
```

| Gate | Result |
|---|---|
| tsc `npm run check` | PASS, exit 0, on the final tree |
| scene_gate 01A, 03B | PASS. 01A worst 0.9748 frame 95, mean 0.9773, bad 0/145. 03B worst 0.9613 frame 83, mean 0.9693, bad 0/145. |
| seam_gate | PASS 10/10. Each pair worst SSIM 1.0000, bad 0/101, timing diffs 0. |
| seam_route_check | PASS 3/3, diffs 0 (01A-02A, 02A-03B, 04B-05C). |
| seam_route_visual desktop | PASS 3/3. 01A-02A step 7 dark 0.60 vs gold 0.45. 02A-03B step 3 dark 0.63 vs 0.53. 04B-05C step 10 dark 0.04 vs 0.12. |
| seam_route_visual mobile | PASS 3/3. 01A-02A step 9 dark 0.52 vs 0.50. 02A-03B step 6 dark 0.67 vs 0.66. 04B-05C step 7 dark 0.22 vs 0.19. |

02A has no scene_gate SSIM. Acceptance for 02A is `checks.json`.

## Production Playwright

`env -u TC_MOTION_LAB npm --prefix site run build`. 20 pages. Motion-lab routes are absent (the seams lab page emitted no HTML). Home keeps `<meta name="robots" content="noindex, nofollow">`. Built JS: BaseLayout gzip 23.69 kB, curvedStrip gzip 5.46 kB, seams gzip 69.09 kB, three.js gzip 128.57 kB.

`PLAYWRIGHT_PORT=4891 npx playwright test`: 43 passed, 21 skipped, 0 failed (7.1m). The new test `phone film strip fills the viewport` passed on the mobile project (bleed, centre size, scrollWidth, scrub 0..6 and 6..0 at 390x844) and skipped on desktop, small, and reduced.

## Shots

`qa/022b-filmstrip-02A-phone-size/shots/`: `mobile-390x844-02A-start.jpg`, `mid`, `end`; `mobile-400x860-02A-start.jpg`, `mid`, `end`; `reduced-390x844-02A.jpg`; `desktop-1440x900-02A-mid.jpg`. JPEG q70. Phone shots are DPR 3.

## Commit

Operator commits. Suggested message:

feat(scene-02A): curved film strip fills the phone viewport; desktop unchanged
