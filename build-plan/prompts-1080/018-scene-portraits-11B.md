---
id: 018-scene-portraits-11B
title: Portraits, Bridal and Couples chapters 11B veil wipe (scrub)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [017-scene-about-footer-09B-10A]
---
## Goal
`/portraits-bridal-couples/`: 11B veil video scrubbed by chapter scroll progress between chapter photos (veil drifts 0-2.0 s,
sweeps hard 3.0-5.5 s revealing the second bridal photo, brightens to the end). Chapter title via core SplitText (seam
10A-11B already waits for fonts; keep that). Wire seam 10A-11B if the footer band precedes the chapter, else log.
## Verification
gates all seven `--scenes 01A,03B,04B,06B,09B,10A,11B`; seams 10/10.
## Commit message
feat(scene-11B): portraits chapter veil wipe scrubbed video

## Added 20 Nov 2026 (gap audit): on-page gate
Gate mode alone is not enough (04B passed at 0.95 yet reads tiny on the page). Also run
`build-plan/gap-audit-2026-11-20/tools/capture-pages.mjs` against the preview for your scenes (copy into site/, ONLY=<IDs>)
and `tools/sheet.py <IDs>` with `STG=qa/<prompt-id>/cap SHEET_OUT=qa/<prompt-id> LABEL="<prompt-id> preview"`. The scene must
read at the size and place it has on the page: full-bleed where the clip is full-bleed. Write per column what still differs.
Photos: follow `build-plan/gap-audit-2026-11-20/PHOTO-PLAN.md` (no repeats on a page).
