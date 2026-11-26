# 017-scene-about-footer-09B-10A

09B scrubs on the full-bleed band under the editorial split on `/about/`. 10A loops in the home contact band and in the site footer on every other page, including `/book/`. Home does not also render the footer video, so each page has one `video[data-scene-video="10A"]`. Encoded media, gates, gold frames, and manifests were not edited.

Seam 09B-10A stays unwired. On `/about/` the portrait split, the behind-the-scenes row, and the places block sit between the band and the footer. Logged in `build-plan/OPEN-QUESTIONS.md` item 11. The harness at `/motion-lab/seams/09B-10A/` is unchanged. Seams stayed 10/10.

## Scene gate

`--scenes 01A,03B,04B,06B,09B,10A` against `http://127.0.0.1:4821` after the pin-offset fix. Output: `qa/017-scene-about-footer-09B-10A/scene-gate`.

```
01A PASS worst=0.9774 (frame 95) mean=0.9794 bad=0/145
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145
04B PASS worst=0.9531 (frame 1) mean=0.9597 bad=0/145
06B PASS worst=0.9816 (frame 5) mean=0.9906 bad=0/145
09B PASS worst=0.9319 (frame 1) mean=0.9411 bad=0/145
10A PASS worst=0.9526 (frame 73) mean=0.9727 bad=0/145
VERDICT: PASS
```

10A's gate route is `/book/`. Gate mode forces the 1080 source, hides overlay and copy, and pins neither scene.

## Seams

```
seam_gate: PASS 10/10 (01A-02A through 10A-11B, worst SSIM 1.0000, timing_diffs=0)
seam_route_check: PASS 3/3 (01A-02A, 02A-03B, 04B-05C, diffs=0)
seam_route_visual desktop: PASS 3/3
seam_route_visual --mobile: PASS 3/3
```

Desktop route visual worst steps: 01A-02A dark 0.26 vs 0.27, 02A-03B 0.04 vs 0.04, 04B-05C 0.04 vs 0.12. Mobile: 01A-02A 0.49 vs 0.50, 02A-03B 0.91 vs 0.79, 04B-05C 0.25 vs 0.21. Outputs: `qa/017-scene-about-footer-09B-10A/seam-gate`, `route-visual`, `route-visual-mobile`.

## Lazy footer

`data-scene-lazy="1"`. The still is a div. The poster and the video file are requested only after the band is within one viewport, then on idle. Counts from `shots/*-network.json` (requests whose URL contains `/10A/`):

| Page | Before any scroll toward the band | Still more than one viewport away | After the band is within one viewport |
|---|---|---|---|
| `/` desktop | 0 | 0 | 2 (poster webp, then 1080 webm) |
| `/about/` desktop footer | 0 at scroll 0 and while the 09B band played | 0 | 2 |
| `/` mobile | 0 | 0 | 2 (poster webp, then 720 mp4) |
| `/about/` mobile footer | 0 | 0 | 2 |

Scroll 0 on `/` does request 01A and, after idle, 03B. It does not request 10A. `/about/` does request 09B after idle, because that band sits one screen under the hero. That is the about scene, not the footer.

Reduced motion on `/about/`: one request for `09B-end.webp`, no video sources, both videos report an empty `currentSrc`. Shot: `shots/reduced-about-09B.png`.

## On-page columns

Sheets: `qa/017-scene-about-footer-09B-10A/sheet-09B.jpg` and `sheet-10A.jpg`. Capture: `cap/`. Reference frames are clip frames 0, 29, 58, 87, 115, 144.

09B desktop, selector `[data-about-hero]` (editorial split plus the pin):

| Column | Scroll | What is on screen | Difference from the clip |
|---|---|---|---|
| 0 | 0 | Editorial split, Tina (`fb_171_bts`) | Not the clip. The wrapper starts at the hero. |
| 1 | 0.2 | Still the editorial hero | Same. |
| 2 | 0.4 | Band, dusk, arch and skyline, full width under the header | Clip frame near the start. Solid header. Crop is the viewport below the header, so a little less sky than the naked 16:9 frame. |
| 3 | 0.6 | Blue hour, window lights coming on | Mid clip, same header crop. |
| 4 | 0.8 | Deeper blue, lights on | Later clip. |
| 5 | 1 | End of the pin, arch and towers lit | End of the clip. Same header crop. |

09B phone does not pin. The wrapper is only a little taller than the viewport, so the six steps travel about 300px and stay on the editorial hero until the last column. Column 5 shows the hero copy and a full-width 16:9 dusk strip. The manual phone shots (`shots/mobile-390-about-09B-middle.png`) show that strip on its own, arch and skyline together, as the band crosses the screen.

10A desktop and phone, selector `[data-band]`:

| Column | What is on screen | Difference from the clip |
|---|---|---|
| 0 to 2 | Red-gown teaser, with the bridge entering at the bottom | Lenis had not finished the long `scrollTo` in the capture's 1.3s wait, so these columns undershoot the band. |
| 3 to 5 | Full-bleed bridge, heading and button as HTML | Clip is the bridge. The page adds the solid header, the bottom scrim, and the contact type. The old grey filtered still is gone. |

The band is `100svh` on desktop and on the phone, so the bridge is the subject rather than a short grey strip. Copy stays in the HTML.

## Photos

About still uses `fb_171_bts`, `fb_021_portrait`, `fb_125_bts`, `ig_profile_05`, `fb_120_portrait`, `fb_134_portrait`, `fb_066_city`, `fb_107_landscape`, `fb_071_landscape`, `fb_168_city`, plus the 09B media. The home band no longer uses `fb_577057434409234`. That frame stays on `/series/blue-hour/` only.

## Playwright

Production `npm --prefix site run build` (no `TC_MOTION_LAB`): 20 pages, `site/dist/motion-lab` absent, home HTML has `noindex` and no `/motion-lab/` link. Client chunk `BaseLayout...B6-Iby3B.js` 89.56 kB, gzip 26.41 kB. Prompt 026's chunk was gzip 25.86 kB. Added about 0.55 kB gzip, under the 15 kB budget.

`PLAYWRIGHT_PORT=4831 npx playwright test`: 75 passed, 129 skipped, 0 failed (19.6m).

## Shots

`qa/017-scene-about-footer-09B-10A/shots/`. Chrome. Desktop 1440x900. Phone 390x844, DPR 3. Scroll 0 plus scene start, middle, and end on `/`, `/about/`, and `/book/`, and the shared footer on `/work/`. One reduced-motion shot of the about band.

Desktop 09B pin, after measuring the header box (`--header-h` is a `clamp()`, so `parseFloat` on the custom property was not a length): band top 112, bottom 900, progress 0 / 0.5 / 1 at 0s / 3.04s / 6.06s. The light wave (about 2.0s to 3.5s) sits in the middle of the pin.

## Suggested commit

feat(scene-09B-10A): about blue-hour lights scrub and footer blue-hour drift loop
