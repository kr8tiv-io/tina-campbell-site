---
id: 009-transitions
title: Page transitions: Flip tile-to-cover + film-strip (clip 05)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/VISUAL-TRUTH.md, /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Follow VISUAL-TRUTH.md exactly. Primary truth is the named Grok Imagine layout(s) and motion clip(s); the named PDF concept page(s) in build-plan/context/ confirm Tina's direction (favourites: Runway and Editorial; she really likes editorial for pages and how it looks on display, with text; fashion & editorial stand out most; she enjoys all styles). Open every named layout and PDF page, and watch every named clip all the way through (ffmpeg frames to /tmp, delete after). Match the layout closely: palette, typography, composition, photo treatment, proportions, spacing. Replicate the clip's motion exactly: timing, easing, direction, and pin behaviour. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images or video. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/. Check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Run the visual side-by-side gate and the motion frame-by-frame gate in VISUAL-TRUTH.md using build-plan/tools/compare-visual.py and compare-motion.py. Look at those composites and fix visible gaps before you commit. Then git add and commit (do not push, do not deploy). If a page or state in this prompt has no approved layout or clip, stop and generate a new Grok Imagine layout/clip first from the existing ones (VISUAL-TRUTH.md). If Grok Imagine, Grok Build, a tool or an install fails, say exactly what failed in your final message and stop; do not switch methods. Clean temp files.

## Goal
Implement page transitions matching clip 05-page-transition-flip.mp4 and layout 15-motion-page-transition.jpg across the whole site. This is the Film Strip page-advance Tina ticked on PDF p15.

## Must haves
- Astro ClientRouter. Clicking a Work tile (or Home teaser / Next series thumbnail) with data-flip-id: the image grows from its grid position to the full-bleed series cover (view-transition-name shared element and/or GSAP Flip across the swap), other tiles slide off left like film frames with slight motion blur, a thin crimson line wipes across; the cover title then rises (SplitText). Timing, easing, direction and the shared-element morph must match clip 05 exactly.
- Default transition between other pages: film-strip advance (old page slides left with sprocket edge band, new page enters from right) under 700ms.
- Back/forward works, focus moves to main h1 after navigation, scroll restored correctly, all motion modules re-init with no duplicate ScrollTriggers (assert ScrollTrigger.getAll().length sane after 5 navigations), Lenis recreated once.
- Reduced motion: instant swap with 150ms fade.

## References (open all of these)
- Layout: `concepts/site-layouts/15-motion-page-transition.jpg`
- Motion clip: `concepts/site-layouts/motion/05-page-transition-flip.mp4`
- PDF: `build-plan/context/pdf-p15-film-strip.jpg`

## Verification
Playwright: navigate Work -> series -> next series -> back, check no errors, triggers count stable, h1 focused; screenshots mid-transition (page.waitForTimeout) saved. Motion gate: record the tile-to-cover transition and compare frame-by-frame against clip 05. Also composite a mid-transition still against layout 15.
Visual gate: full-page screenshots at 1440x900, 390x844 and 360x780 into qa/<prompt-id>/. Composite each against the layout (and mobile layout where named) and against the named PDF concept page with `python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py`. Write qa/<prompt-id>/compare/NOTES.md. Fix palette, type, composition, photo treatment and spacing until the built page is a close visual match to the Imagine layout and clearly in the same family as the PDF concept.
Motion gate: Playwright recordVideo at 1280x720 of the built section (same moves as the clip, including reverse scroll where required) into qa/<prompt-id>/motion/. Run `python3 /workspace/tina-campbell/build-plan/tools/compare-motion.py --clip <clip> --recording <file> --out-dir qa/<prompt-id>/motion-compare --frames 12`. Open every frame and the contact sheet. If timing, easing, direction or pin behaviour drifts, fix, re-record and compare again. Fill in MOTION-NOTES.md. No drift.
Also: no overflow, no broken images, no console errors, reduced motion path works, all content visible without JS.

## Fidelity check before finishing
Added 2026-11-12 from build-plan/FIDELITY-AUDIT-2026-11-12.md. Scope unchanged; this is a check, not new work. Before you commit, put three things next to your final screenshots and record frames, and write the result into qa/<prompt-id>/compare/NOTES.md as a table (section, match / drift / missing, fix made):
1. Layout: `15-motion-page-transition.jpg`. Compare section by section at 1440 and 390 using viewport screenshots taken at each section (full-page shots hide scroll reveals and pinned content, so they do not count on their own). Check type size and alignment, photo crop and colour grade (Runway look: dark, cinematic, photos glowing on black), tile proportions and spacing.
2. Clip frames: clip 05 (tile to cover Flip, film-frame advance). Extract frames with ffmpeg and view them next to your Playwright record frames. No dead pins: a pinned section must visibly move for the whole pin distance.
3. Tina's input: Film Strip tick (PDF p15): the page change reads as a film-frame advance; Runway look stays dark and cinematic through the transition.
Fix every drift you find before committing. If a gap cannot be closed with her real photos, say so in NOTES.md with the closest frame you used.

## Commit
feat(transitions): flip tile-to-cover and film-strip page transitions
