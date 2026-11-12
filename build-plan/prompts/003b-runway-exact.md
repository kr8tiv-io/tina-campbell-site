---
id: 003b-runway-exact
title: Runway page exact match to layout 06 and clip 02
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope: /runway/ (targets R1-R8 in EXACT-TARGETS.md) plus its mobile swipe path. Clip: clip02 (`concepts/site-layouts/motion/02-runway-pinned-horizontal.mp4`). Layout: `concepts/site-layouts/06-runway-gallery-desktop-v2.jpg`. PDF: `build-plan/context/pdf-p10-runway.jpg` (Tina's favourite) and `pdf-p15-film-strip.jpg` (sprockets, frame numbers, timecode). Baseline: `qa/exact-baseline-2026-11-12/replay-clip02/` and `sheets/clip02-key.jpg`, `sheets/runway-1440-2col.jpg`.

Measured fixes required:
1. Shape (R1): a symmetric barrel curve facing the viewer: centre frames ~0.60 vh tall (430 px at 720), edge frames ~0.48 vh, top edge highest at the centre, bottom edge lowest at the centre, identical left and right at every scroll position. Today the Three.js strip rises to the right like a twisted ribbon; fix the curve maths in the shader/geometry, not with CSS.
2. Fill (R2): the strip covers the viewport edge to edge at the first and last pin frame and everywhere between (pad the track with real frames or loop it; never show empty ink beside the strip). Today the strip ends mid-screen.
3. Pin (R3): the pin distance follows the track length at least 1:1 vertical px per horizontal px; with 12 or more frames it is several viewports, not 706 px. The replay tool reads `data-pin-distance` and `data-travel-px` from the pinned section, so keep those attributes accurate.
4. Feel (R4): one scroll gesture gives the clip's curve: ~0.5 s ramp, peak ~600 px/s at 1280, ~3 s ease-out, comes to rest with a frame centred (snap to frames only at rest). Use Lenis + ScrollTrigger scrub smoothing (e.g. scrub ~1 plus snap to 1/frames with a power3.out ease), and verify by replaying clip02: the strip's horizontal displacement per 0.25 s must follow the clip within +/-20%.
5. Lighting (R5): centre frame sharp and fully lit; brightness falls to ~55-60% at the screen edges with a slight blur, in the shader.
6. Film border (R6): dark sprocket band (~#151517) with small dark holes, thin dark gutters; no bright grey holes.
7. Photos (R7): her darkest stage runway frames (magenta/purple stage light, black venue) at the opening view and the centre; daylight mall frames later or not at all. Look at every runway file in images/ and pick.
8. Keep the title block (R8), timecode/progress rail, and the mobile native swipe strip with scroll-snap and crimson progress bar.

Verification: replay clip02 before and after, compare every pair; capture /runway/ forward and reverse at 1440 and 390 and confirm no empty area at the start, middle and end of the pin; side-by-side with layout 06 at the pin start. Every R row PASS in qa/003b-runway-exact/exact/CHECKLIST.md. site/tests must pass.

Commit: fix(runway): exact match to clip 02 (symmetric barrel strip, full fill, true pin length, eased snap, centre lighting)
