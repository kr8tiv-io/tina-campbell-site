# 1080 scene prompts (run in order by build-plan/driver-1080.sh, one Grok job at a time, KR8TIV, grok-4.7 xhigh)

Shared context `_CONTEXT.md` is prepended to each prompt. Plan and evidence: `../../build-plan-locked-2026-11-19/SCENES-1080-PLAN.md`.

| # | Prompt | Scenes | Gate |
|---|---|---|---|
| 012b | seams-integrate | seams between real sections | 38 tests + seams 10/10 + route tables |
| 013 | scene-hero-01A | 01A video loop + shared scene-video helper | scene_gate 01A + seams 10/10 |
| 014 | scene-runway-03B | 03B video scrub | scene_gate 01A,03B |
| 015 | scene-work-04B-05C | 04B video play, 05C code | + 04B, 05C timing |
| 016 | scene-editorial-06B-07C | 06B video scrub, 07C code | + 06B, 07C timing |
| 017 | scene-about-footer-09B-10A | 09B scrub, 10A loop | + 09B, 10A |
| 018 | scene-portraits-11B | 11B scrub | all 7 video scenes |
| 019 | scene-transitions-08B | 08B code | all + 08B order |
| 020 | mobile-pass | all | all + Lighthouse mobile |
| 021 | staging-refresh | release check | all |

After each PASS the operator commits, pushes the branch and refreshes staging (backup first, noindex kept).
