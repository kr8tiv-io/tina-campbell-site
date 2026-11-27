---
id: 032-approved-scope-audit
title: Approved-scope audit - every section of her current presence, live text only, Journal SEO basics
kind: checkpoint
effort: xhigh
model: grok-4.7
depends_on: [031-phone-strip-even-pace]
---
## Why
Matt approved the build on 11 Nov (company brain DECISIONS.md): exactly the Imagine layouts and motion clips;
Astro + GSAP + Lenis + Three.js; our own text, never baked into images; minimalist classy normal-speech copy; an SEO blog
(Journal) for Edmonton and Alberta photography; every section of her current presence. This prompt proves that scope is
complete before the staging refresh. It adds NO new design, scenes, pages or features beyond filling a gap in that scope.

## Inputs
- `SECTIONS-INVENTORY.md` (repo root): every part of Tina's current presence and where it lives on the new site.
- `/workspace/tina-campbell/build-plan/COPY.md`: approved copy. Live HTML text only.
- `site/src/content/journal/*.md`, `site/src/pages/journal/`, `site/src/pages/rss.xml.ts`.

## Checks (PASS or FAIL only)
1. Coverage table `qa/032-approved-scope-audit/COVERAGE.md`: one row per inventory row -> route, section selector, and a
   390x844 + 1440x900 screenshot (JPEG q75) proving it renders. Any row with no live home = FAIL; fix by adding the
   missing section using existing components, tokens and copy from COPY.md (or the inventory's own wording), additive only.
2. Live text: every heading, label, caption and CTA in the routes is HTML text (Playwright: `innerText` present for each
   inventory section). No new image or video may contain words. Make a contact sheet of every image used as a section
   background or hero (`qa/032-approved-scope-audit/media-sheet.jpg`) for the operator to eyeball; list any you suspect.
3. Copy rules: no em dashes in user-facing text, no "boring", no AI disclaimer captions, no haiku; grep `site/src` and
   `site/dist` and list hits; fix hits in user-facing copy only.
4. Journal SEO basics (no new posts, do not rewrite existing articles): each post has a unique title <= 60 chars, meta
   description 120-160 chars, canonical, `BlogPosting` JSON-LD (author Tina Campbell, datePublished), at least one internal
   link to a service or portfolio page, and Edmonton/Alberta in title or first paragraph. Journal index links every post;
   sitemap and `rss.xml` include every post. No AggregateRating anywhere. Staging stays noindex (do not remove it).
5. New `site/tests/scope.spec.ts`: asserts the coverage rows (route + selector visible with text) and the Journal checks
   above, at desktop and mobile projects.
6. All shared gates from `_CONTEXT.md` with scenes `01A,03B,04B,06B,09B,10A,11B`, seams 10/10, routes 3/3, route visual
   3/3 desktop and `--mobile`, production build + full Playwright with `PLAYWRIGHT_PORT=4831`, 0 failed. Desktop and phone
   visuals of untouched sections unchanged (route visual diff < 1 percent).

Do NOT change: MOTION-LOCKED values, scenes, seams, encoded media, gold frames, gates or thresholds, the 031 phone pace.
Write `qa/032-approved-scope-audit/REPORT.md` (coverage table, fixes made with file paths, journal table) ending with
`GATE 032-approved-scope-audit: PASS|FAIL`.

## Commit message
qa(032): approved-scope audit, coverage table, journal SEO basics
