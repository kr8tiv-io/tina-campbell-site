---
id: 007-services-book
title: Services and Book a shoot
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Build /services/ (layout 08-services-desktop-v2b.jpg) and /book/ (layout 10-contact-book-desktop.jpg).
## Must haves
- Services: Editorial split header (serif H1 + lead left, glam photo right), 6 large rows (big serif number, title, line, 'Pricing on request'), each row's thumbnail on the right; on desktop hover the thumbnail follows the cursor slightly with a velocity bend (GSAP quickTo, CSS transform; WebGL not needed), rows reveal; How it works 3 steps with hairline drawing across on scroll; FAQ accordion (button + aria-expanded, height tween; FAQPage JSON-LD); crimson button.
- Book: blue-hour bridge photo backdrop, huge serif H1, glassy ink form panel (labels, chips as checkboxes styled like pills, date input, location, message, crimson Send it), right column Instagram/Facebook/Edmonton + signature. Form posts to /api/book.php ONLY if a recipient is configured: create public/api/book.php that reads recipient from a config constant BOOKING_TO (empty by default) and, when empty, returns 503 JSON; the client shows the COPY.md 'not yet connected' message with the Instagram link (no fake success). Honeypot field, server-side validation, rate-limit by IP in a temp file, mail() with Reply-To. Client validation + aria-live status. Prefill type from ?type=.
## Verification
Playwright 3 sizes; accordion keyboard; form validation; submitting shows not-yet-connected message (php not run locally: mock fetch 503).
## Commit
feat(services,book): services page and booking form (fail-safe until recipient set)
