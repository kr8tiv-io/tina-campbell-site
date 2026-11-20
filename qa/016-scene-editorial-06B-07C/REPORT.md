# 016-scene-editorial-06B-07C

`/fashion-editorial/` scrubs scene 06B (B-crimson-thread) from the existing pinned split. A DOM hairline tracks that same progress. `/series/<slug>/` plays scene 07C (C-print-stack) as a GSAP step per real series photo. Copy stays HTML. 05C, 06B and 07C are on three routes, so seams 05C-06B and 06B-07C stay unwired.

## Scene gate

Required command: `--scenes 01A,03B,04B,06B`. That single Chrome run does not pass.

The tool deletes each scene's frame directory at the start of a capture, and it overwrites `scene-gate/REPORT.md` on every invocation. The file on disk is the last command, a solo 06B pass. The `scores.json` files are from the restored AV1 build after the combined runs were abandoned.

Combined `--scenes 01A,03B,04B,06B` (three attempts, helper restored after each):

| Attempt | 01A / 03B / 04B | 06B |
|---|---|---|
| 1. Shared helper, AV1 then H.264 | PASS, same SSIM as the rows below | FAIL. `Page.wait_for_function` 30s. `__SCENE_READY__['06B']` never set. worst 0.0, frame -1. No diffs. |
| 2. Gated video called `load()` before the manifest fetch | PASS | FAIL. `Page.goto` networkidle 60s. A media request stayed in flight, so the gate never reached the ready wait. |
| 3. Gated source forced to H.264 only | PASS, but the numbers moved (01A worst 0.9773, 03B 0.9661, 04B 0.9555) | FAIL. Same 30s ready timeout. |

Both helper edits were reverted. `scene-video.ts` again attaches AV1 webm, then H.264, and sets `__SCENE_READY__` on `loadedmetadata`.

Restored-webm commands, separate Chromes:

```
01A PASS worst=0.9748 (frame 95) mean=0.9773 bad=0/145
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145
04B PASS worst=0.9531 (frame 1) mean=0.9597 bad=0/145
06B PASS worst=0.9816 (frame 5) mean=0.9906 bad=0/145
```

01A, 03B and 04B are one command (`--scenes 01A,03B,04B`). 06B is `--scenes 06B` on its own. Each video is 1920x1080, duration 6.084 s, object-fit cover, object-position 50% 50%, transform none, filter none, rect 1280x720.

Blocker, after the three attempts: in one Chrome, 06B does not become ready inside 30s once that browser has already captured 01A, 03B and 04B (about 435 frames). A fresh browser sets `__SCENE_READY__['06B']` in about 1s, including after a short visit to the 04B gate. Fonts are already `loaded`. Skipping the font wait was not applied. The gate script, gold frames and encoded media were not edited.

06B is `video[data-scene-video="06B"]` with `data-scene-mode="scrub"`, through `scene-video.ts`. Gate mode moves that video to `document.body` and `html.is-gate-06B` pins it to `position: fixed; inset: 0` so a pinned ancestor cannot shrink the frame. The still and the hairline are `display: none` in that mode. Colour from 1.0 s to 5.5 s stays inside the encoded clip.

## 06B hairline

The fashion pin (`[data-fe-split]`) still owns the scroll distance. `editorial-thread.ts` reads that pin's progress and scrubs the video to the same value. The hairline is an SVG path `M720 0 L720 810` (`viewBox` 1440x810, `preserveAspectRatio="none"`, non-scaling stroke, crimson `#B3261E`) with `data-scene-overlay`. DrawSVG is `0%` to `progress * 100%`, so the tip sits at progress times the scene height. From progress 0.9 the line fades and `is-thread-late` returns the static rule and the photo column. Desktop text stays above the scene. Mobile (no pin) uses a non-pin ScrollTrigger, `top 75%` to `bottom 25%`.

## 07C timeline

Exported from `window.__SCENE_TL__['07C']` on `/series/the-red-gown/?record=1` at 1280x720. Dump: `qa/016-scene-editorial-06B-07C/shots/timeline.json`. One step is 6.04 s. Labels: hold 0, slide 1, slideEnd 2, settle 5.5, driftEnd 6.04. Tolerance is 2 frames (0.083 s). Every boundary lands on the table (0 frames off).

| Beat | Spec | Timeline | Sample |
|---|---|---|---|
| Hold | 0 to 1.0 s, small drift | top print `sine.out` to xPercent 4, yPercent -6, rotation 2.2 | t=0 xP 6 yP -4 rot 3; t=1.0 xP 4 yP -6 rot 2.2. Next still xP 10 yP 16 rot 8 scale 0.92 blur 8px |
| Slide | 1.0 to 2.0 s, strongest beat | `power2.inOut` to xPercent -40, yPercent -30, rotation -8, shadow 0 46px 64px | t=2.0 top xP -40 yP -30 rot -8 |
| Straighten | 1.0 to 5.5 s, ease cine | next print to x 0, y 0, rotation 0, scale 1, blur 0 | t=5.5 next xP 0 yP 0 rot 0 scale 1 blur 0. Back xP -10 yP 6 rot -2 scale 0.98 |
| Settle | 2.0 to 5.5 s | top continues to xPercent -48, yPercent -36, rotation -10, shadow 0 16px 26px | t=5.5 top xP -48 yP -36 rot -10 |
| Drift | 5.5 to 6.04 s | top rotation -8.5, next 1.4, back -0.6, `sine.inOut` | t=6.04 those rotations, positions unchanged |

