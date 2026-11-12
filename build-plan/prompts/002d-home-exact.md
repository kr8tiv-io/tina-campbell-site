---
id: 002d-home-exact
title: Home and global header exact match to layout 01 / 11 and clip 01
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope: global header on every page (targets G1-G6) and the Home page (H1-H13) in build-plan/EXACT-TARGETS.md. Clip: clip01 (`concepts/site-layouts/motion/01-lenis-scroll-home.mp4`). Layouts: `concepts/site-layouts/01-home-desktop-v2b.jpg`, `concepts/site-layouts/11-home-mobile.jpg`, `14-motion-loader-signature.jpg` (loader must still match). PDF confirmation: `build-plan/context/pdf-p10-runway.jpg` (Tina: "I like this one", her favourite), `pdf-p15-film-strip.jpg`, `pdf-p14-editorial-split.jpg`, `pdf-p19-bridge-skyline.jpg`. Baseline: `qa/exact-baseline-2026-11-12/replay-clip01/` and `sheets/clip01-key.jpg`, `sheets/home-1440-a.jpg`, `sheets/home-390-r.jpg`.

Measured fixes required (numbers are in EXACT-TARGETS.md; these are the headline gaps):
1. Header: TCPhoto mark ~187x100 px at 1440 (166x89 at 1280), header bar ~112 px at 1440, mono nav ~20 px, Book a shoot pill ~206x62 at 1440. Keep the mobile header as is. The mark must keep its SVG aspect ratio everywhere (also fix the stretched in-panel mark on Fashion & Editorial and series pages, G5).
2. Hero: re-crop so both lamp globes and the whole figure show like clip 01 frame t=0 (not zoomed); night grade: saturated deep blue sky, warm skin, vignette, light grain, matching clip 01 / layout 01 colour (sample the clip frame colours with PIL and get the zone-luma diff under 18 at t=0); bottom ~35% of the hero fades to pure ink with no hard edge, the meta row sits on the fade. If the hero source is low resolution, use the largest original in images/ and do not upscale more than 1.25x; sharpen gently only if it is needed.
3. Hero height and pacing: replaying the clip01 curve, at t=3.0 s (scroll ~303 px) only "The Runway" label and the top ~20% of the tiles show, and at t=6.0 s (621 px) the tiles and numbers 01-05 sit like clip frame t=6.0 (label y ~200 at 720, numbers at ~650). Title stays 78-79% width and does not scale.
4. Runway band: 5 equal 2:3 tiles (~225x340 at 1280), gaps ~24 px, outer margin ~30 px, mono numbers centred under each, only the label "The Runway". Remove the right-hand caption, the full-width rule and the in-band link (the category band already links to Work). Re-pick photos for night runway as H7 says, looking at each candidate.
5. Category band: 6 LANDSCAPE ~5:4 tiles edge to edge, 4 px gaps, mono labels centred on a dark bar under each (this reverses 002c's 4:5 change, which was a misreading of layout 01).
6. Red Gown split: photo right 50-100% bleeding to the edge, ~1.9:1, gown seated on the turquoise truck, no signature/watermark on the photo; text panel left.
7. Footer band: one crisp dusk/blue-hour skyline plate with the Walterdale arch (her real city photos; look at fb_001, fb_066, fb_168 and the landscape files), dark grade, "Let's make something bold." left with the crimson pill.
8. Mobile 390 (layout 11): stacked centred TINA / CAMPBELL at ~45-70% of screen height, glyph line width ~60% of screen, pill at the bottom of the hero only; runway as three panels (side ~18%, centre ~45%, ~68 svh) with crimson progress bar and "No. 014 / EDMONTON" style mono caption under (real numbers and places from data); category list as now.

Verification: replay clip01 before and after; capture "/" at 1440 and 390; side-by-side each Home section against layout 01 and the hero against PDF p10. Every H and G row PASS in qa/002d-home-exact/exact/CHECKLIST.md. Existing Playwright tests in site/tests must still pass (update assertions only where they encoded the old wrong sizes, and say which).

Commit: fix(home): exact match to layout 01/11 and clip 01 (header, hero crop and night grade, runway 2:3, landscape categories, dusk band)
