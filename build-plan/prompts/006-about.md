---
id: 006-about
title: About with true layered parallax (clip 06)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/VISUAL-TRUTH.md, /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Follow VISUAL-TRUTH.md exactly. Primary truth is the named Grok Imagine layout(s) and motion clip(s); the named PDF concept page(s) in build-plan/context/ confirm Tina's direction (favourites: Runway and Editorial; she really likes editorial for pages and how it looks on display, with text; fashion & editorial stand out most; she enjoys all styles). Open every named layout and PDF page, and watch every named clip all the way through (ffmpeg frames to /tmp, delete after). Match the layout closely: palette, typography, composition, photo treatment, proportions, spacing. Replicate the clip's motion exactly: timing, easing, direction, and pin behaviour. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images or video. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/. Check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Run the visual side-by-side gate and the motion frame-by-frame gate in VISUAL-TRUTH.md using build-plan/tools/compare-visual.py and compare-motion.py. Look at those composites and fix visible gaps before you commit. Then git add and commit (do not push, do not deploy). If a page or state in this prompt has no approved layout or clip, stop and generate a new Grok Imagine layout/clip first from the existing ones (VISUAL-TRUTH.md). If Grok Imagine, Grok Build, a tool or an install fails, say exactly what failed in your final message and stop; do not switch methods. Clean temp files.

## Goal
Build /about/ to match 07-about-desktop-v3-clean.jpg and mobile 13-about-mobile-v3.jpg, with the depth motion of clip 06-about-bridge-parallax.mp4 done PROPERLY as separated layers (no crossfade). This is the Bridge and Skyline direction Tina ticked on PDF p19.

## Must haves
- Hero made of real separated layers built from her real photos with a small Python/numpy/PIL or sharp script (no big ML installs): far layer = Edmonton skyline/sky (from fb_168_city.jpg or fb_066_city.jpg); middle layer = Walterdale/High Level bridge cut out with transparent sky (sky colour keying + feathered alpha); foreground layer = a real cut-out from her work with a clean blue-sky key (e.g. the black-gown lamp-post frame fb_141_signature.jpg or fb_046) placed at the left. If a clean cut-out cannot be made, use a dark foreground silhouette band (trees/ridge) cut from the same photo and say so. Save layers as AVIF/WebP/PNG with alpha in src/assets/about-layers/ and the script in site/scripts/.
- Big serif 'TINA CAMPBELL' sits BETWEEN middle and foreground layers (z-index), stays put while layers move at 0.15 / 0.45 / 1.0 speeds with scroll (ScrollTrigger scrub); subtle pointer parallax on desktop. Timing, easing, direction and the sense of depth must match clip 06. No crossfade pretending to be parallax.
- Then portrait + headline + story column (COPY.md), press line, behind-the-scenes row (4 real photos showing shoots; pick the closest real frames), 'Where I shoot' 4 location cards using real photos (Legislature, Walterdale Bridge, High Level Bridge, River Valley; use her city photos; if no real Legislature-building photo, use the Legislature-steps frame), areas line, crimson button.
- Note in the commit message which photos stand in for a photo of Tina herself (she has not supplied one yet).
- Mobile per layout 13.

## References (open all of these)
- Layouts: `concepts/site-layouts/07-about-desktop-v3-clean.jpg`, `concepts/site-layouts/13-about-mobile-v3.jpg`
- Motion clip: `concepts/site-layouts/motion/06-about-bridge-parallax.mp4`
- PDF: `build-plan/context/pdf-p19-bridge-skyline.jpg`, `pdf-p21-inside-pages.jpg`

## Verification
Playwright: scroll the hero and check the three layers' transforms differ and reverse; reduced motion static; 3 sizes. Side-by-sides vs layout 07 / 13 and vs PDF p19. Motion recording of the hero scroll against clip 06.
Visual gate: full-page screenshots at 1440x900, 390x844 and 360x780 into qa/<prompt-id>/. Composite each against the layout (and mobile layout where named) and against the named PDF concept page with `python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py`. Write qa/<prompt-id>/compare/NOTES.md. Fix palette, type, composition, photo treatment and spacing until the built page is a close visual match to the Imagine layout and clearly in the same family as the PDF concept.
Motion gate: Playwright recordVideo at 1280x720 of the built section (same moves as the clip, including reverse scroll where required) into qa/<prompt-id>/motion/. Run `python3 /workspace/tina-campbell/build-plan/tools/compare-motion.py --clip <clip> --recording <file> --out-dir qa/<prompt-id>/motion-compare --frames 12`. Open every frame and the contact sheet. If timing, easing, direction or pin behaviour drifts, fix, re-record and compare again. Fill in MOTION-NOTES.md. No drift.
Also: no overflow, no broken images, no console errors, reduced motion path works, all content visible without JS.

## Fidelity check before finishing
Added 2026-11-12 from build-plan/FIDELITY-AUDIT-2026-11-12.md. Scope unchanged; this is a check, not new work. Before you commit, put three things next to your final screenshots and record frames, and write the result into qa/<prompt-id>/compare/NOTES.md as a table (section, match / drift / missing, fix made):
1. Layout: `07-about-desktop-v3-clean.jpg` and `13-about-mobile-v3.jpg`. Compare section by section at 1440 and 390 using viewport screenshots taken at each section (full-page shots hide scroll reveals and pinned content, so they do not count on their own). Check type size and alignment, photo crop and colour grade (Runway look: dark, cinematic, photos glowing on black), tile proportions and spacing.
2. Clip frames: clip 06 (separated layers moving at different speeds, name between layers). Extract frames with ffmpeg and view them next to your Playwright record frames. No dead pins: a pinned section must visibly move for the whole pin distance.
3. Tina's input: Bridge and Skyline tick (PDF p19): layered Edmonton skyline, Walterdale arch, Tina in front; her own story in plain words; Editorial Split for text sections.
Fix every drift you find before committing. If a gap cannot be closed with her real photos, say so in NOTES.md with the closest frame you used.

## Commit
feat(about): layered bridge-and-skyline parallax about page
