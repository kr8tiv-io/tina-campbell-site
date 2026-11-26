# 026-home-01A-03B-on-page

Home plays 01A from the tucked frame through 6.04 s, then loops the living hem (frames 72 to 143). 03B keeps the seam flood through the bright red steps, then shows the followspot with no wash and no tint. Phone holds the lineup in a 16:9 band. Encoded media and the gates were not edited.

## Scene gate

`--scenes 01A,03B,04B`. Output: `qa/026-home-01A-03B-on-page/scene-gate`.

```
01A PASS worst=0.9774 (frame 95) mean=0.9794 bad=0/145
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145
04B PASS worst=0.9531 (frame 1) mean=0.9597 bad=0/145
VERDICT: PASS
```

04B is unchanged from 025 (worst 0.9531, frame 1). Gate mode does not run the gown loop or the clean-spot class, so seeks stay on the 1080 source at a neutral transform.

## Frame difference (01A)

Mean absolute luma difference, 0 to 255, between frames one second apart. The 6 s window is t = 0, 1, 2, 3, 4, 5, 5.85. Samples are paused seeks on the live page (`frame-diff/`), not the audit tool's 4.5 s delay.

| Window | Desktop 1440x900 | Phone 390x844 |
|---|---|---|
| Full viewport, 6 s mean | 3.55 (peak step 6.49, t 1 to 2) | 3.84 (peak 5.18) |
| Gown band, below the header and above the title | 5.66 (peak 10.51) | 6.37 (peak 8.72) |
| Dress region only (left 72%, y 12% to 62%) | 8.32 (peak 15.98) | |
| Loop only, t 3.00 to 5.85, full viewport | 2.65 | 2.97 |
| t = 0 versus t = 2, dress region | 21.42 | |

