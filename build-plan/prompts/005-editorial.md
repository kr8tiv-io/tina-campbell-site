---
id: 005-editorial
title: Fashion & Editorial, series pages, Portraits/Bridal/Couples (clip 04)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/VISUAL-TRUTH.md, /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Follow VISUAL-TRUTH.md exactly. Primary truth is the named Grok Imagine layout(s) and motion clip(s); the named PDF concept page(s) in build-plan/context/ confirm Tina's direction (favourites: Runway and Editorial; she really likes editorial for pages and how it looks on display, with text; fashion & editorial stand out most; she enjoys all styles). Open every named layout and PDF page, and watch every named clip all the way through (ffmpeg frames to /tmp, delete after). Match the layout closely: palette, typography, composition, photo treatment, proportions, spacing. Replicate the clip's motion exactly: timing, easing, direction, and pin behaviour. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images or video. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/. Check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Run the visual side-by-side gate and the motion frame-by-frame gate in VISUAL-TRUTH.md using build-plan/tools/compare-visual.py and compare-motion.py. Look at those composites and fix visible gaps before you commit. Then git add and commit (do not push, do not deploy). If a page or state in this prompt has no approved layout or clip, stop and generate a new Grok Imagine layout/clip first from the existing ones (VISUAL-TRUTH.md). If Grok Imagine, Grok Build, a tool or an install fails, say exactly what failed in your final message and stop; do not switch methods. Clean temp files.

## Goal
Build /fashion-editorial/ (layout 03-fashion-editorial-desktop-v2.jpg), /series/[slug]/ for the 5 series (layout 04-series-story-desktop-v3.jpg, mobile 12-series-mobile-v2.jpg) and /portraits-bridal-couples/ (layout 05-portraits-bridal-desktop-v2.jpg), with the motion of clip 04-editorial-split-reveal.mp4. This is Tina's other favourite: Editorial Split for pages, with real text beside photos, magazine-spread credits. Fashion and Editorial is a top-level nav item and the lead category.

## Must haves
- Editorial Split: left panel pinned (sticky) with logo mark, H1 lines revealed with SplitText (mask lines), lead line fades, series index rows tick in one by one; right column photos unmask with clip-path inset from top as they enter, thin crimson vertical divider; active series index item turns crimson as its photos scroll into view (ScrollTrigger). Pull quote section + 4 photo strip, collab band with crimson Collaborate button. Motion (pin, split-text, clip-path unmask, stagger) must match clip 04 exactly.
- Series pages from data: cover (full-bleed photo with title + mono meta, title SplitText), credits + intro text column beside large photo, pair of photos, full-width photo with film-strip frame number, 'Next series' footer with thumbnail and crimson arrow (thumbnail gets data-flip-id). BreadcrumbList + ImageGallery JSON-LD. These pages should feel like magazine spreads: text on display beside photographs.
- Portraits/Bridal/Couples: three chapters (Ch. 01/02/03), photo left, heading + text + 'See the gallery' crimson link right; reveal on scroll. Use real portrait, bridal and couples photos. Warm, slower easing as in MOTION-SPEC.md.
- Mobile: stack (photo then text), keep reveals light.

## References (open all of these)
- Layouts: `concepts/site-layouts/03-fashion-editorial-desktop-v2.jpg`, `04-series-story-desktop-v3.jpg`, `12-series-mobile-v2.jpg`, `05-portraits-bridal-desktop-v2.jpg`
- Motion clip: `concepts/site-layouts/motion/04-editorial-split-reveal.mp4`
- PDF: `build-plan/context/pdf-p14-editorial-split.jpg`, `pdf-p21-inside-pages.jpg`

## Verification
Playwright 3 sizes, scroll forward/back, reduced motion, no overflow; all 5 series pages build. Side-by-sides for Fashion & Editorial, one series page, and Portraits against their layouts, plus Fashion & Editorial against PDF p14. Motion recording of the Editorial Split against clip 04.
Visual gate: full-page screenshots at 1440x900, 390x844 and 360x780 into qa/<prompt-id>/. Composite each against the layout (and mobile layout where named) and against the named PDF concept page with `python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py`. Write qa/<prompt-id>/compare/NOTES.md. Fix palette, type, composition, photo treatment and spacing until the built page is a close visual match to the Imagine layout and clearly in the same family as the PDF concept.
Motion gate: Playwright recordVideo at 1280x720 of the built section (same moves as the clip, including reverse scroll where required) into qa/<prompt-id>/motion/. Run `python3 /workspace/tina-campbell/build-plan/tools/compare-motion.py --clip <clip> --recording <file> --out-dir qa/<prompt-id>/motion-compare --frames 12`. Open every frame and the contact sheet. If timing, easing, direction or pin behaviour drifts, fix, re-record and compare again. Fill in MOTION-NOTES.md. No drift.
Also: no overflow, no broken images, no console errors, reduced motion path works, all content visible without JS.

## Commit
feat(editorial): editorial split pages, series template, portraits-bridal-couples
