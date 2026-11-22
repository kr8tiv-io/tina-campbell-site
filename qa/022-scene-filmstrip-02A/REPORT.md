# 022-scene-filmstrip-02A

VERDICT: PASS

Home section 2 is a scroll-scrubbed curved 35mm strip. It reuses `mountCurvedStrip` (grade `gate`, tilt, barrel, amber gate light, ghost). `/runway/` is unchanged: JPEG mean abs diff 0.0, 0% of pixels differ at thresholds 8, 16 and 32 (`shots/runway-before.jpg` vs `shots/runway-after.jpg`). New scene JS is `home-filmstrip.ts` at 3923 bytes gzip -9. three.js stays the shared chunk.

The operator judges `side-by-side-02A.jpg` and `sheet-02A.jpg`. This build does not match the concept clip frame for frame. The clip is a flatter strip of repeating stills on a photographed ink table. Matt's barrel sits on top of that. Details are under "Where it does not match".

## Photos

Corner, bottom-band and residual checks. Substitutions:

| Label | Planned | Used | Why |
|---|---|---|---|
| Signature | fb_046_signature | fb_046_signature | Clean. |
| Runway | fb_064_runway | fb_012_runway | fb_064 has a WCFW footer. fb_012 coat lettering is garment type, kept. |
| Portraits | fb_048_portrait | fb_137_portrait | fb_048 is a magazine cover. fb_021 has a real @tcphoto mark. fb_137 residual is clean. |
| Bridal | fb_059_bridal | fb_109_bridal | fb_049, fb_056, fb_059 and fb_109 all carry a real TC Photo script. No clean bridal file in assets. Frame 3 uses `focusX` 0.95 so the left-window script falls outside the cover. The mark is still in the source file. |
| Couples | fb_031_couples | fb_007_couples | fb_031 script sits near y 0.81. fb_007 lower residual is sparkle, not type. |
| Edmonton | fb_001_city | fb_001_city | Clean. Filter `edmonton`. |
| Landscape | fb_000_landscape | fb_000_landscape | Clean. No landscape filter, so the link is also `edmonton`. |

Record-mode desktop at progress 0.5 shows the bride at the fountain with no script in the film window.

## checks.json

`qa/022-scene-filmstrip-02A/checks.json` pass true, errors empty, desktop 1440x810 and phone 390x844, `?record=1&gate=02A`.

Desktop: end/centre height 0.628 and 0.590, centre rise 0.312 and 0.054, tilt -7 deg, sprockets 6/6, light ratio 1.203 (centre 110.67, neighbours 95.42 and 88.62), table above 14.29 below 28.8 hue 26.48, sweep 0..6, snap 1, ghost rest 0 / motion 6.401 / after 0.863.

Phone: ratios 0.610 and 0.595, rises 0.276 and 0.103, tilt -5 deg, sprockets 6/6, light ratio 1.155 (centre 105.74, neighbours 94.6 and 88.48), table above 17.29 below 79.27 hue 30.61, sweep 0..6, snap 1, ghost rest 0 / motion 9.414 / after 0. Phone light is 0.005 over the 1.15 floor. Do not retune centre scale.

## Where it does not match

`side-by-side-02A.jpg` pairs reference frames 0, 24, 30, 60, 96, 144 with record progress 0, 0.2, 0.35, 0.5, 0.75, 1.0.

Every pair: the reference is a near-flat strip of the same concept stills (blue dress, black bob, white dress, grey coat) on a photographed ink table, mild tilt, warm pool under the strip, rectangular sprockets. This build is a 7-frame barrel. Frame height and width fall off toward the ends, the top edge bows up and the bottom edge bows down, tilt is about -7 deg on desktop and -5 deg on the phone. Photos are the category set and they advance with scroll. The table is CSS radial ink plus tiled noise. Labels are real HTML (category and No.), not baked into the texture. The centre frame is the brightest.

