# Exact-match review: 002d-home-exact-fix1

Independent check of `qa/002d-home-exact/exact/driver-verify-002d-home-exact-fix1` (clip 01 at 1280x720, home at 1440x900 and 390x844). Layouts `concepts/site-layouts/01-home-desktop-v2b.jpg` and `11-home-mobile.jpg`. The builder checklist at `qa/002d-home-exact/exact/CHECKLIST.md` is the pre-fix pass sheet and was not used as proof. G5 was not recaptured; commit `6a49dc2` does not touch the in-panel mark.

Words are live copy. Sizes are judged within about 10% of the clip or layout. Scroll positions are the clip 01 curve (t=3.0 is 295px, t=6.0 is 621px).

| ID | Verdict | Evidence | Measured vs target |
|---|---|---|---|
| G1 | PASS | `clip01/build/b-000.jpg`, `pages/home-1440/fwd-000-y0.jpg` | Photo starts at y=100 at 1280 (target ~100–105) and y=112 at 1440 (target ~112). |
| G2 | PASS | `clip01/build/b-000.jpg`, `pages/home-1440/fwd-000-y0.jpg`, `pages/metrics.json` | Ink at 1280 is x=57–211, about 155x94. DOM box at 1440 is 187x133; visible ink about 173x104. Width is within 10% of 187. Height follows the 584x415 art. |
| G3 | PASS | `clip01/build/b-000.jpg`, `clip01/clip/c-000.jpg`, `pages/home-1440/fwd-000-y0.jpg` | At 1280 the white ink is y=49–66 (18px) and x=375–996. Clip ink is y=42–59 and x=377–1000. At 1440 the ink is y=56–74 (19px) and x=423–1120. Target is ~18px ink at 1280, ~20px at 1440, group about x=375–1000 at 1280. |
| G4 | PASS | `clip01/build/b-000.jpg`, `pages/home-1440/fwd-000-y0.jpg` | 182x55 at 1280 (x=1046–1227), fill `#b3261d`. 203x60 at 1440 (x=1178–1380). Target 183x55 at 1280, ~206x62 at 1440, `#B3261E`. |
| G5 | PASS | prior `after-pages/fashion-editorial-1440/fwd-000-y0.jpg`; fix commit does not edit the mark | In-panel mark was 183x115, script aspect, within 10% of ~200 wide. `6a49dc2` only changes `home.ts`, `home.css`, and `global.css`. |
| G6 | PASS | `pages/home-390/fwd-000-y0.jpg`, `pages/metrics.json` | Logo box 79x56 at (20, 12). Hamburger on the right. Target mark ~56px tall. |
| H1 | PASS | `clip01/pair-000.jpg`, `pages/home-1440/fwd-000-y0.jpg` | Both lamp globes and the full figure are in frame. At 1440 the photo is capped with night-blue side bars (sample `#061939`), not a bright matte. |
| H2 | PASS | `clip01/build/b-000.jpg`, `clip01/clip/c-000.jpg`, `clip01/zone-luma.json` | Build sky samples `#051d43`, `#092145`, `#0f2850`, `#284879`. Clip samples `#07223d`, `#0a3057`, `#08335e`, `#23588a`. t=0 zone mean abs is 14.2. Top-left 36.6 vs 31.5, top-mid 36.0 vs 41.3, top-right 34.2 vs 30.6. Skin stays warm. |
| H3 | PASS | `clip01/build/b-000.jpg`, `pages/home-1440/fwd-000-y0.jpg` | Left-edge luma falls through the bottom of the hero. Largest 1px step in the bottom 40% is 7. Meta row sits on the fade. |
| H4 | PASS | `pages/metrics.json`, `clip01/build/b-000.jpg`, `clip01/build/b-008.jpg` | Glyph width 1013/1280 = 79.1% (top y=512) and 1147/1440 = 79.7%. At t=2.0 (scroll 110) the width is 1019 and the top is y=408, about 1:1 with the page. It does not scale. |
| H5 | FAIL | `clip01/pair-010.jpg`, `clip01/build/b-012.jpg`, `clip01/clip/c-012.jpg`, `clip01/build/b-024.jpg`, `clip01/pair-016.jpg`, `clip01/pair-024.jpg` | t=2.5 (scroll 201): build tile top y=400, most of the tiles already in frame. Clip is still on the hero, label only at the bottom. t=3.0 (scroll 295): build label y=286, tiles y=324–660 (full 337px), numbers y=675–689. Clip tile tops are y≈597. Off by 273px. t=6.0 (scroll 621): build label y=211–221, tile top y=244, numbers y=595–610, title gone. That end frame is within about 20px of tile top y=236 and label y≈200. From t=3 to t=6 the tiles rise only 80px while scroll increases 326px, so they are not moving with the page. |
| H6 | PASS | `clip01/build/b-024.jpg`, `pages/home-1440/fwd-002-y900.jpg` | Five tiles, 225x337 at 1280, gaps 24px, outer margin 30px. Numbers under the tiles. Label only. No right caption or rule. |
| H7 | FAIL | `pages/home-1440/fwd-002-y900.jpg`, `clip01/build/b-024.jpg`, layout 01, `images/fb_085_runway.jpg` | Tile 1 is the red gown across the Fargo grille (scale 1.14). Signature sits in the sky, not on the body. Tile 3 is `fb_085_runway` at scale 3.8, so the frame is red cloth only. The file’s red gown is a figure on the left of a lit indoor runway. Tiles 2, 4, and 5 stay the nearest real frames (fence, not snow; no magenta stage; legislature steps, not a dark venue). |
| H8 | PASS | `pages/home-1440/fwd-003-y1350.jpg`, layout 01 | Headline ink x=60–886, w=827 (57.4% of 1440), one line, settled white about `#f0f4f5`. Target ~57% / ~820px, left at the margin, ending `#F0F3F4`. |
| H9 | PASS | `pages/home-1440/fwd-003-y1350.jpg` | Six tiles, about 237x189 (5:4), x from 0 to 1439, gaps 4px, mono labels on the dark bar. |
| H10 | CLOSEST | `pages/home-1440/fwd-004-y1800.jpg`, layout 01 | Split is 50/50 at x=720, photo bleeds to the right edge, gown on the turquoise Fargo, no signature on the subject. The layout’s standing-beside-the-grille pose is the signed file. Same frame as the last pass. |
| H11 | CLOSEST | `pages/home-1440/fwd-005-y2250.jpg`, `pages/home-1440/fwd-006-y2394.jpg`, layout 01 | Walterdale arch and skyline, darkened, smoke on the left. Type and crimson pill sit left. The only plate with both the arch and the skyline is daylight. |
| H12 | PASS | `pages/home-390/fwd-000-y0.jpg`, `pages/metrics.json`, layout 11 | CAMPBELL ink w=221 (57% of 390). Block y=390–510 (46–60% of 844). Pill x=19–370, y=784–829, at the bottom of the hero. |
| H13 | FAIL | `pages/home-390/fwd-002-y844.jpg`, layout `11-home-mobile.jpg` | Three photos, height 574px (68svh). Gutters at x=91–96 and x=292–297. Left 91px (23%), centre 195px (50%), right 92px (24%). Layout 11’s middle phone is about 24/50/24, so the widths match. The centre is tile 2 (caption “No. 002”), with the truck as the left peek. Layout 11 centres the truck. The rail is a crimson segment (x≈21–159) then a grey track. |

Console errors on the driver home captures are empty. `overflowX` is false at 1440 and 390.

VERDICT: FAIL
