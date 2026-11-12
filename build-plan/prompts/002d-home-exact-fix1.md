---
id: 002d-home-exact-fix1
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope is only the failing IDs below. Do not restyle anything that already passed (G1, G2, G4, G5, G6, H1, H3, H4, H6, H9, H12). Leave H10 and H11 on the frames already chosen.

G3. Nav is too small and the group is too wide.
Measured: at 1280 the nav ink is y=52–65 (14px tall) and x=342–1099. At 1440 `metrics.json` font-size is 20px and the ink is y=58–72 (15px), x=388–1050.
Target: mono, glyph height ~18px at 1280, scaling to match the clip, centred group from about x=375 to x=1000 at 1280. Clip ink on `clip01/clip/c-000.jpg` is y=42–59 (18px) and x=377–1000.
Evidence: `qa/002d-home-exact/exact/driver-verify-002d-home-exact/clip01/clip/c-000.jpg`, `clip01/build/b-000.jpg`, `pages/home-1440/fwd-000-y0.jpg`, `pages/metrics.json`.
Fix: raise the header nav so the white glyph box is ~18px tall at 1280 and ~20px tall at 1440 (the current 18px/20px font-size is the em size, not the ink). Tighten link padding and tracking until the same five labels span about x=375–1000 at 1280 and stay a centred group. Keep JetBrains Mono and the live labels.

H2. Hero sky is the wrong blue.
Measured: build sky on `b-000.jpg` is `#004097` at (8%, 22%), `#0b58b0` at (85%, 22%), `#1556b0` at (92%, 40%), `#2e75cf` at (80%, 55%). Zone luma t=0 top-left 57.9 vs clip 31.5, top-right 56.6 vs 30.6. Mean abs 15.1 only because the figure is darker.
Target: deep night blue, sky about `#12305f` to `#1d4c8f`, matching clip 01 and layout 01. Clip samples `#07223d`, `#0a3057`, `#0d345d`. Layout 01 samples `#052c55`, `#204e80`, `#114e85`. Warm skin, vignette, and light grain stay.
Evidence: `clip01/build/b-000.jpg`, `clip01/clip/c-000.jpg`, `clip01/zone-luma.json`, `concepts/site-layouts/01-home-desktop-v2b.jpg`, `pages/home-1440/fwd-000-y0.jpg`.
Fix: the grade is `filter: brightness(0.72) contrast(1.15) saturate(2)` plus a weak multiply veil, on a `#0b4f9c` matte (`.hero__media`, `.hero__zoom`). Pull the sky down into the clip/layout range (blue channel around 70–140, not 170–210). Do not crush the skin. Re-sample with PIL until upper-sky zones are inside about 12 of the clip and the t=0 mean abs stays under 18. Keep the 1.25x cap and the bottom ink fade.

H5. Runway pacing does not match clip 01.
Measured at 1280x720: t=3.0 (`b-012.jpg`, scroll ~303) tile tops y=535, 185px of a 340px tile visible (55%). Clip `c-012.jpg` tile tops y=597, 123px visible. t=6.0 (`b-024.jpg`, scroll 621) tile tops y=267, label near y=230, title still cut off at the top. Clip `c-024.jpg` tile tops y=236, tiles end y=573, label near y=200, title gone.
Target: at scroll ~303 only the label and the top of the tiles show (clip: tile top ~y597). At scroll 621 the label is ~y200 and the tiles and numbers sit like the clip (tile top ~y236). Tiles move with the page. No pin.
Evidence: `clip01/clip/c-012.jpg`, `clip01/build/b-012.jpg`, `clip01/clip/c-024.jpg`, `clip01/build/b-024.jpg`, `clip01/pair-012.jpg`, `clip01/pair-024.jpg`.
Fix: hero is `calc(117svh - var(--header-h))` and the track rises `y: 140` to `0` from `top 92%` to `top 48%` in `site/src/scripts/motion/home.ts`. That curve is early at t=3 and low at t=6. Retune hero height and that rise (or remove the rise if pure scroll can hit both) until a replay shows tile tops within about 20px of y=597 at t=3.0 and y=236 at t=6.0, with the label near y=200 at t=6 and the title off screen. Do not change tile size (H6 passed).