Record mode builds one paused step and does not pin. Production desktop (width over 960, fine pointer) pins the cover for one viewport per photo, stride 6.08 s so steps do not overlap. The loose-start CSS transform is cleared before GSAP records xPercent, because GSAP adds xPercent on top of an existing translate. Shadows are CSS only. Reduced motion and fewer than three photos skip the timeline. The Red Gown has four prints.

Side-by-sides (clip frame on the left, `/series/the-red-gown/?record=1` seek on the right, 1280x720):

- `qa/016-scene-editorial-06B-07C/shots/07C-sbs-0.0.jpg`
- `qa/016-scene-editorial-06B-07C/shots/07C-sbs-0.5.jpg`
- `qa/016-scene-editorial-06B-07C/shots/07C-sbs-1.0.jpg`
- `qa/016-scene-editorial-06B-07C/shots/07C-sbs-2.0.jpg`
- `qa/016-scene-editorial-06B-07C/shots/07C-sbs-3.5.jpg`
- `qa/016-scene-editorial-06B-07C/shots/07C-sbs-5.5.jpg`
- `qa/016-scene-editorial-06B-07C/shots/07C-sbs-6.0.jpg`

At 0 s the stack is loose and the top print is in front. By 2.0 s that print has slid up and left. By 5.5 s the next print is sharp and centred, and 6.0 s is the small rotation drift. The page uses the series' real photos, with the title and the header still in frame, so the comparison is the motion.

## Seams

05C is `/work/`. 06B is `/fashion-editorial/`. 07C is `/series/<slug>/`. The pairs are not on one route, so `seams.ts` was not changed. `build-plan/OPEN-QUESTIONS.md` items 7 and 8 record that (20 Nov 2026).

Seam gate 10/10. Output: `qa/016-scene-editorial-06B-07C/seam-gate`.

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

`seam_route_check.py`: 3/3. 01A-02A and 02A-03B on `/?record=1` diffs=0. 04B-05C on `/work/?record=1` diffs=0. VERDICT: PASS.

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

`npm run check` (`tsc --noEmit`): exit 0.

`npm --prefix site run build` without `TC_MOTION_LAB`: 20 pages, no `dist/motion-lab/`. `meta robots` is `noindex, nofollow` on `site/dist/index.html`.

`(cd site && npx playwright test)`: 42 passed, 18 skipped, 0 failed. Exit 0. An earlier run in the same session had one desktop timeout on `seams-integrate.spec.ts` (`loader-skip` on `/` within 8s, right after the motion-clip encodes). That test passed alone in 4.2s, and the full suite then passed clean.

## Reduced motion

No video request, no pin, no scrub, no 07C timeline. Probe on `/fashion-editorial/` at 1440x900: video sources 0, preload `none`, video `display: none`, still `06B-end.webp`, `.fe-thread` `display: none`, no pinned split, `__SCENE_TL__['06B']` absent. Shot: `qa/016-scene-editorial-06B-07C/shots/reduced-fashion.png`.

`/series/the-red-gown/` at 1440x900 with reduced motion: `print-live` absent, `__SCENE_TL__['07C']` absent, no pin. The first print's computed transform is the settled end (about -8.5 deg and the up-left translate).

## Bytes

Production BaseLayout client script is 72.25 kB (72246 bytes), gzip 20.86 kB (20859 bytes). Prompt 015 reported 67.44 kB (67435 bytes), gzip 19.66 kB (19655 bytes). Added gzip is 1.20 kB (1204 bytes). Source: `editorial-thread.ts` 3525 bytes, gzip 1277; `print-stack.ts` 6072 bytes, gzip 2029. `scene-video.ts` was reused, not forked. Under the 15 KB gzip budget.

## Shots

`qa/016-scene-editorial-06B-07C/shots/`:

- Desktop 1440x900 fashion: scroll 0, pin start (same frame as scroll 0; the split starts at the top), pin middle (hairline up, index 02), pin end (photo column back, index 05).
- Mobile 390x844 DPR 3 fashion: scroll 0, start and middle (the non-pin range is already inside the first screen, so those three frames match), end scrolled into the column.
- Desktop and mobile series: scroll 0 and pin start match (the cover is the scene). Middle and end are later steps. The Red Gown's last step brings the first print back to centre, which is the wrap of one step per photo.
- Reduced motion: `reduced-fashion.png`.
- 07C side-by-sides listed above.

Headless Chrome often omits the decoded video layer from a page screenshot. The 06B SSIM proof is the scene-gate frames, not the fashion page shots.

## Commit

```
feat(scene-06B-07C): editorial crimson thread scrub and series print stack
```
