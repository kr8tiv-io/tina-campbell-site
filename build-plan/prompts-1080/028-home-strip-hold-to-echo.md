---
id: 028-home-strip-hold-to-echo
title: Home, hold the live 02A strip until the echo strip is pinned, and lay out the echo labels
kind: fix
effort: xhigh
model: grok-4.7
depends_on: [027-home-post-strip-refresh]
status: DRAFT, not run (needs Matt's go, usage until Wednesday reset)
---
## Why
After 027 the seam no longer fires early, but the approved geometry still shows ~1 screen of empty dark between the live
strip's hold release (`is-sheet-hold` off at scrub progress 0.995, end 'bottom bottom') and the 02A-03B echo strip
reaching the top, so the strip vanishes and then slides back up from below before the flood (both directions). On phone the
echo strip's category labels render stacked at the left. Frames: `/workspace/tina-review-2026-11-22/post-strip-flash/after/`.

## Change
- Keep `is-sheet-hold` on from scrub progress 0.02 until the 02A-03B seam pin is active (stage fixed at top), then drop it
  in the same frame, so the identical echo strip (same progress) is underneath and the swap is invisible. Reverse mirrors.
  Do not change the scrub mapping (start/end/snap), spacer heights, seam timelines or any motion values.
- Echo labels: position them with the same `placeLabels` logic as the live strip (or hide the echo labels if the live
  strip's labels are the ones visible at the swap). No stacked text at 390 or 1440.

## Gate
027 gate unchanged plus `post-strip.spec.ts` extended: no sample between hold release and the 02A-03B pin where the
viewport centre shows only the dark spacer; echo labels have distinct x positions.
