# 021-staging-refresh

Release check on a production build (`TC_MOTION_LAB` unset) plus the shared gates on a motion-lab preview at `http://127.0.0.1:4821`. One fix: the 404 canonical target is `/404.html`. Details and the weight table are in `RELEASE.md`.

## Scene gate

`--scenes 01A,03B,04B,06B,09B,10A,11B`. Output: `qa/021-staging-refresh/scene-gate`.

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

## Seams

```
seam_gate: PASS 10/10 (01A-02A through 10A-11B, worst SSIM 1.0000, timing_diffs=0, bad=0, frames=101)
seam_route_check: PASS 3/3 (01A-02A, 02A-03B on /?record=1; 04B-05C on /work/?record=1; diffs=0)
seam_route_visual desktop: PASS 3/3
seam_route_visual --mobile: PASS 3/3
```

Desktop worst steps: 01A-02A dark 0.44 vs gold 0.45, 02A-03B 0.04 vs 0.04, 04B-05C 0.04 vs 0.12. Mobile: 01A-02A 0.49 vs gold 0.50, 02A-03B 0.91 vs 0.79, 04B-05C 0.25 vs 0.21. Reported pin length is 3.2vh against a gold pin of 2.2 on every seam.

## Playwright

Production build, `PLAYWRIGHT_PORT=4831`: 75 passed, 129 skipped, 0 failed (18.8m). `qa/021-staging-refresh/playwright.txt`.

## Staging checks 1-6

All PASS. Evidence: `qa/021-staging-refresh/checks.json` and `weight-table.md`. Heaviest first view is `/work/` at 1,505,936 bytes. No route is over 2.5 MiB. No `motion-lab` in `dist`.

GATE 021-staging-refresh: PASS
