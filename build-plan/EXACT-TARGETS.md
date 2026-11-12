# Exact-match targets (measured 2026-11-12, Thu 3:15-3:33 PM UTC-6)

Matt (Nov 12): build the Tina site EXACTLY like the approved Grok Imagine layouts and the 6 approved motion clips, with every effect, timing, sizing and section in them, plus everything promised and every comment Tina wrote. No report: the build must match.

How these were measured: dense ffmpeg frames (24 fps native, 1280x720) of every clip, OpenCV phase correlation / template tracking / pixel bounding boxes, layouts measured in pixels and scaled to 1440 (layout width 576 -> x2.5, 720 -> x2.0), and the current build (main @ fa902d8, after 005) captured with Playwright at 1440x900, 390x844 and 1280x720 with the clip input curves replayed. Clip numbers are at 1280x720; multiply by 1.125 for 1440x900 (heights scale with viewport height where a value is given as vh).

The clips contain baked mock type and stand-in crops. What must match: sizes and positions (within the tolerance given), grade (dark/night vs daylight), composition, motion timing, easing, direction, pin and the effect's look. Words stay our own live HTML from COPY.md. Photos stay Tina's real frames from images/. Never bake text into images. Never edit Tina's own watermark out of a photo; pick or crop frames so it is not across the subject.

## Tools (use these, they are the gate)

