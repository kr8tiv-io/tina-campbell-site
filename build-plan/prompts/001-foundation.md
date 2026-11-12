---
id: 001-foundation
title: Astro foundation, design system, shell, motion core
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Create the Astro project in site/ and everything every page shares.
## Must haves
- Astro 5 static, TypeScript strict, deps: astro, @astrojs/sitemap, gsap, lenis, three, @fontsource/instrument-serif, @fontsource/inter-tight, @fontsource/jetbrains-mono, @playwright/test (dev). Keep node_modules lean.
- Update root .gitignore whitelist per SPEC (site/, build-plan/, qa/, SECTIONS-INVENTORY.md; ignore node_modules, dist, test-results).
- Tokens + base CSS (SPEC), film grain overlay, skip link, focus styles.
- BaseLayout: head (title/meta/canonical/OG/Twitter, JSON-LD slot, PUBLIC_NOINDEX robots meta default true), ClientRouter view transitions, header (logo PNG left, nav, crimson Book a shoot pill; hides on scroll down, shows on up; mobile menu overlay), footer (COPY.md), crimson cursor dot that grows into a 64px circle with label from data-cursor (fine pointer only).
- src/scripts/motion/core.ts: Lenis on gsap.ticker + ScrollTrigger sync, reduced-motion detection, init/destroy lifecycle bound to astro:page-load and astro:before-swap, a reveal helper (data-reveal: fade-up, clip-up [clip-path inset bottom->0 with inner image scale 1.15->1], lines [SplitText mask lines rise, 80ms stagger]), velocity skew helper for [data-skew] (max 4deg, springs back).
- Signature loader (layout 14-motion-loader-signature.jpg): trace brand/tcphoto-logo-white-transparent.png to SVG (potrace or imagetracerjs); on first visit per session the logo strokes draw/fill in white over ink, mono counter 000->100 bottom right, crimson line fills bottom; then the mark shrinks into the header logo slot (GSAP Flip) and the page reveals. Max 2.2 s. Skipped for reduced motion and on later navigations.
- src/data/photos.ts per SPEC (look at photos to verify categories/series; write real alt text). Copy needed photos to src/assets/photos/. A Photo.astro component using astro:assets <Picture> AVIF+WebP, widths, sizes, lazy by default.
- public/.htaccess (X-Robots-Tag noindex when staging, HTTPS redirect, long cache for /_astro/), robots.txt disallow-all while noindex, 404 page (ink, logo, 'This page wandered off the runway.' + link home).
- Placeholder index page that uses the layout so the build passes (Home itself is prompt 002).
## Verification
build passes; Playwright: header/footer render at 3 sizes, no overflow, loader runs once then not on reload in same session, reduced motion shows content immediately, noindex meta present.
## Commit
feat(site): Astro foundation, design system, motion core, signature loader
