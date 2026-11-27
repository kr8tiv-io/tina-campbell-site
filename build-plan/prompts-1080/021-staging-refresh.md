---
id: 021-staging-refresh
title: Release check before the staging refresh (operator deploys)
kind: checkpoint
effort: xhigh
model: grok-4.7
depends_on: [020-mobile-pass]
---
## Goal
Prove the production build is staging-safe and complete. This is a check, not a redesign: fix only what fails a check
below, additive and minimal. Do not deploy, upload or touch the network (the operator backs up staging and uploads).

Stack (already in the repo, do not add libraries): Astro 5 (static output in `site/dist`), GSAP 3 + ScrollTrigger
(registered once in `site/src/scripts/motion/runtime.ts`), Lenis (owned by `core.ts`), Three.js (runway curved strip,
work noir grid), `@playwright/test` against the Astro preview.

## Checks (PASS or FAIL only; close = FAIL)
Run on a production build (`unset TC_MOTION_LAB; npm --prefix site run build`).
1. Noindex: every `site/dist/**/*.html` has `<meta name="robots" content="noindex...">`; `dist/robots.txt` contains
   `Disallow: /`; `dist/.htaccess` sends `X-Robots-Tag "noindex, nofollow"`. (`build-plan/tools/staging-zip.sh` refuses
   otherwise; do not run it, only replicate its checks.)
2. No `motion-lab` anywhere in `dist` (files, links, sitemap). Sitemap and `rss.xml` list only real routes and journal posts.
3. Exactly one `<h1>` per page; every page has a unique `<title>` and meta description.
4. Links: crawl every internal `href`/`src` in `dist` (a small Node or Python script under `qa/021-staging-refresh/`);
   0 broken targets, nav and footer included, `/book/` reachable from every page.
5. Scene media: for every scene in `site/public/media/scenes/manifest.json`, poster, end still and every listed source
   exists and is non-empty.
6. Page weight table per route (HTML, CSS, JS gzip, first-view images) in RELEASE.md; flag any route over 2.5 MB first view.
7. All shared gates from `_CONTEXT.md` with scenes `01A,03B,04B,06B,09B,10A,11B`, seams 10/10, routes 3/3, route visual
   3/3 desktop and `--mobile`, then production build + full Playwright with `PLAYWRIGHT_PORT=4831` (never 4321), 0 failed.

## Output
`qa/021-staging-refresh/RELEASE.md`: table of checks 1-7 with PASS/FAIL and evidence paths, the weight table, the commit
SHA checked. Keep qa light (no frame folders, no webm). Final line `GATE 021-staging-refresh: PASS|FAIL`.

## Commit message
qa(021): release check for staging refresh