Master clip, same 1 s steps, luma: full frame mean 5.00 (steps 4.19, 8.81, 4.10, 3.65, 5.07, 4.17). Top 71% (the picture above the clip's black bar) mean 6.89 (steps 5.35, 12.34, 5.72, 5.07, 7.09, 5.78).

The 6 s mean does not reach 10. The encoded clip's own 6 s mean is 5.0 full frame and 6.9 on the gown. The page dress region peaks at 16 for the one second of the sweep (t 1 to 2) and averages 8.3 across the whole clip, because seconds 3 to 6 are the living ripple. Playback stays at 1x. A faster rate or a re-encode would clear 10 and would break the lock. That is the blocker for the numeric bar. The visible sweep is on the page: `frame-diff/desktop/t0.00.jpg` has the hem down, `t2.00.jpg` has it up in a full arc.

Loop window: frames 72 to 143 (3.00 s to 5.958 s). On a 160 px body crop of the master, that join is the closest pair at or above 3 s (mean abs about 6.8). Longer windows that include the one-way sweep jump harder. After the intro the page sets `data-gown-phase=loop` and seeks to 3.00 s. Native `loop` is forced off so the browser does not restart at the tucked frame.

## On the page

Sheets: `sheet-01A.jpg`, `sheet-03B.jpg`. The audit capture waits 4.5 s after load, then samples. It does not show video t = 0.

01A, audit columns at wall clock 0, 1, 2, 3, 4.5, 6 s after that wait. Column 0 is already the billowed pose (the sweep has been playing since the loader released, about 2 s earlier). Later columns sit in the living ripple, which is why a capture that starts late still reads as a small shimmer (diffs in the 2 to 6 range). The tucked start is `shots/desktop-1440-01A-t0.jpg`. Title and the line "No. 001 / Alberta Legislature, Edmonton" stay HTML. Phone crop is the existing hero position (face and gown). Reduced motion shows the end still, text readable, and does not download the video (`shots/reduced-home-scroll0.jpg`).

03B, audit scroll on `[data-seam-pair="02A-03B"]` from progress 0.35 to 1.0:

| Column | Progress | What is on screen |
|---|---|---|
| 0 | 0.35 | Filmstrip still in frame. Red flood entering along the bottom. Seam colour, not a grade on the clip. |
| 1 | 0.48 | Full red field. The seam owns this step. Route visual step 9 is dark 0.04 against gold 0.04, so the flood has to stay. |
| 2 | 0.61 | Clean mono lineup, one red gown, hard spot. Copy "The Runway" is HTML. Confirmed on the desktop frame. |
| 3 | 0.74 | Same picture, spot further along the line. No full-frame red. |
| 4 | 0.87 | Spot holds on the red gown and the neighbours stay mono. |
| 5 | 1.00 | End of the pin. Clean clip, no wash. |

Phone from column 2: a 16:9 band, object-position 50% 46%, only after the spot is clean. Five models stay in frame. The stage above and below the band is ink `#0C0C0F`. "The Runway" sits under the band as HTML. During the red flood the media stays full-bleed, so the seam colour covers the stage. A portrait cover that keeps only two figures is what the clean state replaces. Gate mode (1280x720, `is-scene-gate`) does not use the band. Reduced motion uses the band on the end still, because there is no flood.

The followspot class turns on at scroll progress 0.58. Before that the flood and the incoming blur are the seam. The shade over the floor is 18% tall at 0.5 alpha, down from 38% at 0.78, so the beam stays and the picture is not veiled. The first phone pass put the band on for the whole pin. At progress 0.50 the fading flood then showed the black stage and the bright-pixel share dropped to 0.281 (floor 0.30) in `laptop.spec.ts`. Limiting the band to `.is-spot-clean` puts that check back over 0.30. Mobile route visual was re-run after that change.

## Seam gate

10/10. Output: `qa/026-home-01A-03B-on-page/seam-gate`.

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

| Pair | Worst step | Dark | Gold |
|---|---|---|---|
| 01A-02A | 7 | 0.44 | 0.45 |
| 02A-03B | 9 | 0.04 | 0.04 |
| 04B-05C | 10 | 0.04 | 0.12 |

Mobile (`route-visual-mobile`, 390x844): 3/3 PASS.

| Pair | Worst step | Dark | Gold |
|---|---|---|---|
| 01A-02A | 9 | 0.49 | 0.50 |
| 02A-03B | 20 | 0.91 | 0.79 |
| 04B-05C | 7 | 0.23 | 0.19 |

02A-03B on the phone is darker at the last step because the lineup is a 16:9 band and the rest of the portrait stage is black. Delta 0.12, inside the 0.20 slack. The red flood steps stay as bright as the gold. These mobile numbers are from the re-run after the band was limited to the clean spot. Desktop was unchanged by that portrait rule.

## Playwright

Production `npm --prefix site run build` (no `TC_MOTION_LAB`): 19 pages, `site/dist/motion-lab` absent. Client chunk `BaseLayout...D34YAKKL.js` 87.47 kB, gzip 25.86 kB. `living-gown.ts` is 2939 bytes, gzip 1143. Under the 15 KB budget.

`PLAYWRIGHT_PORT=4831 npx playwright test` on the production build: first run 73 passed, 2 failed, 129 skipped (23.7m).

The two failures are not in the gown or followspot code:

- `[desktop] editorial.spec.ts` portraits bridal couples expected "Staircases, glass and great light." That sentence is in the HTML. Chapter copy starts at `autoAlpha: 0` until its ScrollTrigger plays, so `innerText` can miss it. Prompt 029 recorded the same flake. Retry passed.
- `[desktop] work.spec.ts` record hover ripple hit a 120s timeout on `page.goto(/work/)` while the suite was already 20 minutes in. Retry passed.

Retry of those two tests: 5 passed, 3 skipped, 0 failed (29.8s).

Combined: 75 passed, 129 skipped, 0 failed. Above the 42 passed floor.

## Shots

`qa/026-home-01A-03B-on-page/shots/`. Chrome. Desktop 1440x900. Phone 390x844, DPR 3.

Scroll 0, 01A start / mid / end, 03B start (progress 0.02), mid (0.50, flood still up), clean (0.72), end (0.98), plus `desktop-1440-01A-t0.jpg` and `desktop-1440-01A-t2.jpg`. Reduced: `reduced-home-scroll0.jpg` and `reduced-03B-reduced.jpg`.

## Commit message

```
fix(scene-01A-03B): visible gown motion on the page, clean mono followspot
```

Not committed. The operator commits.
