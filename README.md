# HANDOFF / README: Tina Campbell Portfolio
Last updated: Nov 11, 2026 (America/Edmonton). Owner: Matt Haynes. Subject: Tina Campbell (_tcphoto), Edmonton photographer.

## Status
- [x] Research on Facebook (page + personal), Instagram (public embed), web and domain records. Read only, nobody contacted.
- [x] All 185 public Facebook page photos downloaded (raw/fb_all, index raw/fb_all_index.json).
- [x] 70 images curated into images/ (64 Facebook + 6 Instagram) with images/MANIFEST.json and MANIFEST.csv. 69 usable; ig_profile_04 flagged "exclude" (an AI-trend graphic, not her photography).
- [x] ASSESSMENT.md written.
- [x] SPEC.md written (brand, palette, type, 3 design concepts, sitemap, page layouts, motion, SEO, stack, 30-step prompt list).
- [x] OPEN-QUESTIONS.md for Matt.
- [x] TEMPLATE/ reusable version for other photographers (includes IMAGINE-PROMPTS-TEMPLATE.md).
- [x] Imagine-first concepts: prompts in concepts/PROMPTS.md; mockups generated with Grok Build Imagine on the aurahomes login: concepts/concept-a-runway.jpg, concept-b-blueprint.jpg, concept-c-red-gown.jpg, concept-b-mobile.jpg (run log: concepts/imagine-run.log). Layout and mood only; people and text in them are not real, the build uses Tina's real photos and real text.
- [ ] Matt picks a concept and answers open questions.
- [ ] Get clean originals and details from Tina.
- [ ] Build (SPEC.md section 11, prompts 1 to 30). Nothing built yet.
- [ ] Preview deploy, then live only after Matt and Tina approve.

## Folder map
- `ASSESSMENT.md` what she shoots, style, audience, strongest images, gaps
- `SPEC.md` full build spec and ordered prompt list
- `OPEN-QUESTIONS.md` decisions needed
- `concepts/` Grok Imagine prompts and concept mockups (A Runway, B Blueprint, C Red Gown, B mobile)
- `images/` curated set + `MANIFEST.json` / `MANIFEST.csv` (file, category, orientation, size, use, subject, source URL)
- `raw/NOTES.md` profile URLs, captions, observations
- `raw/fb_all/` all 185 public Facebook page photos (fb_<photo id>.jpg)
- `raw/fb_all_index.json`, `raw/fb_photo_links.txt` source links for every photo
- `raw/sheet_*.jpg`, `raw/curated_sheet.jpg` contact sheets for quick review
- `raw/ig_profile.json` Instagram embed data
- `raw/*.py` helper scripts (fetch, curate, contact sheets)
- `TEMPLATE/` reusable spec template and prompt list with placeholders

## How the images were gathered (to repeat or extend)
1. Read the Facebook page Photos tab in Matt's signed-in Chrome (UI Automation, read only) to list photo IDs.
2. Public photos fetch at up to 2048 px from `https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=<photo id>` (see raw/fbfetch.py).
3. Instagram is behind a login; the public embed `https://www.instagram.com/_tcphoto/embed/` gives the latest 6 posts (raw/igembed.py, headless Chrome).

## Next steps for whoever picks this up
1. Show Matt the concepts/ mockups and get his pick plus answers in OPEN-QUESTIONS.md.
2. Ask Tina (through Matt) for clean originals, a portrait, services and pricing, contact details.
3. Create the repo and run SPEC.md prompts 1 to 30 in order, reviewing after each.
4. Copy rules: no em dashes, never "gonna"/"wanna", never label images AI generated.
5. Never delete files in this folder; add new versions alongside.
