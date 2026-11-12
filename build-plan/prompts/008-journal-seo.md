---
id: 008-journal-seo
title: Journal + 5 articles + technical SEO
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/VISUAL-TRUTH.md, /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Follow VISUAL-TRUTH.md exactly. Primary truth is the named Grok Imagine layout(s) and motion clip(s); the named PDF concept page(s) in build-plan/context/ confirm Tina's direction (favourites: Runway and Editorial; she really likes editorial for pages and how it looks on display, with text; fashion & editorial stand out most; she enjoys all styles). Open every named layout and PDF page, and watch every named clip all the way through (ffmpeg frames to /tmp, delete after). Match the layout closely: palette, typography, composition, photo treatment, proportions, spacing. Replicate the clip's motion exactly: timing, easing, direction, and pin behaviour. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images or video. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/. Check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Run the visual side-by-side gate and the motion frame-by-frame gate in VISUAL-TRUTH.md using build-plan/tools/compare-visual.py and compare-motion.py. Look at those composites and fix visible gaps before you commit. Then git add and commit (do not push, do not deploy). If a page or state in this prompt has no approved layout or clip, stop and generate a new Grok Imagine layout/clip first from the existing ones (VISUAL-TRUTH.md). If Grok Imagine, Grok Build, a tool or an install fails, say exactly what failed in your final message and stop; do not switch methods. Clean temp files.

## Goal
Build /journal/ (layout 09-journal-desktop-v2b.jpg) and /journal/[slug]/ article pages (layouts 17-journal-article-desktop.jpg and 18-journal-article-mobile.jpg), and complete technical SEO for the whole site. The index is Film Strip (Tina ticked PDF p15). Article pages are Editorial Split in spirit (sticky TOC on the left at desktop, text beside photography, not a TOC at the bottom).

## Must haves
- Content collection src/content/journal (Markdown, frontmatter: title, description, date, updated, hero, heroAlt, tags, location). Index: featured post with 2.39:1 letterboxed photo whose bars open on enter, then film-strip rows (frame number, thumbnail, title, date) sliding in.
- Write 5 genuinely useful articles (900 to 1400 words each), normal readable voice, first person as Tina where natural, no filler, no em dashes, no fake facts (no invented prices, dates, client names, quotes or permits; when unsure, say 'check current rules with the City of Edmonton' etc.). Topics and target searches:
  1. 'The best photoshoot locations in Edmonton (and when to go)': Alberta Legislature grounds, Walterdale Bridge, High Level Bridge, Muttart-area river valley, Old Strathcona/Whyte Ave alleys, Ice District glass, Hawrelak Park, Mill Creek Ravine; light, crowds, seasons. (edmonton photoshoot locations)
  2. 'What to wear for a fashion or glam photoshoot': colour (red on blue sky, black on stone), fit, layers, shoes, hair/makeup, bring list. (what to wear photoshoot edmonton)
  3. 'Planning bridal portraits in Edmonton and St. Albert': timing, indoor glass/atrium options, winter brides, working with a stylist/bridal shop, timeline. (bridal photographer edmonton, st albert)
  4. 'Couples and engagement photos in Edmonton: a season-by-season guide'. (engagement photographer edmonton)
  5. 'Model portfolio shoots in Alberta: what agencies want to see' (digitals vs editorial, comp card, number of looks). (model portfolio photographer alberta)
  Use real photos from images/ as heroes and inline images with alt text. Each ends with a short soft call to /book/. Internal links between posts and to /services/, /work/.
- Article page: title (SplitText), meta (date, read time, location), hero, prose styles (serif headings, comfortable 68ch measure), table of contents on desktop (sticky left, not at the bottom), related posts, Article + BreadcrumbList JSON-LD, OG image.
- Site-wide SEO audit: unique title/meta per page (COPY.md), canonical, OG/Twitter images 1200x630 generated per page from her photos, sitemap (@astrojs/sitemap, excludes 404), robots (disallow while noindex), RSS feed for journal (@astrojs/rss), JSON-LD validity (parse in a test), lang en-CA, hreflang not needed.
- Motion: letterbox bars and film-strip row reveals per MOTION-SPEC.md and layout 09; title SplitText in family with clip 04. Layouts 17 and 18 already exist, so do not invent new ones. If you introduce a journal motion state that has no clip, generate a Grok Imagine clip first from clip 04 / 05 and layouts 09/17, save as motion/07-* (or next free), then implement to it.

## References (open all of these)
- Layouts: `concepts/site-layouts/09-journal-desktop-v2b.jpg`, `17-journal-article-desktop.jpg`, `18-journal-article-mobile.jpg`
- Motion: MOTION-SPEC.md Journal; closest clips `04-editorial-split-reveal.mp4` and `05-page-transition-flip.mp4` (film-frame advance)
- PDF: `build-plan/context/pdf-p15-film-strip.jpg`, `pdf-p14-editorial-split.jpg`

## Verification
build; Playwright: every page has exactly one h1, title, description, canonical, og:image that returns 200 in preview, JSON-LD parses; noindex meta present; journal pages at 3 sizes; links not broken (crawl preview). Side-by-sides for the index vs layout 09 and vs PDF p15, and one article vs layouts 17/18. Record index enter + article title reveal.
Visual gate: full-page screenshots at 1440x900, 390x844 and 360x780 into qa/<prompt-id>/. Composite each against the layout (and mobile layout where named) and against the named PDF concept page with `python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py`. Write qa/<prompt-id>/compare/NOTES.md. Fix palette, type, composition, photo treatment and spacing until the built page is a close visual match to the Imagine layout and clearly in the same family as the PDF concept.
Motion gate: Playwright recordVideo at 1280x720 of the built section (same moves as the clip, including reverse scroll where required) into qa/<prompt-id>/motion/. Run `python3 /workspace/tina-campbell/build-plan/tools/compare-motion.py --clip <clip> --recording <file> --out-dir qa/<prompt-id>/motion-compare --frames 12`. Open every frame and the contact sheet. If timing, easing, direction or pin behaviour drifts, fix, re-record and compare again. Fill in MOTION-NOTES.md. No drift.
Also: no overflow, no broken images, no console errors, reduced motion path works, all content visible without JS.

## Fidelity check before finishing
Added 2026-11-12 from build-plan/FIDELITY-AUDIT-2026-11-12.md. Scope unchanged; this is a check, not new work. Before you commit, put three things next to your final screenshots and record frames, and write the result into qa/<prompt-id>/compare/NOTES.md as a table (section, match / drift / missing, fix made):
1. Layout: `09-journal-desktop-v2b.jpg`, `17-journal-article-desktop.jpg` and `18-journal-article-mobile.jpg`. Compare section by section at 1440 and 390 using viewport screenshots taken at each section (full-page shots hide scroll reveals and pinned content, so they do not count on their own). Check type size and alignment, photo crop and colour grade (Runway look: dark, cinematic, photos glowing on black), tile proportions and spacing.
2. Clip frames: the film-strip row reveals named in this prompt (no clip; follow MOTION-SPEC.md). Extract frames with ffmpeg and view them next to your Playwright record frames. No dead pins: a pinned section must visibly move for the whole pin distance.
3. Tina's input: Film Strip tick (PDF p15) on the Journal index; Editorial Split for article text; copy is minimalist, classy, normal speech, no haiku, no em dashes; posts serve Edmonton and Alberta photography searches.
Fix every drift you find before committing. If a gap cannot be closed with her real photos, say so in NOTES.md with the closest frame you used.

## Commit
feat(journal,seo): journal with five Edmonton guides and full technical SEO
