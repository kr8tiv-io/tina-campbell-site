# 025-work-04B-05C-on-page

`/work/` plays 04B (crimson ink drop) on the centre feature tile and runs 05C (light-table drop) as the entrance on the opening eight prints. Copy stays HTML. Seam 04B-05C stays on the same route.

## Scene gate

`--scenes 01A,03B,04B`. Output: `qa/025-work-04B-05C-on-page/scene-gate`.

```
01A PASS worst=0.9774 (frame 95) mean=0.9794 bad=0/145
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145
04B PASS worst=0.9531 (frame 1) mean=0.9597 bad=0/145
VERDICT: PASS
```

04B stays at 0.9531, above 0.95. Gate mode still pins `video[data-scene-video="04B"]` fixed to the viewport. On the page the same video plays inside the feature tile at that tile's crop (`object-fit: cover`).

## 05C timeline

Exported from `window.__SCENE_TL__['05C']` on `/work/?record=1` at 1280x720. Duration 6.44 s. Tolerance is 2 frames (0.083 s). Record mode builds the desktop timeline even on a narrow viewport, then clears the from-values. Resting grid before any seek: y 0, rotation 0, scale 1, shadow none, filter none.

| Beat | Spec | Timeline | Sample |
|---|---|---|---|
| Empty table glow | 0 to 0.5 s | glow `sine.out` autoAlpha 1, start 0 end 0.5 | t=0.5 glow opacity 1, prints y=-120vh, rot ±18, scale 1.1, ring scale 0 |
| Prints fall | 0.5 to 2.0 s, y -120vh, rotate ±18, scale 1.1, shadow 0 60px 80px | 8 prints, `power2.out`, y to 6vh, start 0.5 end 2.0 | t=1.0 y=-31.33vh, rot ±18, scale 1.1, shadow 0 60 80; t=2.0 y=6vh, same rot/scale/shadow |
| Settle flat | 2.0 to 5.5 s, ease cine, stagger 0.08, shadows tighten | start 2 end 5.5, stagger 0.08, ease cine, y 0, rotation 0, scale 1, shadow 0 8px 14px | t=3.5 first rot=-0.64, last rot=2.64 (same as 015); t=5.5 all y=0 rot=0 scale=1, shadow 0 8 14 |
| Loupe ring | 5.2 to 5.8 s, crimson, stroke 6, scale in | start 5.2 end 5.8, ease cine | border `6px rgb(179, 38, 30)`; t=5.5 scale 0.9613; t=6.0 scale 1 opacity 1 |
| Colour | last 0.6 s | filter to `grayscale(0) contrast(1)`, start 5.44 end 6.04, `sine.out` | mono set at t=0 is `grayscale(1) contrast(1.05)` |

Labels: glow 0, fall 0.5, land 2, settle 2, loupe 5.2, loupeEnd 5.8, colour 5.44, hold 6.04. Glow fades 6.04 to 6.44 (`power1.in`).

Verdict: **PASS** (0 frames off the 015 boundaries; limit 2).

Phone does not replace this export. Live phone scales the same beats by 4/6.04 (hold at 4 s) on the 2-column grid, and the fall distance is `-70vh` so the lower prints are already in frame at the first beat. Desktop stays at `-120vh`.

## On the page

Sheets: `qa/025-work-04B-05C-on-page/sheet-04B.jpg`, `sheet-05C.jpg`.

04B. The feature tile is span 6 of 12, about 50vw at 1440, centred in the first screen, with a neighbour on each side. While the ink plays, stills use `filter: grayscale(1) contrast(1.05)` and the WebGL canvas is hidden, then both ease back over 0.4 s when playback pauses or ends. The video stays in colour. The sheet column labeled 2.4 s is 1.5 s of playback, and the red cloud is already on that centre tile; the next columns are the full bloom. The crop is the tile's own cover of the 16:9 clip, so the clip's side prints are mostly outside the tile and the cloud sits in the middle of a wide cell. Neighbours are real Work photos. The header stays.

Phone: a coarse pointer's first tap plays the ink once at the tile's size and shows a "View series" button. A second tap, or that button, opens `/series/the-red-gown/`. The href stays on the link. The 60 percent in-view play from scene-video is unchanged.

