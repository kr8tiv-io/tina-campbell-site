# 018-scene-portraits-11B

11B scrubs on `/portraits-bridal-couples/`. The bridal chapter opens with the veil, full-bleed, between the portrait stills and the bridal stills. Scroll progress maps straight onto `currentTime`: the veil drifts through about 2.0 s, sweeps hard from about 3.0 s to 5.5 s, then brightens to the end. The chapter title is core SplitText (chars, mask, cine). Encoded media, gates, gold frames, and manifests were not edited.

Seam 10A-11B stays unwired. On this route the footer band (10A) follows the chapters. Logged in `build-plan/OPEN-QUESTIONS.md` item 12. The harness at `/motion-lab/seams/10A-11B/` is unchanged. Seams stayed 10/10.

## Scene gate

`--scenes 01A,03B,04B,06B,09B,10A,11B` against `http://127.0.0.1:4821`. Output: `qa/018-scene-portraits-11B/scene-gate`.

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

After the desktop pin was changed to `top top` and the veil to `100svh`, 11B alone was gated again (`scene-gate-11b-regate`). Same scores: worst 0.9662, mean 0.9772, bad 0/145. Gate mode returns before the pin is created, and `html.is-gate-11B` still forces the video to a fixed 100vw by 100vh frame. The later padding fix is on the other chapters, not the gate element.

## Seams

```
seam_gate: PASS 10/10 (01A-02A through 10A-11B, worst SSIM 1.0000, timing_diffs=0)
seam_route_check: PASS 3/3 (01A-02A, 02A-03B, 04B-05C, diffs=0)
seam_route_visual desktop: PASS 3/3
seam_route_visual --mobile: PASS 3/3
```

Desktop route visual worst steps: 01A-02A dark 0.44 vs gold 0.45, 02A-03B 0.04 vs 0.04, 04B-05C 0.04 vs 0.12. Mobile: 01A-02A 0.49 vs 0.50, 02A-03B 0.91 vs 0.79, 04B-05C 0.25 vs 0.21. Outputs: `qa/018-scene-portraits-11B/seam-gate`, `route-visual`, `route-visual-mobile`.

## On-page columns

Sheet: `qa/018-scene-portraits-11B/sheet-11B.jpg`. Capture: `cap/11B/`. The audit script walks `main` from progress 0 to 0.45 (six steps). Reference frames are clip frames 0, 29, 58, 87, 115, 144. Chapter 01 is pinned first, so the early columns are the portraits chapter. The veil itself is full-bleed on desktop. Manual shots cover the pin start, the hard sweep, and the bright end.

Desktop 1440x810:

| Column | Scroll | What is on screen | Difference from the clip |
|---|---|---|---|
| 0 | 0 | Page title and the first portraits still (`fb_137`) | Not the clip. `main` starts at the top of the page. |
| 1 | 0.09 | Portraits still (`fb_154`) and the chapter copy | Not the clip. Chapter 01 is still pinned. |
| 2 | 0.18 | Portraits still (`fb_127`) with the veil entering along the bottom | The clip is just arriving. |
| 3 | 0.27 | First bride, veil drifting. A sliver of the portraits still sits above the pin. | Early clip. HTML kicker. The step lands just before the pin locks to the viewport top. |
| 4 | 0.36 | Full-bleed first bride, "Ch. 02" and "Bridal" on the left scrim | Early clip, about the drift. The page adds the type and the ink scrim. |
| 5 | 0.45 | Full-bleed second bride, veil sweeping across her | Hard sweep, around the middle of the clip. The capture stops at 0.45 of `main`, so it does not reach the bright end. |

Phone 390x844. The band is not pinned. It is a full-width 16:9 strip (about 219px tall) so the wide frame keeps both brides. A 100svh phone crop would cut the second bride off the side.

| Column | What is on screen | Difference from the clip |
|---|---|---|
| 0 to 3 | Portraits chapter, stacked stills, then the copy | Not the clip. |
| 4 | Portraits copy, then the veil at full width with "Bridal", then the first bridal still | Start of the sweep. The strip is the width of the phone, not a thumbnail. |
| 5 | Full-width veil on the second bride, then the bridal stills (`fb_056`, `fb_061`) below | Mid sweep. Chapter stills sit under the clip. They are library frames, not frames baked out of the video. |

## Photos

No new library ids. The page still uses Portraits `fb_137`, `fb_154`, `fb_127`; Bridal `fb_056`, `fb_061`, `fb_109`; Couples `fb_007`, `fb_132`, `fb_135`. The veil is the encoded 11B media.

## Playback

Desktop pin is `top top`, `+=170%`, veil `100svh`. Measured at 1440x900: progress 0 / 0.5 / 1 at 0 s / 3.042 s / 6.063 s, box 1440x900 at the top of the viewport. The 1080 webm is not requested at scroll 0. The poster image is. The video request starts when the pin is reached, after idle.

Phone does not pin. Start `top 85%`, end `bottom 15%`. The 720 mp4 is requested after idle while the page is still at scroll 0, because the band (top about 1276) sits inside the `100%` root margin of an 844px viewport. That is the scene helper's existing rule, not a second loader.

Reduced motion: no video sources, still is `11B-end.webp`, title reads "Bridal". The poster and the end image are both requested (picture source plus img). Shot: `shots/reduced-portraits-11B.jpg`.

## Playwright

Production `npm --prefix site run build` (no `TC_MOTION_LAB`): 20 pages, `site/dist/motion-lab` absent, home HTML has `noindex` and no `/motion-lab/` link. Client chunk `BaseLayout...BrEnjD9B.js` 91.14 kB, gzip 26.79 kB. Prompt 017's production chunk was gzip 26.41 kB. Added about 0.38 kB gzip, under the 15 kB budget.

`PLAYWRIGHT_PORT=4831 npx playwright test`: 75 passed, 129 skipped, 0 failed (21.5m).

## Shots

`qa/018-scene-portraits-11B/shots/`. Chrome. Desktop 1440x900. Phone 390x844, DPR 3. Scroll 0 plus scene start, middle, and end on `/portraits-bridal-couples/`. One reduced-motion shot.

## Fixes

The first desktop shots left a sliver of the portraits still in the header slot, because the header hides on the way down and the veil was pinned below it. The veil is now `100svh`, `z-index: 2` (under the header), pinned at `top top`.

The portraits test then reported `scrollWidth` 1483 against `innerWidth` 1440. ScrollTrigger writes a pixel width on the pinned chapter, and a 3vw margin on that box stuck out past the viewport. The inset is padding now. After that, `scrollWidth` is 1440 and `scrollLeft` is 0. The veil pin positions did not move.

## Suggested commit

feat(scene-11B): portraits chapter veil wipe scrubbed video
