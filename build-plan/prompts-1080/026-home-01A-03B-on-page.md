---
id: 026-home-01A-03B-on-page
title: Home 01A and 03B, make the motion read on the real page
kind: build
effort: xhigh
model: grok-4.7
depends_on: [025-work-04B-05C-on-page]
---
## Why
Gap audit ranks 6 and 7 (`build-plan/gap-audit-2026-11-20/sheet-01A.jpg`, `sheet-03B.jpg`). 01A sits at the billowed pose
and barely moves after load (mean frame difference 2 to 8 of 255 over 6 s); the clip sweeps from tucked to full billow.
03B enters through a flat red wash, carries a warm red tint over the whole frame instead of clean mono with one red gown,
and the followspot is soft; the phone crop loses the line of models.

## Do
- 01A: on the real page (not gate mode) play the full 0 to 6.04 s clip from the tucked start on first view, then loop the
  living section (find the loop window from the clip that has continuous visible gown motion, at least 3 s, seamless).
  Measure: mean frame difference over any 6 s window >= 10 on the page capture.
- 03B: remove the red wash on entry (the seam owns colour, not a full red frame), no tint over the video (overlay copy only),
  spot contrast as in the clip. Phone: object-position that keeps at least four models in frame.
- Do not touch the encoded media or the gates.

## Gate
`_CONTEXT.md` gates `--scenes 01A,03B,04B`, seams 10/10, routes 3/3 plus 3/3, Playwright 42+ pass. On-page side by side with
the audit tools (ONLY=01A,03B) into `qa/026-home-01A-03B-on-page/`, plus the frame-difference numbers. Honest notes per frame.

## Commit message
fix(scene-01A-03B): visible gown motion on the page, clean mono followspot
