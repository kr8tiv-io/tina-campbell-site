# 021 staging refresh

Production build with `TC_MOTION_LAB` unset. Commit `3434e23654e16ea4d20a875ff78c5ea00fc5cb4f`. The tree also has one uncommitted fix: the 404 canonical now points at `/404.html`. Rebuild from that commit alone and the broken `/404/` canonical comes back. Suggested operator commit: `qa(021): release check for staging refresh`.

No deploy and no upload.

## Checks

| # | Check | Verdict | Evidence |
|---|---|---|---|
| 1 | Noindex on every HTML page, `robots.txt` `Disallow: /`, `.htaccess` `X-Robots-Tag "noindex, nofollow"` | PASS | `qa/021-staging-refresh/checks.json` (`1_noindex`). 20 HTML files. |
| 2 | No `motion-lab` in `dist`. Sitemap and `rss.xml` list only real routes and journal posts | PASS | `checks.json` (`2_routes`). Sitemap index points at `sitemap-0.xml`. 19 page URLs. RSS has the 5 journal posts. `site/dist/motion-lab` is absent. |
| 3 | One `h1` per page. Unique title and meta description | PASS | `checks.json` (`3_headings`). 20 pages, including `/404.html`. |
| 4 | Internal `href` / `src` crawl, `/book/` on every page | PASS | `qa/021-staging-refresh/audit.py`, `checks.json` (`4_links`). 0 broken targets. `/book/` is linked from every page, nav and footer included. |
| 5 | Scene poster, end still, and every listed source exists and is non-empty | PASS | `checks.json` (`5_scene_media`). Checked in `site/public` and `site/dist`. |
| 6 | First-view weight, flag over 2.5 MiB | PASS | `qa/021-staging-refresh/weight-table.md`. Heaviest route is `/work/` at 1,505,936 bytes (1.44 MiB). Limit is 2,621,440 bytes. None flagged. |
| 7 | Scene gate, seams 10/10, routes 3/3, route visual 3/3 desktop and mobile, production Playwright on port 4831 | PASS | Paths below. Playwright: 75 passed, 129 skipped, 0 failed (`qa/021-staging-refresh/playwright.txt`). |

## Fix

Astro writes the 404 document to `/404.html`. With `trailingSlash: 'always'`, the canonical and `og:url` were `https://lightsteelblue-lark-427091.hostingersite.com/404/`, which is not a file. `BaseLayout` now takes an optional `canonicalPath`. Only the 404 page sets it, to `/404.html`. Other pages keep `Astro.url.pathname`.

Client chunk `BaseLayout.astro_astro_type_script_index_0_lang.CLFHRB6r.js` is unchanged at 94.35 kB, gzip 27.76 kB. This prompt adds 0 bytes of JS.

## Scene media note

`01A` `h264_720` in `site/public/media/scenes/manifest.json` is listed as `/media/scenes/01A/01A-1080.mp4`. That file exists and is non-empty. The manifest and the encoded media were not edited.

## Weight

Bytes are gzip-9 for HTML, CSS, and JS (each linked script plus its static ESM imports). Fonts are file size for every `@font-face` in the linked CSS, including latin-ext and woff fallbacks, so that column is higher than an English page download. Images are one candidate per non-lazy picture (AVIF, else WebP, else the `img`), plus posters and CSS images. Lazy images and scene video files are not included. A 1440px slot picks the `srcset` candidate.

Dynamic `import()` chunks are outside the total: `three.module` gzip 128.57 kB, `noirGrid` 4.08 kB, `curvedStrip` 5.51 kB. Adding Three.js and the work grid to `/work/` still leaves that route under 1.7 MiB.

