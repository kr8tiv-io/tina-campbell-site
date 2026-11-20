# Gap audit: locked motion videos vs live staging (20 Nov 2026)

Staging audited: https://lightsteelblue-lark-427091.hostingersite.com/ (build b445e46, uploaded 20 Nov). Captured with
`tools/capture-pages.mjs` (Playwright, desktop 1440x810 and phone 390x844 DPR 2, scroll-driven where the scene is scroll
driven, 6 moments per scene). Reference frames: `tools/ref-frames.sh` (clip frames 0, 29, 58, 87, 115, 144 = 0 to 6.04 s).
Sheets: `sheet-<ID>.jpg` (row 1 reference, row 2 staging desktop, row 3 staging phone). Graded strictly.

## The short version

1. **The site does not yet look like the videos because most of the videos are not on the page yet, and the ones that are
   read small.** Of the 11 locked scenes, staging (b445e46) carries 01A, 03B, 04B and 05C. 06B/07C sit uncommitted in 016/016b
   (gate harness failure, see step 3), 09B/10A/11B/08B are prompts 017 to 019 that have not run, and **02A never had a 1080
   prompt at all**: the home "film strip" is still the old flat contact-sheet row from before the motion lock.
2. **Our gates checked the video file, not the page.** scene_gate floats each video to a full 1280x720 box in gate mode and
   compares it to the clip. That is why 04B "passed" at 0.95 while on the real page the ink drop plays inside one small tile and
   is easy to miss. Every remaining prompt now also gates on an on-page side-by-side sheet (same capture tool as this audit).
3. **Photo repetition is real.** 194 photo placements across 19 pages use only the 70 curated images; the runway catwalk shows
   two photos 8 times each; fb_029_runway appears on 7 pages; fb_168_city on 8. 121 of Tina's 185 Facebook photos are unused.
   Plan: `PHOTO-PLAN.md`.
4. **About top is a cut-out collage**: the left "Alberta map" shape is `src/assets/about-layers/figure.webp`, a crude black
   silhouette cut-out (288x763), over a cut-out bridge arch on a pink haze. Not a photo, not on the locked look.

## Ranked by visibility (most visible first)

