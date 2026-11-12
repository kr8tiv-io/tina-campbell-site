---
id: 009-transitions
title: Page transitions: Flip tile-to-cover + film-strip (clip 05)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Implement page transitions matching clip 05-page-transition-flip.mp4 and layout 15-motion-page-transition.jpg across the whole site.
## Must haves
- Astro ClientRouter. Clicking a Work tile (or Home teaser / Next series thumbnail) with data-flip-id: the image grows from its grid position to the full-bleed series cover (view-transition-name shared element and/or GSAP Flip across the swap), other tiles slide off left like film frames with slight motion blur, a thin crimson line wipes across; the cover title then rises (SplitText).
- Default transition between other pages: film-strip advance (old page slides left with sprocket edge band, new page enters from right) under 700ms.
- Back/forward works, focus moves to main h1 after navigation, scroll restored correctly, all motion modules re-init with no duplicate ScrollTriggers (assert ScrollTrigger.getAll().length sane after 5 navigations), Lenis recreated once.
- Reduced motion: instant swap with 150ms fade.
## Verification
Playwright: navigate Work -> series -> next series -> back, check no errors, triggers count stable, h1 focused; screenshots mid-transition (page.waitForTimeout) saved.
## Commit
feat(transitions): flip tile-to-cover and film-strip page transitions
