---
id: 005-editorial
title: Fashion & Editorial, series pages, Portraits/Bridal/Couples (clip 04)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Build /fashion-editorial/ (layout 03-fashion-editorial-desktop-v2.jpg), /series/[slug]/ for the 5 series (layout 04-series-story-desktop-v3.jpg, mobile 12-series-mobile-v2.jpg) and /portraits-bridal-couples/ (layout 05-portraits-bridal-desktop-v2.jpg), with the motion of clip 04-editorial-split-reveal.mp4.
## Must haves
- Editorial Split: left panel pinned (sticky) with logo mark, H1 lines revealed with SplitText (mask lines), lead line fades, series index rows tick in one by one; right column photos unmask with clip-path inset from top as they enter, thin crimson vertical divider; active series index item turns crimson as its photos scroll into view (ScrollTrigger). Pull quote section + 4 photo strip, collab band with crimson Collaborate button.
- Series pages from data: cover (full-bleed photo with title + mono meta, title SplitText), credits + intro text column beside large photo, pair of photos, full-width photo with film-strip frame number, 'Next series' footer with thumbnail and crimson arrow (thumbnail gets data-flip-id). BreadcrumbList + ImageGallery JSON-LD.
- Portraits/Bridal/Couples: three chapters (Ch. 01/02/03), photo left, heading + text + 'See the gallery' crimson link right; reveal on scroll. Use real portrait, bridal and couples photos.
- Mobile: stack (photo then text), keep reveals light.
## Verification
Playwright 3 sizes, scroll forward/back, reduced motion, no overflow; series pages all 5 build; compare with layouts.
## Commit
feat(editorial): editorial split pages, series template, portraits-bridal-couples
