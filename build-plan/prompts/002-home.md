---
id: 002-home
title: Home page exactly as layout 01 + clip 01
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Build / to match concepts/site-layouts/01-home-desktop-v2b.jpg (desktop) and 11-home-mobile.jpg (mobile), with the motion of motion clip 01-lenis-scroll-home.mp4 and the runway feel of 02-runway-pinned-horizontal.mp4.
## Must haves
- Hero: full-bleed lamp-post photo (fb_141_signature.jpg or the best real black-gown lamp-post frame; check ig_profile_02/03 too), slow scale 1.08->1 on load, huge white serif 'Tina Campbell' (uppercase via CSS) lower third with SplitText line/char rise, mono caption + thin crimson line + 'Scroll'. Hero photo parallaxes slightly and the name moves at a different speed as you scroll (as in clip 01: hero exits up, The Runway section rises and settles).
- The Runway: label + row of 5 tall 4:5 photos (red gown on truck, red in snow, runway red, runway black under magenta, black leather) with large mono numbers 01-05 under them, thin crimson rule; on desktop the row pins briefly and slides sideways a little with scroll (ScrollTrigger scrub), frames skew with scroll velocity; images clip-reveal. Link 'See all fashion work'.
- Statement H2 'Edmonton is my runway.' words fade/rise scrubbed by scroll + sub line.
- Film-strip category band: 6 frames (Fashion, Runway, Portraits, Bridal, Couples, Edmonton) with sprocket holes (CSS), each a real photo, label under, links to /work/?filter=..., hover lifts and brightens.
- Featured series teaser: Editorial Split, left ink text (label, 'The Red Gown', text, link), right photo of the red gown on the teal truck with parallax inside mask.
- Footer band: Edmonton skyline + Walterdale arch photo (fb_066_city / fb_168_city) darkened, serif 'Let's make something bold.', text, crimson pill, large white TCPhoto signature.
- Mobile (390/360): match 11-home-mobile.jpg: hero full height, stacked name, sticky crimson 'Book a shoot' bar at bottom (home only, hides when footer band visible), runway as native horizontal swipe with scroll-snap + crimson progress bar, categories as a vertical list with thumbnails and big serif labels.
- JSON-LD ProfessionalService/LocalBusiness + Person on home. LCP = hero image eager, fetchpriority high.
## Verification
Playwright at 3 sizes: screenshots full page; scroll down to bottom and back up and screenshot mid-points (motion works forward and reverse, nothing stuck hidden); reduced motion all visible; no overflow; no broken images. Compare with the layout and fix gaps.
## Commit
feat(home): home page per layout 01 and motion clip 01
