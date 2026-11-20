---
id: 017-scene-about-footer-09B-10A
title: About hero 09B blue-hour lights (scrub) and footer band 10A blue-hour drift (loop)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [026-home-01A-03B-on-page]
---
## Goal
`/about/` hero: 09B video scrubbed by hero scroll progress INSIDE the existing layered bridge-and-skyline parallax (do not
remove plates; the video replaces only the sky/city plate it duplicates, lights wave strongest 2.0-3.5 s). Footer contact band
(site-wide `Footer.astro` band and `/book/`): 10A muted loop, poster frame 0, paused off screen, lazy (never loads before the
band is within 1 viewport).
## Must haves
Both via `scene-video.ts`. Footer band must not add any request on pages until scrolled near. Wire seam 09B-10A on /about/
if the band follows the hero there, else log. Seams 10/10.
## Verification
gates `--scenes 01A,03B,04B,06B,09B,10A` (10A gate route is /book/); network log proving lazy footer.
## Commit message
feat(scene-09B-10A): about blue-hour lights scrub and footer blue-hour drift loop

## Added 20 Nov 2026 (gap audit): on-page gate
Gate mode alone is not enough (04B passed at 0.95 yet reads tiny on the page). Also run
`build-plan/gap-audit-2026-11-20/tools/capture-pages.mjs` against the preview for your scenes (copy into site/, ONLY=<IDs>)
and `tools/sheet.py <IDs>` with `STG=qa/<prompt-id>/cap SHEET_OUT=qa/<prompt-id> LABEL="<prompt-id> preview"`. The scene must
read at the size and place it has on the page: full-bleed where the clip is full-bleed. Write per column what still differs.
Photos: follow `build-plan/gap-audit-2026-11-20/PHOTO-PLAN.md` (no repeats on a page).
After 023 the About top is the Editorial Split hero; 09B goes in the full-bleed `[data-about-band]` directly under it (do not
bring back the cut-out layers). 10A must be full-bleed with the bridge as the subject, not a small grey still.
