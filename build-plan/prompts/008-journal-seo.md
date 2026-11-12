---
id: 008-journal-seo
title: Journal + 5 articles + technical SEO
kind: build
effort: high
model: grok-4.7
---
Read first: /workspace/tina-campbell/build-plan/SPEC.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Look at the named layout images and motion clips yourself (extract clip frames with ffmpeg to /tmp, delete them after). Match them closely: layout, proportions, type scale, spacing, colours. Use only real photos from /workspace/tina-campbell/images. All text is live HTML from COPY.md; never bake words into images. No em dashes in any copy. Run `npm run build` and fix all errors before finishing. Verify with Playwright (chromium from ~/.cache/ms-playwright) at 1440x900, 390x844 and 360x780: screenshot to /workspace/tina-campbell/qa/<prompt-id>/, check no horizontal overflow (document.scrollingElement.scrollWidth <= innerWidth), no broken images (naturalWidth>0), no console errors, and test with reducedMotion: "reduce". Look at your screenshots next to the layout image and fix visible gaps. Then git add and commit (do not push, do not deploy). If a tool or install fails, say exactly what failed in your final message. Clean temp files.

## Goal
Build /journal/ (layout 09-journal-desktop-v2b.jpg) and /journal/[slug]/ article pages (layout concepts/site-layouts/17-journal-article-desktop.jpg and 18-journal-article-mobile.jpg if they exist; otherwise follow the Editorial Split system), and complete technical SEO for the whole site.
## Must haves
- Content collection src/content/journal (Markdown, frontmatter: title, description, date, updated, hero, heroAlt, tags, location). Index: featured post with 2.39:1 letterboxed photo whose bars open on enter, then film-strip rows (frame number, thumbnail, title, date) sliding in.
- Write 5 genuinely useful articles (900 to 1400 words each), normal readable voice, first person as Tina where natural, no filler, no em dashes, no fake facts (no invented prices, dates, client names, quotes or permits; when unsure, say 'check current rules with the City of Edmonton' etc.). Topics and target searches:
  1. 'The best photoshoot locations in Edmonton (and when to go)': Alberta Legislature grounds, Walterdale Bridge, High Level Bridge, Muttart-area river valley, Old Strathcona/Whyte Ave alleys, Ice District glass, Hawrelak Park, Mill Creek Ravine; light, crowds, seasons. (edmonton photoshoot locations)
  2. 'What to wear for a fashion or glam photoshoot': colour (red on blue sky, black on stone), fit, layers, shoes, hair/makeup, bring list. (what to wear photoshoot edmonton)
  3. 'Planning bridal portraits in Edmonton and St. Albert': timing, indoor glass/atrium options, winter brides, working with a stylist/bridal shop, timeline. (bridal photographer edmonton, st albert)
  4. 'Couples and engagement photos in Edmonton: a season-by-season guide'. (engagement photographer edmonton)
  5. 'Model portfolio shoots in Alberta: what agencies want to see' (digitals vs editorial, comp card, number of looks). (model portfolio photographer alberta)
  Use real photos from images/ as heroes and inline images with alt text. Each ends with a short soft call to /book/. Internal links between posts and to /services/, /work/.
- Article page: title (SplitText), meta (date, read time, location), hero, prose styles (serif headings, comfortable 68ch measure), table of contents on desktop, related posts, Article + BreadcrumbList JSON-LD, OG image.
- Site-wide SEO audit: unique title/meta per page (COPY.md), canonical, OG/Twitter images 1200x630 generated per page from her photos, sitemap (@astrojs/sitemap, excludes 404), robots (disallow while noindex), RSS feed for journal (@astrojs/rss), JSON-LD validity (parse in a test), lang en-CA, hreflang not needed.
## Verification
build; Playwright: every page has exactly one h1, title, description, canonical, og:image that returns 200 in preview, JSON-LD parses; noindex meta present; journal pages at 3 sizes; links not broken (crawl preview).
## Commit
feat(journal,seo): journal with five Edmonton guides and full technical SEO
