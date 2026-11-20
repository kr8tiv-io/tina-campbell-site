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
## Verification
All gates; screenshot grid of every route at both sizes in `qa/020-mobile-pass/shots/`; Lighthouse JSON saved.
## Commit message
fix(mobile): scene framing, sources and pins for phones and tablets
