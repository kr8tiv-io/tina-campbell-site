# 015-scene-work-04B-05C

`/work/` plays scene 04B (B-crimson-ink-drop) on the centre feature tile and runs scene 05C (C-light-table-drop) as a GSAP entrance on the opening eight Work thumbnails. Copy stays HTML. Seam 04B-05C stays on the same route.

## Scene gate

`--scenes 01A,03B,04B`. Output: `qa/015-scene-work-04B-05C/scene-gate`.

```
01A PASS worst=0.9748 (frame 95) mean=0.9773 bad=0/145
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145
04B PASS worst=0.9531 (frame 1) mean=0.9597 bad=0/145
VERDICT: PASS
```

04B is `video[data-scene-video="04B"]` with `data-scene-mode="play"`, wired through `scene-video.ts`. Gate mode lifts that video to `position: fixed; inset: 0` with `object-fit: cover` so the gate records the full 16:9 frame. The still under the video is a CSS background on `.tile__scene-still`, so the feature tile still has one `img` (the real photo).

05C is code. It has no scene-gate SSIM. The timing check is below.

## 05C timeline

Exported from `window.__SCENE_TL__['05C']` on `/work/?record=1` at 1280x720. Dump: `qa/015-scene-work-04B-05C/shots/timeline.json`. Duration 6.44 s. Tolerance is 2 frames (0.083 s). Every boundary lands on the table (0 frames off).

| Beat | Spec | Timeline | Sample |
|---|---|---|---|
| Empty table glow | 0 to 0.5 s | glow `sine.out` autoAlpha 1, start 0 end 0.5 | t=0.5 glow opacity 1, prints y=-120vh, ring scale 0 |
| Prints fall | 0.5 to 2.0 s, y -120vh, rotate ±18, scale 1.1, shadow 0 60px 80px | 8 prints, `power2.out`, y to 6vh, start 0.5 end 2.0 | t=1.0 y=-31.33vh, rot ±18, scale 1.1, shadow 0 60 80; t=2.0 y=6vh, same rot/scale/shadow |
| Settle flat | 2.0 to 5.5 s, ease cine, stagger 0.08, shadows tighten | start 2 end 5.5, stagger 0.08, ease cine, y 0, rotation 0, scale 1, shadow 0 8px 14px | t=3.5 first print y=1.92 rot=-0.64, last print y=7.92 rot=2.64; t=5.5 all y=0 rot=0 scale=1, shadow 0 8 14 |
| Loupe ring | 5.2 to 5.8 s, crimson, stroke 6, scale in | start 5.2 end 5.8, ease cine, scale 1, autoAlpha 1 | border `6px rgb(179, 38, 30)`; t=5.5 scale 0.9613; t=6.0 scale 1 opacity 1 |

Labels: glow 0, fall 0.5, land 2, settle 2, loupe 5.2, loupeEnd 5.8, hold 6.04. Glow fades 6.04 to 6.44 (`power1.in`).

Verdict: **PASS** (0 frames off; limit 2).

Side-by-sides (clip frame on the left, `/work/?record=1` seek on the right, 1280x720):

- `qa/015-scene-work-04B-05C/shots/05C-sbs-0.5.jpg`
- `qa/015-scene-work-04B-05C/shots/05C-sbs-1.0.jpg`
- `qa/015-scene-work-04B-05C/shots/05C-sbs-2.0.jpg`
- `qa/015-scene-work-04B-05C/shots/05C-sbs-3.5.jpg`
- `qa/015-scene-work-04B-05C/shots/05C-sbs-5.5.jpg`
- `qa/015-scene-work-04B-05C/shots/05C-sbs-6.0.jpg`

At 0.5 s the page is the empty glowing table, which is the 0 to 0.5 s beat. From 1.0 s the prints are in frame, rotated, with the long shadow, then they flatten into the masonry slots and the crimson ring scales onto the centre tile. The page uses Tina's real Work thumbnails, so the comparison is the motion, not a pixel match to the generated clip.

Record mode builds the timeline paused, assigns `__SCENE_TL__['05C']`, then clears the from-values so the resting grid matches the pre-entrance page. Production plays from 0. `html.work-intro` stays until the timeline finishes, so the existing Work tests still wait out the entrance. While it plays, `html.is-light-table` hides the WebGL canvas and shows the DOM prints. Under 801 px and under reduced motion the timeline is not built.