| Route | HTML gzip | CSS gzip | JS gzip | Fonts | First-view images | First view | Flag |
|---|---:|---:|---:|---:|---:|---:|---|
| / | 19078 | 20347 | 101952 | 662120 | 379433 (11) | 1182930 | |
| /404.html | 14761 | 12564 | 101952 | 662120 | 162890 (4) | 954287 | |
| /about/ | 17234 | 14648 | 101952 | 662120 | 175111 (5) | 971065 | |
| /book/ | 15993 | 15190 | 101952 | 662120 | 173414 (5) | 968669 | |
| /fashion-editorial/ | 18247 | 16377 | 101952 | 662120 | 286623 (6) | 1085319 | |
| /journal/ | 15960 | 15190 | 101952 | 662120 | 277934 (5) | 1073156 | |
| /journal/bridal-portraits-edmonton/ | 18772 | 15190 | 101952 | 662120 | 206208 (5) | 1004242 | |
| /journal/edmonton-photoshoot-locations/ | 18820 | 15190 | 101952 | 662120 | 277934 (5) | 1076016 | |
| /journal/engagement-photos-edmonton/ | 18747 | 15190 | 101952 | 662120 | 199741 (5) | 997750 | |
| /journal/model-portfolio-alberta/ | 18954 | 15190 | 101952 | 662120 | 217517 (5) | 1015733 | |
| /journal/what-to-wear-photoshoot/ | 19037 | 15190 | 101952 | 662120 | 361373 (5) | 1159672 | |
| /portraits-bridal-couples/ | 16987 | 16377 | 101952 | 662120 | 341856 (6) | 1139292 | |
| /runway/ | 18789 | 12564 | 101952 | 662120 | 436233 (18) | 1231658 | |
| /series/blue-hour/ | 16566 | 16377 | 101952 | 662120 | 162890 (4) | 959905 | |
| /series/legislature-in-black/ | 16411 | 16377 | 101952 | 662120 | 162890 (4) | 959750 | |
| /series/red-in-snow/ | 16319 | 16377 | 101952 | 662120 | 162890 (4) | 959658 | |
| /series/runway-nights/ | 16359 | 16377 | 101952 | 662120 | 162890 (4) | 959698 | |
| /series/the-red-gown/ | 16293 | 16377 | 101952 | 662120 | 162890 (4) | 959632 | |
| /services/ | 17352 | 15190 | 101952 | 662120 | 188909 (5) | 985523 | |
| /work/ | 29375 | 16842 | 101952 | 662120 | 695647 (9) | 1505936 | |

## Gates

Scene gate (`qa/021-staging-refresh/scene-gate/REPORT.md`), motion-lab preview `http://127.0.0.1:4821`:

| Scene | Verdict | Worst SSIM | Frame |
|---|---|---:|---:|
| 01A | PASS | 0.9774 | 95 |
| 03B | PASS | 0.9613 | 83 |
| 04B | PASS | 0.9531 | 1 |
| 06B | PASS | 0.9816 | 5 |
| 09B | PASS | 0.9319 | 1 |
| 10A | PASS | 0.9526 | 73 |
| 11B | PASS | 0.9662 | 5 |

Seam gate 10/10, worst SSIM 1.0000, timing diffs 0 (`qa/021-staging-refresh/seam-gate/REPORT.md`).

Route check 3/3 (`qa/021-staging-refresh/seam-route-check.txt`).

Route visual desktop 3/3 (`qa/021-staging-refresh/route-visual/REPORT.md`): 01A-02A dark 0.44 vs gold 0.45, 02A-03B 0.04 vs 0.04, 04B-05C 0.04 vs 0.12.

Route visual mobile 3/3 (`qa/021-staging-refresh/route-visual-mobile/REPORT.md`): 01A-02A 0.49 vs gold 0.50, 02A-03B 0.91 vs 0.79, 04B-05C 0.25 vs 0.21. Pin length 3.2vh on every seam.

Playwright on the production build, `PLAYWRIGHT_PORT=4831`: 75 passed, 129 skipped, 0 failed, 18.8m.

Frame folders and webm captures from the gates were removed after the scores were written. Contact sheets for the route visual remain.

## Shots

The only route whose markup changed is `/404.html`. Chrome screenshots, scroll 0, after the loader finishes:

- `qa/021-staging-refresh/shots/d1440-404-scroll0.jpg` (1440x900)
- `qa/021-staging-refresh/shots/m390-404-scroll0.jpg` (390x844, DPR 3)
- `qa/021-staging-refresh/shots/reduced-d1440-404-scroll0.jpg` (reduced motion)

The heading "Page not found" and the line "This page wandered off the runway." are readable. Header Book link is present on desktop. The phone shot shows the menu button. Canonical in the document is `/404.html`.

GATE 021-staging-refresh: PASS
