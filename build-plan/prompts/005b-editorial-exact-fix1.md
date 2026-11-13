---
id: 005b-editorial-exact-fix1
title: Editorial exact-match round 1 (list pitch and clip, story glow)
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope is only the failing IDs below. Do not restyle anything that already passed (E1 split at 50% / photos 56–91% with 8 px gaps, E2 185 px title at 41% width, E4 load-in timing, E5 1:2 quote strip, E6 collab line and pill, E7 mobile text-then-photos, S1 cover title, S2 crops, S4 pair and film ratios, S5 next series, P1 title width, P2 chapters, G5 mark aspect).

E3. The series list is the right face and the right width. The rows are too loose at 1440, and the last row is cut off at the clip height.
Measured: at 1440, "02 Legislature in Black" is 458 px (target ~460 px, 32%). Row starts are y712, 748, 787, 825, 866. Mean pitch 37 px. Target ~30 px. At 1280×720, `qa/005b-editorial-exact/exact/driver-verify-005b-editorial-exact/clip04/build/b-024.jpg` shows row 05 only as white glyphs y708–719. The line is about 27 px tall, so the bottom is past y720. `clip04/clip/c-024.jpg` shows all five rows, the last ending at y581. Active-number colour already tracks the pin (01 at rest, 05 crimson on `pages/fashion-editorial-1440/fwd-005-y2250.jpg`). Keep that.
Target: JetBrains Mono, the "02 Legislature in Black" line still ~32% of the viewport (~460 px at 1440), active number crimson, row pitch ~30 px. At 1280×720 every glyph of row 05 sits inside the viewport, with a few pixels of ink below the line.
Evidence: `qa/005b-editorial-exact/exact/driver-verify-005b-editorial-exact/clip04/build/b-024.jpg`, `clip04/clip/c-024.jpg`, `clip04/pair-024.jpg`, `pages/fashion-editorial-1440/rev-007-y0.jpg`.
Fix: in `site/src/styles/editorial.css`, bring `.fe-index` pitch to ~30 px at 1440 (the 32 px face can do that with a tighter line-height; do not shrink the line width). Under `(min-width: 961px) and (max-height: 820px)`, tighten the stack enough that row 05 clears the bottom of a 720 px viewport. Keep the title at 41% / the 185 px cap. Re-check `b-024.jpg` and the settled 1440 hero before calling it done.

S3. The story block's column and portrait ratio are right. The soft glow is not on the screen.
Measured: on `pages/series_the-red-gown-1440/fwd-002-y900.jpg` the portrait starts at x670 and is 720 px wide (aspect 3/4.35). The 28 px band to its left, x640–668, y200–750, is ink: mean (13, 13, 14), max 24. The right edge at x1391 is the same hard cut. Layout 04 at y280 ramps from (29, 24, 20) to (58, 48, 38) over about 24 px before the photo (that is about a 40 px halo once the layout is scaled to 1440). `.spread__photo` already sets `box-shadow: 0 0 70px 16px rgba(226, 214, 200, 0.28)`, and `unmask()` in `site/src/scripts/motion/editorial.ts` leaves `clip-path: inset(0 0 0% 0)` on the figure, which clips that shadow.
Target: live text in the left ~40% column, tall portrait on the right, and a visible warm glow on the portrait edge, on the order of layout 04.
Evidence: `qa/005b-editorial-exact/exact/driver-verify-005b-editorial-exact/pages/series_the-red-gown-1440/fwd-002-y900.jpg`, `concepts/site-layouts/04-series-story-desktop-v3.jpg`.
Fix: let the glow paint outside the frame. Clear the clip-path when the unmask finishes, or move the shadow to a wrapper that is not clipped. Do not change the 40vw column or the 3/4.35 portrait. After the next capture, a pixel about 20 px outside the portrait edge must be warmer than ink (12, 12, 15), in the same range as the layout ramp, on The Red Gown and one other series.

Commit: fix(005b-editorial-exact): exact-match round 1