## Seam gate

10/10. Output: `qa/015-scene-work-04B-05C/seam-gate`.

```
01A-02A A-ink-bleed-down PASS worst_ssim=1.0000 timing_diffs=0
02A-03B C-magenta-flood PASS worst_ssim=1.0000 timing_diffs=0
03B-04B A-catwalk-to-grid PASS worst_ssim=1.0000 timing_diffs=0
04B-05C C-loupe-assemble PASS worst_ssim=1.0000 timing_diffs=0
05C-06B A-print-to-column PASS worst_ssim=1.0000 timing_diffs=0
06B-07C C-magazine-close PASS worst_ssim=1.0000 timing_diffs=0
07C-08B C-ink-curtain-wipe PASS worst_ssim=1.0000 timing_diffs=0
08B-09B C-city-iris PASS worst_ssim=1.0000 timing_diffs=0
09B-10A B-layers-settle PASS worst_ssim=1.0000 timing_diffs=0
10A-11B B-band-lifts-chapter PASS worst_ssim=1.0000 timing_diffs=0
VERDICT: PASS
```

## Seam routes

`seam_route_check.py`: 3/3. 01A-02A and 02A-03B on `/?record=1`, 04B-05C on `/work/?record=1`, diffs=0. Re-checked after the 05C fall ease landed. VERDICT: PASS.

`seam_route_visual.py` desktop (`route-visual`): 3/3 PASS.

| Seam | Worst step | Dark | Gold |
|---|---|---|---|
| 01A-02A | 5 | 0.50 | 0.51 |
| 02A-03B | 9 | 0.04 | 0.04 |
| 04B-05C | 10 | 0.04 | 0.12 |

Mobile (`route-visual-mobile`): 3/3 PASS.

| Seam | Worst step | Dark | Gold |
|---|---|---|---|
| 01A-02A | 1 | 0.32 | 0.42 |
| 02A-03B | 7 | 0.49 | 0.48 |
| 04B-05C | 7 | 0.23 | 0.19 |

## Production tests

`npm --prefix site run build` without `TC_MOTION_LAB`: 20 pages, no `/motion-lab/` output. `meta robots` is `noindex, nofollow`. Confirmed on `site/dist/index.html`.

`(cd site && npx playwright test)`: 42 passed, 18 skipped, 0 failed. Exit 0.

## Reduced motion

No video request, no pin, no scrub, no 05C timeline. Probe on `/work/` at 1440x900 (`shots/reduced.json`): video sources 0, preload `none`, video `display: none`, `.tile__scene-still` `display: block` with background `04B-end.webp`, photo `img` still the real avif, loupe ring opacity 1 and transform none, table glow opacity 1, `__SCENE_TL__` absent. Shot: `qa/015-scene-work-04B-05C/shots/reduced-1440-scroll0.jpg`.

## Bytes

BaseLayout client script is 67.44 kB (67435 bytes), gzip 19.66 kB (19655 bytes). Prompt 014 reported 63.58 kB, gzip 18.74 kB. Added gzip is about 0.92 kB. Source: `work-ink.ts` 3024 bytes, gzip 1072; `work-lighttable.ts` 4627 bytes, gzip 1761. Under the 15 KB gzip budget.

## Shots

`qa/015-scene-work-04B-05C/shots/`:

- Desktop 1440x900: scroll 0 after the entrance, record-mode scroll 0 (resting grid), 04B keyboard focus, 04B hover (decoded frame painted to a canvas; headless Chrome omits the video layer from a page screenshot; currentTime about 2.13 s, source `04B-1080.webm`), 05C record seeks at 0.5, 3.5 and 6.0 s, plus a live production frame mid-fall.
- Mobile 390x844 DPR 3: scroll 0, keyboard focus, mid scroll, end scroll. Below 801 px the light-table timeline does not run.
- Reduced motion: `reduced-1440-scroll0.jpg`.
- 05C side-by-sides listed above.

Scene-gate frames are the 04B SSIM proof.

## Commit

```
feat(scene-04B-05C): work hover ink video and light-table entrance
```
