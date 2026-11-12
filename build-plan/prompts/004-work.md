---
id: 004-work
title: Work index + noir/crimson ripple hover + Flip filters (clip 03)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/VISUAL-TRUTH.md, /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Follow VISUAL-TRUTH.md exactly. Primary truth is the named Grok Imagine layout(s) and motion clip(s); the named PDF concept page(s) in build-plan/context/ confirm Tina's direction (favourites: Runway and Editorial; she really likes editorial for pages and how it looks on display, with text; fashion & editorial stand out most; she enjoys all styles). Open every named layout and PDF page, and watch every named clip all the way through (ffmpeg frames to /tmp, delete after). Match the layout closely: palette, typography, composition, photo treatment, proportions, spacing. Replicate the clip's motion exactly: timing, easing, direction, and pin behaviour. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images or video. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/. Check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Run the visual side-by-side gate and the motion frame-by-frame gate in VISUAL-TRUTH.md using build-plan/tools/compare-visual.py and compare-motion.py. Look at those composites and fix visible gaps before you commit. Then git add and commit (do not push, do not deploy). If a page or state in this prompt has no approved layout or clip, stop and generate a new Grok Imagine layout/clip first from the existing ones (VISUAL-TRUTH.md). If Grok Imagine, Grok Build, a tool or an install fails, say exactly what failed in your final message and stop; do not switch methods. Clean temp files.

## Goal
Build /work/ to match 02-work-index-desktop-v3.jpg with hover motion from clip 03-webgl-hover-distortion.mp4 and layout 16-motion-hover-distortion-v3.jpg, in the Noir and Crimson direction Tina ticked on PDF p18. The grid must show every style she shoots (Fashion and Editorial first and largest).

## Must haves
- Title 'Work' + '{n} frames' count, filter row (crimson underline on active, ?filter= in URL), asymmetric masonry grid of ALL portfolio photos (fashion tiles largest).
- Photos render black and white EXCEPT red garments stay red: do it in a Three.js/WebGL shader per tile (hue-based mask keeping crimson/red hues saturated, everything else desaturated) with a CSS fallback (grayscale filter on a copy + red kept is impossible in CSS, so fallback = full colour). On hover: a ripple from the cursor point spreads across that tile and colour floods outward from the ripple centre until full colour, with a thin red-cyan fringe at edges; settles flat; reverse on leave. Only the hovered tile changes. Crimson 'View' cursor. Ripple must stay inside the tile. Timing and easing of the ripple/colour flood must match clip 03 and layout 16.
- One shared WebGL canvas for all tiles (fixed, synced to DOM rects on scroll) for performance; lazy; pause off-screen.
- Filters: GSAP Flip reflow when changing filter.
- Each tile links to its series page (or the right category page). Add data-flip-id on tile images for the tile-to-cover transition (prompt 009).
- Mobile: full-colour 2-column grid, no hover.

## References (open all of these)
- Layouts: `concepts/site-layouts/02-work-index-desktop-v3.jpg`, `concepts/site-layouts/16-motion-hover-distortion-v3.jpg`
- Motion clip: `concepts/site-layouts/motion/03-webgl-hover-distortion.mp4`
- PDF: `build-plan/context/pdf-p18-noir-crimson.jpg`, `pdf-p21-inside-pages.jpg`

## Verification
Playwright: filters change count and URL; hover test (mouse move) changes a uniform/class; red preserved visually (screenshot of a red-gown tile before and during hover); mobile grid; reduced motion. Record a hover take for the motion gate against clip 03.
Visual gate: full-page screenshots at 1440x900, 390x844 and 360x780 into qa/<prompt-id>/. Composite each against the layout (and mobile layout where named) and against the named PDF concept page with `python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py`. Write qa/<prompt-id>/compare/NOTES.md. Fix palette, type, composition, photo treatment and spacing until the built page is a close visual match to the Imagine layout and clearly in the same family as the PDF concept.
Motion gate: Playwright recordVideo at 1280x720 of the built section (same moves as the clip, including reverse scroll where required) into qa/<prompt-id>/motion/. Run `python3 /workspace/tina-campbell/build-plan/tools/compare-motion.py --clip <clip> --recording <file> --out-dir qa/<prompt-id>/motion-compare --frames 12`. Open every frame and the contact sheet. If timing, easing, direction or pin behaviour drifts, fix, re-record and compare again. Fill in MOTION-NOTES.md. No drift.
Also: no overflow, no broken images, no console errors, reduced motion path works, all content visible without JS.

## Commit
feat(work): noir-crimson WebGL grid with ripple hover and Flip filters
