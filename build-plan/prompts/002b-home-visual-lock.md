---
id: 002b-home-visual-lock
title: Correct Home to layout 01 and the Runway look, then lock visuals and motion
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/VISUAL-TRUTH.md, /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Follow VISUAL-TRUTH.md exactly. Primary truth is the named Grok Imagine layout(s) and motion clip(s); the named PDF concept page(s) in build-plan/context/ confirm Tina's direction (favourites: Runway and Editorial; she really likes editorial for pages and how it looks on display, with text; fashion & editorial stand out most; she enjoys all styles). Open every named layout and PDF page, and watch every named clip all the way through (ffmpeg frames to /tmp, delete after). Match the layout closely: palette, typography, composition, photo treatment, proportions, spacing. Replicate the clip's motion exactly: timing, easing, direction, and pin behaviour. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images or video. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/. Check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Run the visual side-by-side gate and the motion frame-by-frame gate in VISUAL-TRUTH.md using build-plan/tools/compare-visual.py and compare-motion.py. Look at those composites and fix visible gaps before you commit. Then git add and commit (do not push, do not deploy). If a page or state in this prompt has no approved layout or clip, stop and generate a new Grok Imagine layout/clip first from the existing ones (VISUAL-TRUTH.md). If Grok Imagine, Grok Build, a tool or an install fails, say exactly what failed in your final message and stop; do not switch methods. Clean temp files.

## Goal
Prompt 002 may have just built Home, but staging still showed only the temporary foundation placeholder (split intro, framed lamp-post on the right, stacked "Tina Campbell" title on a field of ink) which does not look like the PDF we sent Tina or like layout 01. This is the correction pass. Replace that temporary Home hero and any leftover placeholder composition so `/` matches the approved Runway home exactly. Do not leave the foundation intro on `/`.

## Must haves
- Desktop Home must match `concepts/site-layouts/01-home-desktop-v2b.jpg`: full-bleed lamp-post hero (fb_141_signature or the best real black-gown lamp-post frame), huge white uppercase serif 'TINA CAMPBELL' across the lower third, mono caption + thin crimson line + 'Scroll', then The Runway (5 tall 4:5 frames, large mono 01-05, thin crimson rule), statement 'Edmonton is my runway.', film-strip category band of all six styles, Editorial Split teaser for The Red Gown, footer band with Edmonton skyline + Walterdale arch and 'Let's make something bold.'
- Mobile must match `concepts/site-layouts/11-home-mobile.jpg`: full-height hero, stacked name, sticky crimson 'Book a shoot' bar (home only, hides when the footer band is visible), runway as native horizontal swipe with scroll-snap + crimson progress bar, categories as a vertical list.
- Look and feel from PDF Concept A Runway (`build-plan/context/pdf-p10-runway.jpg`): dark cinematic ink, photos glowing on black, crimson pills, sideways runway of best shots. Category band also carries Film Strip (`pdf-p15-film-strip.jpg`). Red Gown teaser carries Editorial Split (`pdf-p14-editorial-split.jpg`). Footer carries Bridge and Skyline (`pdf-p19-bridge-skyline.jpg`).
- Motion must match clip `concepts/site-layouts/motion/01-lenis-scroll-home.mp4` exactly (Lenis weight, hero Ken Burns / scale, name SplitText, hero exit vs The Runway rise, statement word scrub). The Home runway strip should follow the pin/sideways feel of `02-runway-pinned-horizontal.mp4` in the lighter Home form described in the 002 prompt and MOTION-SPEC.md (brief pin, sideways scrub, velocity skew, clip-reveal). Footer parallax should nod to clip 06 without becoming the full About hero.
- Live text from COPY.md only. JSON-LD and LCP rules from the 002 prompt still apply. Keep other pages untouched except where the Home placeholder must be removed.

## References (open all of these)
- Layouts: `concepts/site-layouts/01-home-desktop-v2b.jpg`, `concepts/site-layouts/11-home-mobile.jpg`
- Motion clips: `concepts/site-layouts/motion/01-lenis-scroll-home.mp4`, and the Home-scale use of `02-runway-pinned-horizontal.mp4`
- PDF: `build-plan/context/pdf-p10-runway.jpg` (lead), `pdf-p15-film-strip.jpg`, `pdf-p14-editorial-split.jpg`, `pdf-p19-bridge-skyline.jpg`, `pdf-p24-tina-notes.jpg`
- Feedback: `FEEDBACK-MAP.md`

## Verification
Playwright at 3 sizes: full-page screenshots; scroll to the bottom and back up and screenshot mid-points (motion works forward and reverse, nothing stuck hidden).
Required side-by-sides (this is the official Home lock Matt will be pointed at):
- `qa/002b-home-visual-lock/compare/home-1440-vs-layout-01.jpg` (layout 01-home-desktop-v2b left, local 1440 build right)
- `qa/002b-home-visual-lock/compare/home-1440-vs-pdf-p10-runway.jpg` (PDF p10 Runway left, local 1440 build right)
- Also composite mobile 390 against `11-home-mobile.jpg`.
Motion recordings in `qa/002b-home-visual-lock/motion/` compared with compare-motion.py into `qa/002b-home-visual-lock/motion-compare/` against clip 01 (and a short runway-strip recording against clip 02 if the Home strip is scroll-driven). No drift.
If 002 already matches, still run both gates, fix any remaining gaps, and land the files above. Do not keep the temporary split-hero placeholder.

## Commit
fix(home): replace placeholder hero, lock Home to layout 01 and Runway
