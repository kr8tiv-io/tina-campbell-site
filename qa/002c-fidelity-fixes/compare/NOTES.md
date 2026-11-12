# 002c fidelity check

Measured against layouts 01, 11, 14, 19 and 06, clips 01 and 02, and Tina's notes (Runway favourite: dark cinematic, crimson buttons, sideways runway; Editorial Split for text beside photos; Bridge and Skyline in the footer band; Film Strip sprockets on the category band; fashion and editorial first; every style shown). No dead pins.

| Section | Verdict | Fix made |
|---|---|---|
| Header | match | Logo 64px desktop / 56px mobile. Nav is 16px JetBrains Mono. Gap is 35.2px (2.2rem) at 1440. Crimson pill stays `#B3261E`. |
| Hero, desktop | match | Night grade is CSS only: navy multiply 0.4 on `.hero__shade`, `brightness(0.78) saturate(0.8)`, vignette and a bottom ink gradient. Name is centred. Width is 1142/1440 = 0.793 and 1015/1280 = 0.793 (about 80%). The 961 to 1360 shrink is gone. `object-position` is `center 8%`, not 22%: at 22% the 1440x804 hero cut off the face and the lamp globes. 8% keeps both in frame the way layout 01 does, with the 1.045 zoom removed so the face is not upscaled. Scroll scales the title toward 92vw and lifts the photo 18% over the first half of the hero, forward and back. |
| Home runway strip | match | Five frames use `flex: 1 1 0` and sit inside the content box. Track width is 1325px at 1440 (content box 1440 minus 57.6px pad each side) and 1178px at 1280. Frame 05 is fully visible. The home pin is removed. The strip rises in as the section enters. |
| Home runway photos | closest photos | 01 `fb_013_signature` red gown on the teal truck. 02 `fb_114_signature` is the closest red ballgown; no red ballgown in snow exists (the red-in-snow files are athletic sets). 03 `fb_037_runway` red gown, Western Canada Fashion Week. 04 `fb_012_runway` stands in for the magenta-stage black gown: no black gown under magenta stage light exists in `images/`. This frame is a dark stage with coloured light and a red coat. 05 `fb_046_signature` black satin at the Legislature (daylight, not night). Watermarks are left in place. |
| Statement | match | Live line "Edmonton is my runway." Size and placement agree with layout 01. |
| Category film strip | match | Tiles are 4:5. Labels are 1rem JetBrains Mono, centred. Sprocket holes stay, quieter (Tina ticked Film Strip). |
| Red Gown split | closest photo | Wide 3:2 bleed to the right edge, min-height 520px, live sentence and "View the series". `fb_016_signature` is the widest clean red-gown-on-teal-truck frame. Crop `center 52%` keeps her face and the hood; the TCPhoto script sits in the sky, not across her body. `fb_013_signature` puts the watermark across the hood. The layout's standing-beside-the-door plate is a generated frame, not a file we have. |
| Bridge and Skyline | closest photo | One plate, no arch blend, no extra mark, left ink scrim over about 40%, crimson "Book a shoot", footer below the band. `fb_577057434409234` (from `raw/fb_all/`) is the only wide frame with both the Walterdale arch and the downtown skyline. It is late daylight with smoke, not the layout's pink dusk. Crop `center 46%` keeps the arch, the towers and the river, and drops the baked TCPHOTO mark in the lower right. |
| Mobile hero | match | Daylight frame. Stacked name centred at `clamp(3.6rem, 18vw, 5.6rem)`. Logo 56px. "Book a shoot" pill is on the hero. |
| Mobile runway | match | Section is `min-height: 100svh`. Three-panel snap, centre frame 68svh, neighbours peek. Progress is a 2px crimson bar at 42% width. Caption is mono "No. 001" left and the location right. |
| Mobile categories | match | Thumbs 88px. Labels `clamp(2.4rem, 11vw, 3.25rem)` small caps. Mono "No." line. The sticky pill hides once the hero leaves the screen, so it does not cover the last row. |
| 404 | match | H1 "Page not found" in the display serif (8vw at 1440). Darkened `fb_016` truck frame (`brightness(0.45)`), CSS sprockets, frame 920x468 (min(920px, 72vw) by 52vh). Sub line in a `p`. Crimson "Back home". Footer top is 900 at a 900px viewport, so it sits below the fold. |
| Loader | match | Signature, crimson rail and counter match layout 14. A full-mark drop-shadow bloomed the letters, so the optional tip glow was not kept. |
| Home scroll (clip 01) | match | No pin. Title grows and the photo lifts on the first half of the hero, then the flat five-frame strip rises in. Reverse returns the title and photo (end transform is identity). |
| /runway/ (layout 06, clip 02) | match | Concave film strip, sprocket bands, crimson rail and dot. Centre read is the blue-feather frame (`fb_064`). Pin distance equals horizontal travel: 795px = 795px at 1440, recomputed on refresh. Sub line stays "Edmonton fashion shows" (COPY.md). Real frames are mall-lit, not the layout's magenta renders. |

## Measurements

| Check | Result |
|---|---|
| Hero name / viewport | 0.793 at 1440 and at 1280, centred |
| Header logo height | 64px at 1440 and 1280, 56px at 390 and 360 |
| Nav | 16px JetBrains Mono; gap 35.2px at 1440 |
| Runway track vs content | 1325px track in a 1325px content box at 1440; 1178px at 1280. No clip. |
| Home pin | Removed |
| /runway/ pin vs travel | `data-pin-distance` 795, `data-travel-px` 795, mode webgl |
| Overflow | scrollWidth equals innerWidth at 1440, 1280, 390, 360, reduced motion, 404 and /runway/ |
| Broken images | None after load. Early `naturalWidth === 0` hits were lazy images still decoding. |
| Console | No page errors |
| Reduced motion | 0 hidden headings or frames. Five runway frames stay visible. |
| No-JS | Book bar stays `display: none`. Runway progress is `html.js` only. Copy and photos are in the HTML. |
