# 012b seams integrate

Seams on `/` and `/work/` run between the real sections. Harness pages are unchanged and still build only with `TC_MOTION_LAB=1`. Prototype `<Seam>` blocks are gone from the real routes. Each page has one `h1`. Real-route media does not point at `/motion-lab/`.

Wired pairs: home `01A-02A` (hero to category band) and `02A-03B` (category band to runway); work `04B-05C`. Timeline tweens, eases, staggers, and pin config match the locked builders. Decorative ink, flood, and loupe layers are `aria-hidden`. Ghost titles are not headings.

## Production build, leak check, types

`npm run check` (tsc) exited 0.

Production `npm run build` (no `TC_MOTION_LAB`) exited 0. `noindex, nofollow` is on the built pages.

```
no motion-lab refs in dist
```

That grep ran on the production `dist` before the lab rebuild below. The lab build intentionally emits `/motion-lab/seams/<id>/`.

## Playwright

`npx playwright test` against the production preview:

```
  18 skipped
  42 passed (5.3m)
EXIT:0
```

0 failed. Skipped count is the same 18 as base `ca39b72`. The four extra passes are `site/tests/seams-integrate.spec.ts` (one `h1`, no horizontal overflow, no `/motion-lab/` in the HTML) on desktop, mobile, small, and reduced. Existing tests were not edited or skipped.

`seams.ts` gzip grew from 4834 to 6822 bytes against HEAD. Under the 15 KB gzip budget.

## Lab build and gates

`TC_MOTION_LAB=1 npm run build` exited 0 and emitted all 10 `/motion-lab/seams/<id>/` pages. Preview: `http://127.0.0.1:4821/`.

`python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/012b-seams-integrate/seam-gate`

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
EXIT:0
```

`python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821`

```
PASS 01A-02A on /?record=1 diffs=0
PASS 02A-03B on /?record=1 diffs=0
PASS 04B-05C on /work/?record=1 diffs=0
VERDICT: PASS
```

## Screenshots

`qa/012b-seams-integrate/shots/`. Chrome `/usr/bin/google-chrome`. Desktop 1440x900. Mobile 390x844 at device scale 3. Reduced motion: `reduced-1440-home.png`.

| Seam | before | middle | after |
|---|---|---|---|
| 01A-02A | hero, title readable | ink covers the hero | hero at the end of the pin |
| 02A-03B | pinned flood stage | pinned flood stage | pinned flood stage |
| 04B-05C | pinned stage | crimson loupe | pinned stage |

`desktop-1440-work-top.png` is the resting work page: one `h1` ("Work"), 70 frames, filters, no overflow (`scrollWidth` 1440).

The 02A-03B and 04B-05C pins sit between the real sections. At progress 0 the next section is still hidden by the locked `autoAlpha` set, so the viewport during the pin is the decorative stage (ink, flood, or loupe), not a second copy of the section. Resting `/work/` and the hero stay visible. Reduced motion does not pin or hide the hero.

## Commit message (not committed)

```
fix(seams): run seams between the real sections; one h1, no overflow, production media paths (38 tests green)
```