H7. Two runway tiles are the wrong crop. Tiles 2, 4, and 5 stay.
Measured on `pages/home-1440/fwd-002-y900.jpg` and `b-024.jpg`: tile 1 is `fb_016_signature` at `object-position: 100% 62%` and `scale(1.5)`, so it is face, sky, and the cab, not the gown across the grille. Tile 3 is `fb_085_runway` at `center 18%` and `scale(1.22)`, so the bride in white fills the frame. Tile 2 is `fb_114_signature`. Tile 4 is `fb_029_runway`. Tile 5 is `fb_046_signature`.
Target, layout 01: tile 1 red gown on the turquoise truck (grille and gown), tile 2 red gown in snow, tile 3 red gown on a lit catwalk, tile 4 magenta stage, tile 5 black gown in a dark venue.
Evidence: `pages/home-1440/fwd-002-y900.jpg`, `clip01/build/b-024.jpg`, `concepts/site-layouts/01-home-desktop-v2b.jpg`.
Fix tile 1: recrop `fb_016_signature` nearer scale 1.05–1.2 so the Fargo grille and the gown spread read together. Do not use `fb_013_signature` or `fb_116_signature`; the signature crosses the gown.
Fix tile 3: recrop `fb_085_runway` onto the red gown at the left of the file so the tile is not a bridal portrait. Do not use `fb_012_runway` (large type on the clothing) or `fb_037_runway` (wood wall and a WCFW badge, not a catwalk).
Leave tile 2 on `fb_114_signature` (no red ballgown in snow; `fb_034` and `fb_133` are athletic sets). Leave tile 4 on `fb_029_runway` (no magenta stage plate). Leave tile 5 on `fb_046_signature` (no dark-venue black gown that keeps the signature off the subject).

H8. The statement line is too narrow.
Measured: on `pages/home-1440/fwd-003-y1350.jpg` the headline ink is x=60–756, w=696, 48% of 1440, settled colour about `#eff1f3`.
Target: one white serif line, left at the page margin, spanning ~57% of the viewport (~820px at 1440). Layout 01 ink is about x=26–431 of 720 (56%).
Evidence: `pages/home-1440/fwd-003-y1350.jpg`, `concepts/site-layouts/01-home-desktop-v2b.jpg`.
Fix: `.statement h2` is `clamp(2.5rem, 6.2vw, 6rem)` (89px at 1440). Increase it until the glyph width is about 800–860px at 1440 and the same ratio at 1280. Keep it one line, left aligned, ending `#F0F3F4`. Keep the dek; it is live copy.

H13. Mobile runway shows two panels, not three.
Measured at 390 on `pages/home-390/fwd-002-y844.jpg`: the active frame is 62vw, x=74, w=242. The left 74px is empty ink. The right peek is about 66px of the next photo. Frame height is 68svh. Caption is "No. 001" left and "EDMONTON" right. The progress fill is a short tick (`scaleX` of the revealed track).
Target: layout 11 middle phone shows three photos at once (arch peek, truck centre, gown peek), frames about 68svh, a crimson progress rail, and a mono "No. 014 / EDMONTON" caption. Side peeks are about 18% of the width. The centre is the wide panel.
Evidence: `pages/home-390/fwd-002-y844.jpg`, `concepts/site-layouts/11-home-mobile.jpg`.
Fix: the track padding is `(100vw - 62vw) / 2` and each item is `62vw`, so slide 1 has a blank left side. Set the initial scroll and the item width so three photos are visible, side peeks about 18% each and the centre the rest (about half the screen, not 62% plus a blank). Keep 68svh, the real No. / place caption, and make the crimson bar read as the rail under the panels in layout 11.

Commit: fix(002d-home-exact): exact-match round 1