| Rank | Scene / item | Where | Status on staging | Prompt |
|---|---|---|---|---|
| 1 | 02A film gate advance | Home, 2nd section | Not built. Flat row of 6 photos | 022 |
| 2 | About hero (09B area) | /about/ top | Cut-out silhouette collage | 023 (+017) |
| 3 | 04B ink drop | /work/ first screen | Built, reads tiny, colour grid not B&W | 025 |
| 4 | 05C light table | /work/ entrance | Logo splash then flat tilt; phone has none | 025 |
| 5 | Photo repeats | site wide | Heavy repeats, watermarked frames in prime slots | 024 |
| 6 | 01A living gown | Home hero | Plays, but motion barely reads after load | 026 |
| 7 | 03B followspot | Home 3rd section | Close, but red wash and tint, weak spot | 026 |
| 8 | 06B crimson thread | /fashion-editorial/ | Not on staging (016 pending) | 016 re-gate |
| 9 | 07C print stack | /series/* | Not on staging (016 pending) | 016 re-gate |
| 10 | 09B blue hour lights | /about/ | Not built (017) | 017 + 023 |
| 11 | 11B veil wipe | /portraits-bridal-couples/ | Not built (018) | 018 |
| 12 | 10A blue hour drift | footer band | Not built (017); band is a grey still | 017 |
| 13 | 08B ink flood | every nav | Not built (019); hard cut | 019 |

## Per scene: what the video shows that staging does not

### 02A film gate advance (home): sheet-02A.jpg, 02A-reference-12-frames.jpg, 02A-reference-events.jpg
Reference, frame by frame (1280x720, 24 fps, 145 frames):
- f0 to f20 (0 to 0.8 s): one 35mm strip of five colour frames (Legislature black gown, blue feather look, beauty close-up with
  red brush, white bridal on stairs, couple in teal) lies across a dark ink-splotched light table. The strip is not flat: it
  is turned about 7 degrees, rising to the right, and seen in perspective so the left end is nearer and larger, with a soft bow
  along its length. Black film base, rectangular sprocket holes top and bottom, thin frame lines between frames. Warm amber
  light leaks out under the strip and pools on the table below it; the room around it is near black.
- f21 to f30 (0.9 to 1.25 s): gate advance. A quick double image / motion-blur ghost slides each frame toward its neighbour
  (one frame's worth), then snaps into register. Light flickers as the frame passes the gate.
- f31 to f59 (1.3 to 2.4 s): settled. The centre frame is the brightest; the ends fall off into shadow.
- f60 to f96 (2.5 to 4.0 s): the projector light dims and flickers (backlight pulses down, then returns), a second slower
  drift.
- f97 to f144 (4.0 to 6.04 s): steady glow, strip still, amber pool breathing slightly.
Staging: a flat, full-width row of six tall photo slices edge to edge, no film base, no sprockets, no frame lines, no tilt,
no perspective, no curve, no backlight, no gate motion. Scroll does nothing to it (frames 1 to 4 identical, mean pixel diff
0.0 to 1.9) until the next seam darkens it. Two slices show Tina's script watermark (text baked into media).
Gap: everything. Motion, depth, perspective, lighting, texture, timing and interactivity are all missing.
What Matt asked for on top of the clip: a curved, fisheye or barrel strip that scrolls along. Prompt 022 does both: the
clip's look (tilt, sprockets, amber gate light, ghost advance, centre brighten) on a strip bent into a barrel, driven by
scroll.

### About hero (top of /about/): about-hero-current.jpg, sheet-09B.jpg
Staging: pink haze sky, a pale cut-out of the Walterdale arch with jagged mask edges, and on the left a solid black blocky
silhouette (`figure.webp`, alt "A photographer at work, seen from behind") that reads like a map of Alberta, not a person.
Big "TINA CAMPBELL" over it. On phone the silhouette sits mid-screen and is the most prominent shape.
Reference 09B: a real wide river-valley photo, Walterdale bridge and skyline, sunset sliding to blue hour, city lights and
reflections coming on.
Gap: not a real photo (rule breach in spirit), no blue hour shift, no light, cut-out edges visible. Fix (Matt): redo the
top as Editorial Split, ink text panel left, a real photo right: `fb_171_bts`, Tina behind the camera (confirmed
by Matt 20 Nov), then the 09B blue-hour scrub as the band directly below. Prompt 023, 017 amended.

### 04B crimson ink drop (/work/): sheet-04B.jpg
Reference: three large black-and-white prints; on the centre one a drop of crimson ink lands on the gown and blooms until the
gown is fully red while the rest stays monochrome. Big, slow, central.
Staging desktop: a full-colour masonry grid; the video plays inside one small tile (about 9 percent of the screen) and the
bloom is only visible in the last two frames. Nothing else in the grid is monochrome, so the colour pop has no contrast.
Phone: a tap opens the series page (The Red Gown) instead of showing the ink; no ink seen.
Gap: scale, contrast (B&W surround), and the phone interaction.

### 05C light table drop (/work/ entrance): sheet-05C.jpg
Reference: B&W prints tumble in 3D onto a warm lamp-lit table with real drop shadows, land, and square up into a grid.
Staging desktop: about 2 s of the TCPhoto logo splash, then a dark empty pool with "Work", then colour tiles appear already
tilted and settle. No fall, no table texture, no shadows tightening, no B&W. Phone: grid just fades in.
Gap: the fall itself, the table, the light, the monochrome print look, and the phone version.

### 01A living gown (home hero): sheet-01A.jpg
Reference: gown starts tucked and sweeps into a full billow across the sky over the 6 s; strong, continuous movement.
Staging: the hero is already at the billowed pose and moves very little after load (mean frame diff 2 to 8 out of 255);
it reads as a still with a shimmer. Phone crop is good. Dark band and caption are intended (carried in 020).
Gap: visible motion. Check loop window and playback rate on the real page (not in gate mode).

### 03B followspot (home): sheet-03B.jpg
Reference: black-and-white catwalk, a hard white followspot travels along the line, the red gown is the only colour.
Staging: once entered it is close (good), but the entry is a flat red wash for two frames, the whole frame carries a warm
red/sepia tint instead of clean B&W, and the spot is soft. Phone crops to two figures, losing the line of models.
Gap: grade (clean mono + one red), spot contrast, entry wash, phone crop.

### 06B crimson thread (/fashion-editorial/): sheet-06B.jpg
Reference: black left half for type, B&W photo right; a crimson thread runs in and the gown turns red.
Staging (b445e46, 016 not deployed): ink text panel left, three stacked colour red-gown photos right, no change on scroll.
The 016 work (editorial-thread.ts) adds the scene but failed the combined harness; re-gated in step 3.

### 07C print stack (/series/*): sheet-07C.jpg
Reference: three white-bordered prints stacked and tilted on black, shuffling as you go.
Staging: a full-bleed hood-of-truck crop under the title; no prints, no stack. 016 adds print-stack.ts (pending).

### 08B ink flood (page transitions): sheet-08B.jpg
Reference: black ink billows up and floods the frame, then the next photo is revealed through the ink.
Staging: hard cut after about 1.4 s. Phone capture opened the menu but the link did not navigate in the capture (recheck).
Prompt 019 pending.

### 09B blue hour lights: see About hero. Staging: scrolling only moves the cut-out layers; no time-of-day change.

### 10A blue hour drift (footer band): sheet-10A.jpg
Reference: full-bleed Walterdale arch at blue hour, slow drift, lights glinting on the river.
Staging: a small, desaturated grey river photo under "Let's make something bold"; the bridge is tiny and the frame is flat.
Prompt 017 pending.

### 11B veil wipe (/portraits-bridal-couples/): sheet-11B.jpg
Reference: a white veil sweeps across the frame and wipes the bride to the next chapter (bride from behind).
Staging: chapter list with photos and plain scroll; one soft cross-fade. No veil. Prompt 018 pending.

## Photo repetition (b445e46 dist, counted per visible <img>/background)
Full table: `photo_audit.txt`, near-duplicates `neardup.txt`. Highlights:
- 19 pages, 194 placements, 70 distinct (all of the curated set), 121 of 185 Facebook photos unused.
- Same photo twice or more on one page: /runway/ catwalk (fb_012_runway x8, fb_029_runway x8, fb_037 x2, fb_158 x2),
  home (fb_046_signature x2, fb_016_signature x2), /fashion-editorial/ (fb_016, fb_009, fb_034 x2), every /series/ page
  (cover repeated in its own grid, e.g. the-red-gown fb_016 x3, legislature fb_046 x3), /work/ (fb_016, fb_013, fb_049 x2).
- Cross-page heavy hitters: fb_029_runway 7 pages (incl. About, Fashion & Editorial, Red in Snow: runway shots outside runway
  sections), fb_168_city 8, fb_046_signature 6, fb_065_couples 6, fb_016_signature 5, fb_049_bridal 5, fb_141_signature 5.
- Exact duplicate in the library: fb_141_signature = ig_profile_02 (dHash distance 0). Close pair fb_018 ~ fb_160.
- Text in media: the home strip shows Tina's script watermark on two slices; several curated frames carry small marks.
Fix: prompt 024 with `PHOTO-PLAN.md`.
