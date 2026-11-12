---
id: 006-about
title: About with true layered parallax (clip 06)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Build /about/ to match 07-about-desktop-v3-clean.jpg and mobile 13-about-mobile-v3.jpg, with the depth motion of clip 06-about-bridge-parallax.mp4 done PROPERLY as separated layers (no crossfade).
## Must haves
- Hero made of real separated layers built from her real photos with a small Python/numpy/PIL or sharp script (no big ML installs): far layer = Edmonton skyline/sky (from fb_168_city.jpg or fb_066_city.jpg); middle layer = Walterdale/High Level bridge cut out with transparent sky (sky colour keying + feathered alpha); foreground layer = a real cut-out from her work with a clean blue-sky key (e.g. the black-gown lamp-post frame fb_141_signature.jpg or fb_046) placed at the left. If a clean cut-out cannot be made, use a dark foreground silhouette band (trees/ridge) cut from the same photo and say so. Save layers as AVIF/WebP/PNG with alpha in src/assets/about-layers/ and the script in site/scripts/.
- Big serif 'TINA CAMPBELL' sits BETWEEN middle and foreground layers (z-index), stays put while layers move at 0.15 / 0.45 / 1.0 speeds with scroll (ScrollTrigger scrub); subtle pointer parallax on desktop.
- Then portrait + headline + story column (COPY.md), press line, behind-the-scenes row (4 real photos showing shoots; pick the closest real frames), 'Where I shoot' 4 location cards using real photos (Legislature, Walterdale Bridge, High Level Bridge, River Valley; use her city photos; if no real Legislature-building photo, use the Legislature-steps frame), areas line, crimson button.
- Note in the commit message which photos stand in for a photo of Tina herself (she has not supplied one yet).
- Mobile per layout 13.
## Verification
Playwright: scroll hero and check the three layers' transforms differ and reverse; reduced motion static; 3 sizes; compare.
## Commit
feat(about): layered bridge-and-skyline parallax about page
