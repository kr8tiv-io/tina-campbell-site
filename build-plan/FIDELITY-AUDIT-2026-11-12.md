# Fidelity audit, Tina Campbell site, 2026-11-12

Asked by Matt: measure the site again against every approved reference (the Grok Imagine layouts, the six motion clips, the earlier passes and Tina's own input). Nothing was deployed, published or sent, and Tina was not contacted.

## What was measured

- **Build:** commit `d466aa0` on `main` (after 002b, the last finished driver step). Built in a separate worktree, `/workspace/tina-fidelity-audit-2026-11-12`, to `audit-static/` and served locally. The driver's live 003-runway work was not touched.
- **What exists:** only Home and 404 are built. Every other route returns 404 locally (see "Not built yet").
- **Captures:**
  - viewport screenshots at each Home section at 1440x900 and 390x844, plus full-page shots;
  - scroll frames at 1280x720, forward and reverse;
  - first-visit loader frames;
  - DOM measurements of the runway track and pin travel, title size and logo height.
- **References:**
  - layouts `01-home-desktop-v2b`, `11-home-mobile`, `14-motion-loader-signature` and `19-404-desktop`;
  - all six motion clips, 12 frames each via ffmpeg;
  - the PDF pages Tina ticked (p10 Runway, p14 Editorial Split, p15 Film Strip, p18 Noir and Crimson, p19 Bridge and Skyline, p24 notes);
  - the 002b side-by-sides and NOTES.md;
  - `FEEDBACK-MAP.md`.
- **Independent review:** Grok Build `grok-4.7 --effort xhigh` on the default (KR8TIV) login, saved verbatim in `grok-review-verbatim.md`. It is reconciled below.

## Contact sheets (this folder: `build-plan/fidelity-audit-2026-11-12/`)

- `CONTACT-SHEET-home-404-loader.jpg` has one row per section: the approved layout crop on the left, the local build on the right, and the verdict and note underneath.
- `CONTACT-SHEET-motion-home.jpg` shows clip 01 frames against the build's scroll frames.
- `home-1440-vs-pdf-p10.jpg` puts PDF Runway (Tina: "I like this one") next to the build hero.
- `teaser-1440-vs-pdf-p14.jpg` puts PDF Editorial Split next to the build's Red Gown split.
- `clip-01` to `clip-06-*.jpg` are 12-frame strips of each approved clip. Steps 003 to 009 use these.
- `home-scroll-frames-1280.jpg`, `home-390-viewports.jpg` and `loader-frames.jpg` are the raw capture strips.

## Scores per section

| # | Section | Reference | Verdict | What is off | Fix (002c item) |
|---|---|---|---|---|---|
| 1 | Header | layouts 01/14/19 | Drift | Mark is 46px, against about 64px in the layout. Nav is 14px Inter Tight; the layout shows about 16px mono. | 4 |
| 2 | Hero (desktop) | layout 01, PDF p10, clip 01 | Drift | Daylight grade, where the layout and Tina's ticked Runway page are night and cinematic. The name sits left at about 62% of the width; the layout centres it at about 80%. It drops to 111px between 961 and 1360px. The 1080px portrait source is zoomed and soft. | 2, 3 |
| 3 | The Runway strip (desktop) | layout 01, clip 01 | Drift | Frame 05 is clipped (track 1493px in a 1440px viewport). The section pins for about 600px of scroll to move 46px, which feels like the page stalls. Three of the five photos break the night-runway read. | 1, 8 |
| 4 | Statement "Edmonton is my runway." | layout 01 | Match | Live text, size and placement agree. | none |
| 5 | Category film strip | layout 01, PDF p15 | Drift | Tiles are 3:2 and about half the layout's height. Labels are small sans, left-aligned; the layout uses mono, centred. | 7 |
| 6 | The Red Gown split | layout 01, PDF p14 | Drift | Correct split and live text. The photo is a portrait 4:5 inset with the watermark script across the skirt, where the layout has a wide truck frame bleeding right. | 5 |
| 7 | Bridge and Skyline band | layout 01, PDF p19 | Drift | Two photos are blended into a hazy pink wash, with an extra 128px mark over a baked watermark. The layout is one crisp dusk plate. | 6 |
| 8 | Site footer | SPEC (not in layout) | Match | Logo, nav, Instagram, Facebook and "Site by KR8TIV" are present below the band, as SPEC requires. | none |
| 9 | Loader | layout 14 | Match | Signature, crimson rail and counter all match. The brush-tip glow is missing (minor). | 11 (optional) |
| 10 | Home scroll motion | clip 01 | Drift | The title never scales. The photo moves only 7% and the copy 10%. The dead pin interrupts the flow. Reveals elsewhere do follow the clip's order. | 1, 3 |
| 11 | Mobile hero | layout 11 | Drift | The name is left-aligned and smaller; the layout has it centred and stacked. The logo is 40px, against about 56px. | 9 |
| 12 | Mobile runway | layout 11 | Drift | The layout shows a full-height three-panel strip with a "No. / location" caption and a short crimson progress bar. The build has short 4:5 cards and a full-width rule. | 9 |
| 13 | Mobile categories | layout 11 | Drift | Close in style, but the thumbs are small and the sticky pill covers the last row (Edmonton). | 9 |
| 14 | Mobile sticky "Book a shoot" | layout 11 | Drift | The layout shows it on the hero screen; the build keeps it fixed over later content. | 9 |
| 15 | 404 | layout 19 | Drift (close to missing) | No "Page not found" H1, no film-frame photo, the button says "Home" instead of "Back home", and the footer shares the screen. | 10 |
| 16 | /runway/ | layout 06, clip 02 | Missing (003 in progress) | Not built at `d466aa0`. | 12 (re-audit after 003) |
| 17 | /work/ | layout 02 v3, 16 v3, clip 03 | Missing (004) | | gate added to 004 |
| 18 | /fashion-editorial/ | layout 03 v2, clip 04 | Missing (005) | | gate added to 005 |
| 19 | /series/[slug]/ | layout 04 v3, 12 v2 | Missing (005) | | gate added to 005 |
| 20 | /portraits-bridal-couples/ | layout 05 v2 | Missing (005/006 per plan) | | covered by 010 gate |
| 21 | /about/ | layout 07 v3-clean, 13 v3, clip 06 | Missing (006) | | gate added to 006 |
| 22 | /services/, /book/ | layouts 08 v2b, 10 | Missing (007) | | gate added to 007 |
| 23 | /journal/ + article | layouts 09 v2b, 17, 18 | Missing (008) | | gate added to 008 |
| 24 | Page transition | layout 15, clip 05 | Missing (009) | | gate added to 009 |

Totals for the built surface (rows 1 to 15): 3 match, 12 drift, 0 missing. Rows 16 to 24 are scheduled pages not built yet.

## Tina's input, checked

| Tina said / ticked | Status | Note |
|---|---|---|
| Runway is her favourite: dark, cinematic, photos glowing on black, crimson buttons, sideways runway (p10, p24) | **Drift** | Crimson pills and the ink background are right. The first screen is a bright daylight photo, which undercuts "fashion show at night". Fixes 2 and 8. |
| Editorial Split for pages, "how it looks on display, with text" (p14) | Match on Home | The Red Gown split is right; only the photo crop drifts (fix 5). The full test is 005 and 007. |
| Film Strip (p15) | Match | Category band sprockets are kept (Grok called them extra; Tina's tick wins). |
| Bridge and Skyline (p19) | Drift | The band is muddy (fix 6). The About and Book backdrops come in 006 and 007. |
| Noir and Crimson (p18) | Missing | Work grid and hover come in 004. |
| "Fashion & editorial stand out most" | Match | First in the nav and first slot on Home. |
| "I enjoy all types of different styles" | Match | Six categories on Home. The Work filters come in 004. |
| Fashion unpaid but loved, so a collab invite | Missing | Copy exists in COPY.md (Collab H2). The page comes in 005. |
| Business card: different photo | n/a | Print round only, as logged in FEEDBACK-MAP. |
| Own text, never baked into images | Match | All Home and 404 words are live HTML. Two source photos carry Tina's own baked watermark; fix 5 crops around it rather than editing it. |
| Minimalist, normal speech, no haiku, no em dashes | Match | No em or en dashes in `site/src`. |
| Every section her current presence has | Partial | Instagram and Facebook are in the footer. The remaining inventory rows land with pages 004 to 008, and 010 checks them. |

## Top fixes (in order)

1. Kill the Home runway dead pin and the clipped fifth frame, so five frames fit as in layout 01 and rise in as in clip 01.
2. Give the desktop hero the night "fashion show" grade that Tina ticked, with the name centred at about 80% width on every desktop size and scaling on scroll as in clip 01.
3. Make the header match the layouts: a 64px mark and 16px mono nav.
4. Use a wide, bled-right gown-on-truck frame for the Red Gown split, with no watermark across the subject.
5. Use one clean dusk skyline plate for the footer band, with no blend and no extra mark.
6. Re-pick the runway photos for night-runway gowns.
7. Category tiles: 4:5, centred mono labels, quieter sprockets.
8. Mobile: centred hero name, a three-panel 68svh runway, the sticky pill on the hero only, bigger category thumbs.
9. Rebuild the 404 as the layout 19 poster.
10. Re-audit /runway/ after 003 with the same method.

All of these are in `build-plan/prompts/002c-fidelity-fixes.md`. The driver sorts prompts by file name and runs the first one not done, so 002c runs straight after 003-runway finishes and before 004-work.

## Reconciliation with the Grok Build review

**Agreed:**
- runway clip and dead pin, with the root cause (`/4.42` sizing; padding missing from the travel; `end: '+=78%'` not tied to the track);
- the night grade;
- the 961 to 1360px title shrink;
- title scale on scroll;
- the Red Gown crop and bleed;
- a single skyline plate;
- the 404 poster;
- the mobile hero, runway and pill.

Several of Grok's CSS numbers went straight into 002c.

**Grok was stricter, and I accepted it:**
- Mobile categories move from match to drift, because the pill covers the last row.
- The sticky pill gets its own row.

**Grok was wrong or overruled:**
- "The 1440 name is already full width." The 1440 viewport screenshot shows the name at about 62% of the width, left-aligned, against centred at about 80% in layout 01. My drift verdict stands. Grok read the element box, which is 92%, not the glyphs.
- "Strip the baked type from fb_013 and fb_116." That is Tina's own watermark, so it is not ours to remove without her or Matt's say-so. 002c crops around it instead.
- "Category sprockets are extra." Overruled by Tina's Film Strip tick, which FEEDBACK-MAP maps to this band.
- "Button #8e1c17." VISUAL-TRUTH locks crimson at `#B3261E`, so the token stays.

**Limits:**
- Grok's "night files" photo list is unverified. 002c tells the builder to view each one before picking.
- There is no magenta-stage black gown in `images/`, so a stand-in will be named.

## Plan changes made with this audit

- Added `prompts/002c-fidelity-fixes.md`.
- Added a "Fidelity check before finishing" section to prompts 004 to 010. It compares against the layout, the clip frames and Tina's input, then records a match / drift / missing table. Their scope is unchanged.
- 003-runway was not edited because the driver is running it.