- `node build-plan/tools/exact-match/replay.mjs --clip clipNN --base http://localhost:<port> --out qa/<id>/exact/clipNN` drives the built page with the same input curve as the clip (clip01 scroll curve 0 -> 621 px over 6 s; clip02 horizontal strip travel 1060 px with the clip's ease-out; clip03 pointer enters tile 2 at 0.33 s; clip04 fresh page load; clip05 click on the first Work tile at 1.0 s; clip06 linear 360 px scroll) and samples frames at the clip's own timestamps (4 per second, 25 pairs). Output: `pair-XXX.jpg` (left clip, right build, same t), `CONTACT-clip-vs-build.jpg`, `zone-luma.json` (3x3 luminance per frame; a grade and composition check; mean diff per frame should stay under 18 once photos are equivalent in tone).
- `--timescale N` slows all GSAP timelines by N (use it to compare a 1.2 s site transition against a slower clip frame-for-frame).
- `node build-plan/tools/exact-match/capture.mjs <base> <outdir> "/,/runway/"` viewport screenshots every half viewport, forward then reverse, at 1440x900 and 390x844, plus `metrics.json` (h1 glyph box, logo box, nav font, overflow, console errors).
- `python3 build-plan/tools/exact-match/sheet.py <dir> 'fwd-*' <cols> <width> <out.jpg>` contact sheets.
- Serve the built site from `site/dist` with `python3 -m http.server <port>` (pick a free port 4800-4899). Never deploy.

Every exact-match prompt must: run the replay for its clip(s) before changing anything (baseline), fix, re-run, and open EVERY pair image side by side. Write `qa/<id>/exact/CHECKLIST.md` with one row per target below: target, measured value in the build, PASS/FAIL. Do not commit while any row in scope is FAIL unless the gap is impossible with her real photos (say which photo is closest and why).

## Global (all pages)

| # | Target | Clip/layout value | Current build | Gap |
|---|---|---|---|---|
| G1 | Header bar height | ~100 px @1280 (hero/photo starts at y~105) -> ~112 px @1440 | ~93 px @1440 | small |
| G2 | TCPhoto mark size | 166x89 px @1280 at x=34 y=8 (clips 01, 02, 05) -> ~187x100 @1440; layout 01: 200 px wide @1440 | 90x64 @1440 | **too small** |
| G3 | Nav | mono, glyph height ~18 px @1280 -> ~20 px font @1440, items from x~375 to ~1000 @1280, centred group | JetBrains Mono 16 px | small |
| G4 | Book a shoot pill | 183x55 px @1280, right edge at x~1237, deep crimson pill (#B3261E token stays; no brighter red) | ~120x36, reads brighter | **too small** |
| G5 | In-panel TCPhoto mark (Fashion & Editorial, series) | mark keeps its aspect ratio, ~200 px wide @1440 (layout 03 v2: 30->128 of 576) | **stretched horizontally (distorted)** | **bug** |
| G6 | Mobile header | mark ~56 px tall, hamburger right (layout 11) | 56 px | ok |

## Home (layout 01-home-desktop-v2b, mobile 11-home-mobile, clip 01)

| # | Target | Value | Current build | Gap |
|---|---|---|---|---|
| H1 | Hero crop | whole figure from both lamp globes (top corners of the photo) down past the title; head at ~8% of hero height; figure centred at ~42% of width; NOT zoomed. Clip 01 t=0: lamps at y~95-130, face at y~170 @1280 | zoomed ~1.5x, face fills the upper half, lamps cut | **crop** |
| H2 | Hero grade | deep saturated night blue (sky ~ #12305f to #1d4c8f, warm skin), vignette, grain; Tina ticked the night Runway (p10) | desaturated slate grey-blue | **grade** |
| H3 | Hero bottom | photo fades to pure ink over the bottom ~35% of the hero; no hard edge; the meta row (No. 001 / Alberta Legislature, Edmonton ... crimson hairline ... Scroll) sits on the fade | hard horizontal edge under the meta row | **edge** |
| H4 | Title | "TINA CAMPBELL" glyphs 78-79% of viewport width, centred, top of glyphs at ~41% of viewport height at scroll 0; does NOT scale on scroll (clip 01 keeps it 1:1); moves up with the page | 79% wide, centred | ok |
| H5 | Hero height / pacing | "The Runway" label reaches viewport y~200 @720 only after 621 px scroll (label document y ~ 1.14 vh); at scroll 300 px (t=3 s) only the label and the top 20% of the tiles show | build shows full tiles by 300 px | **hero too short** |
| H6 | Runway band | 5 tiles across, equal, gaps ~24 px @1280, outer margin ~30 px; tile 2:3 portrait (~225x340 @1280, ~47 vh); mono numbers 01-05 centred under each tile (~22 px); label "The Runway" serif ~22 px top-left; nothing else in the band (no right-hand caption, no full-width rule) | tiles ~4:5, extra right caption, rule, link | **ratio + extras** |
| H7 | Runway photos | night-runway / gown frames on dark: tile 4 magenta stage glow, tile 5 black gown in a dark venue, tile 1 red gown on the turquoise truck, tile 2 red gown in snow, tile 3 red gown on a lit catwalk (layout 01). Pick her closest real frames | mixed daylight frames, one with big text on clothing | photo pick |
| H8 | Statement | "Edmonton is my runway." single white serif line spanning ~57% of viewport width (~820 px @1440), left at the page margin; ends fully white | ok (word scrub fine) | ok |
| H9 | Category band | 6 tiles edge to edge across the full width, LANDSCAPE ~5:4 (layout: 90x73 of 576 -> ~225x182 @1440), 4 px gaps, mono label centred on a dark bar under each tile | **4:5 portrait tiles (002c changed them the wrong way)** | **ratio** |
| H10 | The Red Gown split | ink text panel left 0-50%, photo right 50-100% bleeding to the right edge, landscape ~1.9:1, gown seated on the turquoise truck; no watermark on the photo | photo carries a large baked TCPhoto signature top-left | **photo** |
| H11 | Footer band | one crisp dusk/blue-hour skyline + Walterdale arch plate, dark, "Let's make something bold." left in white serif with the crimson pill under it | daytime hazy river plate | **grade** |
| H12 | Mobile hero (11) | name centred, stacked TINA / CAMPBELL, glyph width ~60% of screen per line, block centred at ~45-70% of screen height; Book a shoot pill full-width at the bottom of the hero only | name at 65-87% height | position |
| H13 | Mobile runway (11) | three panels visible: narrow side panels (~18% width) and a centre panel (~45%), all ~68 svh tall; crimson progress bar + "No. 014 / EDMONTON" mono caption under | one wide panel + slivers | layout |

Clip 01 motion: smooth Lenis scroll, page moves 0 -> 621 px in 6 s with ease-in-out (peak ~8 px/frame at t=2.5 s). Title and photo move together with the page (no extra parallax beyond <=10%). Runway tiles enter from below as the page scrolls; no pin anywhere on Home desktop.

## Runway page (layout 06-runway-gallery-desktop-v2, clip 02)

| # | Target | Value | Current build | Gap |
|---|---|---|---|---|
| R1 | Strip shape | symmetric barrel curve facing the viewer: centre frames tallest (~0.60 vh, ~430 px @720), edge frames ~0.48 vh; top edge highest at the centre, bottom edge lowest at the centre; symmetric left/right at every scroll position | asymmetric ribbon rising to the right | **shape** |
| R2 | Fill | the strip always fills the viewport edge to edge at every point of the pin (start, middle, end); no empty ink to the right or left | strip ends mid-screen, empty right half | **bug** |
| R3 | Pin length | pin distance proportional to the track: at least ~1 vertical px per horizontal px of travel (clip: 1060 px horizontal in one gesture); with 12+ frames the pin is several viewports, not 706 px | 706 px pin, catwalk over in under a second | **too short** |
| R4 | Motion feel | a scroll gesture moves the strip left with a quick 0.5 s ramp and a long ~3 s ease-out (inertia), peak ~600 px/s @1280, then it comes to rest with a frame centred (snap) | scrubbed, abrupt | easing |
| R5 | Lighting | centre frame sharp and fully lit; side frames progressively dimmer (edges ~55-60% brightness) and slightly blurred | all equal | **missing** |
| R6 | Film border | dark sprocket band (#151517-ish) with small dark holes, subtle; frames separated by thin dark gutters | bright grey large holes, light frame border | **too loud** |
| R7 | Photos | dark-stage runway frames glowing on black (magenta/purple stage light); her darkest real runway frames first; avoid bright mall/daylight frames in the centre of the opening view | bright daylight frames dominate | photo pick |
| R8 | Title block | "Runway" serif ~32 px + mono subtitle, crimson progress rail under it (left, ~38% width) | ok | ok |

## Work index (layout 02-work-index-desktop-v3, hover layout 16-motion-hover-distortion-v3, clip 03)

| # | Target | Value | Current build | Gap |
|---|---|---|---|---|
| W1 | Noir grade | deep, contrasty black-and-white (true blacks, grey skies, no blown highlights); only red stays red | high-key, blown-out whites | **grade** |
| W2 | Filter row and count | mono labels (Work count "NNN frames" in mono next to the serif "Work"), active filter white with crimson underline | serif labels | type |
| W3 | Captions | live text captions under tiles (series or category name in mono), NOT grey placeholder bars copied from the mock | grey bars rendered as decoration | **bug** |
| W4 | Grid mix | masonry with portrait AND landscape tiles, every style present near the top (fashion, bridal, couples, Edmonton bridge/city, runway), not mostly red gowns | repetitive fashion/red | mix |
| W5 | Hover ripple | concentric circular rings centred EXACTLY on the cursor; rings start at 0.33 s, radius grows to ~120 px by 2 s and ~200 px by 4 s @1280 (ripple spills past the tile edges over the neighbours/border), ring spacing ~18 px, slight chromatic edge; the subject inside the centre stays recognisable | lens bubble from the tile edge, swallows and smears the whole photo, origin not at the cursor | **wrong effect** |
| W6 | Colour return | B&W holds during the ripple; colour floods back late: starts ~4.3 s and is full at ~6 s in the clip; on site keep the order (ripple first, colour after) at 1/2 speed max: ripple 0-1.0 s, colour 1.0-1.6 s | colour back at ~2 s while the image is still warped; image stays warped | order |
| W7 | Leave | on pointer leave the ripple collapses and the tile returns to B&W with no residual warp within 0.6 s | residual warp | bug |
| W8 | Cursor | 64 px crimson filled disc with "View" in white, centred on the pointer over photos | small "View" text, no disc | **missing** |

## Fashion and Editorial (layout 03-fashion-editorial-desktop-v2, clip 04)

| # | Target | Value | Current build | Gap |
|---|---|---|---|---|
| E1 | Split | text panel 0-50% width, thin crimson divider at 50% from header to section end, photo column 56-91% of width (~500 px wide @1440), three stacked photos each ~ one third of the viewport tall, 8 px gaps | divider at ~76%, photos a narrow ~11% strip at the far right | **layout** |
| E2 | Title | "Fashion / & Editorial" serif, "& Editorial" line ~41% of viewport width (~590 px @1440, ~185 px font) | 340 px wide (103 px font) | **too small** |
| E3 | Series list | mono; the line "02  Legislature in Black" spans ~32% of viewport width (~460 px @1440); numbers 01-05, the active one crimson; ~30 px line spacing scaled the same way | sans, ~200 px line | type + size |
| E4 | Load-in timing (clip 04, from page load) | 0-0.5 s black; title fades/rises 0.5-1.25 s ("Fashion" then "& Editorial"); subtitle 1.0-1.6 s; divider drawn by 1.0 s top to bottom; list items stagger 2.0-3.75 s (~0.35 s apart); photo column unmasks top-down 2.75-4.25 s; then still | roughly right | ok |
| E5 | Quote band | "Confidence looks good on everyone." left with a crimson quote mark; four TALL portrait photos (~1:2) side by side on the right 25-100% | 4 near-square tiles | ratio |
| E6 | Collab band | single line "Designers, models, agencies: let's make something." + crimson Collaborate pill | ok | ok |
| E7 | Mobile | text panel first (title, subtitle, list), photos after | title at y~3047 px, after all the photos | **order** |

## Series story (layout 04-series-story-desktop-v3, mobile 12-series-mobile-v2)

| # | Target | Value | Current build | Gap |
|---|---|---|---|---|
| S1 | Cover | full-bleed photo, title TOP-LEFT over the dark side of the photo, ~150 px serif @1440 (two lines), mono "Series 02 / Edmonton / 2025" under it | title bottom-left 104 px | **position/size** |
| S2 | Watermarks | no frame where Tina's baked signature runs across the subject or the cover title area (fb_013 / fb_116 / other *_signature crops) | big signatures across cover and spreads | **photo** |
| S3 | Story block | live text left ~40% width, tall portrait right with a soft glow edge | small photo | size |
| S4 | Spreads | 2-up landscape row, then a full-width cinematic (~2.4:1) frame | big single frames | layout |
| S5 | Next series | "Next series: <name>" serif left, small portrait thumb, crimson arrow | ok | ok |

## Portraits, Bridal and Couples (layout 05-portraits-bridal-desktop-v2)

| # | Target | Value | Current build | Gap |
|---|---|---|---|---|
| P1 | Page title | one line, ~93% of width (~115 px font @1440) | 64 px, ~40% width | **too small** |
| P2 | Chapters | "Ch. 01" mono label above; photo LEFT ~49% width (~4:3); heading ~85 px serif right with a hairline rule under it; body; "See the gallery" mono crimson | photo ~30%, heading ~30 px, no rule, sans link | **size** |

## About (layout 07-about-desktop-v3-clean 720x1184 -> x2 for 1440, mobile 13-about-mobile-v3, clip 06)

Measured 2026-11-12 4:05-4:20 PM (UTC-6) from clip 06 frames (24 fps, 1280x720; x1.125 for 1440x900) and layout 07 / 13 pixels.

| # | Target | Value | Gap check |
|---|---|---|---|
| A1 | Hero frame | photo starts under the header (y~105 @720 = ~112 @1440 per G1) and fills the rest of the first viewport (clip 06: hero to y=720, nothing else visible at scroll 0) | full-viewport hero |
| A2 | Hero grade and plate | dusk pink/violet sky (clip samples upper sky ~#E5B5B3 / #D2A8B2, lower ~#63374D), Walterdale arch centred (arch x ~430-910 @1280, top of arch y~240 @720), lit skyline right (x ~860-1280), dark tree mass bottom-left; dark ink fade under the title | composition + grade |
| A3 | Photographer figure | dark silhouette with camera to the eye on the LEFT: x ~85-230 @1280 (7-18% of width), head top y~150 @720, camera at y~230 @720; in front of skyline and bridge | position |
| A4 | Title | "TINA CAMPBELL" white high-contrast serif, ONE line, centred, glyph box x ~175-1100 @1280 (72% of viewport width, ~1040 px @1440), cap height ~109 px @720 (~15% of viewport height, ~136 px @1440), cap top at ~67% of viewport height (y~484 @720, ~605 @1440); sits between the bridge layer and the figure layer | size + position |
| A5 | Clip 06 motion | hero pinned for the first ~360 px of scroll (replay curve: linear 360 px over 6 s). During the pin: skyline/sky layer moves <= 4 px (~0.01x), arch layer <= 10 px, figure layer rises ~110 px @720 (~0.3x scroll, ~125 px @1440) and grows ~1.0 -> 1.12 scale, title moves <= 6 px. Linear scrub (ease none), fully reversible. Then the pin releases and the page scrolls normally. The ghost/double exposure in the clip is a video artefact: NO crossfade, NO opacity on the layers. | motion |
| A6 | Hairline + portrait split | full-width hairline under the hero (layout y~305/1024 of display); then a two-column block: portrait cut-out on dark (no frame, bleeds into ink) x ~95-255 display (~15-41% of width, ~370 px wide @1440), vertical hairline at ~50% of width, headline right at ~54% of width in white serif ~46 px @1440, three lines ("I shoot everything." + COPY.md words), story text below as lines | layout |
| A7 | Behind the scenes row | 4 equal tiles edge to edge inside a ~37 px outer margin, ~12 px gaps, each ~333 px wide x ~405 px tall @1440 (~4:5 portrait), real shoot photos (Tina working, styling, lights, laptop/tethered review if she has one; closest real frames) | ratio + spacing |
| A8 | Where I shoot | serif label "Where I shoot" left (~46 px @1440 font, left at the 37 px margin); 4 cards same grid as A7 (~333x415 @1440), caption centred white on a dark bottom gradient: Alberta Legislature, Walterdale Bridge, High Level Bridge, River Valley | ratio + captions |
| A9 | Closing pill | centred crimson pill "Book a shoot" ~200x60 @1440 under the cards, then footer | ok |
| A10 | Mobile (13) | hero: photo inset ~8 px from the screen edges, ~80% of screen height, skyline/arch upper part, figure with camera bottom-left in the foreground, "TINA CAMPBELL" centred near the bottom in serif small caps ~82% of width; two layers on touch (figure + background) with the same 0.3x rise, no pin on touch. Screen 2: full-width portrait (~1:1.1), "I shoot everything." serif ~38 px under it, story text. Screen 3: full-width crimson Book a shoot bar, then location cards stacked full width (~2.2:1) with mono captions on a dark bar under each | mobile |

## Services (layout 08-services-desktop-v2b 720x1280; displayed 576 wide -> x2.5 for 1440)

| # | Target | Value |
|---|---|---|
| V1 | Hero split | "Services" white serif left at x~80 @1440, glyph width ~570 px (~40% of width), cap height ~170 px; subtitle serif ~40 px under it (COPY.md words); glam portrait on dark at the right x~850-1300, hero block ~570 px tall under the header; hairline under the hero, full width |
| V2 | Service rows | exactly 5 rows (Portraits, Headshots, Bridal, Couples, Events), each ~255 px tall @1440. Left half (x 80-720): serif number "01".."05" ~75 px font at x~80, name serif ~55 px at x~232, body text under the name; hairline under each row across the left half only. Right half: photo x ~745-1358 (~612 px wide), ~2.4:1 LANDSCAPE, rows of photos stacked with ~12 px gaps, dark grade (Events row = magenta stage) |
| V3 | How it works | label serif ~32 px left; 3 columns at x ~80 / ~570 / ~1040 @1440 (Chat, Shoot, Gallery) with a hairline across under the block |
| V4 | FAQ | "FAQ" label left, plus-sign toggles in a column at x~80, questions at x~205, accordion |
| V5 | Closing pill | wide centred crimson pill ~770x70 @1440 "Book a shoot" |

## Book (layout 10-contact-book-desktop 720x1280; displayed 576 -> x2.5)

| # | Target | Value |
|---|---|---|
| B1 | Hero | blue-hour Walterdale arch at night (dark navy sky, lit deck), ~595 px tall @1440 (~66 vh); "Book a shoot" white serif centred, glyph width ~840 px (~58% of width), cap ~150 px, vertically at ~45% of the hero |
| B2 | Form panel | dark panel (#141416-ish, 1 px hairline border, slight radius) x 60-1380 @1440, overlapping the bottom ~10% of the hero, ~470 px tall. Left ~2/3: mono labels with underline fields (Name + Email side by side, "What are we shooting?" with 7 small crimson filled mono chips, Date, Message), crimson "Send it" pill ~220x55. Right ~1/3 after a vertical hairline: mono "@_tcphoto" and "Edmonton, Alberta", then the TCPhoto mark ~300 px wide |
| B3 | Film-strip rows | under the panel: hairline, mono "No. 014" left and "Edmonton" right, then 3 equal ~1:1 photos with sprocket edges, ~445 px each @1440; a second strip the same; real photos (red gown truck, black gown lamp post, Walterdale, magenta stage, red gown snow, bridal couple) |
| B4 | Footer | centred mono credit line under a hairline (keep the footer from 002d) |

## Journal (layout 09-journal-desktop-v2b 720x1280; displayed 576 -> x2.5), articles 17 (desktop) and 18 (mobile)

| # | Target | Value |
|---|---|---|
| J1 | Index title | "Journal" white serif centred, glyph width ~680 px (~47% of width), cap ~225 px @1440, directly under the header |
| J2 | Featured | photo x 60-1380 @1440 (full width minus 60 px margins), ~2.27:1 (letterbox bars may open on enter), headline serif ~75 px left aligned under it at x~55, one-line dek under that |
| J3 | Strip rows | hairline between rows; row ~410 px tall; thumbnail left x 60-432 (~372 px wide, ~1.1:1); serif headline ~60 px at x~488, one line, dek under it |
| J4 | Article desktop (17) | centred serif headline two lines, glyph width ~1170 px (~81%), font ~110 px; centred mono meta line under; hero x 60-1380, ~2.2:1; body column ~700 px wide centred (x ~375-1075); section heads white serif ~46 px; inline photos the column width ~2.5:1 with a crimson hairline under the last one; sticky TOC at the left x 60-330 with the active item crimson; "Keep reading" centred serif + one film-strip frame holding 3 thumbs (~712 px wide); centred crimson pill ~340x55 |
| J5 | Article mobile (18) | header with hamburger + small crimson Book a shoot pill; headline left-aligned serif ~56 px at 390, four lines; hero full-width ~1.1:1; body; "Keep reading" with 2 film-strip cards; full-width crimson Book a shoot bar at the bottom |

## Page transition (layout 15-motion-page-transition, clip 05)

| # | Target | Value |
|---|---|---|
| T1 | Order | t=0-1.0 s idle grid; 0.5 s clicked tile gets a 2 px crimson outline; 1.0-4.25 s the tile flies to full-bleed hero with an ease-out (expo/power3 out; widths 47% -> 61% -> 78% -> 90% -> 95% -> 97.5% at 1.75/2.25/2.75/3.25/3.75/4.25 s), slight rotation ~ -3 to -4 deg mid-flight returning to 0, other tiles dim and drop; the new page's serif title blurs in (12 px -> 0) from ~2.75 s to 4.0 s at the top-left; header stays. |
| T1b | End state | hero photo top at the header bottom (y=105 @720 -> ~112 @1440) and full width; title two lines top-left, glyph box x ~45-510 @1280 (x ~50-575 @1440), y ~211-420 @720 (top ~264 @900), serif ~120 px @1440 (the same cover title as S1; S1 and T1b must agree, so settle one value between 120 and 150 px and use it on both) |
| T2 | Site duration | same curve and keyframe order compressed to 1.2 s +/- 0.15 s; verify with `replay.mjs --clip clip05 --timescale 3.5` so the slowed site run lines up with the clip frame by frame. |
| T3 | Fallback | reduced motion: crossfade 200 ms; touch: crimson wipe. |
| T4 | Layout 15 look mid-flight | the flying frame has a soft dark vignette edge and rounded ~12 px corners; the side frames show sprocket edges and motion blur (layout 15) |
