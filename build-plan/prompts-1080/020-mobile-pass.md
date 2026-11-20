---
id: 020-mobile-pass
title: Mobile pass for all 11 scenes and 10 seams
kind: build
effort: xhigh
model: grok-4.7
depends_on: [019-scene-transitions-08B]
---
## Goal
390x844 and 768x1024: every scene readable, subject kept in frame (per-scene object-position, documented), 720p sources
used, no horizontal scroll, pins do not trap the user, iOS Safari-safe (playsinline, muted, no autoplay with sound, video
paused off screen). Lighthouse mobile on `/`: LCP <= 2.5 s on the local preview with 4x CPU throttle, CLS < 0.05.
## Carried from the 013 operator gate (must fix here)
- Home hero on phones (<= 960px): the locked 01A clip has an intentional empty dark band in its lower ~29% (the concept
  reserves it for the name). On desktop the title sits in that band. On 390x844 the title and caption sit over the
  photo and the band is empty black above the Book bar. Move the title and caption down into the band on phones (or
  equivalent) so the phone hero reads like the desktop one. Do not crop or alter the video; do not re-encode media.
- Hero caption and data are stale: the hero is now fb_013_signature (The Red Gown, Edmonton, Alberta per
  src/data/photos.ts) but `index.astro` still uses `getPhoto('fb_141_signature')` for BaseLayout imageAlt / OG and the
  caption reads "No. 001 / Alberta Legislature, Edmonton". Switch the hero data to fb_013_signature and the caption to
  "No. 001 / The Red Gown, Edmonton". Update the two caption expectations in tests/home.spec.ts and
  tests/home-lock.spec.ts to the new text (that is the only test edit allowed). No em dashes.
## Verification
All gates; screenshot grid of every route at both sizes in `qa/020-mobile-pass/shots/`; Lighthouse JSON saved.
## Commit message
fix(mobile): scene framing, sources and pins for phones and tablets
