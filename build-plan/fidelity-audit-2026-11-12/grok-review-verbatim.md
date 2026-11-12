# Home and 404 fidelity, commit d466aa0

Layouts 01, 11 and 19 are the geometry. Clip 01 is the home scroll. Clip 02's curve stays on the runway page.

**Header + hero. DRIFT.** The 43% name note is wrong on the viewport. At 1440 the H1 is `clamp(5.8rem, 12.05vw, 11rem)` (~174px) and spans most of the width. Real gaps: daylight `fb_141_signature` (`object-position: center 4%`) against layout 01's night grade; logo 46px vs ~64px; nav 14px; pill `#b3261e` at min-height 38px plus 0.65rem padding. From 961px to 1360px the name drops to 8.7vw (~111px at 1280) and stops filling the frame. Fix: desktop navy multiply ~0.4 on `.hero__shade`, `brightness(0.78) saturate(0.8)`, `object-position: center 22%`, logo 64px, nav 16px, gap ~2.2rem, button `#8e1c17`, min-height 34px. Delete that shrink. Fit the line to ~92% of the content width.

**Runway strip. DRIFT.** Layout 01 is five frames, fully visible, flat, numbers centered. Frame 05 clips because motion items are `(100cqi - 2.8rem) / 4.42`. At 1440 the track is 1493px in a 1440px viewport. `initRunwayPin` uses `-(scrollWidth - clientWidth)`. `clientWidth` includes `--page-pad` (~51px × 2 at 1280), so a ~150px peek becomes 46px across `end: '+=78%'` (~560px at 720px tall). Picks are wrong: `fb_009` athletic, `fb_064` feathers, `fb_011` leather, `fb_013` signed in the file. Still fix: `flex: 1 1 0`. If the pin stays, items `(100cqi - 2.8rem) / 3.1`, `x: -(scrollWidth - clientWidth + padL + padR)`, `end` equal to that pixel length. Night files: `fb_012`, `fb_029`, `fb_060`, `fb_085`, `fb_105`, `fb_158`. No baked type and no curve.

**Statement + categories. DRIFT.** The headline matches. Tiles are `3/2`, about half the layout height, inside `.sheet__holes` that layout 01 does not have. Labels are 0.92rem sans. Drop the holes, use `4/5`, center a ~1rem label. The grey bars are dummy text. Keep the live sentence.

**Red Gown. DRIFT.** The split and the live sentence are right. The photo is wrong: `4/5`, `fb_116_signature` with a script across the skirt, inset in `--max`. Use a clean wide truck frame, `aspect-ratio: 3/2`, min-height ~520px, `margin-right: calc(50% - 50vw)`.

**Bridge + Skyline. DRIFT.** The layout is one dusk plate. The build blends `fb_168_city` and `fb_066_city` (arch masked from `left: 54%`) and adds `.band__mark` up to 128px. Delete the arch layer and the mark. One photo, left scrim over ~40%.

**Mobile hero. DRIFT.** Layout 11 centers the stacked name, a larger logo, and a pill on that screen only. The build is left-stacked, logo 40px, and `.book-bar` stays fixed at `min(280px, calc(100% - 40px))` until the band and covers later sections. Leave this daylight frame ungraded. Fix: `text-align: center`, title `clamp(3.6rem, 18vw, 5.6rem)`, logo 56px, hide the bar when `[data-hero]` leaves.

**Mobile runway. DRIFT.** Layout 11 is a full-height three-panel, a short crimson progress, and "No. 014" / "EDMONTON". The build is a short `72cqi` `4/5` snap row and a full-width rule. Fix: section `min-height: 100svh`, panels `30vw` by `68svh`, progress 2px by ~42% wide, mono caption under it.

**Mobile categories. DRIFT.** The sheet says MATCH. The shot still fails: the pill covers Edmonton, thumbs are 72px, labels cap at 2.85rem. Fix: `padding-bottom: 88px` on `main`, thumb 88px, label `clamp(2.4rem, 11vw, 3.25rem)`.

**404. DRIFT.** Layout 19 is a poster: sprockets, darkened truck, H1 "Page not found" near 8vw, the wander line as the subline, "Back home". The build H1 is the wander line at `clamp(2.2rem, 5vw, 3.75rem)`, the button says "Home", there is no frame, and the footer shares the screen (`.lost` is only `100vh - header`). Restore that H1, put the sentence in a `p`, label the button "Back home", frame `min(920px, 72vw)` by `52vh` at brightness 0.45, CSS sprockets, `min-height: 100svh`.

**Loader. MATCH.** Mark, 2px rail and counter match. Tip glow is optional. Header over the loader matches the approved crop.

**Home scroll vs clip 01. DRIFT.** The clip grows the name to full width, then walks the runway for most of 6 seconds. The hero tween is only photo `yPercent: 7` / `scale: 1.045` and copy `yPercent: -10`. The title never scales. By step 2 the runway is static. By step 5 the statement and red gown are up. The pin spends ~600px to move 46px. Scale the title toward 92vw on the first half of the hero, lift the photo ~18%, and set pin length to the travel.

## Splits from the sheet

The 1440 name is already full width. The break is the 1280 shrink. Mobile categories stay a DRIFT until the pill clears the last row. The mobile pill does not match layout 11. Leave the grey bars off The Red Gown. The loader stays a MATCH.

## Top 8

1. Runway `/4.42` and padding inside `clientWidth`. Clipped frame 05, 46px of travel, ~600px pin.
2. Night frames. Strip baked type from `fb_013` and `fb_116`.
3. Title scale, with pin length equal to the x distance.
4. Red gown at 3/2, bled right, no script in the photo.
5. One skyline. Remove the arch blend and `.band__mark`.
6. 404 poster: "Page not found", film frame, "Back home", footer below the fold.
7. Desktop night grade, logo 64px, deeper button, full-width name at 1280.
8. Mobile name centered, book bar on the hero only, 68svh three-panel runway.

## Also missed

Category sprockets are extra. Layout 01 is a plain row. Clip 02 belongs on the runway page. `end: '+=78%'` is not tied to the track, so the next width change desyncs the scrub.
