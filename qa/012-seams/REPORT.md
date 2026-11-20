# 012 seams port

Locked seam runtime is `site/src/scripts/motion/seams.ts`, mounted by `initSeams` on `[data-seam]`. GSAP, ScrollTrigger, SplitText, DrawSVG, CustomEase, and the `cine` ease register once in `site/src/scripts/motion/runtime.ts`. Lenis stays in `core.ts` and is skipped when `?record=1`. Three is not imported by the seam runtime.

Harness pages are `/motion-lab/seams/<id>/` and are emitted only when `TC_MOTION_LAB=1`. Real routes that already contain both scenes: home `01A-02A` and `02A-03B`, work `04B-05C`. The other seven pairs are logged in `build-plan/OPEN-QUESTIONS.md` (items 6-12).

One iteration: `10A-11B` wrapped "Portraits, Bridal and Couples" one line early when SplitText ran before Instrument Serif finished loading. Split now waits for `document.fonts.ready`, then builds the timeline and sets `__PROTO_READY__`.

## npm run check

```
> check
> tsc --noEmit --pretty false
```

Exit 0.

## TC_MOTION_LAB=1 npm run build

Exit 0. Static routes include all 10 harness pages:

```
src/pages/motion-lab/seams/[id].astro
  /motion-lab/seams/01A-02A/index.html
  /motion-lab/seams/02A-03B/index.html
  /motion-lab/seams/03B-04B/index.html
  /motion-lab/seams/04B-05C/index.html
  /motion-lab/seams/05C-06B/index.html
  /motion-lab/seams/06B-07C/index.html
  /motion-lab/seams/07C-08B/index.html
  /motion-lab/seams/08B-09B/index.html
  /motion-lab/seams/09B-10A/index.html
  /motion-lab/seams/10A-11B/index.html
```

30 pages built. Preview served that dist on `http://127.0.0.1:4821`. The preview process was stopped after the gate.

## seam_gate.py

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
```

Exit 0. Full table: `qa/012-seams/gate/REPORT.md`.

## Production build (no TC_MOTION_LAB)

Exit 0. `src/pages/motion-lab/seams/[id].astro` emitted no paths. 20 pages built. `site/dist/motion-lab` is absent. `site/dist/sitemap-0.xml` has no `/motion-lab/` URL.

Home dist HTML has `data-seam="01A-02A"` and `data-seam="02A-03B"`. Work dist HTML has `data-seam="04B-05C"`.
