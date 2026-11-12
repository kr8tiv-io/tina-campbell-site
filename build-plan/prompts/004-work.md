---
id: 004-work
title: Work index + noir/crimson ripple hover + Flip filters (clip 03)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Build /work/ to match 02-work-index-desktop-v3.jpg with hover motion from clip 03-webgl-hover-distortion.mp4 and layout 16-motion-hover-distortion-v3.jpg.
## Must haves
- Title 'Work' + '{n} frames' count, filter row (crimson underline on active, ?filter= in URL), asymmetric masonry grid of ALL portfolio photos (fashion tiles largest).
- Photos render black and white EXCEPT red garments stay red: do it in a Three.js/WebGL shader per tile (hue-based mask keeping crimson/red hues saturated, everything else desaturated) with a CSS fallback (grayscale filter on a copy + red kept is impossible in CSS, so fallback = full colour). On hover: a ripple from the cursor point spreads across that tile and colour floods outward from the ripple centre until full colour, with a thin red-cyan fringe at edges; settles flat; reverse on leave. Only the hovered tile changes. Crimson 'View' cursor. Ripple must stay inside the tile.
- One shared WebGL canvas for all tiles (fixed, synced to DOM rects on scroll) for performance; lazy; pause off-screen.
- Filters: GSAP Flip reflow when changing filter.
- Each tile links to its series page (or the right category page). Add data-flip-id on tile images for the tile-to-cover transition (prompt 009).
- Mobile: full-colour 2-column grid, no hover.
## Verification
Playwright: filters change count and URL; hover test (mouse move) changes a uniform/class; red preserved visually (screenshot); mobile grid; reduced motion.
## Commit
feat(work): noir-crimson WebGL grid with ripple hover and Flip filters
