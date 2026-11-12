---
id: 003-runway
title: Runway page + Three.js curved catwalk (clip 02)
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Build /runway/ to match 06-runway-gallery-desktop-v2.jpg with the motion of clip 02-runway-pinned-horizontal.mp4.
## Must haves
- Section pins (ScrollTrigger pin + scrub) and vertical scroll drives the strip horizontally through ALL runway photos, then releases. Also drag (GSAP Observer) on desktop.
- Three.js: each photo is a plane on a gentle concave curve (like the layout: frames recede at the edges), centre frame larger, sharp and bright; side frames smaller, dimmer, slightly blurred (shader uniforms). Film-strip sprocket bands top and bottom (CSS or texture), crimson progress rail with dot under the title, cursor label 'Drag'. Lazy-load Three after WebGL check; DPR cap 1.5; pause when off-screen; textures from astro:assets URLs at ~1200px.
- Fallback (no WebGL / reduced motion / coarse pointer): native horizontal scroll-snap strip with the same look, progress bar.
- Reusable module src/scripts/webgl/curvedStrip.ts (Home can use a lighter CSS version).
## Verification
Playwright: at 1440 scroll through pin and back, screenshot start/middle/end, assert strip transform changes and reverses; mobile swipe strip scrolls; reduced motion fallback; fps sanity (no long tasks > 200ms during scroll in a performance trace if feasible).
## Commit
feat(runway): pinned horizontal catwalk with Three.js curved panels
