# 1080 scene prompts (run in order by build-plan/driver-1080.sh, one Grok job at a time, KR8TIV, grok-4.7 xhigh)

Shared context `_CONTEXT.md` is prepended to each prompt. Plan and evidence: `../../build-plan-locked-2026-11-19/SCENES-1080-PLAN.md`.

| # | Prompt | Scenes | Gate |
|---|---|---|---|
| 012b | seams-integrate | seams between real sections | 38 tests + seams 10/10 + route tables |
| 012c | seams-visual-fix | real-route seams match gold sequence | + seam_route_visual 3/3 |
| 013 | scene-hero-01A | 01A video loop + shared scene-video helper | scene_gate 01A + seams 10/10 |
| 014 | scene-runway-03B | 03B video scrub | scene_gate 01A,03B |
| 015 | scene-work-04B-05C | 04B video play, 05C code | + 04B, 05C timing |
| 016 | scene-editorial-06B-07C | 06B video scrub, 07C code | + 06B, 07C timing |
| 022 | scene-filmstrip-02A | 02A curved barrel strip, scroll scrubbed (gap rank 1) | checks.json 6/6 + side-by-side sheet vs clip + regression |
| 023 | about-hero-editorial-split | About top: ink panel + real BTS photo (gap rank 2) | regression + side-by-side vs 06B look |
| 024 | photo-library-spread | +23 clean FB photos, no repeats per page (PHOTO-PLAN.md) | photo-spread test + audit table |
| 025 | work-04B-05C-on-page | 04B full size on mono grid, real 05C fall, phone (ranks 3-4) | 04B >= 0.95 + on-page sheet |
| 026 | home-01A-03B-on-page | visible gown motion, clean mono followspot (ranks 6-7) | frame-diff + on-page sheet |
| 017 | scene-about-footer-09B-10A | 09B scrub, 10A loop | + 09B, 10A |
| 018 | scene-portraits-11B | 11B scrub | all 7 video scenes |
| 019 | scene-transitions-08B | 08B code | all + 08B order |
| 020 | mobile-pass | all | all + Lighthouse mobile |
| 021 | staging-refresh | release check | all |

After each PASS the operator commits, pushes the branch and refreshes staging (backup first, noindex kept).

## 20 Nov 2026 gap audit
Evidence and ranking: `../gap-audit-2026-11-20/GAP-LIST.md` (sheets `sheet-<ID>.jpg`, reference vs live staging b445e46) and
`../gap-audit-2026-11-20/PHOTO-PLAN.md`. Run order now: 016/016b re-gate (fresh browser per scene, scene_gate v1.1), then
022, 023, 024, 025, 026, 017, 018, 019, 020, 021. From 022 on every prompt also gates on an on-page side-by-side sheet made
with `../gap-audit-2026-11-20/tools/` (gate mode alone let 04B pass while it reads tiny on the page).
