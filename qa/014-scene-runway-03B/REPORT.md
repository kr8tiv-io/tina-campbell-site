# 014-scene-runway-03B

Home runway band plays scene 03B (B-followspot) as a scroll-scrubbed video on the pinned 02A-03B stage. "The Runway" and the frame captions stay HTML. The photo strip sits after the pin and is marked when the clip reaches the hold. The curved WebGL strip on `/runway/` is unchanged.

## Scene gate

```
01A PASS worst=0.9748 (frame 95) mean=0.9773 bad=0/145 []
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145 []
VERDICT: PASS
```

Output: `qa/014-scene-runway-03B/scene-gate`. Re-run after the scrubber lock fix. Same worst frames.

## Seam gate

10/10. Output: `qa/014-scene-runway-03B/seam-gate`.

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

`seam_route_check.py`: 3/3. 01A-02A and 02A-03B on `/?record=1`, 04B-05C on `/work/?record=1`, diffs=0.

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
| 04B-05C | 7 | 0.21 | 0.19 |

02A-03B is wired on `/`: the followspot stage is the seam incoming. The harness timelines are unchanged. 03B-04B stays cross-route. Logged in `build-plan/OPEN-QUESTIONS.md` item 6 (20 Nov 2026). The seam is still not inserted on `/`. `/motion-lab/seams/03B-04B/` is unchanged.

## Production tests

`npm --prefix site run build` without `TC_MOTION_LAB`: 20 pages, no `/motion-lab/` output. `meta robots` is `noindex, nofollow`.

`(cd site && npx playwright test)`: 42 passed, 18 skipped, 0 failed.

## Scrub

The pin is the existing 02A-03B track (`top top` to `bottom bottom`, scrub 0.6, anticipatePin 1). Progress 0..1 maps to currentTime 0..6.0 s. Measured on `/?record=1` at 1440x900, forward and back:

| Progress | currentTime |
|---|---|
| 0 | 0 |
| 0.25 | 1.5 |
| 0.5 | 3.0 |
| 0.75 | 4.5 |
| 1 | 6.0 |

Desktop source is `03B-1080.webm`. At progress 1 the strip class is `is-handed`.

A paused scrub presents one frame per seek. `scene-video.ts` was waiting on `requestVideoFrameCallback` registered inside `seeked`, which never fires, so every seek after the first stayed queued. The helper now releases the lock on `seeked`. Loop playback for 01A is unchanged. The scene gate still seeks the element itself and does not run the ticker.

## Reduced motion

No pin, no scrub, no video request. The still is `03B-end.webp` with the same cover crop. Shot: `qa/014-scene-runway-03B/shots/reduced-1440-03B.jpg`.

## Bytes

BaseLayout client script is 63.58 kB, gzip 18.74 kB. Prompt 013 was 62.07 kB, gzip 18.23 kB. Added gzip is about 0.51 kB. `runway-followspot.ts` source is 3590 bytes, gzip 1383.

## Shots

`qa/014-scene-runway-03B/shots/`: desktop 1440x900 and mobile 390x844 DPR 3 at scroll 0 and at seam progress 0, 0.25, 0.5, 0.75, 1, forward and back, plus the handoff into the photo strip. Headless Chrome leaves a pinned video layer out of a page screenshot, so the progress and handoff JPEGs paint the decoded frame into a canvas for the capture only. The scene-gate frames are the SSIM proof.

## Commit

```
feat(scene-03B): runway followspot video scrubbed by the pinned runway stage
```
