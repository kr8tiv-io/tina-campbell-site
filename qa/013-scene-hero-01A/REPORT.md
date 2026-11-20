# 013-scene-hero-01A

Home hero plays scene 01A (A-living-gown) as a muted loop through `site/src/scripts/motion/scene-video.ts`. Title and caption stay HTML. Poster `01A-poster.webp` is the LCP image.

## Scene gate

```
01A PASS worst=0.9748 (frame 95) mean=0.9773 bad=0/145 []
VERDICT: PASS
```

Re-run after the poster inset CSS. Same worst frame. Output: `qa/013-scene-hero-01A/scene-gate`.

## Seam gate

10/10. Output: `qa/013-scene-hero-01A/seam-gate`.

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
| 02A-03B | 8 | 0.26 | 0.23 |
| 04B-05C | 10 | 0.04 | 0.12 |

Mobile (`route-visual-mobile`): 3/3 PASS.

| Seam | Worst step | Dark | Gold |
|---|---|---|---|
| 01A-02A | 1 | 0.32 | 0.42 |
| 02A-03B | 6 | 0.62 | 0.66 |
| 04B-05C | 7 | 0.21 | 0.19 |

The 1px poster inset is not applied on `?record=1` (that URL does not set `loader-skip` before paint), so seam geometry is unchanged. Scene gate was re-run after the inset and still passed.

## Production tests

`npm --prefix site run build` without `TC_MOTION_LAB`: no `/motion-lab/` pages. `meta robots` is `noindex, nofollow` (staging lock; foundation test expects it).

`(cd site && npx playwright test)`: 42 passed, 18 skipped, 0 failed.

## Hero

- Loop uses AV1 webm then H.264 mp4. Desktop requests `01A-1080.webm`. Width under 1000 requests `01A-720.mp4` only.
- `object-position` is `50% 50%`. At `max-width: 960px` it is `68% 50%`. On 390x844, cover shows about 26% of the 16:9 frame; 68% keeps the face and the gown inside the frame for the whole loop (frames 0, 72, 144).
- Reduced motion: no video request, still is `01A-end.webp` with the same crop. No pin, scrub, or split.
- Gate `?record=1&gate=01A`: 1080 source, overlays hidden, media unfiltered, `__SCENE_READY__.01A` after `loadedmetadata`.
- Added JS: `scene-video.ts` is 14066 bytes, gzip 4027. It is inside the existing BaseLayout client script (62.07 kB, gzip 18.23 kB).

## LCP

Chrome ignores an image whose box covers the whole viewport. A return visit skips the loader, so the full-bleed still was dropped and the header logo won. `html.hero-poster-inset` (set only when `loader-skip` is already on at parse) shortens the still by 1px. The shade covers that gap. First visits keep the full box; the loader fade records it just under the viewport, larger than the logo, and the video does not replace it.

| Load | LCP element | Size | Time |
|---|---|---|---|
| First visit 1440x900 | `img` `01A-poster.webp` | 1295998 | 2352 ms |
| Loader skipped 1440x900 | `img` `01A-poster.webp` | 1294560 | 304 ms |
| First visit 390x844 DPR 3 | `img` `01A-poster.webp` | 329159 | 2304 ms |
| Loader skipped 390x844 DPR 3 | `img` `01A-poster.webp` | 328770 | 204 ms |
| Reduced motion 1440 | `img` `01A-end.webp` | 1133280 | 200 ms |

First-visit time includes the signature loader (the reveal is held until it finishes).

## Bytes before first scroll

Transfer size after the hero has settled, no scroll:

| Viewport | Total | Scene media |
|---|---|---|
| 1440 | 1597147 | poster 55168; `01A-1080.webm` 772593 (starts ~2.3 s) |
| 390 DPR 3 | 1839316 | poster 55168; `01A-720.mp4` 841076 (starts ~2.3 s) |
| Reduced 1440 | 960834 | poster preload 55168; `01A-end.webp` 136280; no video |

## Shots

`qa/013-scene-hero-01A/shots/`: desktop 1440x900 and mobile 390x844 DPR 3 at scroll 0 and at 01A start (0.02 s), middle (3.02 s), and end (6.0 s). Plus `desktop-1440-reduced.png`.
