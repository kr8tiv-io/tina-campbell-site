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
