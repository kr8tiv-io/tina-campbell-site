---
id: 021-staging-refresh
title: Release check before the staging refresh (operator deploys)
kind: checkpoint
effort: xhigh
model: grok-4.7
depends_on: [020-mobile-pass]
---
## Goal
Production build is staging-safe: noindex meta on every page, `robots.txt` Disallow, no motion-lab routes, sitemap without
lab pages, all links resolve (no 404s from nav), every scene's poster/end/sources exist, page weight table per route.
Write `qa/021-staging-refresh/RELEASE.md` with the table and all gate results. Do not deploy (the operator does it).
## Commit message
qa(021): release check for staging refresh