05C. Desktop sheet column 1 (the 1.2 s column) shows black and white prints in the air, white borders, rotated, over the dark table. Column 0 is still the cold-visit splash, which lasts at most 0.8 s and does not hide `.site-reveal`. Later columns land the prints, and the last column warms them back to colour. A visit from another page of the site, or any `record=1` load, skips the splash.

The lamp is `radial-gradient` from `#3A2A1E` to `#0C0C0F` with the existing `/grain.png` grain. It is darker than the photographed lamp in the clip. Prints are Tina's real thumbnails, not the clip's generated prints. Borders and the lamp class come off when the entrance ends, so the resting catalog matches the tests.

Phone sheet: 8 prints, 2 columns, same fall. One phone screenshot timed out on the recapture, and the later phone frames landed close together, so that row is not an even 0 to 6 s spread. The airborne frames are still in the row.

## Seam gate

10/10. Output: `qa/025-work-04B-05C-on-page/seam-gate`.

```
01A-02A PASS worst_ssim=1.0000 timing_diffs=0
02A-03B PASS worst_ssim=1.0000 timing_diffs=0
03B-04B PASS worst_ssim=1.0000 timing_diffs=0
04B-05C PASS worst_ssim=1.0000 timing_diffs=0
05C-06B PASS worst_ssim=1.0000 timing_diffs=0
06B-07C PASS worst_ssim=1.0000 timing_diffs=0
07C-08B PASS worst_ssim=1.0000 timing_diffs=0
08B-09B PASS worst_ssim=1.0000 timing_diffs=0
09B-10A PASS worst_ssim=1.0000 timing_diffs=0
10A-11B PASS worst_ssim=1.0000 timing_diffs=0
VERDICT: PASS
```

## Seam routes

`seam_route_check.py`: 3/3. diffs=0. VERDICT: PASS.

```
PASS 01A-02A on /?record=1 diffs=0
PASS 02A-03B on /?record=1 diffs=0
PASS 04B-05C on /work/?record=1 diffs=0
```

`seam_route_visual.py` desktop (`route-visual`): 3/3 PASS.

| Seam | Worst step | Dark | Gold |
|---|---|---|---|
| 01A-02A | 6 | 0.27 | 0.27 |
| 02A-03B | 9 | 0.04 | 0.04 |
| 04B-05C | 10 | 0.04 | 0.12 |

Mobile (`route-visual-mobile`): 3/3 PASS.

| Seam | Worst step | Dark | Gold |
|---|---|---|---|
| 01A-02A | 9 | 0.49 | 0.50 |
| 02A-03B | 20 | 0.75 | 0.79 |
| 04B-05C | 0 | 0.25 | 0.21 |

## Production tests

`npm --prefix site run build` without `TC_MOTION_LAB`: 20 pages, no `/motion-lab/` output. `meta robots` is `noindex, nofollow` on `site/dist/index.html`.

`(cd site && PLAYWRIGHT_PORT=4831 npx playwright test)`: 75 passed, 129 skipped, 0 failed. Exit 0. Includes `laptop.spec.ts` and `phone-toolbar.spec.ts`.

## Reduced motion

No video request, no 05C timeline. Probe on `/work/` at 1440x900 (`shots/reduced.json`): video sources 0, preload `none`, video `display: none`, `.tile__scene-still` `display: block` with background `04B-end.webp`, `__SCENE_TL__['05C']` absent. Shot: `shots/reduced-1440-scroll0.jpg`.

## Bytes

Production BaseLayout client script is 86.22 kB, gzip 25.31 kB. Prompt 029 reported gzip 24.43 kB. Source gzip of the files this prompt touched grew by about 1.4 kB. Under the 15 kB gzip budget.

## Shots

`qa/025-work-04B-05C-on-page/shots/`:

- Desktop 1440x900: scroll 0 (record, resting grid), 05C record seeks at 0.5, 3.0 and 6.0 s, 04B hover start, mid and end.
- Mobile 390x844 DPR 3: record scroll 0 and 05C seeks, live fall, 04B tap start, mid and end (View series visible, ink at the tile).
- Reduced motion: `reduced-1440-scroll0.jpg`.

## Commit

```
fix(scene-04B-05C): ink drop at full size on a mono grid, real light-table fall, phone versions
```
