# 004-work visual notes

Primary reference is `concepts/site-layouts/02-work-index-desktop-v3.jpg` (720x1280 artboard) and `16-motion-hover-distortion-v3.jpg`. PDF pages `pdf-p18-noir-crimson.jpg` and `pdf-p21-inside-pages.jpg` confirm the Noir and Crimson family. Built shots: `desktop-1440-viewport.png`, `desktop-1440-top.png`, `desktop-1440-mid.png`, `desktop-1440-lower.png`, `mobile-390-viewport.png`, `mobile-390-mid.png`, `small-360-viewport.png`, `reduced-viewport.png`. Composites are in this folder.

Layout 02 is a tall artboard, so a height-fit composite shrinks our 1440 fold. Type size was judged from the 1440 viewport, not from that fitted board.

## Fidelity

| Section | Result | Fix made |
| --- | --- | --- |
| Header, Work title, count (1440) | match | Live title "Work" with "70 frames" on the baseline. The artboard says 148. 70 is the real portfolio count. |
| Filter row (1440) | match | Serif row, hairline rule, crimson underline on the active item. Links are `/work/` and `/work/?filter=`. |
| First row, layout 02 (1440 viewport) | match | Three large fashion tiles. Noir grade, red garments kept (truck gown, fence gown). Middle gown is black, so it stays black and white. Layout 02's third tile is a white bridal frame. Fashion leads, so the third hero is `fb_114_signature`. |
| Masonry, gutters, pills (1440 top, mid, lower) | match | 12 columns, dense, grey pills centered in the row gap. Later rows stay fashion-led. The artboard mixes in the bridge and couples sooner. Those frames are in the grid, smaller, after the fashion run. |
| Photo grade vs layout 02 and PDF p18 | match | Shared WebGL hue mask: crimson and red stay saturated, everything else is desaturated. Warm skin and red print (the Playboy cover) stay partly red because they sit in that hue. CSS fallback is full colour. Accent is `#B3261E`, not the PDF chip `#963730`. |
| Hover still vs layout 16 | match with a clamp | `red-during.png` is an early bubble (ripple just past 0.22), not the end state. Layout 16's sphere is the held hover. The built end state is the full-tile glass bubble in motion frame 11. |
| Mobile 390 fold and mid | match | Full-colour 2-column grid, hamburger header, filters wrap, crimson underline on All. No hover, no WebGL. No mobile layout was named. Prompt requires this treatment. |
| 360x780 | match | Same 2-column full-colour grid. Couples and Edmonton wrap to the second line. Underline stays on All. |
| Reduced motion 1440 | match | Full colour, 12-column grid, canvas hidden, count still 70. |
| PDF p18 and p21 family | match | Black field, white serif, red garments on monochrome frames. p21's gallery index is the same direction. |
| Clip 03 ripple | match with a clamp | See `motion-compare/MOTION-NOTES.md`. Bubble grows from the cursor, colour floods, neighbours stay still, ripple stays inside the tile. The clip spills onto the film at the end. That spill is not copied. |
| Every style has a filter | match | All, Fashion & Editorial, Runway, Portraits (11), Bridal, Couples, Edmonton. Portraits shot: `desktop-filter-portraits.png`. |
| Fashion and editorial largest | match | Lead order starts `fb_013_signature`, `fb_046_signature`, `fb_114_signature`. Fashion roles are hero (span 4 / 5 rows) and tall. Other categories are small or runway-span. |
| Mobile first paint | drift, fixed | The first touch screenshots were dim because the desktop intro tween also ran on coarse pointers and the shot landed mid-fade. Intro now runs only for a fine pointer at 801px and up. Viewports were recaptured after images loaded. |

## Gaps that stay

- Count reads 70 frames. The artboard's 148 is a mock number.
- Watermarks inside the photographs ("TC Photo Photography", plate `LJ0118`) are in Tina's files. They are not extra type.
- The clip's film-strip chrome and baked "View" circle are the motion reference only. The page cursor is the site crimson "View" cursor.
