---
id: 002d-home-exact-fix2
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope is only the failing IDs below. Do not restyle anything that already passed (G1, G2, G3, G4, G5, G6, H1, H2, H3, H4, H6, H8, H9, H12). Leave H10 and H11 on the frames already chosen. Leave runway tiles 1, 2, 4, and 5 on the frames already chosen.

H5. Runway pacing does not match clip 01.
Measured at 1280x720 on `qa/002d-home-exact/exact/driver-verify-002d-home-exact-fix1/clip01/`. The clip curve is scroll 295px at t=3.0 and 621px at t=6.0.
t=2.5 (scroll 201), `pair-010.jpg`: build tile top y=400, so most of the 337px tiles are already in frame. The clip is still on the hero, with only the label at the bottom edge.
t=3.0 (scroll 295), `build/b-012.jpg` and `pair-012.jpg`: label ink y=286, tile block y=324–660 (h=337), numbers y=675–689. Clip `clip/c-012.jpg` tile tops are about y=597, only the tops visible. Build is 273px early.
t=6.0 (scroll 621), `build/b-024.jpg` and `pair-024.jpg`: label y=211–221, tile top y=244, numbers y=595–610, title gone. Clip label is y=202–218. Target tile top is y=236 and label about y=200. This end frame is inside about 20px. The path is not. From t=3 to t=6 the tiles rise only 80px (324 to 244) while scroll increases 326px. Meta ink is y=113–120 at t=4.0 (`b-016.jpg`) and y=90–94 at t=5.0 (`b-020.jpg`), then gone. The runway is parked on screen early and then creeps.
Target: at scroll ~295 only the label and the top of the tiles (tile top within 20px of y=597, numbers still below the fold). At scroll 621 the label is near y=200 and the tile top is within 20px of y=236, title off screen. Between those times the tile top moves about 1:1 with the scroll. No pin.
Evidence: `qa/002d-home-exact/exact/driver-verify-002d-home-exact-fix1/clip01/pair-010.jpg`, `pair-012.jpg`, `pair-016.jpg`, `pair-020.jpg`, `pair-024.jpg`, `build/b-012.jpg`, `build/b-024.jpg`, `clip/c-012.jpg`, `clip/c-024.jpg`.
Fix: desktop `.hero` is `height: calc(113.7svh - var(--header-h))` in `site/src/styles/home.css`. `initRunwayRise` in `site/src/scripts/motion/home.ts` moves `[data-runway-track]` from `y: 30` to `y: 0` between `top 78%` and `top 30%`. A second ScrollTrigger sets the title `y: -58 * progress` from scroll 380 to 621. Remove both transforms so the label, tiles, title, and meta move with the page. A constant tile-top document position of about 860–890px at 1280x720 hits both gates with pure scroll (scroll 295 lands near y=579–595, scroll 621 lands near y=239–269). Today the t=3 frame behaves as if that position is 619 (visual 324 + scroll 295), about 250px too high, and the effective position then grows by ~246px by t=6. After the transforms are gone, lengthen the hero until a new clip 01 replay shows tile tops within 20px of y=597 at t=3.0 and y=236 at t=6.0. Do not change tile size (H6 passed). If the tiles still fail to track scroll, log `window.scrollY` at those two timestamps before changing anything else. The driver calls `__tcMotion.scrollTo`, which is Lenis `scrollTo` with `immediate: true`.

H7. Runway tile 3 is the wrong crop. Tiles 1, 2, 4, and 5 stay.
Measured on `qa/002d-home-exact/exact/driver-verify-002d-home-exact-fix1/pages/home-1440/fwd-002-y900.jpg` and `clip01/build/b-024.jpg`: tile 3 is `fb_085_runway` with `.pos-catwalk` at `object-position: 0% 40%` and `scale(3.8)`, so the tile is red cloth. No figure, no floor, no catwalk. The source file (`images/fb_085_runway.jpg`, 640x960) is a lit indoor runway: the red gown is the figure along the left edge, and a bride in white is the centre. Tile 1 (`fb_016_signature`, scale 1.14, `48% 82%`) now shows the gown spread and the Fargo grille, with the signature in the sky. Leave it. Leave tile 2 on `fb_114_signature`, tile 4 on `fb_029_runway`, and tile 5 on `fb_046_signature`.
Target, layout 01: tile 3 is a red gown on a lit catwalk. Tiles 2, 4, and 5 stay the nearest real frames (no snow ballgown, no magenta stage, no dark-venue black gown that keeps the signature off the subject).
Evidence: `qa/002d-home-exact/exact/driver-verify-002d-home-exact-fix1/pages/home-1440/fwd-002-y900.jpg`, `clip01/build/b-024.jpg`, `concepts/site-layouts/01-home-desktop-v2b.jpg`, `images/fb_085_runway.jpg`.
Fix tile 3 only: recrop `fb_085_runway` so the red gown reads as a person (shoulder, arm, skirt) on that lit floor. Use a scale around 1.2–1.8 with the origin on the red gown, not 3.8 into the cloth. Keep the bride out of the centre of the tile. Do not use `fb_012_runway` (type on the clothing) or `fb_037_runway` (wood wall and a badge). If the white bride cannot be excluded entirely, the tile must still show the red gown as the subject on the lit runway.

H13. Mobile runway centres the wrong frame.
Measured at 390 on `qa/002d-home-exact/exact/driver-verify-002d-home-exact-fix1/pages/home-390/fwd-002-y844.jpg`: three photos, frame y=125–699 (h=574, 68svh). Gutters x=91–96 and x=292–297 (6px). Left panel x=0–90 (91px, 23%), centre x=97–291 (195px, 50%), right x=298–389 (92px, 24%). The centre is tile 2. Caption reads “No. 002” and “EDMONTON”. The left peek is the truck. The right peek is the red-cloth tile. The rail is crimson from about x=21–159, then grey, above the mono caption.
Target: layout 11 middle phone. Measured on that phone, the panels are about 24% / 50% / 24%, so the current widths match. Do not change the 50vw item width. The centre panel is the turquoise truck, with a narrow photo peek on each side. Caption is the truck’s real “No. 001” and place. Height stays 68svh. The crimson-on-grey rail stays.
Evidence: `qa/002d-home-exact/exact/driver-verify-002d-home-exact-fix1/pages/home-390/fwd-002-y844.jpg`, `concepts/site-layouts/11-home-mobile.jpg`.
Fix: `centerTrio()` in `initRunwayProgress` (`site/src/scripts/motion/home.ts`) scrolls so `items[1]` is centred. Centre item 0 (the truck, `fb_016_signature`) instead. The layout’s left peek is the Walterdale arch, which is not one of these five frames, so prepend a clone of the last tile (or another real frame) so the left 23% is a photo and not empty ink. The right peek is then tile 2. Keep 50vw, the 6px gap, 68svh, and the rail.

Commit: fix(002d-home-exact): exact-match round 2
