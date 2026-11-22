# 024 photo library spread

PASS

23 new frames from Tina's Facebook library are in the site. Each built page shows a photo once. A photo sits on at most 3 pages besides `/work/`. Runway frames stay on runway sections. `ig_profile_02` is not rendered. The file stays on disk.

The plan's "96 after 024" counted photos that were already in the library. The folder now has 93 files. 92 are rendered. `ig_profile_02` is the one retired file.

## Before / after

`photo_audit.py` reads `dist/**/index.html` only. It does not count `404.html`.

| | Before | After |
|---|---|---|
| Pages | 19 | 19 |
| Distinct used | 72 of 72 | 92 of 93 |
| Total uses | 223 | 199 |
| Per-page repeats | home, fashion, runway, all five series, work | none |
| Unused | none | `ig_profile_02` |

Before, the heaviest frames were `fb_029_runway` 16 uses on 7 pages, `fb_012_runway` 13/5, `fb_046_signature` 11/6, `fb_016_signature` 11/5, `fb_001_city` 8/6, `fb_168_city` 8/7. Runway repeated 8 frames across 24 slots.

After, the busiest frames have 4 uses on 4 pages, and one of those pages is always `/work/`. That is 3 pages besides the archive. No page repeats a photo. `/runway/` is 14 uses, 14 distinct. `/work/` is 92 uses, 92 distinct.

The spread test also reads `404.html`. `fb_000_landscape` is on the home strip and the 404 page (2 pages). Violations: 0.

## New photos

Listed in `NEW-PHOTOS.csv`. None were dropped. No Lanczos. `fb_171_bts` and `fb_125_bts` were already on disk and were rechecked, not re-encoded. `fb_148_fashion` is the left half of a two-up (540x1080, JPEG q92), a natural crop, and it is a small work tile.

Corner and lower-band crops are in `markcheck/`.

Kept as scene content, not marks: the hat label on `fb_054_fashion`, the street sign on `fb_069_fashion`, the Canon strap on `fb_125_bts`, the cafe banner on `fb_139_portrait`.

Film-strip frames that failed the mark check were replaced:

| Slot | Planned | Used | Why |
|---|---|---|---|
| Runway | `fb_064_runway` | `fb_041_runway` | WCFW plate. `fb_064` stays on `/runway/` only. |
| Bridal | `fb_059_bridal` | `fb_061_bridal` | Script. `fb_059` stays in the archive. |
| Couples | `fb_031_couples` | `fb_007_couples` | Script. `fb_031` stays in the archive. |
| Edmonton | `fb_001_city` | `fb_066_city` | Script. `fb_001` stays on the blue-hour series page. |

`fb_140_portrait` is 768px on the short side, so it is a small work tile only. The portrait film-strip frame stayed `fb_048_portrait`. The magazine is the prop.

Existing frames the map still uses, logged and not cropped to hide a mark: WCFW plates on `fb_037`, `fb_060`, `fb_064`, `fb_085`, `fb_105`, `fb_158`. Script on `fb_056`, `fb_049`, `fb_059`, `fb_031`, `fb_001`, `fb_168`, `fb_577`. The river-valley card still shows that script. `fb_012_runway` has garment lettering, not a WCFW plate.

## Page map

Home strip: signature, runway (`fb_041`), portraits, bridal, couples, Edmonton, landscape. Home runway strip: five distinct runway frames, no peek clone. Fashion split and pull follow the plan. Frames that are not a series story link to `/work/?filter=fashion`. Portraits, bridal, and couples chapters follow the plan. `/runway/` is 14 distinct frames. The curved strip pads by wrapping the texture index, not by repeating `<img>` tags. Series bodies do not repeat the cover. The red-in-snow next thumb is an empty frame because the next cover is a runway photo already on 3 pages. About, services, book, journal locations, and the 404 frame follow the plan. `/work/` shows every rendered library photo once. The feature tile is that photo's one place.

The 04B-05C echo still needs the opening three pictures or the end of the seam is a black slab. Those pictures are cloned into the echo when motion starts, so the built HTML still has each photo once.

## Gates

| Gate | Result |
|---|---|
| `npm run check` | PASS |
| scene gate `01A,03B,04B` | PASS |
| seam gate | PASS 10/10 |
| seam route check | PASS 3/3 |
| seam route visual desktop | PASS 3/3 |
| seam route visual mobile | PASS 3/3 |
| production build, no motion-lab, noindex | PASS |
| Playwright | PASS 44 passed, 24 skipped, 0 failed |
| photo-spread | PASS |

Scene gate worst SSIM: 01A 0.9748 (frame 95), 03B 0.9613 (frame 83), 04B 0.9531 (frame 1). Bad frames 0/145 on each.

Seam gate worst SSIM 1.0000 on every pair. Timing diffs 0.

Route check: `01A-02A`, `02A-03B`, `04B-05C`, diffs 0. Re-run after the echo clone, still diffs 0.

Route visual desktop: `01A-02A` dark 0.63 vs gold 0.45, `02A-03B` 0.66 vs 0.53, `04B-05C` 0.04 vs 0.12. Mobile: 0.55 vs 0.50, 0.67 vs 0.66, 0.22 vs 0.19.

The first visual pass failed `04B-05C` at dark 1.00 vs gold 0.24 because the echo was empty. The runtime clone is the one fix. The second pass is the one above.

One full Playwright run timed out once on the small-viewport loader (6s, machine busy after a motion recording). The same test passed alone in 8.3s. The full suite was run again: 44 passed, 24 skipped, 0 failed. The new spread test is in that pass. It skips the mobile, small, and reduced projects because the HTML does not change.

Production build: 20 pages. No `motion-lab` path. Home robots `noindex, nofollow`.

Client JS added by this prompt is the work-echo clone in `seams.ts`. It is a few hundred bytes, under the 15 KB gzip budget. `photo-audit.mjs` is a Node script, not shipped.

## Shots

`qa/024-photo-library-spread/shots/`. Desktop 1440x900 and mobile 390x844 at DPR 3, scroll 0, for home, work, fashion, portraits, runway, about, services, book, the five series, journal, the locations article, and the 404 page. Scene start, middle, and end for 01A, 02A, 03B, 04B, 06B, 09B, and the series cover. One reduced-motion home shot: `reduced-home-scroll0.jpg`.

Headless Chrome leaves the runway video layer out of a page screenshot, so the 03B middle frame is black there. The scene-gate frames are the SSIM proof. `desktop-home-03B-start.jpg` shows the runway still. `desktop-home-02A-middle.jpg` shows the film strip. `desktop-home-runway-strip.jpg` shows the five runway frames.

Contact sheet, one row per page: `qa/024-photo-library-spread/pages-sheet.jpg`.

Suggested commit: `feat(photos): 23 more of Tina's real photos, one use per page, runway shots kept on runway sections`
