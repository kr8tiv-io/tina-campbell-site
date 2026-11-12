---
id: 003-runway
title: Runway page + Three.js curved catwalk (clip 02)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/VISUAL-TRUTH.md, /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Follow VISUAL-TRUTH.md exactly. Primary truth is the named Grok Imagine layout(s) and motion clip(s); the named PDF concept page(s) in build-plan/context/ confirm Tina's direction (favourites: Runway and Editorial; she really likes editorial for pages and how it looks on display, with text; fashion & editorial stand out most; she enjoys all styles). Open every named layout and PDF page, and watch every named clip all the way through (ffmpeg frames to /tmp, delete after). Match the layout closely: palette, typography, composition, photo treatment, proportions, spacing. Replicate the clip's motion exactly: timing, easing, direction, and pin behaviour. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images or video. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/. Check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Run the visual side-by-side gate and the motion frame-by-frame gate in VISUAL-TRUTH.md using build-plan/tools/compare-visual.py and compare-motion.py. Look at those composites and fix visible gaps before you commit. Then git add and commit (do not push, do not deploy). If a page or state in this prompt has no approved layout or clip, stop and generate a new Grok Imagine layout/clip first from the existing ones (VISUAL-TRUTH.md). If Grok Imagine, Grok Build, a tool or an install fails, say exactly what failed in your final message and stop; do not switch methods. Clean temp files.

## Goal
Build /runway/ to match 06-runway-gallery-desktop-v2.jpg with the motion of clip 02-runway-pinned-horizontal.mp4, in the Runway direction Tina ticked on PDF p10.

## Must haves
- Section pins (ScrollTrigger pin + scrub) and vertical scroll drives the strip horizontally through ALL runway photos, then releases. Also drag (GSAP Observer) on desktop. Timing, easing, direction and pin release must match clip 02 exactly.
- Three.js: each photo is a plane on a gentle concave curve (like the layout: frames recede at the edges), centre frame larger, sharp and bright; side frames smaller, dimmer, slightly blurred (shader uniforms). Film-strip sprocket bands top and bottom (CSS or texture), crimson progress rail with dot under the title, cursor label 'Drag'. Lazy-load Three after WebGL check; DPR cap 1.5; pause when off-screen; textures from astro:assets URLs at ~1200px.
- Fallback (no WebGL / reduced motion / coarse pointer): native horizontal scroll-snap strip with the same look, progress bar.
- Reusable module src/scripts/webgl/curvedStrip.ts (Home can use a lighter CSS version).

## References (open all of these)
- Layout: `concepts/site-layouts/06-runway-gallery-desktop-v2.jpg`
- Motion clip: `concepts/site-layouts/motion/02-runway-pinned-horizontal.mp4`
- PDF: `build-plan/context/pdf-p10-runway.jpg`, `pdf-p15-film-strip.jpg`

## Verification
Playwright: at 1440 scroll through the pin and back, screenshot start/middle/end, assert the strip transform changes and reverses; mobile swipe strip scrolls; reduced motion fallback; fps sanity (no long tasks > 200ms during scroll in a performance trace if feasible).
Visual gate: full-page screenshots at 1440x900, 390x844 and 360x780 into qa/<prompt-id>/. Composite each against the layout (and mobile layout where named) and against the named PDF concept page with `python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py`. Write qa/<prompt-id>/compare/NOTES.md. Fix palette, type, composition, photo treatment and spacing until the built page is a close visual match to the Imagine layout and clearly in the same family as the PDF concept.
Motion gate: Playwright recordVideo at 1280x720 of the built section (same moves as the clip, including reverse scroll where required) into qa/<prompt-id>/motion/. Run `python3 /workspace/tina-campbell/build-plan/tools/compare-motion.py --clip <clip> --recording <file> --out-dir qa/<prompt-id>/motion-compare --frames 12`. Open every frame and the contact sheet. If timing, easing, direction or pin behaviour drifts, fix, re-record and compare again. Fill in MOTION-NOTES.md. No drift.
Also: no overflow, no broken images, no console errors, reduced motion path works, all content visible without JS.

## Commit
feat(runway): pinned horizontal catwalk with Three.js curved panels