Progress does not map onto the clip. The clip barely changes across those six frames. Here progress 0 centres Signature, 0.5 centres Portraits, 1.0 centres Landscape.

Phone row: the strip sits in a tall 390x844 letterbox with a strong amber pool under it. The reference has no phone frames.

`sheet-02A.jpg` is the gap-audit scroll capture (`capture-pages.mjs`, ONLY=02A), not record mode. Columns 1 to 3 still show the curved strip under the nav. Columns 4 to 6 have left the sheet and show the runway scene, because that script walks 01A-02A and then into 02A-03B. Judge the strip on `side-by-side-02A.jpg`.

## Gates

Motion-lab preview `http://127.0.0.1:4821` before the production rebuild. Later production builds overwrote `site/dist`. These artifacts were already written.

```
cd site && npm run check && TC_MOTION_LAB=1 npm run build && (npx astro preview --port 4821 --host 127.0.0.1 > /tmp/preview-4821.log 2>&1 &) ; cd ..
python3 build-plan-locked-2026-11-19/tools/scene_gate.py --base http://127.0.0.1:4821 --scenes 01A,03B --out qa/022-scene-filmstrip-02A/scene-gate
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/022-scene-filmstrip-02A/seam-gate
python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/022-scene-filmstrip-02A/route-visual
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/022-scene-filmstrip-02A/route-visual-mobile --mobile
```

| Gate | Result |
|---|---|
| tsc `npm run check` | PASS, exit 0 |
| scene_gate 01A, 03B | PASS. 01A worst 0.9748 frame 95, mean 0.9773, bad 0/145. 03B worst 0.9613 frame 83, mean 0.9693, bad 0/145. |
| seam_gate | PASS 10/10. Each pair worst SSIM 1.0000, bad 0/101, timing diffs 0. |
| seam_route_check | PASS 3/3, diffs 0 (01A-02A, 02A-03B, 04B-05C). |
| seam_route_visual desktop | PASS 3/3. 01A-02A step 7 dark 0.60 vs gold 0.45. 02A-03B step 3 dark 0.63 vs 0.53. 04B-05C step 10 dark 0.04 vs 0.12. |
| seam_route_visual mobile | PASS 3/3. 01A-02A step 8 dark 0.64 vs 0.52. 02A-03B step 4 dark 0.69 vs 0.57. 04B-05C step 7 dark 0.22 vs 0.19. |

02A has no scene_gate SSIM. Acceptance for 02A is `checks.json` plus the operator-judged sheet.

## Production Playwright

`env -u TC_MOTION_LAB npm --prefix site run build`. Build log: motion-lab routes absent. Home keeps the existing `noindex, nofollow` robots meta.

First full suite, `PLAYWRIGHT_PORT=4877`: 38 passed, 18 skipped, 4 failed. All four were reduced-motion horizontal overflow (`scrollWidth` 1451 vs `innerWidth` 1440) from the CSS stand-in rotated -7 deg. Fix: `overflow: hidden` on `.sheet.is-film-css` and `.sheet.is-film-css .sheet__media`. WebGL and record mode are unchanged.

Retest `--project=reduced` on `PLAYWRIGHT_PORT=4878`: 10 passed, 5 skipped, 0 failed.

Full suite `PLAYWRIGHT_PORT=4879`: 42 passed, 18 skipped, 0 failed. Home tests that read `.sheet__label` were not edited. The h1 stays "Tina Campbell".

## Shots

`qa/022-scene-filmstrip-02A/shots/`: desktop 1440x900 and mobile 390x844 (DPR 3) at scroll 0, 02A start, mid and end; `reduced-1440-02A.png` (CSS 3D stand-in, centre frame larger, no pin). The reduced shot was taken before the overflow clip. The stand-in is the same picture, now clipped so it cannot widen the page.

## Commit

Operator commits. Suggested message:

feat(scene-02A): curved film-gate strip on home, scroll scrubbed, sprockets and amber gate light
