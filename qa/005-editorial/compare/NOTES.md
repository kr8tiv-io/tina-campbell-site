# 005 editorial visual notes

Compared 2026-11-12. Built pages: `/fashion-editorial/`, `/series/[slug]/` (all five), `/portraits-bridal-couples/`.

Viewport shots at 1440, 390 and 360 are the fidelity check. Full-page shots include ScrollTrigger pin spacers, so they read longer than the tall Imagine artboards.

## Fidelity

| Section | Result | Fix made |
| --- | --- | --- |
| Fashion split, type | match | Serif H1 on two lines, serif lead, sans index. Only the active number is crimson, as in layout 03 and clip 04. |
| Fashion split, photos | match | Column width tracks the shot height so three portrait tiles fit the first viewport. Crops are `fb_013` (leaning on the Fargo), `fb_116` (standing on the hood), `fb_136` (red two-piece). Real files carry the TCPhoto watermark across the gown. |
| Fashion split, rule and pin | match | Thin crimson rule. Left panel stays pinned while the track translates. `desktop-1440-fashion-pin.png` shows the index on 02 and later frames in the column. |
| Pull quote and strip | match | Quote set on three lines. Four red-gown crops. |
| Collab band | match | H2 plus crimson Collaborate to `/book/?type=fashion`. Supporting sentence from COPY sits under the row. |
| Series cover | drift | Two-line title, lighter shade, meta `Series 02 / Edmonton` (year omitted; COPY says omit an unknown year). `fb_046` is a centered full-length portrait, so a wide cover keeps her near center. Zooming to shove her right cropped her head, so the full figure stays. |
| Series spread | match | Credits and the real intro sit beside the lamp-post frame. Pair, film number, next thumb with `data-flip-id` and a crimson arrow. Legislature has four distinct frames, so the wide film reuses `fb_046` at a lower crop. |
| Portraits chapters | match | Ch. 01/02/03, photo left, heading, COPY text, crimson See the gallery. Desktop pins each chapter and crossfades three frames. Reduced motion stacks them with no pin. |
| Portrait lead photo | drift | Closest glam face is `fb_021`. It is a side view and the file includes `@tcphoto` and a makeup brush. No closer full-bleed beauty without those marks. |
| Mobile | match | Photo then text. Reveals stay short. No horizontal overflow on 390 or 360. |
| PDF p14 | match | Same family: black field, serif display, crimson rule, index tick, photos beside the type. PDF type is mock; ours is live COPY. |

## Tina

Editorial Split is the page pattern: live text beside the photographs, not type baked into the pictures. Fashion and Editorial is the current nav item on `/fashion-editorial/` and on `/series/*`. The page ends with the designers, models and agencies invite.

## Checks

Playwright chromium, 13 passed, 3 motion skips on non-desktop projects. No console errors, no broken images, `scrollWidth` within the viewport, reduced motion leaves headings and chapter links visible. `npm run build` completed, 11 pages.
