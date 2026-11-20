# 012c seam visual fix

Real-route pins now match the gold sequence. Home goes hero, ink, contact sheet, crimson flood, runway. Work goes the live grid, loupe, the incoming three-up. The hero does not return, and the work page does not end on an empty black stage.

The route visual gate was sampling geometry 1.5s after load, while the signature loader held ScrollTrigger until about 2.6s. Record mode (`?record=1`, which the gates use) now skips that hold. Ordinary visits still play the loader. Each seam track stays 320vh with a 100vh stage, so the pin ratio is 2.2 (scrub 0.6, anticipatePin 1).

## Sheets vs gold

Compared `route-visual/sheet-01A-02A.jpg`, `sheet-02A-03B.jpg`, and `sheet-04B-05C.jpg` with `build-plan-locked-2026-11-19/.gold/<pair>/p-*.jpg`.

- 01A-02A: resting hero, ink over the hero, then the real contact sheet. The hero does not come back.
- 02A-03B: contact sheet, crimson flood (the dark band above the flood at step 8 matches gold `p-040`), then the runway. The sheet does not return.
- 04B-05C: the live work grid, a growing loupe, then the incoming frames full-bleed. No footer and no black hold.

Wrapper length in the visual report is 3.2vh because the track is 320vh. The pin distance over the viewport is 2.2. Reduced motion adds no pin: home pair heights were 1211px and 486px, with no `is-seam-motion`.

## Commands

```
cd site && npm run check && npm run build && npx playwright test
```

`npm run check` (tsc) exited 0. Production `astro build` did not emit `/motion-lab/` routes. `noindex, nofollow` is on the built pages. Playwright:

```
18 skipped
42 passed (4.7m)
```

```
TC_MOTION_LAB=1 npm run build
npx astro preview --port 4821 --host 127.0.0.1
```

Motion-lab build: 30 pages, including the 10 seam harness routes.

```
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/012c-seams-visual-fix/seam-gate
```

```
PASS 01A-02A frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 02A-03B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 03B-04B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 04B-05C frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 05C-06B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 06B-07C frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 07C-08B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 08B-09B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 09B-10A frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 10A-11B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
VERDICT: PASS
SEAM_GATE_EXIT:0
```

```
python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821
```

```
PASS 01A-02A on /?record=1 diffs=0
PASS 02A-03B on /?record=1 diffs=0
PASS 04B-05C on /work/?record=1 diffs=0
VERDICT: PASS
ROUTE_CHECK_EXIT:0
```

```
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/012c-seams-visual-fix/route-visual
```

```
PASS 01A-02A worst step 6 dark 0.14 vs gold 0.27, len 3.2vh vs pin 2.2
PASS 02A-03B worst step 8 dark 0.26 vs gold 0.23, len 3.2vh vs pin 2.2
PASS 04B-05C worst step 10 dark 0.04 vs gold 0.12, len 3.2vh vs pin 2.2
VERDICT: PASS
ROUTE_VISUAL_EXIT:0
```

Shots: `qa/012c-seams-visual-fix/shots/` at 1440x900 and 390x844 (DPR 3), scroll 0 plus each seam start, middle, and end, plus reduced-motion stills of `/` and `/work/`.

## Verdict

PASS
