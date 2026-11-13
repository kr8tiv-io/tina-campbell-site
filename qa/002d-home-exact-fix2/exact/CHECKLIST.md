# 002d-home-exact-fix2

Scope is H5, H7, and H13. Passed rows were not restyled. Desktop boxes are Playwright `getBoundingClientRect` at 1280x720 unless a width is named. Clip frames are the official replay at `after-clip01/` (1280x720, no screenshot stall: 25 frames in 5.96s).

Replay contact: `after-clip01/CONTACT-clip-vs-build.jpg`.
Side-by-sides: `side-clip01-t3.jpg`, `side-clip01-t6.jpg`, `side-home-runway-1440.jpg`, `side-home-runway-390.jpg`, `side-home-hero-1440.jpg`.

## In scope

| ID | Target | Measured | Verdict | What changed |
| --- | --- | --- | --- | --- |
| H5 | At scroll 295 only the label and the tile tops (tile top within 20px of y=597, numbers below the fold). At scroll 621 the label is near y=200 and the tile top is within 20px of y=236. Between those scrolls the tile top moves 1:1. No pin. Tile size unchanged. | Scroll 295: label y=533, tile top y=580 (17px from 597), tile 225x337, numbers y=928 (below 720). Scroll 621: label y=207, tile top y=254 (18px from 236), numbers y=602. Tile top moves 326px while scroll moves 326px. Track transform `none`. Replay pixel tops: t=2.5 y=671, t=3 y=576, t=4 y=408, t=5 y=291, t=6 y=251. Title top at rest stays y=510 (H4). At scroll 621 the title top is y=-111 and the line-box bottom is y=47, so the lower edge of the glyphs and the meta row (y=62) remain. A scroll-linked title lift clears that edge and then stalls swiftshader screenshots by 300-650ms, which throws the replay clock off the curve. It stays removed. | PASS | Removed the runway-track rise (`y: 30` to `0`) and the title lift. Removed the hero-photo scrub that was stalling the replay. Desktop hero height is `calc(115svh - var(--header-h))`. Copy and media stay on the first screen, so the extra height sits under the title. |
| H7 | Tile 3 is the red gown on the lit runway. Shoulder, arm, and skirt read as a person. Bride stays out of the centre. Tiles 1, 2, 4, and 5 stay. | Tile 3 is still `fb_085_runway`. `object-position: 0% 46%`, `scale(2)`, `transform-origin: 0% 46%`. The foreground is the red gown's shoulder, arm, hand, and skirt. The bride is on the right of the tile. Watermark is below the crop. Tiles 1, 2, 4, and 5 are still `fb_016_signature`, `fb_114_signature`, `fb_029_runway`, and `fb_046_signature`. Tile box stays 225x337 at 1280. | PASS | Recropped `.pos-catwalk` only. Scale 2 is the smallest step that keeps the bride off the centre line. At 1.8 her face sits on that line. This is not the old `scale(3.8)` cloth crop. The lit floor is under the skirt in the source, so the venue reads behind the figure. |
| H13 | At 390 the centre panel is the turquoise truck, with a photo peek on each side. Caption is the truck's real "No. 001" and place. 50vw, 6px gap, 68svh, crimson-on-grey rail. | ScrollLeft 104. Clone (tile 5) x=-104 w=195, visible 0-91 (23%). Truck x=97 w=195 (50%). Tile 2 x=298, visible 298-390 (92px, 24%). Gaps 6px. Frame h=574 (68svh of 844). Caption "No. 001" / "Edmonton". Rail present. `overflowX` false at 390 and at 360. Desktop peek rect is 0, so the five-column grid is unchanged. | PASS | `centerTrio()` centres the first item that is not `[data-clone]`. A mobile-only clone of the last tile is prepended so the left 23% is a photo. The Walterdale arch is not one of the five frames. Reduced motion still hides the clone. |

## Checks

- `npm run build` completed. Console errors on the clip replay and on the home captures are empty.
- Home `overflowX` is false at 1440 and 390. A separate 360 measure was also false.
- No pin on the runway. Tile size was not changed.
