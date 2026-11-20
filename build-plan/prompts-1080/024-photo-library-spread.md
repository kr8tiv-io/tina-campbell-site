---
id: 024-photo-library-spread
title: Add 23 clean photos from Tina's Facebook library and spread photos so no page repeats one
kind: build
effort: xhigh
model: grok-4.7
depends_on: [023-about-hero-editorial-split]
---
## Why
Gap audit (`build-plan/gap-audit-2026-11-20/GAP-LIST.md`, photo section; `photo_audit.txt`, `neardup.txt`): 194 placements
use only 70 photos, /runway/ shows fb_012 and fb_029 eight times each, fb_029_runway sits on 7 pages, fb_168_city on 8,
series pages repeat their own cover, and 121 of 185 Facebook photos are unused. Matt: pull more diverse photos, keep WCFW
runway shots on runway sections.

## Do exactly what `build-plan/gap-audit-2026-11-20/PHOTO-PLAN.md` says
1. Import the 23 new picks from `/workspace/tina-campbell/raw/fb_all/` (fbid in the table) into `site/src/assets/photos/`
   with the new ids, after the full-size corner and bottom-band check (3x crops saved to `qa/024.../markcheck/`). Any pick
   that shows a mark or text is dropped and logged; take the next clean frame of the same kind from `pool-unused-*.jpg`.
   No painting out, no AI upscaling; Lanczos up to 1.25x only if a slot needs it, logged.
2. Add them to `src/data/photos.ts` (category, orientation, honest alt text, series where it fits). Do not edit
   `/workspace/tina-campbell/images/MANIFEST.*`; list the additions in `qa/024.../NEW-PHOTOS.csv`.
3. Retire ig_profile_02 from every placement (identical to fb_141_signature); keep the file.
4. Apply the page and section map in PHOTO-PLAN.md: home, fashion-editorial, portraits-bridal-couples, runway catwalk
   (14 distinct, no duplicate items in the DOM; if the WebGL loop needs padding, pad in the shader/texture index, not with
   repeated `<img>`), about, services, book, series pages (no cover repeat in the body), journal.
5. /work/ shows every library photo exactly once (feature tile counts as that photo's one place).
6. Add `site/scripts/photo-audit.mjs` and a Playwright test `tests/photo-spread.spec.ts` that reads the built HTML and
   fails if: any photo id appears twice on one page; any photo appears on more than 3 pages besides /work/; any runway id
   (`_runway`) appears outside /runway/, /series/runway-nights/, the home runway section, the home strip Runway frame or
   the Runway service card; any retired id is rendered.

## Gate
photo-spread test green; re-run `build-plan/gap-audit-2026-11-20/tools/photo_audit.py site/dist site/src/assets/photos`
and paste the before/after table; usual `_CONTEXT.md` gates (`--scenes 01A,03B,04B`), seams 10/10, routes 3/3 plus 3/3,
Playwright 42+ pass, no motion-lab in production. Contact sheet of every page's photos (one row per page) at
`qa/024-photo-library-spread/pages-sheet.jpg`.

## Commit message
feat(photos): 23 more of Tina's real photos, one use per page, runway shots kept on runway sections
