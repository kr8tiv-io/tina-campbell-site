---
id: 023-about-hero-editorial-split
title: About hero redone as Editorial Split (ink text panel plus a real behind-the-camera photo)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [022-scene-filmstrip-02A]
---
## Why
Gap audit rank 2 (`build-plan/gap-audit-2026-11-20/about-hero-current.jpg`): the /about/ top is a collage of cut-outs
(`src/assets/about-layers/sky.webp`, `arch.webp`, `figure.webp`). The left shape (`figure.webp`, a black silhouette
288x763) reads as a map of Alberta, not a person. Matt: redo it in the Editorial Split style, matching the locked look.

## Build
- Same split grammar as /fashion-editorial/ (06B) and the services header: left ink panel (#0C0C0F) with the eyebrow, the
  one h1 ("Tina Campbell"), a two-line intro in her voice from the existing About copy (no new claims, no em dashes) and the
  Book button; right a real photo, full height, object-fit cover, a thin crimson (#B3261E) rule on the seam between panels.
- Photo: `fb_171_bts` (raw index #171, `/workspace/tina-campbell/raw/fb_all/fb_477002674212609.jpg`, B&W, photographer
  behind the camera by a glass table). Alternate `fb_125_bts` (#125, `fb_253103339935878.jpg`, crop off the black
  letterbox). Add to `site/src/assets/photos/` and `src/data/photos.ts` per PHOTO-PLAN rules (corner check for marks).
  See `gap-audit-2026-11-20/about-hero-candidates.jpg`. Alt text must not name Tina (not confirmed):
  "A photographer behind the camera in a bright studio corner."
- Motion on the locked look: on load the photo reveals from the seam outward (clip-path inset 0 100% 0 0 to 0, 0.9 s, ease
  cine), the ink panel text rises 12 px with a 0.08 stagger; on scroll the photo drifts 6 percent slower (parallax) and the
  crimson rule grows to full height. Reduced motion: static, no drift.
- Phone: photo on top (60svh), ink panel below, h1 still the first heading.
- The 09B blue-hour scene moves to a full-bleed band directly under this hero (017 builds the video; here leave a
  `data-about-band` section with the poster `09B-end.webp` from `site/public/media/scenes/09B/`, no text in it).
- Keep the cut-out layer files in the repo (delete nothing), just stop rendering them; remove their `<link rel=preload>` if
  any. Keep `[data-about-hero]` on the new hero so tests and capture tools still find it.

## Gate
Usual `_CONTEXT.md` gates (`--scenes 01A,03B,04B` regression), seams 10/10, routes 3/3 plus 3/3, Playwright 42+ pass
(update about tests only where the old layers were asserted), 1 h1, noindex. Screenshots desktop and phone at scroll 0,
400, 800 and reduced motion; side-by-side with the 06B reference end frame (`/tmp` not allowed: save under
`qa/023-about-hero-editorial-split/`). State honestly how close it is to the Editorial Split look.

## Commit message
feat(about): editorial split hero with a real behind-the-camera photo
